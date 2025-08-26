import { AnalyticsData, Achievement, StudySession, LeaderboardEntry, WeeklyProgress } from '@/types/analytics'

export class AnalyticsService {
  private baseUrl = '/api'

  // Get user analytics data
  async getAnalytics(userId: string): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/progress?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching analytics:', error)
      throw error
    }
  }

  // Log study session
  async logStudySession(session: StudySession): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session),
      })
      
      if (!response.ok) {
        throw new Error('Failed to log study session')
      }
    } catch (error) {
      console.error('Error logging study session:', error)
      throw error
    }
  }

  // Unlock achievement
  async unlockAchievement(userId: string, achievementId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/achievements/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, achievementId }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to unlock achievement')
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error)
      throw error
    }
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/leaderboard?limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      return response.json()
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      throw error
    }
  }

  // Generate weekly report
  async generateWeeklyReport(userId: string): Promise<WeeklyProgress[]> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/generate?userId=${userId}&type=weekly`)
      if (!response.ok) {
        throw new Error('Failed to generate weekly report')
      }
      return response.json()
    } catch (error) {
      console.error('Error generating weekly report:', error)
      throw error
    }
  }

  // Update progress
  async updateProgress(userId: string, data: Partial<AnalyticsData>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, ...data }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update progress')
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      throw error
    }
  }

  // Check achievements
  async checkAchievements(userId: string): Promise<Achievement[]> {
    try {
      const response = await fetch(`${this.baseUrl}/achievements/check?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to check achievements')
      }
      return response.json()
    } catch (error) {
      console.error('Error checking achievements:', error)
      throw error
    }
  }

  // Get user rank
  async getUserRank(userId: string): Promise<{ rank: number; totalUsers: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/rank?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to get user rank')
      }
      return response.json()
    } catch (error) {
      console.error('Error getting user rank:', error)
      throw error
    }
  }

  // Submit quiz/exercise score
  async submitScore(userId: string, subject: string, score: number, maxScore: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, subject, score, maxScore, timestamp: new Date() }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit score')
      }
    } catch (error) {
      console.error('Error submitting score:', error)
      throw error
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()