import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  CreditCard, 
  TrendUp, 
  TrendDown,
  CheckCircle,
  AlertTriangle,
  Crown,
  Calendar,
  Receipt
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useCredit, SUBSCRIPTION_PLANS } from '@/contexts/CreditContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface SubscriptionManagerProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade?: () => void
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade 
}) => {
  const { 
    balance, 
    currentPlan, 
    transactions,
    downgradeSubscription,
    cancelSubscription,
    getRemainingCreditsPercentage
  } = useCredit()

  const [isChangingPlan, setIsChangingPlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const remainingPercentage = getRemainingCreditsPercentage()
  const availablePlans = Object.values(SUBSCRIPTION_PLANS)
  const recentTransactions = transactions.slice(0, 10)

  const handlePlanChange = async (planId: string) => {
    if (!currentPlan) return

    setIsChangingPlan(true)
    
    try {
      const newPlan = SUBSCRIPTION_PLANS[planId]
      if (newPlan.price > currentPlan.price) {
        // Upgrade - redirect to payment
        if (onUpgrade) {
          onUpgrade()
        }
      } else if (newPlan.price < currentPlan.price) {
        // Downgrade
        await downgradeSubscription(planId)
        toast.success(`Plano alterado para ${newPlan.name}`)
      }
    } catch {
      toast.error('Erro ao alterar plano')
    } finally {
      setIsChangingPlan(false)
      setSelectedPlan(null)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription()
      toast.success('Assinatura cancelada com sucesso')
      onClose()
    } catch {
      toast.error('Erro ao cancelar assinatura')
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'debit':
        return <TrendDown className="h-4 w-4 text-red-500" />
      case 'credit':
      case 'subscription':
        return <TrendUp className="h-4 w-4 text-green-500" />
      case 'bonus':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Receipt className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPlanBadgeColor = (planId: string) => {
    switch (planId) {
      case 'inicial':
        return 'bg-primary text-primary-foreground'
      case 'intermediario':
        return 'bg-secondary text-secondary-foreground'
      case 'profissional':
        return 'bg-accent text-accent-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Gerenciar Assinatura
          </DialogTitle>
          <DialogDescription>
            Gerencie seus créditos, planos e histórico de transações
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Créditos Atuais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{balance.current}</div>
                    <Progress value={remainingPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{remainingPercentage}% restante</span>
                      <span>{balance.monthly} mensais</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Plano Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{currentPlan?.name || 'Nenhum'}</span>
                    </div>
                    {currentPlan && (
                      <>
                        <div className="text-xl font-bold text-primary">
                          R$ {currentPlan.price}/mês
                        </div>
                        <Badge className={getPlanBadgeColor(currentPlan.id)}>
                          {currentPlan.credits} créditos
                        </Badge>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Créditos Bônus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">{balance.bonus}</div>
                    <div className="text-xs text-muted-foreground">
                      {balance.bonus > 0 ? 'Válidos indefinidamente' : 'Nenhum crédito bônus'}
                    </div>
                    {balance.bonus > 0 && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        Não expiram
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Low Credits Warning */}
            {remainingPercentage < 20 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <h3 className="font-medium text-yellow-800">Créditos Baixos</h3>
                        <p className="text-sm text-yellow-700">
                          Você tem apenas {balance.current} créditos restantes. 
                          Considere fazer upgrade do seu plano.
                        </p>
                      </div>
                      <Button size="sm" onClick={onUpgrade}>
                        Upgrade
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button variant="outline" onClick={onUpgrade} className="justify-start">
                    <TrendUp className="h-4 w-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Histórico de Cobrança
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="justify-start text-red-600 hover:text-red-700">
                        <X className="h-4 w-4 mr-2" />
                        Cancelar Assinatura
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja cancelar sua assinatura? 
                          Você perderá acesso aos benefícios do plano {currentPlan?.name}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription}>
                          Cancelar Assinatura
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className={`relative ${
                    currentPlan?.id === plan.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:shadow-lg transition-shadow'
                  }`}>
                    {currentPlan?.id === plan.id && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Plano Atual
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold text-primary">
                        R$ {plan.price}
                        <span className="text-base font-normal text-muted-foreground">/mês</span>
                      </div>
                      <Badge variant="outline">{plan.credits} créditos</Badge>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      {currentPlan?.id === plan.id ? (
                        <Button disabled className="w-full">
                          Plano Atual
                        </Button>
                      ) : (
                        <Button 
                          className="w-full"
                          variant={
                            currentPlan && plan.price > currentPlan.price 
                              ? "default" 
                              : "outline"
                          }
                          disabled={isChangingPlan}
                          onClick={() => {
                            if (currentPlan && plan.price > currentPlan.price) {
                              onUpgrade?.()
                            } else {
                              setSelectedPlan(plan.id)
                              handlePlanChange(plan.id)
                            }
                          }}
                        >
                          {isChangingPlan && selectedPlan === plan.id ? (
                            'Alterando...'
                          ) : currentPlan && plan.price > currentPlan.price ? (
                            'Fazer Upgrade'
                          ) : currentPlan && plan.price < currentPlan.price ? (
                            'Fazer Downgrade'
                          ) : (
                            'Escolher Plano'
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Histórico de Transações</CardTitle>
                <CardDescription>
                  Últimas {recentTransactions.length} transações
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction, index) => (
                      <div key={transaction.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(transaction.type)}
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(transaction.timestamp, { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                                {transaction.relatedService && ` • ${transaction.relatedService}`}
                              </p>
                            </div>
                          </div>
                          <div className={`font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            {transaction.amount !== 0 && ' créditos'}
                          </div>
                        </div>
                        {index < recentTransactions.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Nenhuma transação encontrada
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SubscriptionManager