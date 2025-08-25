'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { FixedSizeList as List } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { useInfiniteMessages, WhatsAppMessage } from '@/hooks/useInfiniteMessages'
import { FixedSizeList } from 'react-window'
import { AudioLines, FileImage, FileVideo, MapPin, User, FileText, Download, Users } from 'lucide-react'
import AudioMessageComponent from './AudioMessageComponent'

interface VirtualizedChatAreaProps {
  chatId: string | null
  className?: string
}

interface MessageItemProps {
  index: number
  style: React.CSSProperties
  data: {
    messages: WhatsAppMessage[]
    loadMore: () => void
    hasMore: boolean
  }
}

const MessageItem: React.FC<MessageItemProps> = ({ index, style, data }) => {
  const { messages, loadMore, hasMore } = data
  const message = messages[index]

  // Se não há mensagem (ainda carregando), mostrar skeleton
  if (!message) {
    return (
      <div style={style} className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  // Se chegou no final e há mais mensagens, carregar mais
  if (index === messages.length - 10 && hasMore) {
    loadMore()
  }

  const isFromMe = message.fromMe
  const messageTime = new Date(message.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="mb-2">
            {message.mediaUrl && (
              <img 
                src={message.mediaUrl} 
                alt="Imagem" 
                className="max-w-xs rounded-lg cursor-pointer"
                onClick={() => window.open(message.mediaUrl, '_blank')}
              />
            )}
            {(message.body || message.caption) && (
              <p className="text-sm mt-2">{message.body || message.caption}</p>
            )}
          </div>
        )

      case 'audio':
      case 'voice':
        // Se a mensagem contém texto de fallback, renderizar como texto
        if (message.body && message.body.includes('🎤 *Mensagem de Áudio*')) {
          return (
            <div className="mb-2">
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AudioLines className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm text-orange-700 whitespace-pre-line">{message.body}</p>
                </div>
              </div>
            </div>
          )
        }
        
        return (
          <div className="mb-2">
            <AudioMessageComponent 
              message={message}
              onTranscribe={(text) => {
                // Adicionar transcrição à mensagem
                console.log('Transcrição:', text)
              }}
            />
            {(message.body || message.caption) && !message.body?.includes('🎤 *Mensagem de Áudio*') && (
              <p className="text-sm mt-2">{message.body || message.caption}</p>
            )}
          </div>
        )

      case 'video':
        return (
          <div className="mb-2">
            {message.mediaUrl && (
              <video 
                controls 
                className="max-w-xs rounded-lg"
                preload="metadata"
              >
                <source src={message.mediaUrl} type="video/mp4" />
                <source src={message.mediaUrl} type="video/webm" />
                Seu navegador não suporta vídeo.
              </video>
            )}
            {(message.body || message.caption) && (
              <p className="text-sm mt-2">{message.body || message.caption}</p>
            )}
          </div>
        )

      case 'document':
      case 'file':
        return (
          <div className="mb-2">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{message.fileName || 'Documento'}</p>
                {message.mediaUrl && (
                  <a 
                    href={message.mediaUrl} 
                    download 
                    className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Baixar
                  </a>
                )}
              </div>
            </div>
            {(message.body || message.caption) && (
              <p className="text-sm mt-2">{message.body || message.caption}</p>
            )}
          </div>
        )

      case 'location':
        return (
          <div className="mb-2">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-red-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Localização</p>
                <p className="text-xs text-gray-500">{message.body}</p>
              </div>
            </div>
          </div>
        )

      case 'poll':
        return (
          <div className="mb-2">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Enquete</p>
                <p className="text-xs text-gray-500">{message.body}</p>
              </div>
            </div>
          </div>
        )

      default:
        return message.body && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
        )
    }
  }

  return (
    <div style={style} className="px-4 py-2">
      <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] rounded-lg p-3 ${
          isFromMe 
            ? 'bg-blue-500 text-white' 
            : 'bg-white border border-gray-200'
        }`}>
          {!isFromMe && (
            <p className="text-xs font-medium mb-1 opacity-70">
              {message.author}
            </p>
          )}
          
          {renderMessageContent()}
          
          <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
            isFromMe ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span>{messageTime}</span>
            {isFromMe && (
              <span className="text-xs">
                {message.status === 'read' ? '✓✓' : 
                 message.status === 'delivered' ? '✓✓' : 
                 message.status === 'sent' ? '✓' : '⏳'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const VirtualizedChatArea: React.FC<VirtualizedChatAreaProps> = ({ 
  chatId, 
  className = '' 
}) => {
  const { messages, loading, hasMore, loadMore, refresh, error } = useInfiniteMessages({ 
    chatId, 
    pageSize: 50 
  })
  const listRef = useRef<List>(null)
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true)

  // Auto-scroll para o final quando novas mensagens chegam
  useEffect(() => {
    if (shouldScrollToBottom && messages.length > 0 && listRef.current) {
      listRef.current.scrollToItem(messages.length - 1, 'end')
    }
  }, [messages.length, shouldScrollToBottom])

  // Reset scroll quando chat muda
  useEffect(() => {
    setShouldScrollToBottom(true)
  }, [chatId])

  const itemData = {
    messages,
    loadMore,
    hasMore
  }

  if (!chatId) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <p className="text-gray-500">Selecione um chat para ver as mensagens</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <p className="text-red-500 mb-2">Erro ao carregar mensagens</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full ${className}`}>
      {messages.length === 0 && loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <List
          ref={listRef}
          height={600} // Será ajustado pelo CSS
          itemCount={messages.length}
          itemSize={120} // Altura estimada por mensagem
          itemData={itemData}
          className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          onScroll={({ scrollOffset, scrollUpdateWasRequested }) => {
            // Detectar se usuário scrollou para cima manualmente
            if (!scrollUpdateWasRequested) {
              const isNearBottom = scrollOffset > (messages.length * 120) - 800
              setShouldScrollToBottom(isNearBottom)
            }
          }}
        >
          {MessageItem}
        </List>
      )}
      
      {loading && messages.length > 0 && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
}
