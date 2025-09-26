'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Send, 
  Bot, 
  Wand2, 
  RefreshCw, 
  Sparkles,
  MessageSquare,
  Loader2,
  Image,
  Volume2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditTextModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (text: string) => void
  initialText: string
  contactName?: string
  actionTitle?: string
}

export default function EditTextModal({ 
  isOpen, 
  onClose, 
  onSend, 
  initialText, 
  contactName,
  actionTitle 
}: EditTextModalProps) {
  const [text, setText] = useState(initialText)
  const [isGenerating, setIsGenerating] = useState(false)
  const [originalText] = useState(initialText)

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text)
    onClose()
  }

  const handleGenerate = async (type: 'improve' | 'formal' | 'casual' | 'response' | 'image' | 'audio') => {
    if (!text.trim() && type !== 'response') return
    
    setIsGenerating(true)
    try {
      let prompt = ''
      let context = ''
      
      if (contactName) {
        context = `Cliente: ${contactName}`
      }
      
      if (actionTitle) {
        context += context ? ` | Ação: ${actionTitle}` : `Ação: ${actionTitle}`
      }

      switch (type) {
        case 'improve':
          prompt = `Melhore este texto: "${text}"`
          break
        case 'formal':
          prompt = `Torne este texto mais formal: "${text}"`
          break
        case 'casual':
          prompt = `Torne este texto mais casual: "${text}"`
          break
        case 'response':
          prompt = text || 'Crie uma resposta de atendimento ao cliente profissional e amigável'
          break
        case 'image':
          prompt = text || 'Gere uma imagem profissional e atrativa'
          break
        case 'audio':
          prompt = text || 'Gere um áudio profissional'
          break
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          type
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (type === 'image') {
          if (data.imageUrl) {
            setText(`🖼️ Imagem gerada: ${data.imageUrl}\n\n${data.revised_prompt || data.prompt}`)
          } else {
            alert('Erro: URL da imagem não encontrada')
          }
        } else if (type === 'audio') {
          setText(`🎵 ${data.message || 'Áudio gerado com sucesso!'}\n\nPrompt: ${data.prompt}`)
        } else {
          setText(data.text)
        }
      } else {
        console.error('Erro ao gerar com IA:', response.status)
        alert('Erro ao gerar conteúdo com IA')
      }
    } catch (error) {
      console.error('Erro ao gerar com IA:', error)
      alert('Erro ao gerar conteúdo com IA')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setText(originalText)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="bg-primary p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Editar Mensagem</h2>
                  <p className="text-primary-foreground/80 text-sm">
                    {actionTitle && `${actionTitle} • `}
                    {contactName ? `Para: ${contactName}` : 'Nova mensagem'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* AI Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate('response')}
                disabled={isGenerating}
                className="h-8"
              >
                <Bot className="w-3 h-3 mr-1" />
                Gerar com IA
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate('improve')}
                disabled={isGenerating || !text.trim()}
                className="h-8"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                Melhorar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate('formal')}
                disabled={isGenerating || !text.trim()}
                className="h-8"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Formal
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate('casual')}
                disabled={isGenerating || !text.trim()}
                className="h-8"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Casual
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate('image')}
                disabled={isGenerating}
                className="h-8"
              >
                <Image className="w-3 h-3 mr-1" />
                Gerar Imagem
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate('audio')}
                disabled={isGenerating}
                className="h-8"
              >
                <Volume2 className="w-3 h-3 mr-1" />
                Gerar Áudio
              </Button>

              {text !== originalText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isGenerating}
                  className="h-8 ml-auto"
                >
                  Resetar
                </Button>
              )}
            </div>

            {/* Text Editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Mensagem
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                className="w-full min-h-[200px] p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none bg-background text-foreground disabled:opacity-50"
                disabled={isGenerating}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{text.length} caracteres</span>
                {isGenerating && (
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Gerando com IA...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-6 bg-muted/30">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isGenerating}
              >
                Cancelar
              </Button>
              
              <Button
                onClick={handleSend}
                disabled={!text.trim() || isGenerating}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Mensagem
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
