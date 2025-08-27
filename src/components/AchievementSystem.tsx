import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Target, 
  Users,
  CheckCircle,
  Lock,
  Gift
} from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Achievement } from '@/types/analytics'
import { useAnalytics } from '@/contexts/AnalyticsContext'

interface AchievementSystemProps {
  className?: string
}

export default function AchievementSystem({ className = '' }: AchievementSystemProps) {
  const { analyticsData } = useAnalytics()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')

  if (!analyticsData) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando sistema de conquistas...</p>
        </CardContent>
      </Card>
    )
  }

  const achievements = analyticsData.achievements

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity
    return categoryMatch && rarityMatch
  })

  // Group achievements by status
  const unlockedAchievements = filteredAchievements.filter(a => a.isUnlocked)
  const lockedAchievements = filteredAchievements.filter(a => !a.isUnlocked)

  // Achievement stats
  const totalAchievements = achievements.length
  const unlockedCount = achievements.filter(a => a.isUnlocked).length
  const totalPoints = achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.points, 0)
  const completionPercentage = (unlockedCount / totalAchievements) * 100

  // Category counts
  const categories = {
    all: achievements.length,
    study: achievements.filter(a => a.category === 'study').length,
    progress: achievements.filter(a => a.category === 'progress').length,
    milestone: achievements.filter(a => a.category === 'milestone').length,
    social: achievements.filter(a => a.category === 'social').length,
    special: achievements.filter(a => a.category === 'special').length
  }

  // Rarity counts
  const rarities = {
    all: achievements.length,
    common: achievements.filter(a => a.rarity === 'common').length,
    rare: achievements.filter(a => a.rarity === 'rare').length,
    epic: achievements.filter(a => a.rarity === 'epic').length,
    legendary: achievements.filter(a => a.rarity === 'legendary').length
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'study': return <BookOpen className="h-4 w-4" />
      case 'progress': return <Target className="h-4 w-4" />
      case 'milestone': return <Star className="h-4 w-4" />
      case 'social': return <Users className="h-4 w-4" />
      case 'special': return <Gift className="h-4 w-4" />
      default: return <Trophy className="h-4 w-4" />
    }
  }

  const getProgressTowardsAchievement = (achievement: Achievement) => {
    if (achievement.isUnlocked) return 100
    
    // Mock progress calculation based on current data
    switch (achievement.requirement.type) {
      case 'lessons_completed':
        return Math.min((analyticsData.metrics.sessionsCompleted / achievement.requirement.value) * 100, 100)
      case 'total_time':
        return Math.min((analyticsData.metrics.totalStudyTime / achievement.requirement.value) * 100, 100)
      case 'streak':
        return Math.min((analyticsData.streak.currentStreak / achievement.requirement.value) * 100, 100)
      default:
        return 0
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Sistema de Conquistas</h2>
            <p className="text-muted-foreground">
              Desbloqueie conquistas estudando e progredindo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              {unlockedCount}/{totalAchievements}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {totalPoints} pontos
            </Badge>
          </div>
        </div>

        {/* Overall progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Progresso Geral</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(completionPercentage)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Category filter */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Categoria</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([category, count]) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="flex items-center gap-1"
              >
                {getCategoryIcon(category)}
                {category === 'all' ? 'Todas' : category.charAt(0).toUpperCase() + category.slice(1)}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Rarity filter */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Raridade</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(rarities).map(([rarity, count]) => (
              <Button
                key={rarity}
                variant={selectedRarity === rarity ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRarity(rarity)}
                className="flex items-center gap-1"
              >
                {rarity === 'all' ? 'Todas' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Achievement tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              Todas ({filteredAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="unlocked">
              Desbloqueadas ({unlockedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Bloqueadas ({lockedAchievements.length})
            </TabsTrigger>
          </TabsList>

          {/* All achievements */}
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  progress={getProgressTowardsAchievement(achievement)}
                  index={index}
                />
              ))}
            </div>
          </TabsContent>

          {/* Unlocked achievements */}
          <TabsContent value="unlocked" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  progress={100}
                  index={index}
                />
              ))}
            </div>
            {unlockedAchievements.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma conquista desbloqueada
                </h3>
                <p className="text-muted-foreground">
                  Continue estudando para desbloquear suas primeiras conquistas!
                </p>
              </div>
            )}
          </TabsContent>

          {/* Locked achievements */}
          <TabsContent value="locked" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  progress={getProgressTowardsAchievement(achievement)}
                  index={index}
                />
              ))}
            </div>
            {lockedAchievements.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Todas as conquistas desbloqueadas!
                </h3>
                <p className="text-muted-foreground">
                  Parabéns! Você desbloqueou todas as conquistas disponíveis.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

// Individual Achievement Card Component
interface AchievementCardProps {
  achievement: Achievement
  progress: number
  index: number
}

function AchievementCard({ achievement, progress, index }: AchievementCardProps) {
  const isUnlocked = achievement.isUnlocked
  const isNearCompletion = progress >= 75 && !isUnlocked

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      <Card className={`
        h-full transition-all duration-300 hover:shadow-lg
        ${getRarityColor(achievement.rarity)}
        ${isUnlocked ? getRarityGlow(achievement.rarity) : ''}
        ${isNearCompletion ? 'animate-pulse' : ''}
        ${!isUnlocked ? 'opacity-75' : ''}
      `}>
        {/* Rarity indicator */}
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full
          ${achievement.rarity === 'common' ? 'bg-gray-400' : ''}
          ${achievement.rarity === 'rare' ? 'bg-blue-400' : ''}
          ${achievement.rarity === 'epic' ? 'bg-purple-400' : ''}
          ${achievement.rarity === 'legendary' ? 'bg-yellow-400' : ''}
        `} />

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className={`
              text-3xl p-2 rounded-lg
              ${isUnlocked ? 'bg-primary/10' : 'bg-muted'}
            `}>
              {isUnlocked ? achievement.icon : <Lock className="h-6 w-6 text-muted-foreground" />}
            </div>
            <div className="flex-1">
              <CardTitle className={`text-lg ${!isUnlocked ? 'text-muted-foreground' : ''}`}>
                {achievement.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {achievement.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Progress bar for locked achievements */}
            {!isUnlocked && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progresso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}

            {/* Achievement details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={isUnlocked ? "default" : "secondary"} className="text-xs">
                  {achievement.rarity}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {achievement.category}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3" />
                {achievement.points}
              </div>
            </div>

            {/* Unlock date for completed achievements */}
            {isUnlocked && achievement.unlockedAt && (
              <div className="text-xs text-muted-foreground">
                Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'border-gray-300 bg-gray-50'
    case 'rare': return 'border-blue-300 bg-blue-50'
    case 'epic': return 'border-purple-300 bg-purple-50'
    case 'legendary': return 'border-yellow-300 bg-yellow-50'
    default: return 'border-border bg-background'
  }
}

const getRarityGlow = (rarity: string) => {
  switch (rarity) {
    case 'rare': return 'shadow-lg shadow-blue-200/50'
    case 'epic': return 'shadow-lg shadow-purple-200/50'
    case 'legendary': return 'shadow-lg shadow-yellow-200/50'
    default: return ''
  }
}