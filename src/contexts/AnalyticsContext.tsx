import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { useAuth } from './AuthContext'
import { useCreditContext } from './CreditContext'
import { 
  AnalyticsData, 
  Achievement, 
  StudySession, 
  StudyStreak, 
  LearningMetrics,
  SubjectProgress,
  WeeklyProgress,
  LeaderboardEntry,
  Notification
} from '@/types/analytics'
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
  const { credits, consumeCredits } = useCreditContext()
  
  // Achievement unlock modal state
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  const [showAchievementModal, setShowAchievementModal] = useState(false)
  
  // Persistent storage hooks
  const [analyticsData, setAnalyticsData] = useKV<AnalyticsData>('analytics-data', null)
  const [studySessions, setStudySessions] = useKV<StudySession[]>('study-sessions', [])
  const [notifications, setNotifications] = useKV<Notification[]>('notifications', [])

  // Mock achievements data
  const mockAchievements: Achievement[] = [
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
  ]

  // Initialize analytics data
  const loadAnalytics = useCallback(async () => {
    if (!isAuthenticated || !user) return
    
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Generate mock analytics data if none exists
      let data = analyticsData
      if (!data) {
        data = {
          userId: user.id,
          totalPoints: 0,
          level: 1,
          nextLevelPoints: 1000,
          achievements: mockAchievements,
          streak: {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: new Date(),
            streakStartDate: new Date()
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
              lastAccessed: new Date(),
              averageScore: 0,
              topicsCompleted: 0,
              totalTopics: 50,
              difficulty: 'beginner'
            },
            {
              subject: 'Português',
              completionPercentage: 0,
              timeSpent: 0,
              lastAccessed: new Date(),
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
        await setAnalyticsData(data)
      }
      
      dispatch({ type: 'SET_ANALYTICS_DATA', payload: data })
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications || [] })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dados de analytics' })
      console.error('Error loading analytics:', error)
    }
  }, [analyticsData, isAuthenticated, user, notifications, setAnalyticsData])

  // Start study session
  const startStudySession = useCallback(async (subject: string, topic: string) => {
    if (!user) return
    
    const session: StudySession = {
      id: `session-${Date.now()}`,
      userId: user.id,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      subject,
      topic,
      creditsUsed: 0,
      completed: false
    }
    
    dispatch({ type: 'START_SESSION', payload: session })
    toast.success(`Sessão de ${subject} iniciada!`)
  }, [user])

  // End study session
  const endStudySession = useCallback(async (score?: number, notes?: string) => {
    if (!state.currentSession || !user) return
    
    const endTime = new Date()
    const duration = Math.round((endTime.getTime() - state.currentSession.startTime.getTime()) / (1000 * 60))
    
    const completedSession: StudySession = {
      ...state.currentSession,
      endTime,
      duration,
      score,
      notes,
      completed: true
    }
    
    // Update sessions
    const newSessions = [...studySessions, completedSession]
    await setStudySessions(newSessions)
    
    // Update analytics data
    if (analyticsData) {
      const updatedData = {
        ...analyticsData,
        totalPoints: analyticsData.totalPoints + (score ? score * 10 : duration * 5),
        metrics: {
          ...analyticsData.metrics,
          totalStudyTime: analyticsData.metrics.totalStudyTime + duration,
          sessionsCompleted: analyticsData.metrics.sessionsCompleted + 1,
          averageSessionTime: Math.round((analyticsData.metrics.totalStudyTime + duration) / (analyticsData.metrics.sessionsCompleted + 1))
        }
      }
      
      await setAnalyticsData(updatedData)
      dispatch({ type: 'SET_ANALYTICS_DATA', payload: updatedData })
    }
    
    dispatch({ type: 'END_SESSION' })
    await updateStreak()
    await checkAchievements()
    
    toast.success(`Sessão concluída! ${duration} minutos estudados.`)
  }, [state.currentSession, studySessions, analyticsData, user, setStudySessions, setAnalyticsData])

  // Check and unlock achievements
  const checkAchievements = useCallback(async () => {
    if (!analyticsData) return
    
    const sessions = studySessions
    const totalTime = analyticsData.metrics.totalStudyTime
    const sessionsCount = analyticsData.metrics.sessionsCompleted
    
    // Check each achievement
    for (const achievement of analyticsData.achievements) {
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
          shouldUnlock = analyticsData.streak.currentStreak >= achievement.requirement.value
          break
      }
      
      if (shouldUnlock) {
        await unlockAchievement(achievement.id)
      }
    }
  }, [analyticsData, studySessions])

  // Unlock specific achievement
  const unlockAchievement = useCallback(async (achievementId: string) => {
    const achievement = analyticsData?.achievements.find(a => a.id === achievementId)
    if (!achievement || achievement.isUnlocked) return
    
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement })
    
    // Show achievement modal
    setUnlockedAchievement(achievement)
    setShowAchievementModal(true)
    
    // Add notification
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type: 'achievement',
      title: 'Conquista Desbloqueada!',
      message: `Você desbloqueou: ${achievement.title}`,
      icon: achievement.icon,
      timestamp: new Date(),
      read: false,
      data: { achievement }
    }
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
    
    const updatedNotifications = [notification, ...notifications]
    await setNotifications(updatedNotifications)
    
    // Update analytics data
    if (analyticsData) {
      const updatedData = {
        ...analyticsData,
        totalPoints: analyticsData.totalPoints + achievement.points,
        achievements: analyticsData.achievements.map(a =>
          a.id === achievementId ? { ...a, isUnlocked: true, unlockedAt: new Date() } : a
        )
      }
      await setAnalyticsData(updatedData)
      dispatch({ type: 'SET_ANALYTICS_DATA', payload: updatedData })
    }
    
    toast.success(`🎉 Conquista desbloqueada: ${achievement.title}!`)
  }, [analyticsData, notifications, setNotifications, setAnalyticsData])

  // Update streak
  const updateStreak = useCallback(async () => {
    if (!analyticsData) return
    
    const today = new Date()
    const lastStudy = new Date(analyticsData.streak.lastStudyDate)
    const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24))
    
    let newStreak = analyticsData.streak
    
    if (daysDiff === 1) {
      // Consecutive day
      newStreak = {
        ...analyticsData.streak,
        currentStreak: analyticsData.streak.currentStreak + 1,
        longestStreak: Math.max(analyticsData.streak.longestStreak, analyticsData.streak.currentStreak + 1),
        lastStudyDate: today
      }
    } else if (daysDiff === 0) {
      // Same day
      newStreak = {
        ...analyticsData.streak,
        lastStudyDate: today
      }
    } else if (daysDiff > 1) {
      // Streak broken
      newStreak = {
        currentStreak: 1,
        longestStreak: analyticsData.streak.longestStreak,
        lastStudyDate: today,
        streakStartDate: today
      }
    }
    
    dispatch({ type: 'UPDATE_STREAK', payload: newStreak })
    
    const updatedData = {
      ...analyticsData,
      streak: newStreak
    }
    await setAnalyticsData(updatedData)
  }, [analyticsData, setAnalyticsData])

  // Generate mock leaderboard
  const loadLeaderboard = useCallback(async () => {
    const mockLeaderboard: LeaderboardEntry[] = [
      { userId: '1', username: 'Ana Silva', points: 15000, level: 8, rank: 1, streak: 25 },
      { userId: '2', username: 'Carlos Rocha', points: 12500, level: 7, rank: 2, streak: 18 },
      { userId: '3', username: 'Beatriz Lima', points: 11000, level: 6, rank: 3, streak: 12 },
      { userId: user?.id || '4', username: user?.fullName || 'Você', points: analyticsData?.totalPoints || 0, level: analyticsData?.level || 1, rank: 15, streak: analyticsData?.streak.currentStreak || 0, isCurrentUser: true },
      { userId: '5', username: 'Diego Santos', points: 8500, level: 5, rank: 5, streak: 8 }
    ].sort((a, b) => b.points - a.points).map((entry, index) => ({ ...entry, rank: index + 1 }))
    
    dispatch({ type: 'SET_LEADERBOARD', payload: mockLeaderboard })
  }, [analyticsData, user])

  // Other utility functions
  const logStudyTime = useCallback(async (minutes: number) => {
    // Implementation for logging study time
  }, [])

  const updateSubjectProgress = useCallback(async (subject: string, progress: Partial<SubjectProgress>) => {
    // Implementation for updating subject progress
  }, [])

  const generateWeeklyReport = useCallback(async (): Promise<WeeklyProgress[]> => {
    // Implementation for generating weekly report
    return []
  }, [])

  const getUserRank = useCallback(async (): Promise<number> => {
    return analyticsData?.rank || 0
  }, [analyticsData])

  const markNotificationRead = useCallback((notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId })
  }, [])

  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'SET_NOTIFICATIONS', payload: [] })
    setNotifications([])
  }, [setNotifications])

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