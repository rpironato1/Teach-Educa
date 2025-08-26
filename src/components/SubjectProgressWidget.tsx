import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { BookOpen, Clock, Star, TrendingUp, CheckCircle } from '@phosphor-icons/react'
import { SubjectProgress } from '@/types/analytics'

interface SubjectProgressWidgetProps {
  className?: string
}

export default function SubjectProgressWidget({ className = '' }: SubjectProgressWidgetProps) {
  const { analyticsData } = useAnalytics()

  if (!analyticsData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary animate-pulse" />
            Progresso por Matéria
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

  const getDifficultyColor = (difficulty: SubjectProgress['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'advanced':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-muted-foreground bg-muted border-border'
    }
  }

  const getDifficultyLabel = (difficulty: SubjectProgress['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'Iniciante'
      case 'intermediate':
        return 'Intermediário'
      case 'advanced':
        return 'Avançado'
      default:
        return 'Não definido'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getSubjectIcon = (subject: string) => {
    // Map subjects to appropriate icons
    const iconMap: { [key: string]: string } = {
      'Matemática': '🔢',
      'Física': '⚛️',
      'Química': '🧪',
      'Biologia': '🧬',
      'História': '📚',
      'Geografia': '🌍',
      'Literatura': '📖',
      'Inglês': '🇺🇸',
      'Espanhol': '🇪🇸',
      'Filosofia': '🤔',
      'Sociologia': '👥',
      'Programação': '💻',
      'Design': '🎨',
      'Música': '🎵'
    }
    return iconMap[subject] || '📘'
  }

  const sortedSubjects = [...analyticsData.subjectProgress].sort((a, b) => 
    b.completionPercentage - a.completionPercentage
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Progresso por Matéria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedSubjects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma matéria em progresso</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedSubjects.map((subject, index) => (
              <motion.div
                key={subject.subject}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border bg-card hover:shadow-sm transition-all duration-200"
              >
                <div className="space-y-3">
                  {/* Subject Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getSubjectIcon(subject.subject)}</span>
                      <div>
                        <h3 className="font-medium">{subject.subject}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getDifficultyColor(subject.difficulty)}`}
                          >
                            {getDifficultyLabel(subject.difficulty)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Última atividade: {subject.lastAccessed.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getProgressColor(subject.completionPercentage)}`}>
                        {Math.round(subject.completionPercentage)}%
                      </div>
                      <div className="text-xs text-muted-foreground">completo</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <Progress 
                      value={subject.completionPercentage} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{subject.topicsCompleted} de {subject.totalTopics} tópicos</span>
                      <span>{Math.round(subject.completionPercentage)}% concluído</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-3 w-3 text-accent" />
                      </div>
                      <div className="text-sm font-medium text-accent">
                        {formatTimeSpent(subject.timeSpent)}
                      </div>
                      <div className="text-xs text-muted-foreground">tempo</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="h-3 w-3 text-primary" />
                      </div>
                      <div className="text-sm font-medium text-primary">
                        {subject.averageScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">média</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <CheckCircle className="h-3 w-3 text-chart-2" />
                      </div>
                      <div className="text-sm font-medium text-chart-2">
                        {subject.topicsCompleted}
                      </div>
                      <div className="text-xs text-muted-foreground">tópicos</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary */}
        {sortedSubjects.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Resumo
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Matérias ativas:</span>
                <span className="font-medium">{sortedSubjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progresso médio:</span>
                <span className="font-medium">
                  {Math.round(
                    sortedSubjects.reduce((acc, s) => acc + s.completionPercentage, 0) / 
                    sortedSubjects.length
                  )}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tempo total:</span>
                <span className="font-medium">
                  {formatTimeSpent(
                    sortedSubjects.reduce((acc, s) => acc + s.timeSpent, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tópicos concluídos:</span>
                <span className="font-medium">
                  {sortedSubjects.reduce((acc, s) => acc + s.topicsCompleted, 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}