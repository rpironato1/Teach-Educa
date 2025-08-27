/**
 * Admin Dashboard Component
 * 
 * Comprehensive administrative dashboard for the TeacH platform
 * with Supabase-compatible localStorage for easy migration
 */

import React, { useState } from 'react'
import {
  ArrowLeft,
  Users,
  CurrencyDollar,
  ChartLine,
  Brain,
  Settings,
  Database,
  Activity,
  TrendUp,
  Calendar,
  Clock,
  Download,
  Shield,
  Bell,
  BarChart,
  UserCheck,
  CreditCard,
  Gear,
  Target
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { useSupabaseStorage, exportSupabaseData } from '@/hooks/useSupabaseStorage'
import { toast } from 'sonner'

interface AdminDashboardProps {
  onBackToHome: () => void
}

interface SystemMetrics {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalSessions: number
  avgSessionTime: number
  creditConsumption: number
  systemHealth: 'healthy' | 'warning' | 'critical'
}
export default function AdminDashboard({ onBackToHome }: AdminDashboardProps) {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  // Get all data for admin overview - using empty string as userId for global admin view
  const usersStorage = useSupabaseStorage('users', '')
  const analyticsStorage = useSupabaseStorage('analytics', '')
  const transactionsStorage = useSupabaseStorage('transactions', '')
  const sessionsStorage = useSupabaseStorage('study_sessions', '')

  // Admin-only check
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-destructive" />
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para acessar o painel administrativo.
            </p>
            <Button onClick={onBackToHome} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate metrics from stored data
  const calculateMetrics = (): SystemMetrics => {
    // For demo purposes, we'll use the existing hardcoded values plus some calculated ones
    const totalUsers = 1234
    const activeUsers = 1050
    const totalRevenue = 45890
    const monthlyRevenue = 15230
    
    const sessions = sessionsStorage.data
    const transactions = transactionsStorage.data
    
    const totalSessions = sessions.length > 0 ? sessions.length : 150
    const avgSessionTime = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / sessions.length
      : 25

    const creditConsumption = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      monthlyRevenue,
      totalSessions,
      avgSessionTime,
      creditConsumption: creditConsumption || 2150,
      systemHealth: activeUsers > totalUsers * 0.8 ? 'healthy' : 
                   activeUsers > totalUsers * 0.6 ? 'warning' : 'critical'
    }
  }

  const exportAllData = async () => {
    setLoading(true)
    try {
      // Get all data from localStorage
      const allData = exportSupabaseData('admin') // Export data for admin user
      
      // Create downloadable file
      const dataStr = JSON.stringify(allData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `teach-platform-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Dados exportados com sucesso!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Erro ao exportar dados')
    } finally {
      setLoading(false)
    }
  }

  const metrics = calculateMetrics()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-16">
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
              <Shield className="h-8 w-8 text-primary" weight="duotone" />
              <div>
                <h1 className="font-semibold text-lg">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">Bem-vindo, {user?.fullName}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge 
              variant={metrics.systemHealth === 'healthy' ? 'default' : 
                      metrics.systemHealth === 'warning' ? 'secondary' : 'destructive'}
              className="flex items-center space-x-1"
            >
              <Activity className="h-3 w-3" />
              <span>Sistema {metrics.systemHealth === 'healthy' ? 'Saudável' : 
                           metrics.systemHealth === 'warning' ? 'Atenção' : 'Crítico'}</span>
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportAllData}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Dados</span>
            </Button>

            <Button variant="outline" size="sm" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="revenue">Receita</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    de {metrics.totalUsers} total
                  </p>
                  <Progress 
                    value={(metrics.activeUsers / metrics.totalUsers) * 100} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {metrics.monthlyRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% este mês
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+8% este mês</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessões de Estudo</CardTitle>
                  <ChartLine className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalSessions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Média: {metrics.avgSessionTime.toFixed(1)} min
                  </p>
                  <div className="flex items-center mt-2">
                    <Clock className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-xs text-blue-500">Tempo médio crescendo</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78.5%</div>
                  <p className="text-xs text-muted-foreground">
                    +2% este mês
                  </p>
                  <Progress value={78.5} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Status do Sistema</CardTitle>
                  <CardDescription>Monitoramento em tempo real dos componentes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Sistema IA</span>
                    </div>
                    <Badge variant="default">Operacional</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Sistema de Pagamentos</span>
                    </div>
                    <Badge variant="default">Operacional</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Base de Dados</span>
                    </div>
                    <Badge variant="default">Operacional</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Analytics</span>
                    </div>
                    <Badge variant="default">Operacional</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Usuários
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notificações
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={exportAllData}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Backup de Dados
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Total de Usuários</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{metrics.totalUsers.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Usuários Ativos</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">{metrics.activeUsers.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Assinantes Premium</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">432</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Novos este Mês</span>
                  </div>
                  <div className="text-2xl font-bold mt-1">147</div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Users className="h-4 w-4" />
              <AlertTitle>Gestão de Usuários</AlertTitle>
              <AlertDescription>
                O sistema de gestão de usuários está integrado com localStorage estruturado para Supabase.
                Todos os dados estão prontos para migração quando necessário.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Receita Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ {metrics.totalRevenue.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Desde o início</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Receita Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">R$ {metrics.monthlyRevenue.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    R$ {(metrics.totalRevenue / metrics.totalUsers).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">Por usuário</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Planos</CardTitle>
                <CardDescription>Como os usuários estão distribuídos entre os planos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plano Inicial</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plano Intermediário</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plano Profissional</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '15%'}}></div>
                      </div>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Armazenamento de Dados</CardTitle>
                  <CardDescription>Status do localStorage e preparação para Supabase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usuários</span>
                    <Badge variant="outline">{usersStorage.data.length} registros</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Analytics</span>
                    <Badge variant="outline">{analyticsStorage.data.length} registros</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Transações</span>
                    <Badge variant="outline">{transactionsStorage.data.length} registros</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sessões</span>
                    <Badge variant="outline">{sessionsStorage.data.length} registros</Badge>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status Supabase</span>
                    <Badge variant="secondary">Pronto para migração</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Modo de Desenvolvimento</span>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache do localStorage</span>
                    <Badge variant="default">Funcionando</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estrutura JSON</span>
                    <Badge variant="default">Compatível com Supabase</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sistema de Créditos</span>
                    <Badge variant="default">Operacional</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Database className="h-4 w-4" />
              <AlertTitle>Migração para Supabase</AlertTitle>
              <AlertDescription>
                Todos os dados estão estruturados no formato JSON compatível com Supabase. 
                A migração pode ser feita facilmente importando os dados exportados.
                Os schemas das tabelas seguem as convenções do Supabase com campos como 'created_at', 'updated_at', etc.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da Plataforma</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sistema de IA</span>
                    <Badge variant="default">Habilitado</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pagamentos</span>
                    <Badge variant="default">Habilitado</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notificações</span>
                    <Badge variant="default">Habilitado</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Analytics</span>
                    <Badge variant="default">Habilitado</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Backup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup Automático</span>
                    <Badge variant="secondary">Configurar</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Último Backup</span>
                    <span className="text-sm text-muted-foreground">Nunca</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportAllData}
                    disabled={loading}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Fazer Backup Agora
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Gear className="h-4 w-4" />
              <AlertTitle>Configurações Administrativas</AlertTitle>
              <AlertDescription>
                As configurações administrativas estão sendo implementadas. 
                Por enquanto, todas as configurações são gerenciadas via código e localStorage.
                Após a migração para Supabase, teremos um sistema completo de configurações.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}