import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import LoginForm from '@/components/auth/LoginForm'
import { useAuth } from '@/contexts/AuthContext'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

describe('LoginForm', () => {
  const mockLogin = vi.fn()
  const mockOnForgotPassword = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as any).mockReturnValue({
      login: mockLogin,
      isLoading: false
    })
  })

  it('renders all form elements correctly', () => {
    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /manter-me conectado/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /esqueceu sua senha/i })).toBeInTheDocument()
  })

  it('displays demo account information', () => {
    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText(/contas de demonstração/i)).toBeInTheDocument()
    expect(screen.getByText(/admin@teach.com/i)).toBeInTheDocument()
    expect(screen.getByText(/user@teach.com/i)).toBeInTheDocument()
  })

  it('validates email field correctly', async () => {
    const user = userEvent.setup()
    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    // Submit without email first to verify validation works
    await user.click(submitButton)
    expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument()

    // Now test invalid email with valid password
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    
    // Clear both fields
    await user.clear(emailInput)
    await user.clear(passwordInput)
    
    // Type invalid email and valid password
    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'validpassword123')
    
    // Verify the values are set correctly
    expect(emailInput).toHaveValue('invalid-email')
    expect(passwordInput).toHaveValue('validpassword123')
    
    // Submit form to trigger validation
    await user.click(submitButton)
    
    // Debug: Check if login was called
    console.log('Login mock calls:', mockLogin.mock.calls.length)
    
    // Wait for validation errors to appear
    await waitFor(() => {
      // Debug: Check what errors exist
      const allText = document.body.textContent || ''
      console.log('All text in body after waitFor:', allText.substring(0, 500))
      
      // The validation should catch the invalid email and display error
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })
    
    // The login function should NOT be called because validation failed
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('validates password field correctly', async () => {
    const user = userEvent.setup()
    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    // Valid email but no password
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)
    
    expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument()

    // Password too short
    const passwordInput = screen.getByLabelText(/senha/i)
    await user.type(passwordInput, '123')
    await user.click(submitButton)
    
    expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    const passwordInput = screen.getByLabelText(/senha/i)
    const toggleButton = screen.getByRole('button', { name: '' })
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('handles remember me checkbox', async () => {
    const user = userEvent.setup()
    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    const checkbox = screen.getByRole('checkbox', { name: /manter-me conectado/i })
    
    expect(checkbox).not.toBeChecked()
    
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('clears errors when user starts typing', async () => {
    const user = userEvent.setup()
    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })
    
    // Trigger validation error
    await user.click(submitButton)
    expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument()
    
    // Start typing should clear error
    await user.type(emailInput, 't')
    expect(screen.queryByText(/email é obrigatório/i)).not.toBeInTheDocument()
  })

  it('calls login function with correct parameters on successful submission', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })

    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /manter-me conectado/i })
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(rememberMeCheckbox)
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', true)
    })
  })

  it('shows success toast and calls onSuccess when login succeeds', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })

    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Login realizado com sucesso'))
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('shows error toast when login fails', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' })

    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })

  it('handles MFA requirement', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: false, requiresMFA: true })

    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('Verificação de duas etapas necessária. Verifique seu email.')
    })
  })

  it('calls onForgotPassword when forgot password link is clicked', async () => {
    const user = userEvent.setup()
    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    const forgotPasswordButton = screen.getByRole('button', { name: /esqueceu sua senha/i })
    await user.click(forgotPasswordButton)

    expect(mockOnForgotPassword).toHaveBeenCalled()
  })

  it('disables form elements when loading', () => {
    ;(useAuth as any).mockReturnValue({
      login: mockLogin,
      isLoading: true
    })

    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    expect(screen.getByLabelText(/senha/i)).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: /manter-me conectado/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
  })

  it('shows loading state in submit button', () => {
    ;(useAuth as any).mockReturnValue({
      login: mockLogin,
      isLoading: true
    })

    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText(/entrando.../i)).toBeInTheDocument()
    expect(screen.queryByText(/entrar$/i)).not.toBeInTheDocument()
  })
})