import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
// import { useAnalytics } from '@/contexts/AnalyticsContext' - unused
import { Target, Calendar, CheckCircle, Clock, TrendingUp } from '@phosphor-icons/react'

interface WeeklyGoalsWidgetProps {
  className?: string
}

interface WeeklyGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  category: 'time' | 'sessions' | 'topics' | 'streak'
  dueDate: Date
  completed: boolean
}

export default function WeeklyGoalsWidget({ className = '' }: WeeklyGoalsWidgetProps) {
  // Mock weekly goals for demonstration
  const weeklyGoals: WeeklyGoal[] = [
    {
      id: '1',
      title: 'Estudar 10 horas',
      description: 'Complete 10 horas de estudo esta semana',
      target: 600, // 10 hours in minutes
      current: 380, // 6.3 hours completed
      unit: 'minutos',
      category: 'time',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      completed: false
    },
    {
      id: '2',
      title: 'Manter sequência',
      description: 'Estudar todos os dias da semana',
      target: 7,
      current: 5,
      unit: 'dias',
      category: 'streak',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      completed: false
    },
    {
      id: '3',
      title: 'Completar 15 tópicos',
      description: 'Finalize 15 tópicos de estudo',
      target: 15,
      current: 15,
      unit: 'tópicos',
      category: 'topics',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      completed: true
    },
    {
      id: '4',
      title: '20 sessões de estudo',
      description: 'Complete 20 sessões de aprendizado',
      target: 20,
      current: 12,
      unit: 'sessões',
      category: 'sessions',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      completed: false
    }
  ]

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getCategoryIcon = (category: WeeklyGoal['category']) => {
    switch (category) {
      case 'time':
        return <Clock className="h-4 w-4 text-accent" />
      case 'sessions':
        return <Calendar className="h-4 w-4 text-primary" />
      case 'topics':
        return <CheckCircle className="h-4 w-4 text-chart-2" />
      case 'streak':
        return <TrendingUp className="h-4 w-4 text-secondary" />
      default:
        return <Target className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getCategoryColor = (category: WeeklyGoal['category']) => {
    switch (category) {
      case 'time':
        return 'text-accent'
      case 'sessions':
        return 'text-primary'
      case 'topics':
        return 'text-chart-2'
      case 'streak':
        return 'text-secondary'
      default:
        return 'text-muted-foreground'
    }
  }

  const formatValue = (value: number, unit: string, category: WeeklyGoal['category']) => {
    if (category === 'time') {
      const hours = Math.floor(value / 60)
      const minutes = value % 60
      return `${hours}h ${minutes}m`
    }
    return `${value} ${unit}`
  }

  const getDaysRemaining = (dueDate: Date) => {
    const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const completedGoals = weeklyGoals.filter(goal => goal.completed).length
  const totalGoals = weeklyGoals.length
  const overallProgress = (completedGoals / totalGoals) * 100

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Metas Semanais
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {completedGoals}/{totalGoals}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progresso geral</span>
            <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Individual Goals */}
        <div className="space-y-3">
          {weeklyGoals.map((goal, index) => {
            const progress = getProgressPercentage(goal.current, goal.target)
            const daysRemaining = getDaysRemaining(goal.dueDate)
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  goal.completed 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-card hover:shadow-sm'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(goal.category)}
                      <span className="text-sm font-medium">{goal.title}</span>
                      {goal.completed && (
                        <Badge variant="secondary" className="text-xs">
                          Concluído
                        </Badge>
                      )}
                    </div>
                    <span className={`text-xs ${getCategoryColor(goal.category)}`}>
                      {daysRemaining === 0 ? 'Hoje' : `${daysRemaining}d`}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {goal.description}
                  </p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {formatValue(goal.current, goal.unit, goal.category)} de {formatValue(goal.target, goal.unit, goal.category)}
                      </span>
                      <span className={`font-medium ${progress >= 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress 
                      value={progress} 
                      className={`h-1.5 ${goal.completed ? 'bg-green-100' : ''}`}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Weekly Summary */}
        <div className="pt-2 border-t space-y-2">
          <h4 className="text-sm font-medium">Resumo da semana</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metas ativas:</span>
              <span className="font-medium">{totalGoals - completedGoals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concluídas:</span>
              <span className="font-medium text-green-600">{completedGoals}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}