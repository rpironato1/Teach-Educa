import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AIChatInterface } from '@/components/AIChatInterface'
import { PaymentProcessor } from '@/components/PaymentProcessor'
import { DashboardDemo } from '@/components/DashboardDemo'

// Component that throws error for testing
const ErrorThrowingComponent = ({ shouldThrow = false, errorType = 'generic' }) => {
  if (shouldThrow) {
    switch (errorType) {
      case 'network':
        throw new Error('Network request failed')
      case 'auth':
        throw new Error('Authentication failed')
      case 'payment':
        throw new Error('Payment processing failed')
      case 'ai':
        throw new Error('AI service unavailable')
      default:
        throw new Error('Something went wrong')
    }
  }
  return <div>Component working correctly</div>
}

// Mock error reporting service
const mockErrorReporting = {
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn()
}

vi.mock('@/services/errorReporting', () => ({
  errorReporting: mockErrorReporting
}))

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = vi.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('Error Boundary and Resilience Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ErrorBoundary Component', () => {
    it('should catch and display generic errors', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument()
      expect(screen.getByText(/recarregar página/i)).toBeInTheDocument()
      expect(mockErrorReporting.captureException).toHaveBeenCalled()
    })

    it('should display context-specific error messages', () => {
      render(
        <ErrorBoundary fallbackType="ai">
          <ErrorThrowingComponent shouldThrow={true} errorType="ai" />
        </ErrorBoundary>
      )

      expect(screen.getByText(/assistente indisponível/i)).toBeInTheDocument()
      expect(screen.getByText(/tente novamente/i)).toBeInTheDocument()
    })

    it('should provide retry functionality', async () => {
      const user = userEvent.setup()
      let shouldThrow = true

      const RetryableComponent = () => {
        if (shouldThrow) {
          throw new Error('Temporary error')
        }
        return <div>Success after retry</div>
      }

      render(
        <ErrorBoundary>
          <RetryableComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument()

      const retryButton = screen.getByRole('button', { name: /tentar novamente/i })
      
      // Simulate fixing the error
      shouldThrow = false
      
      await user.click(retryButton)

      expect(screen.getByText('Success after retry')).toBeInTheDocument()
    })

    it('should track error context and user actions', () => {
      render(
        <ErrorBoundary userId="user-123" currentPage="/dashboard">
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(mockErrorReporting.addBreadcrumb).toHaveBeenCalledWith({
        category: 'ui',
        message: 'Error boundary triggered',
        data: {
          userId: 'user-123',
          currentPage: '/dashboard'
        }
      })
    })

    it('should handle errors during error reporting', () => {
      mockErrorReporting.captureException.mockImplementation(() => {
        throw new Error('Error reporting failed')
      })

      // Should not cause infinite loop or crash
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument()
    })
  })

  describe('Network Failure Scenarios', () => {
    beforeEach(() => {
      // Mock fetch to simulate network failures
      global.fetch = vi.fn()
    })

    it('should handle timeout errors in AI service', async () => {
      const user = userEvent.setup()
      
      // Simulate timeout
      global.fetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      )

      render(
        <ErrorBoundary fallbackType="ai">
          <AIChatInterface assistantId="math_tutor" />
        </ErrorBoundary>
      )

      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      const sendButton = screen.getByRole('button', { name: /enviar/i })

      await user.type(messageInput, 'Test question')
      await user.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/conexão lenta/i)).toBeInTheDocument()
        expect(screen.getByText(/verificar sua internet/i)).toBeInTheDocument()
      })
    })

    it('should handle 500 server errors gracefully', async () => {
      const user = userEvent.setup()

      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      })

      render(
        <ErrorBoundary fallbackType="payment">
          <PaymentProcessor />
        </ErrorBoundary>
      )

      const packageButton = screen.getByText('10 Créditos').closest('button')
      await user.click(packageButton!)

      await waitFor(() => {
        expect(screen.getByText(/servidor temporariamente indisponível/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument()
      })
    })

    it('should handle connection drops during payment', async () => {
      const user = userEvent.setup()

      // First request succeeds, second fails
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ packages: [] })
        })
        .mockRejectedValue(new Error('Network error'))

      render(
        <ErrorBoundary fallbackType="payment">
          <PaymentProcessor />
        </ErrorBoundary>
      )

      const packageButton = screen.getByText('5 Créditos').closest('button')
      await user.click(packageButton!)

      const continueButton = screen.getByRole('button', { name: /continuar/i })
      await user.click(continueButton)

      await waitFor(() => {
        expect(screen.getByText(/conexão perdida/i)).toBeInTheDocument()
        expect(screen.getByText(/não foi processado/i)).toBeInTheDocument()
      })
    })

    it('should implement exponential backoff for retries', async () => {
      const user = userEvent.setup()
      const mockFetch = vi.fn()
      global.fetch = mockFetch

      // Fail first 3 times, succeed on 4th
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        })

      render(
        <ErrorBoundary>
          <AIChatInterface assistantId="math_tutor" />
        </ErrorBoundary>
      )

      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      const sendButton = screen.getByRole('button', { name: /enviar/i })

      await user.type(messageInput, 'Test question')
      await user.click(sendButton)

      // Should show retry with increasing delays
      await waitFor(() => {
        expect(screen.getByText(/tentativa 1 de 3/i)).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText(/tentativa 2 de 3/i)).toBeInTheDocument()
      }, { timeout: 3000 })

      await waitFor(() => {
        expect(screen.getByText(/tentativa 3 de 3/i)).toBeInTheDocument()
      }, { timeout: 5000 })

      // Finally succeeds
      await waitFor(() => {
        expect(screen.getByText(/sucesso/i)).toBeInTheDocument()
      }, { timeout: 8000 })

      expect(mockFetch).toHaveBeenCalledTimes(4)
    })
  })

  describe('Invalid Response Handling', () => {
    it('should handle malformed JSON responses', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Unexpected token in JSON')
        }
      })

      render(
        <ErrorBoundary>
          <DashboardDemo />
        </ErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText(/dados corrompidos/i)).toBeInTheDocument()
        expect(screen.getByText(/recarregar/i)).toBeInTheDocument()
      })
    })

    it('should validate response schemas', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          // Missing required fields
          invalidData: true
        })
      })

      render(
        <ErrorBoundary>
          <AIChatInterface assistantId="math_tutor" />
        </ErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText(/resposta inválida do servidor/i)).toBeInTheDocument()
      })
    })

    it('should handle empty or null responses', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => null
      })

      render(
        <ErrorBoundary>
          <PaymentProcessor />
        </ErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText(/resposta vazia/i)).toBeInTheDocument()
      })
    })
  })

  describe('Browser Compatibility Edge Cases', () => {
    it('should handle localStorage unavailability', () => {
      const originalLocalStorage = window.localStorage
      
      // Mock localStorage to throw errors
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => {
            throw new Error('localStorage is not available')
          }),
          setItem: vi.fn(() => {
            throw new Error('localStorage is not available')
          })
        },
        writable: true
      })

      render(
        <ErrorBoundary>
          <DashboardDemo />
        </ErrorBoundary>
      )

      expect(screen.getByText(/armazenamento local indisponível/i)).toBeInTheDocument()
      expect(screen.getByText(/funcionalidade limitada/i)).toBeInTheDocument()

      // Restore
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      })
    })

    it('should handle unsupported browser features', () => {
      const originalFetch = window.fetch
      const originalPromise = window.Promise

      // Remove modern features
      delete window.fetch
      delete window.Promise

      render(
        <ErrorBoundary>
          <AIChatInterface assistantId="math_tutor" />
        </ErrorBoundary>
      )

      expect(screen.getByText(/navegador não suportado/i)).toBeInTheDocument()
      expect(screen.getByText(/atualize seu navegador/i)).toBeInTheDocument()

      // Restore
      window.fetch = originalFetch
      window.Promise = originalPromise
    })

    it('should handle reduced motion preferences', () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn(() => ({
          matches: true, // User prefers reduced motion
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        }))
      })

      render(
        <ErrorBoundary>
          <DashboardDemo />
        </ErrorBoundary>
      )

      // Should disable animations and transitions
      const animatedElements = screen.queryAllByTestId('animated-element')
      animatedElements.forEach(element => {
        expect(element).toHaveClass('reduce-motion')
      })
    })
  })

  describe('Memory Leak Prevention', () => {
    it('should cleanup event listeners on error', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      // Error boundary should clean up any listeners it added
      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalled()
      
      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })

    it('should cancel pending requests on error', () => {
      const abortController = new AbortController()
      const abortSpy = vi.spyOn(abortController, 'abort')

      global.fetch.mockImplementation(() => {
        // Simulate error that should trigger cleanup
        setTimeout(() => {
          throw new Error('Component unmounted')
        }, 100)
        
        return new Promise(() => {}) // Never resolves
      })

      const { unmount } = render(
        <ErrorBoundary>
          <AIChatInterface assistantId="math_tutor" />
        </ErrorBoundary>
      )

      // Trigger error by unmounting
      unmount()

      expect(abortSpy).toHaveBeenCalled()
    })

    it('should handle large object cleanup', () => {
      const originalGC = global.gc
      const mockGC = vi.fn()
      global.gc = mockGC

      // Component with large data that should be cleaned up
      const LargeDataComponent = () => {
        new Array(1000000).fill('data')
        return <div>Large data component</div>
      }

      const { unmount } = render(
        <ErrorBoundary>
          <LargeDataComponent />
        </ErrorBoundary>
      )

      unmount()

      // Should trigger garbage collection
      if (mockGC) {
        expect(mockGC).toHaveBeenCalled()
      }

      global.gc = originalGC
    })
  })

  describe('Error Recovery Strategies', () => {
    it('should implement circuit breaker pattern', async () => {
      const user = userEvent.setup()
      let failureCount = 0

      global.fetch.mockImplementation(() => {
        failureCount++
        if (failureCount <= 3) {
          return Promise.reject(new Error('Service unavailable'))
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true })
        })
      })

      render(
        <ErrorBoundary>
          <AIChatInterface assistantId="math_tutor" />
        </ErrorBoundary>
      )

      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      const sendButton = screen.getByRole('button', { name: /enviar/i })

      // First 3 attempts should fail and trigger circuit breaker
      for (let i = 0; i < 3; i++) {
        await user.type(messageInput, `Question ${i + 1}`)
        await user.click(sendButton)
        await user.clear(messageInput)
      }

      await waitFor(() => {
        expect(screen.getByText(/serviço temporariamente bloqueado/i)).toBeInTheDocument()
        expect(sendButton).toBeDisabled()
      })

      // After timeout, should allow retry
      await waitFor(() => {
        expect(sendButton).not.toBeDisabled()
      }, { timeout: 10000 })
    })

    it('should provide fallback UI for specific features', () => {
      render(
        <ErrorBoundary fallbackType="ai">
          <ErrorThrowingComponent shouldThrow={true} errorType="ai" />
        </ErrorBoundary>
      )

      expect(screen.getByText(/modo offline ativado/i)).toBeInTheDocument()
      expect(screen.getByText(/funcionalidades básicas disponíveis/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continuar sem ia/i })).toBeInTheDocument()
    })

    it('should implement graceful degradation', async () => {
      const user = userEvent.setup()

      // Simulate partial service availability
      global.fetch.mockImplementation((url) => {
        if (url.includes('/ai/')) {
          return Promise.reject(new Error('AI service down'))
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true })
        })
      })

      render(
        <ErrorBoundary>
          <DashboardDemo />
        </ErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText(/assistente indisponível/i)).toBeInTheDocument()
        expect(screen.getByText(/outras funcionalidades funcionando/i)).toBeInTheDocument()
      })

      // Non-AI features should still work
      const historyButton = screen.getByRole('button', { name: /histórico/i })
      await user.click(historyButton)

      expect(screen.getByText(/histórico de estudos/i)).toBeInTheDocument()
    })
  })
})