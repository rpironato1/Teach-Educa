import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Users, 
  CreditCard, 
  ChartLine, 
  Calendar,
  Trophy,
  Star,
  TrendUp,
  Clock,
  Fire,
  House,
  Gear,
  Shield,
  Database,
  Warning,
  CheckCircle,
  Headset,
  Robot,
  FileText,
  Eye,
  Trash,
  UserPlus,
  X,
  MagnifyingGlass,
  CaretDown,
  CaretUp,
  ChartBar,
  CurrencyDollar,
  Target,
  Lightning,
  ChatCircle,
  Ticket,
  Plus,
  PencilSimple,
  ArrowLeft,
  SignOut,
  Download,
  Upload,
  Funnel,
  SortAscending,
  DotsThree,
  Notification,
  Bell,
  Play,
  Pause,
  Stop,
  Refresh,
  Cloud,
  Lock,
  UserCheck,
  CreditCardIcon
} from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import CreditSystem from '@/components/CreditSystem'
import { useAuth } from '@/contexts/AuthContext'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface AdminDashboardProps {
  onBackToHome?: () => void
}

interface User {
  id: string
  name: string
  email: string
  plan: string
  status: 'active' | 'inactive' | 'suspended'
  credits: number
  joinDate: string
  lastActivity: string
  totalSpent: number
  sessionsCount: number
  role: 'user' | 'admin'
  verificationStatus: 'verified' | 'pending' | 'rejected'
}

interface SupportTicket {
  id: string
  user: string
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'feature' | 'account' | 'other'
  created: string
  updated: string
  assignedTo?: string
  description?: string
  tags?: string[]
}

interface AIAssistant {
  id: string
  name: string
  description: string
  isActive: boolean
  usage: number
  costPerCredit: number
  category: string
  model: string
  temperature: number
  maxTokens: number
  createdAt: string
  updatedAt: string
  performance: {
    satisfaction: number
    responseTime: number
    accuracy: number
  }
}

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  activeConnections: number
  queueSize: number
  errorRate: number
}

interface FinancialReport {
  period: string
  revenue: number
  costs: number
  profit: number
  growth: number
  subscriptions: {
    new: number
    churned: number
    upgraded: number
    downgraded: number
  }
}

interface ActivityLog {
  id: string
  type: 'user_action' | 'system_event' | 'admin_action' | 'payment' | 'error'
  message: string
  user?: string
  timestamp: string
  metadata?: Record<string, any>
  severity: 'info' | 'warning' | 'error' | 'success'
}

export default function AdminDashboard({ onBackToHome }: AdminDashboardProps) {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'analytics' | 'ai-config' | 'reports' | 'support' | 'credits' | 'system' | 'logs'>('dashboard')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [selectedAI, setSelectedAI] = useState<AIAssistant | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortField, setSortField] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isLoading, setIsLoading] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  
  // Real-time metrics
  const [systemMetrics, setSystemMetrics] = useKV<SystemMetrics>('admin-system-metrics', {
    cpuUsage: 45,
    memoryUsage: 67,
    diskUsage: 32,
    activeConnections: 1247,
    queueSize: 23,
    errorRate: 0.2
  })

  // Activity logs
  const [activityLogs, setActivityLogs] = useKV<ActivityLog[]>('admin-activity-logs', [
    {
      id: '1',
      type: 'user_action',
      message: 'Nova inscrição realizada no plano Profissional',
      user: 'Maria Silva',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      severity: 'success'
    },
    {
      id: '2',
      type: 'payment',
      message: 'Pagamento processado com sucesso',
      user: 'João Santos',
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      metadata: { amount: 179.00, method: 'credit_card' },
      severity: 'success'
    },
    {
      id: '3',
      type: 'system_event',
      message: 'Alto consumo de créditos detectado',
      timestamp: new Date(Date.now() - 23 * 60000).toISOString(),
      severity: 'warning'
    },
    {
      id: '4',
      type: 'error',
      message: 'Falha na comunicação com a API de IA',
      timestamp: new Date(Date.now() - 34 * 60000).toISOString(),
      metadata: { service: 'openai-api', error_code: 'rate_limit' },
      severity: 'error'
    }
  ])
  
  // Persistent data using useKV - Enhanced user data
  const [users, setUsers] = useKV<User[]>('admin-users', [
    {
      id: '1',
      name: 'Maria Silva',
      email: 'maria@email.com',
      plan: 'Profissional',
      status: 'active',
      credits: 847,
      joinDate: '2024-01-15',
      lastActivity: '2024-01-20 14:30',
      totalSpent: 537.00,
      sessionsCount: 127,
      role: 'user',
      verificationStatus: 'verified'
    },
    {
      id: '2',
      name: 'João Santos',
      email: 'joao@email.com',
      plan: 'Intermediário',
      status: 'active',
      credits: 234,
      joinDate: '2024-01-10',
      lastActivity: '2024-01-20 09:15',
      totalSpent: 297.00,
      sessionsCount: 89,
      role: 'user',
      verificationStatus: 'verified'
    },
    {
      id: '3',
      name: 'Ana Costa',
      email: 'ana@email.com',
      plan: 'Inicial',
      status: 'inactive',
      credits: 45,
      joinDate: '2024-01-05',
      lastActivity: '2024-01-18 16:20',
      totalSpent: 87.00,
      sessionsCount: 23,
      role: 'user',
      verificationStatus: 'pending'
    },
    {
      id: '4',
      name: 'Carlos Admin',
      email: 'carlos@teach.com',
      plan: 'Admin',
      status: 'active',
      credits: 9999,
      joinDate: '2023-12-01',
      lastActivity: '2024-01-20 15:45',
      totalSpent: 0,
      sessionsCount: 456,
      role: 'admin',
      verificationStatus: 'verified'
    }
  ])
  
  // Enhanced support tickets
  const [supportTickets, setSupportTickets] = useKV<SupportTicket[]>('admin-tickets', [
    {
      id: '1',
      user: 'Maria Silva',
      subject: 'Problema com créditos não sendo contabilizados',
      status: 'open',
      priority: 'high',
      category: 'billing',
      created: '2024-01-20 10:00',
      updated: '2024-01-20 10:00',
      description: 'Realizei uma sessão de estudo mas os créditos não foram descontados corretamente.',
      tags: ['créditos', 'cobrança', 'sessão']
    },
    {
      id: '2',
      user: 'João Santos',
      subject: 'Dúvida sobre recursos de IA disponíveis',
      status: 'in_progress',
      priority: 'medium',
      category: 'feature',
      created: '2024-01-19 15:30',
      updated: '2024-01-20 09:15',
      assignedTo: 'Suporte Técnico',
      description: 'Gostaria de entender melhor quais assistentes de IA estão incluídos no meu plano.',
      tags: ['recursos', 'plano', 'assistentes']
    },
    {
      id: '3',
      user: 'Ana Costa',
      subject: 'Não consigo acessar o dashboard',
      status: 'resolved',
      priority: 'urgent',
      category: 'technical',
      created: '2024-01-18 14:22',
      updated: '2024-01-19 11:30',
      assignedTo: 'TI',
      description: 'Após o último login, não consigo mais acessar meu dashboard.',
      tags: ['login', 'acesso', 'dashboard']
    }
  ])
  
  // Enhanced AI assistants configuration
  const [aiAssistants, setAiAssistants] = useKV<AIAssistant[]>('admin-ai-assistants', [
    {
      id: '1',
      name: 'Tutor Matemática',
      description: 'Especialista em matemática avançada, cálculos e resolução de problemas',
      isActive: true,
      usage: 2847,
      costPerCredit: 1.5,
      category: 'Educação',
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 2048,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-20',
      performance: {
        satisfaction: 4.8,
        responseTime: 1.2,
        accuracy: 94.5
      }
    },
    {
      id: '2',
      name: 'Assistente Redação',
      description: 'Especialista em redação, correção de textos e gramática',
      isActive: true,
      usage: 1923,
      costPerCredit: 2.0,
      category: 'Linguagem',
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 4096,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-19',
      performance: {
        satisfaction: 4.6,
        responseTime: 1.8,
        accuracy: 91.2
      }
    },
    {
      id: '3',
      name: 'Coach Programação',
      description: 'Mentor especializado em ensino de programação e desenvolvimento',
      isActive: false,
      usage: 456,
      costPerCredit: 3.0,
      category: 'Tecnologia',
      model: 'gpt-4o-mini',
      temperature: 0.5,
      maxTokens: 8192,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
      performance: {
        satisfaction: 4.9,
        responseTime: 2.1,
        accuracy: 96.8
      }
    }
  ])

  const adminStats = [
    {
      label: 'Usuários Ativos',
      value: users.filter(u => u.status === 'active').length.toString(),
      icon: <Users className="h-5 w-5 text-primary" />,
      trend: '+245 este mês',
      status: 'success',
      change: '+12.5%'
    },
    {
      label: 'Receita Mensal',
      value: 'R$ 89.7k',
      icon: <CreditCard className="h-5 w-5 text-secondary" />,
      trend: '+18.2% vs mês anterior',
      status: 'success',
      change: '+18.2%'
    },
    {
      label: 'Taxa de Conversão',
      value: '24.8%',
      icon: <TrendUp className="h-5 w-5 text-accent" />,
      trend: '+3.1% esta semana',
      status: 'success',
      change: '+3.1%'
    },
    {
      label: 'Tickets Abertos',
      value: supportTickets.filter(t => t.status === 'open').length.toString(),
      icon: <Headset className="h-5 w-5 text-orange-500" />,
      trend: `${supportTickets.length} total`,
      status: supportTickets.filter(t => t.status === 'open').length > 5 ? 'warning' : 'success',
      change: supportTickets.filter(t => t.status === 'open').length > 5 ? '+2' : '-1'
    },
    {
      label: 'Uptime Sistema',
      value: '99.9%',
      icon: <Database className="h-5 w-5 text-green-500" />,
      trend: 'Últimas 24h',
      status: 'success',
      change: '100%'
    },
    {
      label: 'IA Ativas',
      value: aiAssistants.filter(a => a.isActive).length.toString(),
      icon: <Robot className="h-5 w-5 text-purple-500" />,
      trend: `${aiAssistants.length} total`,
      status: 'success',
      change: 'Estável'
    }
  ]

  // Auto-refresh effect for real-time data
  useEffect(() => {
    const updateMetrics = () => {
      setSystemMetrics(current => ({
        ...current,
        cpuUsage: Math.max(10, Math.min(90, current.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(85, current.memoryUsage + (Math.random() - 0.5) * 8)),
        activeConnections: Math.max(800, current.activeConnections + Math.floor((Math.random() - 0.5) * 100)),
        queueSize: Math.max(0, current.queueSize + Math.floor((Math.random() - 0.5) * 10)),
        errorRate: Math.max(0, Math.min(5, current.errorRate + (Math.random() - 0.5) * 0.5))
      }))
    }

    if (activeView === 'dashboard' || activeView === 'system') {
      const interval = setInterval(updateMetrics, 5000) // Update every 5 seconds
      setRefreshInterval(interval)
      return () => clearInterval(interval)
    }
  }, [activeView, setSystemMetrics])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [refreshInterval])

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof User]
      const bValue = b[sortField as keyof User]
      const modifier = sortOrder === 'asc' ? 1 : -1
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * modifier
      }
      return ((aValue as number) - (bValue as number)) * modifier
    })

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    setActivityLogs(current => [newLog, ...current.slice(0, 99)]) // Keep only last 100 logs
  }

  const handleUserAction = (action: string, userId: string) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return

    setUsers(currentUsers => 
      currentUsers.map(user => {
        if (user.id === userId) {
          switch (action) {
            case 'suspend':
              addActivityLog({
                type: 'admin_action',
                message: `Usuário ${user.name} foi suspenso`,
                user: user.name,
                severity: 'warning'
              })
              return { ...user, status: 'suspended' as const }
            case 'activate':
              addActivityLog({
                type: 'admin_action',
                message: `Usuário ${user.name} foi ativado`,
                user: user.name,
                severity: 'success'
              })
              return { ...user, status: 'active' as const }
            case 'deactivate':
              addActivityLog({
                type: 'admin_action',
                message: `Usuário ${user.name} foi desativado`,
                user: user.name,
                severity: 'info'
              })
              return { ...user, status: 'inactive' as const }
            case 'delete':
              addActivityLog({
                type: 'admin_action',
                message: `Usuário ${user.name} foi removido do sistema`,
                user: user.name,
                severity: 'error'
              })
              return null // Will be filtered out
            default:
              return user
          }
        }
        return user
      }).filter(Boolean) as User[]
    )
    
    const actionText = action === 'suspend' ? 'suspenso' : 
                      action === 'activate' ? 'ativado' : 
                      action === 'deactivate' ? 'desativado' : 'removido'
    toast.success(`Usuário ${actionText} com sucesso!`)
  }

  const handleTicketUpdate = (ticketId: string, status: SupportTicket['status']) => {
    const ticket = supportTickets.find(t => t.id === ticketId)
    if (!ticket) return

    setSupportTickets(currentTickets =>
      currentTickets.map(ticket =>
        ticket.id === ticketId 
          ? { ...ticket, status, updated: new Date().toLocaleString('pt-BR') }
          : ticket
      )
    )
    
    addActivityLog({
      type: 'admin_action',
      message: `Ticket #${ticketId} atualizado para ${status}`,
      user: ticket.user,
      severity: 'info'
    })
    
    toast.success('Status do ticket atualizado!')
  }

  const toggleAIAssistant = (assistantId: string) => {
    const assistant = aiAssistants.find(a => a.id === assistantId)
    if (!assistant) return

    setAiAssistants(currentAssistants =>
      currentAssistants.map(assistant =>
        assistant.id === assistantId
          ? { ...assistant, isActive: !assistant.isActive, updatedAt: new Date().toISOString() }
          : assistant
      )
    )
    
    addActivityLog({
      type: 'admin_action',
      message: `Assistente ${assistant.name} foi ${assistant.isActive ? 'desativado' : 'ativado'}`,
      severity: 'info'
    })
    
    toast.success('Configuração do assistente atualizada!')
  }

  const exportData = async (type: 'users' | 'tickets' | 'logs') => {
    setIsLoading(true)
    try {
      let data: any
      let filename: string
      
      switch (type) {
        case 'users':
          data = users
          filename = `usuarios_${new Date().toISOString().split('T')[0]}.json`
          break
        case 'tickets':
          data = supportTickets
          filename = `tickets_${new Date().toISOString().split('T')[0]}.json`
          break
        case 'logs':
          data = activityLogs
          filename = `logs_${new Date().toISOString().split('T')[0]}.json`
          break
        default:
          throw new Error('Tipo de exportação inválido')
      }
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      
      addActivityLog({
        type: 'admin_action',
        message: `Dados de ${type} exportados com sucesso`,
        severity: 'success'
      })
      
      toast.success(`Dados de ${type} exportados com sucesso!`)
    } catch (error) {
      toast.error('Erro ao exportar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const recentActivities = [
    {
      type: 'user_registration',
      message: 'Nova inscrição no plano Profissional',
      user: 'Maria Silva',
      time: '5 min atrás',
      status: 'success'
    },
    {
      type: 'payment_received',
      message: 'Pagamento processado com sucesso',
      user: 'João Santos',
      amount: 'R$ 179,00',
      time: '12 min atrás',
      status: 'success'
    },
    {
      type: 'system_alert',
      message: 'Alto uso de créditos detectado',
      user: 'Sistema',
      time: '23 min atrás',
      status: 'warning'
    },
    {
      type: 'user_feedback',
      message: 'Avaliação 5 estrelas recebida',
      user: 'Ana Costa',
      time: '1h atrás',
      status: 'success'
    }
  ]

  const systemHealth = [
    { service: 'API Principal', status: 'online', uptime: '99.9%' },
    { service: 'Base de Dados', status: 'online', uptime: '99.8%' },
    { service: 'Processamento IA', status: 'online', uptime: '98.2%' },
    { service: 'Gateway Pagamentos', status: 'maintenance', uptime: '95.1%' }
  ]

  const renderDashboardView = () => (
    <>
      {/* Welcome Section with Real-time Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Bem-vindo de volta, {user?.fullName || 'Administrador'}! 
            </h2>
            <p className="text-muted-foreground">
              Aqui está um resumo das atividades da plataforma TeacH.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={systemMetrics.errorRate < 1 ? 'default' : 'destructive'}>
              {systemMetrics.errorRate < 1 ? '🟢 Sistema Saudável' : '🔴 Atenção Necessária'}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setActiveView('logs')}>
              <Bell className="h-4 w-4 mr-2" />
              Logs
            </Button>
          </div>
        </div>

        {/* System Alerts */}
        {(systemMetrics.errorRate > 1 || supportTickets.filter(t => t.status === 'open').length > 5) && (
          <Alert className="border-orange-500 bg-orange-50">
            <Warning className="h-4 w-4" />
            <AlertTitle>Atenção necessária</AlertTitle>
            <AlertDescription>
              {systemMetrics.errorRate > 1 && `Taxa de erro elevada: ${systemMetrics.errorRate.toFixed(2)}%. `}
              {supportTickets.filter(t => t.status === 'open').length > 5 && 
                `${supportTickets.filter(t => t.status === 'open').length} tickets em aberto precisam de atenção.`}
            </AlertDescription>
          </Alert>
        )}
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {adminStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center space-x-1 mt-1">
                <TrendUp className="h-3 w-3 text-secondary" />
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Atividades Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-secondary' : 
                    activity.status === 'warning' ? 'bg-orange-500' : 'bg-destructive'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.message}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      {activity.amount && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-secondary">{activity.amount}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Status dos Sistemas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemHealth.map((system, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {system.status === 'online' ? (
                      <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
                    ) : (
                      <Warning className="h-4 w-4 text-orange-500" weight="fill" />
                    )}
                    <span className="text-sm font-medium">{system.service}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={system.status === 'online' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {system.status === 'online' ? 'Online' : 'Manutenção'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{system.uptime}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid gap-6 md:grid-cols-3 lg:grid-cols-4"
      >
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105" onClick={() => setActiveView('users')}>
          <CardHeader className="text-center pb-2">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-sm">Usuários</CardTitle>
            <CardDescription className="text-xs">{users.length} total</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105" onClick={() => setActiveView('analytics')}>
          <CardHeader className="text-center pb-2">
            <ChartBar className="h-8 w-8 text-secondary mx-auto mb-2" />
            <CardTitle className="text-sm">Analytics</CardTitle>
            <CardDescription className="text-xs">Métricas detalhadas</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105" onClick={() => setActiveView('ai-config')}>
          <CardHeader className="text-center pb-2">
            <Robot className="h-8 w-8 text-accent mx-auto mb-2" />
            <CardTitle className="text-sm">Config IA</CardTitle>
            <CardDescription className="text-xs">{aiAssistants.filter(a => a.isActive).length} ativos</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105" onClick={() => setActiveView('reports')}>
          <CardHeader className="text-center pb-2">
            <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle className="text-sm">Relatórios</CardTitle>
            <CardDescription className="text-xs">Financeiro & Analytics</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105" onClick={() => setActiveView('support')}>
          <CardHeader className="text-center pb-2">
            <Headset className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <CardTitle className="text-sm">Suporte</CardTitle>
            <CardDescription className="text-xs">{supportTickets.filter(t => t.status === 'open').length} abertos</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105" onClick={() => setActiveView('credits')}>
          <CardHeader className="text-center pb-2">
            <CurrencyDollar className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-sm">Créditos</CardTitle>
            <CardDescription className="text-xs">Sistema monetário</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105" onClick={() => setActiveView('system')}>
          <CardHeader className="text-center pb-2">
            <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <CardTitle className="text-sm">Sistema</CardTitle>
            <CardDescription className="text-xs">
              CPU: {systemMetrics.cpuUsage.toFixed(0)}%
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105" onClick={() => setActiveView('logs')}>
          <CardHeader className="text-center pb-2">
            <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <CardTitle className="text-sm">Logs</CardTitle>
            <CardDescription className="text-xs">{activityLogs.length} eventos</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    </>
  )

  const renderUsersView = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestão de Usuários</h2>
            <p className="text-muted-foreground">Visualize e gerencie todas as contas de usuários</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportData('users')} 
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              {isLoading ? 'Exportando...' : 'Exportar'}
            </Button>
            <Button className="focus-enhanced" onClick={() => setShowUserDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="suspended">Suspensos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortField} onValueChange={setSortField}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="plan">Plano</SelectItem>
              <SelectItem value="credits">Créditos</SelectItem>
              <SelectItem value="joinDate">Data Ingresso</SelectItem>
              <SelectItem value="totalSpent">Gasto Total</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <SortAscending className="h-4 w-4" /> : <CaretDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.status === 'inactive').length}
              </div>
              <p className="text-sm text-muted-foreground">Inativos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => u.status === 'suspended').length}
              </div>
              <p className="text-sm text-muted-foreground">Suspensos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                R$ {users.reduce((sum, u) => sum + u.totalSpent, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
            </CardContent>
          </Card>
        </div>

        <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Créditos</TableHead>
              <TableHead>Gasto Total</TableHead>
              <TableHead>Última Atividade</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium">{user.name}</div>
                      {user.role === 'admin' && (
                        <Badge variant="destructive" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {user.verificationStatus === 'verified' && (
                        <UserCheck className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.sessionsCount} sessões • Desde {user.joinDate}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.plan}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    user.status === 'active' ? 'default' : 
                    user.status === 'inactive' ? 'secondary' : 'destructive'
                  }>
                    {user.status === 'active' ? 'Ativo' : 
                     user.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{user.credits}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">R$ {user.totalSpent.toFixed(2)}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.lastActivity}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {user.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserAction('suspend', user.id)}
                      >
                        <Warning className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUserAction('activate', user.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <DotsThree className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <PencilSimple className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleUserAction('delete', user.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Nome Completo</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Plano Atual</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.plan}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={
                    selectedUser.status === 'active' ? 'default' : 
                    selectedUser.status === 'inactive' ? 'secondary' : 'destructive'
                  }>
                    {selectedUser.status === 'active' ? 'Ativo' : 
                     selectedUser.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Créditos Disponíveis</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.credits}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Gasto</Label>
                  <p className="text-sm text-muted-foreground">R$ {selectedUser.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sessões Realizadas</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.sessionsCount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Verificação</Label>
                  <div className="flex items-center space-x-2">
                    {selectedUser.verificationStatus === 'verified' ? (
                      <UserCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <Warning className="h-4 w-4 text-orange-500" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {selectedUser.verificationStatus === 'verified' ? 'Verificado' : 'Pendente'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Ingresso</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Última Atividade</Label>
                  <p className="text-sm text-muted-foreground">{selectedUser.lastActivity}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Fechar
                </Button>
                <Button>
                  <PencilSimple className="h-4 w-4 mr-2" />
                  Editar Usuário
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
    )
  }

  const renderAnalyticsView = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics e Métricas</h2>
        <p className="text-muted-foreground">Análise detalhada do desempenho da plataforma</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="usage">Uso da Plataforma</TabsTrigger>
          <TabsTrigger value="learning">Aprendizado</TabsTrigger>
          <TabsTrigger value="gamification">Gamificação</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+245</div>
                <p className="text-xs text-muted-foreground">Este mês</p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendUp className="h-3 w-3 mr-1" />
                  +12% vs mês anterior
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
                <Lightning className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,834</div>
                <p className="text-xs text-muted-foreground">Agora</p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendUp className="h-3 w-3 mr-1" />
                  +8% vs ontem
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Créditos Consumidos</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45.2k</div>
                <p className="text-xs text-muted-foreground">Hoje</p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendUp className="h-3 w-3 mr-1" />
                  +15% vs ontem
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8/5</div>
                <p className="text-xs text-muted-foreground">Média geral</p>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendUp className="h-3 w-3 mr-1" />
                  +0.2 vs mês anterior
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Analytics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Engagement por Horário</CardTitle>
                <CardDescription>Distribuição de uso ao longo do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: '08:00-10:00', usage: 85, label: 'Pico matinal' },
                    { time: '10:00-12:00', usage: 70, label: 'Manhã' },
                    { time: '14:00-16:00', usage: 90, label: 'Pico tarde' },
                    { time: '16:00-18:00', usage: 65, label: 'Tarde' },
                    { time: '19:00-21:00', usage: 95, label: 'Pico noturno' },
                    { time: '21:00-23:00', usage: 55, label: 'Noite' }
                  ].map((slot) => (
                    <div key={slot.time} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{slot.time}</span>
                        <span className="text-muted-foreground">{slot.usage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${slot.usage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">{slot.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assistentes Mais Usados</CardTitle>
                <CardDescription>Popularidade dos assistentes de IA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Maria - Matemática', usage: 42, sessions: '12.5k' },
                    { name: 'Carlos - Ciências', usage: 28, sessions: '8.3k' },
                    { name: 'Ana - Português', usage: 20, sessions: '5.9k' },
                    { name: 'Pedro - História', usage: 10, sessions: '2.8k' }
                  ].map((assistant) => (
                    <div key={assistant.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{assistant.name}</span>
                        <span className="text-muted-foreground">{assistant.sessions}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${assistant.usage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gamification" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conquistas Desbloqueadas</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">Esta semana</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Streaks Ativos</CardTitle>
                <Fire className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3,891</div>
                <p className="text-xs text-muted-foreground">Usuários com streaks</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pontos Distribuídos</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.1M</div>
                <p className="text-xs text-muted-foreground">Pontos totais</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Competições Ativas</CardTitle>
                <ChartBar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">Torneios em andamento</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ranking Global - Top Performers</CardTitle>
              <CardDescription>Os usuários com melhor desempenho esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'Ana Silva', points: 15450, level: 8, badge: '🏆' },
                  { rank: 2, name: 'Carlos Rocha', points: 12890, level: 7, badge: '🥈' },
                  { rank: 3, name: 'Beatriz Lima', points: 11230, level: 6, badge: '🥉' },
                  { rank: 4, name: 'Diego Santos', points: 9870, level: 5, badge: '⭐' },
                  { rank: 5, name: 'Elena Costa', points: 8650, level: 5, badge: '⭐' }
                ].map((user) => (
                  <div key={user.rank} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{user.badge}</span>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">Nível {user.level}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{user.points.toLocaleString()} pontos</div>
                      <div className="text-sm text-muted-foreground">#{user.rank} posição</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Conquistas</CardTitle>
              <CardDescription>Configure e monitore o sistema de conquistas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total de conquistas ativas</span>
                  <Badge variant="secondary">28 conquistas</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { title: 'Primeira Lição', unlocked: 1247, total: 2480, rarity: 'common' },
                    { title: 'Semana Dedicada', unlocked: 892, total: 2480, rarity: 'rare' },
                    { title: 'Mestre do Tempo', unlocked: 341, total: 2480, rarity: 'epic' },
                    { title: 'Perfeição Absoluta', unlocked: 23, total: 2480, rarity: 'legendary' }
                  ].map((achievement) => (
                    <div key={achievement.title} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <Badge variant={
                          achievement.rarity === 'legendary' ? 'default' :
                          achievement.rarity === 'epic' ? 'secondary' : 'outline'
                        }>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Desbloqueadas</span>
                          <span>{achievement.unlocked}/{achievement.total}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(achievement.unlocked / achievement.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Eficácia por Matéria</CardTitle>
                <CardDescription>Taxa de sucesso no aprendizado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { subject: 'Matemática', efficiency: 87, sessions: 15420 },
                    { subject: 'Ciências', efficiency: 82, sessions: 12380 },
                    { subject: 'Português', efficiency: 91, sessions: 9870 },
                    { subject: 'História', efficiency: 78, sessions: 7650 }
                  ].map((subject) => (
                    <div key={subject.subject} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{subject.subject}</span>
                        <span className="text-muted-foreground">{subject.efficiency}% eficácia</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-chart-2 h-2 rounded-full" 
                          style={{ width: `${subject.efficiency}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">{subject.sessions.toLocaleString()} sessões</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo de Retenção</CardTitle>
                <CardDescription>Análise neuroadaptativa de retenção</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">94.2%</div>
                    <div className="text-sm text-muted-foreground">Taxa de retenção média</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { period: '24 horas', retention: 96 },
                      { period: '1 semana', retention: 89 },
                      { period: '1 mês', retention: 78 },
                      { period: '3 meses', retention: 65 }
                    ].map((period) => (
                      <div key={period.period} className="flex justify-between items-center">
                        <span className="text-sm">{period.period}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div 
                              className="bg-accent h-2 rounded-full" 
                              style={{ width: `${period.retention}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-10">{period.retention}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { device: 'Mobile', percentage: 68, color: 'bg-primary' },
                    { device: 'Desktop', percentage: 24, color: 'bg-secondary' },
                    { device: 'Tablet', percentage: 8, color: 'bg-accent' }
                  ].map((item) => (
                    <div key={item.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm">{item.device}</span>
                      </div>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regiões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { region: 'Sudeste', percentage: 45 },
                    { region: 'Sul', percentage: 23 },
                    { region: 'Nordeste', percentage: 18 },
                    { region: 'Centro-Oeste', percentage: 8 },
                    { region: 'Norte', percentage: 6 }
                  ].map((item) => (
                    <div key={item.region} className="flex justify-between items-center">
                      <span className="text-sm">{item.region}</span>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Faixa Etária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { age: '16-20', percentage: 32 },
                    { age: '21-25', percentage: 28 },
                    { age: '26-30', percentage: 22 },
                    { age: '31-40', percentage: 12 },
                    { age: '40+', percentage: 6 }
                  ].map((item) => (
                    <div key={item.age} className="flex justify-between items-center">
                      <span className="text-sm">{item.age}</span>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
          <Card>
            <CardHeader>
              <CardTitle>Uso por Assistente IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiAssistants.map((assistant) => (
                  <div key={assistant.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{assistant.name}</h4>
                      <p className="text-sm text-muted-foreground">{assistant.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{assistant.usage.toLocaleString()} usos</div>
                      <div className="text-sm text-muted-foreground">
                        R$ {(assistant.usage * assistant.costPerCredit).toFixed(2)} gerados
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Taxa de Retenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">78.5%</div>
                <p className="text-sm text-muted-foreground mb-4">Usuários que retornam após 7 dias</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>1 dia</span>
                    <span>92%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>7 dias</span>
                    <span>78%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>30 dias</span>
                    <span>45%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Eficácia do Aprendizado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">85.2%</div>
                <p className="text-sm text-muted-foreground mb-4">Taxa de sucesso em avaliações</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Matemática</span>
                    <span>88%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Linguagens</span>
                    <span>82%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ciências</span>
                    <span>79%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  const renderAIConfigView = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configuração dos Assistentes IA</h2>
        <p className="text-muted-foreground">Gerencie e configure os assistentes de IA disponíveis</p>
      </div>

      <div className="grid gap-6">
        {aiAssistants.map((assistant) => (
          <Card key={assistant.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Robot className="h-5 w-5 text-primary" />
                    <span>{assistant.name}</span>
                  </CardTitle>
                  <CardDescription>{assistant.description}</CardDescription>
                </div>
                <Switch
                  checked={assistant.isActive}
                  onCheckedChange={() => toggleAIAssistant(assistant.id)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm font-medium">Categoria</Label>
                  <p className="text-sm text-muted-foreground">{assistant.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Uso Total</Label>
                  <p className="text-sm text-muted-foreground">{assistant.usage.toLocaleString()} interações</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Custo por Crédito</Label>
                  <p className="text-sm text-muted-foreground">R$ {assistant.costPerCredit.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Button variant="outline" size="sm">
                  <PencilSimple className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button variant="outline" size="sm">
                  <ChartLine className="h-4 w-4 mr-2" />
                  Métricas
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="font-medium mb-1">Adicionar Novo Assistente</h3>
            <p className="text-sm text-muted-foreground mb-4">Configure um novo assistente IA</p>
            <Button variant="outline">
              Criar Assistente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderReportsView = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Relatórios Financeiros</h2>
        <p className="text-muted-foreground">Análise financeira e relatórios de receita</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <CurrencyDollar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 267.4k</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <TrendUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 89.7k</div>
            <p className="text-xs text-muted-foreground">+18.2% vs mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 127</div>
            <p className="text-xs text-muted-foreground">Por usuário/mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receita por Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Plano Profissional</h4>
                <p className="text-sm text-muted-foreground">1,247 assinantes</p>
              </div>
              <div className="text-right">
                <div className="font-medium">R$ 223.2k</div>
                <div className="text-sm text-muted-foreground">83.4% da receita</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Plano Intermediário</h4>
                <p className="text-sm text-muted-foreground">892 assinantes</p>
              </div>
              <div className="text-right">
                <div className="font-medium">R$ 88.3k</div>
                <div className="text-sm text-muted-foreground">33.0% da receita</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Plano Inicial</h4>
                <p className="text-sm text-muted-foreground">708 assinantes</p>
              </div>
              <div className="text-right">
                <div className="font-medium">R$ 20.5k</div>
                <div className="text-sm text-muted-foreground">7.7% da receita</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSupportView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sistema de Suporte</h2>
          <p className="text-muted-foreground">Gerencie tickets e solicitações de suporte</p>
        </div>
        <Button className="focus-enhanced" onClick={() => setShowTicketDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {supportTickets.filter(t => t.status === 'open').length}
            </div>
            <p className="text-sm text-muted-foreground">Abertos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {supportTickets.filter(t => t.status === 'in_progress').length}
            </div>
            <p className="text-sm text-muted-foreground">Em Andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {supportTickets.filter(t => t.status === 'resolved').length}
            </div>
            <p className="text-sm text-muted-foreground">Resolvidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">2.3h</div>
            <p className="text-sm text-muted-foreground">Tempo Médio</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supportTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="text-sm text-muted-foreground">#{ticket.id}</div>
                  </div>
                </TableCell>
                <TableCell>{ticket.user}</TableCell>
                <TableCell>
                  <Badge variant={
                    ticket.priority === 'urgent' ? 'destructive' :
                    ticket.priority === 'high' ? 'default' :
                    ticket.priority === 'medium' ? 'secondary' : 'outline'
                  }>
                    {ticket.priority === 'urgent' ? 'Urgente' :
                     ticket.priority === 'high' ? 'Alta' :
                     ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select 
                    value={ticket.status} 
                    onValueChange={(value: SupportTicket['status']) => handleTicketUpdate(ticket.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {ticket.created}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <ChatCircle className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )

  const renderCreditsView = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Sistema de Créditos</h2>
        <p className="text-muted-foreground">Gerencie planos, pagamentos e distribuição de créditos</p>
      </div>

      <CreditSystem showFullInterface={true} />

      {/* Credit Analytics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Créditos Ativos</CardTitle>
            <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125.8k</div>
            <p className="text-xs text-muted-foreground">Em circulação</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 89.7k</div>
            <p className="text-xs text-muted-foreground">+18.2% vs mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.3%</div>
            <p className="text-xs text-muted-foreground">Trial para pagos</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Pagamentos</CardTitle>
          <CardDescription>
            Como os usuários preferem pagar pelos planos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm">Cartão de Crédito</span>
              </div>
              <div className="text-sm font-medium">68.4%</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary"></div>
                <span className="text-sm">PIX</span>
              </div>
              <div className="text-sm font-medium">24.1%</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <span className="text-sm">Boleto</span>
              </div>
              <div className="text-sm font-medium">7.5%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance dos Planos</CardTitle>
          <CardDescription>
            Análise de assinaturas por plano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Inicial', users: 1247, revenue: 'R$ 36.1k', growth: '+12%', color: 'bg-blue-500' },
              { name: 'Intermediário', users: 892, revenue: 'R$ 88.3k', growth: '+24%', color: 'bg-green-500' },
              { name: 'Profissional', users: 341, revenue: 'R$ 61.0k', growth: '+18%', color: 'bg-purple-500' }
            ].map((plan) => (
              <div key={plan.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${plan.color}`}></div>
                  <div>
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">{plan.users} usuários</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{plan.revenue}</div>
                  <div className="text-sm text-green-600">{plan.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSystemView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Monitoramento do Sistema</h2>
          <p className="text-muted-foreground">Status em tempo real dos serviços e infraestrutura</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={systemMetrics.errorRate < 1 ? 'default' : 'destructive'}>
            {systemMetrics.errorRate < 1 ? 'Sistema Saudável' : 'Atenção Necessária'}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <Refresh className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Lightning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.cpuUsage.toFixed(1)}%</div>
            <Progress value={systemMetrics.cpuUsage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {systemMetrics.cpuUsage > 80 ? 'Alto uso' : systemMetrics.cpuUsage > 60 ? 'Uso moderado' : 'Uso normal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memória</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.memoryUsage.toFixed(1)}%</div>
            <Progress value={systemMetrics.memoryUsage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {systemMetrics.memoryUsage > 80 ? 'Alto uso' : 'Uso normal'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeConnections.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Conexões ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <Warning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.errorRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {systemMetrics.errorRate < 1 ? 'Baixa' : systemMetrics.errorRate < 3 ? 'Moderada' : 'Alta'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cloud className="h-5 w-5" />
              <span>Status dos Serviços</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {service.status === 'online' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" weight="fill" />
                  ) : (
                    <Warning className="h-5 w-5 text-orange-500" weight="fill" />
                  )}
                  <div>
                    <div className="font-medium">{service.service}</div>
                    <div className="text-sm text-muted-foreground">Uptime: {service.uptime}</div>
                  </div>
                </div>
                <Badge variant={service.status === 'online' ? 'default' : 'secondary'}>
                  {service.status === 'online' ? 'Online' : 'Manutenção'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ChartLine className="h-5 w-5" />
              <span>Métricas de Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tempo de Resposta API</span>
                <span className="font-medium">125ms</span>
              </div>
              <Progress value={12.5} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Throughput</span>
                <span className="font-medium">2.4k req/min</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cache Hit Rate</span>
                <span className="font-medium">94.2%</span>
              </div>
              <Progress value={94.2} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Disponibilidade</span>
                <span className="font-medium">99.9%</span>
              </div>
              <Progress value={99.9} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent System Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Alertas e Eventos Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityLogs
              .filter(log => log.type === 'system_event' || log.type === 'error')
              .slice(0, 5)
              .map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    log.severity === 'error' ? 'bg-red-500' :
                    log.severity === 'warning' ? 'bg-orange-500' :
                    log.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{log.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </p>
                    {log.metadata && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {JSON.stringify(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderLogsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Logs de Atividade</h2>
          <p className="text-muted-foreground">Histórico completo de ações e eventos do sistema</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => exportData('logs')} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Exportando...' : 'Exportar'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActivityLogs([])}>
            <Trash className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Log Filters */}
      <div className="flex items-center space-x-4">
        <Select defaultValue="all" onValueChange={(value) => setFilterStatus(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="user_action">Ações de usuário</SelectItem>
            <SelectItem value="admin_action">Ações administrativas</SelectItem>
            <SelectItem value="system_event">Eventos do sistema</SelectItem>
            <SelectItem value="payment">Pagamentos</SelectItem>
            <SelectItem value="error">Erros</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all" onValueChange={(value) => setSortField(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas severidades</SelectItem>
            <SelectItem value="error">Erros</SelectItem>
            <SelectItem value="warning">Avisos</SelectItem>
            <SelectItem value="success">Sucessos</SelectItem>
            <SelectItem value="info">Informações</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Activity Logs */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="space-y-1 p-4">
              {activityLogs
                .filter(log => {
                  const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase()))
                  const matchesType = filterStatus === 'all' || log.type === filterStatus || log.severity === filterStatus
                  return matchesSearch && matchesType
                })
                .map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                      log.severity === 'error' ? 'bg-red-500' :
                      log.severity === 'warning' ? 'bg-orange-500' :
                      log.severity === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground truncate">{log.message}</p>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                          <Badge variant="outline" className="text-xs">
                            {log.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      {log.user && (
                        <p className="text-xs text-muted-foreground mt-1">Usuário: {log.user}</p>
                      )}
                      {log.metadata && (
                        <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded border">
                          <pre className="whitespace-pre-wrap font-mono">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              
              {activityLogs.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum log de atividade encontrado</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center space-x-4 flex-1">
            {activeView !== 'dashboard' ? (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setActiveView('dashboard')}
                className="focus-enhanced"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onBackToHome}
                className="focus-enhanced"
              >
                <House className="h-4 w-4 mr-2" />
                Home
              </Button>
            )}
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">
                  {activeView === 'dashboard' ? 'Dashboard Admin' :
                   activeView === 'users' ? 'Gestão de Usuários' :
                   activeView === 'analytics' ? 'Analytics' :
                   activeView === 'ai-config' ? 'Config IA' :
                   activeView === 'reports' ? 'Relatórios' :
                   activeView === 'support' ? 'Suporte' :
                   activeView === 'credits' ? 'Sistema de Créditos' :
                   activeView === 'system' ? 'Monitoramento do Sistema' :
                   activeView === 'logs' ? 'Logs de Atividade' : 'Admin'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Painel administrativo da plataforma TeacH
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-secondary/10">
              Admin Panel
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {activeView === 'dashboard' && renderDashboardView()}
        {activeView === 'users' && renderUsersView()}
        {activeView === 'analytics' && renderAnalyticsView()}
        {activeView === 'ai-config' && renderAIConfigView()}
        {activeView === 'reports' && renderReportsView()}
        {activeView === 'support' && renderSupportView()}
        {activeView === 'credits' && renderCreditsView()}
        {activeView === 'system' && renderSystemView()}
        {activeView === 'logs' && renderLogsView()}
      </main>
    </div>
  )
}
