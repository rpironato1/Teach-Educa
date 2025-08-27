import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAnalytics } from '@/contexts/AnalyticsContext'
import { Bell, X, Trophy, Fire, Target, Star, Clock } from '@phosphor-icons/react'
import { Notification } from '@/types/analytics'

interface NotificationCenterProps {
  className?: string
}

export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const { notifications, markNotificationAsRead } = useAnalytics()

  const unreadNotifications = notifications.filter(n => !n.read)
  const recentNotifications = notifications.slice(0, 5)

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-4 w-4 text-primary" />
      case 'streak':
        return <Fire className="h-4 w-4 text-secondary" />
      case 'reminder':
        return <Clock className="h-4 w-4 text-accent" />
      case 'milestone':
        return <Target className="h-4 w-4 text-chart-2" />
      case 'social':
        return <Star className="h-4 w-4 text-chart-3" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'achievement':
        return 'from-primary/10 to-primary/5 border-primary/20'
      case 'streak':
        return 'from-secondary/10 to-secondary/5 border-secondary/20'
      case 'reminder':
        return 'from-accent/10 to-accent/5 border-accent/20'
      case 'milestone':
        return 'from-chart-2/10 to-chart-2/5 border-chart-2/20'
      case 'social':
        return 'from-chart-3/10 to-chart-3/5 border-chart-3/20'
      default:
        return 'from-muted/10 to-muted/5 border-muted/20'
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId)
  }

  if (notifications.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma notificação ainda</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notificações
            {unreadNotifications.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadNotifications.length}
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {recentNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`p-3 rounded-lg border bg-gradient-to-r ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'ring-1 ring-primary/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {notification.title}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {notifications.length > 5 && (
            <div className="text-center pt-2">
              <Button variant="ghost" size="sm" className="text-xs">
                Ver todas ({notifications.length})
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}