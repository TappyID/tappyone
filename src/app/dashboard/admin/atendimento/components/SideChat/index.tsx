'use client'

import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, MessageCircle } from 'lucide-react'

import ItemSideChat from './ItemSideChat'

interface SideChatProps {
  // Dados dos chats
  chats: Array<{
    id: string
    name: string
    avatar?: string
    lastMessage: {
      type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call'
      content: string
      timestamp: number
      sender: 'user' | 'agent'  
      isRead?: boolean
    }
    tags?: Array<{
      id: string
      nome: string
      cor?: string
    }>
    rating?: number
    isTransferred?: boolean
    transferredTo?: {
      nome: string
      avatar?: string
    }
    isSelected?: boolean
    isArchived?: boolean
    isHidden?: boolean
    unreadCount?: number
  }>
  
  // Chat selecionado
  selectedChatId?: string
  
  // Callbacks
  onSelectChat: (chatId: string) => void
  onTagsClick: (chatId: string, e: React.MouseEvent) => void
  onTransferClick: (chatId: string, e: React.MouseEvent) => void
  onArchiveClick: (chatId: string, e: React.MouseEvent) => void
  onHideClick: (chatId: string, e: React.MouseEvent) => void
  onDeleteClick: (chatId: string, e: React.MouseEvent) => void
  
  // Scroll infinito
  onLoadMore?: () => void
  hasMoreChats?: boolean
  isLoadingMore?: boolean
  
  // Estados
  isLoading?: boolean
  isCollapsed?: boolean
}

export default function SideChat({
  chats,
  selectedChatId,
  onSelectChat,
  onTagsClick,
  onTransferClick,
  onArchiveClick,
  onHideClick,
  onDeleteClick,
  onLoadMore,
  hasMoreChats = false,
  isLoadingMore = false,
  isLoading = false,
  isCollapsed = false
}: SideChatProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)

  // IntersectionObserver para scroll infinito
  useEffect(() => {
    if (!onLoadMore || !hasMoreChats || isLoadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          onLoadMore()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (loadMoreTriggerRef.current) {
      observer.observe(loadMoreTriggerRef.current)
    }

    return () => {
      if (loadMoreTriggerRef.current) {
        observer.unobserve(loadMoreTriggerRef.current)
      }
    }
  }, [onLoadMore, hasMoreChats, isLoadingMore])

  // Modo colapsado
  if (isCollapsed) {
    return (
      <div className="w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
        {/* Avatars dos chats ativos */}
        <div className="p-2 space-y-2">
          {chats.slice(0, 6).map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                chat.id === selectedChatId 
                  ? 'border-blue-500 scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              title={chat.name}
            >
              {chat.avatar ? (
                <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {chat.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Badge de não lidas */}
              {chat.unreadCount && chat.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full 
                               flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
                    flex flex-col overflow-hidden">
      
      {/* Container com scroll */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Loading inicial */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Carregando chats...</span>
          </div>
        )}

        {/* Lista de chats */}
        {!isLoading && (
          <AnimatePresence mode="popLayout">
            {chats.map((chat, index) => (
              <ItemSideChat
                key={chat.id}
                chat={{
                  ...chat,
                  isSelected: chat.id === selectedChatId
                }}
                onSelect={() => onSelectChat(chat.id)}
                onTagsClick={(e) => onTagsClick(chat.id, e)}
                onTransferClick={(e) => onTransferClick(chat.id, e)}
                onArchiveClick={(e) => onArchiveClick(chat.id, e)}
                onHideClick={(e) => onHideClick(chat.id, e)}
                onDeleteClick={(e) => onDeleteClick(chat.id, e)}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Trigger do scroll infinito */}
        {hasMoreChats && (
          <div 
            ref={loadMoreTriggerRef}
            className="flex items-center justify-center py-4"
          >
            {isLoadingMore ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Carregando mais chats...</span>
              </motion.div>
            ) : (
              <div className="w-full h-4" />
            )}
          </div>
        )}

        {/* Indicador de fim da lista */}
        {!hasMoreChats && chats.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-gray-500 flex items-center gap-2"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Todos os chats carregados</span>
            </motion.div>
          </div>
        )}

        {/* Estado vazio */}
        {!isLoading && chats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Nenhuma conversa encontrada
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tente ajustar os filtros ou aguarde novas mensagens chegarem.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
