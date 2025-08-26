import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeSlash, Lock, SpinnerGap, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface ResetPasswordFormProps {
  token: string
  onBack: () => void
  onSuccess: () => void
}

export default function ResetPasswordForm({ token, onBack, onSuccess }: ResetPasswordFormProps) {
  const { resetPassword } = useAuth()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = 'Nova senha é obrigatória'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Senha deve conter ao menos: 1 maiúscula, 1 minúscula e 1 número'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    const result = await resetPassword(token, formData.password)
    
    if (result.success) {
      setIsSuccess(true)
      toast.success('Senha alterada com sucesso!')
    } else {
      toast.error(result.error || 'Erro ao redefinir senha')
      setErrors({ general: result.error || 'Token inválido ou expirado' })
    }
    
    setIsLoading(false)
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)

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
            Senha Alterada!
          </h2>
          <p className="text-muted-foreground">
            Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.
          </p>
        </div>

        <Button
          onClick={onSuccess}
          className="w-full focus-enhanced"
        >
          Ir para Login
        </Button>
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
          Crie uma nova senha segura para sua conta.
        </p>
      </div>

      {/* General error */}
      {errors.general && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password field */}
        <div className="space-y-2">
          <Label htmlFor="new-password">Nova Senha</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua nova senha"
              value={formData.password}
              onChange={handleInputChange('password')}
              className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
              disabled={isLoading}
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent focus-enhanced"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeSlash className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          
          {/* Password strength indicator */}
          {formData.password && (
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength >= level
                        ? passwordStrength <= 2
                          ? 'bg-destructive'
                          : passwordStrength <= 3
                          ? 'bg-yellow-500'
                          : 'bg-secondary'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Força da senha: {
                  passwordStrength <= 2 ? 'Fraca' :
                  passwordStrength <= 3 ? 'Média' : 'Forte'
                }
              </p>
            </div>
          )}
          
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Confirm password field */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirme sua nova senha"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
              disabled={isLoading}
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent focus-enhanced"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeSlash className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Reset button */}
        <Button
          type="submit"
          className="w-full focus-enhanced"
          disabled={isLoading || !formData.password || !formData.confirmPassword}
        >
          {isLoading ? (
            <>
              <SpinnerGap className="h-4 w-4 mr-2 animate-spin" />
              Alterando senha...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Alterar Senha
            </>
          )}
        </Button>
      </form>

      {/* Security tips */}
      <div className="bg-muted/30 rounded-lg p-4 text-sm">
        <p className="font-medium text-foreground mb-2">Dicas de segurança:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Use pelo menos 8 caracteres</li>
          <li>• Inclua maiúsculas e minúsculas</li>
          <li>• Adicione números e símbolos</li>
          <li>• Evite informações pessoais</li>
        </ul>
      </div>
    </motion.div>
  )
}