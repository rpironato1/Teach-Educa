import { ReactNode, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useSecureRedirect } from '@/hooks/useSecureRedirect'
import AuthFlow from './AuthFlow'

interface ProtectedRouteProps {
  children: ReactNode
  requireRole?: 'user' | 'admin'
  fallback?: ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requireRole, 
  fallback,
  redirectTo
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const { guardRoute, redirectToAppropriateRoute, logSecurityEvent } = useSecureRedirect()

  useEffect(() => {
    if (isLoading) return

    // Log access attempt
    if (user) {
      logSecurityEvent({
        userId: user.id,
        action: 'redirect',
        details: { 
          attemptedAccess: 'protected_route',
          requiredRole: requireRole,
          userRole: user.role 
        }
      })
    }

    // Handle redirection for unauthenticated users
    if (!isAuthenticated && redirectTo) {
      redirectToAppropriateRoute({ redirectUrl: redirectTo })
    }
  }, [isAuthenticated, user, isLoading, requireRole, redirectTo, logSecurityEvent, redirectToAppropriateRoute])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-8 h-8 border-4 border-primary/20 rounded-full border-t-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Verificando permissões de acesso...</p>
        </motion.div>
      </div>
    )
  }

  // Show auth flow if not authenticated
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-background">
        <AuthFlow 
          onClose={() => {
            // Redirect to home or handle as needed
            window.location.href = '/'
          }}
          redirectUrl={redirectTo}
        />
      </div>
    )
  }

  // Check role requirements
  if (requireRole && user?.role !== requireRole) {
    // Log unauthorized access attempt
    logSecurityEvent({
      userId: user?.id || 'unknown',
      action: 'access_denied',
      details: { 
        reason: 'insufficient_role',
        requiredRole: requireRole,
        userRole: user?.role || 'none'
      }
    })

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Acesso Negado
          </h2>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área. 
            {requireRole === 'admin' && ' Apenas administradores podem acessar.'}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => redirectToAppropriateRoute({ validateRole: true })}
              className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Ir para meu painel
            </button>
            <button
              onClick={() => window.history.back()}
              className="text-primary hover:underline"
            >
              Voltar
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}