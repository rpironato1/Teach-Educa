import React from 'react'
import { motion } from 'framer-motion'
import { 
  CurrencyDollar, 
  CreditCard, 
  TrendUp, 
  TrendDown, 
  Calendar,
  Receipt,
  AlertTriangle,
  CheckCircle
} from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useCredit } from '@/contexts/CreditContext'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CreditDashboardProps {
  onUpgrade?: () => void
  onViewHistory?: () => void
}

const CreditDashboard: React.FC<CreditDashboardProps> = ({ onUpgrade, onViewHistory }) => {
  const { 
    balance, 
    currentPlan, 
    transactions,
    getRemainingCreditsPercentage,
    getAvailablePlans
  } = useCredit()

  const remainingPercentage = getRemainingCreditsPercentage()
  const recentTransactions = transactions.slice(0, 5)
  const availablePlans = getAvailablePlans()

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

  const getStatusColor = (percentage: number) => {
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 20) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Current Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créditos Atuais</CardTitle>
              <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{balance.current}</div>
              <p className="text-xs text-muted-foreground">
                de {balance.monthly} mensais
              </p>
              <div className="mt-3">
                <Progress 
                  value={remainingPercentage} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {remainingPercentage}% restante
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentPlan?.name || 'Nenhum'}</div>
              <p className="text-xs text-muted-foreground">
                {currentPlan ? `R$ ${currentPlan.price}/${currentPlan.period === 'month' ? 'mês' : 'ano'}` : 'Sem plano ativo'}
              </p>
              {currentPlan && (
                <Badge variant="secondary" className="mt-2">
                  {currentPlan.credits} créditos/mês
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créditos Bônus</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{balance.bonus}</div>
              <p className="text-xs text-muted-foreground">
                Não expiram
              </p>
              {balance.bonus > 0 && (
                <Badge variant="outline" className="mt-2">
                  Válido indefinidamente
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Low Balance Warning */}
      {remainingPercentage < 20 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800">Créditos Baixos</h3>
                  <p className="text-sm text-yellow-700">
                    Você tem apenas {balance.current} créditos restantes. Considere fazer upgrade do seu plano.
                  </p>
                </div>
                <Button size="sm" onClick={onUpgrade} variant="outline">
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>
                  Últimas movimentações de créditos
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={onViewHistory}>
                Ver Histórico
              </Button>
            </div>
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
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(transaction.timestamp, { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                            {transaction.relatedService && ` • ${transaction.relatedService}`}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                    {index < recentTransactions.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma transação encontrada
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Plans for Upgrade */}
      {onUpgrade && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Planos Disponíveis</CardTitle>
              <CardDescription>
                Upgrade para ter mais créditos e recursos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availablePlans.map((plan, index) => (
                  <div 
                    key={plan.id}
                    className={`p-4 border rounded-lg ${
                      currentPlan?.id === plan.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    } transition-colors`}
                  >
                    <div className="space-y-2">
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-2xl font-bold">
                        R$ {plan.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{plan.period === 'month' ? 'mês' : 'ano'}
                        </span>
                      </p>
                      <Badge variant="outline">{plan.credits} créditos</Badge>
                      {currentPlan?.id === plan.id ? (
                        <Badge className="w-full justify-center">Plano Atual</Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={onUpgrade}
                          variant={
                            currentPlan && plan.price > currentPlan.price 
                              ? "default" 
                              : "outline"
                          }
                        >
                          {currentPlan && plan.price > currentPlan.price 
                            ? "Upgrade" 
                            : currentPlan && plan.price < currentPlan.price
                            ? "Downgrade"
                            : "Escolher"
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{balance.monthly - balance.current}</div>
                <p className="text-xs text-muted-foreground">Créditos Utilizados</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{transactions.filter(t => t.type === 'debit').length}</div>
                <p className="text-xs text-muted-foreground">Transações</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {formatDistanceToNow(balance.lastUpdated, { locale: ptBR })}
                </div>
                <p className="text-xs text-muted-foreground">Última Atualização</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(((balance.monthly - balance.current) / Math.max(1, new Date().getDate())) * 30)}
                </div>
                <p className="text-xs text-muted-foreground">Média Mensal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default CreditDashboard