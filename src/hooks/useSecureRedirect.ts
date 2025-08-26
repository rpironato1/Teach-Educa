import { useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from '@/hooks/useRouter'
import { toast } from 'sonner'

export interface RedirectOptions {
  secure?: boolean
  validateRole?: boolean
  redirectUrl?: string
  preventRedirectLoop?: boolean
}

export interface SecurityAuditLog {
  userId: string
  action: 'login' | 'logout' | 'redirect' | 'access_denied'
  timestamp: string
  userAgent: string
  ip: string
  details?: Record<string, any>
}

export function useSecureRedirect() {
  const { user, isAuthenticated, logout } = useAuth()
  const { navigate, currentRoute } = useRouter()
  const redirectAttempts = useRef(0)
  const maxRedirectAttempts = 3
  const logCache = useRef(new Set<string>())
  const logTimer = useRef<NodeJS.Timeout | null>(null)

  // Security audit logging with deduplication and debouncing
  const logSecurityEvent = useCallback((event: Omit<SecurityAuditLog, 'timestamp' | 'userAgent' | 'ip'>) => {
    // Create a unique key for deduplication
    const eventKey = `${event.userId}-${event.action}-${JSON.stringify(event.details?.reason || '')}`
    
    // Check if we've already logged this exact event recently (within 1 second)
    if (logCache.current.has(eventKey)) {
      return
    }
    
    // Add to cache and set cleanup timer
    logCache.current.add(eventKey)
    
    // Clear cache entry after 1 second to allow future similar events
    setTimeout(() => {
      logCache.current.delete(eventKey)
    }, 1000)
    
    // Debounce logging to prevent spam
    if (logTimer.current) {
      clearTimeout(logTimer.current)
    }
    
    logTimer.current = setTimeout(() => {
      const auditEntry: SecurityAuditLog = {
        ...event,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: '127.0.0.1' // In production, get from backend
      }
      
      // In production, send to security monitoring service
      console.log('Security Audit:', auditEntry)
      
      // Store locally for demo
      try {
        const existingLogs = JSON.parse(localStorage.getItem('security_audit_log') || '[]')
        existingLogs.push(auditEntry)
        localStorage.setItem('security_audit_log', JSON.stringify(existingLogs.slice(-100))) // Keep last 100 entries
      } catch (error) {
        console.warn('Failed to store security log:', error)
      }
    }, 100) // 100ms debounce
  }, [])

  // Secure redirect based on user role and authentication
  const redirectToAppropriateRoute = useCallback((options: RedirectOptions = {}) => {
    const {
      secure = true,
      validateRole = true,
      redirectUrl,
      preventRedirectLoop = true
    } = options

    // Prevent infinite redirect loops
    if (preventRedirectLoop && redirectAttempts.current >= maxRedirectAttempts) {
      console.error('Max redirect attempts reached, stopping to prevent infinite loop')
      toast.error('Erro de redirecionamento. Por favor, recarregue a página.')
      return false
    }

    redirectAttempts.current++

    // Reset counter after successful navigation
    setTimeout(() => {
      redirectAttempts.current = 0
    }, 5000)

    if (!isAuthenticated || !user) {
      if (secure) {
        logSecurityEvent({
          userId: 'anonymous',
          action: 'access_denied',
          details: { reason: 'not_authenticated', attemptedRoute: currentRoute }
        })
        navigate('auth')
        toast.warning('Você precisa estar logado para acessar esta página.')
        return false
      }
      return true
    }

    // Custom redirect URL
    if (redirectUrl) {
      navigate(redirectUrl as any)
      logSecurityEvent({
        userId: user.id,
        action: 'redirect',
        details: { targetRoute: redirectUrl, source: 'custom' }
      })
      return true
    }

    // Role-based redirection
    if (validateRole) {
      if (user.role === 'admin') {
        if (currentRoute !== 'admin-dashboard') {
          navigate('admin-dashboard')
          logSecurityEvent({
            userId: user.id,
            action: 'redirect',
            details: { targetRoute: 'admin-dashboard', source: 'role_based' }
          })
          toast.success('Redirecionando para o painel administrativo...')
        }
      } else if (user.role === 'user') {
        if (currentRoute !== 'dashboard') {
          navigate('dashboard')
          logSecurityEvent({
            userId: user.id,
            action: 'redirect',
            details: { targetRoute: 'dashboard', source: 'role_based' }
          })
          toast.success('Redirecionando para seu dashboard...')
        }
      } else {
        // Unknown role - security issue
        logSecurityEvent({
          userId: user.id,
          action: 'access_denied',
          details: { reason: 'unknown_role', role: user.role }
        })
        logout()
        toast.error('Erro de permissão. Faça login novamente.')
        return false
      }
    }

    return true
  }, [isAuthenticated, user, currentRoute, navigate, logout, logSecurityEvent])

  // Check if user has permission to access specific route
  const hasRoutePermission = useCallback((route: string): boolean => {
    if (!isAuthenticated || !user) {
      return ['home', 'auth', 'registration'].includes(route)
    }

    switch (route) {
      case 'admin-dashboard':
        return user.role === 'admin'
      case 'dashboard':
        return user.role === 'user' || user.role === 'admin'
      case 'home':
      case 'auth':
      case 'registration':
        return true
      default:
        return false
    }
  }, [isAuthenticated, user])

  // Secure route guard
  const guardRoute = useCallback((targetRoute: string, options: RedirectOptions = {}): boolean => {
    if (!hasRoutePermission(targetRoute)) {
      logSecurityEvent({
        userId: user?.id || 'anonymous',
        action: 'access_denied',
        details: { 
          reason: 'insufficient_permissions', 
          targetRoute,
          userRole: user?.role || 'none'
        }
      })

      // Redirect to appropriate route
      if (isAuthenticated && user) {
        redirectToAppropriateRoute({ validateRole: true })
      } else {
        navigate('auth')
        toast.warning('Você precisa estar logado para acessar esta página.')
      }
      return false
    }

    return true
  }, [hasRoutePermission, user, isAuthenticated, logSecurityEvent, redirectToAppropriateRoute, navigate])

  // Force logout and redirect (for security violations)
  const forceSecureLogout = useCallback(async (reason: string) => {
    logSecurityEvent({
      userId: user?.id || 'unknown',
      action: 'logout',
      details: { reason, forced: true }
    })

    await logout()
    navigate('home')
    toast.error(`Sessão encerrada por segurança: ${reason}`)
  }, [user, logout, navigate, logSecurityEvent])

  // Get security audit logs
  const getSecurityLogs = useCallback((): SecurityAuditLog[] => {
    return JSON.parse(localStorage.getItem('security_audit_log') || '[]')
  }, [])

  // Clear security logs (admin only)
  const clearSecurityLogs = useCallback((): boolean => {
    if (user?.role !== 'admin') {
      logSecurityEvent({
        userId: user?.id || 'unknown',
        action: 'access_denied',
        details: { reason: 'unauthorized_log_clear_attempt' }
      })
      return false
    }

    localStorage.removeItem('security_audit_log')
    logSecurityEvent({
      userId: user.id,
      action: 'redirect',
      details: { action: 'security_logs_cleared' }
    })
    return true
  }, [user, logSecurityEvent])

  return {
    redirectToAppropriateRoute,
    hasRoutePermission,
    guardRoute,
    forceSecureLogout,
    getSecurityLogs,
    clearSecurityLogs,
    logSecurityEvent
  }
}