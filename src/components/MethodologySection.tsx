import { motion } from 'framer-motion'
import { Brain, Target, Zap } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MethodologySection() {
  return (
    <section id="metodologia" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Metodologia <span className="text-secondary">Neuroadaptativa</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Nossa tecnologia revolucionária analisa seus padrões de aprendizado e 
            adapta o conteúdo para maximizar sua retenção e compreensão.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Brain className="h-12 w-12 text-primary" weight="duotone" />,
              title: "Análise Neural",
              description: "Algoritmos avançados monitoram seu progresso e identificam padrões únicos de aprendizado."
            },
            {
              icon: <Target className="h-12 w-12 text-secondary" weight="duotone" />,
              title: "Personalização Inteligente", 
              description: "Conteúdo adaptado automaticamente ao seu ritmo, estilo e objetivos de aprendizado."
            },
            {
              icon: <Zap className="h-12 w-12 text-accent" weight="duotone" />,
              title: "Otimização Contínua",
              description: "Sistema que evolui com você, melhorando constantemente sua experiência educacional."
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}