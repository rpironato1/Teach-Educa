import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import RegistrationForm from './registration/RegistrationForm'
import EmailVerification from './registration/EmailVerification'
import PlanSelection from './registration/PlanSelection'
import PaymentProcessor from './PaymentProcessor'
import ConfirmationPage from './registration/ConfirmationPage'

export interface Plan {
  name: string
  credits: number
  price: string
  period: string
  description: string
  features: string[]
  popular: boolean
  color: string
}

export interface RegistrationData {
  email: string
  fullName: string
  cpf: string
  phone: string
  password: string
  selectedPlan?: Plan
  acceptedTerms: boolean
  acceptedPrivacy: boolean
  marketingOptIn: boolean
}

interface RegistrationFlowProps {
  pricingPlans: Plan[]
  onClose: () => void
}

type FlowStep = 'register' | 'verify' | 'plan' | 'checkout' | 'confirmation'

export default function RegistrationFlow({ pricingPlans, onClose }: RegistrationFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('register')
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    email: '',
    fullName: '',
    cpf: '',
    phone: '',
    password: '',
    acceptedTerms: false,
    acceptedPrivacy: false,
    marketingOptIn: false
  })

  const updateRegistrationData = (data: Partial<RegistrationData>) => {
    setRegistrationData(prev => ({ ...prev, ...data }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'register':
        return (
          <RegistrationForm
            data={registrationData}
            onUpdate={updateRegistrationData}
            onNext={() => setCurrentStep('verify')}
          />
        )
      case 'verify':
        return (
          <EmailVerification
            email={registrationData.email}
            onNext={() => setCurrentStep('plan')}
            onBack={() => setCurrentStep('register')}
          />
        )
      case 'plan':
        return (
          <PlanSelection
            plans={pricingPlans}
            selectedPlan={registrationData.selectedPlan}
            onPlanSelect={(plan) => updateRegistrationData({ selectedPlan: plan })}
            onNext={() => setCurrentStep('checkout')}
            onBack={() => setCurrentStep('verify')}
          />
        )
      case 'checkout':
        return (
          <PaymentProcessor
            plan={{
              name: registrationData.selectedPlan?.name || 'Inicial',
              price: parseFloat(registrationData.selectedPlan?.price.replace('R$ ', '') || '29'),
              credits: registrationData.selectedPlan?.credits || 100
            }}
            onSuccess={() => setCurrentStep('confirmation')}
            onCancel={() => setCurrentStep('plan')}
          />
        )
      case 'confirmation':
        return (
          <ConfirmationPage
            registrationData={registrationData}
            onClose={onClose}
          />
        )
      default:
        return null
    }
  }

  const getStepProgress = () => {
    const steps = ['register', 'verify', 'plan', 'checkout', 'confirmation']
    const currentIndex = steps.indexOf(currentStep)
    return ((currentIndex + 1) / steps.length) * 100
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">
              {currentStep === 'register' && 'Criar sua conta'}
              {currentStep === 'verify' && 'Verificar email'}
              {currentStep === 'plan' && 'Escolher plano'}
              {currentStep === 'checkout' && 'Finalizar pagamento'}
              {currentStep === 'confirmation' && 'Conta criada!'}
            </h2>
            {currentStep !== 'confirmation' && (
              <div className="mt-2 bg-muted rounded-full h-2">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${getStepProgress()}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-4 focus-enhanced"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}