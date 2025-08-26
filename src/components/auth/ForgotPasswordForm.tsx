import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, EnvelopeSimple, SpinnerGap, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface ForgotPasswordFormProps {
  onBack: () => void
  onSuccess: () => void
}

export default function ForgotPasswordForm({ onBack, onSuccess }: ForgotPasswordFormProps) {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Email é obrigatório')
      return
    }
    
    if (!validateEmail(email)) {
      setError('Email inválido')
      return
    }

    setIsLoading(true)
    setError('')

    const result = await forgotPassword(email)
    
    if (result.success) {
      setIsSuccess(true)
      toast.success('Email de recuperação enviado!')
    } else {
      setError(result.error || 'Erro ao enviar email')
      toast.error(result.error || 'Erro ao enviar email')
    }
    
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError('')
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-secondary" weight="fill" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Email Enviado!
          </h2>
          <p className="text-muted-foreground">
            Enviamos um link de recuperação para <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
          <p className="font-medium text-foreground">Próximos passos:</p>
          <ul className="space-y-1 text-muted-foreground text-left">
            <li>• Verifique sua caixa de entrada</li>
            <li>• Clique no link de recuperação</li>
            <li>• Defina uma nova senha</li>
            <li>• O link expira em 24 horas</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onSuccess}
            className="w-full focus-enhanced"
          >
            Voltar ao Login
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false)
              setEmail('')
            }}
            className="w-full focus-enhanced"
          >
            Enviar para Outro Email
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="p-0 h-auto hover:bg-transparent focus-enhanced"
        disabled={isLoading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar ao login
      </Button>

      {/* Description */}
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <div className="relative">
            <Input
              id="forgot-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={handleInputChange}
              className={`pl-10 ${error ? 'border-destructive' : ''}`}
              disabled={isLoading}
            />
            <EnvelopeSimple className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* Send button */}
        <Button
          type="submit"
          className="w-full focus-enhanced"
          disabled={isLoading || !email}
        >
          {isLoading ? (
            <>
              <SpinnerGap className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <EnvelopeSimple className="h-4 w-4 mr-2" />
              Enviar Link de Recuperação
            </>
          )}
        </Button>
      </form>

      {/* Help text */}
      <div className="bg-muted/30 rounded-lg p-4 text-sm">
        <p className="font-medium text-foreground mb-2">Não recebeu o email?</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Verifique a pasta de spam</li>
          <li>• Aguarde alguns minutos</li>
          <li>• Certifique-se do email correto</li>
        </ul>
      </div>
    </motion.div>
  )
}