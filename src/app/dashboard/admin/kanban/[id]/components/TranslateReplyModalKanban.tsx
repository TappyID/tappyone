'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Languages, Mic, MicOff, Bot, Volume2 } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface TranslateReplyModalKanbanProps {
  isOpen: boolean
  onClose: () => void
  messageContent: string
  onSend: (translatedText: string, audioUrl?: string) => void
  detectedLanguage?: 'es' | 'en' | 'pt'
}

export default function TranslateReplyModalKanban({
  isOpen,
  onClose,
  messageContent,
  onSend,
  detectedLanguage = 'pt'
}: TranslateReplyModalKanbanProps) {
  const { actualTheme } = useTheme()
  
  const [replyText, setReplyText] = useState('')
  const [translatedMessage, setTranslatedMessage] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      // Parar gravação
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
    } else {
      // Iniciar gravação
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          
          // Transcrever áudio
          setIsTranscribing(true)
          try {
            const formData = new FormData()
            formData.append('audio', audioBlob)
            
            const response = await fetch('/api/ai/transcribe', {
              method: 'POST',
              body: formData
            })

            if (response.ok) {
              const data = await response.json()
              setReplyText(data.text || '')
            }
          } catch (error) {
            console.error('Erro ao transcrever:', error)
          } finally {
            setIsTranscribing(false)
          }

          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Erro ao acessar microfone:', error)
        alert('Erro ao acessar microfone')
      }
    }
  }

  const handleGenerateAIResponse = async () => {
    if (!translatedMessage && !messageContent) return
    
    setIsGeneratingAI(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Gere uma resposta profissional em português para: "${translatedMessage || messageContent}"`,
          type: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setReplyText(data.text || '')
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleSendTranslatedReply = async () => {
    if (!replyText.trim()) return

    setIsTranslating(true)
    try {
      // Traduzir texto para o idioma detectado
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: replyText,
          targetLanguage: detectedLanguage
        })
      })

      if (response.ok) {
        const data = await response.json()
        onSend(data.translatedText, generatedAudioUrl || undefined)
        onClose()
      }
    } catch (error) {
      console.error('Erro ao traduzir:', error)
      alert('Erro ao traduzir mensagem')
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -520, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -520, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`w-[520px] h-full shadow-2xl border-r overflow-y-auto rounded-l-2xl ${
            actualTheme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Header com gradiente */}
          <div className="p-4 border-b border-border/50 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Languages className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Responder com Tradução
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Idioma detectado: {detectedLanguage === 'es' ? '🇪🇸 Espanhol' : detectedLanguage === 'en' ? '🇺🇸 Inglês' : '🇧🇷 Português'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onClose()
                  setReplyText('')
                  setTranslatedMessage('')
                  setGeneratedAudioUrl(null)
                }}
                className="p-2 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
              >
                <X className="w-4 h-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
              </motion.button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Mensagem Original Traduzida */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Languages className="w-4 h-4 text-purple-500" />
                Mensagem traduzida:
              </label>
              <div className="p-4 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-xl border border-purple-200/50 dark:border-purple-500/20">
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {messageContent}
                </p>
              </div>
            </div>

            {/* Campo de Resposta */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Mic className="w-4 h-4 text-blue-500" />
                Sua resposta em português (será traduzida na hora do envio):
              </label>
              <div className="relative">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Digite, fale no microfone ou gere com IA - tudo em português. Será traduzido automaticamente ao enviar..."
                  className="w-full p-4 pr-12 border-2 border-border rounded-xl bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                  rows={6}
                  autoFocus={!isRecording}
                />

                {/* Botões de Ação */}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  {/* Botão de Gerar Áudio com IA */}
                  <button
                    onClick={async () => {
                      if (!replyText.trim()) {
                        alert('Digite um texto primeiro')
                        return
                      }
                      setIsGeneratingAudio(true)
                      try {
                        const response = await fetch('/api/ai/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            prompt: replyText,
                            type: 'audio',
                            voice: 'nova',
                            targetLanguage: detectedLanguage
                          })
                        })

                        if (response.ok) {
                          const data = await response.json()
                          if (data.audioUrl) {
                            setGeneratedAudioUrl(data.audioUrl)
                          }
                        } else {
                          alert('Erro ao gerar áudio')
                        }
                      } catch (error) {
                        console.error('Erro:', error)
                        alert('Erro ao gerar áudio com IA')
                      } finally {
                        setIsGeneratingAudio(false)
                      }
                    }}
                    disabled={isGeneratingAudio || isTranscribing || isRecording || !replyText.trim()}
                    className={`p-2 rounded-full transition-all ${
                      isGeneratingAudio
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Gerar áudio com IA no idioma detectado"
                  >
                    {isGeneratingAudio ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Botão de IA */}
                  <button
                    onClick={handleGenerateAIResponse}
                    disabled={isGeneratingAI || isTranscribing || isRecording}
                    className="p-2 rounded-full transition-all bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
                    title={isGeneratingAI ? 'Gerando resposta...' : 'Gerar resposta com IA'}
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
                    } disabled:opacity-50`}
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

              {/* Preview do Áudio Gerado */}
              {generatedAudioUrl && (
                <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Volume2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-700 dark:text-green-300">
                        Áudio gerado em {detectedLanguage === 'es' ? 'Espanhol' : detectedLanguage === 'en' ? 'Inglês' : 'Português'}
                      </p>
                      <audio ref={audioRef} src={generatedAudioUrl} controls className="w-full mt-1 h-8" />
                    </div>
                    <button
                      onClick={() => setGeneratedAudioUrl(null)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      title="Remover áudio"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Indicador de status */}
              {(isRecording || isTranscribing || isGeneratingAI || isGeneratingAudio) && (
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
                  {isGeneratingAudio && (
                    <span className="text-green-500 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Gerando áudio com IA...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose()
                  setReplyText('')
                  setTranslatedMessage('')
                }}
                className="flex-1 px-6 py-3 text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-all font-medium"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendTranslatedReply}
                disabled={!replyText.trim() || isTranslating}
                className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-purple-500/20 disabled:shadow-none"
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
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
