/**
 * AI Service - Sistema de Inteligência Artificial
 * Módulo 6: Múltiplos assistentes especializados com IA neuroadaptativa
 */

export interface Assistant {
  id: string
  name: string
  specialty: string
  description: string
  avatar: string
  color: string
  creditCost: number
  capabilities: string[]
  personality: string
  maxTokens: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  assistantId: string
  creditsCost: number
  metadata?: {
    confidence?: number
    adaptationLevel?: number
    learningStyle?: string
  }
}

export interface LearningProfile {
  userId: string
  preferredStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  interests: string[]
  weakAreas: string[]
  strongAreas: string[]
  adaptationHistory: AdaptationEvent[]
}

export interface AdaptationEvent {
  timestamp: Date
  action: string
  reason: string
  effectiveness: number
}

export interface ProgressAnalysis {
  comprehension: number
  retention: number
  engagement: number
  adaptiveRecommendations: string[]
  nextTopics: string[]
  estimatedTime: number
}

// Assistentes especializados disponíveis
export const AVAILABLE_ASSISTANTS: Assistant[] = [
  {
    id: 'math-tutor',
    name: 'Prof. Magnus',
    specialty: 'Matemática',
    description: 'Especialista em matemática com abordagem neuroadaptativa para todos os níveis',
    avatar: '🔢',
    color: 'primary',
    creditCost: 2,
    capabilities: [
      'Resolução passo a passo',
      'Visualizações interativas',
      'Exercícios adaptativos',
      'Análise de erros comuns'
    ],
    personality: 'Paciente e metódico, explica conceitos complexos de forma simples',
    maxTokens: 2000
  },
  {
    id: 'writing-assistant',
    name: 'Ana Letras',
    specialty: 'Redação e Literatura',
    description: 'Mentora de escrita criativa e análise textual',
    avatar: '✍️',
    color: 'secondary',
    creditCost: 3,
    capabilities: [
      'Revisão e correção',
      'Desenvolvimento de ideias',
      'Análise literária',
      'Técnicas narrativas'
    ],
    personality: 'Criativa e inspiradora, encoraja expressão autêntica',
    maxTokens: 2500
  },
  {
    id: 'programming-coach',
    name: 'Dev Carlos',
    specialty: 'Programação',
    description: 'Coach experiente em desenvolvimento de software',
    avatar: '💻',
    color: 'accent',
    creditCost: 4,
    capabilities: [
      'Code review inteligente',
      'Debugging assistido',
      'Arquitetura de software',
      'Boas práticas'
    ],
    personality: 'Prático e direto, foca em soluções eficientes',
    maxTokens: 3000
  },
  {
    id: 'science-mentor',
    name: 'Dra. Sofia',
    specialty: 'Ciências',
    description: 'Mentora multidisciplinar em ciências naturais',
    avatar: '🔬',
    color: 'destructive',
    creditCost: 3,
    capabilities: [
      'Experimentos virtuais',
      'Explicações visuais',
      'Conexões interdisciplinares',
      'Método científico'
    ],
    personality: 'Curiosa e investigativa, estimula pensamento crítico',
    maxTokens: 2200
  },
  {
    id: 'language-specialist',
    name: 'Mr. Global',
    specialty: 'Idiomas',
    description: 'Especialista poliglota em aprendizagem de idiomas',
    avatar: '🌍',
    color: 'muted',
    creditCost: 3,
    capabilities: [
      'Conversação natural',
      'Correção de pronúncia',
      'Imersão cultural',
      'Gramática contextual'
    ],
    personality: 'Encorajador e multicultural, adapta-se ao nível do aluno',
    maxTokens: 2000
  }
]

class AIService {
  private learningProfiles: Map<string, LearningProfile> = new Map()
  private conversationHistory: Map<string, ChatMessage[]> = new Map()

  /**
   * Inicializa uma conversa com um assistente específico
   */
  async startConversation(
    assistantId: string, 
    userId: string, 
    initialMessage?: string
  ): Promise<ChatMessage[]> {
    const assistant = this.getAssistant(assistantId)
    if (!assistant) {
      throw new Error('Assistente não encontrado')
    }

    const conversationKey = `${userId}-${assistantId}`
    const profile = await this.getLearningProfile(userId)
    
    // Mensagem de sistema para configurar o comportamento do assistente
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      role: 'system',
      content: this.buildSystemPrompt(assistant, profile),
      timestamp: new Date(),
      assistantId,
      creditsCost: 0
    }

    let messages = [systemMessage]

    // Adiciona mensagem inicial se fornecida
    if (initialMessage) {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: initialMessage,
        timestamp: new Date(),
        assistantId,
        creditsCost: 0
      }

      const assistantResponse = await this.generateResponse(
        userMessage,
        assistant,
        profile,
        [systemMessage]
      )

      messages = [systemMessage, userMessage, assistantResponse]
    }

    this.conversationHistory.set(conversationKey, messages)
    return messages.filter(m => m.role !== 'system') // Remove system message do retorno
  }

  /**
   * Envia mensagem para um assistente e recebe resposta neuroadaptativa
   */
  async sendMessage(
    userId: string,
    assistantId: string,
    content: string
  ): Promise<ChatMessage> {
    const assistant = this.getAssistant(assistantId)
    if (!assistant) {
      throw new Error('Assistente não encontrado')
    }

    const profile = await this.getLearningProfile(userId)
    const conversationKey = `${userId}-${assistantId}`
    const history = this.conversationHistory.get(conversationKey) || []

    // Cria mensagem do usuário
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      assistantId,
      creditsCost: 0
    }

    // Gera resposta do assistente
    const assistantResponse = await this.generateResponse(
      userMessage,
      assistant,
      profile,
      history
    )

    // Atualiza histórico
    const updatedHistory = [...history, userMessage, assistantResponse]
    this.conversationHistory.set(conversationKey, updatedHistory)

    // Atualiza perfil de aprendizado baseado na interação
    await this.updateLearningProfile(userId, userMessage, assistantResponse)

    return assistantResponse
  }

  /**
   * Gera resposta do assistente usando IA neuroadaptativa
   */
  private async generateResponse(
    userMessage: ChatMessage,
    assistant: Assistant,
    profile: LearningProfile,
    history: ChatMessage[]
  ): Promise<ChatMessage> {
    // Constrói prompt neuroadaptativo
    const adaptivePrompt = this.buildAdaptivePrompt(
      userMessage.content,
      assistant,
      profile,
      history
    )

    try {
      // Usa a API do Spark para gerar resposta
      const prompt = spark.llmPrompt`${adaptivePrompt}`
      const response = await spark.llm(prompt, 'gpt-4o')

      // Analisa a resposta para extrair metadados
      const metadata = this.analyzeResponse(response, profile)

      return {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        assistantId: assistant.id,
        creditsCost: assistant.creditCost,
        metadata
      }
    } catch (error) {
      console.error('Erro ao gerar resposta do assistente:', error)
      
      return {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
        assistantId: assistant.id,
        creditsCost: 0
      }
    }
  }

  /**
   * Constrói prompt de sistema para configurar o assistente
   */
  private buildSystemPrompt(assistant: Assistant, profile: LearningProfile): string {
    return `Você é ${assistant.name}, ${assistant.description}.

PERSONALIDADE: ${assistant.personality}

ESPECIALIZAÇÃO: ${assistant.specialty}
CAPACIDADES: ${assistant.capabilities.join(', ')}

PERFIL DO ALUNO:
- Estilo de aprendizagem: ${profile.preferredStyle}
- Nível: ${profile.difficulty}
- Áreas fortes: ${profile.strongAreas.join(', ')}
- Áreas de melhoria: ${profile.weakAreas.join(', ')}
- Interesses: ${profile.interests.join(', ')}

INSTRUÇÕES NEUROADAPTATIVAS:
1. Adapte sempre sua linguagem ao estilo de aprendizagem do aluno
2. Use exemplos relevantes aos interesses identificados
3. Reforce áreas fortes e seja paciente com áreas de dificuldade
4. Forneça explicações graduais e verificações de compreensão
5. Mantenha o tom ${assistant.personality}
6. Seja educativo, mas também envolvente e motivador

Responda sempre em português brasileiro, de forma clara e didática.`
  }

  /**
   * Constrói prompt neuroadaptativo para a conversa atual
   */
  private buildAdaptivePrompt(
    userMessage: string,
    assistant: Assistant,
    profile: LearningProfile,
    history: ChatMessage[]
  ): string {
    // Analisa histórico recente para adaptação
    const recentMessages = history.slice(-6).filter(m => m.role !== 'system')
    const adaptationInsights = this.analyzeConversationPattern(recentMessages, profile)

    return `CONTEXTO DA CONVERSA:
${recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

ADAPTAÇÕES NEUROADAPTATIVAS SUGERIDAS:
${adaptationInsights.join('\n')}

MENSAGEM ATUAL DO ALUNO: ${userMessage}

Com base no contexto, perfil do aluno e suas adaptações neuroadaptativas, responda de forma:
- Personalizada ao estilo de aprendizagem
- Adequada ao nível de dificuldade
- Envolvente e motivadora
- Educativamente eficaz

Sua resposta:`
  }

  /**
   * Analisa padrões de conversa para adaptação neuroadaptativa
   */
  private analyzeConversationPattern(
    messages: ChatMessage[],
    profile: LearningProfile
  ): string[] {
    const insights = []

    // Analisa frequência de dúvidas
    const questionCount = messages.filter(m => 
      m.role === 'user' && m.content.includes('?')
    ).length

    if (questionCount > 2) {
      insights.push('- Aluno está fazendo muitas perguntas: simplifique explicações')
    }

    // Analisa comprimento das mensagens do usuário
    const avgUserMessageLength = messages
      .filter(m => m.role === 'user')
      .reduce((sum, m) => sum + m.content.length, 0) / 
      messages.filter(m => m.role === 'user').length

    if (avgUserMessageLength < 50) {
      insights.push('- Mensagens curtas: seja mais direto e conciso')
    } else if (avgUserMessageLength > 200) {
      insights.push('- Mensagens longas: forneça respostas mais detalhadas')
    }

    // Adaptação por estilo de aprendizagem
    switch (profile.preferredStyle) {
      case 'visual':
        insights.push('- Use analogias visuais, diagramas e exemplos gráficos')
        break
      case 'auditory':
        insights.push('- Use explicações verbais claras e repetições estratégicas')
        break
      case 'kinesthetic':
        insights.push('- Sugira atividades práticas e exercícios hands-on')
        break
      case 'reading':
        insights.push('- Forneça listas, resumos e referências textuais')
        break
    }

    return insights
  }

  /**
   * Analisa resposta do assistente para extrair metadados
   */
  private analyzeResponse(response: string, profile: LearningProfile) {
    // Análise simples de confiança baseada no comprimento e estrutura
    const confidence = Math.min(0.9, response.length / 1000)
    
    // Nível de adaptação baseado na personalização
    const adaptationLevel = profile.adaptationHistory.length > 0 ? 0.8 : 0.5

    return {
      confidence,
      adaptationLevel,
      learningStyle: profile.preferredStyle
    }
  }

  /**
   * Atualiza perfil de aprendizagem baseado na interação
   */
  private async updateLearningProfile(
    userId: string,
    userMessage: ChatMessage,
    assistantResponse: ChatMessage
  ): Promise<void> {
    const profile = await this.getLearningProfile(userId)

    // Registra evento de adaptação
    const adaptationEvent: AdaptationEvent = {
      timestamp: new Date(),
      action: `Interação com ${assistantResponse.assistantId}`,
      reason: 'Resposta neuroadaptativa baseada no perfil do usuário',
      effectiveness: assistantResponse.metadata?.confidence || 0.5
    }

    profile.adaptationHistory.push(adaptationEvent)

    // Mantém apenas os últimos 50 eventos
    if (profile.adaptationHistory.length > 50) {
      profile.adaptationHistory = profile.adaptationHistory.slice(-50)
    }

    this.learningProfiles.set(userId, profile)
  }

  /**
   * Obtém perfil de aprendizagem do usuário
   */
  private async getLearningProfile(userId: string): Promise<LearningProfile> {
    if (this.learningProfiles.has(userId)) {
      return this.learningProfiles.get(userId)!
    }

    // Perfil padrão para novos usuários
    const defaultProfile: LearningProfile = {
      userId,
      preferredStyle: 'visual',
      difficulty: 'intermediate',
      interests: ['tecnologia', 'aprendizado'],
      weakAreas: [],
      strongAreas: [],
      adaptationHistory: []
    }

    this.learningProfiles.set(userId, defaultProfile)
    return defaultProfile
  }

  /**
   * Obtém assistente por ID
   */
  getAssistant(assistantId: string): Assistant | undefined {
    return AVAILABLE_ASSISTANTS.find(a => a.id === assistantId)
  }

  /**
   * Lista todos os assistentes disponíveis
   */
  getAvailableAssistants(): Assistant[] {
    return AVAILABLE_ASSISTANTS
  }

  /**
   * Gera conteúdo personalizado
   */
  async generateContent(
    userId: string,
    topic: string,
    contentType: 'lesson' | 'exercise' | 'summary' | 'quiz',
    assistantId?: string
  ): Promise<string> {
    const profile = await this.getLearningProfile(userId)
    const assistant = assistantId ? this.getAssistant(assistantId) : AVAILABLE_ASSISTANTS[0]

    const prompt = spark.llmPrompt`Gere um ${contentType} sobre "${topic}" para um aluno com:
    - Estilo de aprendizagem: ${profile.preferredStyle}
    - Nível: ${profile.difficulty}
    - Interesses: ${profile.interests.join(', ')}
    
    O conteúdo deve ser:
    - Adaptado ao estilo de aprendizagem
    - Adequado ao nível de dificuldade
    - Envolvente e educativo
    - Em português brasileiro
    
    ${assistant ? `Assuma a personalidade de ${assistant.name}: ${assistant.personality}` : ''}
    
    Forneça o conteúdo:`

    try {
      return await spark.llm(prompt, 'gpt-4o')
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error)
      return 'Erro ao gerar conteúdo. Tente novamente.'
    }
  }

  /**
   * Analisa progresso do usuário
   */
  async analyzeProgress(userId: string): Promise<ProgressAnalysis> {
    const profile = await this.getLearningProfile(userId)
    const allConversations = Array.from(this.conversationHistory.entries())
      .filter(([key]) => key.startsWith(userId))
      .flatMap(([, messages]) => messages)

    // Análise básica de progresso
    const totalInteractions = allConversations.filter(m => m.role === 'user').length
    const avgConfidence = allConversations
      .filter(m => m.role === 'assistant' && m.metadata?.confidence)
      .reduce((sum, m) => sum + (m.metadata!.confidence || 0), 0) / 
      allConversations.filter(m => m.role === 'assistant').length || 0.5

    const comprehension = Math.min(0.95, avgConfidence + (totalInteractions * 0.01))
    const retention = Math.min(0.9, comprehension * 0.8 + (profile.adaptationHistory.length * 0.02))
    const engagement = Math.min(0.95, totalInteractions * 0.05)

    return {
      comprehension,
      retention,
      engagement,
      adaptiveRecommendations: [
        'Continue praticando conceitos fundamentais',
        'Explore tópicos relacionados aos seus interesses',
        'Considere aumentar o nível de dificuldade gradualmente'
      ],
      nextTopics: [
        'Conceitos avançados na sua área de interesse',
        'Revisão de tópicos com menor performance',
        'Aplicações práticas dos conhecimentos adquiridos'
      ],
      estimatedTime: Math.max(10, 30 - (engagement * 20)) // Minutos para próximo objetivo
    }
  }

  /**
   * Obtém histórico de conversa
   */
  getConversationHistory(userId: string, assistantId: string): ChatMessage[] {
    const conversationKey = `${userId}-${assistantId}`
    return this.conversationHistory.get(conversationKey)?.filter(m => m.role !== 'system') || []
  }

  /**
   * Limpa histórico de conversa
   */
  clearConversationHistory(userId: string, assistantId: string): void {
    const conversationKey = `${userId}-${assistantId}`
    this.conversationHistory.delete(conversationKey)
  }

  /**
   * Calcula custo em créditos para uma operação
   */
  calculateCreditCost(operation: 'chat' | 'generate' | 'analyze', assistantId?: string): number {
    if (operation === 'chat' && assistantId) {
      const assistant = this.getAssistant(assistantId)
      return assistant?.creditCost || 2
    }
    
    const baseCosts = {
      chat: 2,
      generate: 3,
      analyze: 1
    }
    
    return baseCosts[operation]
  }
}

// Instância singleton do serviço de IA
export const aiService = new AIService()

// API endpoints simulados para integração
export const aiAPI = {
  // POST /api/ai/chat
  async chat(userId: string, assistantId: string, message: string) {
    return await aiService.sendMessage(userId, assistantId, message)
  },

  // POST /api/ai/generate-content  
  async generateContent(
    userId: string, 
    topic: string, 
    type: 'lesson' | 'exercise' | 'summary' | 'quiz',
    assistantId?: string
  ) {
    return await aiService.generateContent(userId, topic, type, assistantId)
  },

  // GET /api/ai/assistants
  async getAssistants() {
    return aiService.getAvailableAssistants()
  },

  // POST /api/ai/analyze-progress
  async analyzeProgress(userId: string) {
    return await aiService.analyzeProgress(userId)
  }
}