import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PaymentFlow } from '@/components/PaymentFlow'
import { PaymentProcessor } from '@/components/PaymentProcessor'
import { CreditSystem } from '@/components/CreditSystem'
import { creditApi } from '@/services/creditApi'

// Mock payment services
vi.mock('@/services/creditApi', () => ({
  creditApi: {
    purchaseCredits: vi.fn(),
    processPayment: vi.fn(),
    validatePayment: vi.fn(),
    getPaymentMethods: vi.fn(),
    getTransactionHistory: vi.fn()
  }
}))

// Mock Stripe
const mockStripe = {
  elements: vi.fn(() => ({
    create: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn(),
      on: vi.fn(),
      destroy: vi.fn()
    })),
    getElement: vi.fn()
  })),
  createToken: vi.fn(),
  createPaymentMethod: vi.fn(),
  confirmCardPayment: vi.fn()
}

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(mockStripe))
}))

// Mock credit context
const mockCreditContext = {
  credits: 5,
  useCredits: vi.fn(),
  purchaseCredits: vi.fn(),
  isLoading: false,
  error: null,
  transactions: []
}

vi.mock('@/contexts/CreditContext', () => ({
  useCredits: () => mockCreditContext,
  CreditProvider: ({ children }: { children: React.ReactNode }) => children
}))

// Mock auth context
const mockAuthContext = {
  user: { 
    id: 'user-123', 
    email: 'test@example.com',
    name: 'Test User'
  },
  isAuthenticated: true
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}))

describe('Payment Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreditContext.credits = 5
    mockCreditContext.isLoading = false
    mockCreditContext.error = null
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('CreditSystem Integration', () => {
    it('should display current credit balance correctly', async () => {
      render(<CreditSystem />)

      expect(screen.getByText('5 créditos')).toBeInTheDocument()
      expect(screen.getByText(/saldo atual/i)).toBeInTheDocument()
    })

    it('should show credit usage breakdown', async () => {
      const mockTransactions = [
        {
          id: '1',
          type: 'usage',
          amount: -2,
          description: 'Chat com Professor de Matemática',
          date: new Date().toISOString()
        },
        {
          id: '2',
          type: 'purchase',
          amount: 10,
          description: 'Compra de créditos',
          date: new Date().toISOString()
        }
      ]

      mockCreditContext.transactions = mockTransactions
      creditApi.getTransactionHistory.mockResolvedValue(mockTransactions)

      render(<CreditSystem />)

      await waitFor(() => {
        expect(screen.getByText(/chat com professor de matemática/i)).toBeInTheDocument()
        expect(screen.getByText(/compra de créditos/i)).toBeInTheDocument()
      })

      expect(screen.getByText('-2')).toBeInTheDocument()
      expect(screen.getByText('+10')).toBeInTheDocument()
    })

    it('should handle credit consumption correctly', async () => {
      mockCreditContext.useCredits.mockResolvedValue({ success: true, remaining: 3 })

      render(<CreditSystem />)

      const useButton = screen.getByRole('button', { name: /usar 1 crédito/i })
      await user.click(useButton)

      expect(mockCreditContext.useCredits).toHaveBeenCalledWith(1)

      await waitFor(() => {
        expect(screen.getByText('3 créditos')).toBeInTheDocument()
      })
    })

    it('should warn when credits are low', () => {
      mockCreditContext.credits = 2

      render(<CreditSystem />)

      expect(screen.getByText(/seus créditos estão acabando/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /comprar mais créditos/i })).toBeInTheDocument()
    })

    it('should prevent usage when no credits available', () => {
      mockCreditContext.credits = 0

      render(<CreditSystem />)

      expect(screen.getByText(/créditos insuficientes/i)).toBeInTheDocument()
      
      const useButton = screen.queryByRole('button', { name: /usar 1 crédito/i })
      expect(useButton).toBeDisabled()
    })
  })

  describe('PaymentProcessor Integration', () => {
    beforeEach(() => {
      creditApi.getPaymentMethods.mockResolvedValue([
        { id: 'credit-5', name: '5 Créditos', price: 9.99, credits: 5 },
        { id: 'credit-10', name: '10 Créditos', price: 18.99, credits: 10 },
        { id: 'credit-25', name: '25 Créditos', price: 44.99, credits: 25 }
      ])
    })

    it('should display available credit packages', async () => {
      render(<PaymentProcessor />)

      await waitFor(() => {
        expect(screen.getByText('5 Créditos')).toBeInTheDocument()
        expect(screen.getByText('R$ 9,99')).toBeInTheDocument()
        expect(screen.getByText('10 Créditos')).toBeInTheDocument()
        expect(screen.getByText('R$ 18,99')).toBeInTheDocument()
        expect(screen.getByText('25 Créditos')).toBeInTheDocument()
        expect(screen.getByText('R$ 44,99')).toBeInTheDocument()
      })
    })

    it('should calculate best value recommendations', async () => {
      render(<PaymentProcessor />)

      await waitFor(() => {
        // 25 credits package should show best value
        const bestValueBadge = screen.getByText(/melhor valor/i)
        expect(bestValueBadge).toBeInTheDocument()
        
        // Should be associated with 25 credits package
        const packageElement = bestValueBadge.closest('[data-testid="credit-package"]')
        expect(packageElement).toHaveTextContent('25 Créditos')
      })
    })

    it('should handle package selection', async () => {
      const onSelect = vi.fn()
      
      render(<PaymentProcessor onPackageSelect={onSelect} />)

      await waitFor(() => {
        const package10 = screen.getByText('10 Créditos').closest('button')
        expect(package10).toBeInTheDocument()
      })

      const package10Button = screen.getByText('10 Créditos').closest('button')
      await user.click(package10Button!)

      expect(onSelect).toHaveBeenCalledWith({
        id: 'credit-10',
        name: '10 Créditos',
        price: 18.99,
        credits: 10
      })
    })

    it('should process payment with Stripe integration', async () => {
      mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: {
          status: 'succeeded',
          id: 'pi_test_123'
        }
      })

      creditApi.processPayment.mockResolvedValue({
        success: true,
        paymentIntent: 'pi_test_123',
        credits: 10
      })

      render(<PaymentProcessor />)

      // Select package
      await waitFor(() => {
        const package10Button = screen.getByText('10 Créditos').closest('button')
        expect(package10Button).toBeInTheDocument()
        user.click(package10Button!)
      })

      // Fill payment form
      const continueButton = screen.getByRole('button', { name: /continuar para pagamento/i })
      await user.click(continueButton)

      // Stripe elements should be mounted
      await waitFor(() => {
        expect(mockStripe.elements).toHaveBeenCalled()
      })

      // Complete payment
      const payButton = screen.getByRole('button', { name: /pagar r\$ 18,99/i })
      await user.click(payButton)

      await waitFor(() => {
        expect(creditApi.processPayment).toHaveBeenCalledWith({
          packageId: 'credit-10',
          paymentMethod: expect.any(Object)
        })
      })

      await waitFor(() => {
        expect(screen.getByText(/pagamento realizado com sucesso/i)).toBeInTheDocument()
        expect(screen.getByText(/10 créditos adicionados/i)).toBeInTheDocument()
      })
    })

    it('should handle payment failures gracefully', async () => {
      mockStripe.confirmCardPayment.mockResolvedValue({
        error: {
          message: 'Your card was declined.',
          type: 'card_error'
        }
      })

      render(<PaymentProcessor />)

      // Select package and proceed to payment
      await waitFor(() => {
        const package5Button = screen.getByText('5 Créditos').closest('button')
        user.click(package5Button!)
      })

      const continueButton = screen.getByRole('button', { name: /continuar para pagamento/i })
      await user.click(continueButton)

      const payButton = screen.getByRole('button', { name: /pagar r\$ 9,99/i })
      await user.click(payButton)

      await waitFor(() => {
        expect(screen.getByText(/seu cartão foi recusado/i)).toBeInTheDocument()
        expect(screen.getByText(/tente outro método de pagamento/i)).toBeInTheDocument()
      })

      // Credits should not be added on failure
      expect(creditApi.purchaseCredits).not.toHaveBeenCalled()
    })

    it('should validate card information', async () => {
      render(<PaymentProcessor />)

      // Select package
      await waitFor(() => {
        const package5Button = screen.getByText('5 Créditos').closest('button')
        user.click(package5Button!)
      })

      const continueButton = screen.getByRole('button', { name: /continuar para pagamento/i })
      await user.click(continueButton)

      // Try to pay without valid card
      const payButton = screen.getByRole('button', { name: /pagar r\$ 9,99/i })
      
      // Payment button should be disabled initially
      expect(payButton).toBeDisabled()

      // Simulate card validation
      const cardElement = screen.getByTestId('stripe-card-element')
      fireEvent.change(cardElement, { 
        complete: true,
        error: null
      })

      await waitFor(() => {
        expect(payButton).not.toBeDisabled()
      })
    })
  })

  describe('PaymentFlow Integration', () => {
    it('should complete full payment workflow', async () => {
      creditApi.getPaymentMethods.mockResolvedValue([
        { id: 'credit-10', name: '10 Créditos', price: 18.99, credits: 10 }
      ])

      mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: { status: 'succeeded', id: 'pi_test_123' }
      })

      creditApi.processPayment.mockResolvedValue({
        success: true,
        paymentIntent: 'pi_test_123',
        credits: 10
      })

      const onSuccess = vi.fn()
      
      render(<PaymentFlow onSuccess={onSuccess} />)

      // Step 1: Package Selection
      await waitFor(() => {
        expect(screen.getByText(/selecione um pacote/i)).toBeInTheDocument()
      })

      const packageButton = screen.getByText('10 Créditos').closest('button')
      await user.click(packageButton!)

      // Step 2: Payment Information
      const continueButton = screen.getByRole('button', { name: /continuar/i })
      await user.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText(/informações de pagamento/i)).toBeInTheDocument()
      })

      // Simulate valid card input
      const cardElement = screen.getByTestId('stripe-card-element')
      fireEvent.change(cardElement, { complete: true })

      // Step 3: Confirmation
      const payButton = screen.getByRole('button', { name: /finalizar pagamento/i })
      await user.click(payButton)

      await waitFor(() => {
        expect(screen.getByText(/processando pagamento/i)).toBeInTheDocument()
      })

      // Step 4: Success
      await waitFor(() => {
        expect(screen.getByText(/pagamento concluído/i)).toBeInTheDocument()
        expect(onSuccess).toHaveBeenCalledWith({
          credits: 10,
          amount: 18.99,
          transactionId: 'pi_test_123'
        })
      })
    })

    it('should allow going back between steps', async () => {
      render(<PaymentFlow />)

      // Go to payment step
      const packageButton = screen.getByText('10 Créditos').closest('button')
      await user.click(packageButton!)

      const continueButton = screen.getByRole('button', { name: /continuar/i })
      await user.click(continueButton)

      // Go back to package selection
      const backButton = screen.getByRole('button', { name: /voltar/i })
      await user.click(backButton)

      await waitFor(() => {
        expect(screen.getByText(/selecione um pacote/i)).toBeInTheDocument()
      })
    })

    it('should save payment preferences', async () => {
      const mockLocalStorage = {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn()
      }
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

      render(<PaymentFlow />)

      // Select save preference
      const savePreferenceCheckbox = screen.getByRole('checkbox', { 
        name: /salvar preferências de pagamento/i 
      })
      await user.click(savePreferenceCheckbox)

      const packageButton = screen.getByText('10 Créditos').closest('button')
      await user.click(packageButton!)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'payment-preferences',
        JSON.stringify({
          preferredPackage: 'credit-10',
          autoSave: true
        })
      )
    })
  })

  describe('Payment Security Integration', () => {
    const originalIsSecureContext = window.isSecureContext

    afterEach(() => {
      // Restore original secure context
      Object.defineProperty(window, 'isSecureContext', { 
        value: originalIsSecureContext,
        configurable: true,
        writable: true
      })
    })

    it('should handle secure payment processing', async () => {
      // Mock secure context
      Object.defineProperty(window, 'isSecureContext', { 
        value: true,
        configurable: true,
        writable: true
      })

      render(<PaymentProcessor />)

      await waitFor(() => {
        expect(screen.getByText(/conexão segura/i)).toBeInTheDocument()
        expect(screen.getByTestId('security-badge')).toBeInTheDocument()
      })
    })

    it('should prevent payment in insecure context', () => {
      Object.defineProperty(window, 'isSecureContext', { 
        value: false,
        configurable: true,
        writable: true
      })

      render(<PaymentProcessor />)

      expect(screen.getByText(/conexão não segura detectada/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pagar/i })).toBeDisabled()
    })

    it('should validate payment amount integrity', async () => {
      const tamperedData = vi.fn()
      creditApi.processPayment.mockImplementation((data) => {
        tamperedData(data)
        return Promise.resolve({ success: false, error: 'Amount mismatch' })
      })

      render(<PaymentProcessor />)

      const packageButton = screen.getByText('10 Créditos').closest('button')
      await user.click(packageButton!)

      const continueButton = screen.getByRole('button', { name: /continuar/i })
      await user.click(continueButton)

      const payButton = screen.getByRole('button', { name: /pagar/i })
      await user.click(payButton)

      await waitFor(() => {
        expect(tamperedData).toHaveBeenCalledWith(
          expect.objectContaining({
            packageId: 'credit-10',
            expectedAmount: 18.99
          })
        )
      })
    })
  })
})