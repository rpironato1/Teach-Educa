import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

// Credit system types
export interface CreditTransaction {
  id: string
  type: 'debit' | 'credit' | 'subscription' | 'bonus'
  amount: number
  description: string
  timestamp: Date
  relatedService?: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  credits: number
  price: number
  period: 'month' | 'year'
  features: string[]
  active: boolean
}

export interface CreditBalance {
  current: number
  monthly: number
  bonus: number
  total: number
  lastUpdated: Date
}

export interface PaymentData {
  planId: string
  amount: number
  paymentMethod: 'credit-card' | 'pix' | 'boleto'
  userId?: string
  [key: string]: unknown
}

// Credit costs for different services
export const CREDIT_COSTS = {
  AI_CHAT_MESSAGE: 2,
  CONTENT_GENERATION: 5,
  PROGRESS_ANALYSIS: 3,
  DOCUMENT_UPLOAD: 1,
  VOICE_SYNTHESIS: 4,
  EXPORT_DOCUMENT: 2,
  ADVANCED_ANALYTICS: 10
} as const

// Available subscription plans
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  inicial: {
    id: 'inicial',
    name: 'Inicial',
    credits: 100,
    price: 29,
    period: 'month',
    features: [
      '100 créditos mensais',
      'Acesso a conteúdo básico',
      'Relatórios de progresso',
      'Suporte por email'
    ],
    active: true
  },
  intermediario: {
    id: 'intermediario', 
    name: 'Intermediário',
    credits: 500,
    price: 99,
    period: 'month',
    features: [
      '500 créditos mensais',
      'Acesso a todo conteúdo',
      'Análise neuroadaptativa',
      'Relatórios detalhados',
      'Suporte prioritário'
    ],
    active: true
  },
  profissional: {
    id: 'profissional',
    name: 'Profissional', 
    credits: 1000,
    price: 179,
    period: 'month',
    features: [
      '1000 créditos mensais',
      'Acesso ilimitado',
      'IA personalizada',
      'Dashboard avançado',
      'Suporte 24/7',
      'API access'
    ],
    active: true
  }
}

interface CreditContextType {
  // State
  balance: CreditBalance
  currentPlan: SubscriptionPlan | null
  transactions: CreditTransaction[]
  isLoading: boolean
  
  // Actions
  consumeCredits: (amount: number, description: string, service?: string) => Promise<boolean>
  addCredits: (amount: number, description: string) => Promise<void>
  getBalance: () => Promise<CreditBalance>
  getTransactionHistory: (limit?: number) => Promise<CreditTransaction[]>
  processPayment: (paymentData: PaymentData) => Promise<void>
  upgradeSubscription: (planId: string) => Promise<void>
  downgradeSubscription: (planId: string) => Promise<void>
  cancelSubscription: () => Promise<void>
  checkCreditSufficiency: (amount: number) => boolean
  
  // Getters
  getCreditCost: (service: keyof typeof CREDIT_COSTS) => number
  getAvailablePlans: () => SubscriptionPlan[]
  getRemainingCreditsPercentage: () => number
}

// Context definition
const CreditContext = createContext<CreditContextType | undefined>(undefined)

export const useCredit = (): CreditContextType => {
  const context = useContext(CreditContext)
  if (!context) {
    throw new Error('useCredit must be used within a CreditProvider')
  }
  return context
}

// Alias for compatibility
export // Context definition
const useCreditContext = useCredit

interface CreditProviderProps {
  children: ReactNode
}

export const CreditProvider: React.FC<CreditProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [balance, setBalance] = useState<CreditBalance>({
    current: 0,
    monthly: 0,
    bonus: 0,
    total: 0,
    lastUpdated: new Date()
  })
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const initializeCreditData = async () => {
    setIsLoading(true)
    try {
      // Load user's credit data from localStorage or API
      const savedBalance = localStorage.getItem(`credits_${user?.id}`)
      const savedPlan = localStorage.getItem(`plan_${user?.id}`)
      const savedTransactions = localStorage.getItem(`transactions_${user?.id}`)

      if (savedBalance) {
        const parsedBalance = JSON.parse(savedBalance)
        parsedBalance.lastUpdated = new Date(parsedBalance.lastUpdated)
        setBalance(parsedBalance)
      } else {
        // Initialize with default plan (intermediario for demo)
        const defaultPlan = SUBSCRIPTION_PLANS.intermediario
        const newBalance: CreditBalance = {
          current: defaultPlan.credits,
          monthly: defaultPlan.credits,
          bonus: 0,
          total: defaultPlan.credits,
          lastUpdated: new Date()
        }
        setBalance(newBalance)
        setCurrentPlan(defaultPlan)
        saveBalanceToStorage(newBalance)
      }

      if (savedPlan) {
        setCurrentPlan(JSON.parse(savedPlan))
      }

      if (savedTransactions) {
        const parsedTransactions = JSON.parse(savedTransactions).map((t: Record<string, unknown>) => ({
          ...t,
          timestamp: new Date(t.timestamp as string)
        }))
        setTransactions(parsedTransactions)
      }
    } catch (error) {
      console.error('Error initializing credit data:', error)
      toast.error('Erro ao carregar dados de créditos')
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize credit data when user authenticates
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeCreditData()
    } else {
      resetCreditData()
    }
  }, [isAuthenticated, user])

  const resetCreditData = () => {
    setBalance({
      current: 0,
      monthly: 0,
      bonus: 0,
      total: 0,
      lastUpdated: new Date()
    })
    setCurrentPlan(null)
    setTransactions([])
  }

  const saveBalanceToStorage = (newBalance: CreditBalance) => {
    if (user?.id) {
      localStorage.setItem(`credits_${user.id}`, JSON.stringify(newBalance))
    }
  }

  const savePlanToStorage = (plan: SubscriptionPlan) => {
    if (user?.id) {
      localStorage.setItem(`plan_${user.id}`, JSON.stringify(plan))
    }
  }

  const saveTransactionsToStorage = (newTransactions: CreditTransaction[]) => {
    if (user?.id) {
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(newTransactions))
    }
  }

  const addTransaction = (transaction: Omit<CreditTransaction, 'id' | 'timestamp'>) => {
    const newTransaction: CreditTransaction = {
      ...transaction,
      id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date()
    }
    
    const newTransactions = [newTransaction, ...transactions].slice(0, 100) // Keep last 100 transactions
    setTransactions(newTransactions)
    saveTransactionsToStorage(newTransactions)
    
    return newTransaction
  }

  const consumeCredits = async (amount: number, description: string, service?: string): Promise<boolean> => {
    if (!checkCreditSufficiency(amount)) {
      toast.error('Créditos insuficientes!')
      return false
    }

    try {
      const newBalance: CreditBalance = {
        ...balance,
        current: Math.max(0, balance.current - amount),
        total: Math.max(0, balance.total - amount),
        lastUpdated: new Date()
      }

      setBalance(newBalance)
      saveBalanceToStorage(newBalance)

      addTransaction({
        type: 'debit',
        amount: -amount,
        description,
        relatedService: service
      })

      // Check for low balance warning
      if (newBalance.current <= 20) {
        toast.warning('Atenção: Seus créditos estão acabando!')
      }

      return true
    } catch (error) {
      console.error('Error consuming credits:', error)
      toast.error('Erro ao consumir créditos')
      return false
    }
  }

  const addCredits = async (amount: number, description: string): Promise<void> => {
    try {
      const newBalance: CreditBalance = {
        ...balance,
        current: balance.current + amount,
        total: balance.total + amount,
        lastUpdated: new Date()
      }

      setBalance(newBalance)
      saveBalanceToStorage(newBalance)

      addTransaction({
        type: 'credit',
        amount,
        description
      })

      toast.success(`${amount} créditos adicionados!`)
    } catch (error) {
      console.error('Error adding credits:', error)
      toast.error('Erro ao adicionar créditos')
    }
  }

  const getBalance = async (): Promise<CreditBalance> => {
    return balance
  }

  const getTransactionHistory = async (limit: number = 50): Promise<CreditTransaction[]> => {
    return transactions.slice(0, limit)
  }

  const processPayment = async (paymentData: PaymentData): Promise<void> => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real app, this would call the payment API
    const plan = SUBSCRIPTION_PLANS[paymentData.planId]
    if (!plan) {
      throw new Error('Plano não encontrado')
    }

    addTransaction({
      type: 'subscription',
      amount: 0,
      description: `Pagamento processado - Plano ${plan.name}`
    })
  }

  const upgradeSubscription = async (planId: string): Promise<void> => {
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan) {
      throw new Error('Plano não encontrado')
    }

    try {
      const newBalance: CreditBalance = {
        current: plan.credits,
        monthly: plan.credits,
        bonus: balance.bonus,
        total: plan.credits + balance.bonus,
        lastUpdated: new Date()
      }

      setBalance(newBalance)
      setCurrentPlan(plan)
      saveBalanceToStorage(newBalance)
      savePlanToStorage(plan)

      addTransaction({
        type: 'subscription',
        amount: plan.credits,
        description: `Assinatura ativada - Plano ${plan.name}`
      })

      toast.success(`Plano ${plan.name} ativado com sucesso!`)
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      toast.error('Erro ao ativar assinatura')
      throw error
    }
  }

  const downgradeSubscription = async (planId: string): Promise<void> => {
    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan) {
      throw new Error('Plano não encontrado')
    }

    try {
      const newBalance: CreditBalance = {
        current: Math.min(balance.current, plan.credits),
        monthly: plan.credits,
        bonus: balance.bonus,
        total: Math.min(balance.current, plan.credits) + balance.bonus,
        lastUpdated: new Date()
      }

      setBalance(newBalance)
      setCurrentPlan(plan)
      saveBalanceToStorage(newBalance)
      savePlanToStorage(plan)

      addTransaction({
        type: 'subscription',
        amount: 0,
        description: `Plano alterado para ${plan.name}`
      })

      toast.success(`Plano alterado para ${plan.name}`)
    } catch (error) {
      console.error('Error downgrading subscription:', error)
      toast.error('Erro ao alterar plano')
      throw error
    }
  }

  const cancelSubscription = async (): Promise<void> => {
    try {
      setCurrentPlan(null)
      if (user?.id) {
        localStorage.removeItem(`plan_${user.id}`)
      }

      addTransaction({
        type: 'subscription',
        amount: 0,
        description: 'Assinatura cancelada'
      })

      toast.success('Assinatura cancelada com sucesso')
    } catch (error) {
      console.error('Error canceling subscription:', error)
      toast.error('Erro ao cancelar assinatura')
      throw error
    }
  }

  const checkCreditSufficiency = (amount: number): boolean => {
    return balance.current >= amount
  }

  const getCreditCost = (service: keyof typeof CREDIT_COSTS): number => {
    return CREDIT_COSTS[service]
  }

  const getAvailablePlans = (): SubscriptionPlan[] => {
    return Object.values(SUBSCRIPTION_PLANS).filter(plan => plan.active)
  }

  const getRemainingCreditsPercentage = (): number => {
    if (balance.monthly === 0) return 0
    return Math.round((balance.current / balance.monthly) * 100)
  }

  const contextValue: CreditContextType = {
    // State
    balance,
    currentPlan,
    transactions,
    isLoading,
    
    // Actions
    consumeCredits,
    addCredits,
    getBalance,
    getTransactionHistory,
    processPayment,
    upgradeSubscription,
    downgradeSubscription,
    cancelSubscription,
    checkCreditSufficiency,
    
    // Getters
    getCreditCost,
    getAvailablePlans,
    getRemainingCreditsPercentage
  }

  return (
    <CreditContext.Provider value={contextValue}>
      {children}
    </CreditContext.Provider>
  )
}