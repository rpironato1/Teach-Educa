/**
 * AI Chat Interface Component
 * Interface principal para interação com assistentes de IA
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  PaperPlane,
  Sparkle,
  User,
  Clock,
  TrendUp,
  Lightning,
  Brain
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { aiService, type Assistant, type ChatMessage, type ProgressAnalysis } from '@/services/aiService'
import { useAuth } from '@/contexts/AuthContext'
import { useCredit } from '@/contexts/CreditContext'
import { toast } from 'sonner'

interface AIChatInterfaceProps {
  selectedAssistant: Assistant
  onAssistantChange: (assistant: Assistant) => void
}

export default function AIChatInterface({
  selectedAssistant
}: AIChatInterfaceProps) {
  const { user } = useAuth()
  const { consumeCredits, checkCreditSufficiency, getCreditCost } = useCredit()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStartTime] = useState(new Date())
  const [messageCount, setMessageCount] = useState(0)
  const [progressAnalysis, setProgressAnalysis] = useState<ProgressAnalysis | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Carrega histórico da conversa quando o assistente muda
  useEffect(() => {
    if (user) {
      const history = aiService.getConversationHistory(user.id, selectedAssistant.id)
      setMessages(history)
      setMessageCount(history.filter(m => m.role === 'user').length)
    }
  }, [selectedAssistant, user])

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Inicia conversa se não houver histórico
  const initializeConversation = useCallback(async () => {
    if (!user) return

    try {
      const initialMessages = await aiService.startConversation(
        selectedAssistant.id,
        user.id,
        `Olá! Sou ${user.fullName} e gostaria de aprender com você.`
      )
      setMessages(initialMessages)
      setMessageCount(1)
    } catch (error) {
      console.error('Erro ao inicializar conversa:', error)
      toast.error('Erro ao conectar com o assistente')
    }
  }, [user, selectedAssistant])

  useEffect(() => {
    if (user && messages.length === 0) {
      initializeConversation()
    }
  }, [user, messages.length, initializeConversation])

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user || isLoading) return

    // Check credit requirement before proceeding
    const requiredCredits = getCreditCost('AI_CHAT_MESSAGE')
    if (!checkCreditSufficiency(requiredCredits)) {
      toast.error(`Você precisa de ${requiredCredits} créditos para enviar mensagem`)
      return
    }

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setIsLoading(true)

    try {
      // Adiciona mensagem do usuário imediatamente
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        assistantId: selectedAssistant.id,
        creditsCost: 0
      }
      
      setMessages(prev => [...prev, tempUserMessage])

      // Envia para o assistente
      const response = await aiService.sendMessage(
        user.id,
        selectedAssistant.id,
        userMessage
      )

      // Atualiza mensagens com resposta real
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== tempUserMessage.id)
        return [...withoutTemp, 
          { ...tempUserMessage, id: `user-${Date.now()}` },
          response
        ]
      })

      // Atualiza contadores
      setMessageCount(prev => prev + 1)
      
      // Consume credits after successful response
      const creditCost = getCreditCost('AI_CHAT_MESSAGE')
      const success = await consumeCredits(
        creditCost, 
        `Conversa com ${selectedAssistant.name}`,
        'AI Chat'
      )

      // Analisa progresso a cada 5 mensagens
      if (messageCount % 5 === 0) {
        analyzeProgress()
      }

      if (success) {
        toast.success(`Resposta gerada!`)
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error('Erro ao enviar mensagem')
      
      // Remove mensagem temporária em caso de erro
      setMessages(prev => prev.filter(m => m.id !== `temp-${Date.now()}`))
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const analyzeProgress = async () => {
    if (!user) return

    try {
      const analysis = await aiService.analyzeProgress(user.id)
      setProgressAnalysis(analysis)
    } catch (error) {
      console.error('Erro ao analisar progresso:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getSessionDuration = () => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000)
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const clearConversation = () => {
    if (!user) return
    
    aiService.clearConversationHistory(user.id, selectedAssistant.id)
    setMessages([])
    setMessageCount(0)
    setProgressAnalysis(null)
    initializeConversation()
    toast.success('Conversa reiniciada')
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header do Chat */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`text-2xl bg-${selectedAssistant.color}/10 p-2 rounded-lg`}>
              {selectedAssistant.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{selectedAssistant.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedAssistant.specialty}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{getSessionDuration()}</span>
            </div>
            <Badge variant="secondary">
              {messageCount} mensagens
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={clearConversation}
            >
              Nova Conversa
            </Button>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">{selectedAssistant.avatar}</div>
              <h3 className="text-lg font-semibold mb-2">
                Olá! Sou o {selectedAssistant.name}
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedAssistant.description}
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                {selectedAssistant.capabilities.map((capability, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      {message.role === 'user' ? (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" weight="fill" />
                        </div>
                      ) : (
                        <div className={`w-8 h-8 bg-${selectedAssistant.color}/10 rounded-full flex items-center justify-center text-lg`}>
                          {selectedAssistant.avatar}
                        </div>
                      )}
                    </div>

                    {/* Mensagem */}
                    <div className={`${message.role === 'user' ? 'order-1' : 'order-2'} flex-1`}>
                      <div className={`
                        rounded-lg p-4 
                        ${message.role === 'user' 
                          ? 'bg-primary text-primary-foreground ml-4' 
                          : 'bg-muted mr-4'
                        }
                      `}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        
                        {message.metadata && message.role === 'assistant' && (
                          <div className="mt-2 pt-2 border-t border-border/50 flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Brain className="h-3 w-3" />
                              <span>Confiança: {Math.round((message.metadata.confidence || 0) * 100)}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Sparkle className="h-3 w-3" />
                              <span>Adaptação: {Math.round((message.metadata.adaptationLevel || 0) * 100)}%</span>
                            </div>
                            {message.creditsCost > 0 && (
                              <div className="flex items-center space-x-1">
                                <Lightning className="h-3 w-3" />
                                <span>{message.creditsCost} créditos</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className={`mt-1 text-xs text-muted-foreground ${message.role === 'user' ? 'text-right mr-4' : 'ml-4'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {/* Indicador de digitação */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-${selectedAssistant.color}/10 rounded-full flex items-center justify-center text-lg`}>
                  {selectedAssistant.avatar}
                </div>
                <div className="bg-muted rounded-lg p-4 mr-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Análise de Progresso */}
      {progressAnalysis && (
        <div className="border-t border-border p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <TrendUp className="h-4 w-4" />
                <span>Análise de Progresso</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">
                    {Math.round(progressAnalysis.comprehension * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Compreensão</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-secondary">
                    {Math.round(progressAnalysis.retention * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Retenção</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-accent">
                    {Math.round(progressAnalysis.engagement * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Engajamento</div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Próximo objetivo:</span> {progressAnalysis.estimatedTime} min
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Input de Mensagem */}
      <div className="border-t border-border p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Converse com ${selectedAssistant.name}...`}
              className="min-h-[50px] max-h-32 resize-none"
              disabled={isLoading}
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Custo: {selectedAssistant.creditCost} créditos por mensagem
              </span>
              <span>
                Enter para enviar • Shift+Enter para quebrar linha
              </span>
            </div>
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="lg"
            className="self-end"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/20 rounded-full border-t-primary-foreground animate-spin" />
            ) : (
              <PaperPlane className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}