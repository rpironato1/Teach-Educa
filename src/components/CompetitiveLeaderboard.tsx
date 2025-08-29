import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Medal, 
  Crown, 
  Sword,
  Fire,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Award,
  Timer,
  Ranking
} from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { useAuth } from '@/contexts/AuthContext'

interface CompetitiveLeaderboardProps {
  className?: string
}

export default function CompetitiveLeaderboard({ className = '' }: CompetitiveLeaderboardProps) {
  const { leaderboard, analyticsData: _analyticsData, loadLeaderboard } = useAnalytics()
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('weekly')
  const [_showDetails, _setShowDetails] = useState(false)

  // Mock competition data
  const [activeCompetitions] = useState([
    {
      id: 'math-week',
      title: 'Semana da Matemática',
      description: 'Competição de matemática básica',
      participants: 156,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      prize: '500 pontos extras',
      category: 'mathematics',
      difficulty: 'intermediate',
      isActive: true
    },
    {
      id: 'study-streak',
      title: 'Maratona de Estudo',
      description: 'Quem consegue a maior sequência?',
      participants: 89,
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
      prize: 'Badge exclusivo + 1000 pontos',
      category: 'general',
      difficulty: 'all',
      isActive: true
    }
  ])

  useEffect(() => {
    loadLeaderboard()
  }, [selectedPeriod, loadLeaderboard])

  const getCurrentUserRank = () => {
    const userEntry = leaderboard.find(entry => entry.userId === user?.id)
    return userEntry?.rank || 0
  }

  const getTopThree = () => {
    return leaderboard.slice(0, 3)
  }

  const getRestOfLeaderboard = () => {
    return leaderboard.slice(3, 15)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" weight="fill" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-600" weight="fill" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" weight="fill" />
      default:
        return <span className="font-bold text-lg text-muted-foreground">#{rank}</span>
    }
  }

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h`
    }
    return `${hours}h`
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
            <Trophy className="h-6 w-6 text-primary" />
            Ranking & Competições
          </h2>
          <p className="text-muted-foreground">
            Compete com outros estudantes e alcance o topo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Ranking className="h-3 w-3" />
            Posição #{getCurrentUserRank()}
          </Badge>
          <Button onClick={loadLeaderboard} size="sm" variant="outline">
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* Period selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        {[
          { key: 'daily', label: 'Hoje', icon: <Calendar className="h-3 w-3" /> },
          { key: 'weekly', label: 'Semana', icon: <TrendingUp className="h-3 w-3" /> },
          { key: 'monthly', label: 'Mês', icon: <Star className="h-3 w-3" /> },
          { key: 'alltime', label: 'Geral', icon: <Trophy className="h-3 w-3" /> }
        ].map((period) => (
          <Button
            key={period.key}
            variant={selectedPeriod === period.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period.key as 'daily' | 'weekly' | 'monthly' | 'alltime')}
            className="flex items-center gap-1"
          >
            {period.icon}
            {period.label}
          </Button>
        ))}
      </motion.div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="competitions">Competições</TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          {/* Top 3 Podium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center">🏆 TOP 3 🏆</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-end gap-4 py-6">
                  {getTopThree().map((entry, index) => {
                    const positions = [1, 0, 2] // Center first place
                    const actualIndex = positions[index]
                    const heights = ['h-32', 'h-40', 'h-28']
                    const delays = [0.1, 0, 0.2]
                    
                    return (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: delays[index] }}
                        className={`flex flex-col items-center ${heights[actualIndex]} justify-end relative`}
                      >
                        {/* Trophy/Crown */}
                        <div className="absolute -top-8 z-10">
                          {getRankIcon(entry.rank)}
                        </div>
                        
                        {/* Podium */}
                        <div className={`
                          w-20 ${heights[actualIndex]} rounded-t-lg flex flex-col justify-between p-3
                          ${entry.rank === 1 ? 'bg-gradient-to-t from-yellow-200 to-yellow-100 border-2 border-yellow-300' : ''}
                          ${entry.rank === 2 ? 'bg-gradient-to-t from-gray-200 to-gray-100 border-2 border-gray-300' : ''}
                          ${entry.rank === 3 ? 'bg-gradient-to-t from-amber-200 to-amber-100 border-2 border-amber-300' : ''}
                          ${entry.isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : ''}
                        `}>
                          <div className="text-center">
                            <Avatar className="w-12 h-12 mx-auto mb-2">
                              <AvatarImage src={entry.avatar} />
                              <AvatarFallback>
                                {entry.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-xs font-medium truncate">{entry.username}</p>
                            <p className="text-xs text-muted-foreground">{entry.points.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-foreground">#{entry.rank}</div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Rest of leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Ranking Completo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getRestOfLeaderboard().map((entry, index) => (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border transition-colors
                        ${entry.isCurrentUser 
                          ? 'bg-primary/5 border-primary/30' 
                          : 'hover:bg-muted/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 text-center">
                          <span className="font-bold text-muted-foreground">#{entry.rank}</span>
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={entry.avatar} />
                          <AvatarFallback className="text-xs">
                            {entry.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {entry.username}
                            {entry.isCurrentUser && (
                              <Badge variant="secondary" className="ml-2 text-xs">Você</Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">Nível {entry.level}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-right">
                        <div className="flex items-center gap-1">
                          <Fire className="h-3 w-3 text-orange-500" />
                          <span className="text-xs">{entry.streak}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {entry.points.toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Competitions Tab */}
        <TabsContent value="competitions" className="space-y-6">
          {/* Active competitions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {activeCompetitions.map((competition, index) => (
              <motion.div
                key={competition.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sword className="h-5 w-5 text-primary" />
                          {competition.title}
                        </CardTitle>
                        <CardDescription>{competition.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {getTimeRemaining(competition.endDate)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Participantes</p>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {competition.participants}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prêmio</p>
                        <p className="font-medium">{competition.prize}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge variant="outline">{competition.category}</Badge>
                      <Badge variant="outline">{competition.difficulty}</Badge>
                    </div>
                    
                    <Button className="w-full" size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Participar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Competition history/upcoming */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximas Competições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Desafio de Português',
                      date: 'Próxima semana',
                      participants: 0,
                      prize: 'Badge + 750 pontos'
                    },
                    {
                      title: 'Torneio de Ciências',
                      date: 'Em 2 semanas',
                      participants: 0,
                      prize: 'Troféu + 1500 pontos'
                    }
                  ].map((upcoming, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{upcoming.title}</p>
                        <p className="text-xs text-muted-foreground">{upcoming.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{upcoming.prize}</p>
                        <Badge variant="outline" className="text-xs">
                          Em breve
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}