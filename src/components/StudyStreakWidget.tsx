import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { Fire, Calendar, Trophy, Target, CheckCircle } from '@phosphor-icons/react'

interface StudyStreakWidgetProps {
  className?: string
}

export default function StudyStreakWidget({ className = '' }: StudyStreakWidgetProps) {
  const { analyticsData } = useAnalytics()
  const [showDetails, setShowDetails] = useState(false)

  if (!analyticsData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fire className="h-5 w-5 text-primary animate-pulse" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const { streak } = analyticsData
  const streakMilestones = [
    { days: 7, title: 'Uma Semana', icon: '🔥', reward: '50 XP' },
    { days: 30, title: 'Um Mês', icon: '💪', reward: '200 XP' },
    { days: 90, title: 'Três Meses', icon: '🏆', reward: '500 XP' },
    { days: 365, title: 'Um Ano', icon: '👑', reward: '1000 XP' }
  ]

  const nextMilestone = streakMilestones.find(m => m.days > streak.currentStreak)
  const daysToNextMilestone = nextMilestone ? nextMilestone.days - streak.currentStreak : 0
  const lastWeekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  const isStudyDay = (date: Date) => {
    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff < streak.currentStreak
  }

  const getStreakLevel = (days: number) => {
    if (days >= 365) return { level: 'Lendário', color: 'text-yellow-500', bgColor: 'bg-yellow-50 border-yellow-200' }
    if (days >= 90) return { level: 'Épico', color: 'text-purple-500', bgColor: 'bg-purple-50 border-purple-200' }
    if (days >= 30) return { level: 'Avançado', color: 'text-blue-500', bgColor: 'bg-blue-50 border-blue-200' }
    if (days >= 7) return { level: 'Iniciante', color: 'text-green-500', bgColor: 'bg-green-50 border-green-200' }
    return { level: 'Começando', color: 'text-gray-500', bgColor: 'bg-gray-50 border-gray-200' }
  }

  const streakLevel = getStreakLevel(streak.currentStreak)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fire className="h-5 w-5 text-secondary" />
          Sequência de Estudos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Streak Display */}
        <div className="text-center space-y-2">
          <motion.div
            className="text-4xl font-bold text-secondary"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {streak.currentStreak}
          </motion.div>
          <div className="text-sm text-muted-foreground">
            {streak.currentStreak === 1 ? 'dia consecutivo' : 'dias consecutivos'}
          </div>
          
          <Badge variant="outline" className={`${streakLevel.bgColor} ${streakLevel.color} border`}>
            {streakLevel.level}
          </Badge>
        </div>

        {/* Weekly Calendar */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Últimos 7 dias
          </h4>
          <div className="grid grid-cols-7 gap-1">
            {lastWeekDays.map((date, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  {date.toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                </div>
                <div className={`w-8 h-8 rounded border-2 flex items-center justify-center ${
                  isStudyDay(date) 
                    ? 'bg-secondary border-secondary' 
                    : 'border-muted bg-muted/30'
                }`}>
                  {isStudyDay(date) && (
                    <CheckCircle className="h-4 w-4 text-white" weight="fill" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-primary">
              {streak.longestStreak}
            </div>
            <div className="text-xs text-muted-foreground">
              Maior sequência
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-chart-2">
              {Math.floor((Date.now() - streak.streakStartDate.getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-xs text-muted-foreground">
              Dias desde início
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{nextMilestone.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">Próxima meta:</span>
                  <Badge variant="secondary" className="text-xs">
                    {nextMilestone.reward}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {nextMilestone.title} em {daysToNextMilestone} {daysToNextMilestone === 1 ? 'dia' : 'dias'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Marcos alcançados
          </h4>
          <div className="space-y-1">
            {streakMilestones
              .filter(m => m.days <= streak.currentStreak)
              .map((milestone, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <span>{milestone.icon}</span>
                  <span className="text-muted-foreground">{milestone.title}</span>
                  <span className="text-primary font-medium ml-auto">{milestone.reward}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Toggle Details */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-xs"
        >
          {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
        </Button>

        {/* Additional Details */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pt-2 border-t"
          >
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Último estudo:</span>
                <span>{streak.lastStudyDate.toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Início da sequência:</span>
                <span>{streak.streakStartDate.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}