import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { analyticsService, AnalyticsService } from '@/services/analyticsService'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('AnalyticsService', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getAnalytics', () => {
    const mockAnalyticsData = {
      userId: 'user123',
      period: 'weekly',
      totalStudyTime: 3600,
      totalCreditsUsed: 50,
      averageAccuracy: 85.5,
      subjectsStudied: ['Matemática', 'Física'],
      achievementsEarned: [],
      studyStreak: { current: 5, longest: 10, lastActiveDate: '2023-01-01T10:00:00.000Z' },
      weeklyGoals: { targetHours: 10, completedHours: 7.5, progress: 75 }
    }

    it('fetches analytics data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAnalyticsData)
      })

      const result = await analyticsService.getAnalytics('user123')

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/progress?userId=user123')
      expect(result).toEqual(mockAnalyticsData)
    })

    it('throws error when API response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(analyticsService.getAnalytics('user123'))
        .rejects.toThrow('Failed to fetch analytics data')
    })

    it('throws error when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(analyticsService.getAnalytics('user123'))
        .rejects.toThrow('Network error')
    })

    it('logs error to console when fetch fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await analyticsService.getAnalytics('user123')
      } catch {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching analytics:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('logStudySession', () => {
    const mockSession = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: 'user123',
      subject: 'Matemática',
      startTime: '2023-01-01T10:00:00.000Z',
      endTime: '2023-01-01T11:00:00.000Z',
      duration: 3600,
      creditsUsed: 10,
      questionsAnswered: 25,
      correctAnswers: 20,
      accuracy: 80,
      aiInteractions: 5,
      achievements: ['streak-5']
    }

    it('logs study session successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      })

      await analyticsService.logStudySession(mockSession)

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockSession),
      })
    })

    it('throws error when API response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      await expect(analyticsService.logStudySession(mockSession))
        .rejects.toThrow('Failed to log study session')
    })

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(analyticsService.logStudySession(mockSession))
        .rejects.toThrow('Network error')
    })
  })

  describe('unlockAchievement', () => {
    it('unlocks achievement successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      })

      await analyticsService.unlockAchievement('user123', 'achievement-1')

      expect(mockFetch).toHaveBeenCalledWith('/api/achievements/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'user123', achievementId: 'achievement-1' }),
      })
    })

    it('throws error when unlock fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      await expect(analyticsService.unlockAchievement('user123', 'achievement-1'))
        .rejects.toThrow('Failed to unlock achievement')
    })
  })

  describe('getLeaderboard', () => {
    const mockLeaderboard = [
      { userId: 'user1', username: 'Player1', score: 1000, rank: 1 },
      { userId: 'user2', username: 'Player2', score: 950, rank: 2 },
      { userId: 'user3', username: 'Player3', score: 900, rank: 3 }
    ]

    it('fetches leaderboard with default limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLeaderboard)
      })

      const result = await analyticsService.getLeaderboard()

      expect(mockFetch).toHaveBeenCalledWith('/api/leaderboard?limit=10')
      expect(result).toEqual(mockLeaderboard)
    })

    it('fetches leaderboard with custom limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLeaderboard.slice(0, 5))
      })

      const result = await analyticsService.getLeaderboard(5)

      expect(mockFetch).toHaveBeenCalledWith('/api/leaderboard?limit=5')
      expect(result).toHaveLength(3) // Mock data has only 3 entries
    })

    it('throws error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(analyticsService.getLeaderboard())
        .rejects.toThrow('Failed to fetch leaderboard')
    })
  })

  describe('generateWeeklyReport', () => {
    const mockWeeklyReport = [
      { week: 1, hoursStudied: 10, accuracy: 85, creditsUsed: 50 },
      { week: 2, hoursStudied: 12, accuracy: 88, creditsUsed: 60 },
      { week: 3, hoursStudied: 8, accuracy: 82, creditsUsed: 40 }
    ]

    it('generates weekly report successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeeklyReport)
      })

      const result = await analyticsService.generateWeeklyReport('user123')

      expect(mockFetch).toHaveBeenCalledWith('/api/reports/generate?userId=user123&type=weekly')
      expect(result).toEqual(mockWeeklyReport)
    })

    it('throws error when generation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(analyticsService.generateWeeklyReport('user123'))
        .rejects.toThrow('Failed to generate weekly report')
    })
  })

  describe('updateProgress', () => {
    const mockProgressData = {
      totalStudyTime: 7200,
      totalCreditsUsed: 100,
      averageAccuracy: 90
    }

    it('updates progress successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      })

      await analyticsService.updateProgress('user123', mockProgressData)

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/progress', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: 'user123', ...mockProgressData }),
      })
    })

    it('throws error when update fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      await expect(analyticsService.updateProgress('user123', mockProgressData))
        .rejects.toThrow('Failed to update progress')
    })
  })

  describe('checkAchievements', () => {
    const mockAchievements = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'First Victory',
        description: 'Complete your first study session',
        category: 'milestone',
        points: 100,
        iconType: 'trophy',
        unlockedAt: '2023-01-01T10:00:00.000Z',
        progress: 100
      }
    ]

    it('checks achievements successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAchievements)
      })

      const result = await analyticsService.checkAchievements('user123')

      expect(mockFetch).toHaveBeenCalledWith('/api/achievements/check?userId=user123')
      expect(result).toEqual(mockAchievements)
    })

    it('throws error when check fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(analyticsService.checkAchievements('user123'))
        .rejects.toThrow('Failed to check achievements')
    })
  })

  describe('getUserRank', () => {
    const mockRankData = { rank: 15, totalUsers: 1000 }

    it('gets user rank successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRankData)
      })

      const result = await analyticsService.getUserRank('user123')

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/rank?userId=user123')
      expect(result).toEqual(mockRankData)
    })

    it('throws error when rank fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(analyticsService.getUserRank('user123'))
        .rejects.toThrow('Failed to get user rank')
    })
  })

  describe('submitScore', () => {
    it('submits score successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      })

      await analyticsService.submitScore('user123', 'Matemática', 85, 100)

      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"userId":"user123"'),
      })
      
      // Additionally, verify the body contains the expected structure
      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      expect(body).toEqual({
        userId: 'user123',
        subject: 'Matemática',
        score: 85,
        maxScore: 100,
        timestamp: expect.any(String)
      })
    })

    it('throws error when score submission fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      await expect(analyticsService.submitScore('user123', 'Matemática', 85, 100))
        .rejects.toThrow('Failed to submit score')
    })

    it('includes timestamp in score submission', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true
      })

      const beforeTime = new Date()
      await analyticsService.submitScore('user123', 'Matemática', 85, 100)
      const afterTime = new Date()

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)
      const timestamp = new Date(body.timestamp)

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime())
    })
  })

  describe('error handling and logging', () => {
    it('logs errors consistently across all methods', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockFetch.mockRejectedValue(new Error('Test error'))

      const methods = [
        () => analyticsService.getAnalytics('user123'),
        () => analyticsService.logStudySession({
          id: 'test', userId: 'user123', subject: 'test',
          startTime: '', creditsUsed: 0, questionsAnswered: 0,
          correctAnswers: 0, accuracy: 0, aiInteractions: 0, achievements: []
        }),
        () => analyticsService.unlockAchievement('user123', 'test'),
        () => analyticsService.getLeaderboard(),
        () => analyticsService.generateWeeklyReport('user123'),
        () => analyticsService.updateProgress('user123', {}),
        () => analyticsService.checkAchievements('user123'),
        () => analyticsService.getUserRank('user123'),
        () => analyticsService.submitScore('user123', 'test', 0, 100)
      ]

      for (const method of methods) {
        try {
          await method()
        } catch {
          // Expected to throw
        }
      }

      expect(consoleSpy).toHaveBeenCalledTimes(methods.length)
      consoleSpy.mockRestore()
    })
  })

  describe('service instantiation', () => {
    it('creates service instance correctly', () => {
      expect(analyticsService).toBeInstanceOf(AnalyticsService)
    })

    it('can create new service instances', () => {
      const newService = new AnalyticsService()
      expect(newService).toBeInstanceOf(AnalyticsService)
      expect(newService).not.toBe(analyticsService)
    })
  })

  describe('API endpoint construction', () => {
    it('constructs correct URLs for all endpoints', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })

      await analyticsService.getAnalytics('test-user')
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/progress?userId=test-user')

      await analyticsService.getLeaderboard(20)
      expect(mockFetch).toHaveBeenCalledWith('/api/leaderboard?limit=20')

      await analyticsService.generateWeeklyReport('test-user')
      expect(mockFetch).toHaveBeenCalledWith('/api/reports/generate?userId=test-user&type=weekly')

      await analyticsService.checkAchievements('test-user')
      expect(mockFetch).toHaveBeenCalledWith('/api/achievements/check?userId=test-user')

      await analyticsService.getUserRank('test-user')
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/rank?userId=test-user')
    })
  })
})