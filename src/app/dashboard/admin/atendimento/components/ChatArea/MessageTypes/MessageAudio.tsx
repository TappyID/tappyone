'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, Download } from 'lucide-react'

interface MessageAudioProps {
  audioUrl: string
  duration?: number
  isFromUser: boolean
  caption?: string
}

export default function MessageAudio({ 
  audioUrl, 
  duration = 0, 
  isFromUser,
  caption 
}: MessageAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
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

        {/* Botão Download */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open(audioUrl, '_blank')}
          className={`p-2 rounded-full ${
            isFromUser
              ? 'hover:bg-white/20'
              : 'hover:bg-gray-200 dark:hover:bg-gray-600'
          } transition-colors`}
        >
          <Download className={`w-4 h-4 ${
            isFromUser ? 'text-white' : 'text-gray-600 dark:text-gray-400'
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
    </div>
  )
}
