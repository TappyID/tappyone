'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Download, FileText } from 'lucide-react'

interface MessageAudioProps {
  audioUrl: string
  duration?: number
  isFromUser: boolean
  caption?: string
  onTranscribe?: (audioUrl: string) => void
}

export default function MessageAudio({ 
  audioUrl, 
  duration = 0, 
  isFromUser,
  caption,
  onTranscribe
}: MessageAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState<string>('')
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleTranscribe = async () => {
    if (isTranscribing) return
    
    setIsTranscribing(true)
    try {
      console.log(' Iniciando transcrição do áudio:', audioUrl)
      
      // Chamar API de transcrição
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl: audioUrl,
          language: 'pt' // Português por padrão
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.transcription) {
          console.log(' Transcrição recebida:', data.transcription)
          setTranscription(data.transcription)
          
          // Chamar callback se existir
          onTranscribe?.(audioUrl)
        } else {
          console.error(' Erro na resposta:', data)
        }
      } else {
        console.error(' Erro HTTP:', response.status)
      }
    } catch (error) {
      console.error(' Erro ao transcrever:', error)
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  return (
    <div className="space-y-2">
      {/* Player de Áudio */}
      <div className={`flex items-center gap-3 p-3 rounded-2xl ${
        isFromUser 
          ? 'bg-blue-600/90' 
          : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="metadata"
        />
        
        {/* Botão Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isFromUser
              ? 'bg-white/20 hover:bg-white/30'
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors`}
        >
          {isPlaying ? (
            <Pause className={`w-4 h-4 ${isFromUser ? 'text-white' : 'text-white'}`} />
          ) : (
            <Play className={`w-4 h-4 ml-0.5 ${isFromUser ? 'text-white' : 'text-white'}`} />
          )}
        </motion.button>

        {/* Waveform visual (simulado) */}
        <div className="flex-1 flex items-center gap-1 h-8">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full transition-all duration-200 ${
                isFromUser ? 'bg-white/40' : 'bg-gray-400'
              }`}
              style={{
                height: `${Math.random() * 24 + 8}px`,
                opacity: currentTime > (i * duration / 20) ? 1 : 0.4
              }}
            />
          ))}
        </div>

        {/* Duração */}
        <div className={`text-xs ${
          isFromUser ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
        }`}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Botão Transcrever */}
        {/* Botão Transcrever */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleTranscribe}
          disabled={isTranscribing}
          className={`p-2 rounded-full ${
            isTranscribing
              ? 'opacity-50 cursor-not-allowed'
              : isFromUser
                ? 'hover:bg-white/20'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={isTranscribing ? "Transcrevendo..." : "Transcrever áudio"}
        >
          {isTranscribing ? (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileText className={`w-3 h-3 ${
              isFromUser ? 'text-white/80' : 'text-gray-500'
            }`} />
          )}
        </motion.button>

        {/* Botão Download */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open(audioUrl, '_blank')}
          className={`p-2 rounded-full ${
            isFromUser
              ? 'hover:bg-white/20'
              : 'hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title="Baixar áudio"
        >
          <Download className={`w-3 h-3 ${
            isFromUser ? 'text-white/80' : 'text-gray-500'
          }`} />
        </motion.button>
      </div>

      {/* Caption opcional */}
      {caption && (
        <p className={`text-sm ${
          isFromUser ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {caption}
        </p>
      )}

      {/* Transcrição */}
      {transcription && (
        <div className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-medium text-blue-600 block mb-1">Transcrição:</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{transcription}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
