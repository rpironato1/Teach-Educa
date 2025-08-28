import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { creditApi, type ApiResponse, type PaymentIntent, type SubscriptionData } from '@/services/creditApi'

// Mock global setTimeout to speed up tests
const originalSetTimeout = global.setTimeout
beforeEach(() => {
  vi.spyOn(global, 'setTimeout').mockImplementation((fn, _delay) => {
    fn()
    return 0 as any
  })
})

afterEach(() => {
  global.setTimeout = originalSetTimeout
  vi.clearAllMocks()
})

describe('CreditApiService', () => {
  describe('getBalance', () => {
    it('returns current credit balance successfully', async () => {
      const result = await creditApi.getBalance('user123')
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        current: expect.any(Number),
        monthly: expect.any(Number),
        bonus: expect.any(Number),
        lastUpdated: expect.any(String)
      })
      expect(result.data.current).toBe(150)
      expect(result.data.monthly).toBe(500)
      expect(result.data.bonus).toBe(25)
    })

    it('returns data with correct structure', async () => {
      const result = await creditApi.getBalance('user123')
      
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('data')
      expect(result.data).toHaveProperty('current')
      expect(result.data).toHaveProperty('monthly')
      expect(result.data).toHaveProperty('bonus')
      expect(result.data).toHaveProperty('lastUpdated')
    })
  })

  describe('consumeCredits', () => {
    beforeEach(() => {
      // Mock Math.random to control random behavior
      vi.spyOn(Math, 'random').mockReturnValue(0.5) // Will not trigger insufficient credits
    })

    it('consumes credits successfully', async () => {
      const result = await creditApi.consumeCredits('user123', 10, 'Test operation')
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        transactionId: expect.stringMatching(/^txn_\d+$/),
        remainingCredits: expect.any(Number)
      })
    })

    it('handles insufficient credits', async () => {
      // Mock Math.random to trigger insufficient credits scenario
      vi.spyOn(Math, 'random').mockReturnValue(0.05) // Less than 0.1 threshold
      
      const result = await creditApi.consumeCredits('user123', 1000, 'Expensive operation')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('INSUFFICIENT_CREDITS')
      expect(result.message).toBe('Créditos insuficientes para esta operação')
    })

    it('generates valid transaction ID', async () => {
      const result = await creditApi.consumeCredits('user123', 5, 'Test')
      
      expect(result.success).toBe(true)
      expect(result.data.transactionId).toMatch(/^txn_\d+$/)
    })
  })

  describe('createPaymentIntent', () => {
    it('creates payment intent for valid plan', async () => {
      const result = await creditApi.createPaymentIntent('intermediario', 'user123')
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        id: expect.stringMatching(/^pi_\d+$/),
        amount: 9900,
        currency: 'brl',
        status: 'requires_payment_method',
        client_secret: expect.stringMatching(/^pi_\d+_secret_[a-z0-9]+$/)
      })
    })

    it('handles invalid plan ID', async () => {
      const result = await creditApi.createPaymentIntent('invalid-plan', 'user123')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('INVALID_PLAN')
      expect(result.message).toBe('Plano não encontrado')
    })

    it('creates correct payment intent for each plan', async () => {
      const plans = [
        { id: 'inicial', expectedAmount: 2900 },
        { id: 'intermediario', expectedAmount: 9900 },
        { id: 'profissional', expectedAmount: 17900 }
      ]

      for (const plan of plans) {
        const result = await creditApi.createPaymentIntent(plan.id, 'user123')
        
        expect(result.success).toBe(true)
        expect(result.data.amount).toBe(plan.expectedAmount)
        expect(result.data.currency).toBe('brl')
      }
    })
  })

  describe('confirmPayment', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5) // Will not trigger payment failure
    })

    it('confirms payment successfully', async () => {
      const result = await creditApi.confirmPayment('pi_123456', 'pm_card_123')
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        paymentId: 'pi_123456',
        subscriptionId: expect.stringMatching(/^sub_\d+$/),
        status: 'succeeded'
      })
    })

    it('handles payment failure', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.02) // Less than 0.05 threshold
      
      const result = await creditApi.confirmPayment('pi_123456', 'pm_card_123')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('PAYMENT_FAILED')
      expect(result.message).toBe('Falha no processamento do pagamento')
    })
  })

  describe('getSubscription', () => {
    it('returns subscription details', async () => {
      const result = await creditApi.getSubscription('user123')
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        id: expect.stringMatching(/^sub_\d+$/),
        planId: 'intermediario',
        status: 'active',
        currentPeriodStart: expect.any(String),
        currentPeriodEnd: expect.any(String),
        nextBillingDate: expect.any(String),
        priceId: 'price_intermediario'
      })
    })

    it('returns valid date strings', async () => {
      const result = await creditApi.getSubscription('user123')
      
      expect(result.success).toBe(true)
      
      // Check if dates are valid ISO strings
      expect(() => new Date(result.data.currentPeriodStart)).not.toThrow()
      expect(() => new Date(result.data.currentPeriodEnd)).not.toThrow()
      expect(() => new Date(result.data.nextBillingDate)).not.toThrow()
      
      // Check if end date is after start date
      const startDate = new Date(result.data.currentPeriodStart)
      const endDate = new Date(result.data.currentPeriodEnd)
      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime())
    })
  })

  describe('cancelSubscription', () => {
    it('cancels subscription successfully', async () => {
      const subscriptionId = 'sub_123456'
      const result = await creditApi.cancelSubscription(subscriptionId)
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        subscriptionId,
        status: 'cancelled',
        cancelledAt: expect.any(String)
      })
    })
  })

  describe('reactivateSubscription', () => {
    it('reactivates subscription successfully', async () => {
      const subscriptionId = 'sub_123456'
      const result = await creditApi.reactivateSubscription(subscriptionId)
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        subscriptionId,
        status: 'active',
        reactivatedAt: expect.any(String)
      })
    })
  })

  describe('upgradeSubscription', () => {
    it('upgrades subscription successfully', async () => {
      const subscriptionId = 'sub_123456'
      const newPlanId = 'profissional'
      const result = await creditApi.upgradeSubscription(subscriptionId, newPlanId)
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        subscriptionId,
        planId: newPlanId,
        upgradedAt: expect.any(String),
        proratedCredits: expect.any(Number)
      })
    })
  })

  describe('getTransactionHistory', () => {
    it('returns transaction history with default limit', async () => {
      const result = await creditApi.getTransactionHistory('user123')
      
      expect(result.success).toBe(true)
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data.length).toBeLessThanOrEqual(20) // Mock implementation limit
    })

    it('respects custom limit', async () => {
      const result = await creditApi.getTransactionHistory('user123', 5)
      
      expect(result.success).toBe(true)
      expect(result.data.length).toBeLessThanOrEqual(5)
    })

    it('returns transactions with correct structure', async () => {
      const result = await creditApi.getTransactionHistory('user123', 1)
      
      expect(result.success).toBe(true)
      expect(result.data[0]).toMatchObject({
        id: expect.stringMatching(/^txn_\d+_\d+$/),
        type: expect.stringMatching(/^(purchase|consumption|bonus|refund)$/),
        amount: expect.any(Number),
        description: expect.any(String),
        timestamp: expect.any(String)
      })
    })

    it('returns valid timestamps', async () => {
      const result = await creditApi.getTransactionHistory('user123', 1)
      
      expect(result.success).toBe(true)
      expect(() => new Date(result.data[0].timestamp)).not.toThrow()
      
      // Timestamp should be in the past 30 days
      const timestamp = new Date(result.data[0].timestamp)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      expect(timestamp.getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime())
    })
  })

  describe('validateCreditUsage', () => {
    it('validates credit usage correctly', async () => {
      const result = await creditApi.validateCreditUsage('user123', 'ai-analysis', 10)
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        hasEnoughCredits: expect.any(Boolean),
        currentBalance: expect.any(Number),
        requiredCredits: 10,
        feature: 'ai-analysis'
      })
    })

    it('returns consistent balance values', async () => {
      const result = await creditApi.validateCreditUsage('user123', 'test-feature', 5)
      
      expect(result.success).toBe(true)
      expect(result.data.currentBalance).toBeGreaterThanOrEqual(0)
      expect(result.data.currentBalance).toBeLessThanOrEqual(1000)
      
      const hasEnough = result.data.currentBalance >= result.data.requiredCredits
      expect(result.data.hasEnoughCredits).toBe(hasEnough)
    })
  })

  describe('applyPromotion', () => {
    it('applies valid promotion codes', async () => {
      const validCodes = ['WELCOME50', 'BONUS25', 'FRIEND10']
      const expectedBonuses = { 'WELCOME50': 50, 'BONUS25': 25, 'FRIEND10': 10 }
      
      for (const code of validCodes) {
        const result = await creditApi.applyPromotion('user123', code)
        
        expect(result.success).toBe(true)
        expect(result.data).toMatchObject({
          promoCode: code,
          bonusCredits: expectedBonuses[code as keyof typeof expectedBonuses],
          appliedAt: expect.any(String)
        })
      }
    })

    it('rejects invalid promotion codes', async () => {
      const result = await creditApi.applyPromotion('user123', 'INVALID_CODE')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('INVALID_PROMO_CODE')
      expect(result.message).toBe('Código promocional inválido')
    })
  })

  describe('getUsageAnalytics', () => {
    it('returns usage analytics with default period', async () => {
      const result = await creditApi.getUsageAnalytics('user123')
      
      expect(result.success).toBe(true)
      expect(result.data).toMatchObject({
        period: '30d',
        totalCreditsUsed: expect.any(Number),
        averageDailyUsage: expect.any(Number),
        topFeatures: expect.any(Array),
        projectedUsage: expect.any(Number)
      })
    })

    it('respects custom period parameter', async () => {
      const result = await creditApi.getUsageAnalytics('user123', '7d')
      
      expect(result.success).toBe(true)
      expect(result.data.period).toBe('7d')
    })

    it('returns top features with correct structure', async () => {
      const result = await creditApi.getUsageAnalytics('user123')
      
      expect(result.success).toBe(true)
      expect(result.data.topFeatures).toHaveLength(3)
      
      for (const feature of result.data.topFeatures) {
        expect(feature).toMatchObject({
          feature: expect.any(String),
          credits: expect.any(Number)
        })
      }
    })

    it('returns reasonable analytics values', async () => {
      const result = await creditApi.getUsageAnalytics('user123')
      
      expect(result.success).toBe(true)
      expect(result.data.totalCreditsUsed).toBeGreaterThanOrEqual(0)
      expect(result.data.totalCreditsUsed).toBeLessThan(500)
      expect(result.data.averageDailyUsage).toBeGreaterThanOrEqual(0)
      expect(result.data.averageDailyUsage).toBeLessThan(20)
      expect(result.data.projectedUsage).toBeGreaterThanOrEqual(0)
      expect(result.data.projectedUsage).toBeLessThan(600)
    })
  })

  describe('API response consistency', () => {
    it('all methods return ApiResponse structure', async () => {
      const methods = [
        () => creditApi.getBalance('user123'),
        () => creditApi.consumeCredits('user123', 10, 'test'),
        () => creditApi.createPaymentIntent('inicial', 'user123'),
        () => creditApi.confirmPayment('pi_123', 'pm_123'),
        () => creditApi.getSubscription('user123'),
        () => creditApi.cancelSubscription('sub_123'),
        () => creditApi.reactivateSubscription('sub_123'),
        () => creditApi.upgradeSubscription('sub_123', 'profissional'),
        () => creditApi.getTransactionHistory('user123'),
        () => creditApi.validateCreditUsage('user123', 'feature', 10),
        () => creditApi.applyPromotion('user123', 'WELCOME50'),
        () => creditApi.getUsageAnalytics('user123')
      ]

      for (const method of methods) {
        const result = await method()
        
        expect(result).toHaveProperty('success')
        expect(typeof result.success).toBe('boolean')
        
        if (result.success) {
          expect(result).toHaveProperty('data')
        } else {
          expect(result).toHaveProperty('error')
          expect(result).toHaveProperty('message')
        }
      }
    })
  })

  describe('error handling', () => {
    it('handles network-like delays consistently', async () => {
      // Test that all methods handle the delay mechanism
      const start = Date.now()
      await creditApi.getBalance('user123')
      const end = Date.now()
      
      // With mocked setTimeout, this should be nearly instant
      expect(end - start).toBeLessThan(50)
    })
  })
})