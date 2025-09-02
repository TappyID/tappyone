'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image, Video, Mic, File, Play, Pause } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MediaUploadProps {
  type: 'image' | 'video' | 'audio' | 'arquivo'
  onUpload: (file: File, url?: string) => void
  onRemove: () => void
  currentFile?: string
  currentFileName?: string
  maxSizeMB?: number
  className?: string
}

export default function MediaUpload({
  type,
  onUpload,
  onRemove,
  currentFile,
  currentFileName,
  maxSizeMB = 50,
  className = ''
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const getAcceptedTypes = () => {
    switch (type) {
      case 'image':
        return 'image/*'
      case 'video':
        return 'video/*'
      case 'audio':
        return 'audio/*'
      case 'arquivo':
        return '*'
      default:
        return '*'
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'image':
        return 'Imagem'
      case 'video':
        return 'Vídeo'
      case 'audio':
        return 'Áudio'
      case 'arquivo':
        return 'Arquivo'
      default:
        return 'Arquivo'
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'image':
        return Image
      case 'video':
        return Video
      case 'audio':
        return Mic
      case 'arquivo':
        return File
      default:
        return File
    }
  }

  const validateFile = (file: File): string | null => {
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      return `Arquivo deve ter no máximo ${maxSizeMB}MB`
    }

    const validTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/mov', 'video/avi'],
      audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'],
      arquivo: [] // Aceita todos
    }

    if (type !== 'arquivo' && validTypes[type] && !validTypes[type].includes(file.type)) {
      return `Tipo de arquivo não suportado para ${getTypeLabel()}`
    }

    return null
  }

  const handleFileUpload = async (file: File) => {
    const error = validateFile(file)
    if (error) {
      alert(error)
      return
    }

    setUploading(true)
    try {
      // Upload para blob storage via API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload/blob', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro no upload')
      }

      const data = await response.json()
      onUpload(file, data.url)
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro no upload do arquivo')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const playAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause()
        setAudioPlaying(false)
      } else {
        audioRef.current.play()
        setAudioPlaying(true)
      }
    }
  }

  const TypeIcon = getTypeIcon()

  if (currentFile) {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 bg-gray-50 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#305e73] rounded-lg flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">
                {currentFileName || `Arquivo de ${getTypeLabel()}`}
              </p>
              <p className="text-xs text-gray-500">Upload concluído</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {type === 'audio' && (
              <>
                <button
                  type="button"
                  onClick={playAudio}
                  className="w-8 h-8 bg-[#305e73] rounded-full flex items-center justify-center text-white hover:bg-[#3a6d84] transition-colors"
                >
                  {audioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <audio 
                  ref={audioRef}
                  src={currentFile}
                  onEnded={() => setAudioPlaying(false)}
                  onPause={() => setAudioPlaying(false)}
                />
              </>
            )}

            <button
              type="button"
              onClick={onRemove}
              className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 hover:bg-red-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {type === 'image' && (
          <div className="mt-3">
            <img
              src={currentFile}
              alt="Preview"
              className="w-full max-h-32 object-cover rounded border"
            />
          </div>
        )}

        {type === 'video' && (
          <div className="mt-3">
            <video
              src={currentFile}
              controls
              className="w-full max-h-32 rounded border"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        onChange={handleFileSelect}
        className="hidden"
      />

      <motion.div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          dragActive 
            ? 'border-[#305e73] bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-8 h-8 border-2 border-[#305e73] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Enviando arquivo...</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-700">
                  Clique ou arraste seu {getTypeLabel().toLowerCase()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Máximo {maxSizeMB}MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
