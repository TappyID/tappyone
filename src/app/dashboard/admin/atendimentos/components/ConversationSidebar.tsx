'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  Star,
  Phone,
  Video,
  User,
  Tag,
  ChevronDown,
  Languages,
  Mic,
  Wifi,
  WifiOff,
  PanelLeftClose,
  PanelLeftOpen,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  DollarSign,
  Calendar,
  Hash,
  Eye,
  EyeOff,
  X,
  Kanban,
  Layers,
  Archive,
  Trash2
} from 'lucide-react'
import { usePresencePolling } from '@/hooks/usePresencePolling'
import { useTags } from '@/hooks/useTags'
import { useFilas } from '@/hooks/useFilas'
import { usePresence } from '@/hooks/usePresence'
import { useContatoData } from '@/hooks/useContatoData'

interface ConversationSidebarProps {
  chats: any[]
  contacts: any[]
  selectedConversation: any
  onSelectConversation: (conversation: any) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  isQuickActionsSidebarOpen?: boolean
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
  // Diferentes formatos de ID dependendo do engine WAHA
  const chatId = chat.id?._serialized || chat.id || chat.chatId || ''
  
  // Tentar encontrar o contato na lista
  const contact = contacts.find(c => c.id === chatId)
  if (contact && contact.name && contact.name !== contact.id) {
    return contact.name
  }
  
  // Se tem nome no chat, usar
  if (chat.name && chat.name !== chatId) {
    return chat.name
  }
  
  // Extrair número do telefone de diferentes formatos
  let phoneNumber = ''
  if (chat.id?.user) {
    phoneNumber = chat.id.user
  } else if (chatId && chatId.includes('@')) {
    phoneNumber = chatId.split('@')[0]
  } else if (chatId) {
    phoneNumber = chatId.replace(/\D/g, '') // Remove tudo que não é dígito
  }
  
  return phoneNumber ? `+${phoneNumber}` : 'Contato'
}

// Função para extrair última mensagem
const getLastMessage = (chat: any) => {
  // Tentar extrair a última mensagem de diferentes formatos
  if (chat.lastMessage?.body) {
    return chat.lastMessage.body
  }
  if (chat.lastMessage?.content) {
    return chat.lastMessage.content
  }
  if (chat.body) {
    return chat.body
  }
  return 'Sem mensagens'
}

export default function ConversationSidebar({
  chats,
  contacts,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  isLoading = false,
  isCollapsed = false,
  onToggleCollapse,
  isQuickActionsSidebarOpen = false
}: ConversationSidebarProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const { tags: realTags } = useTags()
  const { filas } = useFilas()
  const { isOnline, isTyping } = usePresence()
  
  // Buscar dados reais dos contatos
  const chatIds = chats.map(chat => chat.id?._serialized || chat.id || '')
  const { contatos: contatosData, loading: loadingContatos } = useContatoData(chatIds)
  const [selectedQueue, setSelectedQueue] = useState('todas')
  const [showQueueDropdown, setShowQueueDropdown] = useState(false)
  const [selectedTag, setSelectedTag] = useState('todas')
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [sortBy, setSortBy] = useState('recent')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [hiddenChats, setHiddenChats] = useState<Set<string>>(new Set())
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    showHidden: false,
    selectedQueues: [] as string[],
    selectedTags: [] as string[],
    selectedKanbans: [] as string[],
    selectedAtendentes: [] as string[]
  })
  
  // Refs for dropdown positioning
  const queueButtonRef = useRef<HTMLButtonElement>(null)
  const tagButtonRef = useRef<HTMLButtonElement>(null)
  const sortButtonRef = useRef<HTMLButtonElement>(null)
  const [queueDropdownPosition, setQueueDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [tagDropdownPosition, setTagDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [sortDropdownPosition, setSortDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  
  // Calculate dropdown positions
  const updateDropdownPosition = (buttonRef: React.RefObject<HTMLButtonElement>, setPosition: Function) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8, // 8px abaixo do botão
        left: rect.left,
        width: rect.width
      })
    }
  }
  
  // Update positions when dropdowns open
  useEffect(() => {
    if (showQueueDropdown) updateDropdownPosition(queueButtonRef, setQueueDropdownPosition)
  }, [showQueueDropdown])
  
  useEffect(() => {
    if (showTagDropdown) updateDropdownPosition(tagButtonRef, setTagDropdownPosition)
  }, [showTagDropdown])
  
  useEffect(() => {
    if (showSortDropdown) updateDropdownPosition(sortButtonRef, setSortDropdownPosition)
  }, [showSortDropdown])

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-queue-dropdown]')) {
        setShowQueueDropdown(false)
      }
      if (!target.closest('[data-tag-dropdown]')) {
        setShowTagDropdown(false)
      }
      if (!target.closest('[data-sort-dropdown]')) {
        setShowSortDropdown(false)
      }
    }
    
    if (showQueueDropdown || showTagDropdown || showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showQueueDropdown, showTagDropdown, showSortDropdown])

  
  // Opções de filas reais
  const queueOptions = [
    { value: 'todas', label: 'Filas' },
    ...filas.map(fila => ({ value: fila.id, label: fila.nome }))
  ]
  
  // Opções de tags reais
  const tagOptions = [
    { value: 'todas', label: 'Tags' },
    ...realTags.map(tag => ({ value: tag.id, label: tag.nome }))
  ]
  
  // Opções de ordenação
  const sortOptions = [
    { value: 'recent', label: 'Mais Recente', icon: Calendar },
    { value: 'oldest', label: 'Mais Antigo', icon: Calendar },
    { value: 'budget_high', label: 'Orçamento Maior', icon: DollarSign },
    { value: 'budget_low', label: 'Orçamento Menor', icon: DollarSign },
    { value: 'tag', label: 'Por Tag', icon: Tag },
    { value: 'name', label: 'Por Nome', icon: Hash }
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
      
      // Buscar todos os quadros do usuário apenas se necessário
      const quadrosResponse = await fetch(`/api/kanban/quadros`, {
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
          const metadataResponse = await fetch(`/api/kanban/${quadro.id}/metadata`, {
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
              const quadroResponse = await fetch(`/api/kanban/quadros/${quadro.id}`, {
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
  

  // Funções para ações de chat
  const handleArchiveChat = async (chatId: string, isArchived: boolean) => {
    try {
      const endpoint = isArchived ? 'unarchive' : 'archive'
      const response = await fetch(`/api/whatsapp/chats/${chatId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao ${isArchived ? 'desarquivar' : 'arquivar'} chat`)
      }

      // Atualizar a lista de conversas localmente
      window.location.reload()
      
    } catch (error) {
      console.error('Erro na operação de arquivo:', error)
      alert(`Erro ao ${isArchived ? 'desarquivar' : 'arquivar'} chat. Tente novamente.`)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    const confirmDelete = confirm(
      'Tem certeza que deseja deletar este chat? Esta ação não pode ser desfeita.'
    )
    
    if (!confirmDelete) return

    try {
      const response = await fetch(`/api/whatsapp/chats/${chatId}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar chat')
      }

      // Atualizar a lista de conversas localmente
      window.location.reload()
      
    } catch (error) {
      console.error('Erro ao deletar chat:', error)
      alert('Erro ao deletar chat. Tente novamente.')
    }
  }

  // Criar conversas baseadas nos chats reais com dados dos contatos
  const conversations = chats.map((chat, index) => {
    const name = getContactName(chat, contacts)
    const lastMessage = getLastMessage(chat)
    const chatId = chat.id?._serialized || chat.id || `chat-${index}`
    
    // Buscar dados reais do contato
    const contatoData = contatosData[chatId]
    
    return {
      id: chatId,
      name,
      lastMessage: lastMessage === 'Sem mensagens' ? 'Nova conversa' : lastMessage,
      timestamp: formatTimestamp(chat.timestamp),
      unread: chat.unreadCount || 0,
      status: 'offline', // Will be updated by presence hook
      avatar: chat.profilePictureUrl,
      type: chat.isGroup ? 'group' : 'individual',
      
      // Dados reais do contato
      tags: contatoData?.tags || [],
      queue: contatoData?.fila || null,
      atendente: contatoData?.atendente || null,
      kanbanBoard: contatoData?.kanbanBoard || null,
      orcamento: contatoData?.orcamento || null,
      agendamento: contatoData?.agendamento || null,
      
      // Badge do kanban se existir
      badge: contatoData?.kanbanBoard ? {
        text: contatoData.kanbanBoard,
        color: contatoData.fila?.cor || '#6b7280',
        backgroundColor: contatoData.fila?.cor || '#6b7280'
      } : null,
      
      isPinned: false, // TODO: Implementar campo no backend
      isArchived: false, // TODO: Implementar campo no backend
      originalChat: chat
    }
  })

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

  const filters = [
    { id: 'all', label: 'Todas', icon: MessageCircle, count: conversations.length },
    { id: 'unread', label: 'Não', icon: Circle, count: conversations.filter(c => c.unread > 0).length },
    { id: 'read', label: 'Lidas', icon: CheckCircle2, count: conversations.filter(c => c.unread === 0).length },
    { id: 'groups', label: 'Grupos', icon: Users, count: conversations.filter(c => c.type === 'group').length },
  ]

  const filteredConversations = conversations.filter(conv => {
    // Filtro de busca
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filtros básicos (Todas, Não lidas, Lidas, Grupos)
    const matchesFilter = activeFilter === 'all' ||
                         (activeFilter === 'unread' && conv.unread > 0) ||
                         (activeFilter === 'read' && conv.unread === 0) ||
                         (activeFilter === 'groups' && conv.type === 'group')
    
    // Filtro por fila real
    const matchesQueue = selectedQueue === 'todas' || 
                        (conv.queue && conv.queue.id === selectedQueue)
    
    // Filtro por tag real  
    const matchesTag = selectedTag === 'todas' ||
                      (conv.tags && conv.tags.some((tag: any) => tag.id === selectedTag))
    
    // Filtros avançados do modal
    const matchesVisibility = advancedFilters.showHidden ? 
      hiddenChats.has(conv.id) :   // Se está mostrando ocultas, mostra apenas as ocultas
      !hiddenChats.has(conv.id)    // Se não está mostrando ocultas, mostra apenas as não ocultas
    
    const matchesAdvancedQueues = advancedFilters.selectedQueues.length === 0 ||
                                 (conv.queue && advancedFilters.selectedQueues.includes(conv.queue.id))
    
    const matchesAdvancedTags = advancedFilters.selectedTags.length === 0 ||
                               (conv.tags && conv.tags.some((tag: any) => advancedFilters.selectedTags.includes(tag.id)))
    
    const matchesAdvancedKanbans = advancedFilters.selectedKanbans.length === 0 ||
                                  (conv.kanbanBoard && advancedFilters.selectedKanbans.includes(conv.kanbanBoard))
    
    const matchesAdvancedAtendentes = advancedFilters.selectedAtendentes.length === 0 ||
                                     (conv.atendente && advancedFilters.selectedAtendentes.includes(conv.atendente.id))
    
    return matchesSearch && 
           matchesFilter && 
           matchesQueue && 
           matchesTag &&
           matchesVisibility &&
           matchesAdvancedQueues &&
           matchesAdvancedTags &&
           matchesAdvancedKanbans &&
           matchesAdvancedAtendentes
  }).sort((a, b) => {
    // Implementar ordenação baseada em sortBy
    switch (sortBy) {
      case 'recent':
        return new Date(b.originalChat?.timestamp || 0).getTime() - new Date(a.originalChat?.timestamp || 0).getTime()
      case 'oldest':
        return new Date(a.originalChat?.timestamp || 0).getTime() - new Date(b.originalChat?.timestamp || 0).getTime()
      case 'budget_high':
        // TODO: implementar ordenação por orçamento quando disponível
        return 0
      case 'budget_low':
        // TODO: implementar ordenação por orçamento quando disponível
        return 0
      case 'tag':
        return (a.badge?.text || '').localeCompare(b.badge?.text || '')
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
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
    <motion.div 
      animate={{ 
        width: isCollapsed ? '80px' : '520px',
        x: isQuickActionsSidebarOpen ? -520 : 0,
        opacity: isQuickActionsSidebarOpen ? 0 : 1
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-background/95 backdrop-blur-xl border-r border-border flex flex-col h-full overflow-hidden relative shadow-2xl"
    >
      {/* Collapsed State - Floating Expand Button */}
      {isCollapsed && (
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-6 bg-gradient-to-b from-white/95 to-gray-50/95 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-sm z-10">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#1e293b' }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleCollapse}
            className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-white rounded-full shadow-lg mb-4 border border-gray-300 dark:border-slate-600/50"
            title="Expandir sidebar"
          >
            <PanelLeftOpen className="w-6 h-6" />
          </motion.button>
          
          {/* Vertical Icons */}
          <div className="flex flex-col gap-4 items-center">
            <div className="p-2 bg-gray-200/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-300/50 dark:border-slate-700/50">
              <MessageCircle className="w-5 h-5 text-gray-700 dark:text-slate-200" />
            </div>
            <div className="p-2 bg-gray-200/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-300/50 dark:border-slate-700/50">
              <Users className="w-5 h-5 text-gray-700 dark:text-slate-200" />
            </div>
            <div className="p-2 bg-gray-200/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-300/50 dark:border-slate-700/50">
              <Search className="w-5 h-5 text-gray-700 dark:text-slate-200" />
            </div>
          </div>
        </div>
      )}

      {/* Normal State Content */}
      <motion.div
        animate={{ opacity: isCollapsed ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className={isCollapsed ? "pointer-events-none" : ""}
      >
        {/* Filters Header */}
        <div className="p-4 pb-2 border-b border-border bg-card/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-foreground">Conversas</h2>
            <div className="flex items-center gap-3">
            {/* Select Filas Elegante */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-queue-dropdown
            >
              <div className="relative bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 p-[1px] rounded-lg shadow-lg">
                <motion.button
                  ref={queueButtonRef}
                  onClick={() => setShowQueueDropdown(!showQueueDropdown)}
                  className="bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 min-w-[120px] hover:bg-accent transition-colors border border-border"
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full" />
                  <span className="text-sm font-medium text-foreground flex-1 text-left">
                    {queueOptions.find(q => q.value === selectedQueue)?.label}
                  </span>
                  <motion.div
                    animate={{ rotate: showQueueDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
            
            {/* Filtro de Tags */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-tag-dropdown
            >
              <div className="relative bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 p-[1px] rounded-lg shadow-lg">
                <motion.button
                  ref={tagButtonRef}
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 min-w-[100px] hover:bg-accent transition-colors border border-border"
                >
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span className="text-sm font-medium text-foreground flex-1 text-left">
                    {tagOptions.find(t => t.value === selectedTag)?.label}
                  </span>
                  <motion.div
                    animate={{ rotate: showTagDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
            
            {/* Ordenação com Modal */}
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-sort-dropdown
            >
              <motion.button
                ref={sortButtonRef}
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="p-2 bg-card/80 backdrop-blur-sm hover:bg-accent rounded-lg transition-colors border border-border shadow-lg"
                whileHover={{ scale: 1.1, rotate: 180 }}
              >
                <ArrowUpDown className="w-5 h-5 text-emerald-400" />
              </motion.button>
            </motion.div>
            
            {/* Filtros Avançados Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilterModal(true)}
              className="p-2 hover:bg-accent rounded-lg transition-colors relative"
              title="Filtros avançados"
            >
              <Filter className="w-5 h-5 text-muted-foreground" />
              {(advancedFilters.selectedQueues.length > 0 || 
                advancedFilters.selectedTags.length > 0 || 
                advancedFilters.selectedKanbans.length > 0 || 
                advancedFilters.selectedAtendentes.length > 0 ||
                advancedFilters.showHidden) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleCollapse}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-muted-foreground" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
              )}
            </motion.button>
            </div>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="p-4 pt-2 relative z-[10]">
          <div className="flex gap-1 bg-card/50 p-1 rounded-xl backdrop-blur-sm border border-border/30 relative z-[10]">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <filter.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{filter.label}</span>
              {filter.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeFilter === filter.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
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
              whileHover={{ x: 4, backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
              onClick={() => onSelectConversation(conversation.originalChat)}
              className={`relative p-4 border-b border-border cursor-pointer transition-all duration-300 ${
                selectedConversation?.id === conversation.id
                  ? 'bg-accent/30 border-l-4 border-l-primary'
                  : 'hover:bg-accent/20'
              }`}
            >
              {/* Pinned Indicator */}
              {conversation.isPinned && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <Pin className="w-3 h-3 text-blue-400 fill-current" />
                </motion.div>
              )}

              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-gray-300/50 dark:border-slate-600/50"
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
                        <Users className="w-6 h-6 text-gray-600 dark:text-white" />
                      ) : (
                        <User className="w-6 h-6 text-gray-600 dark:text-white" />
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
                    <h3 className="font-semibold text-foreground truncate">{conversation.name}</h3>
                    <div className="flex items-center gap-2">
                      {/* Botão Ocultar/Mostrar */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          const newHiddenChats = new Set(hiddenChats)
                          if (hiddenChats.has(conversation.id)) {
                            newHiddenChats.delete(conversation.id)
                          } else {
                            newHiddenChats.add(conversation.id)
                          }
                          setHiddenChats(newHiddenChats)
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          hiddenChats.has(conversation.id) 
                            ? 'text-red-400 hover:text-red-300 bg-red-500/10' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title={hiddenChats.has(conversation.id) ? 'Mostrar conversa' : 'Ocultar conversa'}
                      >
                        {hiddenChats.has(conversation.id) ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </motion.button>
                      
                      {/* Botão de Arquivar */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Implementar lógica de arquivar
                          console.log('Arquivar conversa:', conversation.id)
                        }}
                        className="p-1 hover:bg-accent rounded transition-colors"
                        title="Arquivar conversa"
                      >
                        <Archive className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </motion.button>
                      
                      {/* Botão de Excluir */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: Implementar lógica de excluir
                          if (confirm('Deseja realmente excluir esta conversa?')) {
                            console.log('Excluir conversa:', conversation.id)
                          }
                        }}
                        className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                        title="Excluir conversa"
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-red-600" />
                      </motion.button>
                      
                      <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                      {conversation.unread > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold ml-2"
                        >
                          {conversation.unread > 9 ? '9+' : conversation.unread}
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  {/* Informações da Fila e Tag */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* Fila */}
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 rounded-md border border-purple-500/20">
                      <Layers className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-purple-300 font-medium">
                        {/* Mock da fila - você pode substituir pela lógica real */}
                        {'Vendas'}
                      </span>
                    </div>
                    
                    {/* Tag Principal */}
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs text-emerald-300 font-medium">
                        {/* Mock da tag - você pode substituir pela lógica real */}
                        {'VIP'}
                      </span>
                    </div>
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
                      <p className="text-sm text-muted-foreground truncate flex-1">{conversation.lastMessage || 'Última mensagem vista'}</p>
                    )}
                    {/* Badge do Kanban */}
                    {conversation.badge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center px-2 py-1 text-white rounded-full font-medium shadow-sm ml-2 flex-shrink-0"
                        style={{ 
                          backgroundColor: conversation.badge.backgroundColor || conversation.badge.color || '#6b7280',
                          fontSize: '9px'
                        }}
                      >
                        <Kanban className="w-3 h-3 mr-1" />
                        {conversation.badge.text}
                      </motion.span>
                    )}
                  </div>
                  
                </div>
              </div>

              {/* Hover Actions */}
              <motion.div 
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

          {/* Empty State */}
          {filteredConversations.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-slate-400"
            >
              <MessageCircle className="w-12 h-12 mb-4 text-slate-600" />
              <p className="text-lg font-medium mb-2 text-slate-200">Nenhuma conversa encontrada</p>
              <p className="text-sm text-center">
                {searchQuery ? 'Tente ajustar sua busca' : 'Suas conversas aparecerão aqui'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-slate-700/50 bg-gray-50/80 dark:bg-slate-800/30 backdrop-blur-sm">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-gray-50 dark:bg-emerald-600/20 dark:hover:bg-emerald-500 text-gray-600 hover:text-gray-700 dark:text-emerald-300 dark:hover:text-white rounded-lg transition-all duration-300 border border-gray-200 dark:border-emerald-500/30 shadow-sm dark:shadow-emerald-500/20"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Ligar</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-blue-600/20 dark:hover:bg-blue-500 text-gray-600 hover:text-gray-700 dark:text-blue-300 dark:hover:text-white rounded-lg transition-all duration-300 border border-gray-200 dark:border-blue-500/30 shadow-sm dark:shadow-blue-500/20"
            >
              <Video className="w-4 h-4" />
              <span className="text-sm font-medium">Vídeo</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* PORTALS para dropdowns - renderiza no body */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showQueueDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 overflow-hidden z-[999999]"
              style={{
                top: queueDropdownPosition.top,
                left: queueDropdownPosition.left,
                width: queueDropdownPosition.width || 120
              }}
              data-queue-dropdown
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
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-violet-500/20 transition-all duration-200 flex items-center gap-2 ${
                      selectedQueue === option.value ? 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-400 font-medium' : 'text-slate-300'
                    }`}
                  >
                    {selectedQueue === option.value && (
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full" />
                    )}
                    {selectedQueue !== option.value && <div className="w-2" />}
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showTagDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 overflow-hidden z-[999999]"
              style={{
                top: tagDropdownPosition.top,
                left: tagDropdownPosition.left,
                width: tagDropdownPosition.width || 100
              }}
              data-tag-dropdown
            >
              <div className="py-1">
                {tagOptions.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedTag(option.value)
                      setShowTagDropdown(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-green-500/20 transition-all duration-200 flex items-center gap-2 ${
                      selectedTag === option.value ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 font-medium' : 'text-slate-300'
                    }`}
                  >
                    {selectedTag === option.value && (
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full" />
                    )}
                    {selectedTag !== option.value && <div className="w-2" />}
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showSortDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed w-48 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 overflow-hidden z-[999999]"
              style={{
                top: sortDropdownPosition.top,
                left: sortDropdownPosition.left - 192 + (sortDropdownPosition.width || 0) // Alinha à direita
              }}
              data-sort-dropdown
            >
              <div className="py-1">
                {sortOptions.map((option, index) => {
                  const IconComponent = option.icon
                  return (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-green-500/20 transition-all duration-200 flex items-center gap-3 ${
                        sortBy === option.value ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 font-medium' : 'text-slate-300'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 ${
                        sortBy === option.value ? 'text-emerald-400' : 'text-slate-400'
                      }`} />
                      {option.label}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Modal de Filtros Avançados */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showFilterModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center p-4"
              onClick={() => setShowFilterModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Filter className="w-4 h-4 text-white" />
                      </div>
                      <h2 className="text-lg font-semibold text-white">Filtros Avançados</h2>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowFilterModal(false)}
                      className="w-8 h-8 flex items-center justify-center bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-300" />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                  {/* Mostrar Ocultos */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Visibilidade
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAdvancedFilters(prev => ({ ...prev, showHidden: !prev.showHidden }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        advancedFilters.showHidden
                          ? 'bg-blue-500/20 border-blue-400/50 text-blue-300' 
                          : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        advancedFilters.showHidden ? 'bg-blue-400' : 'bg-slate-500'
                      }`} />
                      <span className="flex-1 text-left">
                        {advancedFilters.showHidden ? 'Mostrando conversas ocultas' : 'Ocultar conversas marcadas'}
                      </span>
                      {advancedFilters.showHidden ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>

                  {/* Filtro por Filas */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Filas ({advancedFilters.selectedQueues.length} selecionadas)
                    </h3>
                    <div className="space-y-2">
                      {queueOptions.filter(q => q.value !== 'todas').map((queue) => (
                        <motion.button
                          key={queue.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              selectedQueues: prev.selectedQueues.includes(queue.value)
                                ? prev.selectedQueues.filter(q => q !== queue.value)
                                : [...prev.selectedQueues, queue.value]
                            }))
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            advancedFilters.selectedQueues.includes(queue.value)
                              ? 'bg-purple-500/20 border-purple-400/50 text-purple-300' 
                              : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            advancedFilters.selectedQueues.includes(queue.value) ? 'bg-purple-400' : 'bg-slate-500'
                          }`} />
                          <span className="flex-1 text-left">{queue.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Filtro por Tags */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags ({advancedFilters.selectedTags.length} selecionadas)
                    </h3>
                    <div className="space-y-2">
                      {tagOptions.filter(t => t.value !== 'todas').map((tag) => (
                        <motion.button
                          key={tag.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              selectedTags: prev.selectedTags.includes(tag.value)
                                ? prev.selectedTags.filter(t => t !== tag.value)
                                : [...prev.selectedTags, tag.value]
                            }))
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            advancedFilters.selectedTags.includes(tag.value)
                              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300' 
                              : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            advancedFilters.selectedTags.includes(tag.value) ? 'bg-emerald-400' : 'bg-slate-500'
                          }`} />
                          <span className="flex-1 text-left">{tag.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Filtro por Kanbans */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Kanban className="w-4 h-4" />
                      Kanbans ({advancedFilters.selectedKanbans.length} selecionados)
                    </h3>
                    <div className="space-y-2">
                      {(realTags.length > 0 ? realTags.map(tag => tag.nome) : ['vip', 'urgente', 'pendente', 'resolvido']).map((tag) => (
                        <motion.button
                          key={tag}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              selectedTags: prev.selectedTags.includes(tag)
                                ? prev.selectedTags.filter(t => t !== tag)
                                : [...prev.selectedTags, tag]
                            }))
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            advancedFilters.selectedTags.includes(tag)
                              ? 'bg-orange-500/20 border-orange-400/50 text-orange-300' 
                              : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            advancedFilters.selectedTags.includes(tag) ? 'bg-orange-400' : 'bg-slate-500'
                          }`} />
                          <span className="flex-1 text-left">{tag}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Filtro por Atendentes */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Atendentes ({advancedFilters.selectedAtendentes.length} selecionados)
                    </h3>
                    <div className="space-y-2">
                      {['Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa'].map((atendente) => (
                        <motion.button
                          key={atendente}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              selectedAtendentes: prev.selectedAtendentes.includes(atendente)
                                ? prev.selectedAtendentes.filter(a => a !== atendente)
                                : [...prev.selectedAtendentes, atendente]
                            }))
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            advancedFilters.selectedAtendentes.includes(atendente)
                              ? 'bg-green-500/20 border-green-400/50 text-green-300' 
                              : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            advancedFilters.selectedAtendentes.includes(atendente) ? 'bg-green-400' : 'bg-slate-500'
                          }`} />
                          <span className="flex-1 text-left">{atendente}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700/50 bg-slate-800/50">
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setAdvancedFilters({
                          showHidden: false,
                          selectedQueues: [],
                          selectedTags: [],
                          selectedKanbans: [],
                          selectedAtendentes: []
                        })
                      }}
                      className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-colors text-sm font-medium"
                    >
                      Limpar Filtros
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowFilterModal(false)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all text-sm font-medium"
                    >
                      Aplicar Filtros
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  )
}
