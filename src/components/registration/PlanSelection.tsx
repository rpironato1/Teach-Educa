import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Star } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Plan } from '../RegistrationFlow'

interface PlanSelectionProps {
  plans: Plan[]
  selectedPlan?: Plan
  onPlanSelect: (plan: Plan) => void
  onNext: () => void
  onBack: () => void
}

export default function PlanSelection({ 
  plans, 
  selectedPlan, 
  onPlanSelect, 
  onNext, 
  onBack 
}: PlanSelectionProps) {
  
  const handlePlanSelect = (plan: Plan) => {
    onPlanSelect(plan)
  }

  const handleContinue = () => {
    if (!selectedPlan) return
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Escolha seu plano ideal
        </h3>
        <p className="text-muted-foreground">
          Todos os planos incluem nossa tecnologia neuroadaptativa e podem ser alterados a qualquer momento
        </p>
      </div>

      <div className="grid gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-secondary text-secondary-foreground px-3 py-1">
                  <Star className="h-3 w-3 mr-1" weight="fill" />
                  Mais Popular
                </Badge>
              </div>
            )}
            
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedPlan?.name === plan.name 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : plan.popular 
                    ? 'ring-1 ring-secondary/30' 
                    : 'hover:shadow-md'
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      {plan.name}
                      {selectedPlan?.name === plan.name && (
                        <CheckCircle className="h-5 w-5 text-primary" weight="fill" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {plan.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-foreground">
                      {plan.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {plan.period}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit">
                  {plan.credits} créditos mensais
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0" weight="fill" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </CardContent>

              {selectedPlan?.name === plan.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border"
                >
                  <CardFooter className="bg-primary/5 text-center">
                    <div className="text-sm text-primary font-medium">
                      ✓ Plano selecionado
                    </div>
                  </CardFooter>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Plan comparison benefits */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-foreground mb-4 text-center">
            🧠 Todos os planos incluem:
          </h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
              <span>Tecnologia neuroadaptativa</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
              <span>Relatórios de progresso</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
              <span>Acesso via web e mobile</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-secondary" weight="fill" />
              <span>Cancelamento a qualquer momento</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit explanation */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-foreground mb-2">
            💡 Como funcionam os créditos?
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Os créditos são consumidos conforme você usa a plataforma:
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>• Aula com IA personalizada</span>
              <span className="font-medium">5 créditos</span>
            </div>
            <div className="flex justify-between">
              <span>• Exercício adaptativo</span>
              <span className="font-medium">3 créditos</span>
            </div>
            <div className="flex justify-between">
              <span>• Relatório de progresso</span>
              <span className="font-medium">2 créditos</span>
            </div>
            <div className="flex justify-between">
              <span>• Sessão de dúvidas com IA</span>
              <span className="font-medium">8 créditos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={handleContinue}
          disabled={!selectedPlan}
          className="w-full focus-enhanced"
          size="lg"
        >
          {selectedPlan 
            ? `Continuar com ${selectedPlan.name} - ${selectedPlan.price}${selectedPlan.period}`
            : 'Selecione um plano para continuar'
          }
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="focus-enhanced"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar à verificação
        </Button>
      </div>

      {/* Money back guarantee */}
      <div className="text-center text-sm text-muted-foreground">
        <p>💰 Garantia de 7 dias - cancele sem custos se não ficar satisfeito</p>
      </div>
    </div>
  )
}