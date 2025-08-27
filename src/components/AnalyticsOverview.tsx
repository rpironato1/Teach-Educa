import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  ChartBar,
  Fire,
  Star,
  Clock,
  Award,
  Users,
  Brain,
  Lightning,
  Medal,
  Rocket
} from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import AchievementCard from './AchievementCard'
import ProgressChart from './ProgressChart'
import LeaderboardWidget from './LeaderboardWidget'
import StudyStreakWidget from './StudyStreakWidget'
import SubjectProgressWidget from './SubjectProgressWidget'
import NotificationCenter from './NotificationCenter'
import WeeklyGoalsWidget from './WeeklyGoalsWidget'
import LoadingSpinner from '@/components/LoadingSpinner'

interface AnalyticsOverviewProps {
  className?: string
}

export default function AnalyticsOverview({ className = '' }: AnalyticsOverviewProps) {
  const { 
    analyticsData, 
    leaderboard, 
    notifications,
    isLoading, 
    error,
    refreshData 
  } = useAnalytics()
  
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('week')

  // Level progression calculation
  const getLevelProgress = () => {
    if (!analyticsData) return 0
    const pointsInCurrentLevel = analyticsData.totalPoints % 1000
    return (pointsInCurrentLevel / 1000) * 100
  }

  // Recent achievements
  const getRecentAchievements = () => {
    if (!analyticsData) return []
    return analyticsData.achievements
      .filter(a => a.isUnlocked)
      .sort((a, b) => {
        if (!a.unlockedAt || !b.unlockedAt) return 0
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
      })
      .slice(0, 3)
  }

  // Stats cards data
  const getStatsCards = () => {
    if (!analyticsData) return []
    
    return [
      {
        title: 'Pontos Totais',
        value: analyticsData.totalPoints.toLocaleString(),
        icon: <Star className="h-5 w-5 text-yellow-500" weight="fill" />,
        change: '+12%',
        changeType: 'positive' as const,
        description: 'Esta semana'
      },
      {
        title: 'Sequência Atual',
        value: `${analyticsData.streak.currentStreak} dias`,
        icon: <Fire className="h-5 w-5 text-orange-500" weight="fill" />,
        change: analyticsData.streak.currentStreak > analyticsData.streak.longestStreak / 2 ? '+3' : '0',
        changeType: analyticsData.streak.currentStreak > 0 ? 'positive' as const : 'neutral' as const,
        description: 'Dias consecutivos'
      },
      {
        title: 'Tempo de Estudo',
        value: `${Math.round(analyticsData.metrics.totalStudyTime / 60)}h`,
        icon: <Clock className="h-5 w-5 text-blue-500" weight="fill" />,
        change: '+8h',
        changeType: 'positive' as const,
        description: 'Esta semana'
      },
      {
        title: 'Posição no Ranking',
        value: `#${analyticsData.rank}`,
        icon: <Trophy className="h-5 w-5 text-purple-500" weight="fill" />,
        change: analyticsData.rank < 100 ? '-5' : '+12',
        changeType: analyticsData.rank < 100 ? 'positive' as const : 'negative' as const,
        description: `de ${analyticsData.totalUsers}`
      }
    ]
  }

  if (isLoading) {
    return <LoadingSpinner message="Carregando analytics..." />
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refreshData}>Tentar Novamente</Button>
        </CardContent>
      </Card>
    )
  }

  if (!analyticsData) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum dado de analytics disponível</p>
        </CardContent>
      </Card>
    )
  }

  const statsCards = getStatsCards()
  const recentAchievements = getRecentAchievements()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Gamificação</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e conquistas de aprendizado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Lightning className="h-3 w-3" />
            Nível {analyticsData.level}
          </Badge>
          <Button onClick={refreshData} size="sm" variant="outline">
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Progressão de Nível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Nível {analyticsData.level}</span>
                <span>Nível {analyticsData.level + 1}</span>
              </div>
              <Progress value={getLevelProgress()} className="h-3" />
              <p className="text-sm text-muted-foreground text-center">
                {analyticsData.nextLevelPoints - (analyticsData.totalPoints % 1000)} pontos para o próximo nível
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge 
                        variant={stat.changeType === 'positive' ? 'default' : stat.changeType === 'negative' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {stat.change}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {stat.description}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs for different views */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Study Streak */}
              <StudyStreakWidget 
                streak={analyticsData.streak}
                className="h-fit"
              />

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-accent" />
                    Conquistas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentAchievements.length > 0 ? (
                    <div className="space-y-3">
                      {recentAchievements.map((achievement, index) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <span className="text-2xl">{achievement.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{achievement.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {achievement.points} pontos
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {achievement.rarity}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Medal className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Nenhuma conquista recente
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Subject Progress and Weekly Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SubjectProgressWidget 
                subjects={analyticsData.subjectProgress}
              />
              <WeeklyGoalsWidget />
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsData.achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AchievementCard 
                    achievement={achievement}
                    className="h-full"
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProgressChart 
                data={analyticsData.weeklyProgress}
                timeFrame={selectedTimeFrame}
                onTimeFrameChange={setSelectedTimeFrame}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChartBar className="h-5 w-5 text-primary" />
                    Métricas de Aprendizado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {analyticsData.metrics.conceptsMastered}
                      </p>
                      <p className="text-sm text-muted-foreground">Conceitos Dominados</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-secondary">
                        {Math.round(analyticsData.metrics.retentionRate)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Taxa de Retenção</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-accent">
                        {analyticsData.metrics.sessionsCompleted}
                      </p>
                      <p className="text-sm text-muted-foreground">Sessões Completas</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-chart-2">
                        {analyticsData.metrics.averageSessionTime}min
                      </p>
                      <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LeaderboardWidget leaderboard={leaderboard} />
              </div>
              <div className="space-y-6">
                <NotificationCenter 
                  notifications={notifications}
                  className="h-fit"
                />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Comunidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center py-4">
                      <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Recursos sociais em breve
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}