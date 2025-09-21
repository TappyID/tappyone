'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Send, 
  Paperclip, 
  Image, 
  Smile,
  Mic,
  Camera
} from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text') => void
  onAttachFile?: () => void
  onSendImage?: () => void
  onSendAudio?: () => void
  onOpenCamera?: () => void
  onOpenEmojis?: () => void
  placeholder?: string
  disabled?: boolean
  isTyping?: boolean
}

export default function MessageInput({ 
  onSendMessage,
  onAttachFile,
  onSendImage,
  onSendAudio,
  onOpenCamera,
  onOpenEmojis,
  placeholder = "Digite uma mensagem...",
  disabled = false,
  isTyping = false
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-end gap-2">
        {/* Botão de Anexos */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 
                       dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 
                       dark:hover:bg-gray-800 transition-colors"
            title="Anexar arquivo"
          >
            <Paperclip className="w-5 h-5" />
          </motion.button>

          {/* Menu de anexos */}
          {showAttachMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 
                         border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg 
                         py-2 min-w-48 z-10"
            >
              <button
                onClick={() => {
                  onSendImage?.()
                  setShowAttachMenu(false)
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                           flex items-center gap-2 text-sm"
              >
                <Image className="w-4 h-4 text-green-500" />
                <span>Enviar imagem</span>
              </button>
              
              <button
                onClick={() => {
                  onOpenCamera?.()
                  setShowAttachMenu(false)
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                           flex items-center gap-2 text-sm"
              >
                <Camera className="w-4 h-4 text-blue-500" />
                <span>Tirar foto</span>
              </button>
              
              <button
                onClick={() => {
                  onAttachFile?.()
                  setShowAttachMenu(false)
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                           flex items-center gap-2 text-sm"
              >
                <Paperclip className="w-4 h-4 text-gray-500" />
                <span>Anexar arquivo</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Input de mensagem */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 
                       rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-500 dark:placeholder-gray-400 resize-none
                       transition-all duration-200"
            style={{
              maxHeight: '120px',
              minHeight: '48px'
            }}
          />
          
          {/* Botão de Emojis */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenEmojis}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 
                       hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 
                       rounded transition-colors"
            title="Emojis"
          >
            <Smile className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Botão de Áudio ou Enviar */}
        {message.trim() ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={disabled}
            className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 
                       text-white rounded-full transition-colors"
            title="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onSendAudio}
            className="p-3 text-gray-600 hover:text-gray-800 dark:text-gray-400 
                       dark:hover:text-gray-200 rounded-full hover:bg-gray-100 
                       dark:hover:bg-gray-800 transition-colors"
            title="Gravar áudio"
          >
            <Mic className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Indicador de digitação */}
      {isTyping && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500 dark:text-gray-400 mt-2"
        >
          Digitando...
        </motion.p>
      )}
    </div>
  )
}
