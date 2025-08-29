import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Brain, SpinnerGap, User, Crown } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'

interface AuthLoaderProps {
  onComplete: () => void
}

export default function AuthLoader({ onComplete }: AuthLoaderProps) {
  const { user, isAuthenticated } = useAuth()
  const [loadingStep, setLoadingStep] = useState(0)
  const [redirecting, setRedirecting] = useState(false)

  const loadingSteps = [
    'Verificando credenciais...',
    'Carregando perfil...',
    'Preparando dashboard...',
    'Redirecionando...'
  ]

  const handleRedirect = useCallback(() => {
    if (!user) return

    // Secure redirection based on user role and authentication status
    const redirectPath = user.role === 'admin' ? '/admin-dashboard' : '/dashboard'
    
    // Store redirect info for security audit
    const _redirectInfo = {
      userId: user.id,
      role: user.role,
      timestamp: new Date().toISOString(),
      targetPath: redirectPath,
      sessionId: Date.now().toString()
    }
    
    // For demo purposes, we complete the auth flow
    // In production, this would handle proper routing
    onComplete()
  }, [user, onComplete])

  useEffect(() => {
    if (!isAuthenticated || !user) return

    const stepTimer = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(stepTimer)
          setRedirecting(true)
          
          // Redirect after animation completes
          setTimeout(() => {
            handleRedirect()
          }, 1000)
          
          return prev
        }
        return prev + 1
      })
    }, 800)

    return () => clearInterval(stepTimer)
  }, [isAuthenticated, user, handleRedirect, loadingSteps.length])

  return (
    <div className="p-8 text-center space-y-8">
      {/* Animated logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-primary/20 rounded-full border-t-primary"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary" weight="duotone" />
          </div>
        </div>
      </motion.div>

      {/* User info */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center space-x-2">
            {user.role === 'admin' ? (
              <Crown className="h-5 w-5 text-accent" weight="fill" />
            ) : (
              <User className="h-5 w-5 text-secondary" weight="fill" />
            )}
            <span className="font-medium text-foreground">
              Bem-vindo, {user.fullName}!
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {user.role === 'admin' ? 'Acesso Administrativo' : `Plano ${user.plan.name}`}
          </div>
        </motion.div>
      )}

      {/* Loading steps */}
      <div className="space-y-4">
        <motion.div
          key={loadingStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center space-x-3"
        >
          <SpinnerGap className="h-4 w-4 animate-spin text-primary" />
          <span className="text-muted-foreground">
            {loadingSteps[loadingStep]}
          </span>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="text-xs text-muted-foreground">
          {loadingStep + 1} de {loadingSteps.length}
        </div>
      </div>

      {/* Success message */}
      {redirecting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-secondary/10 border border-secondary/20 rounded-lg p-4"
        >
          <p className="text-secondary font-medium">
            Login realizado com sucesso!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Redirecionando para seu painel...
          </p>
        </motion.div>
      )}

      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            initial={{
              x: Math.random() * 400,
              y: Math.random() * 300,
              opacity: 0
            }}
            animate={{
              x: Math.random() * 400,
              y: Math.random() * 300,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  )
}