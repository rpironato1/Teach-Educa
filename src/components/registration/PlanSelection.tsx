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
    <div className="space-y-6 sm:px-4 md:px-6 lg:px-8">
      <div className="text-center sm:px-4 md:px-6 lg:px-8">
        <h3 className="text-2xl font-bold text-foreground mb-2 sm:px-4 md:px-6 lg:px-8">
          Escolha seu plano ideal
        </h3>
        <p className="text-muted-foreground sm:px-4 md:px-6 lg:px-8">
          Todos os planos incluem nossa tecnologia neuroadaptativa e podem ser alterados a qualquer momento
        </p>
      </div>

      <div className="grid gap-6 sm:px-4 md:px-6 lg:px-8">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative sm:px-4 md:px-6 lg:px-8"
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 sm:px-4 md:px-6 lg:px-8">
                <Badge className="bg-secondary text-secondary-foreground px-3 py-1 sm:px-4 md:px-6 lg:px-8">
                  <Star className="h-3 w-3 mr-1 sm:px-4 md:px-6 lg:px-8" weight="fill" />
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
              <CardHeader className="pb-4 sm:px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between sm:px-4 md:px-6 lg:px-8">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2 sm:px-4 md:px-6 lg:px-8">
                      {plan.name}
                      {selectedPlan?.name === plan.name && (
                        <CheckCircle className="h-5 w-5 text-primary sm:px-4 md:px-6 lg:px-8" weight="fill" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1 sm:px-4 md:px-6 lg:px-8">
                      {plan.description}
                    </CardDescription>
                  </div>
                  <div className="text-right sm:px-4 md:px-6 lg:px-8">
                    <div className="text-3xl font-bold text-foreground sm:px-4 md:px-6 lg:px-8">
                      {plan.price}
                    </div>
                    <div className="text-sm text-muted-foreground sm:px-4 md:px-6 lg:px-8">
                      {plan.period}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit sm:px-4 md:px-6 lg:px-8">
                  {plan.credits} créditos mensais
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-3 sm:px-4 md:px-6 lg:px-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3 sm:px-4 md:px-6 lg:px-8">
                    <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0 sm:px-4 md:px-6 lg:px-8" weight="fill" />
                    <span className="text-sm text-muted-foreground sm:px-4 md:px-6 lg:px-8">{feature}</span>
                  </div>
                ))}
              </CardContent>

              {selectedPlan?.name === plan.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border sm:px-4 md:px-6 lg:px-8"
                >
                  <CardFooter className="bg-primary/5 text-center sm:px-4 md:px-6 lg:px-8">
                    <div className="text-sm text-primary font-medium sm:px-4 md:px-6 lg:px-8">
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
      <Card className="bg-muted/30 sm:px-4 md:px-6 lg:px-8">
        <CardContent className="pt-6 sm:px-4 md:px-6 lg:px-8">
          <h4 className="font-semibold text-foreground mb-4 text-center sm:px-4 md:px-6 lg:px-8">
            🧠 Todos os planos incluem:
          </h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2 sm:px-4 md:px-6 lg:px-8">
              <CheckCircle className="h-4 w-4 text-secondary sm:px-4 md:px-6 lg:px-8" weight="fill" />
              <span>Tecnologia neuroadaptativa</span>
            </div>
            <div className="flex items-center space-x-2 sm:px-4 md:px-6 lg:px-8">
              <CheckCircle className="h-4 w-4 text-secondary sm:px-4 md:px-6 lg:px-8" weight="fill" />
              <span>Relatórios de progresso</span>
            </div>
            <div className="flex items-center space-x-2 sm:px-4 md:px-6 lg:px-8">
              <CheckCircle className="h-4 w-4 text-secondary sm:px-4 md:px-6 lg:px-8" weight="fill" />
              <span>Acesso via web e mobile</span>
            </div>
            <div className="flex items-center space-x-2 sm:px-4 md:px-6 lg:px-8">
              <CheckCircle className="h-4 w-4 text-secondary sm:px-4 md:px-6 lg:px-8" weight="fill" />
              <span>Cancelamento a qualquer momento</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit explanation */}
      <Card className="border-dashed sm:px-4 md:px-6 lg:px-8">
        <CardContent className="pt-6 sm:px-4 md:px-6 lg:px-8">
          <h4 className="font-semibold text-foreground mb-2 sm:px-4 md:px-6 lg:px-8">
            💡 Como funcionam os créditos?
          </h4>
          <p className="text-sm text-muted-foreground mb-3 sm:px-4 md:px-6 lg:px-8">
            Os créditos são consumidos conforme você usa a plataforma:
          </p>
          <div className="space-y-2 text-sm text-muted-foreground sm:px-4 md:px-6 lg:px-8">
            <div className="flex justify-between sm:px-4 md:px-6 lg:px-8">
              <span>• Aula com IA personalizada</span>
              <span className="font-medium sm:px-4 md:px-6 lg:px-8">5 créditos</span>
            </div>
            <div className="flex justify-between sm:px-4 md:px-6 lg:px-8">
              <span>• Exercício adaptativo</span>
              <span className="font-medium sm:px-4 md:px-6 lg:px-8">3 créditos</span>
            </div>
            <div className="flex justify-between sm:px-4 md:px-6 lg:px-8">
              <span>• Relatório de progresso</span>
              <span className="font-medium sm:px-4 md:px-6 lg:px-8">2 créditos</span>
            </div>
            <div className="flex justify-between sm:px-4 md:px-6 lg:px-8">
              <span>• Sessão de dúvidas com IA</span>
              <span className="font-medium sm:px-4 md:px-6 lg:px-8">8 créditos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:px-4 md:px-6 lg:px-8">
        <Button
          onClick={handleContinue}
          disabled={!selectedPlan}
          className="w-full focus-enhanced sm:px-4 md:px-6 lg:px-8"
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
          className="focus-enhanced sm:px-4 md:px-6 lg:px-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2 sm:px-4 md:px-6 lg:px-8" />
          Voltar à verificação
        </Button>
      </div>

      {/* Money back guarantee */}
      <div className="text-center text-sm text-muted-foreground sm:px-4 md:px-6 lg:px-8">
        <p>💰 Garantia de 7 dias - cancele sem custos se não ficar satisfeito</p>
      </div>
    </div>
  )
}