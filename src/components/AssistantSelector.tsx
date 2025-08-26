/**
 * Assistant Selector Component
 * Seletor de assistentes de IA com informações detalhadas
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Lightning,
  Brain,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Zap
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { type Assistant, AVAILABLE_ASSISTANTS } from '@/services/aiService'
import { useCredit } from '@/contexts/CreditContext'

interface AssistantSelectorProps {
  selectedAssistant: Assistant
  onAssistantSelect: (assistant: Assistant) => void
}

export default function AssistantSelector({
  selectedAssistant,
  onAssistantSelect
}: AssistantSelectorProps) {
  const [expandedAssistant, setExpandedAssistant] = useState<string | null>(null)
  const { balance, checkCreditSufficiency } = useCredit()
  
  const totalCredits = balance.current + balance.monthly + balance.bonus

  const getColorClasses = (color: string) => {
    const colorMap = {
      primary: {
        bg: 'bg-primary/10',
        border: 'border-primary/20',
        text: 'text-primary',
        badge: 'bg-primary text-primary-foreground'
      },
      secondary: {
        bg: 'bg-secondary/10',
        border: 'border-secondary/20',
        text: 'text-secondary',
        badge: 'bg-secondary text-secondary-foreground'
      },
      accent: {
        bg: 'bg-accent/10',
        border: 'border-accent/20',
        text: 'text-accent',
        badge: 'bg-accent text-accent-foreground'
      },
      destructive: {
        bg: 'bg-destructive/10',
        border: 'border-destructive/20',
        text: 'text-destructive',
        badge: 'bg-destructive text-destructive-foreground'
      },
      muted: {
        bg: 'bg-muted',
        border: 'border-muted-foreground/20',
        text: 'text-muted-foreground',
        badge: 'bg-muted-foreground text-background'
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.primary
  }

  const canAffordAssistant = (assistant: Assistant) => {
    return checkCreditSufficiency(assistant.creditCost)
  }

  const getAffordabilityMessage = (assistant: Assistant) => {
    if (canAffordAssistant(assistant)) {
      const possibleMessages = Math.floor(totalCredits / assistant.creditCost)
      return `${possibleMessages} mensagens possíveis`
    }
    const needed = assistant.creditCost - totalCredits
    return `Você precisa de mais ${needed} créditos`
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>Assistentes de IA</span>
          <Badge variant="outline" className="ml-auto">
            {totalCredits} créditos
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-3 p-4">
            {AVAILABLE_ASSISTANTS.map((assistant, index) => {
              const colors = getColorClasses(assistant.color)
              const isSelected = selectedAssistant.id === assistant.id
              const isExpanded = expandedAssistant === assistant.id
              const canAfford = canAffordAssistant(assistant)

              return (
                <motion.div
                  key={assistant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`
                    transition-all duration-300 cursor-pointer
                    ${isSelected 
                      ? `${colors.border} ${colors.bg} border-2 shadow-lg` 
                      : 'border hover:shadow-md'
                    }
                    ${!canAfford ? 'opacity-60' : ''}
                  `}>
                    <div
                      onClick={() => {
                        if (canAfford) {
                          onAssistantSelect(assistant)
                        }
                      }}
                      className="p-4"
                    >
                      {/* Header do Assistente */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`text-3xl p-2 rounded-lg ${colors.bg}`}>
                          {assistant.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground flex items-center space-x-2">
                            <span>{assistant.name}</span>
                            {isSelected && (
                              <Star className="h-4 w-4 text-yellow-500" weight="fill" />
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {assistant.specialty}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={colors.badge}>
                            {assistant.creditCost} créditos
                          </Badge>
                        </div>
                      </div>

                      {/* Descrição */}
                      <p className="text-sm text-muted-foreground mb-3">
                        {assistant.description}
                      </p>

                      {/* Status de Créditos */}
                      <div className={`
                        text-xs p-2 rounded-md mb-3
                        ${canAfford 
                          ? 'bg-secondary/10 text-secondary' 
                          : 'bg-destructive/10 text-destructive'
                        }
                      `}>
                        <div className="flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>{getAffordabilityMessage(assistant)}</span>
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex items-center justify-between">
                        <Collapsible>
                          <CollapsibleTrigger
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedAssistant(
                                isExpanded ? null : assistant.id
                              )
                            }}
                            className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <span>Detalhes</span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                        </Collapsible>

                        {isSelected ? (
                          <Badge className="bg-primary text-primary-foreground">
                            Selecionado
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!canAfford}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (canAfford) {
                                onAssistantSelect(assistant)
                              }
                            }}
                          >
                            Selecionar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Seção Expandida com Detalhes */}
                    <Collapsible open={isExpanded}>
                      <CollapsibleContent>
                        <div className="border-t border-border p-4 space-y-4">
                          {/* Capacidades */}
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center space-x-1">
                              <Lightning className="h-4 w-4" />
                              <span>Capacidades</span>
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {assistant.capabilities.map((capability, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2 text-sm text-muted-foreground"
                                >
                                  <Sparkles className="h-3 w-3 text-primary" />
                                  <span>{capability}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Personalidade */}
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center space-x-1">
                              <Brain className="h-4 w-4" />
                              <span>Personalidade</span>
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {assistant.personality}
                            </p>
                          </div>

                          {/* Especificações Técnicas */}
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>Especificações</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Custo:</span>
                                <span className="font-medium">{assistant.creditCost} créditos</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tokens máx:</span>
                                <span className="font-medium">{assistant.maxTokens.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Exemplos de Uso */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">Exemplos de Uso</h4>
                            <div className="space-y-2">
                              {getUsageExamples(assistant.specialty).map((example, index) => (
                                <div
                                  key={index}
                                  className="text-xs p-2 bg-muted/50 rounded-md text-muted-foreground"
                                >
                                  "{example}"
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// Função auxiliar para obter exemplos de uso por especialidade
function getUsageExamples(specialty: string): string[] {
  const examples = {
    'Matemática': [
      'Como resolver equações de segundo grau?',
      'Explique derivadas de forma simples',
      'Preciso de ajuda com estatística'
    ],
    'Redação e Literatura': [
      'Como estruturar um ensaio argumentativo?',
      'Analise este poema para mim',
      'Ajude-me a melhorar meu estilo de escrita'
    ],
    'Programação': [
      'Como implementar recursão em Python?',
      'Revise este código JavaScript',
      'Explique padrões de design'
    ],
    'Ciências': [
      'Como funciona a fotossíntese?',
      'Explique a física quântica',
      'Qual é a diferença entre mitose e meiose?'
    ],
    'Idiomas': [
      'Como conjugar verbos irregulares em inglês?',
      'Pratique conversação em espanhol comigo',
      'Corrija minha gramática francesa'
    ]
  }

  return examples[specialty as keyof typeof examples] || [
    'Como posso te ajudar hoje?',
    'Tire suas dúvidas comigo',
    'Vamos aprender juntos!'
  ]
}