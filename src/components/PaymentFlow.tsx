import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  QrCode,
  CurrencyDollar,
  Building
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useCredit } from '@/contexts/CreditContext'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'

interface PaymentFlowProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan: string
}

interface PlanDetails {
  name: string
  credits: number
  price: number
  period: string
  description: string
  features: string[]
}

const planData: Record<string, PlanDetails> = {
  inicial: {
    name: "Inicial",
    credits: 100,
    price: 29,
    period: "mês",
    description: "Perfeito para começar sua jornada de aprendizado",
    features: [
      "100 créditos mensais",
      "Acesso a conteúdo básico",
      "Relatórios de progresso",
      "Suporte por email"
    ]
  },
  intermediario: {
    name: "Intermediário",
    credits: 500,
    price: 99,
    period: "mês",
    description: "Ideal para estudantes dedicados",
    features: [
      "500 créditos mensais",
      "Acesso a todo conteúdo",
      "Análise neuroadaptativa",
      "Relatórios detalhados",
      "Suporte prioritário"
    ]
  },
  profissional: {
    name: "Profissional",
    credits: 1000,
    price: 179,
    period: "mês",
    description: "Para profissionais e instituições",
    features: [
      "1000 créditos mensais",
      "Acesso ilimitado",
      "IA personalizada",
      "Dashboard avançado",
      "Suporte 24/7",
      "API access"
    ]
  }
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({ isOpen, onClose, selectedPlan }) => {
  const { user } = useAuth()
  const { processPayment, upgradeSubscription } = useCredit()
  const [step, setStep] = useState<'plan' | 'payment' | 'processing' | 'success' | 'error'>('plan')
  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'pix' | 'boleto'>('credit-card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [pixCode, setPixCode] = useState('')
  const [boletoCode, setBoletoCode] = useState('')
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    cpf: '',
    email: user?.email || ''
  })

  const plan = planData[selectedPlan] || planData.intermediario

  // Generate mock PIX code and Boleto code for demo
  useEffect(() => {
    if (paymentMethod === 'pix') {
      setPixCode(`00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 15)}520400005303986540${plan.price.toFixed(2)}5802BR5913TeacH Platform6009SAO PAULO62070503***63041234`)
    } else if (paymentMethod === 'boleto') {
      setBoletoCode(`03399.${Math.random().toString().substring(2, 7)} ${Math.random().toString().substring(2, 7)}.${Math.random().toString().substring(2, 8)} ${Math.random().toString().substring(2, 8)} ${Math.random().toString().substring(2, 2)} ${Math.random().toString().substring(2, 16)}`)
    }
  }, [paymentMethod, plan.price])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const validateForm = () => {
    if (paymentMethod === 'credit-card') {
      const { cardNumber, cardName, expiryDate, cvv, cpf } = formData
      if (!cardNumber || !cardName || !expiryDate || !cvv || !cpf) {
        toast.error('Preencha todos os campos obrigatórios')
        return false
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Número do cartão inválido')
        return false
      }
      if (cvv.length < 3) {
        toast.error('CVV inválido')
        return false
      }
    }
    return true
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    setIsProcessing(true)
    setStep('processing')

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      const paymentData = {
        planId: selectedPlan,
        amount: plan.price,
        paymentMethod,
        userId: user?.id,
        ...formData
      }

      await processPayment(paymentData)
      await upgradeSubscription(selectedPlan)

      setStep('success')
      toast.success('Pagamento processado com sucesso!')
    } catch (error) {
      setStep('error')
      toast.error('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Código ${type} copiado!`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Assinar Plano {plan.name}
          </DialogTitle>
          <DialogDescription>
            Complete o pagamento para ativar sua assinatura
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Plan Summary */}
          {step === 'plan' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    <Badge variant="secondary">{plan.credits} créditos</Badge>
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span>Total:</span>
                      <span className="text-primary">R$ {plan.price}/{plan.period}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium">Incluído no plano:</h4>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-secondary" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={() => setStep('payment')} className="flex-1">
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Payment Method Selection */}
          {step === 'payment' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4">Escolha a forma de pagamento</h3>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="h-4 w-4" />
                        Cartão de Crédito
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer">
                        <QrCode className="h-4 w-4" />
                        PIX (Instantâneo)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="boleto" id="boleto" />
                      <Label htmlFor="boleto" className="flex items-center gap-2 cursor-pointer">
                        <Building className="h-4 w-4" />
                        Boleto Bancário
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Credit Card Form */}
              {paymentMethod === 'credit-card' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                        maxLength={19}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="cardName">Nome no Cartão</Label>
                      <Input
                        id="cardName"
                        placeholder="Nome como no cartão"
                        value={formData.cardName}
                        onChange={(e) => handleInputChange('cardName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Vencimento</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/AA"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                        maxLength={4}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange('cpf', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PIX Payment */}
              {paymentMethod === 'pix' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <QrCode className="h-32 w-32 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Escaneie o QR Code ou copie o código PIX
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-xs break-all">{pixCode}</code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(pixCode, 'PIX')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• O pagamento será confirmado automaticamente</p>
                    <p>• Válido por 30 minutos</p>
                    <p>• Processamento instantâneo</p>
                  </div>
                </div>
              )}

              {/* Boleto Payment */}
              {paymentMethod === 'boleto' && (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Atenção</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      O boleto será gerado após a confirmação e pode levar até 2 dias úteis para compensação.
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <code className="text-xs">{boletoCode}</code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(boletoCode, 'Boleto')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Pagamento seguro e criptografado</span>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('plan')} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handlePayment} className="flex-1" disabled={isProcessing}>
                  {isProcessing ? 'Processando...' : `Pagar R$ ${plan.price}`}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <LoadingSpinner size="lg" />
              <h3 className="text-lg font-semibold mt-4">Processando Pagamento</h3>
              <p className="text-muted-foreground">
                Aguarde enquanto processamos seu pagamento...
              </p>
            </motion.div>
          )}

          {/* Success */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8 space-y-6"
            >
              <div>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Pagamento Confirmado!</h3>
                <p className="text-muted-foreground">
                  Sua assinatura do plano {plan.name} foi ativada com sucesso.
                </p>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Plano:</span>
                      <span className="font-medium">{plan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Créditos:</span>
                      <span className="font-medium">{plan.credits}/mês</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor:</span>
                      <span className="font-medium">R$ {plan.price}/{plan.period}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={onClose} className="w-full">
                Começar a Usar
              </Button>
            </motion.div>
          )}

          {/* Error */}
          {step === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8 space-y-6"
            >
              <div>
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Erro no Pagamento</h3>
                <p className="text-muted-foreground">
                  Houve um problema ao processar seu pagamento. Tente novamente.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={() => setStep('payment')} className="flex-1">
                  Tentar Novamente
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentFlow