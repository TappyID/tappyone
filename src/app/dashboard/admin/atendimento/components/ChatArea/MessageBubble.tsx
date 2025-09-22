'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  CheckCheck
} from 'lucide-react'

import {
  MessageAudio,
  MessageDocument,
  MessageVideo,
  MessageLocation,
  MessageContact,
  MessagePoll,
  MessageMenu,
  MessageEvent,
  MessageLinkPreview
} from './MessageTypes'

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call' | 'poll' | 'menu' | 'event' | 'link-preview'
    sender: 'user' | 'agent'
    timestamp: number
    status?: 'sending' | 'sent' | 'delivered' | 'read'
    mediaUrl?: string
    // Dados específicos por tipo
    metadata?: {
      // Para áudio
      duration?: number
      // Para documento
      fileName?: string
      fileSize?: number
      mimeType?: string
      // Para video
      thumbnailUrl?: string
      // Para localização
      latitude?: number
      longitude?: number
      address?: string
      locationName?: string
      // Para contato
      contactName?: string
      phoneNumber?: string
      email?: string
      organization?: string
      // Para enquete
      question?: string
      pollOptions?: Array<{id: string, text: string, votes: number}>
      totalVotes?: number
      allowMultipleAnswers?: boolean
      hasVoted?: boolean
      userVote?: string[]
      // Para menu
      menuTitle?: string
      menuDescription?: string
      menuItems?: Array<{
        id: string
        title: string
        description?: string
        icon?: string
        submenu?: any[]
      }>
    }
  }
  isLastMessage?: boolean
  showAvatar?: boolean
}

const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(({ 
  message, 
  isLastMessage = false,
  showAvatar = false 
}, ref) => {
  
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

  const renderMessageContent = () => {
    const { type, content, mediaUrl, metadata } = message

    // Componentes especializados para cada tipo
    switch (type) {
      case 'audio':
        return (
          <MessageAudio
            audioUrl={mediaUrl || ''}
            duration={metadata?.duration || 0}
            isFromUser={isFromUser}
            caption={content}
          />
        )

      case 'document':
        return (
          <MessageDocument
            documentUrl={mediaUrl || ''}
            fileName={metadata?.fileName || 'Documento'}
            fileSize={metadata?.fileSize}
            mimeType={metadata?.mimeType}
            isFromUser={isFromUser}
            caption={content}
          />
        )

      case 'video':
        return (
          <MessageVideo
            videoUrl={mediaUrl || ''}
            thumbnailUrl={metadata?.thumbnailUrl}
            duration={metadata?.duration}
            isFromUser={isFromUser}
            caption={content}
          />
        )

      case 'location':
        return (
          <MessageLocation
            latitude={metadata?.latitude || 0}
            longitude={metadata?.longitude || 0}
            address={metadata?.address}
            name={metadata?.locationName}
            isFromUser={isFromUser}
            caption={content}
          />
        )

      case 'contact':
        return (
          <MessageContact
            name={metadata?.contactName || 'Contato'}
            phoneNumber={metadata?.phoneNumber}
            email={metadata?.email}
            organization={metadata?.organization}
            isFromUser={isFromUser}
            caption={content}
          />
        )

      case 'poll':
        return (
          <MessagePoll
            question={metadata?.question || 'Enquete'}
            options={metadata?.pollOptions || []}
            totalVotes={metadata?.totalVotes || 0}
            allowMultipleAnswers={metadata?.allowMultipleAnswers}
            hasVoted={metadata?.hasVoted}
            userVote={metadata?.userVote}
            isFromUser={isFromUser}
            caption={content}
          />
        )

      case 'menu':
        return (
          <MessageMenu
            title={metadata?.menuTitle || 'Menu'}
            description={metadata?.menuDescription}
            items={metadata?.menuItems || []}
            isFromUser={isFromUser}
            caption={content}
          />
        )

      case 'image':
        return (
          <div className="space-y-2">
            {mediaUrl && (
              <img 
                src={mediaUrl} 
                alt="Imagem compartilhada"
                className="rounded-lg max-w-full h-auto"
              />
            )}
            {content && (
              <p className={`text-sm ${
                isFromUser ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {content}
              </p>
            )}
          </div>
        )

      case 'event':
        return (
          <MessageEvent
            eventType={(metadata as any)?.eventType || 'info'}
            title={(metadata as any)?.eventTitle || content}
            description={(metadata as any)?.eventDescription}
            timestamp={message.timestamp}
            metadata={(metadata as any)?.eventMetadata}
          />
        )

      case 'link-preview':
        return (
          <MessageLinkPreview
            content={content}
            linkPreview={(metadata as any)?.linkPreview || {
              url: content,
              title: 'Link',
              description: content
            }}
            isFromUser={isFromUser}
          />
        )

      case 'text':
      default:
        return <p className="text-sm break-words">{content}</p>
    }
  }

  return (
    <motion.div
      ref={ref}
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
        {message.type === 'text' ? (
          <div className={`rounded-2xl px-4 py-2 ${
            isFromUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          }`}>
            {renderMessageContent()}
          </div>
        ) : (
          <div>
            {renderMessageContent()}
          </div>
        )}

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
})

MessageBubble.displayName = 'MessageBubble'

export default MessageBubble
