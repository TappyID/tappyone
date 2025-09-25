'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Paperclip,
  Plus,
  Image,
  Camera,
  Mic,
  Send,
  UserCheck,
  Zap,
  Bot,
  MessageSquare,
  Video,
  Menu,
  MapPin,
  User,
  BarChart3
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
        className="p-2.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                   hover:from-blue-500/20 hover:to-purple-500/20
                   text-blue-600 dark:text-blue-400 rounded-xl 
                   border border-blue-200/50 dark:border-blue-700/50
                   transition-all duration-200 shadow-sm hover:shadow-md"
        title="Anexos & Ações"
      >
        <Plus className="w-5 h-5" />
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
            <Image className="w-4 h-4 text-green-500" />
            <span>Enviar Imagem</span>
          </button>
          
          <button
            onClick={() => {
              onOpenCamera?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                       flex items-center gap-2 text-sm"
          >
            <Camera className="w-4 h-4 text-blue-500" />
            <span>Tirar Foto</span>
          </button>
          
          <button
            onClick={() => {
              onSendVideo?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                       flex items-center gap-2 text-sm"
          >
            <Video className="w-4 h-4 text-purple-500" />
            <span>Enviar Vídeo</span>
          </button>

          <button
            onClick={() => {
              onSendAudio?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                       flex items-center gap-2 text-sm"
          >
            <Mic className="w-4 h-4 text-red-500" />
            <span>Enviar Áudio</span>
          </button>

          <button
            onClick={() => {
              onAttachFile?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                       flex items-center gap-2 text-sm"
          >
            <Paperclip className="w-4 h-4 text-gray-500" />
            <span>Anexar Arquivo</span>
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
            <span>Enviar Menu</span>
          </button>

          <button
            onClick={() => {
              onSendLocation?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                       flex items-center gap-2 text-sm"
          >
            <MapPin className="w-4 h-4 text-orange-500" />
            <span>Enviar Localização</span>
          </button>

          <button
            onClick={() => {
              onSendContact?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                       flex items-center gap-2 text-sm"
          >
            <User className="w-4 h-4 text-cyan-500" />
            <span>Enviar Contato</span>
          </button>

          <button
            onClick={() => {
              onSendPoll?.()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                       flex items-center gap-2 text-sm"
          >
            <BarChart3 className="w-4 h-4 text-pink-500" />
            <span>Enviar Enquete</span>
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
    className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 
               dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 
               dark:hover:bg-gray-800 transition-colors"
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
    className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 
               dark:hover:text-green-300 rounded-lg hover:bg-green-50 
               dark:hover:bg-green-900/20 transition-colors"
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
    className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 
               dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 
               dark:hover:bg-blue-900/20 transition-colors"
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
    className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 
               dark:hover:text-red-300 rounded-lg hover:bg-red-50 
               dark:hover:bg-red-900/20 transition-colors"
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
  console.log('🤖 AgenteButton Debug:', { agenteAtivo, agenteNome, isGenerating })
  
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
    className="p-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 
               dark:hover:text-purple-300 rounded-lg hover:bg-purple-50 
               dark:hover:bg-purple-900/20 transition-colors"
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
    className="p-2 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 
               dark:hover:text-cyan-300 rounded-lg hover:bg-cyan-50 
               dark:hover:bg-cyan-900/20 transition-colors"
    title="Enviar com I.A"
  >
    <Bot className="w-5 h-5" />
  </motion.button>
)

// Micro componente Resposta Rápida
export const RespostaRapidaButton = ({ onClick }: { onClick?: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="p-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 
               dark:hover:text-teal-300 rounded-lg hover:bg-teal-50 
               dark:hover:bg-teal-900/20 transition-colors"
    title="Respostas rápidas"
  >
    <MessageSquare className="w-5 h-5" />
  </motion.button>
)

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
