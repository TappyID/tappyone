'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ScrollbarStyles.css'
import { ArrowUp, Loader2, MessageCircle } from 'lucide-react'

import ItemSideChat from './ItemSideChat'

interface SideChatProps {
  // Dados dos chats
  chats: Array<{
    id: string
    name: string
    avatar?: string
    profilePictureUrl?: string
    lastMessage: {
      type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call'
      content: string
      timestamp: number
      sender: 'user' | 'agent'
      isRead?: boolean
    }
    phoneNumber?: string
    tags?: Array<{
      id: string
      nome: string
      cor?: string
    }>
    fila?: string | {
      id: string
      nome: string
      cor?: string
    }
    isGroup?: boolean
    isContact?: boolean
    isFavorite?: boolean
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
  onToggleFavorite?: (chatId: string) => void
  onToggleArchive?: (chatId: string) => void
  onToggleHidden?: (chatId: string) => void
  onDelete?: (chatId: string) => void
  
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
  onToggleFavorite,
  onToggleArchive,
  onToggleHidden,
  onDelete,
  onLoadMore,
  hasMoreChats = false,
  isLoadingMore = false,
  isLoading,
  isCollapsed = false
}: SideChatProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null)
  const [preserveScroll, setPreserveScroll] = useState<number | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // IntersectionObserver para scroll infinito
  useEffect(() => {
    console.log('🔄 [SideChat] IntersectionObserver setup:', {
      hasOnLoadMore: !!onLoadMore,
      hasMoreChats,
      isLoadingMore,
      chatsLength: chats.length
    })

    if (!onLoadMore || !hasMoreChats || isLoadingMore) {
      console.log('🔄 [SideChat] Observer não criado - condições não atendidas')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        console.log('🔄 [SideChat] Observer triggered:', {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio
        })
        
        if (entry.isIntersecting) {
          console.log('🔄 [SideChat] Trigger do scroll infinito ativado - carregando mais chats...')
          
          // Salvar posição EXATA antes de carregar mais
          if (scrollContainerRef.current) {
            const container = scrollContainerRef.current
            const currentScroll = container.scrollTop
            const scrollHeight = container.scrollHeight
            const clientHeight = container.clientHeight
            
            console.log('📜 Salvando posição EXATA antes de carregar mais:', {
              scrollTop: currentScroll,
              scrollHeight,
              clientHeight,
              distanceFromBottom: scrollHeight - currentScroll - clientHeight
            })
            
            setPreserveScroll(currentScroll)
          }
          
          // Carregar mais chats
          onLoadMore()
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
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

  // Preservar posição do scroll durante updates - ULTRA MELHORADO
  useEffect(() => {
    if (preserveScroll !== null && scrollContainerRef.current) {
      console.log('📜 Restaurando posição do scroll:', preserveScroll)
      
      // Usar múltiplos requestAnimationFrame para garantir que tudo foi renderizado
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = preserveScroll
            console.log('✅ Posição restaurada para:', preserveScroll)
            setPreserveScroll(null)
          }
        })
      })
    }
  }, [chats, preserveScroll])

  // Impedir scroll automático para o topo
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const preventAutoScroll = (e: Event) => {
      if (preserveScroll !== null) {
        console.log('🚫 Impedindo scroll automático')
        e.preventDefault()
        e.stopPropagation()
      }
    }

    container.addEventListener('scroll', preventAutoScroll, { passive: false })
    
    return () => {
      container.removeEventListener('scroll', preventAutoScroll)
    }
  }, [preserveScroll])

  // Handler do scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setShowScrollTop(scrollTop > 200)
  }

  // Função para rolar para o topo
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  // Modo colapsado
  if (isCollapsed) {
    return (
      <div className="w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
                      flex flex-col items-center py-4 space-y-2">
        <div className="space-y-2">
          {chats.slice(0, 8).map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`relative w-12 h-12 rounded-full overflow-hidden transition-all ${
                selectedChatId === chat.id 
                  ? 'ring-2 ring-blue-500' 
                  : 'hover:ring-2 hover:ring-gray-300'
              }`}
              title={chat.name}
            >
              {/* Avatar */}
              {chat.avatar ? (
                <img 
                  src={chat.avatar} 
                  alt={chat.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 
                               flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {chat.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              {/* Badge de não lidas */}
              {(chat.unreadCount && chat.unreadCount > 0) && (
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
    <div className="relative flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Lista de Chats com scroll */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden modern-scrollbar"
        onScroll={handleScroll}
      >
        {/* Loading inicial */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Carregando chats...</span>
          </div>
        )}

        {/* Lista de chats - Estilo vivaosim sem divisórias */}
        {!isLoading && (
          <>
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Nenhum chat encontrado
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  Tente ajustar os filtros ou adicionar chats
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
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
                  onToggleFavorite={onToggleFavorite}
                  onToggleArchive={onToggleArchive}
                  onToggleHidden={onToggleHidden}
                  onDelete={onDelete}
                />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
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

        {/* Botão Scroll to Top - Dentro da sidebar */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20 
              }}
              onClick={scrollToTop}
              className="absolute bottom-4 right-4 p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Voltar ao topo"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
