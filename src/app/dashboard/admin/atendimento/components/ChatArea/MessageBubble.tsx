'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  CheckCheck,
  Languages,
  Reply
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
    // Suporte a reply/resposta
    replyTo?: {
      id: string
      content: string
      sender: 'user' | 'agent'
      type?: string
    }
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

  // INVERTIDO: user = esquerda (recebe), agent = direita (envia)
  const isFromUser = message.sender !== 'user'

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

  const renderReplyPreview = () => {
    if (!message.replyTo) return null

    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`mb-2.5 p-2.5 rounded-xl border-l-[3px] backdrop-blur-sm ${
        isFromUser
          ? 'bg-white/10 border-white/40 shadow-lg'
          : 'bg-black/5 dark:bg-white/5 border-gray-400 dark:border-gray-600'
      }`}>
        <div className="flex items-start gap-2">
          <Reply className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
            isFromUser ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
          }`} />
          <div className="flex-1 min-w-0">
            <div className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${
              isFromUser ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {message.replyTo.sender === 'user' ? 'Cliente' : 'Atendente'}
            </div>
            <div className={`text-xs overflow-hidden font-medium ${
              isFromUser ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
            }`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as any,
              maxHeight: '2.4em',
              lineHeight: '1.2em'
            }}>
              {message.replyTo.type === 'image' && (
                <>
                  {message.replyTo.content && message.replyTo.content !== 'Imagem'
                    ? message.replyTo.content
                    : 'Imagem'}
                </>
              )}
              {message.replyTo.type === 'audio' && (
                <>
                  {message.replyTo.content && message.replyTo.content !== 'Áudio'
                    ? message.replyTo.content
                    : 'Mensagem de áudio'}
                </>
              )}
              {message.replyTo.type === 'video' && (
                <>
                  {message.replyTo.content && message.replyTo.content !== 'Vídeo'
                    ? message.replyTo.content
                    : 'Vídeo'}
                </>
              )}
              {message.replyTo.type === 'document' && (
                <>
                  {message.replyTo.content || 'Documento'}
                </>
              )}
              {message.replyTo.type === 'location' && (
                <>
                  {message.replyTo.content || 'Localização compartilhada'}
                </>
              )}
              {message.replyTo.type === 'contact' && (
                <>
                  {message.replyTo.content || 'Contato compartilhado'}
                </>
              )}
              {message.replyTo.type === 'poll' && (
                <>
                  {message.replyTo.content || 'Enquete'}
                </>
              )}
              {message.replyTo.type === 'menu' && (
                <>
                  {message.replyTo.content || 'Menu interativo'}
                </>
              )}
              {message.replyTo.type === 'event' && (
                <>
                  {message.replyTo.content || 'Evento'}
                </>
              )}
              {(!message.replyTo.type || message.replyTo.type === 'text') &&
                (message.replyTo.content.length > 50
                  ? `${message.replyTo.content.substring(0, 50)}...`
                  : message.replyTo.content)
              }
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderMessageContent = () => {
    const { type, content, mediaUrl, metadata } = message

    // Componentes especializados para cada tipo
    switch (type) {
      case 'audio':
        return (
          <div>
            {/* Reply Preview para Áudio */}
            {message.replyTo && renderReplyPreview()}
            <MessageAudio
              audioUrl={message.mediaUrl || ''}
              duration={message.metadata?.duration}
              isFromUser={isFromUser}
              caption={message.content !== 'Áudio' ? message.content : undefined}
              onTranscribe={(audioUrl) => undefined}
            />
          </div>
        )

      case 'document':
        return (
          <div>
            {/* Reply Preview para Documento */}
            {message.replyTo && renderReplyPreview()}
            <MessageDocument
              documentUrl={mediaUrl || ''}
              fileName={metadata?.fileName || 'Documento'}
              fileSize={metadata?.fileSize}
              mimeType={metadata?.mimeType}
              isFromUser={isFromUser}
              caption={message.content !== metadata?.fileName ? message.content : undefined}
            />
          </div>
        )

      case 'video':
        return (
          <div>
            {/* Reply Preview para Vídeo */}
            {message.replyTo && renderReplyPreview()}
            <MessageVideo
              videoUrl={mediaUrl || ''}
              thumbnailUrl={metadata?.thumbnailUrl}
              duration={metadata?.duration}
              isFromUser={isFromUser}
              caption={content}
            />
          </div>
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
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden rounded-2xl shadow-xl"
              >
                <img
                  src={mediaUrl}
                  alt="Imagem compartilhada"
                  className="max-w-full h-auto cursor-pointer hover:brightness-95 transition-all"
                />
              </motion.div>
            )}
            {content && (
              <p className={`text-sm px-1 ${
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
            {/* Reply Preview para Texto */}
            {message.replyTo && renderReplyPreview()}

            {/* Conteúdo da mensagem */}
            <p className="text-sm break-words">{content}</p>

            {/* Tradução */}
            {message.translation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2.5 p-2.5 rounded-xl border-l-[3px] border-blue-400 bg-gradient-to-r from-blue-50/80 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 backdrop-blur-sm shadow-sm"
              >
                <div className="flex items-start gap-2">
                  <Languages className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 block mb-1.5 uppercase tracking-wider">Tradução:</span>
                    <span className="text-sm text-blue-900 dark:text-blue-100 font-medium leading-relaxed">{message.translation}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className={`group flex items-end gap-2 mb-3 ${
        isFromUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar do agente (só para mensagens do agente) */}
      {!isFromUser && showAvatar && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 self-end mb-1 shadow-lg ring-2 ring-white/20"
        >
          <span className="text-xs font-bold text-white">A</span>
        </motion.div>
      )}

      {/* Conteúdo da mensagem */}
      <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md relative">
        {/* Renderizar conteúdo baseado no tipo */}
        {message.type === 'text' ? (
          <motion.div
            className={`p-4 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-200 ${
            isFromUser
              ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 text-white shadow-blue-500/30'
              : 'bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-gray-100 shadow-gray-500/10 border border-gray-200/50 dark:border-gray-700/50'
          }`}
            whileHover={{
              boxShadow: isFromUser
                ? '0 20px 30px rgba(59, 130, 246, 0.3)'
                : '0 10px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            {renderMessageContent()}
          </motion.div>
        ) : (
          <div>
            {renderMessageContent()}
          </div>
        )}

        {/* Timestamp e Status */}
        <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${
          isFromUser ? 'justify-end' : 'justify-start'
        }`}>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
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
