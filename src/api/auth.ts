/**
 * Authentication API endpoints for TeacH platform
 * Simulates real backend integration for user registration and authentication
 */

export interface RegisterRequest {
  fullName: string
  email: string
  cpf: string
  phone: string
  password: string
  acceptedTerms: boolean
  acceptedPrivacy: boolean
  marketingOptIn: boolean
}

export interface RegisterResponse {
  success: boolean
  userId: string
  message: string
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
  verified: boolean
}

export interface SubscribeRequest {
  userId: string
  planId: string
  paymentMethod: 'credit_card' | 'pix' | 'boleto'
  paymentData?: any
}

export interface SubscribeResponse {
  success: boolean
  subscriptionId: string
  activatedAt: string
  message: string
}

// Simulated delay to mimic real API calls
const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms))

// Simulated storage for demo purposes
const userDatabase = new Map<string, any>()
const verificationCodes = new Map<string, string>()

/**
 * POST /api/register
 * Register a new user account
 */
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  await simulateDelay(1500)
  
  // Validate required fields
  if (!data.email || !data.fullName || !data.cpf || !data.password) {
    throw new Error('Campos obrigatórios não preenchidos')
  }
  
  // Check if email already exists
  const existingUser = Array.from(userDatabase.values())
    .find(user => user.email === data.email)
  
  if (existingUser) {
    throw new Error('Email já cadastrado no sistema')
  }
  
  // Generate user ID
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Store user data
  userDatabase.set(userId, {
    ...data,
    userId,
    createdAt: new Date().toISOString(),
    emailVerified: false,
    status: 'pending_verification'
  })
  
  // Generate verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
  verificationCodes.set(data.email, verificationCode)
  
  // Simulate sending verification email
  console.log(`[EMAIL] Código de verificação para ${data.email}: ${verificationCode}`)
  
  return {
    success: true,
    userId,
    message: 'Usuário criado com sucesso. Código de verificação enviado por email.'
  }
}

/**
 * POST /api/verify-email
 * Verify user email with code
 */
export const verifyEmail = async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  await simulateDelay(1000)
  
  const storedCode = verificationCodes.get(data.email)
  
  if (!storedCode) {
    throw new Error('Código de verificação não encontrado ou expirado')
  }
  
  if (storedCode !== data.code) {
    throw new Error('Código de verificação inválido')
  }
  
  // Find and update user
  const user = Array.from(userDatabase.values())
    .find(user => user.email === data.email)
  
  if (user) {
    user.emailVerified = true
    user.status = 'email_verified'
    userDatabase.set(user.userId, user)
  }
  
  // Remove used verification code
  verificationCodes.delete(data.email)
  
  return {
    success: true,
    verified: true,
    message: 'Email verificado com sucesso!'
  }
}

/**
 * POST /api/subscribe
 * Subscribe user to a plan
 */
export const subscribeUser = async (data: SubscribeRequest): Promise<SubscribeResponse> => {
  await simulateDelay(2000)
  
  const user = userDatabase.get(data.userId)
  
  if (!user) {
    throw new Error('Usuário não encontrado')
  }
  
  if (!user.emailVerified) {
    throw new Error('Email deve ser verificado antes da assinatura')
  }
  
  // Generate subscription ID
  const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Simulate payment processing based on method
  let paymentStatus = 'pending'
  
  switch (data.paymentMethod) {
    case 'credit_card':
      paymentStatus = 'completed'
      break
    case 'pix':
      paymentStatus = 'pending_pix'
      break
    case 'boleto':
      paymentStatus = 'pending_boleto'
      break
  }
  
  // Update user with subscription
  user.subscription = {
    id: subscriptionId,
    planId: data.planId,
    status: paymentStatus,
    createdAt: new Date().toISOString(),
    activatedAt: paymentStatus === 'completed' ? new Date().toISOString() : null,
    paymentMethod: data.paymentMethod
  }
  user.status = 'subscribed'
  
  userDatabase.set(data.userId, user)
  
  return {
    success: true,
    subscriptionId,
    activatedAt: user.subscription.activatedAt || 'Pending payment',
    message: paymentStatus === 'completed' 
      ? 'Assinatura ativada com sucesso!' 
      : 'Assinatura criada. Aguardando confirmação do pagamento.'
  }
}

/**
 * POST /api/resend-verification
 * Resend verification email
 */
export const resendVerificationCode = async (email: string): Promise<{ success: boolean, message: string }> => {
  await simulateDelay(1000)
  
  const user = Array.from(userDatabase.values())
    .find(user => user.email === email)
  
  if (!user) {
    throw new Error('Usuário não encontrado')
  }
  
  if (user.emailVerified) {
    throw new Error('Email já foi verificado')
  }
  
  // Generate new verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
  verificationCodes.set(email, verificationCode)
  
  // Simulate sending verification email
  console.log(`[EMAIL] Novo código de verificação para ${email}: ${verificationCode}`)
  
  return {
    success: true,
    message: 'Novo código de verificação enviado!'
  }
}

/**
 * Utility function to get user by email (for testing)
 */
export const getUserByEmail = (email: string) => {
  return Array.from(userDatabase.values())
    .find(user => user.email === email)
}

/**
 * Utility function to clear test data
 */
export const clearTestData = () => {
  userDatabase.clear()
  verificationCodes.clear()
}