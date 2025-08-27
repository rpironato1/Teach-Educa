"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Coins,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Receipt,
  Zap
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface CreditSystemProps {
  showFullInterface?: boolean;
}

interface CreditUsage {
  id: string;
  type: 'ai_chat' | 'content_generation' | 'analysis' | 'export';
  amount: number;
  description: string;
  timestamp: Date;
}

interface Subscription {
  plan: 'inicial' | 'intermediario' | 'profissional';
  credits: number;
  maxCredits: number;
  renewDate: Date;
  status: 'active' | 'cancelled' | 'pending';
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'pix' | 'boleto';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

const CREDIT_COSTS = {
  ai_chat: 1,
  content_generation: 2,
  analysis: 3,
  export: 1
};

const PLANS = {
  inicial: { credits: 100, price: 29, name: 'Inicial' },
  intermediario: { credits: 500, price: 99, name: 'Intermediário' },
  profissional: { credits: 1000, price: 179, name: 'Profissional' }
};

export default function CreditSystem({ showFullInterface = true }: CreditSystemProps) {
  const [subscription, setSubscription] = useKV<Subscription>('user-subscription', {
    plan: 'inicial',
    credits: 85,
    maxCredits: 100,
    renewDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    status: 'active'
  });

  const [creditUsage, setCreditUsage] = useKV<CreditUsage[]>('credit-usage', [
    {
      id: '1',
      type: 'ai_chat',
      amount: 5,
      description: 'Conversa com assistente de matemática',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'content_generation',
      amount: 8,
      description: 'Geração de exercícios personalizados',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'analysis',
      amount: 2,
      description: 'Análise de progresso semanal',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  const [paymentMethods] = useKV<PaymentMethod[]>('payment-methods', [
    {
      id: '1',
      type: 'credit_card',
      last4: '4532',
      brand: 'Visa',
      isDefault: true
    }
  ]);

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PLANS>('intermediario');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const creditPercentage = (subscription.credits / subscription.maxCredits) * 100;
  const isLowCredits = creditPercentage <= 20;
  const daysUntilRenewal = Math.ceil((subscription.renewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const consumeCredits = async (type: keyof typeof CREDIT_COSTS, description: string) => {
    const cost = CREDIT_COSTS[type];
    
    if (subscription.credits < cost) {
      toast.error('Créditos insuficientes para esta ação');
      return false;
    }

    const newUsage: CreditUsage = {
      id: Date.now().toString(),
      type,
      amount: cost,
      description,
      timestamp: new Date()
    };

    setCreditUsage(current => [newUsage, ...current.slice(0, 49)]); // Keep last 50 entries
    setSubscription(current => ({
      ...current,
      credits: current.credits - cost
    }));

    toast.success(`${cost} crédito(s) utilizado(s)`);
    return true;
  };

  const handleUpgrade = async () => {
    setIsProcessingPayment(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newPlan = PLANS[selectedPlan];
    setSubscription(current => ({
      ...current,
      plan: selectedPlan,
      credits: newPlan.credits,
      maxCredits: newPlan.credits,
      renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'active'
    }));

    setIsProcessingPayment(false);
    setShowUpgradeDialog(false);
    toast.success(`Plano ${newPlan.name} ativado com sucesso!`);
  };

  // Expose consumeCredits function globally for use in other components
  useEffect(() => {
    (window as any).consumeCredits = consumeCredits;
    return () => {
      delete (window as any).consumeCredits;
    };
  }, [subscription.credits]);

  if (!showFullInterface) {
    // Compact view for dashboard sidebar
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Créditos
            </CardTitle>
            <Badge variant={isLowCredits ? "destructive" : "secondary"}>
              {subscription.credits}/{subscription.maxCredits}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={creditPercentage} className="h-2" />
          
          {isLowCredits && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Créditos baixos! Considere fazer upgrade.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-xs text-muted-foreground">
            Renova em {daysUntilRenewal} dias
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            size="sm" 
            className="w-full"
            onClick={() => setShowUpgradeDialog(true)}
          >
            Gerenciar Plano
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sistema de Créditos</h1>
          <p className="text-muted-foreground">
            Gerencie seus créditos, assinatura e histórico de uso
          </p>
        </div>
        <Button onClick={() => setShowUpgradeDialog(true)}>
          <ArrowUp className="h-4 w-4 mr-2" />
          Upgrade do Plano
        </Button>
      </div>

      {/* Credit Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Saldo Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">
              {subscription.credits}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              de {subscription.maxCredits} créditos
            </div>
            <Progress value={creditPercentage} className="h-2" />
            {isLowCredits && (
              <Alert className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm">Créditos Baixos</AlertTitle>
                <AlertDescription className="text-xs">
                  Você tem poucos créditos restantes. Considere fazer upgrade.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              Próxima Renovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">
              {daysUntilRenewal}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              dias restantes
            </div>
            <div className="text-xs text-muted-foreground">
              {subscription.renewDate.toLocaleDateString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">
              {PLANS[subscription.plan].name}
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              R$ {PLANS[subscription.plan].price}/mês
            </div>
            <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
              {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Histórico de Uso
          </CardTitle>
          <CardDescription>
            Acompanhe como seus créditos foram utilizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {creditUsage.slice(0, 10).map((usage) => (
              <motion.div
                key={usage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-muted">
                    {usage.type === 'ai_chat' && <Zap className="h-4 w-4 text-primary" />}
                    {usage.type === 'content_generation' && <Brain className="h-4 w-4 text-secondary" />}
                    {usage.type === 'analysis' && <TrendingUp className="h-4 w-4 text-accent" />}
                    {usage.type === 'export' && <ArrowDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{usage.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {usage.timestamp.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">
                  -{usage.amount} créditos
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upgrade do Plano</DialogTitle>
            <DialogDescription>
              Escolha o plano ideal para suas necessidades de aprendizado
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(PLANS).map(([key, plan]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all ${
                  selectedPlan === key ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPlan(key as keyof typeof PLANS)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="text-2xl font-bold">
                    R$ {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary" />
                      <span className="text-sm">{plan.credits} créditos mensais</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary" />
                      <span className="text-sm">Suporte prioritário</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary" />
                      <span className="text-sm">Relatórios detalhados</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold">Método de Pagamento</h4>
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">
                      {method.brand} •••• {method.last4}
                    </div>
                    {method.isDefault && (
                      <Badge variant="secondary" className="text-xs">Padrão</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              Total: R$ {PLANS[selectedPlan].price}/mês
            </div>
            <div className="space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowUpgradeDialog(false)}
                disabled={isProcessingPayment}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpgrade}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Confirmar Upgrade'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}