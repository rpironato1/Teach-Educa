import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Achievement } from '@/types/analytics'
import { Lock } from '@phosphor-icons/react'

interface AchievementCardProps {
  achievement: Achievement
  className?: string
}

export default function AchievementCard({ achievement, className = '' }: AchievementCardProps) {
  const rarityColors = {
    common: 'bg-muted text-muted-foreground',
    rare: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    epic: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    legendary: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
  }

  const categoryIcons = {
    study: '📚',
    progress: '📈',
    social: '👥',
    milestone: '🎯',
    special: '⭐'
  }

  return (
    <motion.div
      whileHover={{ scale: achievement.isUnlocked ? 1.02 : 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={className}
    >
      <Card className={`h-full transition-all duration-200 ${
        achievement.isUnlocked 
          ? 'shadow-md hover:shadow-lg border-primary/20' 
          : 'opacity-60 grayscale'
      }`}>
        <CardHeader className="text-center pb-4">
          <div className="relative mx-auto mb-3">
            <div className={`text-4xl ${achievement.isUnlocked ? '' : 'opacity-50'}`}>
              {achievement.isUnlocked ? achievement.icon : '🔒'}
            </div>
            {!achievement.isUnlocked && (
              <Lock className="absolute top-0 right-0 h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="text-lg font-semibold">
            {achievement.title}
          </CardTitle>
          <div className="flex justify-center gap-2 mt-2">
            <Badge 
              variant="outline" 
              className={rarityColors[achievement.rarity]}
            >
              {achievement.rarity}
            </Badge>
            <Badge variant="secondary">
              {categoryIcons[achievement.category]} {achievement.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground text-center mb-4">
            {achievement.description}
          </p>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Recompensa:</span>
              <span className="font-medium text-primary">
                {achievement.points} XP
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Requisito:</span>
              <span className="font-medium">
                {achievement.requirement.type === 'streak' && `${achievement.requirement.value} dias consecutivos`}
                {achievement.requirement.type === 'total_time' && `${achievement.requirement.value} minutos`}
                {achievement.requirement.type === 'lessons_completed' && `${achievement.requirement.value} lições`}
                {achievement.requirement.type === 'perfect_scores' && `${achievement.requirement.value} notas perfeitas`}
                {achievement.requirement.type === 'login_days' && `${achievement.requirement.value} dias de login`}
                {achievement.requirement.type === 'credits_used' && `${achievement.requirement.value} créditos`}
              </span>
            </div>
            
            {achievement.isUnlocked && achievement.unlockedAt && (
              <div className="flex justify-between items-center text-primary">
                <span>Desbloqueado em:</span>
                <span className="font-medium">
                  {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}