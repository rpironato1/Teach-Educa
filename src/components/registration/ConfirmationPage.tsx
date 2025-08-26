import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Envelope, 
  Sparkle, 
  RocketLaunch,
  Brain
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { RegistrationData } from '../RegistrationFlow'

interface ConfirmationPageProps {
  registrationData: RegistrationData
  onClose: () => void
}

export default function ConfirmationPage({ registrationData, onClose }: ConfirmationPageProps) {
  const plan = registrationData.selectedPlan!

  useEffect(() => {
    // Show success toast on mount
    toast.success('Bem-vindo à TeacH!', {
      description: 'Sua conta foi criada com sucesso'
    })
  }, [])

  const nextSteps = [
    {
      icon: <Envelope className="h-5 w-5 text-primary" />,
      title: 'Confirme seu email',
      description: 'Verifique sua caixa de entrada para ativar sua conta',
      completed: true
    },
    {
      icon: <Brain className="h-5 w-5 text-secondary" />,
      title: 'Complete seu perfil',
      description: 'Personalize sua experiência de aprendizado',
      completed: false
    },
    {
      icon: <RocketLaunch className="h-5 w-5 text-accent" />,
      title: 'Comece a aprender',
      description: 'Explore nossa biblioteca de conteúdos adaptativos',
      completed: false
    }
  ]

  return (
    <div className="space-y-6">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 15,
          delay: 0.2 
        }}
        className="text-center"
      >
        <div className="relative inline-block">
          <CheckCircle className="h-20 w-20 text-secondary mx-auto" weight="fill" />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkle className="h-8 w-8 text-accent" weight="fill" />
          </motion.div>
        </div>
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center space-y-2"
      >
        <h2 className="text-3xl font-bold text-foreground">
          Parabéns, {registrationData.fullName.split(' ')[0]}! 🎉
        </h2>
        <p className="text-lg text-muted-foreground">
          Sua conta na TeacH foi criada com sucesso
        </p>
      </motion.div>

      {/* Account Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" weight="duotone" />
              Sua assinatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{plan.name}</h4>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <Badge className="bg-secondary">Ativo</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Créditos mensais:</span>
                <div className="font-semibold">{plan.credits}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Valor:</span>
                <div className="font-semibold">{plan.price}{plan.period}</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h5 className="font-medium text-sm">Recursos inclusos:</h5>
              <div className="grid grid-cols-1 gap-2">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos passos</CardTitle>
            <CardDescription>
              Complete estes passos para aproveitar ao máximo sua experiência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  step.completed 
                    ? 'bg-secondary/10 border border-secondary/20' 
                    : 'bg-muted/50'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  step.completed ? 'bg-secondary/20' : 'bg-muted'
                }`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {step.completed && (
                  <CheckCircle className="h-5 w-5 text-secondary" weight="fill" />
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Important Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Envelope className="h-4 w-4" />
              Informações importantes
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 Enviamos um email de confirmação para <strong>{registrationData.email}</strong></p>
              <p>🔑 Suas credenciais de acesso foram enviadas por email</p>
              <p>💳 Seu primeiro pagamento será processado hoje</p>
              <p>📱 Baixe nosso app para acessar de qualquer lugar</p>
              <p>🎯 Sua jornada neuroadaptativa começará em instantes</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="flex flex-col gap-3"
      >
        <Button
          onClick={onClose}
          className="w-full focus-enhanced"
          size="lg"
        >
          Ir para a plataforma
          <RocketLaunch className="ml-2 h-5 w-5" />
        </Button>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => window.open('mailto:suporte@teach.com.br', '_blank')}
            className="text-sm focus-enhanced"
          >
            Precisa de ajuda? Fale conosco
          </Button>
        </div>
      </motion.div>

      {/* Celebration Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 2 }}
        className="fixed inset-0 pointer-events-none"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              y: 100,
              x: Math.random() * window.innerWidth,
              rotate: 0
            }}
            animate={{ 
              opacity: [0, 1, 0], 
              y: -100,
              rotate: 360
            }}
            transition={{ 
              delay: 2 + i * 0.2, 
              duration: 3,
              ease: "easeOut"
            }}
            className="absolute text-2xl"
          >
            {['🎉', '🎊', '✨', '🌟'][i % 4]}
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}