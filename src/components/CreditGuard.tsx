import React from 'react'
import { useCredit } from '@/contexts/CreditContext'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Zap } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CreditGuardProps {
  children: React.ReactNode
  creditsRequired: number
  feature: string
  onUpgrade?: () => void
  fallback?: React.ReactNode
}

/**
 * Component that guards features behind credit requirements
 * Shows children only if user has enough credits
 * Otherwise shows upgrade prompt or fallback content
 */
const CreditGuard: React.FC<CreditGuardProps> = ({
  children,
  creditsRequired,
  feature,
  onUpgrade,
  fallback
}) => {
  const { balance, checkCreditSufficiency, consumeCredits } = useCredit()
  
  const totalCredits = balance.current + balance.monthly + balance.bonus
  const hasEnoughCredits = checkCreditSufficiency(creditsRequired)
  
  // If user has enough credits, render children
  if (hasEnoughCredits) {
    return <>{children}</>
  }
  
  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>
  }
  
  // Default upgrade prompt
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/20">
      <div className="mb-4">
        <div className="h-12 w-12 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
        </div>
        <h3 className="font-semibold text-lg mb-1">Créditos Insuficientes</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Você precisa de <strong>{creditsRequired} créditos</strong> para usar {feature}
        </p>
        <p className="text-xs text-muted-foreground">
          Saldo atual: {totalCredits} créditos
        </p>
      </div>
      
      <div className="flex gap-2">
        {onUpgrade && (
          <Button onClick={onUpgrade}>
            <Zap className="h-4 w-4 mr-2" />
            Adquirir Créditos
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Hook to consume credits with automatic error handling
 */
export const useCreditConsumption = () => {
  const { consumeCredits, checkCreditSufficiency } = useCredit()
  
  const tryConsumeCredits = async (amount: number, description: string): Promise<boolean> => {
    if (!checkCreditSufficiency(amount)) {
      toast.error(`Você precisa de ${amount} créditos para esta ação`)
      return false
    }
    
    return consumeCredits(amount, description)
  }
  
  return { tryConsumeCredits, checkCreditSufficiency }
}

export default CreditGuard