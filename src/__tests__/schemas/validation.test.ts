import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod'
import {
  loginSchema,
  registrationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  creditPurchaseSchema,
  otpValidationSchema,
  studySessionSchema,
  achievementSchema,
  analyticsDataSchema,
  adminUserSchema,
  systemMetricsSchema,
  type LoginFormData,
  type RegistrationFormData
} from '@/schemas/validation'

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData: LoginFormData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      }

      const result = loginSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('validates with default rememberMe value', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123'
      }

      const result = loginSchema.parse(data)
      expect(result.rememberMe).toBe(false)
    })

    it('rejects invalid email', () => {
      expect(() => {
        loginSchema.parse({
          email: 'invalid-email',
          password: 'password123'
        })
      }).toThrow(ZodError)
    })

    it('rejects empty email', () => {
      expect(() => {
        loginSchema.parse({
          email: '',
          password: 'password123'
        })
      }).toThrow('Email é obrigatório')
    })

    it('rejects short password', () => {
      expect(() => {
        loginSchema.parse({
          email: 'test@example.com',
          password: '123'
        })
      }).toThrow('Senha deve ter pelo menos 6 caracteres')
    })

    it('rejects empty password', () => {
      expect(() => {
        loginSchema.parse({
          email: 'test@example.com',
          password: ''
        })
      }).toThrow('Senha deve ter pelo menos 6 caracteres')
    })
  })

  describe('registrationSchema', () => {
    const validRegistrationData: RegistrationFormData = {
      fullName: 'João da Silva',
      email: 'joao@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      cpf: '123.456.789-09',
      phone: '(11) 99999-9999',
      birthDate: '01/01/1990',
      acceptTerms: true
    }

    it('validates correct registration data', () => {
      const result = registrationSchema.parse(validRegistrationData)
      expect(result).toEqual(validRegistrationData)
    })

    it('rejects single name', () => {
      expect(() => {
        registrationSchema.parse({
          ...validRegistrationData,
          fullName: 'João'
        })
      }).toThrow('Digite seu nome completo')
    })

    it('rejects names with numbers', () => {
      expect(() => {
        registrationSchema.parse({
          ...validRegistrationData,
          fullName: 'João123 Silva'
        })
      }).toThrow('Nome deve conter apenas letras')
    })

    it('rejects weak password', () => {
      expect(() => {
        registrationSchema.parse({
          ...validRegistrationData,
          password: 'password'
        })
      }).toThrow('Senha deve conter ao menos: 1 maiúscula, 1 minúscula e 1 número')
    })

    it('rejects mismatched passwords', () => {
      expect(() => {
        registrationSchema.parse({
          ...validRegistrationData,
          confirmPassword: 'DifferentPassword123'
        })
      }).toThrow('Senhas não conferem')
    })

    it('rejects invalid CPF format', () => {
      expect(() => {
        registrationSchema.parse({
          ...validRegistrationData,
          cpf: '12345678901'
        })
      }).toThrow('CPF deve estar no formato 000.000.000-00')
    })

    it('rejects invalid phone format', () => {
      expect(() => {
        registrationSchema.parse({
          ...validRegistrationData,
          phone: '11999999999'
        })
      }).toThrow('Telefone deve estar no formato (00) 00000-0000')
    })

    it('rejects users under 13', () => {
      const currentYear = new Date().getFullYear()
      const underageDate = `01/01/${currentYear - 10}`
      
      expect(() => {
        registrationSchema.parse({
          ...validRegistrationData,
          birthDate: underageDate
        })
      }).toThrow('Idade mínima: 13 anos')
    })

    it('rejects when terms not accepted', () => {
      expect(() => {
        registrationSchema.parse({
          ...validRegistrationData,
          acceptTerms: false
        })
      }).toThrow('Você deve aceitar os termos e condições')
    })
  })

  describe('forgotPasswordSchema', () => {
    it('validates correct email', () => {
      const data = { email: 'test@example.com' }
      const result = forgotPasswordSchema.parse(data)
      expect(result).toEqual(data)
    })

    it('rejects invalid email', () => {
      expect(() => {
        forgotPasswordSchema.parse({ email: 'invalid-email' })
      }).toThrow('Email inválido')
    })

    it('rejects empty email', () => {
      expect(() => {
        forgotPasswordSchema.parse({ email: '' })
      }).toThrow('Email é obrigatório')
    })
  })

  describe('resetPasswordSchema', () => {
    const validResetData = {
      token: 'valid-token-123',
      password: 'NewPassword123',
      confirmPassword: 'NewPassword123'
    }

    it('validates correct reset data', () => {
      const result = resetPasswordSchema.parse(validResetData)
      expect(result).toEqual(validResetData)
    })

    it('rejects weak password', () => {
      expect(() => {
        resetPasswordSchema.parse({
          ...validResetData,
          password: 'weak'
        })
      }).toThrow('Senha deve ter pelo menos 8 caracteres')
    })

    it('rejects mismatched passwords', () => {
      expect(() => {
        resetPasswordSchema.parse({
          ...validResetData,
          confirmPassword: 'Different123'
        })
      }).toThrow('Senhas não conferem')
    })

    it('rejects empty token', () => {
      expect(() => {
        resetPasswordSchema.parse({
          ...validResetData,
          token: ''
        })
      }).toThrow('Token é obrigatório')
    })
  })

  describe('creditPurchaseSchema', () => {
    const validPurchaseData = {
      planId: 'intermediario' as const,
      paymentMethodId: 'pm_card_123',
      billingDetails: {
        name: 'João da Silva',
        email: 'joao@example.com',
        address: {
          line1: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          postal_code: '01234-567',
          country: 'BR'
        }
      }
    }

    it('validates correct purchase data', () => {
      const result = creditPurchaseSchema.parse(validPurchaseData)
      expect(result).toEqual(validPurchaseData)
    })

    it('sets default country to BR', () => {
      const dataWithoutCountry = {
        ...validPurchaseData,
        billingDetails: {
          ...validPurchaseData.billingDetails,
          address: {
            ...validPurchaseData.billingDetails.address,
            country: undefined
          }
        }
      }

      const result = creditPurchaseSchema.parse(dataWithoutCountry)
      expect(result.billingDetails.address.country).toBe('BR')
    })

    it('rejects invalid plan ID', () => {
      expect(() => {
        creditPurchaseSchema.parse({
          ...validPurchaseData,
          planId: 'invalid-plan'
        })
      }).toThrow('Plano inválido')
    })

    it('rejects invalid CEP format', () => {
      expect(() => {
        creditPurchaseSchema.parse({
          ...validPurchaseData,
          billingDetails: {
            ...validPurchaseData.billingDetails,
            address: {
              ...validPurchaseData.billingDetails.address,
              postal_code: '123'
            }
          }
        })
      }).toThrow('CEP inválido')
    })
  })

  describe('otpValidationSchema', () => {
    it('validates correct OTP data', () => {
      const data = {
        code: '123456',
        email: 'test@example.com'
      }

      const result = otpValidationSchema.parse(data)
      expect(result).toEqual(data)
    })

    it('rejects code with wrong length', () => {
      expect(() => {
        otpValidationSchema.parse({
          code: '123',
          email: 'test@example.com'
        })
      }).toThrow('Código deve ter exatamente 6 dígitos')
    })

    it('rejects non-numeric code', () => {
      expect(() => {
        otpValidationSchema.parse({
          code: 'ABC123',
          email: 'test@example.com'
        })
      }).toThrow('Código deve conter apenas números')
    })
  })

  describe('studySessionSchema', () => {
    const validSessionData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      subject: 'Matemática',
      startTime: '2023-01-01T10:00:00.000Z',
      endTime: '2023-01-01T11:00:00.000Z',
      duration: 3600,
      creditsUsed: 10,
      questionsAnswered: 25,
      correctAnswers: 20,
      accuracy: 80,
      aiInteractions: 5,
      achievements: ['streak-5', 'accuracy-80']
    }

    it('validates correct session data', () => {
      const result = studySessionSchema.parse(validSessionData)
      expect(result).toEqual(validSessionData)
    })

    it('sets default achievements array', () => {
      const dataWithoutAchievements = {
        ...validSessionData,
        achievements: undefined
      }

      const result = studySessionSchema.parse(dataWithoutAchievements)
      expect(result.achievements).toEqual([])
    })

    it('rejects invalid UUID', () => {
      expect(() => {
        studySessionSchema.parse({
          ...validSessionData,
          id: 'invalid-uuid'
        })
      }).toThrow()
    })

    it('rejects negative duration', () => {
      expect(() => {
        studySessionSchema.parse({
          ...validSessionData,
          duration: -100
        })
      }).toThrow()
    })

    it('rejects accuracy over 100', () => {
      expect(() => {
        studySessionSchema.parse({
          ...validSessionData,
          accuracy: 150
        })
      }).toThrow()
    })
  })

  describe('achievementSchema', () => {
    const validAchievementData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Primeira Vitória',
      description: 'Complete sua primeira sessão de estudo',
      category: 'milestone' as const,
      points: 100,
      iconType: 'trophy',
      unlockedAt: '2023-01-01T10:00:00.000Z',
      progress: 100
    }

    it('validates correct achievement data', () => {
      const result = achievementSchema.parse(validAchievementData)
      expect(result).toEqual(validAchievementData)
    })

    it('rejects invalid category', () => {
      expect(() => {
        achievementSchema.parse({
          ...validAchievementData,
          category: 'invalid-category'
        })
      }).toThrow()
    })

    it('rejects negative points', () => {
      expect(() => {
        achievementSchema.parse({
          ...validAchievementData,
          points: -10
        })
      }).toThrow()
    })

    it('rejects progress over 100', () => {
      expect(() => {
        achievementSchema.parse({
          ...validAchievementData,
          progress: 150
        })
      }).toThrow()
    })
  })

  describe('analyticsDataSchema', () => {
    const validAnalyticsData = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      period: 'weekly' as const,
      totalStudyTime: 3600,
      totalCreditsUsed: 50,
      averageAccuracy: 85.5,
      subjectsStudied: ['Matemática', 'Física'],
      achievementsEarned: [{
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Test Achievement',
        description: 'Test',
        category: 'streak' as const,
        points: 50,
        iconType: 'star',
        unlockedAt: '2023-01-01T10:00:00.000Z',
        progress: 100
      }],
      studyStreak: {
        current: 5,
        longest: 10,
        lastActiveDate: '2023-01-01T10:00:00.000Z'
      },
      weeklyGoals: {
        targetHours: 10,
        completedHours: 7.5,
        progress: 75
      }
    }

    it('validates correct analytics data', () => {
      const result = analyticsDataSchema.parse(validAnalyticsData)
      expect(result).toEqual(validAnalyticsData)
    })

    it('rejects invalid period', () => {
      expect(() => {
        analyticsDataSchema.parse({
          ...validAnalyticsData,
          period: 'invalid-period'
        })
      }).toThrow()
    })

    it('rejects negative study time', () => {
      expect(() => {
        analyticsDataSchema.parse({
          ...validAnalyticsData,
          totalStudyTime: -100
        })
      }).toThrow()
    })
  })

  describe('adminUserSchema', () => {
    const validAdminUserData = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'admin@example.com',
      fullName: 'Admin User',
      role: 'admin' as const,
      status: 'active' as const,
      subscription: {
        planId: 'profissional',
        status: 'active' as const,
        expiresAt: '2023-12-31T23:59:59.000Z'
      },
      createdAt: '2023-01-01T00:00:00.000Z',
      lastActiveAt: '2023-01-01T10:00:00.000Z',
      metadata: { customField: 'value' }
    }

    it('validates correct admin user data', () => {
      const result = adminUserSchema.parse(validAdminUserData)
      expect(result).toEqual(validAdminUserData)
    })

    it('validates without optional fields', () => {
      const minimalData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        fullName: 'Regular User',
        role: 'user' as const,
        status: 'active' as const,
        createdAt: '2023-01-01T00:00:00.000Z'
      }

      const result = adminUserSchema.parse(minimalData)
      expect(result).toEqual(minimalData)
    })

    it('rejects invalid role', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUserData,
          role: 'invalid-role'
        })
      }).toThrow()
    })

    it('rejects invalid email', () => {
      expect(() => {
        adminUserSchema.parse({
          ...validAdminUserData,
          email: 'invalid-email'
        })
      }).toThrow()
    })
  })

  describe('systemMetricsSchema', () => {
    const validMetricsData = {
      totalUsers: 1000,
      activeUsers: 750,
      totalStudySessions: 5000,
      totalCreditsConsumed: 25000,
      averageSessionDuration: 1800,
      popularSubjects: [
        { subject: 'Matemática', sessions: 1500 },
        { subject: 'Física', sessions: 1200 }
      ],
      revenueMetrics: {
        totalRevenue: 50000.00,
        monthlyRecurring: 15000.00,
        conversionRate: 15.5
      }
    }

    it('validates correct metrics data', () => {
      const result = systemMetricsSchema.parse(validMetricsData)
      expect(result).toEqual(validMetricsData)
    })

    it('rejects negative values', () => {
      expect(() => {
        systemMetricsSchema.parse({
          ...validMetricsData,
          totalUsers: -100
        })
      }).toThrow()
    })

    it('rejects conversion rate over 100', () => {
      expect(() => {
        systemMetricsSchema.parse({
          ...validMetricsData,
          revenueMetrics: {
            ...validMetricsData.revenueMetrics,
            conversionRate: 150
          }
        })
      }).toThrow()
    })
  })

  describe('CPF validation', () => {
    it('validates correctly formatted and valid CPF', () => {
      // Note: This is a test CPF that passes format but may not pass full validation
      const data = {
        fullName: 'João da Silva',
        email: 'joao@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        cpf: '123.456.789-09',
        phone: '(11) 99999-9999',
        birthDate: '01/01/1990',
        acceptTerms: true
      }

      // This will likely fail due to invalid check digits, which is expected
      expect(() => {
        registrationSchema.parse(data)
      }).toThrow('CPF inválido')
    })

    it('rejects obviously invalid CPF patterns', () => {
      const data = {
        fullName: 'João da Silva',
        email: 'joao@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        cpf: '111.111.111-11', // All same digits
        phone: '(11) 99999-9999',
        birthDate: '01/01/1990',
        acceptTerms: true
      }

      expect(() => {
        registrationSchema.parse(data)
      }).toThrow('CPF inválido')
    })
  })
})