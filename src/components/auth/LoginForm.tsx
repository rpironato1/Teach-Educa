import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeSlash, SignIn, SpinnerGap } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface LoginFormProps {
  onForgotPassword: () => void
  onSuccess: () => void
  redirectUrl?: string
}

export default function LoginForm({ onForgotPassword, onSuccess, redirectUrl }: LoginFormProps) {
  const { login, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const result = await login(formData.email, formData.password, formData.rememberMe)
    
    if (result.success) {
      toast.success(`Login realizado com sucesso! ${formData.rememberMe ? 'Sessão estendida ativada.' : ''}`)
      onSuccess()
    } else if (result.requiresMFA) {
      toast.info('Verificação de duas etapas necessária. Verifique seu email.')
    } else {
      toast.error(result.error || 'Erro ao fazer login')
    }
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field === 'rememberMe') {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      {/* Demo accounts info */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
        <p className="font-medium text-foreground">Contas de demonstração:</p>
        <div className="space-y-1 text-muted-foreground">
          <p><strong>Admin:</strong> admin@teach.com | senha: admin123</p>
          <p><strong>Usuário:</strong> user@teach.com | senha: user123</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={formData.email}
            onChange={handleInputChange('email')}
            className={errors.email ? 'border-destructive' : ''}
            disabled={isLoading}
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Sua senha"
              value={formData.password}
              onChange={handleInputChange('password')}
              className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
              disabled={isLoading}
              autoComplete="current-password"
            />
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
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            checked={formData.rememberMe}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, rememberMe: !!checked }))
            }
            disabled={isLoading}
          />
          <Label 
            htmlFor="rememberMe" 
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Manter-me conectado por 30 dias
          </Label>
        </div>

        {/* Forgot password link */}
        <div className="text-right">
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto text-primary hover:underline focus-enhanced"
            onClick={onForgotPassword}
            disabled={isLoading}
          >
            Esqueceu sua senha?
          </Button>
        </div>

        {/* Login button */}
        <Button
          type="submit"
          className="w-full focus-enhanced"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <SpinnerGap className="h-4 w-4 mr-2 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              <SignIn className="h-4 w-4 mr-2" />
              Entrar
            </>
          )}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-card px-2 text-sm text-muted-foreground">
            Ainda não tem conta?
          </span>
        </div>
      </div>

      {/* Register link */}
      <div className="text-center">
        <Button
          variant="outline"
          className="w-full focus-enhanced"
          onClick={() => {
            // This will be handled by the parent component
            toast.info('Use o botão "Começar Agora" na página principal para criar sua conta')
          }}
        >
          Criar Nova Conta
        </Button>
      </div>
    </motion.div>
  )
}