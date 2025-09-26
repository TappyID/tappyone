'use client'

import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, MessageCircle, ChevronUp } from 'lucide-react'

import MessageBubble from './MessageBubble'

interface ChatAreaProps {
  // Mensagens do chat
  messages: Array<{
    id: string
    content: string
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call' | 'poll' | 'menu' | 'event' | 'link-preview'
    sender: 'user' | 'agent'
    timestamp: number
    status?: 'sending' | 'sent' | 'delivered' | 'read'
    mediaUrl?: string
    // Suporte a reply/resposta
    replyTo?: {
      id: string
      content: string
      sender: 'user' | 'agent'
      type?: string
    }
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
  }>
  
  // Estados de carregamento
  isLoading?: boolean
  isTyping?: boolean
  typingUser?: string
  
  // Paginação e scroll
  hasMore?: boolean
  totalMessages?: number
  onLoadMore?: () => void
  
  // Chat selecionado
  selectedChat?: {
    id: string
    name: string
  }
  
  // Callbacks para ações das mensagens
  onReply?: (messageId: string) => void
  onForward?: (messageId: string) => void
  onReaction?: (messageId: string, emoji: string) => void
  onTranslate?: (messageId: string, translatedText?: string) => void
  onAIReply?: (messageId: string, content: string) => void
}

export default function ChatArea({ 
  messages, 
  isLoading = false,
  isTyping = false,
  typingUser,
  hasMore = false,
  totalMessages = 0,
  onLoadMore,
  selectedChat,
  onReply,
  onForward,
  onReaction,
  onTranslate,
  onAIReply
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollToTop, setShowScrollToTop] = useState(false)

  // Auto-scroll DESABILITADO para permitir scroll manual
  // useEffect(() => {
  //   if (messages.length > 0 && messages.length <= 10) {
  //     const timer = setTimeout(() => {
  //       messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  //     }, 200)
  //     return () => clearTimeout(timer)
  //   }
  // }, [messages.length])

  // Detectar scroll para mostrar badge e load more
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    
    console.log('📜 Scroll detectado:', { 
      scrollTop, 
      hasMore, 
      isLoading, 
      onLoadMoreExists: !!onLoadMore,
      messagesCount: messages.length 
    })
    
    // Mostrar botão "voltar ao topo" se scrollou muito
    setShowScrollToTop(scrollTop > 200)
    
    // Load more quando chegar próximo do topo (não exatamente 0)
    if (scrollTop < 100 && hasMore && onLoadMore && !isLoading) {
      console.log('📤 Trigger: Carregando mais mensagens...', {
        scrollTop,
        hasMore,
        isLoading,
        currentMessages: messages.length
      })
      onLoadMore()
    } else if (scrollTop < 100) {
      console.log('🚫 LoadMore bloqueado:', {
        scrollTop: scrollTop < 100,
        hasMore,
        onLoadMoreExists: !!onLoadMore,
        isLoading
      })
    }
  }

  const scrollToBottom = () => {
    console.log('⬇️ Badge clicada: rolando para baixo')
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleBadgeClick = () => {
    console.log('🎯 Badge clicada: carregando mais mensagens')
    if (onLoadMore && !isLoading) {
      onLoadMore()
    }
  }

  // Estado sem chat selecionado
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Bem-vindo ao Atendimento
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Selecione uma conversa na sidebar para começar a atender
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        /* Scrollbar Styles - Igual do ChatModalKanban */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #3B82F620;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3B82F6;
          border-radius: 4px;
          transition: background 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3B82F6dd;
        }
        
        /* Pattern de pontinhos para light mode */
        .chat-dots-pattern {
          background-image: 
            radial-gradient(circle at 2px 2px, rgba(0,0,0,0.06) 1px, transparent 0),
            radial-gradient(circle at 12px 12px, rgba(0,0,0,0.03) 1px, transparent 0),
            radial-gradient(circle at 6px 18px, rgba(0,0,0,0.04) 1px, transparent 0);
          background-size: 24px 24px;
        }
        
        /* Pattern de pontinhos para dark mode */
        .dark .chat-dots-pattern {
          background-image: 
            radial-gradient(circle at 2px 2px, rgba(255,255,255,0.12) 1px, transparent 0),
            radial-gradient(circle at 12px 12px, rgba(255,255,255,0.06) 1px, transparent 0),
            radial-gradient(circle at 6px 18px, rgba(255,255,255,0.09) 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>
      
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden relative h-full">
      
      {/* Badge de mensagens não carregadas - estilo WhatsApp Web */}
      {(() => {
        console.log('🎯 Badge Check:', { totalMessages, messagesLength: messages.length, shouldShow: totalMessages > messages.length })
        return totalMessages > messages.length
      })() && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleBadgeClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-all cursor-pointer"
          >
            <ChevronUp className="w-4 h-4 rotate-180" />
            {totalMessages - messages.length} mensagens não carregadas
          </motion.button>
        </div>
      )}

      {/* Área de mensagens com pattern WhatsApp */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 space-y-1 relative bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 chat-dots-pattern"
        onScroll={handleScroll}
        style={{
          height: 'calc(100vh - 180px)',
          minHeight: '500px',
          maxHeight: 'calc(100vh - 180px)'
        }}
      >
        {/* Loading mais mensagens no topo */}
        {isLoading && messages.length > 0 && (
          <div className="flex items-center justify-center py-4 border-b border-gray-200 dark:border-gray-700">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <span className="ml-2 text-xs text-gray-500">Carregando mais mensagens...</span>
          </div>
        )}

        {/* Loading inicial */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Carregando mensagens...</span>
          </div>
        )}


        {/* Lista de mensagenss */}
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1
            // Sempre mostrar avatar para corrigir o bug de agrupamento
            const showAvatar = true
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isLastMessage={isLastMessage}
                showAvatar={showAvatar}
                onReply={onReply}
                onForward={onForward}
                onReaction={onReaction}
                onTranslate={onTranslate}
                onAIReply={onAIReply}
              />
            )
          })}
        </AnimatePresence>

        {/* Indicador de digitação */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {typingUser?.charAt(0) || '?'}
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Estado vazio */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Nenhuma mensagem ainda
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Inicie a conversa com {selectedChat.name} enviando uma mensagem
            </p>
          </div>
        )}

        {/* Conteúdo de teste para forçar scroll */}
        {messages.length < 5 && (
          <div className="space-y-4 p-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={`test-${i}`} className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded">
                Mensagem de teste {i + 1} para forçar scroll
              </div>
            ))}
          </div>
        )}

        {/* Referência para auto-scroll */}
        <div ref={messagesEndRef} />
      </div>
    </div>
    </>
  )
}
