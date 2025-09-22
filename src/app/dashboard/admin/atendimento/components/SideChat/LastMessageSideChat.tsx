'use client'

import React from 'react'
import { 
  Image, 
  Video, 
  Mic, 
  FileText, 
  MapPin,
  Phone,
  User,
  MessageCircle
} from 'lucide-react'

interface LastMessageSideChatProps {
  message: {
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call'
    content: string
    timestamp: number
    sender: 'user' | 'agent'
    isRead?: boolean
  }
  maxLength?: number
}

export default function LastMessageSideChat({ 
  message, 
  maxLength = 50 
}: LastMessageSideChatProps) {
  
  // Função para obter ícone baseado no tipo
  const getMessageIcon = (type: string) => {
    const iconProps = { className: "w-3 h-3 text-gray-500" }
    
    switch (type) {
      case 'image': return <Image {...iconProps} />
      case 'video': return <Video {...iconProps} />
      case 'audio': return <Mic {...iconProps} />
      case 'document': return <FileText {...iconProps} />
      case 'location': return <MapPin {...iconProps} />
      case 'contact': return <User {...iconProps} />
      case 'call': return <Phone {...iconProps} />
      default: return <MessageCircle {...iconProps} />
    }
  }

  // Função para obter texto baseado no tipo
  const getMessageText = (message: any) => {
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

  // Truncar mensagem se necessário
  const truncateMessage = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const messageText = getMessageText(message)
  const truncatedText = truncateMessage(messageText, maxLength)

  return (
    <div className="flex items-center gap-2 min-w-0">
      {/* Ícone do tipo de mensagem */}
      {message.type !== 'text' && (
        <div className="flex-shrink-0">
          {getMessageIcon(message.type)}
        </div>
      )}

      {/* Indicador de quem enviou */}
      <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
        message.sender === 'agent' 
          ? 'bg-blue-500' 
          : 'bg-gray-400'
      }`} />

      {/* Conteúdo da mensagem */}
      <p className={`text-xs truncate min-w-0 ${
        message.isRead === false 
          ? 'font-semibold text-gray-900 dark:text-gray-100' 
          : 'text-gray-600 dark:text-gray-400'
      }`}>
        {truncatedText}
      </p>

      {/* Indicador de não lida */}
      {message.isRead === false && (
        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </div>
  )
}
