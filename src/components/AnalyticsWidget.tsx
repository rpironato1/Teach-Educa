import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { Trophy, Fire, Clock, TrendingUp, Award, ChartBar, TestTube } from '@phosphor-icons/react'

interface AnalyticsWidgetProps {
  onOpenFullAnalytics?: () => void
  className?: string
}

export default function AnalyticsWidget({ onOpenFullAnalytics, className = '' }: AnalyticsWidgetProps) {
  const { 
    analyticsData, 
    currentSession, 
    isLoading,
    unlockAchievement 
  } = useAnalytics()

  if (isLoading || !analyticsData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="h-5 w-5 text-primary animate-pulse" />
            Analytics
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

  const levelProgress = (analyticsData.totalPoints % 1000) / 10
  const unlockedAchievements = analyticsData.achievements.filter(a => a.isUnlocked)
  const lockedAchievements = analyticsData.achievements.filter(a => !a.isUnlocked)
  const recentAchievement = unlockedAchievements
    .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())[0]

  const testUnlockAchievement = () => {
    if (lockedAchievements.length > 0) {
      unlockAchievement(lockedAchievements[0].id)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="h-5 w-5 text-primary" />
            Seu Progresso
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onOpenFullAnalytics}>
            Ver tudo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Session */}
        {currentSession && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-primary/10 border border-primary/20 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Sessão ativa</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{currentSession.subject}</span>
              <span className="text-sm font-medium">
                {Math.floor((Date.now() - currentSession.startTime.getTime()) / (1000 * 60))}min
              </span>
            </div>
          </motion.div>
        )}

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="font-medium">Nível {analyticsData.level}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {analyticsData.totalPoints} XP
            </span>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            {Math.floor((1000 - (analyticsData.totalPoints % 1000)))} XP para o próximo nível
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Fire className="h-3 w-3 text-secondary" />
            </div>
            <div className="text-lg font-bold text-secondary">
              {analyticsData.streak.currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">dias</div>
          </div>
          
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-accent" />
            </div>
            <div className="text-lg font-bold text-accent">
              {Math.floor(analyticsData.metrics.totalStudyTime / 60)}h
            </div>
            <div className="text-xs text-muted-foreground">total</div>
          </div>
          
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="h-3 w-3 text-primary" />
            </div>
            <div className="text-lg font-bold text-primary">
              {unlockedAchievements.length}
            </div>
            <div className="text-xs text-muted-foreground">badges</div>
          </div>
        </div>

        {/* Recent Achievement */}
        {recentAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="text-xl">{recentAchievement.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Conquista recente!</span>
                  <Badge variant="secondary" className="text-xs">
                    +{recentAchievement.points} XP
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {recentAchievement.title}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Test Achievement Button (for development) */}
        {process.env.NODE_ENV === 'development' && lockedAchievements.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testUnlockAchievement}
            className="w-full text-xs"
          >
            <TestTube className="h-3 w-3 mr-1" />
            Testar Conquista
          </Button>
        )}

        {/* Weekly Goal Progress */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-chart-2" />
            <span className="text-sm font-medium">Meta semanal</span>
          </div>
          <div className="space-y-1">
            <Progress value={60} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>6 de 10 horas</span>
              <span>60%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}