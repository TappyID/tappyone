'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import SideFilter from './components/SideFilter'
import SideChat from './components/SideChat'
import ChatHeader from './components/TopChatArea/ChatHeader'
import ChatArea from './components/ChatArea'
import FooterChatArea from './components/FooterChatArea'
import EditTextModal from '../atendimentos/components/EditTextModal'
import AgenteSelectionModal from './components/FooterChatArea/modals/AgenteSelectionModal'
import ForwardMessageModal from '@/components/ForwardMessageModal'
import AudioRecorderModal from './components/FooterChatArea/modals/AudioRecorderModal'
import { useContatoData } from '@/hooks/useContatoData'
import useChatsOverview from '@/hooks/useChatsOverview'
import { useFiltersData } from '@/hooks/useFiltersData'
import useMessagesData from '@/hooks/useMessagesData'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import QuickActionsSidebar from '../atendimentos/components/QuickActionsSidebar'
import TransferirAtendimentoModal from '../atendimentos/components/modals/TransferirAtendimentoModal'

// Mock data para demonstração
const mockTags = [
  { id: '1', nome: 'VIP', cor: '#10B981' },
  { id: '2', nome: 'Suporte', cor: '#3B82F6' },
  { id: '3', nome: 'Vendas', cor: '#F59E0B' }
]

const mockFilas = [
  { id: '1', nome: 'Atendimento', cor: '#8B5CF6', atendentes: [] },
  { id: '2', nome: 'Vendas', cor: '#EF4444', atendentes: [] },
  { id: '3', nome: 'Suporte', cor: '#06B6D4', atendentes: [] }
]

const mockChats = [
  {
    id: '1',
    name: 'João Silva',
    lastMessage: {
      type: 'text' as const,
      content: 'Olá, preciso de ajuda com meu pedido',
      timestamp: Date.now() - 300000,
      sender: 'user' as const,
      isRead: false
    },
    tags: [{ id: '1', nome: 'VIP', cor: '#10B981' }],
    rating: 4.5,
    unreadCount: 2
  },
  {
    id: '2', 
    name: 'Maria Santos',
    lastMessage: {
      type: 'image' as const,
      content: '',
      timestamp: Date.now() - 600000,
      sender: 'user' as const,
      isRead: true
    },
    tags: [{ id: '2', nome: 'Suporte', cor: '#3B82F6' }],
    isTransferred: true,
    transferredTo: { nome: 'Carlos' }
  },
  {
    id: '3',
    name: 'Pedro Costa',
    lastMessage: {
      type: 'text' as const,
      content: 'Obrigado pelo atendimento!',
      timestamp: Date.now() - 900000,
      sender: 'user' as const,
      isRead: true
    },
    rating: 5.0
  }
]

export default function AtendimentoPage() {
  // Estados para busca e filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('todas')
  const [selectedFila, setSelectedFila] = useState('todas')
  const [activeFilter, setActiveFilter] = useState('all') // Novo estado para filtros de tabs
  
  // Estados para filtros avançados
  const [selectedKanbanStatus, setSelectedKanbanStatus] = useState('todos')
  const [selectedTicketStatus, setSelectedTicketStatus] = useState('todos')
  const [selectedPriceRange, setSelectedPriceRange] = useState('todos')
  
  // Estados do chat
  const [selectedChatId, setSelectedChatId] = useState<string>()

  // Hook para filtros avançados com dados reais
  const {
    tags: realTags,
    filas: realFilas,
    kanbanStatuses: realKanbanStatuses,
    ticketStatuses: realTicketStatuses,
    priceRanges: realPriceRanges,
    atendentes: realAtendentes,
    isLoadingTags,
    isLoadingFilas,
    isLoadingKanban: isLoadingKanbanStatuses,
    isLoadingTickets: isLoadingTicketStatuses,
    isLoadingAtendentes,
    refetch: refetchFilters
  } = useFiltersData()
  
  // Estados dos modais
  const [showAgenteModal, setShowAgenteModal] = useState(false)
  const [showEditTextModal, setShowEditTextModal] = useState(false)
  const [showQuickActionsSidebar, setShowQuickActionsSidebar] = useState(false)
  const [showForwardModal, setShowForwardModal] = useState(false)
  const [forwardingMessage, setForwardingMessage] = useState<string | null>(null)
  const [showAudioModal, setShowAudioModal] = useState(false)
  
  // Estados para paginação dos chats
  const [displayedChatsCount, setDisplayedChatsCount] = useState(10)
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false)
  
  // Estados removidos - agora usando useFiltersData
  
  // Estados de tradução
  const [translatedMessages, setTranslatedMessages] = useState<{[messageId: string]: string}>({})
  
  // Estado de resposta
  const [replyingTo, setReplyingTo] = useState<{
    messageId: string
    content: string
    sender: string
  } | null>(null)

  // Estados para funcionalidades dos ícones do SideChat - COM PERSISTÊNCIA
  const [favoriteChats, setFavoriteChats] = useState<Set<string>>(new Set())
  const [archivedChats, setArchivedChats] = useState<Set<string>>(new Set())
  const [hiddenChats, setHiddenChats] = useState<Set<string>>(new Set())
  
  // Estados para modal de transferir
  const [showTransferirModal, setShowTransferirModal] = useState(false)
  const [selectedChatForTransfer, setSelectedChatForTransfer] = useState<string | null>(null)

  // Funções para gerenciar estados dos chats
  const toggleFavoriteChat = (chatId: string) => {
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

  const toggleArchiveChat = (chatId: string) => {
    setArchivedChats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(chatId)) {
        newSet.delete(chatId)
        console.log('📤 Chat desarquivado:', chatId)
      } else {
        newSet.add(chatId)
        console.log('📥 Chat arquivado:', chatId)
      }
      
      // Salvar no localStorage
      localStorage.setItem('tappyone-archived-chats', JSON.stringify(Array.from(newSet)))
      console.log('📦 Total arquivados:', newSet.size)
      
      return newSet
    })
  }

  const toggleHiddenChat = (chatId: string) => {
    setHiddenChats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(chatId)) {
        newSet.delete(chatId)
      } else {
        newSet.add(chatId)
      }
      return newSet
    })
  }

  const deleteChat = (chatId: string) => {
    if (confirm('Deseja realmente ocultar esta conversa?')) {
      toggleHiddenChat(chatId)
    }
  }

  // Carregar estados do localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('tappyone-favorite-chats')
      const savedArchived = localStorage.getItem('tappyone-archived-chats')
      const savedHidden = localStorage.getItem('tappyone-hidden-chats')

      if (savedFavorites) {
        setFavoriteChats(new Set(JSON.parse(savedFavorites)))
      }
      if (savedArchived) {
        setArchivedChats(new Set(JSON.parse(savedArchived)))
      }
      if (savedHidden) {
        setHiddenChats(new Set(JSON.parse(savedHidden)))
      }
    } catch (error) {
      console.error('Erro ao carregar estados dos chats:', error)
    }
  }, [])

  // Salvar estados no localStorage
  useEffect(() => {
    localStorage.setItem('tappyone-favorite-chats', JSON.stringify(Array.from(favoriteChats)))
  }, [favoriteChats])

  useEffect(() => {
    localStorage.setItem('tappyone-archived-chats', JSON.stringify(Array.from(archivedChats)))
  }, [archivedChats])

  useEffect(() => {
    localStorage.setItem('tappyone-hidden-chats', JSON.stringify(Array.from(hiddenChats)))
  }, [hiddenChats])
  
  // Hook de mensagens com dados reais da WAHA
  const { 
    messages: realMessages, 
    loading: loadingMessages, 
    error: messagesError,
    hasMore: hasMoreMessages,
    totalMessages,
    loadMore: loadMoreMessages,
    refreshMessages
  } = useMessagesData(selectedChatId)

  // Hook de overview dos chats da WAHA (com paginação real)
  const {
    chats: overviewChats,
    loading: loadingOverview,
    error: errorOverview,
    refreshChats: refreshOverview,
    loadMoreChats: loadMoreFromAPI,
    hasMore: hasMoreFromAPI,
    isLoadingMore: isLoadingMoreFromAPI,
    markChatAsRead,
    markChatAsUnread,
    totalChatsCount,
    unreadChatsCount,
    readNoReplyCount,
    groupChatsCount
  } = useChatsOverview()


  // Dados dos filtros agora vêm do useFiltersData hook

  // Reset da paginação quando filtros mudam
  useEffect(() => {
    if (searchQuery.trim() || selectedTag !== 'todas' || selectedFila !== 'todas') {
      setDisplayedChatsCount(10) // Reset para 10 quando há filtros
    }
  }, [searchQuery, selectedTag, selectedFila])

  // Estado para armazenar dados extras dos chats
  const [chatsExtraData, setChatsExtraData] = useState<Record<string, any>>({})

  // Buscar dados extras para cada chat (tags, agendamentos, etc)
  useEffect(() => {
    const fetchExtraData = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      for (const chat of overviewChats.slice(0, 20)) { // Limitar para performance
        const contatoId = chat.id?.replace('@c.us', '').replace('@g.us', '')
        if (!contatoId) continue

        try {
          // Buscar dados em paralelo
          const [tagsRes, agendamentosRes, orcamentosRes, ticketsRes, contatoRes] = await Promise.all([
            // Tags
            fetch(`/api/contatos/${contatoId}/tags`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).catch(() => null),
            // Agendamentos
            fetch(`/api/agendamentos?contato_id=${contatoId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).catch(() => null),
            // Orçamentos
            fetch(`/api/orcamentos?contato_id=${contatoId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).catch(() => null),
            // Tickets
            fetch(`/api/tickets?contato_id=${contatoId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).catch(() => null),
            // Contato
            fetch(`/api/contatos?telefone=${contatoId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).catch(() => null)
          ])

          const extraData: any = {}

          // Processar tags
          if (tagsRes?.ok) {
            const tagsData = await tagsRes.json()
            extraData.tags = tagsData.data || []
          }

          // Processar agendamentos
          if (agendamentosRes?.ok) {
            const agendamentosData = await agendamentosRes.json()
            extraData.agendamentos = agendamentosData.data || agendamentosData || []
          }

          // Processar orçamentos
          if (orcamentosRes?.ok) {
            const orcamentosData = await orcamentosRes.json()
            extraData.orcamentos = orcamentosData.data || orcamentosData || []
          }

          // Processar tickets
          if (ticketsRes?.ok) {
            const ticketsData = await ticketsRes.json()
            extraData.tickets = ticketsData.data || ticketsData || []
          }

          // Verificar se é contato
          if (contatoRes?.ok) {
            const contatoData = await contatoRes.json()
            const contatos = contatoData.data || contatoData || []
            extraData.isContact = contatos.length > 0
          }

          // Atualizar estado com os dados extras
          setChatsExtraData(prev => ({
            ...prev,
            [chat.id]: extraData
          }))
        } catch (error) {
          console.error(`Erro ao buscar dados extras para ${contatoId}:`, error)
        }
      }
    }

    if (overviewChats.length > 0) {
      fetchExtraData()
    }
  }, [overviewChats])

  // Filtrar e transformar overview chats para formato da SideChat
  const transformedChats = useMemo(() => {
    let filteredChats = overviewChats
    
    // Aplicar filtro de busca
    if (searchQuery.trim()) {
      filteredChats = overviewChats.filter(chat => 
        chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.body?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Aplicar filtro de tag
    if (selectedTag !== 'todas') {
      filteredChats = filteredChats.filter(chat => {
        const extraData = chatsExtraData[chat.id] || {}
        return extraData.tags?.some((tag: any) => tag.id === selectedTag)
      })
    }
    
    // Aplicar filtro de fila
    if (selectedFila !== 'todas') {
      filteredChats = filteredChats.filter(chat => {
        const extraData = chatsExtraData[chat.id] || {}
        return extraData.fila?.id === selectedFila
      })
    }
    
    // Limitar para performance (apenas se não há busca)
    const chatsToShow = searchQuery.trim() ? filteredChats : filteredChats.slice(0, displayedChatsCount)
    
    return chatsToShow.map(chat => {
      const extraData = chatsExtraData[chat.id] || {}
      
      return {
        id: chat.id,
        name: chat.name,
        avatar: chat.image, // Foto real do contato
        lastMessage: {
          type: chat.lastMessage?.type === 'text' ? 'text' as const : 
                chat.lastMessage?.hasMedia ? 'image' as const : 'text' as const,
          content: chat.lastMessage?.body || 'Sem mensagens',
          timestamp: chat.lastMessage?.timestamp || Date.now(),
          sender: chat.lastMessage?.fromMe ? 'agent' as const : 'user' as const,
          isRead: (chat.unreadCount ?? 0) === 0
        },
        isSelected: selectedChatId === chat.id,
        unreadCount: chat.unreadCount,
        // Dados reais dos indicadores
        tags: extraData.tags,
        agendamentos: extraData.agendamentos,
        orcamentos: extraData.orcamentos,
        tickets: extraData.tickets,
        isContact: extraData.isContact,
        // Dados mock por enquanto
        rating: Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : undefined,
        isOnline: Math.random() > 0.3,
        kanbanStatus: Math.random() > 0.4 ? {
          id: '1',
          nome: ['Pendente', 'Em Andamento', 'Finalizado'][Math.floor(Math.random() * 3)],
          cor: ['#f59e0b', '#3b82f6', '#10b981'][Math.floor(Math.random() * 3)]
        } : undefined,
        fila: Math.random() > 0.2 ? mockFilas[Math.floor(Math.random() * mockFilas.length)] : undefined
      }
    })
  }, [overviewChats, selectedChatId, chatsExtraData, displayedChatsCount, searchQuery, selectedTag, selectedFila, favoriteChats, archivedChats, hiddenChats])


  // Função para carregar mais chats (agora usa paginação real da API)
  const handleLoadMoreChats = useCallback(async () => {
    console.log('🔄 handleLoadMoreChats chamado:', {
      searchQuery: searchQuery.trim(),
      selectedTag,
      selectedFila,
      hasMoreFromAPI,
      isLoadingMoreFromAPI
    })
    
    // Não carregar mais se há filtros ativos (busca, tag, fila) - nesse caso usa paginação local
    if (searchQuery.trim() || selectedTag !== 'todas' || selectedFila !== 'todas') {
      console.log('🔍 Filtros ativos - usando paginação local')
      if (isLoadingMoreChats || displayedChatsCount >= overviewChats.length) {
        console.log('❌ Não carregar mais - já carregando ou limite atingido (filtros)')
        return
      }
      
      setIsLoadingMoreChats(true)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const newCount = Math.min(displayedChatsCount + 12, overviewChats.length)
      console.log('✅ Aumentando displayedChatsCount de', displayedChatsCount, 'para', newCount, '(filtros)')
      
      setDisplayedChatsCount(newCount)
      setIsLoadingMoreChats(false)
      return
    }
    
    // Sem filtros - usar paginação real da API
    console.log('🌐 Sem filtros - usando paginação real da API')
    if (hasMoreFromAPI && !isLoadingMoreFromAPI) {
      await loadMoreFromAPI()
    }
  }, [searchQuery, selectedTag, selectedFila, hasMoreFromAPI, isLoadingMoreFromAPI, loadMoreFromAPI, isLoadingMoreChats, displayedChatsCount, overviewChats.length])

  // Função helper para obter URL base
  const getWahaUrl = useCallback((path: string = '') => {
    const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:'
    const baseUrl = isProduction ? '/api/waha-proxy' : 'http://159.65.34.199:3001'
    return `${baseUrl}${path}`
  }, [])

  // Função para votar em enquete
  const handlePollVote = useCallback(async (messageId: string, chatId: string, votes: string[]) => {
    try {
      
      const response = await fetch(getWahaUrl('/api/sendPollVote'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Api-Key': 'tappyone-waha-2024-secretkey'
        },
        body: JSON.stringify({
          session: 'user_fb8da1d7_1758158816675',
          chatId,
          pollMessageId: messageId,
          votes
        })
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      // Recarregar mensagens para mostrar o resultado
      setTimeout(() => refreshMessages(), 1000)
      
    } catch (error) {
      console.error('❌ Erro ao votar:', error)
      alert('Erro ao votar na enquete. Tente novamente.')
    }
  }, [refreshMessages])

  // Usar apenas mensagens reais vindas da API
  const displayMessages = useMemo(() => {
    if (!selectedChatId) return []
    
    // Adicionar traduções às mensagens
    return realMessages.map(message => ({
      ...message,
      translation: translatedMessages[message.id]
    }))
  }, [selectedChatId, realMessages, hasMoreMessages, totalMessages, loadingMessages, translatedMessages])

  // Estados para chats com pesquisa
  const [whatsappChats, setWhatsappChats] = useState<any[]>([])
  const [loadingChats, setLoadingChats] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  // Funções para manipular os ícones do SideChat - IGUAL AO ConversationSidebar
  const toggleFavoriteConversation = (chatId: string) => {
    setFavoriteChats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(chatId)) {
        newSet.delete(chatId)
        console.log('⭐ Removido dos favoritos:', chatId)
      } else {
        newSet.add(chatId)
        console.log('⭐ Adicionado aos favoritos:', chatId)
      }
      return newSet
    })
  }

  const toggleArchiveConversation = (chatId: string) => {
    setArchivedChats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(chatId)) {
        newSet.delete(chatId)
        console.log('📁 Desarquivado:', chatId)
      } else {
        newSet.add(chatId)
        console.log('📁 Arquivado:', chatId)
      }
      return newSet
    })
  }

  const toggleHideConversation = (chatId: string) => {
    setHiddenChats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(chatId)) {
        newSet.delete(chatId)
        console.log('👁️ Mostrado:', chatId)
      } else {
        newSet.add(chatId)
        console.log('👁️‍🗨️ Ocultado:', chatId)
      }
      return newSet
    })
  }

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
        console.log('🗑️ Chat excluído:', chatId)
      } else {
        console.error('Erro ao deletar chat:', response.statusText)
        alert('Erro ao deletar chat. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao deletar chat:', error)
      alert('Erro ao deletar chat. Tente novamente.')
    }
  }

  const handleTransferChat = (chatId: string) => {
    console.log('↔️ Transferir chat:', chatId)
    setSelectedChatForTransfer(chatId)
    setShowTransferirModal(true)
  }

  // Handler para confirmar transferência
  const handleTransferirSave = async (transferData: any) => {
    try {
      console.log('🔄 Transferindo chat:', selectedChatForTransfer, transferData)
      
      // TODO: Implementar lógica de transferência real
      // Por enquanto, apenas simular
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('✅ Chat transferido com sucesso!')
      setShowTransferirModal(false)
      setSelectedChatForTransfer(null)
      
    } catch (error) {
      console.error('❌ Erro ao transferir chat:', error)
      throw error // Re-throw para o modal não fechar
    }
  }

  // Função para buscar chats (inicial ou pesquisa)
  const fetchChats = async (searchTerm: string = '') => {
    try {
      const isSearch = searchTerm.length > 0
      if (isSearch) setIsSearching(true)
      else setLoadingChats(true)

      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Token não encontrado')
        setWhatsappChats([])
        return
      }

      const response = await fetch('/api/whatsapp/chats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const allChats = await response.json()
        
        let filteredChats = allChats
        
        // Se tem pesquisa, filtrar
        if (searchTerm) {
          filteredChats = allChats.filter((chat: any) => 
            chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        } else {
          // Sem pesquisa, pegar apenas os primeiros 20
          filteredChats = allChats.slice(0, 20)
        }
        
        // Remover URLs de imagem para evitar requisições extras
        const chatsWithoutImages = filteredChats.map((chat: any) => ({
          ...chat,
          profilePictureUrl: undefined
        }))
        
        setWhatsappChats(chatsWithoutImages)
      } else {
        console.error('Erro na API:', response.status)
        setWhatsappChats([])
      }
    } catch (error) {
      console.error('Erro ao buscar chats:', error)
      setWhatsappChats([])
    } finally {
      setLoadingChats(false)
      setIsSearching(false)
    }
  }

  // Carregamento inicial
  useEffect(() => {
    fetchChats()
  }, [])

  // Debounce para pesquisa
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchChats(searchQuery)
    }, 300) // 300ms de delay

    return () => clearTimeout(timeoutId)
  }, [searchQuery])
  
  // Helper functions para processar mensagens da WAHA
  const getMessageType = (lastMessage: any): 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call' => {
    if (!lastMessage) return 'text'
    if (lastMessage.type === 'image' || lastMessage.mimetype?.startsWith('image/')) return 'image'
    if (lastMessage.type === 'video' || lastMessage.mimetype?.startsWith('video/')) return 'video'
    if (lastMessage.type === 'audio' || lastMessage.mimetype?.startsWith('audio/')) return 'audio'
    if (lastMessage.type === 'document') return 'document'
    if (lastMessage.type === 'location') return 'location'
    if (lastMessage.type === 'vcard') return 'contact'
    if (lastMessage.type === 'call_log') return 'call'
    return 'text'
  }


  const getMessageSender = (chat: any): 'user' | 'agent' => {
    const lastMessage = chat.lastMessage
    
    // Se não há mensagem, considerar como user (novo chat)
    if (!lastMessage) return 'user'
    
    // Se for string simples, usar o fromMe do chat
    if (typeof lastMessage === 'string') {
      return chat.fromMe ? 'agent' : 'user'
    }
    
    // Se for objeto WAHA, verificar fromMe da mensagem
    return lastMessage.fromMe ? 'agent' : 'user'
  }

  const getMessageReadStatus = (chat: any): boolean => {
    const lastMessage = chat.lastMessage
    
    // Se não há mensagem, considerar como lida
    if (!lastMessage) return true
    
    // Para mensagens do agente (enviadas por nós), sempre consideramos lidas
    if (getMessageSender(chat) === 'agent') return true
    
    // Para mensagens do usuário, verificar se há unreadCount
    // Se unreadCount é 0, a última mensagem foi lida
    return (chat.unreadCount || 0) === 0
  }
  
  // Usar chats do useChatsOverview que já processam as mensagens corretamente
  const finalChats = overviewChats
  const finalLoading = loadingOverview
  
  // Usar todos os chats (não limitar mais a 5)
  const activeChats = useMemo(() => {
    return finalChats
  }, [finalChats])

  // Obter IDs dos chats para buscar dados dos contatos
  const activeChatIds = useMemo(() => {
    return activeChats.map(chat => {
      // Verificação mais segura para diferentes formatos de ID
      if (typeof chat.id === 'string') {
        return chat.id
      } else if (chat.id && typeof chat.id === 'object' && '_serialized' in chat.id) {
        return (chat.id as any)._serialized
      }
      return ''
    }).filter(Boolean)
  }, [activeChats])

  const { contatos: contatosData, loading: loadingContatos } = useContatoData(activeChatIds)

  // Usar dados já processados do useChatsOverview e adicionar dados extras dos contatos
  const processedChats = useMemo(() => {
    console.log('🔍 [DEBUG] processedChats - activeChats entrada:', activeChats.length)
    
    let result = activeChats.map((chat: any) => {
      // Debug para verificar unreadCount da WAHA
      if (chat.unreadCount > 0) {
        console.log('🔍 DEBUG WAHA - Chat com mensagens não lidas:', {
          id: chat.id,
          name: chat.name,
          unreadCount: chat.unreadCount,
          lastMessage: chat.lastMessage?.body
        })
      }
      
      const contatoData: any = contatosData[chat.id] || {}
      
      // Adicionar dados de exemplo para demonstração das badges
      const hasDataExample = Math.random() > 0.3 // 70% chance de ter dados
      // Usar tags reais do sistema quando disponíveis
      const tagsExample = hasDataExample && Math.random() > 0.4 && realTags.length > 0 ? [
        realTags[Math.floor(Math.random() * realTags.length)],
        ...(realTags.length > 1 && Math.random() > 0.7 ? [realTags[Math.floor(Math.random() * realTags.length)]] : [])
      ].filter((tag, index, arr) => arr.findIndex(t => t.id === tag.id) === index) : []
      
      const agendamentosExample = hasDataExample && Math.random() > 0.6 ? [
        { id: '1', titulo: 'Reunião', status: 'AGENDADO' },
        { id: '2', titulo: 'Follow-up', status: 'PENDENTE' }
      ] : []
      
      const ticketsExample = hasDataExample && Math.random() > 0.5 ? [
        { id: '1', titulo: 'Suporte', status: 'ABERTO' },
        { id: '2', titulo: 'Bug Report', status: 'ANDAMENTO' }
      ] : []

      return {
        ...chat, // Usar dados já processados (incluindo lastMessage.body correto)
        // Garantir que lastMessage existe
        lastMessage: chat.lastMessage || {
          type: 'text' as const,
          content: 'Sem mensagens',
          timestamp: Date.now(),
          sender: 'user' as const,
          isRead: true
        },
        // Dados reais dos contatos + exemplos para demonstração
        tags: contatoData.tags?.length > 0 ? contatoData.tags : tagsExample,
        agendamentos: contatoData.agendamentos?.length > 0 ? contatoData.agendamentos : agendamentosExample,
        orcamentos: contatoData.orcamentos || [],
        tickets: contatoData.tickets?.length > 0 ? contatoData.tickets : ticketsExample,
        rating: contatoData.rating || (Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 4 : undefined), // 4-5 estrelas às vezes
        
        // Kanban - buscar dados reais do contato ou exemplo usando quadros reais
        kanbanStatus: contatoData.kanban?.length > 0 ? {
          id: contatoData.kanban[0].coluna_id,
          nome: contatoData.kanban[0].coluna_nome || 'Kanban',
          cor: contatoData.kanban[0].coluna_cor || '#3B82F6'
        } : (hasDataExample && Math.random() > 0.4 && realKanbanStatuses.length > 0 ? 
          realKanbanStatuses[Math.floor(Math.random() * realKanbanStatuses.length)]
        : undefined),
        
        // Fila - buscar dados reais do contato ou exemplo usando filas reais
        fila: contatoData.fila ? {
          id: contatoData.fila.id,
          nome: contatoData.fila.nome,
          cor: contatoData.fila.cor || '#9333ea'
        } : (hasDataExample && Math.random() > 0.6 && realFilas.length > 0 ? 
          realFilas[Math.floor(Math.random() * realFilas.length)]
        : undefined),
        
        // Ticket Status - buscar do primeiro ticket ativo ou exemplo
        ticketStatus: contatoData.tickets?.length > 0 ? {
          id: contatoData.tickets[0].status,
          nome: contatoData.tickets[0].status === 'ABERTO' ? 'Aberto' : 
                contatoData.tickets[0].status === 'ANDAMENTO' ? 'Em Andamento' : 'Encerrado',
          cor: contatoData.tickets[0].status === 'ABERTO' ? '#F59E0B' : 
               contatoData.tickets[0].status === 'ANDAMENTO' ? '#3B82F6' : '#10B981'
        } : (ticketsExample.length > 0 ? {
          id: ticketsExample[0].status,
          nome: ticketsExample[0].status === 'ABERTO' ? 'Aberto' : 'Em Andamento',
          cor: ticketsExample[0].status === 'ABERTO' ? '#F59E0B' : '#3B82F6'
        } : undefined),
        
        // Estados de conexão (mock por enquanto)
        isOnline: Math.random() > 0.7,
        connectionStatus: ['connected', 'disconnected', 'connecting'][Math.floor(Math.random() * 3)] as 'connected' | 'disconnected' | 'connecting',
        
        // Estados de favorito, arquivado, oculto
        isFavorite: favoriteChats.has(chat.id),
        isArchived: archivedChats.has(chat.id),
        isHidden: hiddenChats.has(chat.id),
      }
    })

    // Aplicar filtros baseados no activeFilter
    switch (activeFilter) {
      case 'unread':
        result = result.filter(chat => (chat.unreadCount || 0) > 0)
        break
      case 'read':
        result = result.filter(chat => (chat.unreadCount || 0) === 0)
        break
      case 'favorites':
        result = result.filter(chat => favoriteChats.has(chat.id))
        break
      case 'archived':
        result = result.filter(chat => archivedChats.has(chat.id))
        break
      case 'groups':
        result = result.filter(chat => chat.id?.includes('@g.us'))
        break
      case 'hidden':
        result = result.filter(chat => hiddenChats.has(chat.id))
        break
      case 'all':
      default:
        // Para 'all', filtrar chats ocultos e arquivados (não mostrar)
        result = result.filter(chat => !hiddenChats.has(chat.id) && !archivedChats.has(chat.id))
        break
    }

    // Aplicar filtros avançados selecionados
    
    // Filtro por tag específica
    if (selectedTag && selectedTag !== 'todas') {
      console.log('🔍 [DEBUG] Filtrando por tag:', selectedTag)
      result = result.filter(chat => {
        const hasTag = chat.tags?.some((tag: any) => tag.id === selectedTag)
        if (chat.tags?.length > 0) {
          console.log('🔍 [DEBUG] Chat', chat.name, 'tags:', chat.tags.map(t => t.id), 'hasTag:', hasTag)
        }
        return hasTag
      })
      console.log('🔍 [DEBUG] Após filtro tag - restaram:', result.length)
    }

    // Filtro por fila específica
    if (selectedFila && selectedFila !== 'todas') {
      result = result.filter(chat => 
        chat.fila?.id === selectedFila
      )
    }

    // Filtro por status kanban específico
    if (selectedKanbanStatus && selectedKanbanStatus !== 'todos') {
      console.log('🔍 [DEBUG] Filtrando por kanban:', selectedKanbanStatus)
      result = result.filter(chat => {
        const hasKanban = chat.kanbanStatus?.id === selectedKanbanStatus
        if (chat.kanbanStatus) {
          console.log('🔍 [DEBUG] Chat', chat.name, 'kanban:', chat.kanbanStatus.id, 'hasKanban:', hasKanban)
        }
        return hasKanban
      })
      console.log('🔍 [DEBUG] Após filtro kanban - restaram:', result.length)
    }

    // Filtro por status de ticket específico
    if (selectedTicketStatus && selectedTicketStatus !== 'todos') {
      result = result.filter(chat => 
        chat.ticketStatus?.id === selectedTicketStatus
      )
    }

    // Filtro por faixa de preço (orçamentos)
    if (selectedPriceRange && selectedPriceRange !== 'todos') {
      // TODO: Implementar quando tivermos dados de orçamentos com valores
      console.log('Filtro por preço ainda não implementado:', selectedPriceRange)
    }
    
    console.log('🔍 [DEBUG] processedChats - Total filtrados:', result.length)
    console.log('🔍 [DEBUG] processedChats - Filtros ativos:', {
      activeFilter,
      selectedTag,
      selectedFila,
      selectedKanbanStatus,
      selectedTicketStatus,
      selectedPriceRange
    })
    
    return result
  }, [activeChats, contatosData, favoriteChats, archivedChats, hiddenChats, activeFilter, selectedTag, selectedFila, selectedKanbanStatus, selectedTicketStatus, selectedPriceRange])

  // Expor funções para testes no console (só uma vez)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testMarkAsRead = markChatAsRead
      (window as any).testMarkAsUnread = markChatAsUnread
      
      // Função para testar API da WAHA diretamente
      (window as any).testWahaAPI = async () => {
        try {
          console.log('🔍 Testando API da WAHA diretamente...')
          const response = await fetch('http://159.65.34.199:3001/api/user_fb8da1d7_1758158816675/chats/overview?limit=5&offset=0', {
            headers: { 'X-Api-Key': 'tappyone-waha-2024-secretkey' }
          })
          const data = await response.json()
          console.log('🔍 TESTE DIRETO WAHA - Primeiros 5 chats:', data)
          
          // Procurar qualquer campo relacionado a unread
          data.forEach((chat: any, i: number) => {
            const unreadFields = Object.keys(chat).filter(key => 
              key.toLowerCase().includes('unread') || 
              key.toLowerCase().includes('read') ||
              key.toLowerCase().includes('count')
            )
            console.log(`Chat ${i+1} - Campos relacionados a unread/read:`, {
              id: chat.id,
              name: chat.name,
              unreadFields,
              valores: unreadFields.reduce((acc: any, field) => {
                acc[field] = chat[field]
                return acc
              }, {})
            })
          })
        } catch (error) {
          console.error('❌ Erro no teste direto:', error)
        }
      }
      
      console.log('🧪 Funções WAHA disponíveis no console:')
      console.log('  window.testMarkAsRead("CHAT_ID") - Marca mensagens como lidas via WAHA')
      console.log('  window.testMarkAsUnread("CHAT_ID") - Tenta marcar como não lido via WAHA')
      console.log('  window.testWahaAPI() - Testa API da WAHA diretamente')
    }
  }, []) // Removido overviewChats da dependência

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Topbar */}
      <div className="flex-shrink-0">
        <AtendimentosTopBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Container principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Esquerda - Filtros + Chats */}
        <div className="w-[32rem] flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
          {/* Filtros */}
          <div className="flex-shrink-0">
            <SideFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTag={selectedTag}
              onTagChange={setSelectedTag}
              tags={realTags}
              selectedFila={selectedFila}
              onFilaChange={setSelectedFila}
              filas={realFilas}
              // Estados de loading dos filtros avançados
              isLoadingTags={isLoadingTags}
              isLoadingFilas={isLoadingFilas}
              isLoadingKanban={isLoadingKanbanStatuses}
              isLoadingTickets={isLoadingTicketStatuses}
              isLoadingAtendentes={isLoadingAtendentes}
              // Dados dos filtros avançados
              kanbanStatuses={realKanbanStatuses}
              ticketStatuses={realTicketStatuses}
              priceRanges={realPriceRanges}
              selectedKanbanStatus={selectedKanbanStatus}
              // Dados para contadores das tabs
              conversations={processedChats}
              totalChats={totalChatsCount} // Total real da WAHA
              unreadChats={unreadChatsCount} // Total real de não lidas da WAHA
              readChats={readNoReplyCount} // Total real de lidas mas não respondidas da WAHA
              archivedChats={archivedChats.size}
              groupChats={groupChatsCount} // Total real de grupos da WAHA
              favoriteChats={favoriteChats.size}
              hiddenChats={hiddenChats.size}
              // Controle do filtro ativo
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          {/* Lista de Chats */}
          <div className="flex-1 overflow-hidden">
            <SideChat
              chats={processedChats}
              selectedChatId={selectedChatId}
              onSelectChat={setSelectedChatId}
              isLoading={loadingOverview}
              onLoadMore={handleLoadMoreChats}
              hasMoreChats={(() => {
                // Se há filtros, usar paginação local
                if (searchQuery.trim() || selectedTag !== 'todas' || selectedFila !== 'todas') {
                  const localHasMore = displayedChatsCount < overviewChats.length
                  console.log('🔍 hasMoreChats (filtros ativos):', {
                    searchQuery: searchQuery.trim(),
                    selectedTag,
                    selectedFila,
                    displayedChatsCount,
                    overviewChatsLength: overviewChats.length,
                    localHasMore
                  })
                  return localHasMore
                }
                
                // Sem filtros, usar hasMore da API
                console.log('🌐 hasMoreChats (sem filtros - API):', {
                  hasMoreFromAPI,
                  isLoadingMoreFromAPI,
                  processedChatsLength: processedChats.length
                })
                return hasMoreFromAPI
              })()}
              isLoadingMore={searchQuery.trim() || selectedTag !== 'todas' || selectedFila !== 'todas' ? isLoadingMoreChats : isLoadingMoreFromAPI}
              onTagsClick={(chatId, e) => {
                e.stopPropagation()
                console.log('🏷️ Tags clicadas para chat:', chatId)
                // TODO: Abrir modal de tags
              }}
              onTransferClick={(chatId, e) => {
                e.stopPropagation()
                console.log('🔄 Transferir clicado para chat:', chatId)
                setSelectedChatForTransfer(chatId)
                setShowTransferirModal(true)
              }}
              onToggleFavorite={toggleFavoriteChat}
              onToggleArchive={toggleArchiveChat}
              onToggleHidden={toggleHiddenChat}
              onDelete={deleteChat}
            />
          </div>
        </div>

        {/* Área Principal - Chat Completa */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {/* Header do Chat */}
          <ChatHeader 
            chat={selectedChatId ? (() => {
              const foundChat = processedChats.find(c => c.id === selectedChatId)
              console.log('🔍 DEBUG ChatHeader - selectedChatId:', selectedChatId)
              console.log('🔍 DEBUG ChatHeader - foundChat:', foundChat)
              console.log('🔍 DEBUG ChatHeader - processedChats IDs:', processedChats.map(c => c.id))
              
              console.log('🔍 DEBUG ChatHeader - foundChat.unreadCount:', foundChat?.unreadCount)
              console.log('🔍 DEBUG ChatHeader - foundChat completo:', foundChat)
              
              return {
                id: selectedChatId,
                name: foundChat?.name || 'Usuário',
                avatar: foundChat?.avatar,
                isOnline: foundChat?.isOnline || false,
                lastSeen: foundChat?.lastMessage?.timestamp || Date.now(),
                unreadCount: foundChat?.unreadCount
              }
            })() : undefined}
            selectedChatId={selectedChatId}
            onCallClick={() => console.log('📞 Chamada iniciada')}
            onVideoClick={() => console.log('📹 Videochamada iniciada')}
            onMenuClick={() => console.log('⚙️ Menu aberto')}
          />

          {/* Área de Mensagens */}
          <ChatArea
            messages={displayMessages}
            isLoading={loadingMessages}
            hasMore={hasMoreMessages}
            totalMessages={totalMessages}
            onLoadMore={loadMoreMessages}
            selectedChat={selectedChatId ? {
              id: selectedChatId,
              name: processedChats.find(c => c.id === selectedChatId)?.name || 'Usuário'
            } : undefined}
            onReply={(messageId) => {
              console.log('🔄 Responder à mensagem:', messageId)
              const message = displayMessages.find(m => m.id === messageId)
              if (message) {
                setReplyingTo({
                  messageId: message.id,
                  content: message.content,
                  sender: message.sender === 'user' ? processedChats.find(c => c.id === selectedChatId)?.name || 'Usuário' : 'Você'
                })
              }
            }}
            onForward={(messageId) => {
              console.log('↗️ Encaminhar mensagem:', messageId)
              setForwardingMessage(messageId)
              setShowForwardModal(true)
            }}
            onReaction={(messageId, emoji) => {
              console.log('😀 Enviando reação:', emoji, 'para mensagem:', messageId)
              if (!selectedChatId) return
              
              // API correta da WAHA para reações!
              fetch(getWahaUrl('/api/reaction'), {
                method: 'PUT',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Api-Key': 'tappyone-waha-2024-secretkey'
                },
                body: JSON.stringify({
                  messageId: messageId,
                  reaction: emoji,
                  session: 'user_fb8da1d7_1758158816675'
                })
              }).then(async response => {
                if (response.ok) {
                  const result = await response.json()
                  console.log('✅ Reação enviada:', emoji, 'Resposta:', result)
                  setTimeout(() => refreshMessages(), 500)
                } else {
                  const errorData = await response.json().catch(() => null)
                  console.error('❌ Erro ao enviar reação:', response.status, errorData)
                }
              }).catch(error => console.error('❌ Erro de rede reação:', error))
            }}
            onTranslate={(messageId, translatedText) => {
              console.log('🌐 Tradução recebida para:', messageId, '→', translatedText)
              if (translatedText) {
                setTranslatedMessages(prev => ({
                  ...prev,
                  [messageId]: translatedText
                }))
              }
            }}
            onAIReply={async (messageId, content) => {
              console.log('🤖 IA responder para:', messageId, 'com:', content)
              
              // Enviar mensagem traduzida diretamente
              if (selectedChatId && content.trim()) {
                try {
                  console.log('📤 Enviando resposta traduzida:', content)
                  
                  const wahaUrl = getWahaUrl(`/api/user_fb8da1d7_1758158816675/chats/${selectedChatId}/messages/text`)
                  console.log('🔗 URL de envio:', wahaUrl)
                  
                  const response = await fetch(wahaUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      text: content
                    })
                  })
                  
                  if (response.ok) {
                    console.log('✅ Resposta traduzida enviada com sucesso!')
                    // Atualizar mensagens
                    refreshMessages()
                  } else {
                    console.error('❌ Erro ao enviar resposta traduzida:', response.status)
                  }
                } catch (error) {
                  console.error('❌ Erro ao enviar resposta traduzida:', error)
                }
              }
            }}
          />
          
          {/* Debug info para mensagens */}
          {messagesError && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ Erro ao carregar mensagens: {messagesError}
              </p>
            </div>
          )}

          {/* Footer - Input de Mensagem */}
          <FooterChatArea
            onStartTyping={() => {
              if (!selectedChatId) return
              // Usar API WAHA para mostrar "digitando..."
              fetch(getWahaUrl('/api/startTyping'), {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Api-Key': 'tappyone-waha-2024-secretkey'
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId
                })
              }).then(() => console.log('⌨️ Iniciou digitando'))
            }}
            onStopTyping={() => {
              if (!selectedChatId) return
              // Usar API WAHA para parar "digitando..."
              fetch(getWahaUrl('/api/stopTyping'), {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Api-Key': 'tappyone-waha-2024-secretkey'
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId
                })
              }).then(() => console.log('⏹️ Parou de digitar'))
            }}
            onMarkAsSeen={(messageId) => {
              if (!selectedChatId) return
              // Usar API WAHA para marcar como vista (✓✓ azul)
              fetch(getWahaUrl('/api/sendSeen'), {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Api-Key': 'tappyone-waha-2024-secretkey'
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  messageId: messageId
                })
              }).then(() => console.log('👁️ Marcado como visto'))
            }}
            onAgentClick={() => setShowAgenteModal(true)}
            onIAClick={() => setShowEditTextModal(true)}
            onRespostaRapidaClick={() => {
              console.log('🔍 Abrindo sidebar - selectedChatId:', selectedChatId)
              setShowQuickActionsSidebar(true)
            }}
            onSendAudio={() => setShowAudioModal(true)}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            onSendMessage={(content) => {
              if (!selectedChatId) return
              // Usar API WAHA para enviar texto
              fetch(getWahaUrl('/api/sendText'), {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Api-Key': 'tappyone-waha-2024-secretkey'
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  text: content,
                  reply_to: replyingTo?.messageId || null,
                  linkPreview: true,
                  linkPreviewHighQuality: false
                })
              }).then(async response => {
                if (response.ok) {
                  const result = await response.json()
                  console.log('✅ Mensagem enviada:', content)
                  console.log('📋 Resposta WAHA:', result)
                  
                  // Limpar reply após enviar
                  setReplyingTo(null)
                  
                  // Recarregar mensagens imediatamente (sem reload da página)
                  setTimeout(() => refreshMessages(), 500)
                } else {
                  const errorData = await response.json().catch(() => null)
                  console.error('❌ Erro ao enviar:', response.status, response.statusText)
                  console.error('📋 Detalhes do erro:', errorData)
                }
              }).catch(error => console.error('❌ Erro de rede:', error))
            }}
            onSendPoll={(pollData) => {
              if (!selectedChatId) return
              // Usar API WAHA para enviar enquete
              fetch(getWahaUrl('/api/sendPoll'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  poll: pollData
                })
              }).then(() => console.log('📊 Enquete enviada'))
            }}
            onSendList={(listData) => {
              if (!selectedChatId) return
              
              console.log('🔗 Enviando lista/menu:', listData)
              
              // Usar API WAHA para enviar lista/menu - formato correto da documentação
              fetch(getWahaUrl('/api/sendList'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: JSON.stringify({
                  chatId: selectedChatId,
                  session: 'user_fb8da1d7_1758158816675',
                  message: listData, // Envolver em 'message' como a API espera
                  reply_to: null
                })
              }).then(async response => {
                if (response.ok) {
                  const result = await response.json()
                  console.log('✅ Lista enviada com sucesso:', result)
                  setTimeout(() => refreshMessages(), 500)
                } else {
                  const errorData = await response.json().catch(() => null)
                  console.error('❌ Erro ao enviar lista:', response.status, errorData)
                }
              }).catch(error => {
                console.error('❌ Erro de rede ao enviar lista:', error)
              })
            }}
            onSendEvent={(eventData) => {
              if (!selectedChatId) return
              // Usar API WAHA para enviar evento
              fetch(getWahaUrl('/api/user_fb8da1d7_1758158816675/events'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: JSON.stringify({
                  chatId: selectedChatId,
                  event: eventData
                })
              }).then(() => console.log('📅 Evento enviado'))
            }}
            onSendMedia={async (file: File, caption: string, mediaType: 'image' | 'video' | 'document') => {
              if (!selectedChatId || !file) return
              
              console.log('📎 Enviando mídia:', { fileName: file.name, mediaType, caption, selectedChatId })
              
              try {
                // Converter arquivo para base64
                const reader = new FileReader()
                const base64Promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => {
                    const base64 = reader.result as string
                    resolve(base64.split(',')[1]) // Remove o prefixo data:...
                  }
                })
                reader.readAsDataURL(file)
                const base64Data = await base64Promise
                
                // Determinar mimetype
                let mimetype = file.type || 'application/octet-stream'
                
                // Preparar payload JSON
                const payload = {
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  file: {
                    data: base64Data,
                    mimetype: mimetype,
                    filename: file.name
                  }
                }
                
                if (caption?.trim()) {
                  payload['caption'] = caption.trim()
                }
                
                // Determinar endpoint baseado no tipo
                let endpoint = '/api/sendFile'
                if (mediaType === 'image') {
                  endpoint = '/api/sendImage'
                } else if (mediaType === 'video') {
                  endpoint = '/api/sendVideo'
                }
                
                console.log('📦 Enviando mídia como JSON:', { endpoint, filename: file.name, mimetype })
                
                const response = await fetch(getWahaUrl(endpoint), {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'X-Api-Key': 'tappyone-waha-2024-secretkey' 
                  },
                  body: JSON.stringify(payload)
                })
                
                if (response.ok) {
                  const result = await response.json()
                  console.log('✅ Mídia enviada com sucesso:', result)
                  setTimeout(() => refreshMessages(), 500)
                } else {
                  const errorData = await response.json().catch(() => null)
                  console.error('❌ Erro ao enviar mídia:', response.status, errorData)
                }
              } catch (error) {
                console.error('❌ Erro ao processar/enviar mídia:', error)
              }
            }}
            onSendContact={(contactsData) => {
              if (!selectedChatId) return
              // Usar API WAHA para enviar contato
              fetch(getWahaUrl('/api/sendContactVcard'), {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json', 
                  'X-Api-Key': 'tappyone-waha-2024-secretkey' 
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  contacts: contactsData.contacts || []
                })
              }).then(async response => {
                if (response.ok) {
                  console.log('✅ Contatos enviados')
                  setTimeout(() => refreshMessages(), 500)
                } else {
                  const errorData = await response.json().catch(() => null)
                  console.error('❌ Erro ao enviar contatos:', response.status, errorData)
                }
              }).catch(error => console.error('❌ Erro de rede contatos:', error))
            }}
            onSendLocation={(locationData) => {
              if (!selectedChatId) return
              // Usar API WAHA para enviar localização
              fetch(getWahaUrl('/api/sendLocation'), {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json', 
                  'X-Api-Key': 'tappyone-waha-2024-secretkey' 
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  title: locationData.title || 'Localização',
                  address: locationData.address || ''
                })
              }).then(async response => {
                if (response.ok) {
                  console.log('✅ Localização enviada')
                  setTimeout(() => refreshMessages(), 500)
                } else {
                  const errorData = await response.json().catch(() => null)
                  console.error('❌ Erro ao enviar localização:', response.status, errorData)
                }
              }).catch(error => console.error('❌ Erro de rede localização:', error))
            }}
            selectedChat={selectedChatId ? {
              id: selectedChatId,
              name: processedChats.find(c => c.id === selectedChatId)?.name || 'Usuário'
            } : undefined}
          />
        </div>
      </div>

      {/* Modais */}
      {showAgenteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowAgenteModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Selecionar Agente IA</h3>
            <p className="text-gray-600 mb-4">Funcionalidade em desenvolvimento...</p>
            <button 
              onClick={() => setShowAgenteModal(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showEditTextModal && (
        <EditTextModal
          isOpen={showEditTextModal}
          onClose={() => setShowEditTextModal(false)}
          initialText=""
          contactName={processedChats.find(c => c.id === selectedChatId)?.name || 'Usuário'}
          actionTitle="Gerar com IA"
          onSend={(message) => {
            // Enviar mensagem gerada pela IA
            if (selectedChatId) {
              fetch(getWahaUrl('/api/sendText'), {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Api-Key': 'tappyone-waha-2024-secretkey'
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  text: message
                })
              }).then(() => {
                console.log('🤖 Mensagem IA enviada')
                setTimeout(() => refreshMessages(), 500)
                setShowEditTextModal(false)
              })
            }
          }}
        />
      )}

      <QuickActionsSidebar
        isOpen={showQuickActionsSidebar}
        onClose={() => setShowQuickActionsSidebar(false)}
        activeChatId={selectedChatId}
        onSelectAction={(action) => {
          // Executar ação rápida selecionada
          console.log('⚡ Ação rápida:', action)
          console.log('🔍 selectedChatId na página:', selectedChatId)
          setShowQuickActionsSidebar(false)
        }}
      />

      {/* Modal de Gravação de Áudio */}
      <AudioRecorderModal
        isOpen={showAudioModal}
        onClose={() => setShowAudioModal(false)}
        onSend={async (audioBlob) => {
          if (!selectedChatId) return
          
          console.log('🎤 Enviando áudio:', { size: audioBlob.size, type: audioBlob.type })
          
          try {
            // Converter blob para base64
            const reader = new FileReader()
            const base64Promise = new Promise<string>((resolve) => {
              reader.onloadend = () => {
                const base64 = reader.result as string
                resolve(base64.split(',')[1]) // Remove o prefixo data:...
              }
            })
            reader.readAsDataURL(audioBlob)
            const base64Data = await base64Promise
            
            // Preparar payload JSON para áudio
            const payload = {
              session: 'user_fb8da1d7_1758158816675',
              chatId: selectedChatId,
              file: {
                data: base64Data,
                mimetype: 'audio/webm',
                filename: 'audio.webm'
              }
            }
            
            console.log('🎤 Enviando áudio como JSON')
            
            const response = await fetch(getWahaUrl('/api/sendVoice'), {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'X-Api-Key': 'tappyone-waha-2024-secretkey' 
              },
              body: JSON.stringify(payload)
            })
            
            if (response.ok) {
              const result = await response.json()
              console.log('✅ Áudio enviado com sucesso:', result)
              setTimeout(() => refreshMessages(), 500)
              setShowAudioModal(false)
            } else {
              const errorData = await response.json().catch(() => null)
              console.error('❌ Erro ao enviar áudio:', response.status, errorData)
              alert('Erro ao enviar áudio. Tente novamente.')
            }
          } catch (error) {
            console.error('❌ Erro de rede ao enviar áudio:', error)
            alert('Erro de conexão. Verifique sua internet.')
          }
        }}
      />

      {/* Modal de Encaminhamento */}
      {showForwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowForwardModal(false)} />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Encaminhar Mensagem</h3>
            <p className="text-gray-600 mb-4">
              Funcionalidade de encaminhamento em desenvolvimento...
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Mensagem ID: {forwardingMessage}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (forwardingMessage && selectedChatId) {
                    // Implementar encaminhamento via WAHA
                    fetch(getWahaUrl('/api/forwardMessage'), {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'X-Api-Key': 'tappyone-waha-2024-secretkey'
                      },
                      body: JSON.stringify({
                        session: 'user_fb8da1d7_1758158816675',
                        messageId: forwardingMessage,
                        to: selectedChatId // Por enquanto encaminha para o mesmo chat
                      })
                    }).then(() => {
                      console.log('✅ Mensagem encaminhada')
                      setShowForwardModal(false)
                      setTimeout(() => refreshMessages(), 500)
                    })
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Encaminhar
              </button>
              <button 
                onClick={() => setShowForwardModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Transferir Atendimento */}
      <TransferirAtendimentoModal
        isOpen={showTransferirModal}
        onClose={() => {
          setShowTransferirModal(false)
          setSelectedChatForTransfer(null)
        }}
        onConfirm={handleTransferirSave}
        chatId={selectedChatForTransfer || undefined}
        contactData={{
          id: selectedChatForTransfer || '',
          nome: processedChats.find(c => c.id === selectedChatForTransfer)?.name || '',
          telefone: selectedChatForTransfer?.replace('@c.us', '') || ''
        }}
      />
    </div>
  )
}
