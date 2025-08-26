// Simulação dos endpoints de API para o Módulo 3 - Login Único e Redirecionamento
// Em produção, estes seriam endpoints reais do backend

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
  deviceInfo?: {
    userAgent: string
    platform: string
    timestamp: string
  }
}

export interface LoginResponse {
  success: boolean
  token?: string
  refreshToken?: string
  user?: {
    id: string
    email: string
    fullName: string
    role: 'user' | 'admin'
    plan: {
      name: string
      credits: number
      renewalDate: string
    }
    sessionId: string
    tokenExpiresAt: number
  }
  error?: string
  requiresMFA?: boolean
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message?: string
  error?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  success: boolean
  token?: string
  expiresAt?: number
  error?: string
}

// Simulated API endpoints
export const AuthAPI = {
  // POST /api/login
  async login(request: LoginRequest): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    const { email, password, rememberMe = false } = request

    // Mock authentication logic
    if (email === 'admin@teach.com' && password === 'admin123') {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const tokenExpiresAt = Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000)

      return {
        success: true,
        token: `jwt_admin_${sessionId}`,
        refreshToken: `refresh_admin_${sessionId}`,
        user: {
          id: 'admin-1',
          email: 'admin@teach.com',
          fullName: 'Administrador TeacH',
          role: 'admin',
          plan: {
            name: 'Admin',
            credits: -1,
            renewalDate: '2025-12-31'
          },
          sessionId,
          tokenExpiresAt
        }
      }
    }

    if (email === 'user@teach.com' && password === 'user123') {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const tokenExpiresAt = Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000)

      return {
        success: true,
        token: `jwt_user_${sessionId}`,
        refreshToken: `refresh_user_${sessionId}`,
        user: {
          id: 'user-1',
          email: 'user@teach.com',
          fullName: 'João Silva Santos',
          role: 'user',
          plan: {
            name: 'Intermediário',
            credits: 500,
            renewalDate: '2025-01-15'
          },
          sessionId,
          tokenExpiresAt
        }
      }
    }

    // Invalid credentials
    return {
      success: false,
      error: 'Email ou senha incorretos. Verifique suas credenciais.'
    }
  },

  // POST /api/forgot-password
  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500))

    const { email } = request

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Email inválido.'
      }
    }

    // Always return success for security (don't reveal if email exists)
    return {
      success: true,
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
    }
  },

  // POST /api/refresh-token
  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    await new Promise(resolve => setTimeout(resolve, 800))

    const { refreshToken } = request

    // Mock token validation
    if (refreshToken && refreshToken.startsWith('refresh_')) {
      const newToken = refreshToken.replace('refresh_', 'jwt_refreshed_')
      const expiresAt = Date.now() + (8 * 60 * 60 * 1000) // 8 hours

      return {
        success: true,
        token: newToken,
        expiresAt
      }
    }

    return {
      success: false,
      error: 'Refresh token inválido ou expirado.'
    }
  },

  // POST /api/logout
  async logout(token: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500))

    // In a real implementation, this would invalidate the token on the server
    console.log('Token invalidated:', token)

    return { success: true }
  },

  // GET /api/validate-session
  async validateSession(token: string): Promise<{ valid: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 300))

    // Mock session validation
    if (token && token.startsWith('jwt_')) {
      return { valid: true }
    }

    return { 
      valid: false, 
      error: 'Token inválido ou expirado.' 
    }
  }
}

// Security utilities
export const SecurityUtils = {
  // Generate secure session ID
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Hash password (in production, use bcrypt or similar)
  hashPassword(password: string): string {
    // This is just for demo - never hash passwords client-side in production
    return btoa(password + 'salt_key')
  },

  // Validate password strength
  validatePasswordStrength(password: string): {
    isValid: boolean
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('Use pelo menos 8 caracteres')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Inclua letras minúsculas')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Inclua letras maiúsculas')
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('Inclua números')
    }

    if (/[^a-zA-Z\d]/.test(password)) {
      score += 1
    } else {
      feedback.push('Inclua símbolos especiais')
    }

    return {
      isValid: score >= 4,
      score,
      feedback
    }
  },

  // Rate limiting simulation
  checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const key = `rate_limit_${identifier}`
    const attempts = JSON.parse(localStorage.getItem(key) || '[]')
    const now = Date.now()
    
    // Clean old attempts
    const validAttempts = attempts.filter((time: number) => now - time < windowMs)
    
    if (validAttempts.length >= maxAttempts) {
      return false // Rate limited
    }
    
    validAttempts.push(now)
    localStorage.setItem(key, JSON.stringify(validAttempts))
    return true
  }
}