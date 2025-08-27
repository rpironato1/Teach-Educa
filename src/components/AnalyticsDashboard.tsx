import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import AchievementCard from '@/components/AchievementCard'
import NotificationCenter from '@/components/NotificationCenter'
import ProgressChart from '@/components/ProgressChart'
import LeaderboardWidget from '@/components/LeaderboardWidget'
import StudyStreakWidget from '@/components/StudyStreakWidget'
import WeeklyGoalsWidget from '@/components/WeeklyGoalsWidget'
import SubjectProgressWidget from '@/components/SubjectProgressWidget'
import {
  ChartBar,
  Trophy,
  Fire,
  Clock,
  Brain,
  Target,
  Star,
  TrendingUp,
  Calendar,
  Medal,
  Award,
  Users,
  BookOpen
} from '@phosphor-icons/react'

interface AnalyticsDashboardProps {
  className?: string
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const { 
    analyticsData, 
    leaderboard, 
    notifications,
    isLoading, 
    error,
    refreshData 
  } = useAnalytics()
  
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) {
    return <LoadingSpinner message="Carregando analytics..." />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-destructive mb-4">
          <ChartBar className="h-12 w-12" />
        </div>
        <p className="text-foreground mb-4">{error}</p>
        <Button onClick={refreshData}>Tentar Novamente</Button>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Brain className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhum dado de analytics disponível</p>
      </div>
    )
  }

  const unlockedAchievements = analyticsData.achievements.filter(a => a.isUnlocked)

  const levelProgress = (analyticsData.totalPoints % 1000) / 10 // Assuming 1000 points per level

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with key metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nível</p>
                <p className="text-2xl font-bold text-primary">{analyticsData.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <Fire className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sequência</p>
                <p className="text-2xl font-bold text-secondary">{analyticsData.streak.currentStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo Total</p>
                <p className="text-2xl font-bold text-accent">
                  {Math.floor(analyticsData.metrics.totalStudyTime / 60)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-2/20 rounded-lg">
                <Star className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conquistas</p>
                <p className="text-2xl font-bold text-chart-2">{unlockedAchievements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Analytics Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ChartBar className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progresso
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Progresso de Nível
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nível {analyticsData.level}</span>
                  <span className="text-sm text-muted-foreground">
                    {analyticsData.totalPoints} / {analyticsData.nextLevelPoints} XP
                  </span>
                </div>
                <Progress value={levelProgress} className="h-3" />
                <div className="text-center text-xs text-muted-foreground">
                  {analyticsData.nextLevelPoints - analyticsData.totalPoints} XP para o próximo nível
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sessão de Matemática</p>
                      <p className="text-xs text-muted-foreground">2 horas atrás</p>
                    </div>
                    <Badge variant="outline">+50 XP</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <Trophy className="h-4 w-4 text-chart-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Conquista Desbloqueada</p>
                      <p className="text-xs text-muted-foreground">1 dia atrás</p>
                    </div>
                    <Badge variant="secondary">+100 XP</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <Fire className="h-4 w-4 text-secondary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sequência de 7 dias</p>
                      <p className="text-xs text-muted-foreground">2 dias atrás</p>
                    </div>
                    <Badge variant="outline">+25 XP</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Study Streak and Weekly Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudyStreakWidget />
            <WeeklyGoalsWidget />
          </div>

          {/* Progress Chart */}
          <ProgressChart />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SubjectProgressWidget />
            <ProgressChart />
          </div>
          
          {/* Detailed metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Tempo de Estudo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">
                      {Math.floor(analyticsData.metrics.totalStudyTime / 60)}h {analyticsData.metrics.totalStudyTime % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Média por sessão:</span>
                    <span className="font-medium">
                      {Math.floor(analyticsData.metrics.averageSessionTime / 60)}h {analyticsData.metrics.averageSessionTime % 60}m
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sessões:</span>
                    <span className="font-medium">{analyticsData.metrics.sessionsCompleted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de retenção:</span>
                    <span className="font-medium">{analyticsData.metrics.retentionRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Conceitos dominados:</span>
                    <span className="font-medium">{analyticsData.metrics.conceptsMastered}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Velocidade:</span>
                    <span className="font-medium">{analyticsData.metrics.learningVelocity}x</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" />
                  Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Posição:</span>
                    <span className="font-medium">#{analyticsData.rank}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total de usuários:</span>
                    <span className="font-medium">{analyticsData.totalUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Top:</span>
                    <span className="font-medium">
                      {((1 - (analyticsData.rank / analyticsData.totalUsers)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Achievement Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{unlockedAchievements.length}</div>
                <div className="text-sm text-muted-foreground">Desbloqueadas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Medal className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary">
                  {analyticsData.achievements.filter(a => a.rarity === 'rare' && a.isUnlocked).length}
                </div>
                <div className="text-sm text-muted-foreground">Raras</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-accent">
                  {analyticsData.achievements.filter(a => a.rarity === 'epic' && a.isUnlocked).length}
                </div>
                <div className="text-sm text-muted-foreground">Épicas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-chart-2 mx-auto mb-2" />
                <div className="text-2xl font-bold text-chart-2">
                  {analyticsData.achievements.filter(a => a.rarity === 'legendary' && a.isUnlocked).length}
                </div>
                <div className="text-sm text-muted-foreground">Lendárias</div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.achievements.map((achievement) => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement}
                className="hover:scale-105 transition-transform duration-200"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeaderboardWidget leaderboard={leaderboard} />
            <NotificationCenter />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}