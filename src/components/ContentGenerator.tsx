/**
 * Content Generator Component
 * Gerador de conteúdo personalizado com IA
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  PencilSimple,
  Question,
  BookOpen,
  Download,
  Sparkles,
  Clock,
  RefreshCw,
  Copy,
  Check
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { aiService, type Assistant } from '@/services/aiService'
import { useAuth } from '@/contexts/AuthContext'
import { useCredit } from '@/contexts/CreditContext'
import { toast } from 'sonner'

interface ContentGeneratorProps {
  selectedAssistant: Assistant | null
  onCreditConsumption?: (credits: number, description: string) => Promise<boolean>
}

interface GeneratedContent {
  id: string
  topic: string
  type: string
  content: string
  timestamp: Date
  assistantName: string
  creditsCost: number
}

const CONTENT_TYPES = [
  {
    id: 'lesson',
    name: 'Lição',
    description: 'Conteúdo educativo estruturado',
    icon: <BookOpen className="h-4 w-4" />,
    creditCost: 3
  },
  {
    id: 'exercise',
    name: 'Exercício',
    description: 'Atividade prática para fixação',
    icon: <PencilSimple className="h-4 w-4" />,
    creditCost: 2
  },
  {
    id: 'summary',
    name: 'Resumo',
    description: 'Síntese de conceitos importantes',
    icon: <FileText className="h-4 w-4" />,
    creditCost: 2
  },
  {
    id: 'quiz',
    name: 'Quiz',
    description: 'Questionário para avaliação',
    icon: <Question className="h-4 w-4" />,
    creditCost: 3
  }
]

export default function ContentGenerator({
  selectedAssistant,
  onCreditConsumption
}: ContentGeneratorProps) {
  const { user } = useAuth()
  const { consumeCredits, checkCreditSufficiency, getCreditCost } = useCredit()
  const [topic, setTopic] = useState('')
  const [contentType, setContentType] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([])
  const [copiedContentId, setCopiedContentId] = useState<string | null>(null)

  const generateContent = async () => {
    if (!user || !topic.trim() || !contentType || !selectedAssistant) {
      toast.error('Preencha todos os campos')
      return
    }

    const selectedType = CONTENT_TYPES.find(t => t.id === contentType)!
    const creditsCost = getCreditCost('CONTENT_GENERATION')

    // Check credits before starting generation
    if (!checkCreditSufficiency(creditsCost)) {
      toast.error(`Você precisa de ${creditsCost} créditos para gerar ${selectedType.name}`)
      return
    }

    setIsGenerating(true)

    try {
      const content = await aiService.generateContent(
        user.id,
        topic.trim(),
        contentType as 'lesson' | 'exercise' | 'summary' | 'quiz',
        selectedAssistant.id
      )

      // Consume credits only after successful generation
      const success = onCreditConsumption 
        ? await onCreditConsumption(creditsCost, `Geração de ${selectedType.name}: ${topic}`)
        : await consumeCredits(creditsCost, `Geração de ${selectedType.name}: ${topic}`, 'Content Generation')
      
      if (success) {
        const generatedContent: GeneratedContent = {
          id: `content-${Date.now()}`,
          topic: topic.trim(),
          type: selectedType.name,
          content,
          timestamp: new Date(),
          assistantName: selectedAssistant.name,
          creditsCost
        }

        setGeneratedContents(prev => [generatedContent, ...prev])
        
        // Limpa o formulário
        setTopic('')
        setContentType('')

        toast.success(`${selectedType.name} gerado com sucesso!`)
      }

    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error)
      toast.error('Erro ao gerar conteúdo')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (content: string, contentId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedContentId(contentId)
      toast.success('Conteúdo copiado!')
      
      // Remove indicador após 2 segundos
      setTimeout(() => setCopiedContentId(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar conteúdo')
    }
  }

  const exportContent = (content: GeneratedContent) => {
    const text = `# ${content.type}: ${content.topic}\n\nGerado por: ${content.assistantName}\nData: ${content.timestamp.toLocaleString('pt-BR')}\n\n---\n\n${content.content}`
    
    const blob = new Blob([text], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${content.type}-${content.topic.replace(/\s+/g, '-')}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Conteúdo exportado!')
  }

  const getCreditCostForType = (typeId: string): number => {
    return CONTENT_TYPES.find(t => t.id === typeId)?.creditCost || 2
  }

  return (
    <div className="space-y-6">
      {/* Gerador de Conteúdo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Gerador de Conteúdo IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedAssistant ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione um assistente para gerar conteúdo personalizado</p>
            </div>
          ) : (
            <>
              {/* Assistente Selecionado */}
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl">{selectedAssistant.avatar}</div>
                <div>
                  <p className="font-medium">{selectedAssistant.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAssistant.specialty}</p>
                </div>
              </div>

              {/* Formulário */}
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="topic">Tópico</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Equações de segundo grau"
                    disabled={isGenerating}
                  />
                </div>

                <div>
                  <Label htmlFor="content-type">Tipo de Conteúdo</Label>
                  <Select value={contentType} onValueChange={setContentType} disabled={isGenerating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de conteúdo" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center space-x-2">
                            {type.icon}
                            <span>{type.name}</span>
                            <Badge variant="outline" className="ml-auto">
                              {type.creditCost} créditos
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {contentType && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {CONTENT_TYPES.find(t => t.id === contentType)?.description}
                    </p>
                  )}
                </div>

                <Button
                  onClick={generateContent}
                  disabled={!topic.trim() || !contentType || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Conteúdo
                      {contentType && (
                        <Badge variant="secondary" className="ml-2">
                          {getCreditCostForType(contentType)} créditos
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Conteúdos Gerados */}
      {generatedContents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-secondary" />
                <span>Conteúdos Gerados</span>
              </div>
              <Badge variant="outline">
                {generatedContents.length} {generatedContents.length === 1 ? 'item' : 'itens'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {generatedContents.map((content) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    {/* Header do Conteúdo */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{content.topic}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                          <Badge variant="outline">{content.type}</Badge>
                          <span>•</span>
                          <span>{content.assistantName}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{content.timestamp.toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(content.content, content.id)}
                        >
                          {copiedContentId === content.id ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copiar
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportContent(content)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Exportar
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Conteúdo */}
                    <div className="prose prose-sm max-w-none">
                      <ScrollArea className="h-40">
                        <div className="pr-4">
                          <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                            {content.content}
                          </pre>
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                      <span>Custo: {content.creditsCost} créditos</span>
                      <span>{content.content.length} caracteres</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}