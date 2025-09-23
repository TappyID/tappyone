'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MoreHorizontal, 
  Reply, 
  Forward, 
  Heart,
  Languages,
  Bot,
  X
} from 'lucide-react'

interface MessageActionsProps {
  messageId: string
  messageContent: string
  isFromUser: boolean
  onReply?: (messageId: string) => void
  onForward?: (messageId: string) => void
  onReaction?: (messageId: string, emoji: string) => void
  onTranslate?: (messageId: string, translatedText?: string) => void
  onAIReply?: (messageId: string, content: string) => void
}

export default function MessageActions({
  messageId,
  messageContent,
  isFromUser,
  onReply,
  onForward,
  onReaction,
  onTranslate,
  onAIReply
}: MessageActionsProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const [showTranslateReply, setShowTranslateReply] = useState(false)
  const [translatedMessage, setTranslatedMessage] = useState('')
  const [replyText, setReplyText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)

  // Função para responder com IA
  const handleAIReply = async () => {
    try {
      console.log('🤖 Gerando resposta com IA para:', messageContent.substring(0, 50))
      
      // Chamar API de IA
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: messageContent,
          context: 'Contexto: Você está gerando uma resposta para um atendimento via WhatsApp. A mensagem do cliente foi: "' + messageContent + '". Gere uma resposta profissional, amigável e útil.',
          type: 'response'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.text) {
          // Chamar callback para abrir modal com texto gerado
          onAIReply?.(messageId, data.text)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao gerar resposta IA:', error)
    }
  }

  // Função para traduzir mensagem
  const handleTranslate = async () => {
    try {
      console.log('🌍 Traduzindo mensagem:', messageContent.substring(0, 50))
      
      // Detectar idioma e definir tradução inteligente
      const isEnglish = /^[a-zA-Z\s.,!?'"()-]+$/.test(messageContent)
      const targetLanguage = isEnglish ? 'pt' : 'en'
      
      console.log('🎯 Idioma detectado:', isEnglish ? 'Inglês → Português' : 'Português → Inglês')
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: messageContent,
          sourceLanguage: isEnglish ? 'en' : 'pt',
          targetLanguage: targetLanguage
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.translatedText) {
          console.log('✅ Tradução recebida:', data.translatedText)
          // Chamar callback com a tradução
          onTranslate?.(messageId, data.translatedText)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao traduzir:', error)
    }
  }

  // Função para abrir modal de resposta com tradução
  const handleOpenTranslateReply = async () => {
    try {
      setIsTranslating(true)
      console.log('🌍📝 Preparando resposta com tradução para:', messageContent.substring(0, 50))
      
      // Detectar idioma da mensagem original
      const isEnglish = /^[a-zA-Z\s.,!?'"()-]+$/.test(messageContent)
      const targetLanguage = isEnglish ? 'pt' : 'en'
      
      // Traduzir mensagem original para mostrar no modal
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: messageContent,
          sourceLanguage: isEnglish ? 'en' : 'pt',
          targetLanguage: targetLanguage
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.translatedText) {
          setTranslatedMessage(data.translatedText)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao traduzir para modal:', error)
      setTranslatedMessage('Erro na tradução')
    } finally {
      setIsTranslating(false)
    }
  }

  // Função para enviar resposta traduzida
  const handleSendTranslatedReply = async () => {
    if (!replyText.trim()) return

    try {
      setIsTranslating(true)
      console.log('📤🌍 Enviando resposta traduzida:', replyText)
      
      // Detectar idioma da mensagem original para traduzir resposta de volta
      const isOriginalEnglish = /^[a-zA-Z\s.,!?'"()-]+$/.test(messageContent)
      const replyTargetLanguage = isOriginalEnglish ? 'en' : 'pt'
      const replySourceLanguage = isOriginalEnglish ? 'pt' : 'en'
      
      // Traduzir resposta para o idioma original da mensagem
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: replyText,
          sourceLanguage: replySourceLanguage,
          targetLanguage: replyTargetLanguage
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.translatedText) {
          console.log('✅ Resposta traduzida:', data.translatedText)
          // Enviar resposta traduzida
          onAIReply?.(messageId, data.translatedText)
          
          // Fechar modal e limpar campos
          setShowTranslateReply(false)
          setReplyText('')
          setTranslatedMessage('')
        }
      }
    } catch (error) {
      console.error('❌ Erro ao enviar resposta traduzida:', error)
    } finally {
      setIsTranslating(false)
    }
  }

  const reactions = ['❤️', '👍', '😂', '😮', '😢', '😡']

  const handleReaction = (emoji: string) => {
    onReaction?.(messageId, emoji)
    setShowReactions(false)
    setShowMenu(false)
  }

  const menuActions = [
    {
      id: 'reply',
      label: 'Responder',
      icon: Reply,
      onClick: () => {
        onReply?.(messageId)
        setShowMenu(false)
      }
    },
    {
      id: 'forward', 
      label: 'Encaminhar',
      icon: Forward,
      onClick: () => {
        onForward?.(messageId)
        setShowMenu(false)
      }
    },
    {
      id: 'reaction',
      label: 'Reação',
      icon: Heart,
      onClick: () => setShowReactions(true)
    },
    {
      id: 'ai-reply',
      label: 'Responder com I.A',
      icon: Bot,
      onClick: () => {
        handleAIReply()
        setShowMenu(false)
      }
    },
    {
      id: 'reply-translate',
      label: 'Responder com tradução',
      icon: Languages,
      onClick: () => {
        handleOpenTranslateReply()
        setShowTranslateReply(true)
        setShowMenu(false)
      }
    },
    {
      id: 'translate',
      label: 'Traduzir',
      icon: Languages,
      onClick: () => {
        handleTranslate()
        setShowMenu(false)
      }
    }
  ]

  return (
    <div className="relative">
      {/* Botão 3 pontinhos */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
          showMenu ? 'opacity-100' : ''
        }`}
      >
        <MoreHorizontal className="w-4 h-4 text-gray-500" />
      </button>

      {/* Menu de ações */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`absolute z-50 ${
              isFromUser ? 'right-0' : 'left-0'
            } mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2`}
          >
            {menuActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm"
                >
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-200">{action.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu de reações */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute z-50 ${
              isFromUser ? 'right-0' : 'left-0'
            } mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Escolha uma reação
              </span>
              <button
                onClick={() => setShowReactions(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            </div>
            <div className="flex gap-2">
              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-xl hover:scale-125 transition-transform p-1 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Resposta com Tradução */}
      <AnimatePresence>
        {showTranslateReply && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  🌍 Responder com Tradução
                </h3>
                <button
                  onClick={() => {
                    setShowTranslateReply(false)
                    setReplyText('')
                    setTranslatedMessage('')
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Mensagem Original Traduzida */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mensagem traduzida:
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  {isTranslating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Traduzindo...</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {translatedMessage || messageContent}
                    </p>
                  )}
                </div>
              </div>

              {/* Campo de Resposta */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sua resposta (será traduzida automaticamente):
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Digite sua resposta em português..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  autoFocus
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTranslateReply(false)
                    setReplyText('')
                    setTranslatedMessage('')
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendTranslatedReply}
                  disabled={!replyText.trim() || isTranslating}
                  className="flex-1 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isTranslating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Traduzindo...
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4" />
                      Enviar Traduzido
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Overlay para fechar menus */}
      {(showMenu || showReactions) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowMenu(false)
            setShowReactions(false)
          }}
        />
      )}
    </div>
  )
}
