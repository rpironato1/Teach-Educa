import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import LoginForm from './auth/LoginForm'
import ForgotPasswordForm from './auth/ForgotPasswordForm'
import ResetPasswordForm from './auth/ResetPasswordForm'
import AuthLoader from './auth/AuthLoader'

interface AuthFlowProps {
  onClose: () => void
  onLoginSuccess?: () => void
  redirectUrl?: string
}

type AuthStep = 'login' | 'forgot-password' | 'reset-password' | 'loading'

export default function AuthFlow({ onClose, onLoginSuccess, redirectUrl }: AuthFlowProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login')
  const [resetToken, setResetToken] = useState('')

  const stepVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'login':
        return (
          <LoginForm
            onForgotPassword={() => setCurrentStep('forgot-password')}
            onSuccess={() => {
              setCurrentStep('loading')
            }}
            redirectUrl={redirectUrl}
          />
        )
      
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBack={() => setCurrentStep('login')}
            onSuccess={() => setCurrentStep('login')}
          />
        )
      
      case 'reset-password':
        return (
          <ResetPasswordForm
            token={resetToken}
            onBack={() => setCurrentStep('login')}
            onSuccess={() => setCurrentStep('login')}
          />
        )
      
      case 'loading':
        return (
          <AuthLoader 
            onComplete={() => {
              onLoginSuccess?.()
              onClose()
            }} 
          />
        )
      
      default:
        return null
    }
  }

  // Check for reset password token in URL on mount
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('reset-token')
    if (token) {
      setResetToken(token)
      setCurrentStep('reset-password')
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Header with close button */}
          {currentStep !== 'loading' && (
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h1 className="text-2xl font-bold text-foreground">
                {currentStep === 'login' && 'Entrar na TeacH'}
                {currentStep === 'forgot-password' && 'Recuperar Senha'}
                {currentStep === 'reset-password' && 'Nova Senha'}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="focus-enhanced"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step content */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}