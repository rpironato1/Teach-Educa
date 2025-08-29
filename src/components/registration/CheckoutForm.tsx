import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  CreditCard, 
  Bank, 
  QrCode, 
  Shield,
  CheckCircle as _CheckCircle,
  Lock
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import type { RegistrationData } from '../RegistrationFlow'

interface CheckoutFormProps {
  registrationData: RegistrationData
  onNext: () => void
  onBack: () => void
}

type PaymentMethod = 'card' | 'pix' | 'boleto'

export default function CheckoutForm({ registrationData, onNext, onBack }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [isLoading, setIsLoading] = useState(false)
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1'
  })

  const plan = registrationData.selectedPlan!

  // Format card number as user types
  const formatCardNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .slice(0, 16)
      .replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
      .replace(/(\d{4})(\d{4})(\d{4})(\d{1,4})/, '$1 $2 $3 $4')
      .replace(/(\d{4})(\d{4})(\d{1,4})/, '$1 $2 $3')
      .replace(/(\d{4})(\d{1,4})/, '$1 $2')
  }

  // Format expiry date as user types
  const formatExpiry = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .slice(0, 4)
      .replace(/(\d{2})(\d{2})/, '$1/$2')
      .replace(/(\d{2})(\d{1})/, '$1/$2')
  }

  // Format CVV as user types
  const formatCVV = (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 4)
  }

  // Get card brand from number
  const getCardBrand = (number: string): string => {
    const firstDigits = number.replace(/\D/g, '').substring(0, 4)
    if (firstDigits.startsWith('4')) return 'Visa'
    if (firstDigits.startsWith('5') || firstDigits.startsWith('2')) return 'Mastercard'
    if (firstDigits.startsWith('3')) return 'Amex'
    if (firstDigits.startsWith('6')) return 'Elo'
    return ''
  }

  // Calculate installment value
  const calculateInstallmentValue = (installments: number): string => {
    const totalValue = parseFloat(plan.price.replace('R$ ', '').replace(',', '.'))
    const installmentValue = totalValue / installments
    return installmentValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  // Generate installment options
  const getInstallmentOptions = () => {
    const totalValue = parseFloat(plan.price.replace('R$ ', '').replace(',', '.'))
    const maxInstallments = Math.min(12, Math.floor(totalValue / 10)) // Min R$ 10 per installment
    
    const options = []
    for (let i = 1; i <= maxInstallments; i++) {
      const value = calculateInstallmentValue(i)
      const label = i === 1 
        ? `À vista - ${value}` 
        : `${i}x de ${value}`
      options.push({ value: i.toString(), label })
    }
    return options
  }

  const validateCardForm = (): boolean => {
    if (paymentMethod !== 'card') return true

    const { number, name, expiry, cvv } = cardData
    
    if (number.replace(/\D/g, '').length < 13) {
      toast.error('Número do cartão inválido')
      return false
    }
    
    if (!name.trim()) {
      toast.error('Nome do portador é obrigatório')
      return false
    }
    
    if (expiry.length !== 5) {
      toast.error('Data de validade inválida')
      return false
    }
    
    if (cvv.length < 3) {
      toast.error('CVV inválido')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCardForm()) return

    setIsLoading(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success('Pagamento processado com sucesso!')
      onNext()
    } catch {
      toast.error('Erro no processamento. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'card':
        return (
          <div className="space-y-4">
            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Número do cartão</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  type="text"
                  value={cardData.number}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    number: formatCardNumber(e.target.value) 
                  }))}
                  className="pr-20 focus-enhanced"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                />
                {getCardBrand(cardData.number) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Badge variant="outline" className="text-xs">
                      {getCardBrand(cardData.number)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardName">Nome no cartão</Label>
              <Input
                id="cardName"
                type="text"
                value={cardData.name}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  name: e.target.value.toUpperCase() 
                }))}
                className="focus-enhanced"
                placeholder="NOME COMO IMPRESSO NO CARTÃO"
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Validade</Label>
                <Input
                  id="expiry"
                  type="text"
                  value={cardData.expiry}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    expiry: formatExpiry(e.target.value) 
                  }))}
                  className="focus-enhanced"
                  placeholder="MM/AA"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="text"
                  value={cardData.cvv}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    cvv: formatCVV(e.target.value) 
                  }))}
                  className="focus-enhanced"
                  placeholder="000"
                  maxLength={4}
                />
              </div>
            </div>

            {/* Installments */}
            <div className="space-y-2">
              <Label htmlFor="installments">Parcelamento</Label>
              <Select
                value={cardData.installments}
                onValueChange={(value) => setCardData(prev => ({ 
                  ...prev, 
                  installments: value 
                }))}
              >
                <SelectTrigger className="focus-enhanced">
                  <SelectValue placeholder="Escolha o parcelamento" />
                </SelectTrigger>
                <SelectContent>
                  {getInstallmentOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'pix':
        return (
          <div className="text-center py-8">
            <QrCode className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Pagamento via PIX</h3>
            <p className="text-muted-foreground mb-4">
              Após confirmar, você receberá o código PIX para pagamento
            </p>
            <Badge className="bg-secondary">
              Aprovação instantânea
            </Badge>
          </div>
        )

      case 'boleto':
        return (
          <div className="text-center py-8">
            <Bank className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Boleto Bancário</h3>
            <p className="text-muted-foreground mb-4">
              O boleto será enviado para seu email para pagamento
            </p>
            <Badge variant="outline">
              Aprovação em até 2 dias úteis
            </Badge>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo do pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">{plan.name}</h4>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <Badge variant="outline" className="mt-1">
                {plan.credits} créditos mensais
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{plan.price}</div>
              <div className="text-sm text-muted-foreground">{plan.period}</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center font-semibold">
            <span>Total</span>
            <span>{plan.price}{plan.period}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Forma de pagamento
          </CardTitle>
          <CardDescription>
            Selecione como deseja pagar sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="h-5 w-5" />
                <div>
                  <div className="font-medium">Cartão de crédito</div>
                  <div className="text-sm text-muted-foreground">Visa, Mastercard, Elo</div>
                </div>
              </Label>
              <Badge variant="secondary">Recomendado</Badge>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="pix" id="pix" />
              <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                <QrCode className="h-5 w-5" />
                <div>
                  <div className="font-medium">PIX</div>
                  <div className="text-sm text-muted-foreground">Aprovação instantânea</div>
                </div>
              </Label>
              <Badge className="bg-secondary">Desconto 5%</Badge>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="boleto" id="boleto" />
              <Label htmlFor="boleto" className="flex items-center gap-2 cursor-pointer flex-1">
                <Bank className="h-5 w-5" />
                <div>
                  <div className="font-medium">Boleto bancário</div>
                  <div className="text-sm text-muted-foreground">Vencimento em 3 dias</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {paymentMethod === 'card' && 'Dados do cartão'}
            {paymentMethod === 'pix' && 'Confirmação PIX'}
            {paymentMethod === 'boleto' && 'Confirmação boleto'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderPaymentForm()}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Pagamento 100% seguro:</strong> Seus dados são protegidos com criptografia SSL de 256 bits. 
          Não armazenamos informações do seu cartão.
        </AlertDescription>
      </Alert>

      {/* Terms reminder */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Ao finalizar, você confirma que leu e aceita nossos{' '}
          <a href="#" className="text-primary hover:underline">Termos de Uso</a> e{' '}
          <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          className="w-full focus-enhanced"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mr-2"
            >
              ⏳
            </motion.div>
          ) : null}
          {isLoading 
            ? 'Processando pagamento...' 
            : `Finalizar pagamento - ${plan.price}`
          }
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="focus-enhanced"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos planos
        </Button>
      </div>
    </form>
  )
}