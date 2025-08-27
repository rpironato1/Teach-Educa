import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  ChartLine,
  BarChart,
  Clock,
  Target,
  Brain,
  Book,
  Zap,
  Lightning,
  Eye,
  CheckCircle,
  X
} from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAnalytics } from '@/contexts/AnalyticsContext'

interface ProgressAnalyticsProps {
  className?: string
}

export default function ProgressAnalytics({ className = '' }: ProgressAnalyticsProps) {
  const { analyticsData } = useAnalytics()
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('week')
  const [selectedSubject, setSelectedSubject] = useState('all')

  if (!analyticsData) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <ChartLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados de progresso...</p>
        </CardContent>
      </Card>
    )
  }

  // Generate mock analytics data
  const generateProgressData = () => {
    const days = selectedTimeFrame === 'week' ? 7 : selectedTimeFrame === 'month' ? 30 : 90
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toISOString().split('T')[0],
        studyTime: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        score: Math.floor(Math.random() * 40) + 60, // 60-100%
        sessions: Math.floor(Math.random() * 5) + 1, // 1-5 sessions
        concepts: Math.floor(Math.random() * 8) + 2 // 2-10 concepts
      })
    }
    
    return data
  }

  const progressData = generateProgressData()

  // Calculate insights
  const calculateInsights = () => {
    const totalTime = progressData.reduce((sum, day) => sum + day.studyTime, 0)
    const avgScore = progressData.reduce((sum, day) => sum + day.score, 0) / progressData.length
    const totalSessions = progressData.reduce((sum, day) => sum + day.sessions, 0)
    const totalConcepts = progressData.reduce((sum, day) => sum + day.concepts, 0)
    
    // Trend calculations
    const recent = progressData.slice(-3)
    const previous = progressData.slice(-6, -3)
    
    const recentAvgTime = recent.reduce((sum, day) => sum + day.studyTime, 0) / recent.length
    const previousAvgTime = previous.reduce((sum, day) => sum + day.studyTime, 0) / previous.length
    const timeTrend = recentAvgTime > previousAvgTime ? 'up' : 'down'
    
    const recentAvgScore = recent.reduce((sum, day) => sum + day.score, 0) / recent.length
    const previousAvgScore = previous.reduce((sum, day) => sum + day.score, 0) / previous.length
    const scoreTrend = recentAvgScore > previousAvgScore ? 'up' : 'down'
    
    return {
      totalTime: Math.round(totalTime),
      avgScore: Math.round(avgScore),
      totalSessions,
      totalConcepts,
      timeTrend,
      scoreTrend,
      timeChange: Math.round(((recentAvgTime - previousAvgTime) / previousAvgTime) * 100),
      scoreChange: Math.round(((recentAvgScore - previousAvgScore) / previousAvgScore) * 100)
    }
  }

  const insights = calculateInsights()

  // Subject performance data
  const subjectPerformance = analyticsData.subjectProgress.map(subject => ({
    ...subject,
    efficiency: subject.timeSpent > 0 ? (subject.averageScore / subject.timeSpent) * 100 : 0,
    momentum: subject.completionPercentage > 50 ? 'high' : subject.completionPercentage > 20 ? 'medium' : 'low'
  }))

  // Learning velocity calculation
  const learningVelocity = {
    current: analyticsData.metrics.learningVelocity,
    target: 80,
    trend: 'stable' as 'up' | 'down' | 'stable'
  }

  // Performance metrics
  const performanceMetrics = [
    {
      title: 'Taxa de Retenção',
      value: `${Math.round(analyticsData.metrics.retentionRate)}%`,
      change: '+5%',
      trend: 'up' as const,
      icon: <Brain className="h-4 w-4" />,
      description: 'Conhecimento mantido'
    },
    {
      title: 'Eficácia de Aprendizado',
      value: `${Math.round(learningVelocity.current)}%`,
      change: learningVelocity.trend === 'up' ? '+8%' : learningVelocity.trend === 'down' ? '-3%' : '0%',
      trend: learningVelocity.trend,
      icon: <Lightning className="h-4 w-4" />,
      description: 'Velocidade de absorção'
    },
    {
      title: 'Consistência',
      value: `${analyticsData.streak.currentStreak}/${analyticsData.streak.longestStreak}`,
      change: analyticsData.streak.currentStreak > 5 ? '+12%' : '0%',
      trend: analyticsData.streak.currentStreak > 5 ? 'up' as const : 'stable' as const,
      icon: <Target className="h-4 w-4" />,
      description: 'Dias de estudo regular'
    },
    {
      title: 'Diversidade',
      value: `${analyticsData.subjectProgress.length}`,
      change: '+1',
      trend: 'up' as const,
      icon: <Book className="h-4 w-4" />,
      description: 'Matérias ativas'
    }
  ]

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />
      default: return <span className="h-3 w-3" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50'
      case 'down': return 'text-red-600 bg-red-50'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ChartLine className="h-6 w-6 text-primary" />
            Analytics de Progresso
          </h2>
          <p className="text-muted-foreground">
            Análise detalhada do seu desempenho de aprendizado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeFrame} onValueChange={setSelectedTimeFrame}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as matérias</SelectItem>
              {analyticsData.subjectProgress.map(subject => (
                <SelectItem key={subject.subject} value={subject.subject}>
                  {subject.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Overview metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {performanceMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {metric.icon}
                  </div>
                  <Badge className={`text-xs ${getTrendColor(metric.trend)}`}>
                    {getTrendIcon(metric.trend)}
                    {metric.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="subjects">Por Matéria</TabsTrigger>
          <TabsTrigger value="learning">Aprendizado</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Study time chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tempo de Estudo
                </CardTitle>
                <CardDescription>
                  Distribuição do tempo por dia ({selectedTimeFrame})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progressData.slice(-7).map((day) => {
                    const date = new Date(day.date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    
                    return (
                      <div key={day.date} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={isToday ? 'font-medium text-primary' : ''}>
                            {date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-muted-foreground">
                            {Math.floor(day.studyTime / 60)}h {day.studyTime % 60}m
                          </span>
                        </div>
                        <Progress 
                          value={(day.studyTime / 150) * 100} 
                          className="h-2"
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Total esta semana:</span>
                    <span className="font-medium">
                      {Math.floor(insights.totalTime / 60)}h {insights.totalTime % 60}m
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Desempenho
                </CardTitle>
                <CardDescription>
                  Pontuação média por dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progressData.slice(-7).map((day) => {
                    const date = new Date(day.date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    
                    return (
                      <div key={day.date} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={isToday ? 'font-medium text-primary' : ''}>
                            {date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-muted-foreground">
                            {day.score}%
                          </span>
                        </div>
                        <Progress 
                          value={day.score} 
                          className="h-2"
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Média esta semana:</span>
                    <span className="font-medium">{insights.avgScore}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {subjectPerformance.map((subject, index) => (
              <motion.div
                key={subject.subject}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{subject.subject}</CardTitle>
                      <Badge 
                        variant={subject.momentum === 'high' ? 'default' : subject.momentum === 'medium' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {subject.momentum === 'high' ? 'Alto momentum' : subject.momentum === 'medium' ? 'Médio momentum' : 'Baixo momentum'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso Geral</span>
                        <span>{Math.round(subject.completionPercentage)}%</span>
                      </div>
                      <Progress value={subject.completionPercentage} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tempo Total</p>
                        <p className="font-medium">{Math.floor(subject.timeSpent / 60)}h {subject.timeSpent % 60}m</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pontuação Média</p>
                        <p className="font-medium">{Math.round(subject.averageScore)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tópicos</p>
                        <p className="font-medium">{subject.topicsCompleted}/{subject.totalTopics}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Eficiência</p>
                        <p className="font-medium">{Math.round(subject.efficiency)}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Último acesso: {new Date(subject.lastAccessed).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* Learning Tab */}
        <TabsContent value="learning" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Análise Neuroadaptativa
                </CardTitle>
                <CardDescription>
                  Como seu cérebro está processando o conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Learning velocity */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Velocidade de Aprendizado</span>
                    <Badge variant="outline">{Math.round(learningVelocity.current)}% do ideal</Badge>
                  </div>
                  <Progress value={(learningVelocity.current / learningVelocity.target) * 100} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    Baseado na velocidade de absorção e retenção do conteúdo
                  </p>
                </div>
                
                {/* Strong and weak areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Áreas Fortes
                    </h4>
                    {analyticsData.metrics.strongAreas.length > 0 ? (
                      <div className="space-y-2">
                        {analyticsData.metrics.strongAreas.map((area, index) => (
                          <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                            {area}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Continue estudando para identificar suas forças</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-orange-600 flex items-center gap-1">
                      <X className="h-4 w-4" />
                      Áreas para Melhorar
                    </h4>
                    {analyticsData.metrics.weakAreas.length > 0 ? (
                      <div className="space-y-2">
                        {analyticsData.metrics.weakAreas.map((area, index) => (
                          <div key={index} className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                            {area}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Excelente! Nenhuma área fraca identificada</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Insights de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Padrão Identificado</h4>
                    <p className="text-sm text-blue-700">
                      Você aprende melhor durante as manhãs, com picos de performance entre 9h-11h.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-1">Recomendação</h4>
                    <p className="text-sm text-green-700">
                      Considere estudar tópicos mais complexos durante seu horário de maior produtividade.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-900 mb-1">Próximo Objetivo</h4>
                    <p className="text-sm text-purple-700">
                      Mantenha a consistência atual para alcançar 95% de retenção em 2 semanas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Otimizações Sugeridas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    title: 'Intervalos de Descanso',
                    description: 'Adicione pausas de 5min a cada 25min de estudo',
                    impact: 'Alto',
                    color: 'green'
                  },
                  {
                    title: 'Revisão Espaçada',
                    description: 'Revise conteúdos após 1, 3 e 7 dias',
                    impact: 'Médio',
                    color: 'blue'
                  },
                  {
                    title: 'Variedade de Matérias',
                    description: 'Alterne entre diferentes disciplinas',
                    impact: 'Médio',
                    color: 'purple'
                  }
                ].map((suggestion, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">{suggestion.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs
                          ${suggestion.color === 'green' ? 'text-green-600 border-green-300' : ''}
                          ${suggestion.color === 'blue' ? 'text-blue-600 border-blue-300' : ''}
                          ${suggestion.color === 'purple' ? 'text-purple-600 border-purple-300' : ''}
                        `}
                      >
                        {suggestion.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}