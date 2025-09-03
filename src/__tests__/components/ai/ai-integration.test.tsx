import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { aiService } from '@/services/aiService'
import AssistantSelector from '@/components/AssistantSelector'

// Mock AI service
vi.mock('@/services/aiService', () => ({
  aiService: {
    sendMessage: vi.fn(),
    generateResponse: vi.fn(),
    analyzeProgress: vi.fn(),
    switchAssistant: vi.fn(),
    getConversationHistory: vi.fn(),
    clearConversation: vi.fn()
  },
  AVAILABLE_ASSISTANTS: [
    {
      id: 'math_tutor',
      name: 'Professor de Matemática',
      description: 'Especialista em matemática do ensino fundamental e médio',
      expertise: ['álgebra', 'geometria', 'trigonometria'],
      personality: 'paciente',
      greeting: 'Olá! Sou seu professor de matemática. Como posso ajudar?'
    },
    {
      id: 'science_tutor',
      name: 'Professor de Ciências',
      description: 'Especialista em física, química e biologia',
      expertise: ['física', 'química', 'biologia'],
      personality: 'curioso',
      greeting: 'Oi! Vamos explorar o mundo das ciências juntos!'
    }
  ]
}))

// Mock credit context
const mockCreditContext = {
  credits: 10,
  useCredits: vi.fn(),
  purchaseCredits: vi.fn(),
  isLoading: false
}

vi.mock('@/contexts/CreditContext', () => ({
  useCredits: () => mockCreditContext,
  CreditProvider: ({ children }: { children: React.ReactNode }) => children
}))

// Mock analytics context
const mockAnalyticsContext = {
  trackEvent: vi.fn(),
  trackConversation: vi.fn(),
  trackAssistantSwitch: vi.fn()
}

vi.mock('@/contexts/AnalyticsContext', () => ({
  useAnalytics: () => mockAnalyticsContext,
  AnalyticsProvider: ({ children }: { children: React.ReactNode }) => children
}))

describe('AI Assistant Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreditContext.credits = 10
    mockCreditContext.isLoading = false
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AssistantSelector Integration', () => {
    it('should display available assistants correctly', async () => {
      const onSelect = vi.fn()
      
      render(<AssistantSelector onSelect={onSelect} selectedId="math_tutor" />)

      // Check if all assistants are displayed
      expect(screen.getByText('Professor de Matemática')).toBeInTheDocument()
      expect(screen.getByText('Professor de Ciências')).toBeInTheDocument()

      // Check expertise display
      expect(screen.getByText(/álgebra, geometria, trigonometria/i)).toBeInTheDocument()
      expect(screen.getByText(/física, química, biologia/i)).toBeInTheDocument()
    })

    it('should handle assistant selection', async () => {
      const onSelect = vi.fn()
      
      render(<AssistantSelector onSelect={onSelect} selectedId="math_tutor" />)

      const scienceAssistant = screen.getByText('Professor de Ciências')
      await user.click(scienceAssistant)

      expect(onSelect).toHaveBeenCalledWith('science_tutor')
    })

    it('should show selected assistant visually', () => {
      const onSelect = vi.fn()
      
      render(<AssistantSelector onSelect={onSelect} selectedId="math_tutor" />)

      const mathAssistant = screen.getByText('Professor de Matemática').closest('div')
      expect(mathAssistant).toHaveClass('border-blue-500') // Selected state styling
    })
  })

  describe('AIChatInterface Integration', () => {
    const mockConversation = [
      {
        id: '1',
        content: 'Olá! Como posso ajudar com matemática?',
        role: 'assistant' as const,
        timestamp: new Date().toISOString(),
        assistantId: 'math_tutor'
      }
    ]

    beforeEach(() => {
      aiService.getConversationHistory.mockResolvedValue(mockConversation)
    })

    it('should initialize with assistant greeting', async () => {
      render(<AIChatInterface assistantId="math_tutor" />)

      await waitFor(() => {
        expect(screen.getByText(/olá! como posso ajudar com matemática/i)).toBeInTheDocument()
      })
    })

    it('should send message and receive response', async () => {
      const mockResponse = {
        id: '2',
        content: 'Claro! Vamos começar com equações do primeiro grau...',
        role: 'assistant' as const,
        timestamp: new Date().toISOString(),
        assistantId: 'math_tutor',
        metadata: {
          topic: 'álgebra',
          difficulty: 'básico',
          confidence: 0.95
        }
      }

      aiService.sendMessage.mockResolvedValue(mockResponse)

      render(<AIChatInterface assistantId="math_tutor" />)

      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      const sendButton = screen.getByRole('button', { name: /enviar/i })

      await user.type(messageInput, 'Como resolver equações do primeiro grau?')
      await user.click(sendButton)

      // Check if message was sent
      expect(aiService.sendMessage).toHaveBeenCalledWith({
        content: 'Como resolver equações do primeiro grau?',
        assistantId: 'math_tutor'
      })

      // Check if response appears
      await waitFor(() => {
        expect(screen.getByText(/vamos começar com equações do primeiro grau/i)).toBeInTheDocument()
      })

      // Check if credits were consumed
      expect(mockCreditContext.useCredits).toHaveBeenCalledWith(1)

      // Check if analytics tracked
      expect(mockAnalyticsContext.trackConversation).toHaveBeenCalled()
    })

    it('should handle insufficient credits', async () => {
      mockCreditContext.credits = 0

      render(<AIChatInterface assistantId="math_tutor" />)

      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      const sendButton = screen.getByRole('button', { name: /enviar/i })

      await user.type(messageInput, 'Uma pergunta qualquer')

      expect(sendButton).toBeDisabled()
      expect(screen.getByText(/créditos insuficientes/i)).toBeInTheDocument()
      
      const purchaseButton = screen.getByRole('button', { name: /comprar créditos/i })
      await user.click(purchaseButton)

      expect(mockCreditContext.purchaseCredits).toHaveBeenCalled()
    })

    it('should handle AI service errors gracefully', async () => {
      aiService.sendMessage.mockRejectedValue(new Error('AI service unavailable'))

      render(<AIChatInterface assistantId="math_tutor" />)

      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      const sendButton = screen.getByRole('button', { name: /enviar/i })

      await user.type(messageInput, 'Uma pergunta')
      await user.click(sendButton)

      await waitFor(() => {
        expect(screen.getByText(/erro ao processar sua mensagem/i)).toBeInTheDocument()
        expect(screen.getByText(/tente novamente em alguns instantes/i)).toBeInTheDocument()
      })

      // Credits should not be consumed on error
      expect(mockCreditContext.useCredits).not.toHaveBeenCalled()
    })

    it('should switch assistants during conversation', async () => {
      render(<AIChatInterface assistantId="math_tutor" />)

      // Initial assistant greeting
      await waitFor(() => {
        expect(screen.getByText(/olá! como posso ajudar com matemática/i)).toBeInTheDocument()
      })

      // Switch to science assistant
      const assistantSelector = screen.getByRole('combobox', { name: /selecionar assistente/i })
      await user.click(assistantSelector)
      await user.click(screen.getByText('Professor de Ciências'))

      expect(aiService.switchAssistant).toHaveBeenCalledWith('science_tutor')
      expect(mockAnalyticsContext.trackAssistantSwitch).toHaveBeenCalledWith({
        from: 'math_tutor',
        to: 'science_tutor'
      })

      // Should show new assistant greeting
      await waitFor(() => {
        expect(screen.getByText(/vamos explorar o mundo das ciências/i)).toBeInTheDocument()
      })
    })

    it('should show typing indicator during AI response', async () => {
      // Simulate delay in AI response
      aiService.sendMessage.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          id: '2',
          content: 'Resposta demorada...',
          role: 'assistant' as const,
          timestamp: new Date().toISOString(),
          assistantId: 'math_tutor'
        }), 1000))
      )

      render(<AIChatInterface assistantId="math_tutor" />)

      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      const sendButton = screen.getByRole('button', { name: /enviar/i })

      await user.type(messageInput, 'Uma pergunta')
      await user.click(sendButton)

      // Should show typing indicator
      expect(screen.getByText(/assistente está digitando/i)).toBeInTheDocument()
      expect(screen.getByTestId('typing-dots')).toBeInTheDocument()

      // Wait for response
      await waitFor(() => {
        expect(screen.getByText(/resposta demorada/i)).toBeInTheDocument()
      }, { timeout: 2000 })

      // Typing indicator should disappear
      expect(screen.queryByText(/assistente está digitando/i)).not.toBeInTheDocument()
    })

    it('should handle conversation context correctly', async () => {
      const extendedConversation = [
        ...mockConversation,
        {
          id: '2',
          content: 'Como resolver x + 5 = 10?',
          role: 'user' as const,
          timestamp: new Date().toISOString(),
          assistantId: 'math_tutor'
        },
        {
          id: '3',
          content: 'Para resolver x + 5 = 10, subtraia 5 de ambos os lados: x = 5',
          role: 'assistant' as const,
          timestamp: new Date().toISOString(),
          assistantId: 'math_tutor'
        }
      ]

      aiService.getConversationHistory.mockResolvedValue(extendedConversation)

      render(<AIChatInterface assistantId="math_tutor" />)

      // Should display conversation history
      await waitFor(() => {
        expect(screen.getByText(/como resolver x \+ 5 = 10/i)).toBeInTheDocument()
        expect(screen.getByText(/subtraia 5 de ambos os lados/i)).toBeInTheDocument()
      })

      // Send follow-up question
      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      await user.type(messageInput, 'E se fosse x + 3 = 15?')

      const mockFollowUpResponse = {
        id: '4',
        content: 'Similar ao anterior: x + 3 = 15, então x = 12',
        role: 'assistant' as const,
        timestamp: new Date().toISOString(),
        assistantId: 'math_tutor'
      }

      aiService.sendMessage.mockResolvedValue(mockFollowUpResponse)

      const sendButton = screen.getByRole('button', { name: /enviar/i })
      await user.click(sendButton)

      // Should maintain context from previous messages
      expect(aiService.sendMessage).toHaveBeenCalledWith({
        content: 'E se fosse x + 3 = 15?',
        assistantId: 'math_tutor',
        context: extendedConversation
      })
    })

    it('should clear conversation when requested', async () => {
      render(<AIChatInterface assistantId="math_tutor" />)

      await waitFor(() => {
        expect(screen.getByText(/olá! como posso ajudar/i)).toBeInTheDocument()
      })

      const clearButton = screen.getByRole('button', { name: /limpar conversa/i })
      await user.click(clearButton)

      // Should show confirmation dialog
      expect(screen.getByText(/tem certeza que deseja limpar/i)).toBeInTheDocument()

      const confirmButton = screen.getByRole('button', { name: /confirmar/i })
      await user.click(confirmButton)

      expect(aiService.clearConversation).toHaveBeenCalled()

      // Should show fresh greeting
      await waitFor(() => {
        expect(screen.getAllByText(/olá! como posso ajudar/i)).toHaveLength(1)
      })
    })
  })

  describe('AI Assistant Performance Integration', () => {
    it('should handle rapid message sending without conflicts', async () => {
      const responses = [
        { id: '1', content: 'Resposta 1', role: 'assistant' as const, timestamp: new Date().toISOString(), assistantId: 'math_tutor' },
        { id: '2', content: 'Resposta 2', role: 'assistant' as const, timestamp: new Date().toISOString(), assistantId: 'math_tutor' },
        { id: '3', content: 'Resposta 3', role: 'assistant' as const, timestamp: new Date().toISOString(), assistantId: 'math_tutor' }
      ]

      aiService.sendMessage
        .mockResolvedValueOnce(responses[0])
        .mockResolvedValueOnce(responses[1])
        .mockResolvedValueOnce(responses[2])

      render(<AIChatInterface assistantId="math_tutor" />)

      const messageInput = screen.getByPlaceholderText(/digite sua pergunta/i)
      const sendButton = screen.getByRole('button', { name: /enviar/i })

      // Send multiple messages rapidly
      await user.type(messageInput, 'Pergunta 1')
      await user.click(sendButton)

      await user.clear(messageInput)
      await user.type(messageInput, 'Pergunta 2')
      await user.click(sendButton)

      await user.clear(messageInput)
      await user.type(messageInput, 'Pergunta 3')
      await user.click(sendButton)

      // All responses should appear
      await waitFor(() => {
        expect(screen.getByText('Resposta 1')).toBeInTheDocument()
        expect(screen.getByText('Resposta 2')).toBeInTheDocument()
        expect(screen.getByText('Resposta 3')).toBeInTheDocument()
      })

      // Credits should be consumed for each message
      expect(mockCreditContext.useCredits).toHaveBeenCalledTimes(3)
    })
  })
})