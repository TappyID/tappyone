'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Image, Video, FileText, Loader2 } from 'lucide-react'

interface MediaSendModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (file: File, caption: string, mediaType: 'image' | 'video' | 'document') => Promise<void>
  mediaType: 'image' | 'video' | 'document'
  file?: File | null
}

export default function MediaSendModal({ isOpen, onClose, onSend, mediaType, file }: MediaSendModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Processar arquivo pré-selecionado
  useEffect(() => {
    if (file) {
      setSelectedFile(file)
      
      // Criar preview para imagens e vídeos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(file)
      }
    }
  }, [file])

  // Limpar estados quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null)
      setCaption('')
      setPreview(null)
    }
  }, [isOpen])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      // Criar preview para imagens e vídeos
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(file)
      }
    }
  }

  const handleSend = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    try {
      await onSend(selectedFile, caption, mediaType)
      
      // Limpar estado após envio
      setSelectedFile(null)
      setCaption('')
      setPreview(null)
      onClose()
    } catch (error) {
      console.error('Erro ao enviar mídia:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = () => {
    switch (mediaType) {
      case 'image': return <Image className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'document': return <FileText className="w-5 h-5" />
    }
  }

  const getTitle = () => {
    switch (mediaType) {
      case 'image': return 'Enviar Imagem'
      case 'video': return 'Enviar Vídeo'
      case 'document': return 'Enviar Documento'
    }
  }

  const getAccept = () => {
    switch (mediaType) {
      case 'image': return 'image/*'
      case 'video': return 'video/*'
      case 'document': return '.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx'
    }
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-500 to-green-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {getIcon()}
                </div>
                <h3 className="text-lg font-semibold text-white">{getTitle()}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* File Selection */}
              {!selectedFile ? (
                <div className="mb-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={getAccept()}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-gray-100 group-hover:bg-green-100 rounded-full transition-colors">
                        {getIcon()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Clique para selecionar arquivo</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {mediaType === 'image' && 'PNG, JPG, JPEG até 5MB'}
                          {mediaType === 'video' && 'MP4, MOV, AVI até 16MB'}
                          {mediaType === 'document' && 'PDF, DOC, TXT, XLS até 5MB'}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="mb-6">
                  {/* Preview */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getIcon()}
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    {/* Preview para imagem/vídeo */}
                    {preview && (
                      <div className="mt-4">
                        {mediaType === 'image' ? (
                          <img 
                            src={preview} 
                            alt="Preview" 
                            className="max-w-full max-h-48 rounded-lg object-cover"
                          />
                        ) : mediaType === 'video' ? (
                          <video 
                            src={preview} 
                            className="max-w-full max-h-48 rounded-lg"
                            controls
                          />
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Botão para trocar arquivo */}
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setPreview(null)
                      fileInputRef.current?.click()
                    }}
                    className="text-sm text-green-600 hover:text-green-700"
                    disabled={isLoading}
                  >
                    Trocar arquivo
                  </button>
                </div>
              )}

              {/* Caption Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem (opcional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Digite uma mensagem para acompanhar o arquivo..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  rows={3}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Esta mensagem será enviada usando modo seguro (typewrite + stop) para evitar ban
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSend}
                  disabled={!selectedFile || isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
