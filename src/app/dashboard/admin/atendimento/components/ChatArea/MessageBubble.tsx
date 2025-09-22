'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  CheckCheck,
  Languages
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

import MessageActions from './MessageActions'

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call' | 'poll' | 'menu' | 'event' | 'link-preview'
    sender: 'user' | 'agent'
    timestamp: number
    status?: 'sending' | 'sent' | 'delivered' | 'read'
    mediaUrl?: string
    translation?: string
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
  
  // Callbacks para ações das mensagens
  onReply?: (messageId: string) => void
  onForward?: (messageId: string) => void
  onReaction?: (messageId: string, emoji: string) => void
  onTranslate?: (messageId: string, translatedText?: string) => void
  onAIReply?: (messageId: string, content: string) => void
}

const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(({ 
  message, 
  isLastMessage = false,
  showAvatar = false,
  onReply,
  onForward,
  onReaction,
  onTranslate,
  onAIReply
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
            audioUrl={message.mediaUrl || ''}
            duration={message.metadata?.duration}
            isFromUser={isFromUser}
            caption={message.content !== 'Áudio' ? message.content : undefined}
            onTranscribe={(audioUrl) => console.log('🎙️ Transcrever áudio:', audioUrl)}
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
        return (
          <div>
            <p className="text-sm break-words">{content}</p>
            {message.translation && (
              <div className="mt-2 p-2 rounded-md border-l-2 border-blue-300 bg-blue-50/50">
                <div className="flex items-start gap-2">
                  <Languages className="w-3 h-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-blue-600 block mb-1">Tradução:</span>
                    <span className="text-sm text-blue-800">{message.translation}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-end gap-1 mb-2 ${
        isFromUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar do agente (só para mensagens do agente) */}
      {!isFromUser && showAvatar && (
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 self-end mb-1">
          <span className="text-xs font-semibold text-white">A</span>
        </div>
      )}

      {/* Conteúdo da mensagem */}
      <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md relative">
        {/* Renderizar conteúdo baseado no tipo */}
        {message.type === 'text' ? (
          <div className={`p-3 rounded-2xl shadow-sm ${
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

      {/* Menu de ações ao lado direito */}
      <div className={`self-start ${isFromUser ? 'order-first mr-1' : 'ml-1'}`}>
        <MessageActions
          messageId={message.id}
          messageContent={message.content}
          isFromUser={isFromUser}
          onReply={onReply}
          onForward={onForward}
          onReaction={onReaction}
          onTranslate={onTranslate}
          onAIReply={onAIReply}
        />
      </div>
    </motion.div>
  )
})

MessageBubble.displayName = 'MessageBubble'

export default MessageBubble
