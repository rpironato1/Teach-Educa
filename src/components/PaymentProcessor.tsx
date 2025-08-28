"use client";
import React, { useState } from 'react';
import {
  CreditCard,
  Bank,
  QrCode,
  Shield,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Receipt,
  Clock
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getPaymentStatus } from '@/api/payments';
// import { processPayment } from '@/api/payments';

interface PaymentProcessorProps {
  plan: {
    name: string;
    price: number;
    credits: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

interface PaymentMethod {
  type: 'credit_card' | 'pix' | 'boleto';
  icon: React.ReactNode;
  name: string;
  description: string;
  processingTime: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    type: 'credit_card',
    icon: <CreditCard className="h-6 w-6" />,
    name: 'Cartão de Crédito',
    description: 'Visa, Mastercard, American Express',
    processingTime: 'Imediato'
  },
  {
    type: 'pix',
    icon: <QrCode className="h-6 w-6" />,
    name: 'PIX',
    description: 'Pagamento instantâneo',
    processingTime: 'Até 2 minutos'
  },
  {
    type: 'boleto',
    icon: <Bank className="h-6 w-6" />,
    name: 'Boleto Bancário',
    description: 'Pagamento em bancos e casas lotéricas',
    processingTime: 'Até 3 dias úteis'
  }
];

export default function PaymentProcessor({ plan, onSuccess, onCancel }: PaymentProcessorProps) {
  const [selectedMethod, setSelectedMethod] = useState<'credit_card' | 'pix' | 'boleto'>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPixQR, setShowPixQR] = useState(false);
  const [showBoletoDetails, setShowBoletoDetails] = useState(false);
  const [_currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string>('');
  
  // Credit card form state
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1'
  });

  // Get customer data from session storage (set during registration)
  const getCustomerData = () => {
    try {
      const storedData = sessionStorage.getItem('registrationData');
      if (storedData) {
        const data = JSON.parse(storedData);
        return {
          email: data.email,
          name: data.fullName,
          cpf: data.cpf,
          phone: data.phone
        };
      }
    } catch (error) {
      console.error('Error getting customer data:', error);
    }
    
    // Fallback data for demo
    return {
      email: 'user@example.com',
      name: 'Usuario Teste',
      cpf: '123.456.789-00',
      phone: '(11) 99999-9999'
    };
  };

  const handleCardInputChange = (field: string, value: string) => {
    if (field === 'number') {
      // Format card number with spaces
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) return; // Max length for formatted card number
    }
    
    if (field === 'expiry') {
      // Format expiry as MM/YY
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (value.length > 5) return;
    }
    
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
    }

    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const processPayment = async () => {
    setIsProcessing(true);

    try {
      const customerData = getCustomerData();
      
      // Prepare payment request
      const paymentRequest = {
        planId: plan.name.toLowerCase(),
        amount: plan.price,
        currency: 'BRL',
        paymentMethod: selectedMethod,
        customerData,
        paymentData: selectedMethod === 'credit_card' ? {
          cardNumber: cardData.number,
          cardName: cardData.name,
          cardExpiry: cardData.expiry,
          cardCvv: cardData.cvv,
          installments: parseInt(cardData.installments)
        } : undefined
      };

      // Validate card data for credit card payments
      if (selectedMethod === 'credit_card') {
        if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
          toast.error('Preencha todos os campos do cartão');
          setIsProcessing(false);
          return;
        }
      }

      // Process payment
      const response = await processPayment(paymentRequest);
      
      if (response.success) {
        setCurrentPaymentId(response.paymentId);
        
        if (selectedMethod === 'credit_card' && response.status === 'completed') {
          toast.success('Pagamento aprovado! Plano ativado com sucesso.');
          onSuccess();
          
        } else if (selectedMethod === 'pix') {
          setPixCode(response.qrCode || '');
          setShowPixQR(true);
          
          // Poll for payment status
          pollPaymentStatus(response.paymentId);
          
        } else if (selectedMethod === 'boleto') {
          setShowBoletoDetails(true);
          
          // Simulate boleto confirmation for demo
          setTimeout(() => {
            setShowBoletoDetails(false);
            toast.success('Boleto gerado! Você receberá o link por email.');
            onSuccess();
          }, 3000);
        }
      } else {
        toast.error('Erro no processamento. Tente novamente.');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no processamento';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Poll payment status for PIX payments
  const pollPaymentStatus = async (paymentId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await getPaymentStatus(paymentId);
        
        if (status.status === 'completed') {
          clearInterval(pollInterval);
          setShowPixQR(false);
          toast.success('Pagamento PIX confirmado! Plano ativado.');
          onSuccess();
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          setShowPixQR(false);
          toast.error('Pagamento PIX falhou. Tente novamente.');
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (showPixQR) {
        setShowPixQR(false);
        toast.error('Tempo limite excedido. Tente novamente.');
      }
    }, 5 * 60 * 1000);
  };

  const installmentOptions = [
    { value: '1', label: `1x de R$ ${plan.price.toFixed(2)} sem juros` },
    { value: '2', label: `2x de R$ ${(plan.price / 2).toFixed(2)} sem juros` },
    { value: '3', label: `3x de R$ ${(plan.price / 3).toFixed(2)} sem juros` },
    { value: '6', label: `6x de R$ ${(plan.price * 1.05 / 6).toFixed(2)} com juros` },
    { value: '12', label: `12x de R$ ${(plan.price * 1.15 / 12).toFixed(2)} com juros` }
  ];

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Resumo do Pedido
            <Badge variant="secondary">{plan.name}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Plano {plan.name}</span>
              <span>R$ {plan.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{plan.credits} créditos mensais</span>
              <span>Renovação automática</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>R$ {plan.price.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Método de Pagamento</CardTitle>
          <CardDescription>
            Escolha como deseja pagar sua assinatura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.type}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedMethod === method.type
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedMethod(method.type)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    selectedMethod === method.type ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {method.icon}
                  </div>
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-muted-foreground">{method.description}</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {method.processingTime}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Credit Card Form */}
      {selectedMethod === 'credit_card' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-secondary" />
              Dados do Cartão
            </CardTitle>
            <CardDescription>
              Seus dados são protegidos com criptografia SSL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.number}
                  onChange={(e) => handleCardInputChange('number', e.target.value)}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="cardName">Nome no Cartão</Label>
                <Input
                  id="cardName"
                  placeholder="Nome como está no cartão"
                  value={cardData.name}
                  onChange={(e) => handleCardInputChange('name', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="expiry">Validade</Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  value={cardData.expiry}
                  onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="installments">Parcelamento</Label>
                <Select value={cardData.installments} onValueChange={(value) => setCardData(prev => ({...prev, installments: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o parcelamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {installmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Pagamento Seguro</AlertTitle>
              <AlertDescription>
                Não armazenamos dados do seu cartão. O processamento é feito por parceiros certificados.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* PIX Information */}
      {selectedMethod === 'pix' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-secondary" />
              Pagamento PIX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Instruções PIX</AlertTitle>
              <AlertDescription>
                Após confirmar, você receberá um código PIX para pagamento. 
                O plano será ativado automaticamente após a confirmação.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Boleto Information */}
      {selectedMethod === 'boleto' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bank className="h-5 w-5 text-secondary" />
              Boleto Bancário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertTitle>Vencimento do Boleto</AlertTitle>
              <AlertDescription>
                O boleto vence em 3 dias úteis. Após o pagamento, 
                seu plano será ativado em até 2 dias úteis.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancelar
        </Button>
        <Button onClick={processPayment} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            `Pagar R$ ${plan.price.toFixed(2)}`
          )}
        </Button>
      </div>

      {/* PIX QR Code Dialog */}
      <Dialog open={showPixQR} onOpenChange={setShowPixQR}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento PIX</DialogTitle>
            <DialogDescription>
              Escaneie o código QR ou copie o código PIX
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Código PIX:</p>
              <div className="p-3 bg-muted rounded text-xs font-mono break-all">
                {pixCode || '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-426614174000520400005303986540' + plan.price.toFixed(2) + '5802BR5925TEACH PLATAFORMA EDUCATIVA6009SAO PAULO62070503***6304ABCD'}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(pixCode);
                  toast.success('Código PIX copiado!');
                }}
              >
                Copiar Código PIX
              </Button>
            </div>
            
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Aguardando confirmação do pagamento...
              </AlertDescription>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>

      {/* Boleto Details Dialog */}
      <Dialog open={showBoletoDetails} onOpenChange={setShowBoletoDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Boleto Gerado</DialogTitle>
            <DialogDescription>
              Seu boleto foi gerado com sucesso
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Boleto Enviado</AlertTitle>
              <AlertDescription>
                O boleto foi enviado para seu email e estará disponível para download.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <p className="font-medium">Detalhes do Boleto:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Valor: R$ {plan.price.toFixed(2)}</div>
                <div>Vencimento: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</div>
                <div>Código de Barras: 34191.79001 01043.510047 91020.150008 1 84560000014580</div>
              </div>
            </div>
            
            <Button className="w-full">
              <Receipt className="h-4 w-4 mr-2" />
              Baixar Boleto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}