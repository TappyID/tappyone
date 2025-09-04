'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Users, 
  Search,
  Loader2,
  Wifi,
  WifiOff,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import { useInfiniteChats } from '@/hooks/useInfiniteChats'

interface InfiniteConversationSidebarProps {
  selectedConversation: any
  onSelectConversation: (conversation: any) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  isQuickActionsSidebarOpen?: boolean
}

export default function InfiniteConversationSidebar({
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  isLoading: externalLoading = false,
  isCollapsed = false,
  onToggleCollapse,
  isQuickActionsSidebarOpen = false
}: InfiniteConversationSidebarProps) {
  const { chats, loading, hasMore, loadMore, refresh, handleScroll } = useInfiniteChats()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)

  // Filtrar chats pela busca
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Formatação de timestamp
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

  // Handler do scroll com debounce
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    
    if (!isScrolling) {
      setIsScrolling(true)
      setTimeout(() => setIsScrolling(false), 100)
    }
    
    handleScroll(element)
  }, [handleScroll, isScrolling])

  // Refresh ao mudar query de busca
  useEffect(() => {
    if (searchQuery === '') {
      // Só refresh se não tem busca
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  return (
    <div className={`
      bg-white border-r border-gray-200 flex flex-col transition-all duration-300
      ${isCollapsed ? 'w-16' : 'w-80'}
      ${isQuickActionsSidebarOpen ? 'border-r-2 border-blue-300' : ''}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
          )}
          
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <span className="text-sm text-gray-500">
                {filteredChats.length} {filteredChats.length === 1 ? 'conversa' : 'conversas'}
              </span>
            )}
            
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
              >
                {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {!isCollapsed && (
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
        )}
      </div>

      {/* Lista de Conversas com Scroll Infinito */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={onScroll}
      >
        <AnimatePresence>
          {filteredChats.map((chat, index) => {
            const isSelected = selectedConversation?.id === chat.id
            
            return (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onSelectConversation(chat)}
                className={`
                  relative p-4 border-b border-gray-200/50 cursor-pointer 
                  transition-all duration-200 hover:bg-gray-50 group
                  ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
                  ${isCollapsed ? 'px-2' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`
                      bg-gradient-to-br from-gray-200 to-gray-300 rounded-full 
                      flex items-center justify-center text-gray-600
                      ${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'}
                    `}>
                      {chat.profilePicUrl ? (
                        <img 
                          src={chat.profilePicUrl} 
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
                    
                    {/* Online indicator para chats individuais */}
                    {!chat.isGroup && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                        {chat.unreadCount > 0 && (
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
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
                    {chat.name}
                    {chat.unreadCount > 0 && ` (${chat.unreadCount})`}
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-4 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            {!isCollapsed && (
              <span className="ml-2 text-sm text-gray-500">Carregando...</span>
            )}
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && filteredChats.length > 0 && (
          <div className="p-4">
            <button
              onClick={loadMore}
              className="w-full py-2 px-4 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
            >
              Carregar mais conversas
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredChats.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? (
              <>
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma conversa encontrada</p>
                <p className="text-sm mt-1">Tente outro termo de busca</p>
              </>
            ) : (
              <>
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma conversa disponível</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Status Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              <span>Conectado</span>
            </div>
            {hasMore && (
              <span>+{chats.length} conversas</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
