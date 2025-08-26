import React from 'react'
import { motion } from 'framer-motion'
import { CurrencyDollar, Wallet, TrendUp, AlertTriangle } from '@phosphor-icons/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCredit } from '@/contexts/CreditContext'

interface CreditWidgetProps {
  compact?: boolean
  onManageCredits?: () => void
  onUpgrade?: () => void
}

const CreditWidget: React.FC<CreditWidgetProps> = ({ 
  compact = false, 
  onManageCredits, 
  onUpgrade 
}) => {
  const { balance, currentPlan, getRemainingCreditsPercentage } = useCredit()
  
  const remainingPercentage = getRemainingCreditsPercentage()
  const isLowCredits = remainingPercentage < 20

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-muted/50 rounded-lg px-3 py-2">
          <CurrencyDollar className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{balance.current}</span>
          {isLowCredits && (
            <AlertTriangle className="h-3 w-3 text-yellow-500 ml-1" />
          )}
        </div>
        {onManageCredits && (
          <Button variant="ghost" size="sm" onClick={onManageCredits}>
            <Wallet className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className={isLowCredits ? 'border-yellow-200 bg-yellow-50' : ''}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CurrencyDollar className="h-5 w-5 text-primary" />
                <span className="font-medium">Créditos</span>
              </div>
              {currentPlan && (
                <Badge variant="secondary" className="text-xs">
                  {currentPlan.name}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{balance.current}</span>
                <span className="text-sm text-muted-foreground">
                  de {balance.monthly}
                </span>
              </div>
              
              <Progress 
                value={remainingPercentage} 
                className="h-2"
              />
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {remainingPercentage}% restante
                </span>
                {balance.bonus > 0 && (
                  <span className="text-blue-600">
                    +{balance.bonus} bônus
                  </span>
                )}
              </div>
            </div>

            {isLowCredits && (
              <div className="flex items-center space-x-2 p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-xs text-yellow-700">
                  Créditos baixos
                </span>
              </div>
            )}

            <div className="flex space-x-2">
              {onManageCredits && (
                <Button variant="outline" size="sm" onClick={onManageCredits} className="flex-1">
                  <Wallet className="h-4 w-4 mr-2" />
                  Gerenciar
                </Button>
              )}
              {onUpgrade && (
                <Button size="sm" onClick={onUpgrade} className="flex-1">
                  <TrendUp className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default CreditWidget