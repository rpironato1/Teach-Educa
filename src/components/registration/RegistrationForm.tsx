import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeSlash, User, Envelope, Phone, IdentificationCard } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { registerUser } from '@/api/auth'
import type { RegistrationData } from '../RegistrationFlow'

interface RegistrationFormProps {
  data: RegistrationData
  onUpdate: (data: Partial<RegistrationData>) => void
  onNext: () => void
}

export default function RegistrationForm({ data, onUpdate, onNext }: RegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // CPF validation function
  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '')
    if (cleanCPF.length !== 11) return false
    
    // Check for known invalid patterns
    if (/^(\d)\1+$/.test(cleanCPF)) return false
    
    // Validate CPF algorithm
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    let digit = 11 - (sum % 11)
    if (digit === 10 || digit === 11) digit = 0
    if (digit !== parseInt(cleanCPF.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    digit = 11 - (sum % 11)
    if (digit === 10 || digit === 11) digit = 0
    if (digit !== parseInt(cleanCPF.charAt(10))) return false
    
    return true
  }

  // Format CPF as user types
  const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .slice(0, 11)
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .replace(/(\d{3})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4')
      .replace(/(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3')
      .replace(/(\d{3})(\d{1})$/, '$1.$2')
  }

  // Format phone as user types
  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .slice(0, 11)
      .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      .replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
      .replace(/(\d{2})(\d{1})$/, '($1) $2')
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!data.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!data.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!data.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório'
    } else if (!validateCPF(data.cpf)) {
      newErrors.cpf = 'CPF inválido'
    }

    if (!data.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (data.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido'
    }

    if (!data.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (data.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      newErrors.password = 'Senha deve conter ao menos: 1 minúscula, 1 maiúscula e 1 número'
    }

    if (!data.acceptedTerms) {
      newErrors.terms = 'Você deve aceitar os termos de uso'
    }

    if (!data.acceptedPrivacy) {
      newErrors.privacy = 'Você deve aceitar a política de privacidade'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros do formulário')
      return
    }

    setIsLoading(true)
    
    try {
      // Call the registration API
      const response = await registerUser({
        fullName: data.fullName,
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
        password: data.password,
        acceptedTerms: data.acceptedTerms,
        acceptedPrivacy: data.acceptedPrivacy,
        marketingOptIn: data.marketingOptIn
      })
      
      if (response.success) {
        // Store user ID for next steps
        sessionStorage.setItem('registrationUserId', response.userId)
        toast.success('Conta criada! Código de verificação enviado por email.')
        onNext()
      } else {
        toast.error('Erro ao criar conta. Tente novamente.')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Informações pessoais</CardTitle>
        <CardDescription>
          Preencha seus dados para criar sua conta na TeacH
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                value={data.fullName}
                onChange={(e) => onUpdate({ fullName: e.target.value })}
                className={`pl-10 focus-enhanced ${errors.fullName ? 'border-destructive' : ''}`}
                placeholder="Seu nome completo"
                autoComplete="name"
              />
            </div>
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Envelope className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                className={`pl-10 focus-enhanced ${errors.email ? 'border-destructive' : ''}`}
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* CPF */}
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <div className="relative">
              <IdentificationCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="cpf"
                type="text"
                value={data.cpf}
                onChange={(e) => onUpdate({ cpf: formatCPF(e.target.value) })}
                className={`pl-10 focus-enhanced ${errors.cpf ? 'border-destructive' : ''}`}
                placeholder="000.000.000-00"
                maxLength={14}
                autoComplete="off"
              />
            </div>
            {errors.cpf && (
              <p className="text-sm text-destructive">{errors.cpf}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => onUpdate({ phone: formatPhone(e.target.value) })}
                className={`pl-10 focus-enhanced ${errors.phone ? 'border-destructive' : ''}`}
                placeholder="(11) 99999-9999"
                maxLength={15}
                autoComplete="tel"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={data.password}
                onChange={(e) => onUpdate({ password: e.target.value })}
                className={`pr-10 focus-enhanced ${errors.password ? 'border-destructive' : ''}`}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
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
            <p className="text-xs text-muted-foreground">
              Deve conter ao menos: 1 letra minúscula, 1 maiúscula e 1 número
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={data.acceptedTerms}
                onCheckedChange={(checked) => onUpdate({ acceptedTerms: checked as boolean })}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Aceito os{' '}
                  <a href="#" className="text-primary hover:underline">
                    Termos de Uso
                  </a>{' '}
                  da TeacH *
                </Label>
              </div>
            </div>
            {errors.terms && (
              <p className="text-sm text-destructive">{errors.terms}</p>
            )}

            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacy"
                checked={data.acceptedPrivacy}
                onCheckedChange={(checked) => onUpdate({ acceptedPrivacy: checked as boolean })}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="privacy" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Aceito a{' '}
                  <a href="#" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>{' '}
                  e o tratamento dos meus dados pessoais (LGPD) *
                </Label>
              </div>
            </div>
            {errors.privacy && (
              <p className="text-sm text-destructive">{errors.privacy}</p>
            )}

            <div className="flex items-start space-x-3">
              <Checkbox
                id="marketing"
                checked={data.marketingOptIn}
                onCheckedChange={(checked) => onUpdate({ marketingOptIn: checked as boolean })}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="marketing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Aceito receber comunicações de marketing por email
                </Label>
                <p className="text-xs text-muted-foreground">
                  Você pode cancelar a qualquer momento
                </p>
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              Ao criar sua conta, enviaremos um código de verificação para o seu email.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full focus-enhanced"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}