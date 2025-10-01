'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MoreHorizontal,
  Reply,
  Forward,
  Heart,
  Languages,
  Bot,
  X,
  Mic,
  MicOff
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

  // Estados para gravação de voz no modal
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Função melhorada para detectar idioma
  const detectLanguage = (text: string) => {
    const portugueseWords = ['é', 'ã', 'ç', 'ê', 'ô', 'õ', 'á', 'à', 'â', 'í', 'ó', 'ú', 'não', 'sim', 'com', 'para', 'que', 'uma', 'um', 'de', 'do', 'da', 'em', 'por', 'mas', 'ou', 'este', 'esta', 'isso', 'você', 'muito', 'bem', 'obrigado', 'obrigada']
    const spanishWords = ['ñ', 'hola', 'cómo', 'está', 'necesito', 'ayuda', 'gracias', 'por', 'favor', 'sí', 'no', 'el', 'la', 'es', 'con', 'para', 'que', 'una', 'uno', 'de', 'del', 'en', 'pero', 'o', 'este', 'esta', 'esto', 'usted', 'muy', 'bien', 'bueno', 'buena']
    const englishWords = ['the', 'and', 'or', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'this', 'that', 'with', 'from', 'they', 'them', 'their', 'hello', 'how', 'you', 'need', 'help', 'thank', 'please', 'yes', 'very', 'good', 'well']

    const textLower = text.toLowerCase()

    let ptScore = portugueseWords.filter(word => textLower.includes(word)).length
    let esScore = spanishWords.filter(word => textLower.includes(word)).length
    let enScore = englishWords.filter(word => textLower.includes(word)).length

    // Dar peso extra para caracteres especiais
    if (/[ñáéíóúü]/i.test(text)) esScore += 2
    if (/[ãçêôõàâ]/i.test(text)) ptScore += 2

    if (ptScore > esScore && ptScore > enScore) return 'pt'
    if (esScore > ptScore && esScore > enScore) return 'es'
    if (enScore > ptScore && enScore > esScore) return 'en'

    return 'pt' // default
  }

  // Função para responder com IA
  const handleAIReply = async () => {
    try {

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
    } catch {}
  }

  // Função para traduzir mensagem - SEMPRE para PT-BR
  const handleTranslate = async () => {
    try {

      // Usar nova função de detecção de idioma
      const sourceLanguage = detectLanguage(messageContent)

      // Se já está em português, não precisa traduzir
      if (sourceLanguage === 'pt') {

        onTranslate?.(messageId, 'Mensagem já está em português')
        return
      }

      const prompt = `Traduza o seguinte texto para português brasileiro de forma natural e contextual: "${messageContent}"`

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: `Tradução de ${sourceLanguage} para português brasileiro`,
          type: 'translation'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.text) {

          // Chamar callback com a tradução
          onTranslate?.(messageId, data.text)
        }
      }
    } catch {}
  }

  // Função para abrir modal de resposta com tradução - SEMPRE traduz para PT-BR
  const handleOpenTranslateReply = async () => {
    try {
      setIsTranslating(true)

      // Usar nova função de detecção de idioma
      const sourceLanguage = detectLanguage(messageContent)

      // Se já está em português, mostrar original
      if (sourceLanguage === 'pt') {

        setTranslatedMessage(messageContent)
        setIsTranslating(false)
        return
      }

      // Traduzir mensagem original SEMPRE para PT-BR usando Deepseek
      const prompt = `Traduza o seguinte texto para português brasileiro de forma natural e contextual: "${messageContent}"`

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: `Tradução de ${sourceLanguage} para português brasileiro`,
          type: 'translation'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.text) {

          setTranslatedMessage(data.text)
        }
      } else {
        setTranslatedMessage('Erro na tradução')
      }
    } catch {

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

      // Detectar idioma da mensagem original para traduzir resposta de volta
      const replyTargetLanguage = detectLanguage(messageContent)

      // Traduzir resposta para o idioma original da mensagem usando Deepseek
      const targetLangName = replyTargetLanguage === 'es' ? 'espanhol' :
                           replyTargetLanguage === 'en' ? 'inglês' : 'português'

      const prompt = `Traduza o seguinte texto do português para ${targetLangName} de forma natural e contextual: "${replyText}"`

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: `Tradução de português para ${targetLangName} - Atendimento ao cliente`,
          type: 'translation'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.text) {

          // Enviar resposta traduzida
          onAIReply?.(messageId, data.text)

          // Fechar modal e limpar campos
          setShowTranslateReply(false)
          setReplyText('')
          setTranslatedMessage('')
        }
      }
    } catch {} finally {
      setIsTranslating(false)
    }
  }

  // Funções de gravação de voz para o modal de tradução
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        // Tentar diferentes formatos para compatibilidade
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg'

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        await transcribeAudio(audioBlob)

        // Parar todas as tracks do stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

    } catch {

      alert('Não foi possível acessar o microfone. Verifique as permissões.')
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true)

      const formData = new FormData()
      // Usar extensão baseada no tipo de mídia
      const extension = audioBlob.type.includes('webm') ? 'webm' :
                       audioBlob.type.includes('ogg') ? 'ogg' : 'wav'
      formData.append('audio', audioBlob, `recording.${extension}`)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.text) {

          // Adicionar texto transcrito ao campo de resposta
          setReplyText(prevText => {
            return prevText ? `${prevText} ${data.text}` : data.text
          })
        }
      }
    } catch {} finally {
      setIsTranscribing(false)
    }
  }

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopVoiceRecording()
    } else {
      startVoiceRecording()
    }
  }

  // Função para gerar resposta com IA no modal - SEMPRE em português
  const handleGenerateAIResponse = async () => {
    try {
      setIsGeneratingAI(true)

      // Usar mensagem traduzida (em português) como contexto
      const messageForContext = translatedMessage || messageContent
      const prompt = `Gere uma resposta profissional, amigável e útil em português brasileiro para esta mensagem: "${messageForContext}"`

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: 'Atendimento ao cliente via WhatsApp - Responda sempre em português brasileiro',
          type: 'response'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.text) {

          // Adicionar resposta da IA ao campo (já em português)
          setReplyText(data.text)
        }
      }
    } catch {} finally {
      setIsGeneratingAI(false)
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
              className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto border border-border"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
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
                  Sua resposta em português (será traduzida na hora do envio):
                </label>
                <div className="relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Digite, fale no microfone ou gere com IA - tudo em português. Será traduzido automaticamente ao enviar..."
                    className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                    autoFocus={!isRecording}
                  />

                  {/* Botões de Ação */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    {/* Botão de IA */}
                    <button
                      onClick={handleGenerateAIResponse}
                      disabled={isGeneratingAI || isTranscribing || isRecording}
                      className={`p-2 rounded-full transition-all ${
                        isGeneratingAI
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                      title={
                        isGeneratingAI
                          ? 'Gerando resposta...'
                          : 'Gerar resposta com IA'
                      }
                    >
                      {isGeneratingAI ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </button>

                    {/* Botão de Microfone */}
                    <button
                      onClick={toggleVoiceRecording}
                      disabled={isTranscribing || isGeneratingAI}
                      className={`p-2 rounded-full transition-all ${
                        isRecording
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                          : isTranscribing
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                      title={
                        isRecording
                          ? 'Parar gravação'
                          : isTranscribing
                            ? 'Transcrevendo...'
                            : 'Falar resposta'
                      }
                    >
                      {isRecording ? (
                        <MicOff className="w-4 h-4" />
                      ) : isTranscribing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Indicador de status */}
                {(isRecording || isTranscribing || isGeneratingAI) && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {isRecording && (
                      <span className="text-red-500 flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Gravando...
                      </span>
                    )}
                    {isTranscribing && (
                      <span className="text-yellow-500 flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        Transcrevendo...
                      </span>
                    )}
                    {isGeneratingAI && (
                      <span className="text-blue-500 flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        Gerando resposta com IA...
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
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
