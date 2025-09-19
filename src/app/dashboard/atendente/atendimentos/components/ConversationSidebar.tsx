  'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Circle, 
  CheckCircle2, 
  Clock, 
  Archive, 
  Star, 
  MoreVertical,
  Eye,
  EyeOff,
  X,
  Search,
  Filter,
  ChevronDown,
  Users,
  Tag,
  Hash,
  Calendar,
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  Heart,
  UserPlus,
  Copy,
  Trash2,
  CornerDownRight,
  ChevronRight,
  ChevronLeft,
  ArrowDown,
  ArrowUp,
  Plus,
  Settings,
  Wifi,
  Ticket,
  ArrowUpDown,
  Pin,
  User,
  WifiOff,
  ArrowRightLeft,
  Layers,
  Kanban
} from 'lucide-react'
import { useAtendentes } from '@/hooks/useAtendentes'
import { useChatAgente } from '@/hooks/useChatAgente'
import { useWhatsAppData, WhatsAppChat } from '@/hooks/useWhatsAppData'
import { useAuth } from '@/hooks/useAuth'
import { useContatoTags } from '@/hooks/useContatoTags'
import { useContatoData } from '@/hooks/useContatoData'
import { useConexaoFila } from '@/hooks/useConexaoFila'
import { useFilas } from '@/hooks/useFilas'
import { useTags } from '@/hooks/useTags'
import { useKanban } from '@/hooks/useKanban'
import { useTickets } from '@/hooks/useTickets'
import { ConversationListSkeleton } from '@/components/shared/SkeletonLoader'
import TransferirAtendimentoModal from './modals/TransferirAtendimentoModal'
import { useInfiniteChats } from '@/hooks/useInfiniteChats'
import '@/styles/scrollbar.css'

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
    useInfiniteScroll?: boolean // Nova prop para ativar scroll infinito
    loadMoreChats?: () => void
    hasMoreChats?: boolean
    loadingMore?: boolean
    // Props para sistema de atendimento
    acceptedChats?: Set<string>
    onChatAccepted?: (chatId: string) => void
    // Props do página (fila, tags, etc.)
    selectedFila?: string
    onFilaChange?: (fila: string) => void
    selectedTags?: string[]
    onTagsChange?: (tags: string[]) => void
    notesCount?: number
    orcamentosCount?: number
    agendamentosCount?: number
    assinaturasCount?: number
    ticketsCount?: number
    contactStatus?: 'synced' | 'error'
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
  const getContactName = (chat: any, contacts: any[], contatosDataParam?: any) => {
    // Diferentes formatos de ID dependendo do engine WAHA
    const chatId = chat.id?._serialized || chat.id || chat.chatId || ''
    
    // Extrair número para verificar se é canal
    const phoneNumber = chatId.includes('@') ? chatId.split('@')[0] : chatId.replace(/\D/g, '')
    
    // FILTRO: Detectar canais do WhatsApp (números muito longos) e chats especiais
    const isWhatsAppChannel = phoneNumber && phoneNumber.length > 15
    const isStatusChat = chatId.includes('status') || chat.name === '+status' || (chat.name && chat.name.toLowerCase().includes('status'))
    
    
    // 1. Prioridade: Nome direto do chat (pushName do WhatsApp)
    if (chat.pushName && chat.pushName.trim() && chat.pushName !== chatId) {
      return chat.pushName.trim()
    }
    
    // 2. Nome do chat object
    if (chat.name && chat.name.trim() && chat.name !== chatId && !chat.name.includes('@')) {
      return chat.name.trim()
    }
    
    // 3. Tentar encontrar o contato na lista de contatos
    const contact = contacts.find(c => c.id === chatId)
    if (contact && contact.name && contact.name.trim() && contact.name !== contact.id) {
      return contact.name.trim()
    }
    
    // 4. Buscar pelo número de telefone nos contatos do backend
    if (phoneNumber && contatosDataParam) {
      // Buscar contato no backend por número
      const contatoData = contatosDataParam[chatId]
      if (contatoData && contatoData.nome && contatoData.nome.trim()) {
        return contatoData.nome.trim()
      }
    }
    
    // 5. Tratamento especial para chats de status
    if (isStatusChat) {
      return `📊 Status WhatsApp`
    }
    
    // 6. Tratamento especial para canais do WhatsApp
    if (isWhatsAppChannel) {
      return `📺 Canal WhatsApp`
    }
    
    // 7. Como último recurso, extrair e formatar o número 
    if (phoneNumber) {
      // Formatação mais amigável do número
      if (phoneNumber.length >= 10 && phoneNumber.length <= 15) {
        const formatted = phoneNumber.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')
        return formatted
      }
      return `+${phoneNumber}`
    }
    
    return 'Contato Sem Nome'
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
    isQuickActionsSidebarOpen = false,
    useInfiniteScroll = false, // Desativado por padrão até resolver o problema
    loadMoreChats,
    hasMoreChats,
    loadingMore,
    acceptedChats: acceptedChatsFromProps,
    onChatAccepted,
    // Outras props opcionais
    selectedFila,
    onFilaChange,
    selectedTags,
    onTagsChange,
    notesCount,
    orcamentosCount,
    agendamentosCount,
    assinaturasCount,
    ticketsCount,
    contactStatus
  }: ConversationSidebarProps) {
    const [activeFilter, setActiveFilter] = useState('all')
    const [showFilters, setShowFilters] = useState(false)
    // Hooks reais para dados
    const { filas } = useFilas()
    const { atendentes } = useAtendentes()
    const { tags: realTags } = useTags()
    const { quadros } = useKanban()
    const { tickets } = useTickets()
    
    
    // Mock data temporário para hooks não implementados
    const conexoes: any[] = []
    const getFilasDaConexao = (conexaoId?: string) => []
    // const { isOnline, isTyping } = usePresence() // Hook removido para evitar erro
    
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const loadMoreTriggerRef = useRef<HTMLDivElement>(null)
    
    // Buscar dados reais dos contatos - OTIMIZADO: só processar se há chats
    const chatIds = chats.length > 0 ? chats.map(chat => chat.id?._serialized || chat.id || '').filter(id => id) : []
    
    // Estados para scroll infinito
    const [visibleChatsCount, setVisibleChatsCount] = useState(15)
    const [handleLoadMoreChats, setHandleLoadMoreChats] = useState<(() => void) | null>(null)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [lastScrollPosition, setLastScrollPosition] = useState(0)
    
    // Reset apenas quando há mudança REALMENTE significativa (não pequenas variações)
    const [lastChatCount, setLastChatCount] = useState(chatIds.length)
    useEffect(() => {
      const currentCount = chatIds.length
      const diff = Math.abs(currentCount - lastChatCount)
      
      // Só reseta se houve mudança de mais de 10% ou diferença > 50 chats
      const shouldReset = diff > Math.max(50, currentCount * 0.1)
      
      if (shouldReset && !isLoadingMore) {
        console.log(`🔄 [ConversationSidebar] Reset significativo: ${lastChatCount} → ${currentCount} chats`)
        // Salvar posição atual do scroll
        if (scrollContainerRef.current) {
          setLastScrollPosition(scrollContainerRef.current.scrollTop)
        }
        // Preservar pelo menos 15 chats visíveis após reset
        setVisibleChatsCount(Math.max(15, Math.min(visibleChatsCount, currentCount)))
        setLastChatCount(currentCount)
      }
    }, [chatIds.length, lastChatCount, isLoadingMore, visibleChatsCount, scrollContainerRef])

    // Restaurar posição do scroll após reset
    useEffect(() => {
      if (lastScrollPosition > 0 && scrollContainerRef.current) {
        const timer = setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = lastScrollPosition
            setLastScrollPosition(0) // Reset após aplicar
          }
        }, 100)
        return () => clearTimeout(timer)
      }
    }, [lastScrollPosition, visibleChatsCount])

    // Estados do filtro em cascata
    const [selectedConexao, setSelectedConexao] = useState('todas')
    const [showConexaoDropdown, setShowConexaoDropdown] = useState(false)
    const [selectedQueue, setSelectedQueue] = useState('todas')
    
    // FILTRO AUTOMÁTICO PARA ATENDENTE: Auto-selecionar apenas a fila do atendente logado
    const [hasAutoSelected, setHasAutoSelected] = useState(false)
    const { user } = useAuth()
    
    useEffect(() => {
      if (filas.length > 0 && selectedQueue === 'todas' && !hasAutoSelected && user) {
        // Para atendentes: selecionar automaticamente a primeira fila disponível
        // NOTA: Como estamos no dashboard /atendente/, assumimos que é um atendente
        if (typeof window !== 'undefined' && window.location.pathname.includes('/dashboard/atendente/')) {
          // Buscar filas disponíveis para este atendente
          if (filas.length > 0) {
            setSelectedQueue(filas[0].id)
            setHasAutoSelected(true)
            console.log('🎯 [ATENDENTE] Auto-selecionou primeira fila:', filas[0].nome)
          }
        } else {
          // Para admin: manter lógica anterior baseada na conexão
          const conexaoAtiva = conexoes.find(conn => conn.platform === 'whatsapp' && conn.status === 'connected')
          
          if (conexaoAtiva?.modulation?.selectedFilas?.length > 0) {
            const filaId = conexaoAtiva.modulation.selectedFilas[0]
            const fila = filas.find(f => f.id === filaId)
            
            if (fila) {
              setSelectedQueue(fila.id)
              setHasAutoSelected(true)
            }
          }
        }
      }
    }, [conexoes, filas, selectedQueue, hasAutoSelected, user])
    const [showQueueDropdown, setShowQueueDropdown] = useState(false)
    const [selectedTag, setSelectedTag] = useState('todas')
    const [showTagDropdown, setShowTagDropdown] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState('todos')
    const [showTicketDropdown, setShowTicketDropdown] = useState(false)
    const [sortBy, setSortBy] = useState('recent')
    const [showSortDropdown, setShowSortDropdown] = useState(false)
    const [connectionModulation, setConnectionModulation] = useState<any>(null)
    
    // Refs para dropdowns
    const conexaoButtonRef = useRef<HTMLButtonElement>(null)
    const [conexaoDropdownPosition, setConexaoDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    const [hiddenChats, setHiddenChats] = useState<Set<string>>(new Set())
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [archivedChats, setArchivedChats] = useState<Set<string>>(new Set())
    const [favoriteChats, setFavoriteChats] = useState<Set<string>>(new Set()) // NOVO: Estado de favoritos
    
    // SISTEMA DE ATENDIMENTO COM TIMER
    const [acceptedChats, setAcceptedChats] = useState<Set<string>>(acceptedChatsFromProps || new Set()) // Chats aceitos pelo atendente
    const [chatTimers, setChatTimers] = useState<{[chatId: string]: { startTime: number, duration: number }}>({}) // Timers dos chats
    const [showAcceptModal, setShowAcceptModal] = useState(false)
    const [chatToAccept, setChatToAccept] = useState<any>(null)
    
    // Função para verificar se chat tem tags ou tickets (se não tem = EM ABERTO)
    const isChatOpen = (conversation: any) => {
      // DEBUG: Por enquanto, vamos ser mais restritivos
      // Só considerar EM ABERTO se for EXPLICITAMENTE um chat sem nenhuma informação
      const hasNoTags = !conversation.tags || conversation.tags.length === 0
      const hasNoTicket = !conversation.ticketId
      const isEmptyChat = hasNoTags && hasNoTicket
      
      // DEBUG: Log para entender quais chats estão sendo detectados como EM ABERTO
      if (isEmptyChat && conversation.name) {
        console.log('🔍 Chat detectado como EM ABERTO:', conversation.name, {
          tags: conversation.tags,
          ticketId: conversation.ticketId
        })
      }
      
      return isEmptyChat
    }
    
    // BYPASS TEMPORÁRIO - desabilitar sistema de aceitação por enquanto
    const BYPASS_ACCEPTANCE_SYSTEM = false // REATIVADO!
    
    // Interceptar clique no chat para verificar se precisa aceitar
    const handleChatClick = (conversation: any) => {
      // Se BYPASS está ativo, pular lógica de aceitação
      if (BYPASS_ACCEPTANCE_SYSTEM) {
        console.log('🔧 BYPASS ATIVO - Selecionando chat diretamente')
        const chatToSelect = conversation.originalChat || conversation
        onSelectConversation(chatToSelect)
        return
      }
      
      // Se estamos no dashboard atendente
      if (typeof window !== 'undefined' && window.location.pathname.includes('/dashboard/atendente/')) {
        const chatId = conversation.id
        
        // Se chat está "EM ABERTO" (sem tags/tickets) e não foi aceito ainda
        if (isChatOpen(conversation) && !acceptedChats.has(chatId)) {
          console.log('🎯 Interceptando chat EM ABERTO:', conversation.name)
          setChatToAccept(conversation)
          setShowAcceptModal(true)
          return // Não seleciona o chat ainda
        }
      }
      
      // Selecionar chat normalmente (já aceito ou admin)
      console.log('✅ Selecionando chat normalmente:', conversation.name)
      const chatToSelect = conversation.originalChat || conversation
      onSelectConversation(chatToSelect)
    }
    
    // Aceitar um chat e iniciar timer
    const handleAcceptChat = (conversation: any) => {
      const chatId = conversation.id
      const timerDuration = 30 * 60 * 1000 // 30 minutos em milliseconds (mock)
      
      // Adicionar chat aos aceitos
      setAcceptedChats(prev => new Set([...Array.from(prev), chatId]))
      
      // Iniciar timer
      setChatTimers(prev => ({
        ...prev,
        [chatId]: {
          startTime: Date.now(),
          duration: timerDuration
        }
      }))
      
      // Fechar modal
      setShowAcceptModal(false)
      setChatToAccept(null)
      
      // Notificar página principal (se prop existe)
      onChatAccepted?.(chatId)
      
      // Selecionar chat
      const chatToSelect = conversation.originalChat || conversation
      onSelectConversation(chatToSelect)
      
      // TODO: Forçar abertura do modal de ticket após aceitar
      console.log('🎯 Chat aceito:', chatId, 'Timer:', timerDuration / 1000 / 60, 'min')
    }
    
    const [advancedFilters, setAdvancedFilters] = useState({
      showHidden: false,
      showFavorites: false,  // NOVO: Filtro de favoritos
      showChannels: false,   // NOVO: Filtro de canais WhatsApp
      selectedQueues: [] as string[],
      selectedTags: [] as string[],
      selectedKanbans: [] as string[],
      selectedAtendentes: [] as string[],
      dateRange: null as { start: Date; end: Date } | null,
      messageCount: null as number | null
    })
    const [showTransferirModal, setShowTransferirModal] = useState(false)
    const [selectedConversationForTransfer, setSelectedConversationForTransfer] = useState<any>(null)

    // Buscar modulation da conexão quando uma fila for selecionada
    const fetchConnectionModulation = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return null

        const response = await fetch('/api/connections/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          const connections = data.connections || []
          

          // Encontrar a conexão WhatsApp atual
          const currentConnection = Array.isArray(connections) ? connections.find((conn: any) => 
            conn.platform === 'whatsapp' && conn.user_id
          ) : null


          if (currentConnection?.modulation) {
            const modulation = typeof currentConnection.modulation === 'string' 
              ? JSON.parse(currentConnection.modulation) 
              : currentConnection.modulation
            
            return modulation
          }
        }
        
        return null
      } catch (error) {
        console.error('❌ [MODULATION] Erro ao buscar modulation:', error)
        return null
      }
    }

    // Carregar modulation quando uma fila for selecionada
    useEffect(() => {
      if (selectedQueue !== 'todas') {
        fetchConnectionModulation().then(modulation => {
          setConnectionModulation(modulation)
        })
      } else {
        setConnectionModulation(null)
      }
    }, [selectedQueue])
    
    // Refs for dropdown positioning
    const queueButtonRef = useRef<HTMLButtonElement>(null)
    const tagButtonRef = useRef<HTMLButtonElement>(null)
    const ticketButtonRef = useRef<HTMLButtonElement>(null)
    const sortButtonRef = useRef<HTMLButtonElement>(null)
    const [queueDropdownPosition, setQueueDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    const [tagDropdownPosition, setTagDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
    const [ticketDropdownPosition, setTicketDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
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
      if (showTicketDropdown) updateDropdownPosition(ticketButtonRef, setTicketDropdownPosition)
    }, [showTicketDropdown])
    
    useEffect(() => {
      if (showSortDropdown) updateDropdownPosition(sortButtonRef, setSortDropdownPosition)
    }, [showSortDropdown])
    
    useEffect(() => {
      if (showConexaoDropdown) updateDropdownPosition(conexaoButtonRef, setConexaoDropdownPosition)
    }, [showConexaoDropdown])
    
    // Resetar conexão quando selecionar uma fila (filtro reverso)
    useEffect(() => {
      if (selectedQueue !== 'todas') {
        setSelectedConexao('todas')
      }
    }, [selectedQueue])

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        
        // Verifica se o clique foi dentro de qualquer dropdown (incluindo scroll interno)
        const isInsideDropdown = target.closest('.dropdown-portal') || 
                                target.closest('[data-conexao-dropdown]') ||
                                target.closest('[data-queue-dropdown]') ||
                                target.closest('[data-tag-dropdown]') ||
                                target.closest('[data-ticket-dropdown]') ||
                                target.closest('[data-sort-dropdown]')
        
        if (isInsideDropdown) return // Não fecha se clicou dentro do dropdown
        
        if (showConexaoDropdown) {
          setShowConexaoDropdown(false)
        }
        if (showQueueDropdown) {
          setShowQueueDropdown(false)
        }
        if (showTagDropdown) {
          setShowTagDropdown(false)
        }
        if (showTicketDropdown) {
          setShowTicketDropdown(false)
        }
        if (showSortDropdown) {
          setShowSortDropdown(false)
        }
      }
      
      if (showConexaoDropdown || showQueueDropdown || showTagDropdown || showTicketDropdown || showSortDropdown) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [showConexaoDropdown, showQueueDropdown, showTagDropdown, showTicketDropdown, showSortDropdown])

    
    // Opções de conexões
    const conexaoOptions = [
      { value: 'todas', label: 'Todas as Conexões' },
      ...conexoes.map(conexao => ({ 
        value: conexao.id, 
        label: conexao.session_name || `Conexão ${conexao.id.slice(0,8)}` 
      }))
    ]
    
    // Opções de filas filtradas pela conexão selecionada
    const getFilasDisponiveis = () => {
      if (selectedConexao === 'todas') {
        return filas
      }
      const filasIds = getFilasDaConexao(selectedConexao)
      return filas.filter(fila => filasIds.includes(fila.id))
    }
    
    const queueOptions = [
      { value: 'todas', label: 'Filas' },
      ...getFilasDisponiveis().map(fila => ({ value: fila.id, label: fila.nome }))
    ]
    
    // Opções de tags reais
    const tagOptions = [
      { value: 'todas', label: 'Tags' },
      ...realTags.map(tag => ({ value: tag.id, label: tag.nome }))
    ]
    
    const ticketOptions = [
      { value: 'todos', label: 'Tickets' },
      ...(tickets || []).map(ticket => ({ value: ticket.id, label: `#${ticket.id.slice(0, 8)}` }))
    ]
    
    // Opções de ordenação
    const sortOptions = [
      { value: 'recent', label: 'Mais Recente', icon: Calendar },
      { value: 'oldest', label: 'Mais Antigo', icon: Calendar },
      { value: 'budget_high', label: 'Orçamento Maior', icon: DollarSign },
      { value: 'budget_low', label: 'Orçamento Menor', icon: DollarSign },
      { value: 'tag', label: 'Por Tag', icon: Tag },
      { value: 'tag_asc', label: 'Por Tag (A-Z)', icon: Tag },
      { value: 'name', label: 'Por Nome', icon: Hash },
      { value: 'name_asc', label: 'Por Nome (A-Z)', icon: Hash },
      { value: 'ticket', label: 'Por Ticket', icon: MessageCircle },
      { value: 'ticket_asc', label: 'Por Ticket (A-Z)', icon: MessageCircle }
    ]
    
    // Cache para dados de agentes por chat
    const [agentesCache, setAgentesCache] = useState<{[chatId: string]: any}>({})
    const [loadingAgentes, setLoadingAgentes] = useState<{[chatId: string]: boolean}>({})
    
    // Cache para evitar requests desnecessários do Kanban - com melhor controle
    const [kanbanCache, setKanbanCache] = useState<{[key: string]: any}>({})
    const [kanbanCacheTimestamps, setKanbanCacheTimestamps] = useState<{[key: string]: number}>({})
    const [lastKanbanFetch, setLastKanbanFetch] = useState(0)
    
    // Cache para dados de conexão/fila por chat
    const [conexaoFilaCache, setConexaoFilaCache] = useState<{[chatId: string]: any}>({})
    const [loadingConexaoFila, setLoadingConexaoFila] = useState<{[chatId: string]: boolean}>({})
    
    // Função para buscar dados do agente de um chat específico
    const fetchAgenteForChat = async (chatId: string) => {
      if (!chatId || agentesCache[chatId] || loadingAgentes[chatId]) return
      
      setLoadingAgentes(prev => ({ ...prev, [chatId]: true }))
      
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        
        const response = await fetch(`/api/agentes-chat?contato_id=${chatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          const result = await response.json()
          setAgentesCache(prev => ({ ...prev, [chatId]: result }))
        } else {
          // Se não encontrar agente, armazenar como null para não tentar novamente
          setAgentesCache(prev => ({ ...prev, [chatId]: null }))
        }
      } catch (error) {
        console.error('Erro ao buscar agente do chat:', error)
        setAgentesCache(prev => ({ ...prev, [chatId]: null }))
      } finally {
        setLoadingAgentes(prev => ({ ...prev, [chatId]: false }))
      }
    }
    
    // Função para buscar dados de conexão/fila de um chat específico
    const fetchConexaoFilaForChat = async (chatId: string) => {
      if (!chatId || conexaoFilaCache[chatId] || loadingConexaoFila[chatId]) return
      
      setLoadingConexaoFila(prev => ({ ...prev, [chatId]: true }))
      
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        
        // Usar o número limpo para a busca (sem @c.us)
        const contatoId = chatId.replace('@c.us', '')
        
        const response = await fetch(`/api/conexoes/contato/${contatoId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        })
        
        if (response.ok) {
          const result = await response.json()
          const conexaoFilaData = {
            hasConnection: !!result.conexao,
            isConnected: result.conexao?.status === 'connected',
            conexao: result.conexao ? {
              id: result.conexao.id,
              sessionName: result.conexao.session_name,
              status: result.conexao.status
            } : null,
            fila: result.fila ? {
              id: result.fila.id,
              nome: result.fila.nome,
              cor: result.fila.cor
            } : null,
            atendentes: result.atendentes || []
          }
          setConexaoFilaCache(prev => ({ ...prev, [chatId]: conexaoFilaData }))
        } else {
          // Se não encontrar, armazenar como sem conexão
          setConexaoFilaCache(prev => ({ ...prev, [chatId]: {
            hasConnection: false,
            isConnected: false,
            conexao: null,
            fila: null,
            atendentes: []
          }}))
        }
      } catch (error) {
        console.error('Erro ao buscar conexão/fila do chat:', error)
        setConexaoFilaCache(prev => ({ ...prev, [chatId]: {
          hasConnection: false,
          isConnected: false,
          conexao: null,
          fila: null,
          atendentes: []
        }}))
      } finally {
        setLoadingConexaoFila(prev => ({ ...prev, [chatId]: false }))
      }
    }
    
    // Função para buscar informações do Kanban para um chat específico - cache otimizado
    const getKanbanInfo = async (chatId: string) => {
      const CACHE_DURATION = 3 * 60 * 1000 // 3 minutos - mais agressivo
      const now = Date.now()
      
      // Cache por chat individual, não global
      if (kanbanCache[chatId] && kanbanCacheTimestamps[chatId] && (now - kanbanCacheTimestamps[chatId]) < CACHE_DURATION) {
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
                  setKanbanCacheTimestamps(prev => ({ ...prev, [chatId]: now }))
                  return result
                }
              }
            }
          } catch (error) {
          }
        }
        
        const fallback = { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
        setKanbanCache(prev => ({ ...prev, [chatId]: fallback }))
        setKanbanCacheTimestamps(prev => ({ ...prev, [chatId]: now }))
        return fallback
      } catch (error) {
        console.error('Erro ao buscar informações do Kanban:', error)
        const fallback = { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
        setKanbanCache(prev => ({ ...prev, [chatId]: fallback }))
        setKanbanCacheTimestamps(prev => ({ ...prev, [chatId]: now }))
        return fallback
      }
    }
    
    // Estado para armazenar informações do Kanban
    const [kanbanInfo, setKanbanInfo] = useState<{[key: string]: any}>({})
    

    // Funções para ações de chat

    // Função para arquivar chat
    const toggleArchiveConversation = (chatId: string) => {
      setArchivedChats(prev => {
        const newSet = new Set(prev)
        if (newSet.has(chatId)) {
          newSet.delete(chatId)
        } else {
          newSet.add(chatId)
        }
        return newSet
      })
    }
    
    // NOVO: Função para toggle de favorito
    const toggleFavoriteConversation = (chatId: string) => {
      setFavoriteChats(prev => {
        const newSet = new Set(prev)
        if (newSet.has(chatId)) {
          newSet.delete(chatId)
        } else {
          newSet.add(chatId)
        }
        return newSet
      })
    }

    // Função para deletar/ocultar chat específico
    const handleDeleteChat = async (chatId: string) => {
      if (!confirm('Deseja realmente excluir esta conversa?')) return
      
      try {
        const token = localStorage.getItem('token')
        
        // Primeiro tentar via API Next.js (se existir)
        let response = await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        // Se 404 (não existe) ou 405 (método não permitido), ocultar localmente
        if (response.status === 404 || response.status === 405) {
          console.warn(`⚠️ Endpoint DELETE não disponível (${response.status}) - ocultando localmente`)
          setHiddenChats(prev => new Set(Array.from(prev).concat([chatId])))
          return
        }
        
        if (response.ok) {
          // Se deletou com sucesso, adicionar à lista de chats ocultos
          setHiddenChats(prev => new Set(Array.from(prev).concat([chatId])))
          
          // Opcional: mostrar notificação de sucesso
        } else {
          console.error('Erro ao deletar chat:', response.statusText)
          alert('Erro ao deletar chat. Tente novamente.')
        }
      } catch (error) {
        console.error('Erro ao deletar chat:', error)
        alert('Erro ao deletar chat. Tente novamente.')
      }
    }

    // Usar infinite scroll hook
    const { 
      chats: infiniteChats, 
      loading, 
      loadMore, 
      hasMore,
      handleScroll: infiniteScrollHandler,
      setupIntersectionObserver
    } = useInfiniteChats()
    
    // Usar dados do infinite scroll se ativado, senão usar props
    const activeChats = useInfiniteScroll ? infiniteChats : chats
    const activeContacts = contacts
    
    // DEBUG: Log dados dos chats
  
    // Usar loading adequado baseado no modo
    const activeLoading = useInfiniteScroll ? loading : isLoading
    
    // IntersectionObserver para carregamento progressivo
    useEffect(() => {
      // Sempre usar se ainda há mais chats para carregar
      const hasMoreToLoad = visibleChatsCount < chatIds.length
      
      if (!hasMoreToLoad) {
        return
      }
      
      const observer = new IntersectionObserver(
        (entries) => {
          const target = entries[0]
          if (target.isIntersecting && !isLoadingMore) {
            setIsLoadingMore(true)
            handleLoadMoreChats()
            // Reset loading após pequeno delay
            setTimeout(() => setIsLoadingMore(false), 1000)
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
    }, [visibleChatsCount, handleLoadMoreChats])
    
    // OTIMIZAÇÃO: Carregar dados apenas dos chats visíveis + buffer para performance
    const activeChatIds = activeChats.slice(0, Math.min(visibleChatsCount + 50, 200)).map(chat => chat.id?._serialized || chat.id || '')
    const { contatos: contatosData, loading: loadingContatos } = useContatoData(activeChatIds)
    
    // Cache inteligente - marca chats que não existem no CRM para evitar requisições repetidas
    const [tagsCache, setTagsCache] = useState<{[chatId: string]: any[]}>({})
    const [processedChats, setProcessedChats] = useState<Set<string>>(new Set())
    
    // Função para buscar tags de um chatId específico - com cache inteligente
    const fetchTagsForChat = useCallback(async (chatId: string) => {
      // Debug para comparar com ChatArea
      if (chatId === 'Parceiros FloriculturaWeb' || chatId.includes('Parceiros') || chatId.includes('Floricultura')) {
        console.log('🔍 [SIDEBAR DEBUG] Buscando tags para Parceiros FloriculturaWeb:', chatId)
      }
      
      // Se já temos dados no cache E não é debug, não fazer nova requisição
      if (processedChats.has(chatId) && tagsCache[chatId]) {
        return
      }
      
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        
        // Marcar como processado ANTES da requisição para evitar duplicatas
        setProcessedChats(prev => new Set(prev).add(chatId))
        
        // Primeiro verificar se é um contato CRM válido
        const contatoResponse = await fetch(`/api/contatos/${chatId}/dados-completos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!contatoResponse.ok) {
          // Chat não existe no CRM - marcar com array vazio e não tentar mais
          setTagsCache(prev => ({ ...prev, [chatId]: [] }))
          return
        }
        
        const contatoData = await contatoResponse.json()
        
        console.log('🏷️ [SIDEBAR] contatoData recebido:', contatoData)
        console.log('🏷️ [SIDEBAR] contatoData.tags:', contatoData.tags)
        
        if (contatoData.isWhatsAppChat) {
          // Chat WAHA sem contato CRM, sem tags
          setTagsCache(prev => ({ ...prev, [chatId]: [] }))
          return
        }
        
        // Verificar se as tags já vêm nos dados do contato
        if (contatoData.tags && Array.isArray(contatoData.tags)) {
          console.log('✅ [SIDEBAR] Tags encontradas nos dados do contato!')
          setTagsCache(prev => ({ ...prev, [chatId]: contatoData.tags }))
          return
        }
        
        // Só buscar tags se for um contato CRM válido
        const response = await fetch(`/api/contatos/${chatId}/tags`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          const tags = data.data || data || []
          setTagsCache(prev => ({ ...prev, [chatId]: tags }))
        } else {
          setTagsCache(prev => ({ ...prev, [chatId]: [] }))
        }
      } catch (error) {
        console.error(`❌ [SIDEBAR-CACHE] Erro ao buscar tags para ${chatId}:`, error)
        setTagsCache(prev => ({ ...prev, [chatId]: [] }))
      }
    }, [processedChats])
    
    // Função para forçar refresh das tags (para debug/troubleshooting)
    const forceRefreshTags = useCallback((chatId?: string) => {
      if (chatId) {
        // Refresh de chat specific
        setProcessedChats(prev => {
          const newSet = new Set(prev)
          newSet.delete(chatId)
          return newSet
        })
        fetchTagsForChat(chatId)
      } else {
        // Refresh geral
        setProcessedChats(new Set())
        setTagsCache({})
        activeChatIds.slice(0, 10).forEach(id => fetchTagsForChat(id)) // Refresh primeiros 10
      }
    }, [fetchTagsForChat, activeChatIds])
    
    // DEBUG: Expor função no window para troubleshooting
    useEffect(() => {
      if (typeof window !== 'undefined') {
        (window as any).forceRefreshTags = forceRefreshTags
      }
    }, [forceRefreshTags])
    
    // OTIMIZAÇÃO: Buscar tags dos chats visíveis com refresh automático
    useEffect(() => {
      // Buscar tags para chats visíveis imediatamente
      const visibleChats = activeChatIds.slice(0, Math.min(50, activeChatIds.length))
      
      visibleChats.forEach(chatId => {
        if (chatId.trim() !== '') {
          fetchTagsForChat(chatId)
        }
      })
      
      // Buscar restante após delay para não sobrecarregar
      const remainingChats = activeChatIds.slice(50)
      if (remainingChats.length > 0) {
        setTimeout(() => {
          remainingChats.forEach(chatId => {
            if (chatId.trim() !== '') {
              fetchTagsForChat(chatId)
            }
          })
        }, 2000) // 2s delay para resto
      }
    }, [activeChatIds, fetchTagsForChat])
    
    // Limpar cache quando chatIds mudam (novo carregamento)
    useEffect(() => {
      if (chatIds.length === 0) {
        setProcessedChats(new Set())
        setTagsCache({})
      }
    }, [chatIds.length])
    
    // Handler do scroll com infinite scroll ativo
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      
      if (useInfiniteScroll && infiniteScrollHandler) {
        infiniteScrollHandler(e.currentTarget)
      } else {
      }
    }, [useInfiniteScroll, infiniteScrollHandler])

      // Função para encontrar a fila de um chat baseado nas conexões
      const getChatQueue = useCallback((chatId: string) => {
      
        
      // MODULATION ESPECÍFICA do console:
      const expectedSelectedChats = ["120363401035050552@c.us", "120363419442598806@g.us", "2349162389789@c.us"]
      const expectedSelectedFilas = ["54b783db-2810-46ac-86b8-35758631d98b", "89d98687-ff0c-4f23-8bb4-b706422adbc3"]
      
    
      // Primeiro, tentar encontrar pela conexão (vinculação do modal de conexões)
      for (const conexao of conexoes) {
        
        
        const selectedChats = conexao.modulation?.selectedChats || []
        
        
        if (conexao.modulation?.selectedChats?.includes(chatId)) {
          
          // Chat está vinculado a esta conexão, buscar a fila
          const filaId = conexao.modulation.selectedFilas?.[0] // Pegar primeira fila selecionada
          
          if (filaId) {
            const fila = filas.find(f => f.id === filaId)
            
            if (fila) {
              return fila
            }
          }
        } else {
        }
      }
      
      // Se não encontrar pela conexão, usar dados do contato do cache (fallback)
      const contatoData = contatosData[chatId] || null
      const filaFallback = contatoData?.fila || null
      
      // Se ainda não encontrou, tentar usar a primeira fila disponível como fallback temporário
      if (!filaFallback && filas.length > 0) {
        return filas[0] // Fallback temporário para debug
      }
      
      return filaFallback
    }, [conexoes, filas, contatosData])

    // Função para buscar atendentes de uma fila específica
    const getAtendentesFromFila = useCallback((filaId: string) => {
      return atendentes.filter(atendente => 
        atendente.filas?.some(fila => fila.id === filaId) || 
        atendente.fila?.id === filaId
      ).slice(0, 3) // Limitar a 3 atendentes para não sobrecarregar
    }, [atendentes])

    // DEBUG: Verificar filteredConversations
   
    
    // OTIMIZAÇÃO CRÍTICA: Processar todos os chats (limitação será feita na renderização)
    const conversations = useMemo(() => activeChats.map(chat => {
      const chatId = chat.id?._serialized || chat.id || ''
      const name = getContactName(chat, activeContacts, contatosData)
      const lastMessage = getLastMessage(chat)
      
      // Buscar dados do backend para este chat
      const contatoData = contatosData[chatId]
      
      // Aplicar fallback da fila usando a nova lógica que considera conexões
      const chatQueue = getChatQueue(chatId)
      
      
      // Buscar tags do cache - igual ao ChatArea
      const contatoTags = tagsCache[chatId] || []
      
      // Buscar dados do agente do cache
      const agenteData = agentesCache[chatId]
      const agenteAtivo = agenteData?.ativo && agenteData?.agente
      
      // Buscar dados de conexão/fila do cache
      const conexaoFilaData = conexaoFilaCache[chatId]
      
      return {
        id: chatId,
        name: name || chat.name || 'Sem nome',
        lastMessage: lastMessage,
        timestamp: formatTimestamp(chat.timestamp),
        unread: chat.unreadCount || 0,
        status: 'offline',
        avatar: chat.profilePicUrl || chat.profilePictureUrl,
        type: chat.isGroup ? 'group' : 'individual',
        
        // Dados reais do contato - usando tags do cache igual ao ChatArea
        tags: Array.isArray(contatoTags) ? contatoTags : [],
        queue: chatQueue, // Usar a nova lógica que considera conexões
        atendente: agenteAtivo ? agenteData.agente : null, // Usar dados reais do agente
        kanbanBoard: kanbanInfo[chatId]?.quadro !== 'Sem quadro' ? `${kanbanInfo[chatId]?.quadro} • ${kanbanInfo[chatId]?.coluna}` : null,
        orcamento: contatoData?.orcamento || null,
        agendamento: contatoData?.agendamento || null,
        
        // Dados de conexão/fila - igual ao card do kanban
        conexaoFila: conexaoFilaData || null,
        
        // Badge do kanban se existir
        badge: contatoData?.kanbanBoard ? {
          text: contatoData.kanbanBoard,
          color: chatQueue?.cor || '#6b7280',
          backgroundColor: chatQueue?.cor || '#6b7280'
        } : null,
        
        isPinned: false, // TODO: Implementar campo no backend
        isArchived: archivedChats.has(chatId), // Estado local de arquivados
        hasReply: chat.lastMessage !== 'Nova conversa' && chat.lastMessage !== 'Sem mensagens',
        originalChat: chat
      }
    }), [activeChats, contatosData, tagsCache, conexoes, filas, atendentes, kanbanInfo, agentesCache, conexaoFilaCache])

    // OTIMIZAÇÃO: Carregar informações dos agentes para 30 chats visíveis
    useEffect(() => {
      const loadAgentesInfo = async () => {
        // Carregar para os primeiros 30 chats (suficiente para badges visíveis)
        const visibleChats = activeChats.slice(0, 30)
        
        for (const chat of visibleChats) {
          const chatId = chat.id?._serialized || chat.id || ''
          if (chatId) {
            fetchAgenteForChat(chatId)
          }
        }
      }
      
      if (activeChats.length > 0) {
        loadAgentesInfo()
      }
    }, [activeChats])

    // OTIMIZAÇÃO: Carregar informações de conexão/fila para 30 chats visíveis 
    useEffect(() => {
      const loadConexaoFilaInfo = async () => {
        // Carregar para os primeiros 30 chats (suficiente para badges visíveis)
        const visibleChats = activeChats.slice(0, 30)
        
        for (const chat of visibleChats) {
          const chatId = chat.id?._serialized || chat.id || ''
          if (chatId) {
            fetchConexaoFilaForChat(chatId)
          }
        }
      }
      
      if (activeChats.length > 0) {
        loadConexaoFilaInfo()
      }
    }, [activeChats])

    // OTIMIZAÇÃO: Carregar informações do Kanban com carregamento paralelo otimizado
    useEffect(() => {
      const loadKanbanInfo = async () => {
        // Carregar mais chats + buffer de performance
        const chatsToLoad = activeChats.slice(0, Math.min(visibleChatsCount + 30, 100))
        
        // Carregamento PARALELO dos primeiros 20 (mais rápido)
        const immediateChats = chatsToLoad.slice(0, 20)
        const immediatePromises = immediateChats.map(async (chat) => {
          const chatId = chat.id._serialized || chat.id
          const info = await getKanbanInfo(chatId)
          return { chatId, info }
        })
        
        // Executar todos em paralelo
        const immediateResults = await Promise.allSettled(immediatePromises)
        const newKanbanInfo: {[key: string]: any} = {}
        
        immediateResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const { chatId, info } = result.value
            newKanbanInfo[chatId] = info
          }
        })
        
        setKanbanInfo(newKanbanInfo)
        
        // Carregar restante após delay (não bloqueia UI)
        const remainingChats = chatsToLoad.slice(20)
        if (remainingChats.length > 0) {
          setTimeout(async () => {
            const remainingPromises = remainingChats.map(async (chat) => {
              const chatId = chat.id._serialized || chat.id
              const info = await getKanbanInfo(chatId)
              return { chatId, info }
            })
            
            const remainingResults = await Promise.allSettled(remainingPromises)
            const additionalKanbanInfo: {[key: string]: any} = {}
            
            remainingResults.forEach((result) => {
              if (result.status === 'fulfilled') {
                const { chatId, info } = result.value
                additionalKanbanInfo[chatId] = info
              }
            })
            
            // Merge com dados existentes
            setKanbanInfo(prev => ({ ...prev, ...additionalKanbanInfo }))
          }, 1500) // 1.5s delay
        }
      }
      
      if (activeChats.length > 0) {
        loadKanbanInfo()
      }
    }, [activeChats, visibleChatsCount])

    // Memoizar cálculo dos filtros para evitar recálculos custosos
    const filters = useMemo(() => [
      { id: 'all', label: 'Todas', icon: MessageCircle, count: conversations.filter(c => c.type !== 'group' && !c.isArchived).length },
      { id: 'unread', label: 'Não lidas', icon: Circle, count: conversations.filter(c => c.unread > 0 && c.type !== 'group' && !c.isArchived).length },
      { id: 'read', label: 'Lidas', icon: CheckCircle2, count: conversations.filter(c => c.unread === 0 && c.type !== 'group' && !c.isArchived).length },
      { id: 'read-no-reply', label: 'Lidas não respondidas', icon: Clock, count: conversations.filter(c => c.unread === 0 && c.type !== 'group' && !c.isArchived && !c.hasReply).length },
      { id: 'em-aberto', label: 'Em aberto', icon: Tag, count: conversations.filter(c => c.type !== 'group' && !c.isArchived && (!Array.isArray(c.tags) || c.tags.length === 0)).length },
      { id: 'archived', label: 'Arquivados', icon: Archive, count: conversations.filter(c => c.isArchived).length },
      { id: 'groups', label: 'Grupos', icon: Users, count: conversations.filter(c => c.type === 'group' && !c.isArchived).length },
    ], [conversations])

    // Aplicação dos filtros - OTIMIZADA com early returns para melhor performance
    const filteredConversations = useMemo(() => {
      // Se usar infinite scroll, usar os chats do hook ao invés das props
      const sourceConversations = useInfiniteScroll ? conversations : conversations
      
      // DEDUPLIFICAR primeiro para evitar chaves duplicadas no React
      const deduplicatedConversations = sourceConversations.reduce((acc: any[], conv) => {
        if (!acc.find(existing => existing.id === conv.id)) {
          acc.push(conv)
        }
        return acc
      }, [])
      
      return deduplicatedConversations.filter(conv => {
        // Early return: Filtro de busca - mais eficiente quando há searchQuery
        if (searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase()
          const matchesSearch = conv.name.toLowerCase().includes(searchLower) ||
                              conv.lastMessage.toLowerCase().includes(searchLower)
          if (!matchesSearch) return false
        }
        
        // NOVO: Filtrar canais do WhatsApp e chats especiais
        const chatId = conv.originalChat?.id?._serialized || conv.originalChat?.id || ''
        const phoneNumber = chatId.includes('@') ? chatId.split('@')[0] : chatId.replace(/\D/g, '')
        const isWhatsAppChannel = phoneNumber && phoneNumber.length > 15
        
        // Filtrar chat de status (+status)
        const isStatusChat = chatId.includes('status') || conv.name === '+status' || conv.name.toLowerCase().includes('status')
        
        if (isStatusChat) {
          return false // Remove chats de status
        }
        
        if (isWhatsAppChannel && !advancedFilters.showChannels) {
          return false // Remove canais da lista apenas se showChannels estiver false
        }
        
        // Early return: Filtros básicos - otimizados com condições específicas
        switch (activeFilter) {
          case 'all':
            if (conv.type === 'group' || conv.isArchived) return false
            break
          case 'unread':
            if (conv.unread <= 0 || conv.type === 'group' || conv.isArchived) return false
            break
          case 'read':
            if (conv.unread > 0 || conv.type === 'group' || conv.isArchived) return false
            break
          case 'read-no-reply':
            if (conv.unread > 0 || conv.type === 'group' || conv.isArchived || conv.hasReply) return false
            break
          case 'em-aberto':
            if (conv.type === 'group' || conv.isArchived || (Array.isArray(conv.tags) && conv.tags.length > 0)) return false
            break
          case 'archived':
            if (!conv.isArchived) return false
            break
          case 'groups':
            if (conv.type !== 'group' || conv.isArchived) return false
            break
        }
        
        // Early return: FILTRO por fila - mais eficiente
        if (selectedQueue !== 'todas' && conv.queue?.id !== selectedQueue) {
          return false
        }
        
        // Early return: Filtro por tag  
        if (selectedTag !== 'todas') {
          if (!conv.tags || !conv.tags.some((tag: any) => tag.id === selectedTag)) {
            return false
          }
        }
        
        // Early return: Filtro por ticket
        if (selectedTicket !== 'todos') {
          // Verifica se a conversa tem um ticket associado com o ID selecionado
          if (!conv.ticketId || conv.ticketId !== selectedTicket) {
            return false
          }
        }
        
        // Early return: Filtros avançados - só verifica se necessário
        if (advancedFilters.showHidden) {
          if (!hiddenChats.has(conv.id)) return false
        } else {
          if (hiddenChats.has(conv.id)) return false
        }
        
        // Filtro de favoritos
        if (advancedFilters.showFavorites) {
          if (!favoriteChats.has(conv.id)) return false
        }
        
        if (advancedFilters.selectedQueues.length > 0) {
          if (!conv.queue || !advancedFilters.selectedQueues.includes(conv.queue.id)) return false
        }
        
        if (advancedFilters.selectedTags.length > 0) {
          if (!conv.tags || !conv.tags.some((tag: any) => advancedFilters.selectedTags.includes(tag.id))) return false
        }
        
        if (advancedFilters.selectedKanbans.length > 0) {
          if (!conv.kanbanBoard) return false
          // O kanbanBoard é string "Quadro • Coluna", extrair o nome do quadro
          const quadroNome = conv.kanbanBoard.split(' • ')[0]
          const selectedQuadroNames = advancedFilters.selectedKanbans.map(id => 
            quadros.find(q => q.id === id)?.nome
          ).filter(Boolean)
          if (!selectedQuadroNames.includes(quadroNome)) return false
        }
        
        if (advancedFilters.selectedAtendentes.length > 0) {
          if (!conv.atendente || !advancedFilters.selectedAtendentes.includes(conv.atendente.id)) return false
        }
        
        return true
      }).sort((a, b) => {
        // Ordenação otimizada - evita recálculos desnecessários
        switch (sortBy) {
          case 'recent':
            const timestampB = new Date(b.originalChat?.timestamp || 0).getTime()
            const timestampA = new Date(a.originalChat?.timestamp || 0).getTime()
            return timestampB - timestampA
          case 'oldest':
            const timestampA2 = new Date(a.originalChat?.timestamp || 0).getTime()
            const timestampB2 = new Date(b.originalChat?.timestamp || 0).getTime()
            return timestampA2 - timestampB2
          case 'budget_high':
            const budgetB = parseFloat(b.orcamento?.valor || '0')
            const budgetA = parseFloat(a.orcamento?.valor || '0')
            return budgetB - budgetA
          case 'budget_low':
            const budgetA3 = parseFloat(a.orcamento?.valor || '0')
            const budgetB3 = parseFloat(b.orcamento?.valor || '0')
            return budgetA3 - budgetB3
          case 'name':
            return b.name.localeCompare(a.name) // Z-A (decrescente)
          case 'name_asc':
            return a.name.localeCompare(b.name) // A-Z (crescente)
          case 'tag':
            const tagA = a.tags?.[0]?.nome || ''
            const tagB = b.tags?.[0]?.nome || ''
            return tagB.localeCompare(tagA) // Z-A (decrescente)
          case 'tag_asc':
            const tagA2 = a.tags?.[0]?.nome || ''
            const tagB2 = b.tags?.[0]?.nome || ''
            return tagA2.localeCompare(tagB2) // A-Z (crescente)
          case 'ticket':
            const ticketA = a.originalChat?.id || ''
            const ticketB = b.originalChat?.id || ''
            return ticketB.localeCompare(ticketA) // Z-A (decrescente)
          case 'ticket_asc':
            const ticketA2 = a.originalChat?.id || ''
            const ticketB2 = b.originalChat?.id || ''
            return ticketA2.localeCompare(ticketB2) // A-Z (crescente)
          default:
            return 0
        }
      })
    }, [conversations, searchQuery, activeFilter, selectedQueue, selectedTag, advancedFilters, hiddenChats, sortBy])
    
    // DEBUG: Log conversas filtradas
   
    // Redefinir handleLoadMoreChats após filteredConversations estar disponível
    useEffect(() => {
      const newHandleLoadMoreChats = () => {
        setVisibleChatsCount(prev => {
          const totalFiltered = filteredConversations.length
          const newCount = Math.min(prev + 10, totalFiltered)
          console.log(`🔄 [ConversationSidebar] Carregando mais chats... ${prev} → ${newCount} (total: ${totalFiltered})`)
          return newCount
        })
        
        // Se há loadMoreChats das props, também chama ela
        if (loadMoreChats) {
          loadMoreChats()
        }
      }
      
      setHandleLoadMoreChats(() => newHandleLoadMoreChats)
    }, [filteredConversations.length, loadMoreChats])

    // OTIMIZAÇÃO: Polling de presença TOTALMENTE DESABILITADO com 800+ chats
    // const pollingChatIds = filteredConversations.slice(0, 5).map(conv => conv.id)
    
    // usePresencePolling({
    //   chatIds: pollingChatIds,
    //   enabled: false, // DESABILITADO para performance
    //   interval: 60000 // 60 segundos
    // })

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
        style={{
          '--scrollbar-thumb': 'linear-gradient(45deg, #0070f3, #00c9ff)',
          '--scrollbar-track': 'rgba(148, 163, 184, 0.1)'
        } as React.CSSProperties}
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
              {/* Filtro de Tickets */}
              <motion.div 
                className="relative mr-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-ticket-dropdown
              >
                <div className="relative bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-[1px] rounded-lg shadow-lg">
                  <motion.button
                    ref={ticketButtonRef}
                    onClick={() => {
                      setShowTicketDropdown(!showTicketDropdown)
                      if (!showTicketDropdown) updateDropdownPosition(ticketButtonRef, setTicketDropdownPosition)
                    }}
                    className="bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 min-w-[120px] hover:bg-accent transition-colors border border-border"
                  >
                    <Ticket className="w-3 h-3 text-purple-400" />
                    <span className="text-sm font-medium text-foreground flex-1 text-left">
                      {ticketOptions.find(t => t.value === selectedTicket)?.label}
                    </span>
                    <motion.div
                      animate={{ rotate: showTicketDropdown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
              <div className="flex items-center gap-3">
              {/* Select Conexão Elegante - OCULTO por enquanto */}
              <motion.div 
                className="relative hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-conexao-dropdown
              >
                <div className="relative bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 p-[1px] rounded-lg shadow-lg">
                  <motion.button
                    ref={conexaoButtonRef}
                    onClick={() => setShowConexaoDropdown(!showConexaoDropdown)}
                    className="bg-card/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 min-w-[140px] hover:bg-accent transition-colors border border-border"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full" />
                    <span className="text-sm font-medium text-foreground flex-1 text-left">
                      {conexaoOptions.find(c => c.value === selectedConexao)?.label}
                    </span>
                    <motion.div
                      animate={{ rotate: showConexaoDropdown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Select Filas Elegante - OCULTO para atendentes */}
              {typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard/atendente/') && (
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  data-queue-dropdown
                >
                <div className="relative bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 p-[1px] rounded-lg shadow-lg">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/40 border border-slate-600/50 rounded-xl shadow-sm backdrop-blur-sm min-w-32">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full" />
                    <span className="text-sm font-medium text-foreground flex-1 text-left">
                      {queueOptions.find(q => q.value === selectedQueue)?.label || 'Minha Fila'}
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Conectado" />
                  </div>
                </div>
              </motion.div>
              )}
              
              {/* Indicador da fila do atendente (apenas para atendentes) */}
              {typeof window !== 'undefined' && window.location.pathname.includes('/dashboard/atendente/') && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-400">
                    Fila: {queueOptions.find(q => q.value === selectedQueue)?.label || 'Conectado'}
                  </span>
                </div>
              )}
              
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
              
              {/* Filtros Avançados Toggle - OCULTO para atendentes */}
              {typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard/atendente/') && (
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
                  advancedFilters.showHidden ||
                  advancedFilters.showFavorites ||
                  advancedFilters.showChannels) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                )}
              </motion.button>
              )}

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
            <div className="bg-card/50 p-1 rounded-xl backdrop-blur-sm border border-border/30 relative z-[10]">
              <div 
                className="flex gap-1 overflow-x-scroll pb-1 cursor-grab active:cursor-grabbing"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
                onMouseDown={(e) => {
                  const container = e.currentTarget as HTMLDivElement;
                  const startX = e.pageX - container.offsetLeft;
                  const scrollLeft = container.scrollLeft;
                  const handleMouseMove = (e: MouseEvent) => {
                    const x = e.pageX - container.offsetLeft;
                    const walk = (x - startX) * 2;
                    container.scrollLeft = scrollLeft - walk;
                  };
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                  e.preventDefault();
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {filters.map((filter) => (
                  <motion.button
                    key={filter.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 whitespace-nowrap min-w-fit ${
                      activeFilter === filter.id
                        ? 'bg-accent text-accent-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  >
                    <filter.icon className="w-4 h-4" />
                    <span>{filter.label}</span>
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
          </div>

          {/* Conversations List */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto scrollbar-paypal min-h-0"
            onScroll={handleScroll}
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
          {/* Skeleton Loading para primeiros carregamentos */}
          {activeLoading && filteredConversations.length === 0 && (
            <ConversationListSkeleton count={8} />
          )}
          
          <AnimatePresence mode="popLayout">
            {filteredConversations.slice(0, visibleChatsCount).map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
                onClick={() => handleChatClick(conversation)}
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
                    
                    {/* Presence Status Indicator - Temporariamente desabilitado */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-gray-400">
                      <WifiOff className="w-2 h-2 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{conversation.name}</h3>
                        
                        {/* Indicador EM ABERTO */}
                        {typeof window !== 'undefined' && window.location.pathname.includes('/dashboard/atendente/') && isChatOpen(conversation) && !acceptedChats.has(conversation.id) && (
                          <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-500 border border-orange-500/30 rounded-full whitespace-nowrap">
                            EM ABERTO
                          </span>
                        )}
                        
                        {/* Indicador ATENDENDO (com timer) */}
                        {typeof window !== 'undefined' && window.location.pathname.includes('/dashboard/atendente/') && acceptedChats.has(conversation.id) && chatTimers[conversation.id] && (
                          <span className="px-2 py-1 text-xs bg-green-500/20 text-green-500 border border-green-500/30 rounded-full whitespace-nowrap">
                            ATENDENDO
                          </span>
                        )}
                      </div>
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
                            toggleArchiveConversation(conversation.id)
                          }}
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title="Arquivar conversa"
                        >
                          <Archive className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                        </motion.button>
                   
                        {/* Botão de Favoritar */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavoriteConversation(conversation.id)
                          }}
                          className="p-1 hover:bg-yellow-100 hover:text-yellow-600 rounded transition-colors"
                          title={favoriteChats.has(conversation.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        >
                          <Star className={`w-3 h-3 transition-colors ${
                            favoriteChats.has(conversation.id) 
                              ? 'text-yellow-500 fill-yellow-500' 
                              : 'text-muted-foreground hover:text-yellow-600'
                          }`} />
                        </motion.button>
                        
                        {/* Botão de Excluir */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteChat(conversation.id)
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
                    
                    {/* Informações da Fila, Conexão, Atendente e Tag */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {/* Conexão - igual ao card do kanban */}
                      {conversation.conexaoFila && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium" style={{
                          backgroundColor: conversation.conexaoFila.isConnected ? '#10b98120' : '#6b728020',
                          borderColor: conversation.conexaoFila.isConnected ? '#10b98140' : '#6b728040',
                          color: conversation.conexaoFila.isConnected ? '#10b981' : '#6b7280'
                        }} title={`Conexão: ${conversation.conexaoFila.conexao?.status || 'desconectada'} ${conversation.conexaoFila.conexao?.sessionName ? `(${conversation.conexaoFila.conexao.sessionName})` : ''}`}>
                          {conversation.conexaoFila.isConnected ? (
                            <Wifi className="w-3 h-3" />
                          ) : (
                            <WifiOff className="w-3 h-3" />
                          )}
                          <span>{conversation.conexaoFila.isConnected ? 'Conectado' : 'Desconectado'}</span>
                        </div>
                      )}
                      
                      {/* Fila */}
                      {conversation.queue && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border" style={{
                          backgroundColor: `${conversation.queue.cor}20`,
                          borderColor: `${conversation.queue.cor}40`
                        }}>
                          <Layers className="w-3 h-3" style={{ color: conversation.queue.cor }} />
                          <span className="text-xs font-medium" style={{ color: conversation.queue.cor }}>
                            {conversation.queue.nome}
                          </span>
                        </div>
                      )}
                      
                      {/* DEBUG TEMPORÁRIO - Quadro Kanban */}
                      {(() => {
                        const chatId = conversation.id
                        const contatoData = contatosData[chatId]
                       
                        
                        if (conversation.kanbanBoard) {
                          return (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border bg-purple-500/20 border-purple-400/40">
                              <Layers className="w-3 h-3 text-purple-500" />
                              <span className="text-xs font-medium text-purple-500">
                                {conversation.kanbanBoard}
                              </span>
                            </div>
                          )
                        }
                        return null
                      })()}

                      {/* DEBUG TEMPORÁRIO - Agente Ativo */}
                      {conversation.atendente && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border bg-blue-500/20 border-blue-400/40">
                          <User className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-medium text-blue-500">
                            {conversation.atendente.nome || 'Agente'}
                          </span>
                        </div>
                      )}

                      {/* Tag Principal */}
                      {(() => {
                        // DEBUG: Log para verificar estrutura das tags
                        
                        if (Array.isArray(conversation.tags) && conversation.tags.length > 0) {
                          return (
                            <div className="flex items-center gap-1 flex-wrap">
                              {conversation.tags.map((tag: any, index: number) => {
                                const tagColor = tag.cor || '#6b7280'
                                return (
                                  <div 
                                    key={tag.id || index}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-md border" 
                                    style={{
                                      backgroundColor: `${tagColor}20`,
                                      borderColor: `${tagColor}40`
                                    }}
                                  >
                                    <Tag className="w-3 h-3" style={{ color: tagColor }} />
                                    <span className="text-xs font-medium" style={{ color: tagColor }}>
                                      {tag.nome}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          )
                        } else {
                          // Exibir "Em aberto" quando não tem tags
                          return (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border" style={{
                              backgroundColor: '#f3f4f620',
                              borderColor: '#9ca3af40'
                            }}>
                              <Tag className="w-3 h-3" style={{ color: '#9ca3af' }} />
                              <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>
                                Em aberto
                              </span>
                            </div>
                          )
                        }
                      })()}
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      {/* Badges na posição principal - substituindo lastMessage */}
                      <div className="flex items-center gap-1 flex-1">
                        {/* Badge de Mensagens Não Lidas - PRIMEIRO */}
                        {(() => {
                          const chatId = conversation.id?._serialized || conversation.id || ''
                          // Dados reais ou mock para teste
                          let unreadCount = conversation.unreadCount || 0
                          
                          // FORÇAR UNREAD COUNT PARA TESTE - os primeiros chats terão mensagens não lidas
                          if (unreadCount === 0) {
                            const conversationIndex = Math.abs(chatId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 10
                            if (conversationIndex < 4) { // Primeiros 4 chats
                              unreadCount = [3, 7, 1, 15][conversationIndex] // Contadores variados
                            }
                          }
                          
                          return unreadCount > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-white rounded-full shadow-lg"
                              style={{ backgroundColor: '#273155' }}
                              title={`${unreadCount} mensagens não lidas`}
                            >
                              <span className="text-xs font-bold">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            </motion.div>
                          )
                        })()}
                        
                        {/* Badge Agendamento - Minimalista */}
                        {conversation.agendamento && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md border cursor-pointer"
                            style={{
                              backgroundColor: '#3b82f620',
                              borderColor: '#3b82f640'
                            }}
                            title={`${(conversation.agendamento as any).quantidade > 1 ? `${(conversation.agendamento as any).quantidade} agendamentos` : 'Agendamento'} - Último: ${conversation.agendamento.data ? new Date(conversation.agendamento.data).toLocaleDateString('pt-BR') : 'Sem data'}`}
                            onClick={() => {}}
                          >
                            <svg className="w-3 h-3" style={{ color: '#3b82f6' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium" style={{ color: '#3b82f6' }}>
                              {(() => {
                                if (!conversation.agendamento.data) return 'Agenda'
                                const date = new Date(conversation.agendamento.data)
                                return isNaN(date.getTime()) ? 'Agenda' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                              })()}
                            </span>
                          </motion.div>
                        )}
                        
                        {/* Badge Assinatura - Minimalista */}
                        {(() => {
                          const contatoData = contatosData[conversation.id?._serialized || conversation.id || '']
                          const assinatura = contatoData?.assinatura
                          return assinatura && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md border cursor-pointer"
                              style={{
                                backgroundColor: '#7c3aed20',
                                borderColor: '#7c3aed40'
                              }}
                              title={`${(assinatura as any).quantidade > 1 ? `${(assinatura as any).quantidade} assinaturas ativas` : 'Assinatura ativa'} - Plano: ${(assinatura as any).nomePlano} - ${new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(Number(assinatura.valor || 0))}`}
                              onClick={() => {}}
                            >
                              <svg className="w-3 h-3" style={{ color: '#7c3aed' }} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs font-medium" style={{ color: '#7c3aed' }}>
                                {(assinatura as any).nomePlano || 'Plano'}
                              </span>
                            </motion.div>
                          )
                        })()}
                        
                        {/* Badge Tickets - Exibe Nome e Status */}
                        {(() => {
                          const contatoData = contatosData[conversation.id?._serialized || conversation.id || '']
                          const tickets = contatoData?.tickets
                          if (!tickets || tickets.length === 0) return null
                          
                          // Pegar o ticket mais relevante (prioritário: ABERTO > outros status)
                          const ticketAtivo = tickets.find(t => t.status === 'ABERTO') || tickets[0]
                          const statusColor = ticketAtivo.status === 'ABERTO' ? '#ef4444' : 
                                            ticketAtivo.status === 'FECHADO' ? '#10b981' : '#f59e0b'
                          const statusBgColor = ticketAtivo.status === 'ABERTO' ? '#ef444420' : 
                                              ticketAtivo.status === 'FECHADO' ? '#10b98120' : '#f59e0b20'
                          const statusBorderColor = ticketAtivo.status === 'ABERTO' ? '#ef444440' : 
                                                  ticketAtivo.status === 'FECHADO' ? '#10b98140' : '#f59e0b40'
                          
                          return (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md border cursor-pointer max-w-[120px]"
                              style={{
                                backgroundColor: statusBgColor,
                                borderColor: statusBorderColor
                              }}
                              title={`${ticketAtivo.titulo || 'Sem título'} - Status: ${ticketAtivo.status}${tickets.length > 1 ? ` (+${tickets.length - 1} outros)` : ''}`}
                              onClick={() => {}}
                            >
                              <svg className="w-3 h-3 flex-shrink-0" style={{ color: statusColor }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-medium truncate" style={{ color: statusColor }}>
                                {ticketAtivo.titulo || 'Sem título'}
                              </span>
                              {tickets.length > 1 && (
                                <span className="text-xs font-bold ml-1" style={{ color: statusColor }}>
                                  +{tickets.length - 1}
                                </span>
                              )}
                            </motion.div>
                          )
                        })()}
                        
                        {/* Badge Orçamento - Minimalista */}
                        {conversation.orcamento && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md border cursor-pointer"
                            style={{
                              backgroundColor: '#10b98120',
                              borderColor: '#10b98140'
                            }}
                            title={`${(conversation.orcamento as any).quantidade > 1 ? `${(conversation.orcamento as any).quantidade} orçamentos` : 'Orçamento'} - Total: ${new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(Number(conversation.orcamento.valor || 0))}`}
                            onClick={() => console.log('ORÇAMENTO CLICADO')}
                          >
                            <svg className="w-3 h-3" style={{ color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium" style={{ color: '#10b981' }}>
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).format(Number(conversation.orcamento.valor || 0))}
                            </span>
                          </motion.div>
                        )}
                        
                        {/* Badge Rating - Avaliação do Cliente */}
                        {(() => {
                          const contatoData = contatosData[conversation.id?._serialized || conversation.id || '']
                          
                          // TESTE: Mock rating para os primeiros 3 chats para demonstração
                          const chatId = conversation.id?._serialized || conversation.id || ''
                          const mockRatings: {[key: string]: number} = {
                            // Adicione IDs reais dos seus chats aqui para testar
                          }
                          
                          // Rating real do banco ou mock para teste
                          let rating = contatoData?.rating || mockRatings[chatId]
                          
                          // FORÇAR RATING PARA TESTE - os primeiros 5 chats sempre terão rating
                          if (!rating) {
                            const conversationIndex = Math.abs(chatId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 10
                            if (conversationIndex < 5) { // Primeiros 5 chats
                              rating = [5, 4, 3, 4, 5][conversationIndex] // Ratings variados para demonstração
                            }
                          }
                          
                          return rating && rating > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md border cursor-pointer"
                              style={{
                                backgroundColor: rating >= 4 ? '#10b98120' : rating >= 3 ? '#f59e0b20' : '#ef444420',
                                borderColor: rating >= 4 ? '#10b98140' : rating >= 3 ? '#f59e0b40' : '#ef444440'
                              }}
                              title={`Avaliação: ${rating}/5 estrelas`}
                              onClick={() => {}}
                            >
                              <svg 
                                className="w-3 h-3" 
                                style={{ color: rating >= 4 ? '#10b981' : rating >= 3 ? '#f59e0b' : '#ef4444' }} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-xs font-medium" style={{ color: rating >= 4 ? '#10b981' : rating >= 3 ? '#f59e0b' : '#ef4444' }}>
                                {rating}/5
                              </span>
                              <span className="text-xs font-medium ml-1" style={{ color: rating >= 4 ? '#10b981' : rating >= 3 ? '#f59e0b' : '#ef4444' }}>
                                NCS
                              </span>
                            </motion.div>
                          )
                        })()}

                        {/* Badge do Kanban */}
                        {conversation.badge && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center px-2 py-1 text-white rounded-full font-medium shadow-sm flex-shrink-0"
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
                      
                      {/* LastMessage movida para a direita */}
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
          
          {/* Load More Trigger - Sempre ativo */}
          {visibleChatsCount < filteredConversations.length && (
            <div 
              ref={loadMoreTriggerRef}
              className="flex items-center justify-center py-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                />
                <span className="text-sm">Carregando mais chats...</span>
              </motion.div>
            </div>
          )}
          
          {/* Indicador de fim da lista */}
          {visibleChatsCount >= filteredConversations.length && filteredConversations.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <span className="text-sm">📄 Todos os chats carregados ({filteredConversations.length})</span>
              </motion.div>
            </div>
          )}
          
          {/* Scroll Infinito Original - Backup */}
          {useInfiniteScroll && hasMoreChats && false && (
            <div 
              className="flex items-center justify-center py-4"
            >
              {loadingMore ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                  />
                  <span className="text-sm font-medium">Carregando mais conversas...</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground px-4 py-2 rounded-full bg-accent/20"
                >
                  Role para carregar mais
                </motion.div>
              )}
            </div>
          )}
          
          {/* Indicador de fim da lista */}
          {useInfiniteScroll && !hasMoreChats && filteredConversations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center py-6 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-12 h-px bg-border"></div>
                <span>Todas as conversas carregadas</span>
                <div className="w-12 h-px bg-border"></div>
              </div>
            </motion.div>
          )}
          
          {/* Loading indicator para scroll infinito */}
          {useInfiniteScroll && activeLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Carregando mais conversas...</span>
              </div>
            </div>
          )}
          
          {/* Indicador de fim da lista */}
          {useInfiniteScroll && !hasMore && activeChats.length > 0 && (
            <div className="flex items-center justify-center py-4">
              <span className="text-xs text-muted-foreground">Todas as conversas foram carregadas</span>
            </div>
          )}
          
          {/* Loading More Skeleton - Infinite Scroll */}
          {useInfiniteScroll && loading && filteredConversations.length > 0 && (
            <div className="px-4 pb-4">
              <ConversationListSkeleton count={3} />
            </div>
          )}
          
          {/* Sentinel Element - Invisível, usado para detectar scroll */}
          {useInfiniteScroll && hasMore && (
            <div 
              ref={(el) => {
                if (el && setupIntersectionObserver) {
                  // Configurar Intersection Observer no elemento container
                  const container = el.closest('.scrollbar-custom')
                  if (container) {
                    setupIntersectionObserver(container as HTMLElement)
                  }
                  
                  // Observer para este elemento sentinel
                  const observer = new IntersectionObserver(
                    (entries) => {
                      const [entry] = entries
                      if (entry.isIntersecting && !loading && hasMore) {
                        console.log('🎯 Sentinel detectado! Carregando mais...')
                        loadMore()
                      }
                    },
                    { rootMargin: '50px' }
                  )
                  observer.observe(el)
                  
                  // Cleanup
                  return () => observer.disconnect()
                }
              }}
              className="h-2 w-full"
              style={{ minHeight: '1px' }}
            />
          )}

          {/* Load More Button - Fallback se não for infinite scroll */}
          {useInfiniteScroll && !loading && hasMore && (
            <div className="p-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadMore}
                className="w-full p-3 bg-accent/50 hover:bg-accent rounded-lg transition-colors text-sm font-medium text-muted-foreground"
              >
                Carregar mais conversas...
              </motion.button>
            </div>
          )}

            {/* Empty State */}
            {filteredConversations.length === 0 && !activeLoading && (
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

        </motion.div>
        

        {/* Dropdowns usando Portal */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {showConexaoDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 overflow-hidden z-[999999]"
                style={{
                  top: conexaoDropdownPosition.top,
                  left: conexaoDropdownPosition.left,
                  width: conexaoDropdownPosition.width || 140
                }}
                data-conexao-dropdown
              >
                <div className="py-1">
                  {conexaoOptions.map((option, index) => (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedConexao(option.value)
                        setShowConexaoDropdown(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-200 flex items-center gap-2 ${
                        selectedConexao === option.value ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 font-medium' : 'text-slate-300'
                      }`}
                    >
                      {selectedConexao === option.value && (
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full" />
                      )}
                      {selectedConexao !== option.value && <div className="w-2" />}
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            {showQueueDropdown && typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard/atendente/') && (
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
                className="fixed bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-700/50 overflow-hidden z-[999999] dropdown-portal"
                style={{
                  top: tagDropdownPosition.top,
                  left: tagDropdownPosition.left,
                  width: tagDropdownPosition.width || 100
                }}
                data-tag-dropdown
              >
                <div 
                  className="py-1 max-h-64 overflow-y-auto"
                  onWheel={(e) => e.stopPropagation()}
                >
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
            {showTicketDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="fixed z-[9999] bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl overflow-hidden dropdown-portal"
                style={{
                  top: ticketDropdownPosition.top,
                  left: ticketDropdownPosition.left,
                  minWidth: ticketDropdownPosition.width
                }}
              >
                <div 
                  className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent"
                  onWheel={(e) => e.stopPropagation()} // Previne propagação do scroll
                >
                  {ticketOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ backgroundColor: 'hsl(var(--accent))' }}
                      onClick={() => {
                        setSelectedTicket(option.value)
                        setShowTicketDropdown(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                        selectedTicket === option.value ? 'bg-accent text-accent-foreground' : 'hover:bg-accent'
                      }`}
                    >
                      <Ticket className="w-3 h-3 text-purple-400" />
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
            {showFilterModal && typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard/atendente/') && (
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

                    {/* Filtro de Favoritos */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAdvancedFilters(prev => ({ ...prev, showFavorites: !prev.showFavorites }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        advancedFilters.showFavorites
                          ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300' 
                          : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        advancedFilters.showFavorites ? 'bg-yellow-400' : 'bg-slate-500'
                      }`} />
                      <span className="flex-1 text-left">
                        {advancedFilters.showFavorites ? 'Mostrando apenas favoritos' : 'Filtrar por favoritos'}
                      </span>
                      <Star className={`w-4 h-4 ${
                        advancedFilters.showFavorites ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'
                      }`} />
                    </motion.button>

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
                        {quadros.filter(quadro => quadro.ativo).map((quadro) => (
                          <motion.button
                            key={quadro.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setAdvancedFilters(prev => ({
                                ...prev,
                                selectedKanbans: prev.selectedKanbans.includes(quadro.id)
                                  ? prev.selectedKanbans.filter(k => k !== quadro.id)
                                  : [...prev.selectedKanbans, quadro.id]
                              }))
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              advancedFilters.selectedKanbans.includes(quadro.id)
                                ? 'bg-orange-500/20 border-orange-400/50 text-orange-300' 
                                : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30'
                            }`}
                          >
                            <div 
                              className={`w-2 h-2 rounded-full`}
                              style={{ 
                                backgroundColor: advancedFilters.selectedKanbans.includes(quadro.id) 
                                  ? quadro.cor || '#fb923c' 
                                  : '#64748b' 
                              }}
                            />
                            <span className="flex-1 text-left">{quadro.nome}</span>
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
                        {atendentes.filter(atendente => atendente.ativo).map((atendente) => (
                          <motion.button
                            key={atendente.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setAdvancedFilters(prev => ({
                                ...prev,
                                selectedAtendentes: prev.selectedAtendentes.includes(atendente.id)
                                  ? prev.selectedAtendentes.filter(a => a !== atendente.id)
                                  : [...prev.selectedAtendentes, atendente.id]
                              }))
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              advancedFilters.selectedAtendentes.includes(atendente.id)
                                ? 'bg-green-500/20 border-green-400/50 text-green-300' 
                                : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/30'
                            }`}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              advancedFilters.selectedAtendentes.includes(atendente.id) ? 'bg-green-400' : 'bg-slate-500'
                            }`} />
                            <span className="flex-1 text-left">{atendente.nome}</span>
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
                            showFavorites: false,
                            showChannels: false,
                            selectedQueues: [],
                            selectedTags: [],
                            selectedKanbans: [],
                            selectedAtendentes: [],
                            dateRange: {
                              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
                              end: new Date()
                            },
                            messageCount: 100
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

        {/* Modal de Transferir Atendimento */}
        <TransferirAtendimentoModal
          isOpen={showTransferirModal}
          onClose={() => {
            setShowTransferirModal(false)
            setSelectedConversationForTransfer(null)
          }}
          onConfirm={async (transferData) => {
            console.log('🔄 [ConversationSidebar] Transferindo chat via modulation:', {
              chatId: selectedConversationForTransfer?.id,
              ...transferData
            })
            
            if (!selectedConversationForTransfer?.id) {
              console.error('❌ [ConversationSidebar] Chat ID não encontrado')
              throw new Error('Chat ID não encontrado')
            }

            if (!transferData.filaId) {
              console.error('❌ [ConversationSidebar] Fila não selecionada')
              throw new Error('Fila não selecionada')
            }
            
            try {
              const token = localStorage.getItem('token')
              if (!token) {
                console.error('❌ [ConversationSidebar] Token não encontrado')
                throw new Error('Token não encontrado')
              }

              // 1. Buscar modulation atual da conexão
              console.log('📡 [ConversationSidebar] Buscando modulation atual...')
              const connectionsResponse = await fetch('/api/connections/', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })

              if (!connectionsResponse.ok) {
                throw new Error('Erro ao buscar conexões')
              }

              const connectionsData = await connectionsResponse.json()
              const connections = connectionsData.connections || []
              
              // Encontrar a conexão WhatsApp atual
              const currentConnection = Array.isArray(connections) ? connections.find((conn: any) => 
                conn.platform === 'whatsapp' && conn.user_id
              ) : null

              if (!currentConnection) {
                throw new Error('Conexão WhatsApp não encontrada')
              }

              // 2. Obter modulation atual
              let modulation = { selectedChats: [], selectedFilas: [], selectedGrupos: [] }
              if (currentConnection.modulation) {
                modulation = typeof currentConnection.modulation === 'string' 
                  ? JSON.parse(currentConnection.modulation) 
                  : currentConnection.modulation
              }

              console.log('📋 [ConversationSidebar] Modulation atual:', modulation)

              // 3. Atualizar modulation - adicionar chat na nova fila
              if (!Array.isArray(modulation.selectedFilas)) {
                modulation.selectedFilas = []
              }
              
              // Adicionar nova fila se não existir
              if (!modulation.selectedFilas.includes(transferData.filaId)) {
                modulation.selectedFilas.push(transferData.filaId)
              }

              // Garantir que o chat está na lista de chats selecionados
              if (!Array.isArray(modulation.selectedChats)) {
                modulation.selectedChats = []
              }
              
              if (!modulation.selectedChats.includes(selectedConversationForTransfer.id)) {
                modulation.selectedChats.push(selectedConversationForTransfer.id)
              }

              console.log('📋 [ConversationSidebar] Modulation atualizada:', modulation)

              // 4. Salvar modulation atualizada
              console.log('📡 [ConversationSidebar] Atualizando conexão...')
              const updateResponse = await fetch(`/api/connections/whatsapp/${currentConnection.session_name}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(modulation)
              })

              console.log('📡 [ConversationSidebar] Update response status:', updateResponse.status)

              if (updateResponse.ok) {
                const result = await updateResponse.json()
                console.log('✅ [ConversationSidebar] Chat transferido com sucesso via modulation:', result)
                console.log('✅ [ConversationSidebar] Chat', selectedConversationForTransfer.id, 'movido para fila', transferData.filaId)
                setShowTransferirModal(false)
                setSelectedConversationForTransfer(null)
              } else {
                const errorText = await updateResponse.text()
                console.error('❌ [ConversationSidebar] Erro ao atualizar conexão:', updateResponse.statusText, errorText)
                throw new Error(`Erro ${updateResponse.status}: ${updateResponse.statusText}`)
              }
            } catch (error) {
              console.error('❌ [ConversationSidebar] Erro ao transferir via modulation:', error)
              throw error // Re-throw para o modal não fechar
            }
          }}
          chatId={selectedConversationForTransfer?.id}
          contactData={{
            nome: selectedConversationForTransfer?.name || '',
            telefone: selectedConversationForTransfer?.id?.replace('@c.us', '') || ''
          }}
        />
      
      {/* Modal de Aceitação do Chat */}
      {showAcceptModal && chatToAccept && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999999] flex items-center justify-center p-4"
          onClick={() => setShowAcceptModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-500" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aceitar Atendimento
              </h3>
              
              <p className="text-muted-foreground mb-6">
                Deseja aceitar o atendimento do chat <strong>{chatToAccept.name}</strong>?
                <br />
                <span className="text-sm text-orange-500 mt-2 block">
                  Status: EM ABERTO (sem tag/ticket)
                </span>
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAcceptModal(false)}
                  className="flex-1 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAcceptChat(chatToAccept)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Aceitar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      </motion.div>
    )
  }
