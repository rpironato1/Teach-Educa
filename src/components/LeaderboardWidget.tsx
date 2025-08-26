import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, Crown, Fire } from '@phosphor-icons/react'
import { LeaderboardEntry } from '@/types/analytics'

interface LeaderboardWidgetProps {
  leaderboard: LeaderboardEntry[]
  className?: string
}

export default function LeaderboardWidget({ leaderboard, className = '' }: LeaderboardWidgetProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" weight="fill" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" weight="fill" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" weight="fill" />
      default:
        return <span className="font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankCardStyle = (rank: number, isCurrentUser?: boolean) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30'
    }
    if (rank <= 3) {
      return 'bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/30'
    }
    return ''
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Ranking Global
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.slice(0, 10).map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${getRankCardStyle(entry.rank, entry.isCurrentUser)}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium truncate ${entry.isCurrentUser ? 'text-primary' : ''}`}>
                      {entry.username}
                    </span>
                    {entry.isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        Você
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Crown className="h-3 w-3 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Nível {entry.level}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Fire className="h-3 w-3 text-secondary" />
                      <span className="text-xs text-muted-foreground">
                        {entry.streak} dias
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-primary">
                    {entry.points.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    pontos
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário no ranking ainda</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}