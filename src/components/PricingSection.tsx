import { motion } from 'framer-motion'
import { CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PricingPlan {
  name: string
  credits: number
  price: string
  period: string
  description: string
  features: string[]
  popular: boolean
  color: string
}

interface PricingSectionProps {
  pricingPlans: PricingPlan[]
  onSelectPlan: () => void
  onMouseEnterPlan?: () => void
}

export default function PricingSection({ 
  pricingPlans, 
  onSelectPlan, 
  onMouseEnterPlan 
}: PricingSectionProps) {
  return (
    <section id="planos" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Planos de <span className="text-primary">Créditos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Escolha o plano ideal para sua jornada de aprendizado. 
            Todos incluem acesso à nossa tecnologia neuroadaptativa.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-secondary text-secondary-foreground px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}
              <Card className={`h-full transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-secondary scale-105' : 'hover:scale-105'
              }`}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {plan.credits} créditos
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0" weight="fill" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full focus-enhanced ${
                      plan.popular ? 'bg-secondary hover:bg-secondary/90' : ''
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={onSelectPlan}
                    onMouseEnter={onMouseEnterPlan}
                  >
                    Escolher {plan.name}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}