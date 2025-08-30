import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  aiService, 
  aiAPI, 
  AVAILABLE_ASSISTANTS,
  type Assistant as _Assistant,
  type ChatMessage as _ChatMessage,
  type LearningProfile as _LearningProfile,
  type ProgressAnalysis as _ProgressAnalysis 
} from '@/services/aiService'

// Mock window.spark
const mockSpark = {
  llm: vi.fn(),
  llmPrompt: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => {
    return strings.reduce((result, string, i) => {
      return result + string + (values[i] || '')
    }, '')
  })
}

Object.defineProperty(window, 'spark', {
  value: mockSpark,
  writable: true
})

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear service state
    aiService['learningProfiles'].clear()
    aiService['conversationHistory'].clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('AVAILABLE_ASSISTANTS', () => {
    it('has correct number of assistants', () => {
      expect(AVAILABLE_ASSISTANTS).toHaveLength(5)
    })

    it('all assistants have required properties', () => {
      AVAILABLE_ASSISTANTS.forEach(assistant => {
        expect(assistant).toHaveProperty('id')
        expect(assistant).toHaveProperty('name')
        expect(assistant).toHaveProperty('specialty')
        expect(assistant).toHaveProperty('description')
        expect(assistant).toHaveProperty('avatar')
        expect(assistant).toHaveProperty('color')
        expect(assistant).toHaveProperty('creditCost')
        expect(assistant).toHaveProperty('capabilities')
        expect(assistant).toHaveProperty('personality')
        expect(assistant).toHaveProperty('maxTokens')
        
        expect(typeof assistant.id).toBe('string')
        expect(typeof assistant.creditCost).toBe('number')
        expect(Array.isArray(assistant.capabilities)).toBe(true)
        expect(assistant.creditCost).toBeGreaterThan(0)
        expect(assistant.maxTokens).toBeGreaterThan(0)
      })
    })

    it('has unique assistant IDs', () => {
      const ids = AVAILABLE_ASSISTANTS.map(a => a.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('getAssistant', () => {
    it('returns assistant by ID', () => {
      const assistant = aiService.getAssistant('math-tutor')
      expect(assistant).toBeDefined()
      expect(assistant!.id).toBe('math-tutor')
      expect(assistant!.name).toBe('Prof. Magnus')
    })

    it('returns undefined for non-existent assistant', () => {
      const assistant = aiService.getAssistant('non-existent')
      expect(assistant).toBeUndefined()
    })
  })

  describe('getAvailableAssistants', () => {
    it('returns all available assistants', () => {
      const assistants = aiService.getAvailableAssistants()
      expect(assistants).toEqual(AVAILABLE_ASSISTANTS)
      expect(assistants).toHaveLength(5)
    })
  })

  describe('startConversation', () => {
    it('starts conversation with valid assistant', async () => {
      const messages = await aiService.startConversation('math-tutor', 'user123')
      
      expect(messages).toHaveLength(0) // No initial message, system message filtered out
    })

    it('starts conversation with initial message', async () => {
      mockSpark.llm.mockResolvedValueOnce('Hello! I\'m Prof. Magnus, ready to help with math!')
      
      const messages = await aiService.startConversation(
        'math-tutor', 
        'user123', 
        'I need help with algebra'
      )
      
      expect(messages).toHaveLength(2) // User message + assistant response
      expect(messages[0].role).toBe('user')
      expect(messages[0].content).toBe('I need help with algebra')
      expect(messages[1].role).toBe('assistant')
      expect(messages[1].assistantId).toBe('math-tutor')
    })

    it('throws error for invalid assistant', async () => {
      await expect(aiService.startConversation('invalid-assistant', 'user123'))
        .rejects.toThrow('Assistente não encontrado')
    })

    it('uses fallback when API fails', async () => {
      mockSpark.llm.mockRejectedValueOnce(new Error('API Error'))
      
      const messages = await aiService.startConversation(
        'math-tutor', 
        'user123', 
        'Help with math'
      )
      
      expect(messages).toHaveLength(2)
      expect(messages[1].content).toContain('⚠️ *Nota: API de IA indisponível')
    })
  })

  describe('sendMessage', () => {
    it('sends message and receives response', async () => {
      mockSpark.llm.mockResolvedValueOnce('Great question about math! Let me explain...')
      
      const response = await aiService.sendMessage('user123', 'math-tutor', 'Explain calculus')
      
      expect(response.role).toBe('assistant')
      expect(response.assistantId).toBe('math-tutor')
      expect(response.creditsCost).toBe(2) // math-tutor cost
      expect(response.content).toBe('Great question about math! Let me explain...')
    })

    it('throws error for invalid assistant', async () => {
      await expect(aiService.sendMessage('user123', 'invalid', 'Hello'))
        .rejects.toThrow('Assistente não encontrado')
    })

    it('updates conversation history', async () => {
      mockSpark.llm.mockResolvedValueOnce('Response from assistant')
      
      await aiService.sendMessage('user123', 'math-tutor', 'First message')
      const history1 = aiService.getConversationHistory('user123', 'math-tutor')
      expect(history1).toHaveLength(2) // user + assistant
      
      await aiService.sendMessage('user123', 'math-tutor', 'Second message')
      const history2 = aiService.getConversationHistory('user123', 'math-tutor')
      expect(history2).toHaveLength(4) // 2 previous + user + assistant
    })

    it('falls back when API is not available', async () => {
      // Mock window.spark as undefined
      Object.defineProperty(window, 'spark', { value: undefined, writable: true })
      
      const response = await aiService.sendMessage('user123', 'math-tutor', 'Test message')
      
      expect(response.content).toContain('⚠️ *Nota: API de IA indisponível')
      expect(response.metadata?.confidence).toBe(0.7)
      
      // Restore mock
      Object.defineProperty(window, 'spark', { value: mockSpark, writable: true })
    })
  })

  describe('generateContent', () => {
    const testCases = [
      { type: 'lesson' as const, topic: 'Algebra' },
      { type: 'exercise' as const, topic: 'Physics' },
      { type: 'summary' as const, topic: 'History' },
      { type: 'quiz' as const, topic: 'Chemistry' }
    ]

    testCases.forEach(({ type, topic }) => {
      it(`generates ${type} content for ${topic}`, async () => {
        mockSpark.llm.mockResolvedValueOnce(`Generated ${type} content for ${topic}`)
        
        const content = await aiService.generateContent('user123', topic, type)
        
        expect(content).toBe(`Generated ${type} content for ${topic}`)
        expect(mockSpark.llm).toHaveBeenCalledOnce()
      })
    })

    it('generates content with specific assistant', async () => {
      mockSpark.llm.mockResolvedValueOnce('Math lesson by Prof. Magnus')
      
      const content = await aiService.generateContent(
        'user123', 
        'Calculus', 
        'lesson', 
        'math-tutor'
      )
      
      expect(content).toBe('Math lesson by Prof. Magnus')
    })

    it('falls back when API fails', async () => {
      mockSpark.llm.mockRejectedValueOnce(new Error('API Error'))
      
      const content = await aiService.generateContent('user123', 'Math', 'lesson')
      
      expect(content).toContain('# Lição: Math')
      expect(content).toContain('⚠️ *Conteúdo simulado - API de IA indisponível*')
    })

    it('generates different fallback content for each type', async () => {
      // Mock API as unavailable
      Object.defineProperty(window, 'spark', { value: undefined, writable: true })
      
      const lesson = await aiService.generateContent('user123', 'Test', 'lesson')
      const exercise = await aiService.generateContent('user123', 'Test', 'exercise')
      const summary = await aiService.generateContent('user123', 'Test', 'summary')
      const quiz = await aiService.generateContent('user123', 'Test', 'quiz')
      
      expect(lesson).toContain('# Lição: Test')
      expect(exercise).toContain('# Exercício: Test')
      expect(summary).toContain('# Resumo: Test')
      expect(quiz).toContain('# Quiz: Test')
      
      // Restore mock
      Object.defineProperty(window, 'spark', { value: mockSpark, writable: true })
    })
  })

  describe('analyzeProgress', () => {
    it('analyzes user progress with default values', async () => {
      const progress = await aiService.analyzeProgress('user123')
      
      expect(progress).toHaveProperty('comprehension')
      expect(progress).toHaveProperty('retention')
      expect(progress).toHaveProperty('engagement')
      expect(progress).toHaveProperty('adaptiveRecommendations')
      expect(progress).toHaveProperty('nextTopics')
      expect(progress).toHaveProperty('estimatedTime')
      
      expect(progress.comprehension).toBeGreaterThanOrEqual(0)
      expect(progress.comprehension).toBeLessThanOrEqual(1)
      expect(Array.isArray(progress.adaptiveRecommendations)).toBe(true)
      expect(Array.isArray(progress.nextTopics)).toBe(true)
    })

    it('analyzes progress with conversation history', async () => {
      // Create some conversation history
      mockSpark.llm.mockResolvedValue('Test response')
      await aiService.sendMessage('user123', 'math-tutor', 'Question 1')
      await aiService.sendMessage('user123', 'math-tutor', 'Question 2')
      
      const progress = await aiService.analyzeProgress('user123')
      
      expect(progress.engagement).toBeGreaterThan(0)
      expect(progress.comprehension).toBeGreaterThan(0)
    })
  })

  describe('calculateCreditCost', () => {
    it('calculates cost for chat with specific assistant', () => {
      const mathCost = aiService.calculateCreditCost('chat', 'math-tutor')
      expect(mathCost).toBe(2)
      
      const writingCost = aiService.calculateCreditCost('chat', 'writing-assistant')
      expect(writingCost).toBe(3)
      
      const programmingCost = aiService.calculateCreditCost('chat', 'programming-coach')
      expect(programmingCost).toBe(4)
    })

    it('calculates base cost for operations without assistant', () => {
      expect(aiService.calculateCreditCost('chat')).toBe(2)
      expect(aiService.calculateCreditCost('generate')).toBe(3)
      expect(aiService.calculateCreditCost('analyze')).toBe(1)
    })

    it('returns default cost for unknown assistant', () => {
      const cost = aiService.calculateCreditCost('chat', 'unknown-assistant')
      expect(cost).toBe(2)
    })
  })

  describe('getConversationHistory', () => {
    it('returns empty array for new conversation', () => {
      const history = aiService.getConversationHistory('user123', 'math-tutor')
      expect(history).toEqual([])
    })

    it('returns conversation history after messages', async () => {
      mockSpark.llm.mockResolvedValueOnce('Response 1')
      mockSpark.llm.mockResolvedValueOnce('Response 2')
      
      await aiService.sendMessage('user123', 'math-tutor', 'Message 1')
      await aiService.sendMessage('user123', 'math-tutor', 'Message 2')
      
      const history = aiService.getConversationHistory('user123', 'math-tutor')
      expect(history).toHaveLength(4) // 2 user + 2 assistant messages
      expect(history[0].role).toBe('user')
      expect(history[1].role).toBe('assistant')
    })

    it('filters out system messages', async () => {
      await aiService.startConversation('math-tutor', 'user123', 'Initial message')
      
      const history = aiService.getConversationHistory('user123', 'math-tutor')
      const systemMessages = history.filter(m => m.role === 'system')
      expect(systemMessages).toHaveLength(0)
    })
  })

  describe('clearConversationHistory', () => {
    it('clears conversation history', async () => {
      mockSpark.llm.mockResolvedValueOnce('Response')
      
      await aiService.sendMessage('user123', 'math-tutor', 'Test message')
      expect(aiService.getConversationHistory('user123', 'math-tutor')).toHaveLength(2)
      
      aiService.clearConversationHistory('user123', 'math-tutor')
      expect(aiService.getConversationHistory('user123', 'math-tutor')).toHaveLength(0)
    })
  })

  describe('learning profile management', () => {
    it('creates default profile for new users', async () => {
      mockSpark.llm.mockResolvedValueOnce('Response')
      
      await aiService.sendMessage('new-user', 'math-tutor', 'Hello')
      
      // Profile should be created internally (we can't access it directly, but we can test behavior)
      const progress = await aiService.analyzeProgress('new-user')
      expect(progress).toBeDefined()
    })

    it('updates learning profile after interactions', async () => {
      mockSpark.llm.mockResolvedValueOnce('Response with high confidence')
      
      await aiService.sendMessage('user123', 'math-tutor', 'Complex question')
      
      const progress1 = await aiService.analyzeProgress('user123')
      
      // Send more messages to build adaptation history
      mockSpark.llm.mockResolvedValue('More responses')
      await aiService.sendMessage('user123', 'math-tutor', 'Another question')
      await aiService.sendMessage('user123', 'math-tutor', 'Yet another question')
      
      const progress2 = await aiService.analyzeProgress('user123')
      
      // Progress should be different after more interactions
      expect(progress2.engagement).toBeGreaterThan(progress1.engagement)
    })
  })

  describe('adaptive prompting', () => {
    it('builds different prompts for different learning styles', async () => {
      // This tests the internal prompt building logic through behavior
      mockSpark.llm.mockResolvedValue('Adaptive response')
      
      const response = await aiService.sendMessage('user123', 'math-tutor', 'Explain derivatives')
      
      expect(mockSpark.llm).toHaveBeenCalledOnce()
      expect(response.metadata?.learningStyle).toBe('visual') // Default profile
    })

    it('analyzes conversation patterns', async () => {
      mockSpark.llm.mockResolvedValue('Pattern-aware response')
      
      // Send multiple short messages to trigger pattern analysis
      await aiService.sendMessage('user123', 'math-tutor', 'Yes')
      await aiService.sendMessage('user123', 'math-tutor', 'Ok')
      await aiService.sendMessage('user123', 'math-tutor', 'Got it')
      
      // The pattern analysis should affect the next response
      const response = await aiService.sendMessage('user123', 'math-tutor', 'More?')
      
      expect(response).toBeDefined()
      expect(response.role).toBe('assistant')
    })
  })

  describe('error handling', () => {
    it('handles API errors gracefully', async () => {
      mockSpark.llm.mockRejectedValueOnce(new Error('Network timeout'))
      
      const response = await aiService.sendMessage('user123', 'math-tutor', 'Test')
      
      expect(response.content).toContain('⚠️ *Nota: API de IA indisponível')
      expect(response.role).toBe('assistant')
    })

    it('logs errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockSpark.llm.mockRejectedValueOnce(new Error('Test error'))
      
      await aiService.sendMessage('user123', 'math-tutor', 'Test')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro ao gerar resposta do assistente:',
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('aiAPI endpoints', () => {
    it('chat endpoint calls aiService.sendMessage', async () => {
      mockSpark.llm.mockResolvedValueOnce('API Response')
      
      const result = await aiAPI.chat('user123', 'math-tutor', 'Test message')
      
      expect(result.role).toBe('assistant')
      expect(result.content).toBe('API Response')
    })

    it('generateContent endpoint calls aiService.generateContent', async () => {
      mockSpark.llm.mockResolvedValueOnce('Generated lesson content')
      
      const result = await aiAPI.generateContent('user123', 'Math', 'lesson', 'math-tutor')
      
      expect(result).toBe('Generated lesson content')
    })

    it('getAssistants endpoint returns available assistants', async () => {
      const result = await aiAPI.getAssistants()
      
      expect(result).toEqual(AVAILABLE_ASSISTANTS)
    })

    it('analyzeProgress endpoint calls aiService.analyzeProgress', async () => {
      const result = await aiAPI.analyzeProgress('user123')
      
      expect(result).toHaveProperty('comprehension')
      expect(result).toHaveProperty('retention')
      expect(result).toHaveProperty('engagement')
    })
  })

  describe('message metadata', () => {
    it('includes metadata in assistant responses', async () => {
      mockSpark.llm.mockResolvedValueOnce('Response with metadata')
      
      const response = await aiService.sendMessage('user123', 'math-tutor', 'Test')
      
      expect(response.metadata).toBeDefined()
      expect(response.metadata).toHaveProperty('confidence')
      expect(response.metadata).toHaveProperty('adaptationLevel')
      expect(response.metadata).toHaveProperty('learningStyle')
      
      expect(response.metadata!.confidence).toBeGreaterThanOrEqual(0)
      expect(response.metadata!.confidence).toBeLessThanOrEqual(1)
    })

    it('generates unique message IDs', async () => {
      mockSpark.llm.mockResolvedValue('Response')
      
      const response1 = await aiService.sendMessage('user123', 'math-tutor', 'Message 1')
      const response2 = await aiService.sendMessage('user123', 'math-tutor', 'Message 2')
      
      expect(response1.id).not.toBe(response2.id)
      expect(response1.id).toMatch(/^assistant-\d+-\d+$/)
      expect(response2.id).toMatch(/^assistant-\d+-\d+$/)
    })

    it('includes timestamps', async () => {
      mockSpark.llm.mockResolvedValueOnce('Response')
      
      const beforeTime = new Date()
      const response = await aiService.sendMessage('user123', 'math-tutor', 'Test')
      const afterTime = new Date()
      
      expect(response.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(response.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime())
    })
  })
})