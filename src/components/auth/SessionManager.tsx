import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  DeviceDesktop, 
  DeviceMobile, 
  DeviceTablet, 
  Warning, 
  SignOut, 
  SpinnerGap,
  CheckCircle,
  Clock
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Session {
  id: string
  device: string
  lastActivity: string
  current: boolean
  location?: string
  ip?: string
}

interface SessionManagerProps {
  onClose?: () => void
}

export default function SessionManager({ onClose }: SessionManagerProps) {
  const { getActiveSessions, terminateSession, user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    setIsLoading(true)
    try {
      const activeSessions = await getActiveSessions()
      setSessions(activeSessions)
    } catch {
      toast.error('Erro ao carregar sessões ativas')
    } finally {
      setIsLoading(false)
    }
  }, [getActiveSessions])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const handleTerminateSession = async (sessionId: string) => {
    if (terminatingSession) return

    setTerminatingSession(sessionId)
    
    try {
      const success = await terminateSession(sessionId)
      
      if (success) {
        toast.success('Sessão encerrada com sucesso')
        await loadSessions()
      } else {
        toast.error('Erro ao encerrar sessão')
      }
    } catch {
      toast.error('Erro ao encerrar sessão')
    } finally {
      setTerminatingSession(null)
    }
  }

  const getDeviceIcon = (deviceInfo: string) => {
    const device = deviceInfo.toLowerCase()
    if (device.includes('mobile') || device.includes('android') || device.includes('iphone')) {
      return <DeviceMobile className="h-5 w-5" weight="duotone" />
    }
    if (device.includes('tablet') || device.includes('ipad')) {
      return <DeviceTablet className="h-5 w-5" weight="duotone" />
    }
    return <DeviceDesktop className="h-5 w-5" weight="duotone" />
  }

  const formatLastActivity = (lastActivity: string) => {
    const date = new Date(lastActivity)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `${diffMins} min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    return `${diffDays} dias atrás`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <SpinnerGap className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando sessões ativas...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Gerenciar Sessões</h2>
        <p className="text-muted-foreground">
          Monitore e controle onde sua conta está sendo acessada
        </p>
      </div>

      {/* Current session info */}
      {user && (
        <Card className="border-secondary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-secondary" weight="fill" />
              <CardTitle className="text-lg">Sessão Atual</CardTitle>
            </div>
            <CardDescription>
              Conectado como {user.fullName} ({user.role})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Último acesso: {formatLastActivity(user.lastLogin)}
                </span>
              </div>
              <Badge variant="outline" className="text-secondary border-secondary/20">
                Ativa
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Active sessions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Sessões Ativas ({sessions.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSessions}
            disabled={isLoading}
            className="focus-enhanced"
          >
            Atualizar
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Warning className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma sessão ativa encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id} className={`${session.current ? 'ring-2 ring-secondary/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-muted-foreground">
                        {getDeviceIcon(session.device)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-foreground">
                            {session.device}
                          </span>
                          {session.current && (
                            <Badge variant="secondary" className="text-xs">
                              Atual
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatLastActivity(session.lastActivity)}
                        </p>
                        {session.location && (
                          <p className="text-xs text-muted-foreground">
                            📍 {session.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {!session.current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminateSession(session.id)}
                        disabled={terminatingSession === session.id}
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive focus-enhanced"
                      >
                        {terminatingSession === session.id ? (
                          <SpinnerGap className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <SignOut className="h-4 w-4 mr-2" />
                            Encerrar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Security tips */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Warning className="h-5 w-5 text-accent" />
            <span>Dicas de Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Encerre sessões de dispositivos que você não reconhece</p>
          <p>• Mantenha seus dispositivos atualizados e seguros</p>
          <p>• Use sempre a opção de logout ao sair de computadores públicos</p>
          <p>• Entre em contato conosco se suspeitar de atividade não autorizada</p>
        </CardContent>
      </Card>

      {/* Close button */}
      {onClose && (
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} className="focus-enhanced">
            Fechar
          </Button>
        </div>
      )}
    </motion.div>
  )
}