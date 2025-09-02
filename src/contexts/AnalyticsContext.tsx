import React, { createContext, useContext, useReducer, useCallback, useEffect, useState, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { useCreditContext } from './CreditContext'
import { 
  AnalyticsData, 
  Achievement, 
  StudySession, 
  StudyStreak, 
  LearningMetrics as _LearningMetrics,
  SubjectProgress,
  WeeklyProgress,
  LeaderboardEntry,
  Notification
} from '@/types/analytics'
import { 
  useSupabaseStorage, 
  SupabaseAnalytics, 
  SupabaseStudySession,
  SupabaseAchievement,
  SupabaseNotification
} from '@/hooks/useSupabaseStorage'
import { toast } from 'sonner'
import AchievementUnlockModal from '@/components/AchievementUnlockModal'

interface AnalyticsState {
  analyticsData: AnalyticsData | null
  leaderboard: LeaderboardEntry[]
  notifications: Notification[]
  currentSession: StudySession | null
  isLoading: boolean
  error: string | null
}

type AnalyticsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ANALYTICS_DATA'; payload: AnalyticsData }
  | { type: 'SET_LEADERBOARD'; payload: LeaderboardEntry[] }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'START_SESSION'; payload: StudySession }
  | { type: 'END_SESSION' }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: Achievement }
  | { type: 'UPDATE_STREAK'; payload: StudyStreak }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }

const initialState: AnalyticsState = {
  analyticsData: null,
  leaderboard: [],
  notifications: [],
  currentSession: null,
  isLoading: false,
  error: null
}

function analyticsReducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'SET_ANALYTICS_DATA':
      return { ...state, analyticsData: action.payload, isLoading: false }
    case 'SET_LEADERBOARD':
      return { ...state, leaderboard: action.payload }
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload }
    case 'START_SESSION':
      return { ...state, currentSession: action.payload }
    case 'END_SESSION':
      return { ...state, currentSession: null }
    case 'UNLOCK_ACHIEVEMENT':
      if (!state.analyticsData) return state
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          achievements: state.analyticsData.achievements.map(a =>
            a.id === action.payload.id ? { ...a, isUnlocked: true, unlockedAt: new Date() } : a
          )
        }
      }
    case 'UPDATE_STREAK':
      if (!state.analyticsData) return state
      return {
        ...state,
        analyticsData: {
          ...state.analyticsData,
          streak: action.payload
        }
      }
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      }
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      }
    default:
      return state
  }
}

interface AnalyticsContextType extends AnalyticsState {
  // Core Actions
  loadAnalytics: () => Promise<void>
  startStudySession: (subject: string, topic: string) => Promise<void>
  endStudySession: (score?: number, notes?: string) => Promise<void>
  
  // Achievements & Gamification
  checkAchievements: () => Promise<void>
  unlockAchievement: (achievementId: string) => Promise<void>
  updateStreak: () => Promise<void>
  
  // Analytics & Metrics
  logStudyTime: (minutes: number) => Promise<void>
  updateSubjectProgress: (subject: string, progress: Partial<SubjectProgress>) => Promise<void>
  generateWeeklyReport: () => Promise<WeeklyProgress[]>
  
  // Social Features
  loadLeaderboard: () => Promise<void>
  getUserRank: () => Promise<number>
  
  // Notifications
  markNotificationRead: (notificationId: string) => void
  clearAllNotifications: () => void
  
  // Utility
  refreshData: () => Promise<void>
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null)

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [state, dispatch] = useReducer(analyticsReducer, initialState)
  const { user, isAuthenticated } = useAuth()
  const { credits: _credits, consumeCredits: _consumeCredits } = useCreditContext()
  
  // Achievement unlock modal state
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  const [showAchievementModal, setShowAchievementModal] = useState(false)
  
  // Supabase-compatible storage hooks
  const analyticsStorage = useSupabaseStorage<SupabaseAnalytics>('analytics', user?.id)
  const studySessionStorage = useSupabaseStorage<SupabaseStudySession>('study_sessions', user?.id)
  const achievementStorage = useSupabaseStorage<SupabaseAchievement>('achievements', user?.id)
  const notificationStorage = useSupabaseStorage<SupabaseNotification>('notifications', user?.id)

  // Default achievements data stored in localStorage
  const defaultAchievements = useMemo(() => [
    {
      id: 'first-session',
      title: 'Primeira Lição',
      description: 'Complete sua primeira sessão de estudo',
      icon: '🎯',
      category: 'milestone',
      points: 100,
      requirement: { type: 'lessons_completed', value: 1 },
      rarity: 'common',
      isUnlocked: false
    },
    {
      id: 'week-streak',
      title: 'Dedicação Semanal',
      description: 'Estude por 7 dias consecutivos',
      icon: '🔥',
      category: 'study',
      points: 500,
      requirement: { type: 'streak', value: 7 },
      rarity: 'rare',
      isUnlocked: false
    },
    {
      id: 'hour-master',
      title: 'Mestre do Tempo',
      description: 'Acumule 10 horas de estudo',
      icon: '⏰',
      category: 'progress',
      points: 1000,
      requirement: { type: 'total_time', value: 600 },
      rarity: 'epic',
      isUnlocked: false
    },
    {
      id: 'perfect-week',
      title: 'Semana Perfeita',
      description: 'Alcance 100% de acertos por uma semana',
      icon: '⭐',
      category: 'milestone',
      points: 2000,
      requirement: { type: 'perfect_scores', value: 7, timeframe: 'weekly' },
      rarity: 'legendary',
      isUnlocked: false
    }
  ], [])

  // Initialize analytics data with Supabase storage
  const loadAnalytics = useCallback(async () => {
    if (!isAuthenticated || !user) return
    
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Get existing analytics data
      let analyticsData = analyticsStorage.data[0]
      
      if (!analyticsData) {
        // Create initial analytics data with proper Supabase structure
        analyticsData = await analyticsStorage.insert({
          user_id: user.id,
          total_points: 0,
          level: 1,
          streak_current: 0,
          streak_longest: 0,
          study_time_total: 0,
          sessions_completed: 0,
          concepts_mastered: 0,
          data: {
            nextLevelPoints: 1000,
            achievements: defaultAchievements.map(a => ({
              ...a,
              user_id: user.id,
              achievement_type: a.id,
              unlocked_at: null,
              isUnlocked: false
            })),
            streak: {
              currentStreak: 0,
              longestStreak: 0,
              lastStudyDate: new Date().toISOString(),
              streakStartDate: new Date().toISOString()
            },
            metrics: {
              totalStudyTime: 0,
              sessionsCompleted: 0,
              averageSessionTime: 0,
              retentionRate: 0,
              conceptsMastered: 0,
              weakAreas: [],
              strongAreas: [],
              learningVelocity: 0
            },
            subjectProgress: [
              {
                subject: 'Matemática',
                completionPercentage: 0,
                timeSpent: 0,
                lastAccessed: new Date().toISOString(),
                averageScore: 0,
                topicsCompleted: 0,
                totalTopics: 50,
                difficulty: 'beginner'
              },
              {
                subject: 'Português',
                completionPercentage: 0,
                timeSpent: 0,
                lastAccessed: new Date().toISOString(),
                averageScore: 0,
                topicsCompleted: 0,
                totalTopics: 40,
                difficulty: 'beginner'
              }
            ],
            weeklyProgress: [],
            rank: 0,
            totalUsers: 1000,
            badges: []
          }
        })
      }
      
      // Convert Supabase format to AnalyticsData format
      const transformedData: AnalyticsData = {
        userId: analyticsData.user_id,
        totalPoints: analyticsData.total_points,
        level: analyticsData.level,
        nextLevelPoints: analyticsData.data.nextLevelPoints || 1000,
        achievements: analyticsData.data.achievements || defaultAchievements,
        streak: analyticsData.data.streak || {
          currentStreak: analyticsData.streak_current,
          longestStreak: analyticsData.streak_longest,
          lastStudyDate: new Date(),
          streakStartDate: new Date()
        },
        metrics: analyticsData.data.metrics || {
          totalStudyTime: analyticsData.study_time_total,
          sessionsCompleted: analyticsData.sessions_completed,
          averageSessionTime: 0,
          retentionRate: 0,
          conceptsMastered: analyticsData.concepts_mastered,
          weakAreas: [],
          strongAreas: [],
          learningVelocity: 0
        },
        subjectProgress: analyticsData.data.subjectProgress || [],
        weeklyProgress: analyticsData.data.weeklyProgress || [],
        rank: analyticsData.data.rank || 0,
        totalUsers: analyticsData.data.totalUsers || 1000,
        badges: analyticsData.data.badges || []
      }
      
      dispatch({ type: 'SET_ANALYTICS_DATA', payload: transformedData })
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notificationStorage.data.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        icon: n.icon,
        timestamp: new Date(n.created_at),
        read: n.read,
        data: n.data
      }))})
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dados de analytics' })
      console.error('Error loading analytics:', error)
    }
  }, [isAuthenticated, user, analyticsStorage, notificationStorage.data, defaultAchievements])

  // Start study session with Supabase storage
  const startStudySession = useCallback(async (subject: string, topic: string) => {
    if (!user) return
    
    const session: SupabaseStudySession = {
      id: `session-${Date.now()}`,
      user_id: user.id,
      subject,
      topic,
      start_time: new Date().toISOString(),
      duration_minutes: 0,
      credits_used: 0,
      completed: false
    }
    
    await studySessionStorage.insert(session)
    
    // Convert to local format for dispatch
    const localSession: StudySession = {
      id: session.id,
      userId: session.user_id,
      startTime: new Date(session.start_time),
      endTime: new Date(),
      duration: 0,
      subject: session.subject,
      topic: session.topic,
      creditsUsed: session.credits_used,
      completed: false
    }
    
    dispatch({ type: 'START_SESSION', payload: localSession })
    toast.success(`Sessão de ${subject} iniciada!`)
  }, [user, studySessionStorage])

  // Unlock specific achievement with Supabase storage
  const unlockAchievement = useCallback(async (achievementId: string) => {
    const currentAnalytics = analyticsStorage.data[0]
    if (!currentAnalytics) return
    
    const achievement = currentAnalytics.data.achievements?.find((a: Achievement) => a.id === achievementId)
    if (!achievement || achievement.isUnlocked) return
    
    // Create achievement record in Supabase
    const _unlockedAchievement = await achievementStorage.insert({
      user_id: user!.id,
      achievement_type: achievement.id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      points: achievement.points,
      unlocked_at: new Date().toISOString(),
      metadata: achievement
    })
    
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement })
    
    // Show achievement modal
    setUnlockedAchievement(achievement)
    setShowAchievementModal(true)
    
    // Add notification
    const notification = await notificationStorage.insert({
      user_id: user!.id,
      type: 'achievement' as const,
      title: 'Conquista Desbloqueada!',
      message: `Você desbloqueou: ${achievement.title}`,
      icon: achievement.icon,
      read: false,
      data: { achievement }
    })
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      icon: notification.icon,
      timestamp: new Date(notification.created_at),
      read: notification.read,
      data: notification.data
    }})
    
    // Update analytics data
    const updatedAchievements = currentAnalytics.data.achievements.map((a: Achievement) =>
      a.id === achievementId ? { ...a, isUnlocked: true, unlockedAt: new Date() } : a
    )
    
    await analyticsStorage.update(currentAnalytics.id, {
      total_points: currentAnalytics.total_points + achievement.points,
      data: {
        ...currentAnalytics.data,
        achievements: updatedAchievements
      }
    })
    
    // Reload analytics
    await loadAnalytics()
    
    toast.success(`🎉 Conquista desbloqueada: ${achievement.title}!`)
  }, [analyticsStorage, achievementStorage, notificationStorage, user, loadAnalytics])

  // Update streak with Supabase storage
  const updateStreak = useCallback(async () => {
    const currentAnalytics = analyticsStorage.data[0]
    if (!currentAnalytics) return
    
    const today = new Date()
    const lastStudy = new Date(currentAnalytics.data.streak?.lastStudyDate || today)
    const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24))
    
    let newStreakCurrent = currentAnalytics.streak_current
    let newStreakLongest = currentAnalytics.streak_longest
    let newStreakData = currentAnalytics.data.streak || {}
    
    if (daysDiff === 1) {
      // Consecutive day
      newStreakCurrent = currentAnalytics.streak_current + 1
      newStreakLongest = Math.max(newStreakLongest, newStreakCurrent)
      newStreakData = {
        ...newStreakData,
        currentStreak: newStreakCurrent,
        longestStreak: newStreakLongest,
        lastStudyDate: today.toISOString()
      }
    } else if (daysDiff === 0) {
      // Same day
      newStreakData = {
        ...newStreakData,
        lastStudyDate: today.toISOString()
      }
    } else if (daysDiff > 1) {
      // Streak broken
      newStreakCurrent = 1
      newStreakData = {
        currentStreak: 1,
        longestStreak: newStreakLongest,
        lastStudyDate: today.toISOString(),
        streakStartDate: today.toISOString()
      }
    }
    
    await analyticsStorage.update(currentAnalytics.id, {
      streak_current: newStreakCurrent,
      streak_longest: newStreakLongest,
      data: {
        ...currentAnalytics.data,
        streak: newStreakData
      }
    })
    
    dispatch({ type: 'UPDATE_STREAK', payload: {
      currentStreak: newStreakCurrent,
      longestStreak: newStreakLongest,
      lastStudyDate: today,
      streakStartDate: new Date(newStreakData.streakStartDate || today)
    }})
  }, [analyticsStorage])

  // Check and unlock achievements with Supabase storage
  const checkAchievements = useCallback(async () => {
    const currentAnalytics = analyticsStorage.data[0]
    if (!currentAnalytics) return
    
    const _sessions = studySessionStorage.data
    const totalTime = currentAnalytics.study_time_total
    const sessionsCount = currentAnalytics.sessions_completed
    
    // Check each achievement
    for (const achievement of currentAnalytics.data.achievements || []) {
      if (achievement.isUnlocked) continue
      
      let shouldUnlock = false
      
      switch (achievement.requirement.type) {
        case 'lessons_completed':
          shouldUnlock = sessionsCount >= achievement.requirement.value
          break
        case 'total_time':
          shouldUnlock = totalTime >= achievement.requirement.value
          break
        case 'streak':
          shouldUnlock = currentAnalytics.streak_current >= achievement.requirement.value
          break
      }
      
      if (shouldUnlock) {
        await unlockAchievement(achievement.id)
      }
    }
  }, [analyticsStorage.data, studySessionStorage.data, unlockAchievement])

  // End study session with Supabase storage
  const endStudySession = useCallback(async (score?: number, notes?: string) => {
    if (!state.currentSession || !user) return
    
    const endTime = new Date()
    const duration = Math.round((endTime.getTime() - state.currentSession.startTime.getTime()) / (1000 * 60))
    
    // Update the session in Supabase storage
    await studySessionStorage.update(state.currentSession.id, {
      end_time: endTime.toISOString(),
      duration_minutes: duration,
      score,
      notes,
      completed: true
    })
    
    // Update analytics data
    const currentAnalytics = analyticsStorage.data[0]
    if (currentAnalytics) {
      const newTotalPoints = currentAnalytics.total_points + (score ? score * 10 : duration * 5)
      const newSessionsCompleted = currentAnalytics.sessions_completed + 1
      const newTotalStudyTime = currentAnalytics.study_time_total + duration
      
      await analyticsStorage.update(currentAnalytics.id, {
        total_points: newTotalPoints,
        sessions_completed: newSessionsCompleted,
        study_time_total: newTotalStudyTime,
        data: {
          ...currentAnalytics.data,
          metrics: {
            ...currentAnalytics.data.metrics,
            totalStudyTime: newTotalStudyTime,
            sessionsCompleted: newSessionsCompleted,
            averageSessionTime: Math.round(newTotalStudyTime / newSessionsCompleted)
          }
        }
      })
      
      // Reload analytics data
      await loadAnalytics()
    }
    
    dispatch({ type: 'END_SESSION' })
    await updateStreak()
    await checkAchievements()
    
    toast.success(`Sessão concluída! ${duration} minutos estudados.`)
  }, [state.currentSession, user, studySessionStorage, analyticsStorage, loadAnalytics, checkAchievements, updateStreak])

  // Generate mock leaderboard with persistent storage
  const loadLeaderboard = useCallback(async () => {
    const currentAnalytics = analyticsStorage.data[0]
    
    const mockLeaderboard: LeaderboardEntry[] = [
      { userId: '1', username: 'Ana Silva', points: 15000, level: 8, rank: 1, streak: 25 },
      { userId: '2', username: 'Carlos Rocha', points: 12500, level: 7, rank: 2, streak: 18 },
      { userId: '3', username: 'Beatriz Lima', points: 11000, level: 6, rank: 3, streak: 12 },
      { 
        userId: user?.id || '4', 
        username: user?.fullName || 'Você', 
        points: currentAnalytics?.total_points || 0, 
        level: currentAnalytics?.level || 1, 
        rank: 15, 
        streak: currentAnalytics?.streak_current || 0, 
        isCurrentUser: true 
      },
      { userId: '5', username: 'Diego Santos', points: 8500, level: 5, rank: 5, streak: 8 }
    ].sort((a, b) => b.points - a.points).map((entry, index) => ({ ...entry, rank: index + 1 }))
    
    dispatch({ type: 'SET_LEADERBOARD', payload: mockLeaderboard })
  }, [analyticsStorage.data, user])

  // Other utility functions
  const logStudyTime = useCallback(async (_minutes: number) => {
    // Implementation for logging study time
  }, [])

  const updateSubjectProgress = useCallback(async (_subject: string, _progress: Partial<SubjectProgress>) => {
    // Implementation for updating subject progress
  }, [])

  const generateWeeklyReport = useCallback(async (): Promise<WeeklyProgress[]> => {
    // Implementation for generating weekly report
    return []
  }, [])

  const getUserRank = useCallback(async (): Promise<number> => {
    const currentAnalytics = analyticsStorage.data[0]
    return currentAnalytics?.data?.rank || 0
  }, [analyticsStorage.data])

  const markNotificationRead = useCallback((notificationId: string) => {
    notificationStorage.update(notificationId, { read: true })
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId })
  }, [notificationStorage])

  const clearAllNotifications = useCallback(() => {
    notificationStorage.clear()
    dispatch({ type: 'SET_NOTIFICATIONS', payload: [] })
  }, [notificationStorage])

  const refreshData = useCallback(async () => {
    await loadAnalytics()
    await loadLeaderboard()
  }, [loadAnalytics, loadLeaderboard])

  // Load data on authentication change
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAnalytics()
      loadLeaderboard()
    }
  }, [isAuthenticated, user, loadAnalytics, loadLeaderboard])

  const value: AnalyticsContextType = {
    ...state,
    loadAnalytics,
    startStudySession,
    endStudySession,
    checkAchievements,
    unlockAchievement,
    updateStreak,
    logStudyTime,
    updateSubjectProgress,
    generateWeeklyReport,
    loadLeaderboard,
    getUserRank,
    markNotificationRead,
    clearAllNotifications,
    refreshData
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
      
      {/* Achievement Unlock Modal */}
      <AchievementUnlockModal
        achievement={unlockedAchievement}
        isOpen={showAchievementModal}
        onClose={() => {
          setShowAchievementModal(false)
          setUnlockedAchievement(null)
        }}
      />
    </AnalyticsContext.Provider>
  )
}