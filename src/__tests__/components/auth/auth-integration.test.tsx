import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthFlow } from '@/components/AuthFlow'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegistrationFlow } from '@/components/RegistrationFlow'
import { SessionManager } from '@/components/auth/SessionManager'

// Mock contexts
const mockAuthContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  isLoading: false,
  error: null
}

const mockCreditContext = {
  credits: 0,
  purchaseCredits: vi.fn(),
  useCredits: vi.fn(),
  isLoading: false
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}))

vi.mock('@/contexts/CreditContext', () => ({
  useCredits: () => mockCreditContext,
  CreditProvider: ({ children }: { children: React.ReactNode }) => children
}))

// Mock window.spark
Object.defineProperty(window, 'spark', {
  value: {
    llm: vi.fn(),
    llmPrompt: vi.fn()
  },
  writable: true
})

describe('Auth Component Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.user = null
    mockAuthContext.isLoading = false
    mockAuthContext.error = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('LoginForm Integration', () => {
    it('should handle complete login flow with validation', async () => {
      const onSuccess = vi.fn()
      mockAuthContext.login.mockResolvedValue({ success: true })

      render(<LoginForm onSuccess={onSuccess} />)

      // Test email validation
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      // Invalid email
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
      })

      // Valid credentials
      await user.clear(emailInput)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'validpassword123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAuthContext.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'validpassword123'
        })
      })

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it('should handle login errors appropriately', async () => {
      mockAuthContext.login.mockRejectedValue(new Error('Invalid credentials'))

      render(<LoginForm onSuccess={vi.fn()} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument()
      })
    })

    it('should show loading state during authentication', async () => {
      mockAuthContext.isLoading = true

      render(<LoginForm onSuccess={vi.fn()} />)

      const submitButton = screen.getByRole('button', { name: /entrar/i })
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/carregando/i)).toBeInTheDocument()
    })
  })

  describe('RegistrationFlow Integration', () => {
    it('should handle multi-step registration process', async () => {
      mockAuthContext.register.mockResolvedValue({ success: true })

      render(<RegistrationFlow />)

      // Step 1: Personal Information
      const nameInput = screen.getByLabelText(/nome completo/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/senha/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)

      await user.type(nameInput, 'João Silva')
      await user.type(emailInput, 'joao@example.com')
      await user.type(passwordInput, 'SecurePass123!')
      await user.type(confirmPasswordInput, 'SecurePass123!')

      const nextButton = screen.getByRole('button', { name: /próximo/i })
      await user.click(nextButton)

      // Step 2: Educational Information
      await waitFor(() => {
        expect(screen.getByText(/informações educacionais/i)).toBeInTheDocument()
      })

      const gradeSelect = screen.getByRole('combobox', { name: /série/i })
      await user.click(gradeSelect)
      await user.click(screen.getByText('9º Ano'))

      const subjectCheckbox = screen.getByRole('checkbox', { name: /matemática/i })
      await user.click(subjectCheckbox)

      const finishButton = screen.getByRole('button', { name: /finalizar cadastro/i })
      await user.click(finishButton)

      await waitFor(() => {
        expect(mockAuthContext.register).toHaveBeenCalledWith({
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'SecurePass123!',
          grade: '9º Ano',
          subjects: ['matemática']
        })
      })
    })

    it('should validate password strength requirements', async () => {
      render(<RegistrationFlow />)

      const passwordInput = screen.getByLabelText(/senha/i)

      // Weak password
      await user.type(passwordInput, '123')
      
      await waitFor(() => {
        expect(screen.getByText(/senha deve ter pelo menos 8 caracteres/i)).toBeInTheDocument()
      })

      // Medium password
      await user.clear(passwordInput)
      await user.type(passwordInput, 'password123')
      
      await waitFor(() => {
        expect(screen.getByText(/adicione caracteres especiais para maior segurança/i)).toBeInTheDocument()
      })

      // Strong password
      await user.clear(passwordInput)
      await user.type(passwordInput, 'SecurePass123!')
      
      await waitFor(() => {
        expect(screen.getByText(/senha forte/i)).toBeInTheDocument()
      })
    })

    it('should handle CPF validation correctly', async () => {
      render(<RegistrationFlow />)

      const cpfInput = screen.getByLabelText(/cpf/i)

      // Invalid CPF
      await user.type(cpfInput, '123.456.789-00')
      
      await waitFor(() => {
        expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument()
      })

      // Valid CPF
      await user.clear(cpfInput)
      await user.type(cpfInput, '123.456.789-09')
      
      await waitFor(() => {
        expect(screen.queryByText(/cpf inválido/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('SessionManager Integration', () => {
    it('should manage authentication state correctly', async () => {
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        token: 'valid-token',
        user: { id: '1', email: 'test@example.com' },
        expiresAt: Date.now() + 3600000 // 1 hour from now
      }))

      render(<SessionManager />)

      await waitFor(() => {
        expect(mockAuthContext.user).toBeTruthy()
      })
    })

    it('should handle token expiration', async () => {
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

      // Expired token
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        token: 'expired-token',
        user: { id: '1', email: 'test@example.com' },
        expiresAt: Date.now() - 3600000 // 1 hour ago
      }))

      render(<SessionManager />)

      await waitFor(() => {
        expect(mockAuthContext.logout).toHaveBeenCalled()
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth')
      })
    })
  })

  describe('AuthFlow Integration', () => {
    it('should switch between login and registration modes', async () => {
      render(<AuthFlow />)

      // Default to login
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()

      // Switch to registration
      const registerLink = screen.getByText(/criar conta/i)
      await user.click(registerLink)

      await waitFor(() => {
        expect(screen.getByText(/informações pessoais/i)).toBeInTheDocument()
      })

      // Switch back to login
      const loginLink = screen.getByText(/já tem conta/i)
      await user.click(loginLink)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
      })
    })

    it('should handle social login integration', async () => {
      render(<AuthFlow />)

      const googleButton = screen.getByRole('button', { name: /continuar com google/i })
      await user.click(googleButton)

      // Should trigger social auth flow
      expect(mockAuthContext.login).toHaveBeenCalledWith({
        provider: 'google'
      })
    })
  })
})