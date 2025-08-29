import { useState, useCallback, useEffect } from 'react'
import { subscribeUser } from '@/api/auth'
import { toast } from 'sonner'

export interface RegistrationState {
  userId?: string
  email: string
  fullName: string
  cpf: string
  phone: string
  password: string
  selectedPlan?: Record<string, unknown>
  acceptedTerms: boolean
  acceptedPrivacy: boolean
  marketingOptIn: boolean
  emailVerified: boolean
  subscriptionActive: boolean
}

interface UseRegistrationFlowReturn {
  registrationState: RegistrationState
  updateRegistrationState: (updates: Partial<RegistrationState>) => void
  completeSubscription: (planId: string) => Promise<boolean>
  clearRegistrationState: () => void
}

export function useRegistrationFlow(): UseRegistrationFlowReturn {
  const [registrationState, setRegistrationState] = useState<RegistrationState>(() => {
    // Try to restore state from sessionStorage
    try {
      const stored = sessionStorage.getItem('registrationState')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error restoring registration state:', error)
    }
    
    return {
      email: '',
      fullName: '',
      cpf: '',
      phone: '',
      password: '',
      acceptedTerms: false,
      acceptedPrivacy: false,
      marketingOptIn: false,
      emailVerified: false,
      subscriptionActive: false
    }
  })

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem('registrationState', JSON.stringify(registrationState))
    } catch (error) {
      console.error('Error saving registration state:', error)
    }
  }, [registrationState])

  const updateRegistrationState = useCallback((updates: Partial<RegistrationState>) => {
    setRegistrationState(prev => ({ ...prev, ...updates }))
  }, [])

  const completeSubscription = useCallback(async (planId: string): Promise<boolean> => {
    try {
      const userId = registrationState.userId || sessionStorage.getItem('registrationUserId')
      
      if (!userId) {
        toast.error('Sessão expirada. Faça o cadastro novamente.')
        return false
      }

      const response = await subscribeUser({
        userId,
        planId,
        paymentMethod: 'credit_card', // This would be determined by the payment processor
        paymentData: {} // This would contain payment details
      })

      if (response.success) {
        updateRegistrationState({ subscriptionActive: true })
        toast.success('Assinatura ativada com sucesso!')
        return true
      } else {
        toast.error('Erro ao ativar assinatura')
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar assinatura'
      toast.error(errorMessage)
      return false
    }
  }, [registrationState.userId, updateRegistrationState])

  const clearRegistrationState = useCallback(() => {
    setRegistrationState({
      email: '',
      fullName: '',
      cpf: '',
      phone: '',
      password: '',
      acceptedTerms: false,
      acceptedPrivacy: false,
      marketingOptIn: false,
      emailVerified: false,
      subscriptionActive: false
    })
    sessionStorage.removeItem('registrationState')
    sessionStorage.removeItem('registrationUserId')
  }, [])

  return {
    registrationState,
    updateRegistrationState,
    completeSubscription,
    clearRegistrationState
  }
}