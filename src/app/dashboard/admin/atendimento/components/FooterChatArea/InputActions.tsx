'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Paperclip,
  Image,
  Camera,
  Mic,
  Send,
  Video,
  Menu,
  MapPin,
  User,
  BarChart3,
  Zap,
  MessageSquare,
  Sparkles,
  Bot,
  PlusCircle,
  SmilePlus
} from 'lucide-react'

// Micro componente Anexo com Menu
export const AnexoMenuButton = ({
  onAttachFile,
  onSendImage,
  onOpenCamera,
  onSendAudio,
  onSendVideo,
  onSendMenu,
  onSendLocation,
  onSendContact,
  onSendPoll
}: {
  onAttachFile?: () => void,
  onSendImage?: () => void,
  onOpenCamera?: () => void,
  onSendAudio?: () => void,
  onSendVideo?: () => void,
  onSendMenu?: () => void,
  onSendLocation?: () => void,
  onSendContact?: () => void,
  onSendPoll?: () => void
}) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowMenu(!showMenu)}
        className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
                   hover:bg-white/90 dark:hover:bg-gray-800/90
                   text-blue-600 dark:text-blue-400 rounded-xl
                   border border-white/50 dark:border-gray-700/50
                   shadow-lg hover:shadow-xl transition-all duration-200"
        title="Anexos & Ações"
      >
        <PlusCircle className="w-5 h-5" />
      </motion.button>

      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800
                     border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg
                     py-1 min-w-48 z-10 max-h-64 overflow-y-auto"
        >
          <button
            onClick={() => {
              onSendImage?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                       flex items-center gap-2 text-sm"
          >
            <Image className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Enviar Imagem</span>
          </button>

          <button
            onClick={() => {
              onOpenCamera?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                       flex items-center gap-2 text-sm"
          >
            <Camera className="w-4 h-4 text-sky-500" />
            <span className="text-sky-600 dark:text-sky-400 font-medium">Tirar Foto</span>
          </button>

          <button
            onClick={() => {
              onSendVideo?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                       flex items-center gap-2 text-sm"
          >
            <Video className="w-4 h-4 text-violet-500" />
            <span className="text-violet-600 dark:text-violet-400 font-medium">Enviar Vídeo</span>
          </button>

          <button
            onClick={() => {
              onSendAudio?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                       flex items-center gap-2 text-sm"
          >
            <Mic className="w-4 h-4 text-rose-500" />
            <span className="text-rose-600 dark:text-rose-400 font-medium">Enviar Áudio</span>
          </button>

          <button
            onClick={() => {
              onAttachFile?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                       flex items-center gap-2 text-sm"
          >
            <Paperclip className="w-4 h-4 text-slate-500" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Anexar Arquivo</span>
          </button>

          <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>

          <button
            onClick={() => {
              onSendMenu?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                       flex items-center gap-2 text-sm"
          >
            <Menu className="w-4 h-4 text-indigo-500" />
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">Enviar Menu</span>
          </button>

          <button
            onClick={() => {
              onSendLocation?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                       flex items-center gap-2 text-sm"
          >
            <MapPin className="w-4 h-4 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400 font-medium">Enviar Localização</span>
          </button>

          <button
            onClick={() => {
              onSendContact?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                       flex items-center gap-2 text-sm"
          >
            <User className="w-4 h-4 text-teal-500" />
            <span className="text-teal-600 dark:text-teal-400 font-medium">Enviar Contato</span>
          </button>

          <button
            onClick={() => {
              onSendPoll?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700
                       flex items-center gap-2 text-sm"
          >
            <BarChart3 className="w-4 h-4 text-fuchsia-500" />
            <span className="text-fuchsia-600 dark:text-fuchsia-400 font-medium">Enviar Enquete</span>
          </button>
        </motion.div>
      )}
    </div>
  )
}

// Micro componente Anexo simples
export const AnexoButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
               hover:bg-white/90 dark:hover:bg-gray-800/90
               text-gray-600 dark:text-gray-300 rounded-xl
               border border-white/50 dark:border-gray-700/50
               shadow-lg hover:shadow-xl transition-all duration-200"
    title="Anexar arquivo"
  >
    <Paperclip className="w-5 h-5" />
  </motion.button>
)

// Micro componente Imagem
export const ImagemButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
               hover:bg-white/90 dark:hover:bg-gray-800/90
               text-green-600 dark:text-green-400 rounded-xl
               border border-white/50 dark:border-gray-700/50
               shadow-lg hover:shadow-xl transition-all duration-200"
    title="Enviar imagem"
  >
    <Image className="w-5 h-5" />
  </motion.button>
)

// Micro componente Câmera
export const CameraButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
               hover:bg-white/90 dark:hover:bg-gray-800/90
               text-blue-600 dark:text-blue-400 rounded-xl
               border border-white/50 dark:border-gray-700/50
               shadow-lg hover:shadow-xl transition-all duration-200"
    title="Tirar foto"
  >
    <Camera className="w-5 h-5" />
  </motion.button>
)

// Micro componente Áudio
export const AudioButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
               hover:bg-white/90 dark:hover:bg-gray-800/90
               text-red-600 dark:text-red-400 rounded-xl
               border border-white/50 dark:border-gray-700/50
               shadow-lg hover:shadow-xl transition-all duration-200"
    title="Gravar áudio"
  >
    <Mic className="w-5 h-5" />
  </motion.button>
)

// Micro componente Agente
export const AgenteButton = ({
  onClick,
  isGenerating = false,
  agenteAtivo = false,
  agenteNome = ''
}: {
  onClick?: () => void,
  isGenerating?: boolean,
  agenteAtivo?: boolean,
  agenteNome?: string
}) => {
  // Debug para verificar o estado do agente

  return (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-all duration-300 relative"
    title={
      isGenerating
        ? `Gerando resposta... (${agenteNome})`
        : agenteAtivo
          ? `Agente ativo: ${agenteNome}`
          : "Selecionar agente IA"
    }
  >
    <Bot className="w-5 h-5 text-blue-500" />
    {/* Badge - Amarelo pulsando se gerando, verde se ativo, vermelho se inativo */}
    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 transition-all duration-300 ${
      isGenerating
        ? 'bg-yellow-500 animate-pulse'
        : agenteAtivo
          ? 'bg-green-500'
          : 'bg-red-500'
    }`}></div>
    {/* Indicador adicional quando gerando */}
    {isGenerating && (
      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 animate-ping"></div>
    )}
  </motion.button>
  )
}

// Micro componente Ações Rápidas
export const AcoesRapidasButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
               hover:bg-white/90 dark:hover:bg-gray-800/90
               text-purple-600 dark:text-purple-400 rounded-xl
               border border-white/50 dark:border-gray-700/50
               shadow-lg hover:shadow-xl transition-all duration-200"
    title="Ações rápidas"
  >
    <Zap className="w-5 h-5" />
  </motion.button>
)

// Micro componente I.A
export const IAButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
               hover:bg-white/90 dark:hover:bg-gray-800/90
               text-cyan-600 dark:text-cyan-400 rounded-xl
               border border-white/50 dark:border-gray-700/50
               shadow-lg hover:shadow-xl transition-all duration-200"
    title="Enviar com I.A"
  >
    <Sparkles className="w-5 h-5" />
  </motion.button>
)

// Micro componente Resposta Rápida
export const RespostaRapidaButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
               hover:bg-white/90 dark:hover:bg-gray-800/90
               text-teal-600 dark:text-teal-400 rounded-xl
               border border-white/50 dark:border-gray-700/50
               shadow-lg hover:shadow-xl transition-all duration-200"
    title="Respostas rápidas"
  >
    <MessageSquare className="w-5 h-5" />
  </motion.button>
)

// Micro componente Emoji Picker
export const EmojiButton = ({ 
  onEmojiSelect 
}: { 
  onEmojiSelect?: (emoji: string) => void 
}) => {
  const [showPicker, setShowPicker] = useState(false)
  
  const emojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
    '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
    '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪',
    '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒', '😞',
    '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫',
    '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '👍', '👎', '👏', '🙌', '👌', '✌️', '🤞', '🤝',
    '🙏', '💪', '❤️', '🧡', '💛', '💚', '💙', '💜',
    '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓',
    '🔥', '⭐', '✨', '💫', '🎉', '🎊', '🎈', '🎁'
  ]

  // Fechar ao clicar fora
  React.useEffect(() => {
    if (!showPicker) return
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.emoji-picker-container')) {
        setShowPicker(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPicker])

  return (
    <div className="relative emoji-picker-container">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowPicker(!showPicker)}
        className="p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg
                   hover:bg-white/90 dark:hover:bg-gray-800/90
                   text-yellow-600 dark:text-yellow-400 rounded-xl
                   border border-white/50 dark:border-gray-700/50
                   shadow-lg hover:shadow-xl transition-all duration-200"
        title="Emojis"
      >
        <SmilePlus className="w-5 h-5" />
      </motion.button>

      {showPicker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="absolute bottom-full mb-2 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
                     border border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl
                     p-4 w-72 z-50"
        >
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Selecione um emoji</h4>
          <div 
            className="grid grid-cols-8 gap-1.5 max-h-56 overflow-y-auto pr-1"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 transparent'
            }}
          >
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => {
                  onEmojiSelect?.(emoji)
                  setShowPicker(false)
                }}
                className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-all hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Micro componente Enviar Expansivo
export const EnviarButton = ({
  onClick,
  disabled = false
}: {
  onClick?: () => void,
  disabled?: boolean
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`flex items-center gap-2 rounded-full transition-all duration-300 ease-in-out ${
        disabled
          ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 cursor-pointer'
      } text-white shadow-lg hover:shadow-xl`}
      style={{
        padding: isExpanded ? '12px 20px 12px 16px' : '12px',
        width: isExpanded ? 'auto' : '48px',
        minWidth: '48px'
      }}
    >
      <Send className="w-5 h-5 flex-shrink-0" />
      <motion.span
        initial={false}
        animate={{
          width: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          opacity: { delay: isExpanded ? 0.1 : 0 }
        }}
        className="overflow-hidden whitespace-nowrap font-medium text-sm"
      >
        {disabled ? 'Aguarde...' : 'Enviar'}
      </motion.span>
    </motion.button>
  )
}
