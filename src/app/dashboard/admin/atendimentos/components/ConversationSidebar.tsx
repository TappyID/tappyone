'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Users, 
  Clock, 
  CheckCircle2, 
  Circle,
  Search,
  Filter,
  MoreVertical,
  Pin,
  Archive,
  Star,
  Phone,
  Video,
  User,
  Tag,
  ChevronDown,
  Languages,
  Mic,
  Wifi,
  WifiOff
} from 'lucide-react'
import { usePresence } from '@/hooks/usePresence'
import { usePresencePolling } from '@/hooks/usePresencePolling'

interface ConversationSidebarProps {
  chats: any[]
  contacts: any[]
  selectedConversation: any
  onSelectConversation: (conversation: any) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading?: boolean
}

// Função para formatar timestamp
const formatTimestamp = (timestamp: number | string) => {
  try {
    // Se não há timestamp válido, retornar agora
    if (!timestamp) {
      return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
    
    let date: Date
    
    // Tratar diferentes formatos de timestamp
    if (typeof timestamp === 'number') {
      // Se é um número muito pequeno, provavelmente já está em segundos
      date = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000)
    } else if (typeof timestamp === 'string') {
      // Tentar parsear string
      const parsed = parseInt(timestamp)
      if (!isNaN(parsed)) {
        date = parsed > 1000000000000 ? new Date(parsed) : new Date(parsed * 1000)
      } else {
        date = new Date(timestamp)
      }
    } else {
      date = new Date()
    }
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
      return 'Ontem'
    } else if (days < 7) {
      return `${days} dias`
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  } catch (error) {
    // Em caso de erro, retornar horário atual
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
}

// Função para extrair nome do contato
const getContactName = (chat: any, contacts: any[]) => {
  // Tentar encontrar o contato na lista
  const contact = contacts.find(c => c.id === chat.id._serialized)
  if (contact && contact.name && contact.name !== contact.id) {
    return contact.name
  }
  
  // Se tem nome no chat, usar
  if (chat.name && chat.name !== chat.id._serialized) {
    return chat.name
  }
  
  // Extrair número do telefone
  const phoneNumber = chat.id.user || chat.id._serialized.split('@')[0]
  return `+${phoneNumber}`
}

export default function ConversationSidebar({
  chats,
  contacts,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  isLoading = false
}: ConversationSidebarProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const { getChatPresence, isOnline, isTyping } = usePresence()
  const [selectedQueue, setSelectedQueue] = useState('todas')
  const [showQueueDropdown, setShowQueueDropdown] = useState(false)
  
  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-queue-dropdown]')) {
        setShowQueueDropdown(false)
      }
    }
    
    if (showQueueDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showQueueDropdown])

  
  // Opções de filas mock
  const queueOptions = [
    { value: 'todas', label: 'Filas' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'suporte', label: 'Suporte' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'marketing', label: 'Marketing' }
  ]
  
  // Cache para evitar requests desnecessários
  const [kanbanCache, setKanbanCache] = useState<{[key: string]: any}>({})
  const [lastKanbanFetch, setLastKanbanFetch] = useState<number>(0)
  
  // Função para buscar informações do quadro e coluna (com cache)
  const getKanbanInfo = async (chatId: string) => {
    // Cache por 5 minutos
    const CACHE_DURATION = 5 * 60 * 1000
    const now = Date.now()
    
    if (kanbanCache[chatId] && (now - lastKanbanFetch) < CACHE_DURATION) {
      return kanbanCache[chatId]
    }
    
    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      
      // Buscar todos os quadros do usuário apenas se necessário
      const quadrosResponse = await fetch(`${backendUrl}/api/kanban/quadros`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!quadrosResponse.ok) {
        const fallback = { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
        setKanbanCache(prev => ({ ...prev, [chatId]: fallback }))
        return fallback
      }
      
      const quadros = await quadrosResponse.json()
      setLastKanbanFetch(now)
      
      // Para cada quadro, buscar os metadados para encontrar o chat
      for (const quadro of quadros) {
        try {
          const metadataResponse = await fetch(`${backendUrl}/api/kanban/${quadro.id}/metadata`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (metadataResponse.ok) {
            const metadata = await metadataResponse.json()
            const cardMetadata = metadata.cards || {}
            
            // Verificar se o chat está neste quadro
            if (cardMetadata[chatId]) {
              const cardInfo = cardMetadata[chatId]
              
              // Buscar informações completas do quadro (incluindo colunas)
              const quadroResponse = await fetch(`${backendUrl}/api/kanban/quadros/${quadro.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
              
              if (quadroResponse.ok) {
                const quadroCompleto = await quadroResponse.json()
                const coluna = quadroCompleto.colunas?.find((col: any) => col.id === cardInfo.colunaId)
                
                const result = {
                  quadro: quadro.nome,
                  coluna: coluna?.nome || 'Coluna desconhecida',
                  color: coluna?.cor || '#d1d5db' // Usar a cor exata da coluna
                }
                setKanbanCache(prev => ({ ...prev, [chatId]: result }))
                return result
              }
            }
          }
        } catch (error) {
          console.log('Erro ao buscar metadados do quadro:', quadro.id, error)
        }
      }
      
      const fallback = { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
      setKanbanCache(prev => ({ ...prev, [chatId]: fallback }))
      return fallback
    } catch (error) {
      console.error('Erro ao buscar informações do Kanban:', error)
      const fallback = { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
      setKanbanCache(prev => ({ ...prev, [chatId]: fallback }))
      return fallback
    }
  }
  
  // Estado para armazenar informações do Kanban
  const [kanbanInfo, setKanbanInfo] = useState<{[key: string]: any}>({})
  
  // Carregar informações do Kanban apenas para chats visíveis (otimização)
  useEffect(() => {
    const loadKanbanInfo = async () => {
      const newKanbanInfo: {[key: string]: any} = {}
      
      // Carregar apenas para os primeiros 10 chats (visíveis)
      const visibleChats = chats.slice(0, 10)
      
      for (const chat of visibleChats) {
        const chatId = chat.id._serialized || chat.id
        const info = await getKanbanInfo(chatId)
        newKanbanInfo[chatId] = info
      }
      
      setKanbanInfo(newKanbanInfo)
    }
    
    if (chats.length > 0) {
      loadKanbanInfo()
    }
  }, [chats])
  
  // Processar chats do WhatsApp para o formato esperado
  const conversations = chats.map((chat, index) => {
    const chatId = chat.id._serialized || chat.id
    const kanbanData = kanbanInfo[chatId] || { quadro: 'Carregando...', coluna: '', color: '#d1d5db' }
    
    return {
      id: chatId,
      name: getContactName(chat, contacts),
      lastMessage: chat.lastMessage?.body || 'Sem mensagens',
      timestamp: formatTimestamp(chat.timestamp),
      unread: chat.unreadCount || 0,
      status: 'offline', // TODO: implementar status real
      avatar: null, // TODO: implementar avatar
      type: chat.isGroup ? 'group' : 'individual',
      tags: [], // TODO: implementar tags
      isPinned: chat.pinned || false,
      isArchived: chat.archived || false,
      badge: {
        text: kanbanData.coluna ? `${kanbanData.quadro} • ${kanbanData.coluna}` : kanbanData.quadro,
        color: kanbanData.color,
        backgroundColor: kanbanData.color // Adicionar cor de fundo
      },
      originalChat: chat // Manter referência original
    }
  })

  const filters = [
    { id: 'all', label: 'Todas', icon: MessageCircle, count: conversations.length },
    { id: 'unread', label: 'Não', icon: Circle, count: conversations.filter(c => c.unread > 0).length },
    { id: 'read', label: 'Lidas', icon: CheckCircle2, count: conversations.filter(c => c.unread === 0).length },
    { id: 'groups', label: 'Grupos', icon: Users, count: conversations.filter(c => c.type === 'group').length },
  ]

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = activeFilter === 'all' ||
                         (activeFilter === 'unread' && conv.unread > 0) ||
                         (activeFilter === 'read' && conv.unread === 0) ||
                         (activeFilter === 'groups' && conv.type === 'group')
    
    return matchesSearch && matchesFilter
  })

  // Configurar polling de presença para chats visíveis
  const visibleChatIds = filteredConversations.slice(0, 10).map(conv => conv.id)
  
  usePresencePolling({
    chatIds: visibleChatIds,
    enabled: visibleChatIds.length > 0,
    interval: 30000 // 30 segundos
  })

  // Presença removida para melhorar performance

  return (
    <div className="w-[520px] bg-gray-50/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col h-full">
      {/* Filters Header */}
      <div className="p-4 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
          <div className="flex items-center gap-3">
            {/* Select Filas Elegante */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-queue-dropdown
            >
              <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-[1px] rounded-lg shadow-lg">
                <motion.button
                  onClick={() => setShowQueueDropdown(!showQueueDropdown)}
                  className="bg-white rounded-lg px-3 py-2 flex items-center gap-2 min-w-[120px] hover:bg-gray-50 transition-colors"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
                  <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                    {queueOptions.find(q => q.value === selectedQueue)?.label}
                  </span>
                  <motion.div
                    animate={{ rotate: showQueueDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </motion.div>
                </motion.button>
              </div>
              
              {/* Dropdown customizado */}
              <AnimatePresence>
                {showQueueDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-[9999]"
                  >
                    <div className="py-1">
                      {queueOptions.map((option, index) => (
                        <motion.button
                          key={option.value}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            setSelectedQueue(option.value)
                            setShowQueueDropdown(false)
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 flex items-center gap-2 ${
                            selectedQueue === option.value ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {selectedQueue === option.value && (
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full" />
                          )}
                          {selectedQueue !== option.value && <div className="w-2" />}
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl backdrop-blur-sm">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-white text-[#273155] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <filter.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{filter.label}</span>
              {filter.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeFilter === filter.id
                    ? 'bg-[#273155] text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {filter.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <AnimatePresence mode="popLayout">
          {filteredConversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.8)' }}
              onClick={() => onSelectConversation(conversation.originalChat)}
              className={`relative p-4 border-b border-gray-200/30 cursor-pointer transition-all duration-300 ${
                selectedConversation?.id === conversation.id
                  ? 'bg-[#273155]/10 border-l-4 border-l-[#273155]'
                  : 'hover:bg-white/60'
              }`}
            >
              {/* Pinned Indicator */}
              {conversation.isPinned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <Pin className="w-3 h-3 text-[#273155] fill-current" />
                </motion.div>
              )}

              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-[#273155] to-[#2a3660] rounded-xl flex items-center justify-center shadow-lg overflow-hidden"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    {conversation.originalChat?.profilePictureUrl ? (
                      <img 
                        src={conversation.originalChat.profilePictureUrl} 
                        alt={conversation.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback para ícone se a imagem falhar
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`${conversation.originalChat?.profilePictureUrl ? 'hidden' : ''} flex items-center justify-center w-full h-full`}>
                      {conversation.type === 'group' ? (
                        <Users className="w-6 h-6 text-white" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Presence Status Indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    isOnline(conversation.id) ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {isOnline(conversation.id) ? (
                      <Wifi className="w-2 h-2 text-white" />
                    ) : (
                      <WifiOff className="w-2 h-2 text-white" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{conversation.name}</h3>
                    <span className="text-xs text-gray-500 ml-2">{conversation.timestamp}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    {isTyping(conversation.id) ? (
                      <div className="flex items-center text-sm text-blue-600 flex-1">
                        <motion.div
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="flex items-center"
                        >
                          <span className="mr-2">digitando</span>
                          <div className="flex space-x-1">
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                              className="w-1 h-1 bg-blue-600 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                              className="w-1 h-1 bg-blue-600 rounded-full"
                            />
                            <motion.div
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                              className="w-1 h-1 bg-blue-600 rounded-full"
                            />
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 truncate flex-1">{conversation.lastMessage}</p>
                    )}
                    {/* Badge Mock */}
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center px-2 py-1 text-xs text-white rounded-full font-medium shadow-sm ml-2 flex-shrink-0"
                style={{ backgroundColor: conversation.badge.backgroundColor || conversation.badge.color }}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {conversation.badge.text}
                    </motion.span>
                  </div>
                  
                  {/* Tags & Unread */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {conversation.tags.slice(0, 2).map((tag, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="px-2 py-1 text-xs bg-[#273155]/10 text-[#273155] rounded-full font-medium"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                    
                    {conversation.unread > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        className="w-6 h-6 bg-[#273155] text-white text-xs rounded-full flex items-center justify-center font-bold"
                      >
                        {conversation.unread > 9 ? '9+' : conversation.unread}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hover Actions */}
              <motion.div 
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {filteredConversations.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 text-gray-500"
          >
            <MessageCircle className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Nenhuma conversa encontrada</p>
            <p className="text-sm text-center">
              {searchQuery ? 'Tente ajustar sua busca' : 'Suas conversas aparecerão aqui'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="p-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#273155', color: 'white' }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-[#273155] text-gray-700 hover:text-white rounded-lg transition-all duration-300"
          >
            <Phone className="w-4 h-4" />
            <span className="text-sm font-medium">Ligar</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#273155', color: 'white' }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-[#273155] text-gray-700 hover:text-white rounded-lg transition-all duration-300"
          >
            <Video className="w-4 h-4" />
            <span className="text-sm font-medium">Vídeo</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
