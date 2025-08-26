import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Envelope, ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { verifyEmail, resendVerificationCode } from '@/api/auth'

interface EmailVerificationProps {
  email: string
  onNext: () => void
  onBack: () => void
}

export default function EmailVerification({ email, onNext, onBack }: EmailVerificationProps) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isVerified, setIsVerified] = useState(false)

  // Start countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Simulate sending verification email on mount
  useEffect(() => {
    // Don't send another email, code was already sent during registration
    setResendCooldown(60) // Start with 60 second cooldown
    toast.success('Código de verificação enviado!')
  }, [])

  const simulateSendVerificationEmail = async () => {
    try {
      await resendVerificationCode(email)
      setResendCooldown(60) // 60 second cooldown
      toast.success('Novo código de verificação enviado!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar código'
      toast.error(errorMessage)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (code.length !== 6) {
      toast.error('Código deve ter 6 dígitos')
      return
    }

    setIsLoading(true)

    try {
      const response = await verifyEmail({
        email,
        code
      })
      
      if (response.success && response.verified) {
        setIsVerified(true)
        toast.success('Email verificado com sucesso!')
        
        // Wait a bit to show success state
        setTimeout(() => {
          onNext()
        }, 1500)
      } else {
        toast.error('Código inválido. Tente novamente.')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao verificar código'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    
    setIsLoading(true)
    await simulateSendVerificationEmail()
    setIsLoading(false)
  }

  const formatCode = (value: string) => {
    // Only allow numbers and limit to 6 digits
    return value.replace(/\D/g, '').slice(0, 6)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          {isVerified ? (
            <>
              <CheckCircle className="h-6 w-6 text-secondary" weight="fill" />
              Email verificado!
            </>
          ) : (
            <>
              <Envelope className="h-6 w-6 text-primary" />
              Verificar email
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isVerified ? (
            'Seu email foi verificado com sucesso. Redirecionando...'
          ) : (
            `Enviamos um código de 6 dígitos para ${email}`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isVerified ? (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Código de verificação</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(formatCode(e.target.value))}
                className="text-center text-2xl tracking-widest font-mono focus-enhanced"
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
              />
              <p className="text-sm text-muted-foreground text-center">
                Digite o código de 6 dígitos enviado para seu email
              </p>
            </div>

            <Alert>
              <AlertDescription>
                Não recebeu o código? Verifique sua caixa de spam ou lixo eletrônico.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full focus-enhanced"
                size="lg"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? 'Verificando...' : 'Verificar código'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full focus-enhanced"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
              >
                {resendCooldown > 0 
                  ? `Reenviar em ${resendCooldown}s` 
                  : 'Reenviar código'
                }
              </Button>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="focus-enhanced"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos dados
              </Button>
            </div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <CheckCircle className="h-16 w-16 text-secondary mx-auto mb-4" weight="fill" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Verificação concluída!
            </h3>
            <p className="text-muted-foreground">
              Preparando a próxima etapa...
            </p>
          </motion.div>
        )}

        {/* Email format tips */}
        {!isVerified && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">
              Dicas importantes:
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• O código expira em 10 minutos</li>
              <li>• Verifique a caixa de spam se não receber</li>
              <li>• O email pode levar alguns minutos para chegar</li>
              <li>• Use o código mais recente se solicitar reenvio</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}