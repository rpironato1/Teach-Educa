import { z } from 'zod'

// User authentication schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().optional().default(false)
})

export const registrationSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras')
    .refine(
      (name) => name.trim().split(/\s+/).length >= 2,
      'Digite seu nome completo'
    ),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter ao menos: 1 maiúscula, 1 minúscula e 1 número'
    ),
  confirmPassword: z.string(),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00')
    .refine(validateCPF, 'CPF inválido'),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000'),
  birthDate: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data deve estar no formato DD/MM/AAAA')
    .refine(
      (date) => {
        const [day, month, year] = date.split('/').map(Number)
        const birthDate = new Date(year, month - 1, day)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        return age >= 13
      },
      'Idade mínima: 13 anos'
    ),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, 'Você deve aceitar os termos e condições')
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Senhas não conferem',
    path: ['confirmPassword']
  }
)

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter ao menos: 1 maiúscula, 1 minúscula e 1 número'
    ),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Senhas não conferem',
    path: ['confirmPassword']
  }
)

// Credit and payment schemas
export const creditPurchaseSchema = z.object({
  planId: z.enum(['inicial', 'intermediario', 'profissional'], {
    errorMap: () => ({ message: 'Plano inválido' })
  }),
  paymentMethodId: z.string().min(1, 'Método de pagamento é obrigatório'),
  billingDetails: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    address: z.object({
      line1: z.string().min(1, 'Endereço é obrigatório'),
      city: z.string().min(1, 'Cidade é obrigatória'),
      state: z.string().min(2, 'Estado é obrigatório'),
      postal_code: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
      country: z.string().default('BR')
    })
  })
})

export const otpValidationSchema = z.object({
  code: z
    .string()
    .length(6, 'Código deve ter exatamente 6 dígitos')
    .regex(/^\d{6}$/, 'Código deve conter apenas números'),
  email: z.string().email('Email inválido')
})

// Analytics and progress schemas
export const studySessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  subject: z.string().min(1, 'Matéria é obrigatória'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number().positive().optional(),
  creditsUsed: z.number().nonnegative(),
  questionsAnswered: z.number().nonnegative(),
  correctAnswers: z.number().nonnegative(),
  accuracy: z.number().min(0).max(100),
  aiInteractions: z.number().nonnegative(),
  achievements: z.array(z.string()).default([])
})

export const achievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  category: z.enum(['streak', 'accuracy', 'participation', 'milestone']),
  points: z.number().positive(),
  iconType: z.string(),
  unlockedAt: z.string().datetime(),
  progress: z.number().min(0).max(100)
})

export const analyticsDataSchema = z.object({
  userId: z.string().uuid(),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  totalStudyTime: z.number().nonnegative(),
  totalCreditsUsed: z.number().nonnegative(),
  averageAccuracy: z.number().min(0).max(100),
  subjectsStudied: z.array(z.string()),
  achievementsEarned: z.array(achievementSchema),
  studyStreak: z.object({
    current: z.number().nonnegative(),
    longest: z.number().nonnegative(),
    lastActiveDate: z.string().datetime()
  }),
  weeklyGoals: z.object({
    targetHours: z.number().positive(),
    completedHours: z.number().nonnegative(),
    progress: z.number().min(0).max(100)
  })
})

// Admin schemas
export const adminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(1),
  role: z.enum(['user', 'admin', 'moderator']),
  status: z.enum(['active', 'inactive', 'suspended']),
  subscription: z.object({
    planId: z.string(),
    status: z.enum(['active', 'cancelled', 'expired']),
    expiresAt: z.string().datetime()
  }).optional(),
  createdAt: z.string().datetime(),
  lastActiveAt: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
})

export const systemMetricsSchema = z.object({
  totalUsers: z.number().nonnegative(),
  activeUsers: z.number().nonnegative(),
  totalStudySessions: z.number().nonnegative(),
  totalCreditsConsumed: z.number().nonnegative(),
  averageSessionDuration: z.number().nonnegative(),
  popularSubjects: z.array(z.object({
    subject: z.string(),
    sessions: z.number().nonnegative()
  })),
  revenueMetrics: z.object({
    totalRevenue: z.number().nonnegative(),
    monthlyRecurring: z.number().nonnegative(),
    conversionRate: z.number().min(0).max(100)
  })
})

// Helper function for CPF validation
function validateCPF(cpf: string): boolean {
  // Remove formatting
  const numbers = cpf.replace(/\D/g, '')
  
  if (numbers.length !== 11) return false
  
  // Check for known invalid patterns
  if (/^(\d)\1+$/.test(numbers)) return false
  
  // Validate check digits
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i)
  }
  let digit1 = 11 - (sum % 11)
  if (digit1 > 9) digit1 = 0
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i)
  }
  let digit2 = 11 - (sum % 11)
  if (digit2 > 9) digit2 = 0
  
  return parseInt(numbers[9]) === digit1 && parseInt(numbers[10]) === digit2
}

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>
export type RegistrationFormData = z.infer<typeof registrationSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type CreditPurchaseData = z.infer<typeof creditPurchaseSchema>
export type OTPValidationData = z.infer<typeof otpValidationSchema>
export type StudySessionData = z.infer<typeof studySessionSchema>
export type AchievementData = z.infer<typeof achievementSchema>
export type AnalyticsData = z.infer<typeof analyticsDataSchema>
export type AdminUserData = z.infer<typeof adminUserSchema>
export type SystemMetricsData = z.infer<typeof systemMetricsSchema>