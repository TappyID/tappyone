'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Download, Maximize } from 'lucide-react'

interface MessageVideoProps {
  videoUrl: string
  thumbnailUrl?: string
  duration?: number
  isFromUser: boolean
  caption?: string
}

export default function MessageVideo({
  videoUrl,
  thumbnailUrl,
  duration = 0,
  isFromUser,
  caption
}: MessageVideoProps) {
  const [showPlayer, setShowPlayer] = useState(false)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = 'video.mp4'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-2">
      {/* Container do Vídeo */}
      <div className="relative rounded-2xl overflow-hidden max-w-sm">
        {!showPlayer ? (
          /* Thumbnail do vídeo */
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative cursor-pointer"
            onClick={() => setShowPlayer(true)}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-auto aspect-video object-cover"
              />
            ) : (
              <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
                <Play className="w-16 h-16 text-white opacity-80" />
              </div>
            )}

            {/* Overlay de play */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
              >
                <Play className="w-8 h-8 text-gray-800 ml-1" />
              </motion.div>
            </div>

            {/* Duração */}
            {duration > 0 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatDuration(duration)}
              </div>
            )}

            {/* Botões de ação */}
            <div className="absolute top-2 right-2 flex gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload()
                }}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(videoUrl, '_blank')
                }}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                title="Tela cheia"
              >
                <Maximize className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Player de vídeo */
          <video
            controls
            autoPlay
            className="w-full h-auto aspect-video"
            onEnded={() => setShowPlayer(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            Seu navegador não suporta o elemento de vídeo.
          </video>
        )}
      </div>

      {/* Caption opcional */}
      {caption && (
        <p className={`text-sm ${
          isFromUser ? 'text-gray-900 dark:text-white/90' : 'text-gray-700 dark:text-gray-300'
        }`}>
          {caption}
        </p>
      )}
    </div>
  )
}
