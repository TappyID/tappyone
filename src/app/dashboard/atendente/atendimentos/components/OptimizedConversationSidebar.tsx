'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VirtualizedList } from '@/components/ui/VirtualizedList'
import { useOptimizedChats } from '@/hooks/useOptimizedChats'
import { 
  MessageCircle, 
  Users, 
  Search,
  Wifi,
  WifiOff,
  Phone,
  Video,
  MoreVertical,
  Pin,
  Archive
} from 'lucide-react'

interface OptimizedConversationSidebarProps {
  selectedConversation: any
  onSelectConversation: (conversation: any) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isCollapsed?: boolean
}

export function OptimizedConversationSidebar({
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  isCollapsed = false
}: OptimizedConversationSidebarProps) {
  const { chats, loading, hasNextPage, loadMore, searchChats, loadAvatar } = useOptimizedChats()
  const [avatars, setAvatars] = useState<Map<string, string>>(new Map())

  // Chats filtrados pela busca
  const filteredChats = useMemo(() => {
    return searchChats(searchQuery)
  }, [searchChats, searchQuery])

  // Função para carregar avatar lazy
  const handleLoadAvatar = useCallback(async (chatId: string) => {
    if (!avatars.has(chatId)) {
      const avatarUrl = await loadAvatar(chatId)
      if (avatarUrl) {
        setAvatars(prev => new Map(prev.set(chatId, avatarUrl)))
      }
    }
  }, [loadAvatar, avatars])

  // Formatação de timestamp otimizada
  const formatTimestamp = useCallback((timestamp: number) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) return 'Agora'
    if (hours < 24) return `${hours}h`
    
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }, [])

  // Renderizar item da lista (otimizado)
  const renderChatItem = useCallback(({ index, style, data }: any) => {
    const chat = data
    const isSelected = selectedConversation?.id === chat.id
    const avatar = avatars.get(chat.id)

    return (
      <motion.div
        style={style}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.02 }}
        onClick={() => onSelectConversation(chat)}
        onMouseEnter={() => handleLoadAvatar(chat.id)} // Lazy load avatar
        className={`
          relative p-4 border-b border-gray-200/50 cursor-pointer 
          transition-all duration-200 hover:bg-gray-50
          ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
          ${isCollapsed ? 'px-2' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={`
              bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600
              ${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'}
            `}>
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={chat.name}
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                <>
                  {chat.isGroup ? (
                    <Users className={isCollapsed ? 'w-4 h-4' : 'w-6 h-6'} />
                  ) : (
                    <MessageCircle className={isCollapsed ? 'w-4 h-4' : 'w-6 h-6'} />
                  )}
                </>
              )}
            </div>
            
            {/* Status online (apenas para conversas individuais) */}
            {!chat.isGroup && chat.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          {/* Info do Chat */}
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 truncate">
                  {chat.name}
                </h4>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatTimestamp(chat.timestamp)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage}
                </p>
                
                {/* Badge de mensagens não lidas */}
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                    {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tooltip para modo collapsed */}
        {isCollapsed && (
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
            {chat.name}
          </div>
        )}
      </motion.div>
    )
  }, [selectedConversation, avatars, onSelectConversation, handleLoadAvatar, formatTimestamp, isCollapsed])

  // Função de filtro para busca
  const searchFilter = useCallback((chat: any, query: string) => {
    const lowerQuery = query.toLowerCase()
    return chat.name.toLowerCase().includes(lowerQuery) ||
           chat.lastMessage.toLowerCase().includes(lowerQuery)
  }, [])

  if (loading && filteredChats.length === 0) {
    return (
      <div className={`bg-white border-r border-gray-200 ${isCollapsed ? 'w-16' : 'w-80'} flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          {!isCollapsed && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Conversas</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
        
        {/* Loading skeleton */}
        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-200/50 animate-pulse">
              <div className="flex items-center gap-3">
                <div className={`bg-gray-200 rounded-full ${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'}`}></div>
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border-r border-gray-200 ${isCollapsed ? 'w-16' : 'w-80'} flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
              <span className="text-sm text-gray-500">
                {filteredChats.length} {filteredChats.length === 1 ? 'conversa' : 'conversas'}
              </span>
            </div>
            
            {/* Barra de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {/* Lista Virtualizada */}
      <div className="flex-1 overflow-hidden">
        <VirtualizedList
          items={filteredChats}
          height={600} // Altura fixa para performance
          itemHeight={isCollapsed ? 60 : 80}
          renderItem={renderChatItem}
          searchQuery={searchQuery}
          filterFn={searchFilter}
          className="w-full h-full"
        />
      </div>

      {/* Load More Button */}
      {hasNextPage && !isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  )
}
