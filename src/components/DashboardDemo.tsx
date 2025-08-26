import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  ArrowLeft, 
  Star, 
  ChartLine,
  Clock,
  Medal,
  Lightbulb,
  BookOpen,
  Target,
  Zap,
  TrendUp,
  Calendar,
  Award,
  Lightning,
  Fire,
  CheckCircle,
  Crown,
  Rocket,
  PaperPlaneTilt,
  FileText,
  Download,
  Upload,
  MagnifyingGlass,
  Play,
  Pause,
  Stop,
  Microphone,
  Eye,
  EyeSlash,
  CaretDown,
  Wallet,
  User,
  Gear,
  ChatCircle,
  Books,
  ClockCounterClockwise,
  FloppyDisk,
  Export,
  SpeakerHigh,
  FileArrowUp,
  Command,
  Hash,
  Sparkle,
  Timer,
  Circle,
  CircleNotch,
  Archive,
  CurrencyDollar,
  Robot,
  Trash,
  FilePdf,
  FileDoc,
  Copy,
  Check,
  Question,
  Sparkles
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { useKV } from '@github/spark/hooks'
import { useAuth } from '@/contexts/AuthContext'
import CreditDashboard from '@/components/CreditDashboard'
import CreditWidget from '@/components/CreditWidget'
import PaymentFlow from '@/components/PaymentFlow'
import SubscriptionManager from '@/components/SubscriptionManager'
import { useCredit } from '@/contexts/CreditContext'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import AnalyticsWidget from '@/components/AnalyticsWidget'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import AnalyticsOverview from '@/components/AnalyticsOverview'
import AchievementSystem from '@/components/AchievementSystem'
import CompetitiveLeaderboard from '@/components/CompetitiveLeaderboard'
import ProgressAnalytics from '@/components/ProgressAnalytics'
import { toast } from 'sonner'
import AIChatInterface from '@/components/AIChatInterface'
import AssistantSelector from '@/components/AssistantSelector'
import ContentGenerator from '@/components/ContentGenerator'
import { aiService, type Assistant, AVAILABLE_ASSISTANTS } from '@/services/aiService'

interface DashboardDemoProps {
  onBackToHome: () => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  credits?: number
  assistant?: string
  blocks?: ContentBlock[]
}

interface ContentBlock {
  id: string
  type: 'text' | 'code' | 'formula' | 'definition'
  content: string
  title?: string
}

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messageCount: number
  assistant: string
  credits: number
}

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  level: 'Iniciante' | 'Intermediário' | 'Avançado'
  subject: string
  completed: boolean
  progress: number
}

interface StudySession {
  id: string
  date: Date
  duration: number
  credits: number
  assistant: string
  focus: boolean
}

export default function DashboardDemo({ onBackToHome }: DashboardDemoProps) {
  const { user } = useAuth()
  const { startStudySession, endStudySession, checkAchievements } = useAnalytics()
  const [activeTab, setActiveTab] = useState('chat')
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant>(AVAILABLE_ASSISTANTS[0])
  const [focusMode, setFocusMode] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [copiedText, setCopiedText] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  // Credit system state
  const [showPaymentFlow, setShowPaymentFlow] = useState(false)
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false)
  const { 
    consumeCredits, 
    checkCreditSufficiency, 
    getCreditCost, 
    balance,
    currentPlan 
  } = useCredit()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionInterval = useRef<NodeJS.Timeout>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Persistent data
  const [conversations, setConversations] = useKV<Conversation[]>('conversations', [])
  const [messages, setMessages] = useKV<ChatMessage[]>('current-messages', [])
  const [studySessions, setStudySessions] = useKV<StudySession[]>('study-sessions', [])
  const [completedLessons, setCompletedLessons] = useKV<string[]>('completed-lessons', [])

  // Sample lessons
  const lessons: Lesson[] = [
    {
      id: '1',
      title: 'Introdução à Álgebra Linear',
      description: 'Conceitos básicos de vetores e matrizes',
      duration: '45 min',
      level: 'Iniciante',
      subject: 'Matemática',
      completed: true,
      progress: 100
    },
    {
      id: '2', 
      title: 'Leis de Newton Explicadas',
      description: 'Compreenda as três leis fundamentais da física',
      duration: '60 min',
      level: 'Intermediário',
      subject: 'Física',
      completed: false,
      progress: 65
    },
    {
      id: '3',
      title: 'Análise de Textos Literários',
      description: 'Técnicas de interpretação e análise crítica',
      duration: '50 min',
      level: 'Avançado',
      subject: 'Literatura',
      completed: false,
      progress: 30
    }
  ]

  // Session timer effect
  useEffect(() => {
    if (sessionActive) {
      sessionInterval.current = setInterval(() => {
        setSessionTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (sessionInterval.current) {
        clearInterval(sessionInterval.current)
      }
    }

    return () => {
      if (sessionInterval.current) {
        clearInterval(sessionInterval.current)
      }
    }
  }, [sessionActive])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return

    const assistant = AVAILABLE_ASSISTANTS.find(a => a.id === selectedAssistant.id)!
    
    // Check if user has enough credits before proceeding
    if (!checkCreditSufficiency(assistant.creditsPerMessage)) {
      toast.error('Créditos insuficientes para esta conversa')
      setShowPaymentFlow(true)
      return
    }

    // Start analytics session if not already active
    if (!sessionActive) {
      setSessionActive(true)
      await startStudySession(assistant.specialization, currentMessage.substring(0, 50))
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
      assistant: selectedAssistant.id
    }

    setMessages((current) => [...current, userMessage])
    setCurrentMessage('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(async () => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: generateAIResponse(currentMessage, assistant),
        timestamp: new Date(),
        credits: assistant.creditsPerMessage,
        assistant: selectedAssistant.id,
        blocks: generateContentBlocks(currentMessage)
      }

      setMessages((current) => [...current, assistantMessage])
      
      // Consume credits using our new system
      const success = await consumeCredits(
        assistant.creditsPerMessage, 
        `Conversa com ${assistant.name}`
      )
      
      setIsTyping(false)

      if (speechEnabled) {
        speakText(assistantMessage.content)
      }

      if (success) {
        toast.success(`Resposta gerada! (-${assistant.creditsPerMessage} créditos)`)
        // Check for achievements after each interaction
        await checkAchievements()
      }
    }, 2000)
  }

  const generateAIResponse = (question: string, assistant: Assistant) => {
    const responses = {
      'maria': [
        'Vou explicar esse conceito matemático de forma clara e estruturada.',
        'Essa é uma excelente pergunta sobre matemática! Vamos resolver passo a passo.',
        'Para entender melhor, vou dividir a explicação em partes menores.'
      ],
      'carlos': [
        'Interessante fenômeno científico! Vamos analisar os princípios envolvidos.',
        'Essa observação mostra um conceito importante da ciência. Deixe-me explicar.',
        'Vou demonstrar isso com exemplos práticos do dia a dia.'
      ],
      'ana': [
        'Que texto rico em significados! Vamos fazer uma análise detalhada.',
        'Essa questão linguística tem várias camadas de interpretação.',
        'Vou explicar as técnicas narrativas presentes neste trecho.'
      ],
      'pedro': [
        'Esse período histórico é fascinante! Vou contextualizar os eventos.',
        'Excelente pergunta sobre história! Vamos analisar as causas e consequências.',
        'Para entender melhor, vou relacionar com outros eventos da época.'
      ]
    }

    const assistantResponses = responses[assistant.id as keyof typeof responses] || responses.maria
    return assistantResponses[Math.floor(Math.random() * assistantResponses.length)]
  }

  const generateContentBlocks = (question: string): ContentBlock[] => {
    if (question.toLowerCase().includes('fórmula') || question.toLowerCase().includes('equação')) {
      return [
        {
          id: 'block-1',
          type: 'formula',
          title: 'Fórmula Principal',
          content: 'E = mc²'
        },
        {
          id: 'block-2',
          type: 'definition',
          title: 'Definição',
          content: 'A energia (E) é igual à massa (m) multiplicada pelo quadrado da velocidade da luz (c).'
        }
      ]
    }

    return [
      {
        id: 'block-1',
        type: 'text',
        title: 'Conceito Principal',
        content: 'Este é o conceito fundamental que você precisa entender para avançar nos estudos.'
      }
    ]
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    toast.success('Texto copiado!')
    setTimeout(() => setCopiedText(''), 2000)
  }

  const startNewConversation = () => {
    if (messages.length > 0) {
      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        title: messages[0]?.content.substring(0, 50) + '...' || 'Nova Conversa',
        lastMessage: messages[messages.length - 1]?.content || '',
        timestamp: new Date(),
        messageCount: messages.length,
        assistant: selectedAssistant,
        credits: messages.filter(m => m.credits).reduce((sum, m) => sum + (m.credits || 0), 0)
      }
      
      setConversations((current) => [newConversation, ...current])
    }
    
    setMessages([])
    toast.success('Nova conversa iniciada!')
  }

  const toggleSession = async () => {
    if (sessionActive) {
      // End session
      const session: StudySession = {
        id: `session-${Date.now()}`,
        date: new Date(),
        duration: sessionTime,
        credits: messages.filter(m => m.credits).reduce((sum, m) => sum + (m.credits || 0), 0),
        assistant: selectedAssistant,
        focus: focusMode
      }
      
      setStudySessions((current) => [session, ...current])
      
      // End analytics session
      await endStudySession(85, 'Sessão completa com IA') // 85% score as example
      
      setSessionTime(0)
      toast.success(`Sessão finalizada! Duração: ${formatTime(sessionTime)}`)
    } else {
      // Start analytics session
      await startStudySession(selectedAssistant.subject || 'Geral', 'Conversa com IA')
      toast.success('Sessão de estudos iniciada!')
    }
    
    setSessionActive(!sessionActive)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          toast.success(`Arquivo "${file.name}" carregado com sucesso!`)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const exportConversation = (format: 'pdf' | 'doc') => {
    toast.success(`Exportando conversa em formato ${format.toUpperCase()}...`)
    setShowExportDialog(false)
  }

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Função para consumir créditos
  const handleCreditConsumption = async (credits: number, description: string = 'Uso de funcionalidade') => {
    const success = await consumeCredits(credits, description)
    if (!success) {
      // Show upgrade prompt if user doesn't have enough credits
      setShowPaymentFlow(true)
    }
    return success
  }

  // Função para mudança de assistente
  const handleAssistantChange = (assistant: Assistant) => {
    setSelectedAssistant(assistant)
    toast.success(`Assistente alterado para ${assistant.name}`)
  }

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${focusMode ? 'bg-muted/20' : ''}`}>
      {/* Header */}
      <header className={`border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300 ${focusMode ? 'opacity-50 hover:opacity-100' : ''}`}>
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToHome}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" weight="duotone" />
              <div>
                <h1 className="font-semibold text-lg">TeacH Dashboard</h1>
                <p className="text-xs text-muted-foreground">Bem-vindo, {user?.fullName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Session Timer */}
            <div className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2">
              <Timer className="h-4 w-4 text-primary" />
              <span className="font-mono text-sm">{formatTime(sessionTime)}</span>
              <Button
                size="sm"
                variant={sessionActive ? "destructive" : "default"}
                onClick={toggleSession}
                className="ml-2"
              >
                {sessionActive ? <Stop className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
            </div>

            {/* Credits */}
            <CreditWidget 
              compact={true}
              onManageCredits={() => setShowSubscriptionManager(true)}
              onUpgrade={() => setShowPaymentFlow(true)}
            />

            {/* Focus Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Eye className={`h-4 w-4 ${focusMode ? 'text-muted-foreground' : 'text-foreground'}`} />
              <Switch
                checked={focusMode}
                onCheckedChange={setFocusMode}
              />
              <EyeSlash className={`h-4 w-4 ${focusMode ? 'text-foreground' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={`border-r border-border bg-card transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'} ${focusMode ? 'opacity-30 hover:opacity-100' : ''}`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              {!sidebarCollapsed && (
                <h2 className="font-semibold text-lg">Navegação</h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <CaretDown className={`h-4 w-4 transition-transform ${sidebarCollapsed ? 'rotate-90' : ''}`} />
              </Button>
            </div>

            {!sidebarCollapsed && (
              <>
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="chat" className="text-xs">
                      <ChatCircle className="h-3 w-3" />
                    </TabsTrigger>
                    <TabsTrigger value="content" className="text-xs">
                      <Sparkle className="h-3 w-3" />
                    </TabsTrigger>
                    <TabsTrigger value="lessons" className="text-xs">
                      <Books className="h-3 w-3" />
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs">
                      <ChartLine className="h-3 w-3" />
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs">
                      <ClockCounterClockwise className="h-3 w-3" />
                    </TabsTrigger>
                    <TabsTrigger value="credits" className="text-xs">
                      <CurrencyDollar className="h-3 w-3" />
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="text-xs">
                      <User className="h-3 w-3" />
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="space-y-4 mt-4">
                    <AssistantSelector
                      selectedAssistant={selectedAssistant}
                      onAssistantSelect={handleAssistantChange}
                    />
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4 mt-4">
                    <ContentGenerator
                      selectedAssistant={selectedAssistant}
                      onCreditConsumption={handleCreditConsumption}
                    />
                  </TabsContent>

                  <TabsContent value="lessons" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">Biblioteca de Lições</h3>
                      {lessons.map((lesson) => (
                        <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">{lesson.title}</h4>
                              {lesson.completed && (
                                <CheckCircle className="h-4 w-4 text-secondary" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {lesson.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs">
                                  {lesson.level}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {lesson.duration}
                                </span>
                              </div>
                              {!lesson.completed && (
                                <Progress value={lesson.progress} className="w-16 h-2" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4 mt-4">
                    <div className="max-h-96 overflow-y-auto space-y-4">
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 text-xs">
                          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
                          <TabsTrigger value="ranking">Ranking</TabsTrigger>
                          <TabsTrigger value="progress">Progresso</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="mt-2">
                          <AnalyticsOverview className="scale-90 origin-top transform" />
                        </TabsContent>
                        
                        <TabsContent value="achievements" className="mt-2">
                          <AchievementSystem className="scale-90 origin-top transform" />
                        </TabsContent>
                        
                        <TabsContent value="ranking" className="mt-2">
                          <CompetitiveLeaderboard className="scale-90 origin-top transform" />
                        </TabsContent>
                        
                        <TabsContent value="progress" className="mt-2">
                          <ProgressAnalytics className="scale-90 origin-top transform" />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Buscar conversas..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="text-sm"
                        />
                        <Button size="sm" variant="ghost">
                          <MagnifyingGlass className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {filteredConversations.map((conv) => (
                          <Card key={conv.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-3">
                              <h4 className="font-medium text-sm mb-1">{conv.title}</h4>
                              <p className="text-xs text-muted-foreground mb-2">
                                {conv.lastMessage.substring(0, 60)}...
                              </p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">
                                  {conv.messageCount} mensagens
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {conv.credits} créditos
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="credits" className="space-y-4 mt-4">
                    <CreditWidget 
                      compact={true}
                      onManageCredits={() => setShowSubscriptionManager(true)}
                      onUpgrade={() => setShowPaymentFlow(true)}
                    />
                  </TabsContent>

                  <TabsContent value="profile" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <AnalyticsWidget onOpenFullAnalytics={() => setActiveTab('analytics')} />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Síntese de Voz</span>
                          <Switch
                            checked={speechEnabled}
                            onCheckedChange={setSpeechEnabled}
                          />
                        </div>
                        
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Gear className="h-4 w-4 mr-2" />
                          Configurações
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          <AIChatInterface
            selectedAssistant={selectedAssistant}
            onAssistantChange={handleAssistantChange}
          />
        </main>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
      />

      {/* Credit System Modals */}
      <PaymentFlow
        isOpen={showPaymentFlow}
        onClose={() => setShowPaymentFlow(false)}
        selectedPlan="intermediario"
      />

      <SubscriptionManager
        isOpen={showSubscriptionManager}
        onClose={() => setShowSubscriptionManager(false)}
        onUpgrade={() => {
          setShowSubscriptionManager(false)
          setShowPaymentFlow(true)
        }}
      />
    </div>
  )
}