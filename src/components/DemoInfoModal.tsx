import { motion } from 'framer-motion'
import { 
  Info, 
  X, 
  User, 
  Shield
} from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DemoInfoModalProps {
  onClose: () => void
  onLogin: () => void
  onRegister: () => void
}

export default function DemoInfoModal({ onClose, onLogin, onRegister }: DemoInfoModalProps) {
  const demoAccounts = [
    {
      type: 'Usuário',
      email: 'user@teach.com',
      password: 'senha123',
      icon: <User className="h-6 w-6 text-primary" />,
      description: 'Dashboard do estudante com progresso e créditos',
      features: ['Ver progresso pessoal', 'Consumir créditos', 'Relatórios individuais']
    },
    {
      type: 'Administrador',
      email: 'admin@teach.com',
      password: 'admin123',
      icon: <Shield className="h-6 w-6 text-secondary" />,
      description: 'Painel administrativo completo',
      features: ['Gerenciar usuários', 'Métricas da plataforma', 'Configurações do sistema']
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-2">
              <Info className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Demonstração da Plataforma</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Experimente nossa plataforma usando as contas de demonstração abaixo:
              </p>
            </div>

            <div className="grid gap-4">
              {demoAccounts.map((account, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-muted rounded-lg">
                          {account.icon}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{account.type}</h3>
                            <Badge variant="outline" className="text-xs">
                              Demo
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {account.description}
                          </p>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                              <strong>Email:</strong> {account.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              <strong>Senha:</strong> {account.password}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {account.features.map((feature, featureIndex) => (
                              <Badge key={featureIndex} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Ou crie sua própria conta para começar sua jornada de aprendizado:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={onLogin} variant="outline" className="focus-enhanced">
                    Fazer Login
                  </Button>
                  <Button onClick={onRegister} className="focus-enhanced">
                    Criar Conta Gratuita
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}