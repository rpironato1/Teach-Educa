/**
 * Credit System API Service
 * 
 * This service simulates the credit system API endpoints for the TeacH platform.
 * In a real implementation, these would make HTTP requests to your backend.
 */

export interface CreditBalance {
  current: number;
  maximum: number;
  renewDate: Date;
  planType: 'inicial' | 'intermediario' | 'profissional';
}

export interface CreditTransaction {
  id: string;
  type: 'consumption' | 'purchase' | 'refund' | 'bonus';
  amount: number;
  description: string;
  timestamp: Date;
  metadata?: {
    assistantId?: string;
    sessionId?: string;
    actionType?: string;
  };
}

export interface SubscriptionStatus {
  id: string;
  status: 'active' | 'cancelled' | 'pending' | 'expired';
  planType: 'inicial' | 'intermediario' | 'profissional';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  redirectUrl?: string; // For PIX/Boleto
}

class CreditSystemAPI {
  private baseUrl = '/api/credits';

  /**
   * Get current credit balance for the user
   */
  async getBalance(): Promise<CreditBalance> {
    // Simulate API call
    await this.delay(500);
    
    // Mock data - in real app, this would come from your backend
    return {
      current: 85,
      maximum: 100,
      renewDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      planType: 'inicial'
    };
  }

  /**
   * Consume credits for an action
   */
  async consumeCredits(
    amount: number, 
    description: string, 
    actionType: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
    await this.delay(300);
    
    // Simulate credit consumption logic
    const currentBalance = await this.getBalance();
    
    if (currentBalance.current < amount) {
      return {
        success: false,
        remainingCredits: currentBalance.current,
        error: 'Créditos insuficientes'
      };
    }

    // In real implementation, this would update the database
    return {
      success: true,
      remainingCredits: currentBalance.current - amount
    };
  }

  /**
   * Process a payment for plan upgrade/renewal
   */
  async processPayment(
    planType: 'inicial' | 'intermediario' | 'profissional',
    paymentMethod: 'credit_card' | 'pix' | 'boleto',
    paymentData: Record<string, any>
  ): Promise<PaymentResult> {
    await this.delay(2000); // Simulate payment processing time
    
    // Simulate different payment flows
    switch (paymentMethod) {
      case 'credit_card':
        // Simulate credit card processing
        const success = Math.random() > 0.1; // 90% success rate
        return {
          success,
          transactionId: success ? `cc_${Date.now()}` : undefined,
          error: success ? undefined : 'Cartão recusado'
        };
        
      case 'pix':
        // PIX is usually instant
        return {
          success: true,
          transactionId: `pix_${Date.now()}`,
          redirectUrl: `/payment/pix/${Date.now()}`
        };
        
      case 'boleto':
        // Boleto generation
        return {
          success: true,
          transactionId: `boleto_${Date.now()}`,
          redirectUrl: `/payment/boleto/${Date.now()}`
        };
        
      default:
        return {
          success: false,
          error: 'Método de pagamento inválido'
        };
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    await this.delay(400);
    
    return {
      id: 'sub_123456',
      status: 'active',
      planType: 'inicial',
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false
    };
  }

  /**
   * Get credit transaction history
   */
  async getTransactionHistory(limit = 50): Promise<CreditTransaction[]> {
    await this.delay(600);
    
    // Mock transaction data
    return [
      {
        id: '1',
        type: 'consumption',
        amount: -5,
        description: 'Conversa com assistente de matemática',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        metadata: {
          assistantId: 'math_tutor',
          actionType: 'ai_chat'
        }
      },
      {
        id: '2',
        type: 'consumption',
        amount: -8,
        description: 'Geração de exercícios personalizados',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        metadata: {
          actionType: 'content_generation'
        }
      },
      {
        id: '3',
        type: 'purchase',
        amount: 100,
        description: 'Renovação plano Inicial',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        type: 'consumption',
        amount: -2,
        description: 'Análise de progresso semanal',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        metadata: {
          actionType: 'analysis'
        }
      }
    ];
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(cancelAtPeriodEnd = true): Promise<{ success: boolean; error?: string }> {
    await this.delay(800);
    
    return {
      success: true
    };
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(): Promise<{ success: boolean; error?: string }> {
    await this.delay(800);
    
    return {
      success: true
    };
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(paymentData: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    await this.delay(1000);
    
    return {
      success: true
    };
  }

  /**
   * Get available plans with pricing
   */
  async getAvailablePlans() {
    await this.delay(200);
    
    return {
      inicial: { credits: 100, price: 29, name: 'Inicial' },
      intermediario: { credits: 500, price: 99, name: 'Intermediário' },
      profissional: { credits: 1000, price: 179, name: 'Profissional' }
    };
  }

  // Utility method to simulate API delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const creditSystemAPI = new CreditSystemAPI();

// Export types for use in components
export type { CreditBalance, CreditTransaction, SubscriptionStatus, PaymentResult };

// Export credit cost constants
export const CREDIT_COSTS = {
  ai_chat: 1,
  content_generation: 2,
  analysis: 3,
  export: 1,
  voice_synthesis: 1,
  document_upload: 2,
  advanced_analytics: 5
} as const;

export type CreditActionType = keyof typeof CREDIT_COSTS;