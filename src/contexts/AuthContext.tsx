import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Custom hook to handle KV storage with fallback to localStorage
function useKVWithFallback<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue)
  const [initialized, setInitialized] = useState(false)

  // Try to use GitHub Spark KV first, fallback to localStorage
  useEffect(() => {
    if (initialized) return

    const loadFromStorage = () => {
      try {
        // First try localStorage
        const stored = localStorage.getItem(`kv-${key}`)
        if (stored) {
          setValue(JSON.parse(stored))
        }
      } catch (error) {
        console.warn(`Failed to load ${key} from storage:`, error)
        setValue(defaultValue)
      } finally {
        setInitialized(true)
      }
    }

    loadFromStorage()
  }, [key, defaultValue, initialized])

  const setValueWithStorage = (newValue: T) => {
    setValue(newValue)
    try {
      localStorage.setItem(`kv-${key}`, JSON.stringify(newValue))
    } catch (error) {
      console.warn(`Failed to save ${key} to storage:`, error)
    }
  }

  return [value, setValueWithStorage]
}

export interface User {
  id: string
  email: string
  fullName: string
  cpf: string
  phone: string
  role: 'user' | 'admin'
  plan: {
    name: string
    credits: number
    renewalDate: string
  }
  avatar?: string
  createdAt: string
  lastLogin: string
  sessionId?: string
  loginHistory?: Array<{
    timestamp: string
    ip?: string
    userAgent?: string
    success: boolean
  }>
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  tokenExpiresAt: number | null
  sessionActive: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; requiresMFA?: boolean }>
  logout: () => Promise<void>
  forceLogout: () => Promise<void>
  refreshToken: () => Promise<boolean>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  validateSession: () => Promise<boolean>
  getActiveSessions: () => Promise<Array<{ id: string; device: string; lastActivity: string; current: boolean }>>
  terminateSession: (sessionId: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authData, setAuthData] = useKVWithFallback('auth-data', {
    user: null,
    token: null,
    tokenExpiresAt: null,
    sessionActive: false
  })
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!authData.token && !!authData.user && authData.sessionActive
  const tokenExpiresAt = authData.tokenExpiresAt
  const sessionActive = authData.sessionActive

  // Enhanced session validation
  const validateSession = async (): Promise<boolean> => {
    if (!authData.token || !authData.tokenExpiresAt) return false
    
    // Check if token is expired
    if (Date.now() > authData.tokenExpiresAt) {
      await logout()
      return false
    }

    try {
      // Simulate API call to validate session
      await new Promise(resolve => setTimeout(resolve, 300))
      return true
    } catch {
      await logout()
      return false
    }
  }

  // Auto-refresh token and validate session when component mounts
  useEffect(() => {
    const initAuth = async () => {
      if (authData.token && authData.sessionActive) {
        const isValid = await validateSession()
        if (!isValid) {
          await logout()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  // Set up automatic token refresh and session monitoring
  useEffect(() => {
    if (!authData.token || !authData.sessionActive) return

    // Check session every 5 minutes
    const sessionCheckInterval = setInterval(async () => {
      const isValid = await validateSession()
      if (!isValid) {
        await forceLogout()
      }
    }, 5 * 60 * 1000)

    // Refresh token 5 minutes before expiry
    const refreshCheckInterval = setInterval(async () => {
      if (authData.tokenExpiresAt && Date.now() > (authData.tokenExpiresAt - 5 * 60 * 1000)) {
        const refreshed = await refreshToken()
        if (!refreshed) {
          await forceLogout()
        }
      }
    }, 1 * 60 * 1000) // Check every minute

    return () => {
      clearInterval(sessionCheckInterval)
      clearInterval(refreshCheckInterval)
    }
  }, [authData.token, authData.sessionActive, authData.tokenExpiresAt])

  const login = async (email: string, password: string, rememberMe = false): Promise<{ success: boolean; error?: string; requiresMFA?: boolean }> => {
    setIsLoading(true)

    try {
      // Simulate API call with enhanced security
      await new Promise(resolve => setTimeout(resolve, 1200))

      // Generate session info
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const tokenExpiresAt = Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000) // 30 days or 8 hours

      // Mock successful login - replace with actual API response
      if (email === 'admin@teach.com' && password === 'admin123') {
        const userData: User = {
          id: 'admin-1',
          email: 'admin@teach.com',
          fullName: 'Administrador TeacH',
          cpf: '000.000.000-00',
          phone: '(11) 99999-9999',
          role: 'admin',
          plan: {
            name: 'Admin',
            credits: -1, // Unlimited
            renewalDate: '2025-12-31'
          },
          createdAt: '2024-01-01T00:00:00Z',
          lastLogin: new Date().toISOString(),
          sessionId,
          loginHistory: [
            {
              timestamp: new Date().toISOString(),
              success: true,
              ip: '127.0.0.1',
              userAgent: navigator.userAgent
            }
          ]
        }

        setAuthData({
          user: userData,
          token: `jwt_admin_${sessionId}`,
          tokenExpiresAt,
          sessionActive: true
        })

        return { success: true }
      } else if (email === 'user@teach.com' && password === 'user123') {
        const userData: User = {
          id: 'user-1',
          email: 'user@teach.com',
          fullName: 'João Silva Santos',
          cpf: '123.456.789-00',
          phone: '(11) 98765-4321',
          role: 'user',
          plan: {
            name: 'Intermediário',
            credits: 500,
            renewalDate: '2025-01-15'
          },
          createdAt: '2024-12-01T00:00:00Z',
          lastLogin: new Date().toISOString(),
          sessionId,
          loginHistory: [
            {
              timestamp: new Date().toISOString(),
              success: true,
              ip: '127.0.0.1',
              userAgent: navigator.userAgent
            }
          ]
        }

        setAuthData({
          user: userData,
          token: `jwt_user_${sessionId}`,
          tokenExpiresAt,
          sessionActive: true
        })

        return { success: true }
      } else {
        // Log failed attempt for security
        console.warn('Failed login attempt:', { email, timestamp: new Date().toISOString() })
        return { success: false, error: 'Email ou senha incorretos. Verifique suas credenciais.' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Erro interno do servidor. Tente novamente em alguns minutos.' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    
    try {
      // Simulate API call to invalidate token securely
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Clear all auth data
      setAuthData({
        user: null,
        token: null,
        tokenExpiresAt: null,
        sessionActive: false
      })
      
      // Clear any cached data
      localStorage.removeItem('temp-auth-data')
      sessionStorage.clear()
      
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const forceLogout = async (): Promise<void> => {
    // Force logout without API call (for security issues)
    setAuthData({
      user: null,
      token: null,
      tokenExpiresAt: null,
      sessionActive: false
    })
    
    // Clear all stored data
    localStorage.clear()
    sessionStorage.clear()
  }

  const refreshToken = async (): Promise<boolean> => {
    if (!authData.token || !authData.sessionActive) return false

    try {
      // Simulate token refresh API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Mock successful refresh - in real implementation, get new token from API
      const newToken = authData.token.replace(/jwt_/, 'jwt_refreshed_')
      const newExpiresAt = Date.now() + (8 * 60 * 60 * 1000) // 8 hours
      
      setAuthData(current => ({
        ...current,
        token: newToken,
        tokenExpiresAt: newExpiresAt
      }))
      
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate secure password reset API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Email inválido.' }
      }
      
      // Mock successful response - always return success for security
      // (Don't reveal if email exists or not)
      return { success: true }
    } catch {
      return { success: false, error: 'Erro ao processar solicitação. Tente novamente.' }
    }
  }

  const resetPassword = async (token: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate secure password reset API call
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Validate password strength
      if (password.length < 8) {
        return { success: false, error: 'Senha deve ter pelo menos 8 caracteres.' }
      }
      
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return { success: false, error: 'Senha deve conter ao menos: 1 minúscula, 1 maiúscula e 1 número.' }
      }
      
      // Mock successful response
      return { success: true }
    } catch {
      return { success: false, error: 'Token inválido ou expirado. Solicite uma nova recuperação.' }
    }
  }

  const getActiveSessions = async (): Promise<Array<{ id: string; device: string; lastActivity: string; current: boolean }>> => {
    try {
      // Simulate API call to get active sessions
      await new Promise(resolve => setTimeout(resolve, 600))
      
      return [
        {
          id: authData.user?.sessionId || 'current',
          device: 'Chrome - Windows',
          lastActivity: new Date().toISOString(),
          current: true
        },
        {
          id: 'session_old_1',
          device: 'Firefox - Linux',
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          current: false
        }
      ]
    } catch (error) {
      console.error('Error fetching sessions:', error)
      return []
    }
  }

  const terminateSession = async (sessionId: string): Promise<boolean> => {
    try {
      // Simulate API call to terminate session
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (sessionId === authData.user?.sessionId) {
        // Terminating current session - force logout
        await forceLogout()
      }
      
      return true
    } catch (error) {
      console.error('Error terminating session:', error)
      return false
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!authData.user) return { success: false, error: 'Usuário não autenticado' }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedUser = { ...authData.user, ...updates }
      
      setAuthData(current => ({
        ...current,
        user: updatedUser
      }))
      
      return { success: true }
    } catch {
      return { success: false, error: 'Erro ao atualizar perfil.' }
    }
  }

  const value: AuthContextType = {
    user: authData.user,
    token: authData.token,
    tokenExpiresAt,
    sessionActive,
    isLoading,
    isAuthenticated,
    login,
    logout,
    forceLogout,
    refreshToken,
    forgotPassword,
    resetPassword,
    updateProfile,
    validateSession,
    getActiveSessions,
    terminateSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}