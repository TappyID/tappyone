'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  CheckCheck, 
  Image, 
  Video, 
  Mic, 
  FileText, 
  MapPin,
  Phone,
  User
} from 'lucide-react'

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call'
    sender: 'user' | 'agent'
    timestamp: number
    status?: 'sending' | 'sent' | 'delivered' | 'read'
    mediaUrl?: string
  }
  isLastMessage?: boolean
  showAvatar?: boolean
}

export default function MessageBubble({ 
  message, 
  isLastMessage = false,
  showAvatar = false 
}: MessageBubbleProps) {
  
  const isFromUser = message.sender === 'user'
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusIcon = () => {
    if (isFromUser) return null // Usuário não tem status de entrega
    
    switch (message.status) {
      case 'sending':
        return <div className="w-3 h-3 rounded-full bg-gray-400 animate-pulse" />
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      default:
        return null
    }
  }

  const getMediaIcon = () => {
    const iconProps = { className: "w-4 h-4 text-gray-500" }
    
    switch (message.type) {
      case 'image': return <Image {...iconProps} />
      case 'video': return <Video {...iconProps} />
      case 'audio': return <Mic {...iconProps} />
      case 'document': return <FileText {...iconProps} />
      case 'location': return <MapPin {...iconProps} />
      case 'contact': return <User {...iconProps} />
      case 'call': return <Phone {...iconProps} />
      default: return null
    }
  }

  const getMediaText = () => {
    switch (message.type) {
      case 'image': return '📷 Imagem'
      case 'video': return '🎥 Vídeo'
      case 'audio': return '🎵 Áudio'
      case 'document': return '📄 Documento'
      case 'location': return '📍 Localização'
      case 'contact': return '👤 Contato'
      case 'call': return '📞 Chamada'
      default: return message.content
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 mb-4 ${
        isFromUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar do agente (só para mensagens do agente) */}
      {!isFromUser && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-white">A</span>
        </div>
      )}

      {/* Bolha da mensagem */}
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
        isFromUser ? 'ml-auto' : 'mr-auto'
      }`}>
        <div className={`rounded-2xl px-4 py-2 ${
          isFromUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        }`}>
          {/* Conteúdo da mensagem */}
          {message.type === 'text' ? (
            <p className="text-sm break-words">{message.content}</p>
          ) : (
            <div className="flex items-center gap-2">
              {getMediaIcon()}
              <span className="text-sm">{getMediaText()}</span>
            </div>
          )}

          {/* Mídia (se houver) */}
          {message.mediaUrl && message.type === 'image' && (
            <div className="mt-2">
              <img 
                src={message.mediaUrl} 
                alt="Imagem compartilhada"
                className="rounded-lg max-w-full h-auto"
              />
            </div>
          )}
        </div>

        {/* Timestamp e Status */}
        <div className={`flex items-center gap-1 mt-1 ${
          isFromUser ? 'justify-end' : 'justify-start'
        }`}>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(message.timestamp)}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </motion.div>
  )
}
