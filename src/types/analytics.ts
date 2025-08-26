// Analytics and Gamification Types
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'study' | 'progress' | 'social' | 'milestone' | 'special'
  points: number
  requirement: {
    type: 'streak' | 'total_time' | 'lessons_completed' | 'perfect_scores' | 'login_days' | 'credits_used'
    value: number
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time'
  }
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
  isUnlocked: boolean
}

export interface StudyStreak {
  currentStreak: number
  longestStreak: number
  lastStudyDate: Date
  streakStartDate: Date
}

export interface LearningMetrics {
  totalStudyTime: number // in minutes
  sessionsCompleted: number
  averageSessionTime: number
  retentionRate: number
  conceptsMastered: number
  weakAreas: string[]
  strongAreas: string[]
  learningVelocity: number
}

export interface SubjectProgress {
  subject: string
  completionPercentage: number
  timeSpent: number
  lastAccessed: Date
  averageScore: number
  topicsCompleted: number
  totalTopics: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface WeeklyProgress {
  week: string
  studyTime: number
  lessonsCompleted: number
  averageScore: number
  streakDays: number
}

export interface AnalyticsData {
  userId: string
  totalPoints: number
  level: number
  nextLevelPoints: number
  achievements: Achievement[]
  streak: StudyStreak
  metrics: LearningMetrics
  subjectProgress: SubjectProgress[]
  weeklyProgress: WeeklyProgress[]
  rank: number
  totalUsers: number
  badges: string[]
}

export interface LeaderboardEntry {
  userId: string
  username: string
  avatar?: string
  points: number
  level: number
  rank: number
  streak: number
  isCurrentUser?: boolean
}

export interface StudySession {
  id: string
  userId: string
  startTime: Date
  endTime: Date
  duration: number
  subject: string
  topic: string
  creditsUsed: number
  score?: number
  completed: boolean
  notes?: string
}

export interface Notification {
  id: string
  type: 'achievement' | 'streak' | 'reminder' | 'milestone' | 'social'
  title: string
  message: string
  icon: string
  timestamp: Date
  read: boolean
  data?: any
}