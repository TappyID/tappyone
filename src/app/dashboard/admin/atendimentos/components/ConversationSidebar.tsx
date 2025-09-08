'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  Layers,
  Kanban,
  Trash2,
  DollarSign,
  Calendar,
  Hash,
  Eye,
  EyeOff,
  X,
  Archive,
  ArrowRightLeft
} from 'lucide-react'
import { usePresencePolling } from '@/hooks/usePresencePolling'
import { useTags } from '@/hooks/useTags'
import { useFilas } from '@/hooks/useFilas'
import { useConexoes } from '@/hooks/useConexoes'
import { useAtendentes } from '@/hooks/useAtendentes'
import { useChatAgente } from '@/hooks/useChatAgente'
import { useContatoData } from '@/hooks/useContatoData'
import { useContatoTags } from '@/hooks/useContatoTags'
import TransferirAtendimentoModal from './modals/TransferirAtendimentoModal'
import { useInfiniteChats } from '@/hooks/useInfiniteChats'

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
  isQuickActionsSidebarOpen = false,
  useInfiniteScroll = true // Ativado por padrão
}: ConversationSidebarProps) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const { tags: realTags } = useTags()
  const { filas } = useFilas()
  const { conexoes, getFilasDaConexao } = useConexoes()
  const { atendentes } = useAtendentes()
  // const { isOnline, isTyping } = usePresence() // Hook removido para evitar erro
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Buscar dados reais dos contatos
  const chatIds = chats.map(chat => chat.id?._serialized || chat.id || '')
  // Estados do filtro em cascata
  const [selectedConexao, setSelectedConexao] = useState('todas')
  const [showConexaoDropdown, setShowConexaoDropdown] = useState(false)
  const [selectedQueue, setSelectedQueue] = useState('todas')
  
  // Debug: Log dados carregados
  console.log(`🔍 [SIDEBAR] activeFilter: ${activeFilter}`)
  console.log(`🔍 [SIDEBAR] selectedQueue: ${selectedQueue}`)
  console.log(`🔍 [SIDEBAR] Tags carregadas: ${realTags.length}`)
  console.log(`🔍 [SIDEBAR] Filas carregadas: ${filas.length}`)
  console.log(`🔗 [SIDEBAR] Conexões carregadas: ${conexoes.length}`)
  console.log(`🔍 [SIDEBAR] Filas dados:`, filas)
  console.log(`🔗 [SIDEBAR] Conexões dados:`, conexoes)
  
  // Auto-selecionar fila baseada na conexão quando dados carregam (APENAS UMA VEZ)
  const [hasAutoSelected, setHasAutoSelected] = useState(false)
  
  useEffect(() => {
    if (conexoes.length > 0 && filas.length > 0 && selectedQueue === 'todas' && !hasAutoSelected) {
      const conexaoAtiva = conexoes.find(conn => conn.platform === 'whatsapp' && conn.status === 'connected')
      
      if (conexaoAtiva?.modulation?.selectedFilas?.length > 0) {
        const filaId = conexaoAtiva.modulation.selectedFilas[0]
        const fila = filas.find(f => f.id === filaId)
        
        if (fila) {
          console.log(`🎯 [AUTO_SELECT] Auto-selecionando fila: ${fila.nome} (${fila.id})`)
          setSelectedQueue(fila.id)
          setHasAutoSelected(true) // Marcar que já foi feita a auto-seleção
        }
      }
    }
  }, [conexoes, filas, selectedQueue, hasAutoSelected])
  const [showQueueDropdown, setShowQueueDropdown] = useState(false)
  const [selectedTag, setSelectedTag] = useState('todas')
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [sortBy, setSortBy] = useState('recent')
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [connectionModulation, setConnectionModulation] = useState<any>(null)
  
  // Refs para dropdowns
  const conexaoButtonRef = useRef<HTMLButtonElement>(null)
  const [conexaoDropdownPosition, setConexaoDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [hiddenChats, setHiddenChats] = useState<Set<string>>(new Set())
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [archivedChats, setArchivedChats] = useState<Set<string>>(new Set())
  const [advancedFilters, setAdvancedFilters] = useState({
    showHidden: false,
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

      console.log('🔍 [MODULATION] Buscando modulation da conexão...')
      const response = await fetch('/api/connections/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const connections = data.connections || []
        
        console.log('🔗 [CONNECTIONS] GET route foi chamado!')
        console.log('📞 [CONNECTIONS] Fazendo requisição para backend: http://159.65.34.199:8081/api/connections')

        // Encontrar a conexão WhatsApp atual
        const currentConnection = connections.find((conn: any) => 
          conn.platform === 'whatsapp' && conn.user_id
        )

        console.log('🔍 [CONNECTIONS] Conexão encontrada:', currentConnection)
        console.log('🔍 [CONNECTIONS] Modulation raw:', currentConnection?.modulation)
        console.log('🔍 [CONNECTIONS] Modulation type:', typeof currentConnection?.modulation)

        if (currentConnection?.modulation) {
          const modulation = typeof currentConnection.modulation === 'string' 
            ? JSON.parse(currentConnection.modulation) 
            : currentConnection.modulation
          
          console.log('✅ [CONNECTIONS] Dados recebidos do backend:', {
            connections: [
              {
                id: 'dad31f0c-411a-409c-9787-24816efe9253',
                user_id: '3a24ed72-c9e2-460f-9ebd-9f02c4aa7d18',
                platform: 'whatsapp',
                status: 'connected',
                session_name: 'user_3a24ed72_1757352414251',
                modulation: modulation,
              },
            ],
          })
          console.log('🔍 [MODULATION] Modulation completa após parse:', JSON.stringify(modulation, null, 2))
          console.log('🔍 [MODULATION] selectedChats:', modulation?.selectedChats)
          console.log('🔍 [MODULATION] selectedFilas:', modulation?.selectedFilas)
          return modulation
        }
      }
      
      console.log('⚠️ [MODULATION] Nenhuma modulation encontrada')
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
  
  useEffect(() => {
    if (showConexaoDropdown) updateDropdownPosition(conexaoButtonRef, setConexaoDropdownPosition)
  }, [showConexaoDropdown])
  
  // Resetar conexão quando selecionar uma fila (filtro reverso)
  useEffect(() => {
    if (selectedQueue !== 'todas') {
      setSelectedConexao('todas')
    }
  }, [selectedQueue])

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-conexao-dropdown]')) {
        setShowConexaoDropdown(false)
      }
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
    
    if (showConexaoDropdown || showQueueDropdown || showTagDropdown || showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showConexaoDropdown, showQueueDropdown, showTagDropdown, showSortDropdown])

  
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

  // Função para arquivar chat
  const handleArchiveChat = (chatId: string) => {
    setArchivedChats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(chatId)) {
        newSet.delete(chatId) // Desarquivar se já estava arquivado
      } else {
        newSet.add(chatId) // Arquivar
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
      
      // Se 404, o endpoint não existe - apenas ocultar localmente
      if (response.status === 404) {
        console.warn('⚠️ Endpoint DELETE não implementado - ocultando localmente')
        setHiddenChats(prev => new Set(Array.from(prev).concat([chatId])))
        return
      }
      
      if (response.ok) {
        // Se deletou com sucesso, adicionar à lista de chats ocultos
        setHiddenChats(prev => new Set(Array.from(prev).concat([chatId])))
        
        // Opcional: mostrar notificação de sucesso
        console.log('Chat deletado com sucesso')
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
    loading: infiniteLoading, 
    hasMore, 
    loadMore, 
    refresh, 
    handleScroll: infiniteScrollHandler 
  } = useInfiniteChats()
  
  // Usar dados do infinite scroll se ativado, senão usar props
  const activeChats = useInfiniteScroll ? infiniteChats : chats
  const activeContacts = contacts 
  const activeLoading = useInfiniteScroll ? infiniteLoading : isLoading
  
  // Buscar dados reais dos contatos para fotos de perfil (sempre necessário)
  const activeChatIds = activeChats.map(chat => chat.id?._serialized || chat.id || '')
  const { contatos: contatosData, loading: loadingContatos } = useContatoData(activeChatIds)
  
  // Cache de tags por chatId - igual ao ChatArea para manter consistência
  const [tagsCache, setTagsCache] = useState<{[chatId: string]: any[]}>({})
  
  // Função para buscar tags de um chatId específico - igual ao ChatArea
  const fetchTagsForChat = useCallback(async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch(`/api/contatos/${chatId}/tags`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        const tags = data.data || data || []
        setTagsCache(prev => ({ ...prev, [chatId]: tags }))
        console.log(`🏷️ [SIDEBAR-CACHE] Tags para ${chatId}:`, tags)
      } else {
        setTagsCache(prev => ({ ...prev, [chatId]: [] }))
        console.log(`🏷️ [SIDEBAR-CACHE] Sem tags para ${chatId}`)
      }
    } catch (error) {
      console.error(`❌ [SIDEBAR-CACHE] Erro ao buscar tags para ${chatId}:`, error)
      setTagsCache(prev => ({ ...prev, [chatId]: [] }))
    }
  }, [])
  
  // Buscar tags para todos os chatIds ativos
  useEffect(() => {
    activeChatIds.forEach(chatId => {
      if (!tagsCache[chatId] && chatId.trim() !== '') {
        fetchTagsForChat(chatId)
      }
    })
  }, [activeChatIds, tagsCache, fetchTagsForChat])
  
  // Handler do scroll com infinite scroll ativo
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (useInfiniteScroll && infiniteScrollHandler) {
      infiniteScrollHandler(e.currentTarget)
    }
  }, [useInfiniteScroll, infiniteScrollHandler])

  // Função para encontrar a fila de um chat baseado nas conexões
  const getChatQueue = useCallback((chatId: string) => {
    console.log(`🔍 [GET_CHAT_QUEUE] === INICIANDO BUSCA PARA CHAT ${chatId} ===`)
    console.log(`🔍 [GET_CHAT_QUEUE] Conexões disponíveis:`, conexoes.length)
    console.log(`🔍 [GET_CHAT_QUEUE] Filas disponíveis:`, filas.length)
    
    // MODULATION ESPECÍFICA do console:
    const expectedSelectedChats = ["120363401035050552@c.us", "120363419442598806@g.us", "2349162389789@c.us"]
    const expectedSelectedFilas = ["54b783db-2810-46ac-86b8-35758631d98b", "89d98687-ff0c-4f23-8bb4-b706422adbc3"]
    
    console.log(`🎯 [DEBUG] Chat procurado: ${chatId}`)
    console.log(`🎯 [DEBUG] Está nos selectedChats esperados?`, expectedSelectedChats.includes(chatId))
    console.log(`🎯 [DEBUG] selectedChats esperados:`, expectedSelectedChats)
    
    // Primeiro, tentar encontrar pela conexão (vinculação do modal de conexões)
    for (const conexao of conexoes) {
      console.log(`🔍 [GET_CHAT_QUEUE] === VERIFICANDO CONEXÃO ${conexao.session_name} ===`)
      console.log(`🔍 [GET_CHAT_QUEUE] Modulation completa:`, JSON.stringify(conexao.modulation, null, 2))
      console.log(`🔍 [GET_CHAT_QUEUE] Chats selecionados na conexão:`, conexao.modulation?.selectedChats)
      console.log(`🔍 [GET_CHAT_QUEUE] Filas selecionadas na conexão:`, conexao.modulation?.selectedFilas)
      
      const selectedChats = conexao.modulation?.selectedChats || []
      console.log(`🎯 [DEBUG] selectedChats na conexão:`, selectedChats)
      console.log(`🎯 [DEBUG] Includes ${chatId}?`, selectedChats.includes(chatId))
      
      if (conexao.modulation?.selectedChats?.includes(chatId)) {
        console.log(`✅ [GET_CHAT_QUEUE] === MATCH ENCONTRADO! ===`)
        console.log(`✅ [GET_CHAT_QUEUE] Chat ${chatId} encontrado na conexão ${conexao.session_name}`)
        
        // Chat está vinculado a esta conexão, buscar a fila
        const filaId = conexao.modulation.selectedFilas?.[0] // Pegar primeira fila selecionada
        console.log(`🔍 [GET_CHAT_QUEUE] FilaId selecionada:`, filaId)
        
        if (filaId) {
          const fila = filas.find(f => f.id === filaId)
          console.log(`🔍 [GET_CHAT_QUEUE] Fila encontrada:`, fila?.nome)
          
          if (fila) {
            console.log(`✅ [GET_CHAT_QUEUE] === RESULTADO: Retornando fila ${fila.nome} para chat ${chatId} ===`)
            return fila
          }
        }
      } else {
        console.log(`❌ [GET_CHAT_QUEUE] Chat ${chatId} NÃO encontrado nos selectedChats desta conexão`)
      }
    }
    
    // Se não encontrar pela conexão, usar dados do contato do cache (fallback)
    const contatoData = contatosData[chatId] || null
    const filaFallback = contatoData?.fila || null
    
    console.log(`🔍 [GET_CHAT_QUEUE] Fallback para chat ${chatId}:`, filaFallback?.nome || 'sem fila')
    return filaFallback
  }, [conexoes, filas, contatosData])

  // Função para buscar atendentes de uma fila específica
  const getAtendentesFromFila = useCallback((filaId: string) => {
    return atendentes.filter(atendente => 
      atendente.filas?.some(fila => fila.id === filaId) || 
      atendente.fila?.id === filaId
    ).slice(0, 3) // Limitar a 3 atendentes para não sobrecarregar
  }, [atendentes])

  const conversations = chats.map(chat => {
    const chatId = chat.id?._serialized || chat.id || ''
    const name = getContactName(chat, contacts)
    const lastMessage = getLastMessage(chat)
    
    // Buscar dados do contato do cache
    const contatoData = contatosData[chatId] || null
    
    // Buscar tags do cache - igual ao ChatArea
    const contatoTags = tagsCache[chatId] || []
    
    // Buscar fila usando a nova lógica que considera conexões
    const chatQueue = getChatQueue(chatId)
    
    // Debug: Log dados do contato
    if (contatoData) {
      console.log(`🔍 [SIDEBAR] Dados do contato ${chatId}:`, {
        id: contatoData.id,
        tagsFromCache: contatoTags,
        tagsFromCacheLength: contatoTags?.length || 0,
        tagsFromCacheRaw: JSON.stringify(contatoTags),
        fila: contatoData.fila,
        chatQueue: chatQueue,
        hasQueue: !!chatQueue,
        orcamento: contatoData.orcamento,
        orcamentoValor: contatoData.orcamento?.valor,
        orcamentoValorTotal: (contatoData.orcamento as any)?.valorTotal,
        fullOrcamento: JSON.stringify(contatoData.orcamento),
        agendamento: contatoData.agendamento,
        agendamentoTitulo: (contatoData.agendamento as any)?.titulo,
        fullAgendamento: JSON.stringify(contatoData.agendamento)
      })
    } else {
      console.log(`⚠️ [SIDEBAR] Sem dados para contato ${chatId}`)
    }
    
    return {
      id: chatId,
      name,
      lastMessage: lastMessage === 'Sem mensagens' ? 'Nova conversa' : lastMessage,
      timestamp: formatTimestamp(chat.timestamp),
      unread: chat.unreadCount || 0,
      status: 'offline',
      avatar: chat.profilePicUrl || chat.profilePictureUrl,
      type: chat.isGroup ? 'group' : 'individual',
      
      // Dados reais do contato - usando tags do cache igual ao ChatArea
      tags: Array.isArray(contatoTags) ? contatoTags : [],
      queue: chatQueue, // Usar a nova lógica que considera conexões
      atendente: contatoData?.atendente || null,
      kanbanBoard: contatoData?.kanbanBoard || null,
      orcamento: contatoData?.orcamento || null,
      agendamento: contatoData?.agendamento || null,
      
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
    { id: 'all', label: 'Todas', icon: MessageCircle, count: conversations.filter(c => c.type !== 'group' && !c.isArchived).length },
    { id: 'unread', label: 'Não lidas', icon: Circle, count: conversations.filter(c => c.unread > 0 && c.type !== 'group' && !c.isArchived).length },
    { id: 'read', label: 'Lidas', icon: CheckCircle2, count: conversations.filter(c => c.unread === 0 && c.type !== 'group' && !c.isArchived).length },
    { id: 'read-no-reply', label: 'Lidas não respondidas', icon: Clock, count: conversations.filter(c => c.unread === 0 && c.type !== 'group' && !c.isArchived && !c.hasReply).length },
    { id: 'em-aberto', label: 'Em aberto', icon: Tag, count: conversations.filter(c => c.type !== 'group' && !c.isArchived && (!Array.isArray(c.tags) || c.tags.length === 0)).length },
    { id: 'archived', label: 'Arquivados', icon: Archive, count: conversations.filter(c => c.isArchived).length },
    { id: 'groups', label: 'Grupos', icon: Users, count: conversations.filter(c => c.type === 'group' && !c.isArchived).length },
  ]

  const filteredConversations = conversations.filter(conv => {
    // Filtro de busca
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    
    // DEBUG: Log para conversas importantes
    if (conv.name.includes('Vyzer') || conv.name.includes('Test')) {
      console.log(`🐛 [FILTER_DEBUG] ${conv.name}:`, {
        activeFilter,
        tags: conv.tags,
        hasValidTags: Array.isArray(conv.tags) && conv.tags.length > 0,
        type: conv.type,
        isArchived: conv.isArchived,
        selectedQueue,
        convQueue: conv.queue,
        matchesFilter: (activeFilter === 'all' && conv.type !== 'group' && !conv.isArchived) ||
                      (activeFilter === 'unread' && conv.unread > 0 && conv.type !== 'group' && !conv.isArchived) ||
                      (activeFilter === 'read' && conv.unread === 0 && conv.type !== 'group' && !conv.isArchived) ||
                      (activeFilter === 'read-no-reply' && conv.unread === 0 && conv.type !== 'group' && !conv.isArchived && !conv.hasReply) ||
                      (activeFilter === 'em-aberto' && conv.type !== 'group' && !conv.isArchived && (!Array.isArray(conv.tags) || conv.tags.length === 0)) ||
                      (activeFilter === 'archived' && conv.isArchived) ||
                      (activeFilter === 'groups' && conv.type === 'group' && !conv.isArchived)
      })
    }
    
    // Filtros básicos com suporte a arquivados e lidos não respondidos
    const matchesFilter = (activeFilter === 'all' && conv.type !== 'group' && !conv.isArchived) ||
                         (activeFilter === 'unread' && conv.unread > 0 && conv.type !== 'group' && !conv.isArchived) ||
                         (activeFilter === 'read' && conv.unread === 0 && conv.type !== 'group' && !conv.isArchived) ||
                         (activeFilter === 'read-no-reply' && conv.unread === 0 && conv.type !== 'group' && !conv.isArchived && !conv.hasReply) ||
                         (activeFilter === 'em-aberto' && conv.type !== 'group' && !conv.isArchived && (!Array.isArray(conv.tags) || conv.tags.length === 0)) ||
                         (activeFilter === 'archived' && conv.isArchived) ||
                         (activeFilter === 'groups' && conv.type === 'group' && !conv.isArchived)
    
    // FILTRO por fila - usar queue do chat, não modulation restritiva
    let matchesQueue = selectedQueue === 'todas'
    
    if (selectedQueue !== 'todas') {
      // Usar sempre o método baseado na queue do chat
      // A modulation é para filtrar dados no WhatsApp API, não na UI
      matchesQueue = conv.queue?.id === selectedQueue
      
      // DEBUG: Logs para entender o filtro por queue
      if (conv.name.includes('Test') || conv.name.includes('Vyzer')) {
        console.log(`🔎 [FILTRO QUEUE] Chat ${conv.name}:`, {
          chatId: conv.id,
          selectedQueue,
          chatQueueId: conv.queue?.id,
          matchesQueue
        })
      }
    }
    
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
            <h2 className="text-base font-semibold text-foreground mr-[10px]">Chats</h2>
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
          className="flex-1 overflow-y-auto scrollbar-custom"
          onScroll={handleScroll}
        >
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
                  
                  {/* Presence Status Indicator - Temporariamente desabilitado */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center bg-gray-400">
                    <WifiOff className="w-2 h-2 text-white" />
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
                          handleArchiveChat(conversation.id)
                        }}
                        className="p-1 hover:bg-accent rounded transition-colors"
                        title="Arquivar conversa"
                      >
                        <Archive className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                      </motion.button>
                      
                      {/* Botão de Transferir */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log('🔄 Transferir conversa:', conversation.id)
                          setSelectedConversationForTransfer(conversation)
                          setShowTransferirModal(true)
                        }}
                        className="p-1 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors"
                        title="Transferir atendimento"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-muted-foreground hover:text-blue-600" />
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
                  
                  {/* Informações da Fila, Atendente e Tag */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                    
                    {/* Atendente */}
                    {conversation.atendente && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border bg-blue-500/20 border-blue-400/40">
                        <User className="w-3 h-3 text-blue-500" />
                        <span className="text-xs font-medium text-blue-500">
                          {conversation.atendente.nome || 'Atendente'}
                        </span>
                      </div>
                    )}
                    
                    {/* Atendentes da Fila */}
                    {(() => {
                      if (conversation.queue?.id) {
                        const atendentesFromFila = getAtendentesFromFila(conversation.queue.id)
                        if (atendentesFromFila.length > 0) {
                          return (
                            <div className="flex items-center gap-1 flex-wrap">
                              {atendentesFromFila.map((atendente, index) => (
                                <div 
                                  key={atendente.id || index}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-md border bg-indigo-500/20 border-indigo-400/40" 
                                  title={`Atendente: ${atendente.nome}`}
                                >
                                  <User className="w-3 h-3 text-indigo-500" />
                                  <span className="text-xs font-medium text-indigo-500">
                                    {atendente.nome}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )
                        }
                      }
                      return null
                    })()}

                    {/* Tag Principal */}
                    {(() => {
                      console.log(`🏷️ [SIDEBAR] Conversa ${conversation.id} - Tags:`, conversation.tags)
                      console.log(`🏷️ [SIDEBAR] Conversa ${conversation.id} - Array.isArray:`, Array.isArray(conversation.tags))
                      console.log(`🏷️ [SIDEBAR] Conversa ${conversation.id} - Tags length:`, conversation.tags?.length)
                      console.log(`🏷️ [SIDEBAR] Conversa ${conversation.id} - Tags type:`, typeof conversation.tags)
                      
                      if (Array.isArray(conversation.tags) && conversation.tags.length > 0) {
                        console.log(`🏷️ [SIDEBAR] Exibindo ${conversation.tags.length} tags para ${conversation.id}:`, conversation.tags)
                        return (
                          <div className="flex items-center gap-1 flex-wrap">
                            {conversation.tags.map((tag: any, index: number) => {
                              const tagColor = tag.cor || '#6b7280'
                              console.log(`🎨 [SIDEBAR] Tag ${index} - ${tag.nome}:`, tagColor)
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
                        console.log(`🏷️ [SIDEBAR] Exibindo "Em aberto" para ${conversation.id} - sem tags válidas`)
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
                          title={`Agendamento: ${conversation.agendamento.data || 'Sem data'}`}
                          onClick={() => console.log('AGENDAMENTO CLICADO')}
                        >
                          <svg className="w-3 h-3" style={{ color: '#3b82f6' }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium" style={{ color: '#3b82f6' }}>
                            Agenda
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
                            title={`Assinatura: ${assinatura.descricao} - ${new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(Number(assinatura.valor || 0))}`}
                            onClick={() => console.log('ASSINATURA CLICADO')}
                          >
                            <svg className="w-3 h-3" style={{ color: '#7c3aed' }} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-medium" style={{ color: '#7c3aed' }}>
                              Assinatura
                            </span>
                          </motion.div>
                        )
                      })()}
                      
                      {/* Badge Tickets - Minimalista */}
                      {(() => {
                        const contatoData = contatosData[conversation.id?._serialized || conversation.id || '']
                        const tickets = contatoData?.tickets
                        return tickets && tickets.length > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md border cursor-pointer"
                            style={{
                              backgroundColor: '#ef444420',
                              borderColor: '#ef444440'
                            }}
                            title={`${tickets.length} ticket(s) - ${tickets.filter(t => t.status === 'ABERTO').length} aberto(s)`}
                            onClick={() => console.log('TICKETS CLICADO')}
                          >
                            <svg className="w-3 h-3" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium" style={{ color: '#ef4444' }}>
                              {tickets.length}
                            </span>
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
                          title={`Orçamento: ${new Intl.NumberFormat('pt-BR', {
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
                    <p className="text-xs text-muted-foreground truncate ml-2 max-w-[120px]">{conversation.lastMessage || 'Nova conversa'}</p>
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
            const currentConnection = connections.find((conn: any) => 
              conn.platform === 'whatsapp' && conn.user_id
            )

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
    </motion.div>
  )
}
