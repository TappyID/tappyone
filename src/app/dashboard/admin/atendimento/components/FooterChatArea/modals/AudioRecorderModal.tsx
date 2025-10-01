'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mic, MicOff, Send, Trash2, Pause, Play } from 'lucide-react'

interface AudioRecorderModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (audioBlob: Blob) => void
}

export default function AudioRecorderModal({
  isOpen,
  onClose,
  onSend
}: AudioRecorderModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Limpar ao fechar
  useEffect(() => {
    if (!isOpen) {
      handleReset()
    }
  }, [isOpen])

  // Limpar timer ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))

        // Parar stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch {

      alert('Não foi possível acessar o microfone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const handleReset = () => {
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    setAudioBlob(null)

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob)
      onClose()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Gravar Áudio
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Recording Area */}
            <div className="flex flex-col items-center py-8">
              {/* Visualizador de áudio */}
              <div className="relative mb-6">
                <motion.div
                  animate={isRecording ? {
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                  className={`w-32 h-32 rounded-full flex items-center justify-center ${
                    isRecording
                      ? 'bg-red-500/20'
                      : audioBlob
                        ? 'bg-green-500/20'
                        : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="w-12 h-12 text-red-500" />
                  ) : (
                    <Mic className="w-12 h-12 text-gray-400" />
                  )}
                </motion.div>

                {/* Tempo */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <span className="text-2xl font-mono text-gray-700 dark:text-gray-300">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              </div>

              {/* Audio Player (quando há gravação) */}
              {audioUrl && !isRecording && (
                <div className="w-full mt-8 mb-4">
                  <audio
                    controls
                    src={audioUrl}
                    className="w-full"
                  />
                </div>
              )}

              {/* Controles */}
              <div className="flex items-center gap-4 mt-8">
                {!isRecording && !audioBlob && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full
                             flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Mic className="w-5 h-5" />
                    Iniciar Gravação
                  </motion.button>
                )}

                {isRecording && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopRecording}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-full
                             flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Pause className="w-5 h-5" />
                    Parar Gravação
                  </motion.button>
                )}

                {audioBlob && !isRecording && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleReset}
                      className="p-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300
                               dark:hover:bg-gray-700 rounded-full shadow-lg transition-all"
                      title="Descartar"
                    >
                      <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startRecording}
                      className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full
                               shadow-lg hover:shadow-xl transition-all"
                      title="Gravar Novamente"
                    >
                      <Mic className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full
                               flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                      <Send className="w-5 h-5" />
                      Enviar Áudio
                    </motion.button>
                  </>
                )}
              </div>

              {/* Dica */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
                {isRecording
                  ? 'Gravando... Clique em parar quando terminar'
                  : audioBlob
                    ? 'Ouça o áudio e envie ou grave novamente'
                    : 'Clique para começar a gravar sua mensagem de voz'
                }
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
