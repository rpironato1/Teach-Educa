
/**
 * Mock API service for credit operations
 * In a real application, these would be actual API calls
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled'
  client_secret: string
}

export interface SubscriptionData {
  id: string
  planId: string
  status: 'active' | 'cancelled' | 'expired' | 'past_due'
  currentPeriodStart: string
  currentPeriodEnd: string
  nextBillingDate: string
  priceId: string
}

class CreditApiService {
  private baseUrl = '/api'
  
  /**
   * Get current credit balance
   */
  async getBalance(__userId: string): Promise<ApiResponse> {
    // Simulate API call
    await this.delay(500)
    
    return {
      success: true,
      data: {
        current: 150,
        monthly: 500,
        bonus: 25,
        lastUpdated: new Date().toISOString()
      }
    }
  }
  
  /**
   * Consume credits for a specific action
   */
  async consumeCredits(__userId: string, _amount: number, _description: string): Promise<ApiResponse> {
    await this.delay(300)
    
    // Simulate insufficient credits
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: 'INSUFFICIENT_CREDITS',
        message: 'Créditos insuficientes para esta operação'
      }
    }
    
    return {
      success: true,
      data: {
        transactionId: `txn_${Date.now()}`,
        remainingCredits: Math.max(0, Math.random() * 500)
      }
    }
  }
  
  /**
   * Create payment intent for credit purchase
   */
  async createPaymentIntent(planId: string, __userId: string): Promise<ApiResponse<PaymentIntent>> {
    await this.delay(800)
    
    const plans = {
      inicial: { amount: 2900, credits: 100 },
      intermediario: { amount: 9900, credits: 500 },
      profissional: { amount: 17900, credits: 1000 }
    }
    
    const plan = plans[planId as keyof typeof plans]
    if (!plan) {
      return {
        success: false,
        error: 'INVALID_PLAN',
        message: 'Plano não encontrado'
      }
    }
    
    return {
      success: true,
      data: {
        id: `pi_${Date.now()}`,
        amount: plan.amount,
        currency: 'brl',
        status: 'requires_payment_method',
        client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
      }
    }
  }
  
  /**
   * Confirm payment and process subscription
   */
  async confirmPayment(paymentIntentId: string, _paymentMethodId: string): Promise<ApiResponse> {
    await this.delay(2000)
    
    // Simulate payment failure
    if (Math.random() < 0.05) {
      return {
        success: false,
        error: 'PAYMENT_FAILED',
        message: 'Falha no processamento do pagamento'
      }
    }
    
    return {
      success: true,
      data: {
        paymentId: paymentIntentId,
        subscriptionId: `sub_${Date.now()}`,
        status: 'succeeded'
      }
    }
  }
  
  /**
   * Get subscription details
   */
  async getSubscription(__userId: string): Promise<ApiResponse<SubscriptionData>> {
    await this.delay(400)
    
    return {
      success: true,
      data: {
        id: `sub_${Date.now()}`,
        planId: 'intermediario',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priceId: 'price_intermediario'
      }
    }
  }
  
  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<ApiResponse> {
    await this.delay(1000)
    
    return {
      success: true,
      data: {
        subscriptionId,
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      }
    }
  }
  
  /**
   * Reactivate cancelled subscription
   */
  async reactivateSubscription(subscriptionId: string): Promise<ApiResponse> {
    await this.delay(1000)
    
    return {
      success: true,
      data: {
        subscriptionId,
        status: 'active',
        reactivatedAt: new Date().toISOString()
      }
    }
  }
  
  /**
   * Upgrade subscription to higher plan
   */
  async upgradeSubscription(subscriptionId: string, newPlanId: string): Promise<ApiResponse> {
    await this.delay(1500)
    
    return {
      success: true,
      data: {
        subscriptionId,
        planId: newPlanId,
        upgradedAt: new Date().toISOString(),
        proratedCredits: Math.floor(Math.random() * 100)
      }
    }
  }
  
  /**
   * Get transaction history
   */
  async getTransactionHistory(_userId: string, limit = 50): Promise<ApiResponse> {
    await this.delay(600)
    
    const transactions = []
    for (let i = 0; i < Math.min(limit, 20); i++) {
      transactions.push({
        id: `txn_${Date.now()}_${i}`,
        type: ['purchase', 'consumption', 'bonus', 'refund'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 200) * (Math.random() > 0.3 ? 1 : -1),
        description: [
          'Compra de créditos - Plano Intermediário',
          'Uso de IA para análise de conteúdo',
          'Bônus de boas-vindas',
          'Exercício interativo completado',
          'Reembolso de créditos não utilizados'
        ][Math.floor(Math.random() * 5)],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        orderId: Math.random() > 0.5 ? `order_${Date.now()}` : undefined
      })
    }
    
    return {
      success: true,
      data: transactions
    }
  }
  
  /**
   * Validate credit usage for specific feature
   */
  async validateCreditUsage(_userId: string, feature: string, creditsRequired: number): Promise<ApiResponse> {
    await this.delay(200)
    
    const balance = Math.floor(Math.random() * 1000)
    
    return {
      success: true,
      data: {
        hasEnoughCredits: balance >= creditsRequired,
        currentBalance: balance,
        requiredCredits: creditsRequired,
        feature
      }
    }
  }
  
  /**
   * Apply promotional credits or bonus
   */
  async applyPromotion(_userId: string, promoCode: string): Promise<ApiResponse> {
    await this.delay(800)
    
    const validCodes = ['WELCOME50', 'BONUS25', 'FRIEND10']
    if (!validCodes.includes(promoCode)) {
      return {
        success: false,
        error: 'INVALID_PROMO_CODE',
        message: 'Código promocional inválido'
      }
    }
    
    const bonusAmount = {
      'WELCOME50': 50,
      'BONUS25': 25,
      'FRIEND10': 10
    }[promoCode] || 0
    
    return {
      success: true,
      data: {
        promoCode,
        bonusCredits: bonusAmount,
        appliedAt: new Date().toISOString()
      }
    }
  }
  
  /**
   * Get usage analytics
   */
  async getUsageAnalytics(_userId: string, period = '30d'): Promise<ApiResponse> {
    await this.delay(700)
    
    return {
      success: true,
      data: {
        period,
        totalCreditsUsed: Math.floor(Math.random() * 500),
        averageDailyUsage: Math.floor(Math.random() * 20),
        topFeatures: [
          { feature: 'Análise de IA', credits: Math.floor(Math.random() * 200) },
          { feature: 'Exercícios Interativos', credits: Math.floor(Math.random() * 150) },
          { feature: 'Relatórios Avançados', credits: Math.floor(Math.random() * 100) }
        ],
        projectedUsage: Math.floor(Math.random() * 600)
      }
    }
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const creditApi = new CreditApiService()