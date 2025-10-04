'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { useKanbanOptimized } from '@/hooks/useKanbanOptimized'
import { useKanbanColors } from './hooks/useKanbanColors'
import { useChatsKanban } from '@/hooks/useChatsKanban'
import { useTags } from '@/hooks/useTags'
import { useFilas } from '@/hooks/useFilas'
import { fetchApi } from '@/utils/api'

// Componentes componentizados
import KanbanHeader from './components/KanbanHeader'
import KanbanBoard from './components/KanbanBoard'
import KanbanColumn from './components/KanbanColumn'
import KanbanCardItem from './components/KanbanCardItem'
import ColumnConfigModal from './components/ColumnConfigModal'
import FunnelView from './components/FunnelView'

// TopBar
import AtendimentosTopBar from '../../atendimentos/components/AtendimentosTopBar'

// Modais
import CriarCardModal from '../components/CriarCardModal'
import ColorPickerModal from '../components/ColorPickerModal'
import ConexaoFilaModal from './components/ConexaoFilaModal'

// Bottom Sheets do Atendimento
import AgendamentoBottomSheet from '../../atendimento/components/FooterChatArea/BottomSheets/AgendamentoBottomSheet'
import OrcamentoBottomSheet from '../../atendimento/components/FooterChatArea/BottomSheets/OrcamentoBottomSheet'
import TagsBottomSheet from '../../atendimento/components/FooterChatArea/BottomSheets/TagsBottomSheet'
import AnotacoesBottomSheet from '../../atendimento/components/FooterChatArea/BottomSheets/AnotacoesBottomSheet'
import TicketBottomSheet from '../../atendimento/components/FooterChatArea/BottomSheets/TicketBottomSheet'
import ChatModalKanban from './components/ChatModalKanban'

// SideFilter do Atendimento (reutilizando)
import SideFilter from '../../atendimento/components/SideFilter'
// DnD Kit
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'

// Configuração de paginação para performance
const CARDS_PER_PAGE = 50 // Carregar 50 cards por vez
const MAX_VISIBLE_CARDS = 100 // Máximo de cards visíveis por coluna

function QuadroPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const quadroId = params.id as string

  // Hooks para buscar chats do WhatsApp e filtros avançados
  const { chats: whatsappChats, loading: loadingChats, error: errorChats } = useChatsKanban()
  const { tags, loading: loadingTags } = useTags()
  const { filas, loading: loadingFilas } = useFilas()
  
  // 🔍 DEBUG: Verificar quantos chats do WhatsApp temos
  useEffect(() => {
    console.log('🔍 [KANBAN] useChatsKanban carregou:', whatsappChats.length, 'chats')
    console.log('🔍 [KANBAN] Loading:', loadingChats)
    if (whatsappChats.length > 0) {
      console.log('🔍 [KANBAN] Primeiros 3 chats:', whatsappChats.slice(0, 3).map(c => ({ id: c.id, name: c.name })))
    }
  }, [whatsappChats.length, loadingChats])
  
  // Hook para cores do Kanban
  const kanbanColors = useKanbanColors()
  
  // 🔄 Buscar dados agregados de TODOS os cards (orçamentos, agendamentos, tickets)
  const [orcamentosDataState, setOrcamentosDataState] = useState<Record<string, any[]>>({})
  const [agendamentosDataState, setAgendamentosDataState] = useState<Record<string, any[]>>({})
  const [ticketsDataState, setTicketsDataState] = useState<Record<string, any[]>>({})
  
  // 🔄 Buscar dados agregados (logo após os useState)
  useEffect(() => {
    const fetchAllData = async () => {
      if (whatsappChats.length === 0) return
      
      const orcamentos: Record<string, any[]> = {}
      const agendamentos: Record<string, any[]> = {}
      const tickets: Record<string, any[]> = {}
      
      // Buscar para cada chat
      for (const chat of whatsappChats) {
        const chatId = chat.id
        
        try {
          // Orçamentos
          const pathOrc = `/api/chats/${encodeURIComponent(chatId)}/orcamentos`
          const orcRes = await fetchApi('backend', pathOrc)
          if (orcRes.ok) {
            const data = await orcRes.json()
            orcamentos[chatId] = Array.isArray(data) ? data : (data.data || [])
          }
        } catch {}
        
        try {
          // Agendamentos
          const pathAgend = `/api/chats/${encodeURIComponent(chatId)}/agendamentos`
          const agendRes = await fetchApi('backend', pathAgend)
          if (agendRes.ok) {
            const data = await agendRes.json()
            agendamentos[chatId] = Array.isArray(data) ? data : (data.data || [])
          }
        } catch {}
        
        try {
          // Tickets
          const pathTickets = `/api/chats/${encodeURIComponent(chatId)}/tickets`
          const ticketsRes = await fetchApi('backend', pathTickets)
          if (ticketsRes.ok) {
            const data = await ticketsRes.json()
            tickets[chatId] = Array.isArray(data) ? data : (data.data || [])
          }
        } catch {}
      }
      
      setOrcamentosDataState(orcamentos)
      setAgendamentosDataState(agendamentos)
      setTicketsDataState(tickets)
    }
    
    fetchAllData()
  }, [whatsappChats])
  
  // 🔄 Buscar colunas do backend - DIRETO NO USEEFFECT
  useEffect(() => {
    if (!quadroId) return
    const fetchColunas = async () => {
      try {
        setColunasLoading(true)
        const token = localStorage.getItem('token')
        
        const response = await fetch(`/api/kanban/quadros/${quadroId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.colunas && data.colunas.length > 0) {
            const colunasFormatadas = data.colunas
              .sort((a: any, b: any) => a.posicao - b.posicao)
              .map((col: any) => ({
                id: col.id,
                nome: col.nome,
                cor: col.cor || '#3B82F6',
                ordem: col.posicao
              }))
            
            setColunas(colunasFormatadas)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar colunas:', error)
      } finally {
        setColunasLoading(false)
      }
    }
    
    fetchColunas()
  }, [quadroId])

  // ✅ Passar chats do WhatsApp para sincronização automática
  const kanbanOptimized = useKanbanOptimized(quadroId, whatsappChats)

  const quadro = { 
    id: quadroId, 
    nome: 'Kanban WhatsApp', 
    descricao: 'Gestão de Chats do WhatsApp' 
  }
  
  // Extrair tags únicas dos cards para usar no filtro (fallback se useTags falhar)
  const tagsFromCards = useMemo(() => {
    // Aguardar kanbanOptimized carregar
    if (!kanbanOptimized.cards || Object.keys(kanbanOptimized.cards).length === 0) {
      console.log('🏷️ [KANBAN] Aguardando kanbanOptimized carregar...')
      return []
    }
    
    const tagsMap = new Map<string, { id: string; nome: string; cor?: string }>()
    Object.values(kanbanOptimized.cards).forEach((card: any) => {
      if (card.tags && Array.isArray(card.tags)) {
        card.tags.forEach((tag: any) => {
          if (tag.id && !tagsMap.has(tag.id)) {
            tagsMap.set(tag.id, {
              id: tag.id,
              nome: tag.nome || tag.name || 'Tag',
              cor: tag.cor || tag.color
            })
          }
        })
      }
    })
    const tagsArray = Array.from(tagsMap.values())
    console.log('🏷️ [KANBAN] Tags extraídas dos cards:', tagsArray.length, tagsArray)
    return tagsArray
  }, [kanbanOptimized.cards, kanbanOptimized.loading])
  
  // Usar tags do hook se disponível, senão usar tags dos cards
  const tagsParaFiltro = tags && tags.length > 0 ? tags : tagsFromCards

  // Estados principais
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasManualChanges, setHasManualChanges] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showFiltersSection, setShowFiltersSection] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all') // Filtro ativo (all, unread, favorites, etc)
  const [showMetrics, setShowMetrics] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Estados para filtros avançados (múltipla seleção)
  const [selectedTagsMulti, setSelectedTagsMulti] = useState<string[]>([])
  const [selectedFilasMulti, setSelectedFilasMulti] = useState<string[]>([])
  const [selectedConexoes, setSelectedConexoes] = useState<string[]>([])
  const [selectedAtendentes, setSelectedAtendentes] = useState<string[]>([])
  const [selectedQuadrosMulti, setSelectedQuadrosMulti] = useState<string[]>([])
  const [selectedKanbanColunas, setSelectedKanbanColunas] = useState<string[]>([])
  const [selectedTicketsMulti, setSelectedTicketsMulti] = useState<string[]>([])
  
  // Calcular contadores dos filtros
  const chatCounters = useMemo(() => {
    const counters = {
      total: whatsappChats.length,
      unread: whatsappChats.filter(chat => (chat.unreadCount || 0) > 0).length,
      read: whatsappChats.filter(chat => (chat.unreadCount || 0) === 0).length,
      groups: whatsappChats.filter(chat => chat.id?.includes('@g.us')).length,
      emAtendimento: whatsappChats.filter(chat => {
        const kanbanData = kanbanOptimized.cards?.[chat.id]
        const status = kanbanData?.status?.toLowerCase()
        const hasResponsavel = !!kanbanData?.responsavel
        return status === 'em_atendimento' || status === 'atendimento' || (hasResponsavel && !status)
      }).length,
      aguardando: whatsappChats.filter(chat => {
        const kanbanData = kanbanOptimized.cards?.[chat.id]
        const status = kanbanData?.status?.toLowerCase()
        const hasResponsavel = !!kanbanData?.responsavel
        return status === 'aguardando' || status === 'pendente' || (!hasResponsavel && !status)
      }).length,
      finalizado: whatsappChats.filter(chat => {
        const kanbanData = kanbanOptimized.cards?.[chat.id]
        const status = kanbanData?.status?.toLowerCase()
        return status === 'finalizado' || status === 'concluido'
      }).length,
      agentesIA: whatsappChats.filter(chat => {
        const kanbanData = kanbanOptimized.cards?.[chat.id]
        return kanbanData?.agentes && kanbanData.agentes.length > 0
      }).length,
      leadsQuentes: whatsappChats.filter(chat => {
        const kanbanData = kanbanOptimized.cards?.[chat.id]
        return (
          (kanbanData?.tags && kanbanData.tags.length > 0) ||
          (kanbanData?.agendamentos && kanbanData.agendamentos.length > 0) ||
          (kanbanData?.orcamentos && kanbanData.orcamentos.length > 0)
        )
      }).length
    }
    return counters
  }, [whatsappChats, kanbanOptimized.cards])
  
  // Estados das colunas do Kanban - carregadas do backend
  const [colunas, setColunas] = useState<any[]>([])
  const [colunasLoading, setColunasLoading] = useState(true)
  
  // Estados de edição
  const [editingQuadroTitle, setEditingQuadroTitle] = useState(false)
  const [editingQuadroDescription, setEditingQuadroDescription] = useState(false)
  const [editingQuadroName, setEditingQuadroName] = useState('')
  const [editingQuadroDescricao, setEditingQuadroDescricao] = useState('')
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingColumnName, setEditingColumnName] = useState('')

  // Estados de modais
  const [showCriarCardModal, setShowCriarCardModal] = useState(false)
  const [selectedColumnForCard, setSelectedColumnForCard] = useState<string | null>(null)
  const [showColorModal, setShowColorModal] = useState(false)
  const [selectedColumnForColor, setSelectedColumnForColor] = useState<any>(null)
  const [conexaoFilaModal, setConexaoFilaModal] = useState({ isOpen: false, card: null })
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [selectedColumnForConfig, setSelectedColumnForConfig] = useState<any>(null)
  const [showAddColunaModal, setShowAddColunaModal] = useState(false)
  const [novaColunaData, setNovaColunaData] = useState({ nome: '', cor: '#3B82F6' })
  const [colunaLoading, setColunaLoading] = useState(false)
  const [colunaError, setColunaError] = useState('')
  const [colunaSuccess, setColunaSuccess] = useState(false)
  
  // Estado para controlar a visualização ativa (kanban, funil, ncs)
  const [activeView, setActiveView] = useState<'kanban' | 'funnel' | 'ncs'>('kanban')
  
  // Estados dos BottomSheets
  const [showAgendamentoSheet, setShowAgendamentoSheet] = useState(false)
  const [showOrcamentoSheet, setShowOrcamentoSheet] = useState(false)
  const [showTagsSheet, setShowTagsSheet] = useState(false)
  const [showAnotacoesSheet, setShowAnotacoesSheet] = useState(false)
  const [showTicketsSheet, setShowTicketsSheet] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedChat, setSelectedChat] = useState<any>(null)
  
  // Estado para mapeamento de cards nas colunas (armazenamento local)
  const [cardColumnMapping, setCardColumnMapping] = useState<Record<string, string>>({})
  const [mappingLoaded, setMappingLoaded] = useState(false)
  
  // 🔥 SINCRONIZAR TODOS OS QUADROS DO LOCALSTORAGE COM O BANCO
  useEffect(() => {
    if (whatsappChats.length === 0) return
    
    const syncAllQuadrosToDatabase = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      
      // Buscar TODOS os mapeamentos de TODOS os quadros no localStorage
      const allMappings: Record<string, string> = {}
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('kanban-mapping-')) {
          try {
            const mapping = JSON.parse(localStorage.getItem(key) || '{}')
            Object.assign(allMappings, mapping)
          } catch (e) {
            console.error('Erro ao parsear mapping:', key)
          }
        }
      }
      
      const totalCards = Object.keys(allMappings).length
      if (totalCards === 0) return
      
      console.log('🔄 Sincronizando', totalCards, 'cards de TODOS os quadros...')
      
      let synced = 0
      let errors = 0
      
      for (const [chatId, columnId] of Object.entries(allMappings)) {
        try {
          // Ignorar chats inválidos (status, broadcast, etc)
          if (chatId.includes('status@broadcast') || chatId.includes('broadcast')) {
            console.log('⏭️ Ignorando chat inválido:', chatId)
            continue
          }
          
          const chat = whatsappChats.find((c: any) => c.id === chatId)
          if (!chat) continue
          
          const response = await fetch('/api/kanban/cards/upsert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              conversaId: chatId,
              colunaId: columnId,
              nome: chat.name || chat.pushName || chatId,
              posicao: 0
            })
          })
          
          if (response.ok) {
            synced++
          } else {
            errors++
          }
        } catch (error) {
          errors++
        }
      }
      
      console.log(`✅ Sincronização completa: ${synced} cards salvos, ${errors} erros`)
    }
    
    // Executar sincronização após 3 segundos (dar tempo pros chats carregarem)
    const timer = setTimeout(syncAllQuadrosToDatabase, 3000)
    return () => clearTimeout(timer)
  }, [whatsappChats])
  
  // Estados para DragOverlay (rastro visual)
  const [activeCard, setActiveCard] = useState<any>(null)
  const [activeColumn, setActiveColumn] = useState<any>(null)
  
  // Dados vazios para manter compatibilidade com componentes
  const emptyData = {}

  // DnD Sensors - CONFIGURAÇÃO MELHORADA para colunas e cards
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px para evitar drags acidentais
        delay: 0,
        tolerance: 5
      },
    })
  )

  // Carregar mapeamento DO BANCO DE DADOS (não do localStorage)
  useEffect(() => {
    const loadMappingFromDatabase = async () => {
      const token = localStorage.getItem('token')
      if (!token || !quadroId) return
      
      try {
        console.log('📥 [KANBAN] Carregando mapeamento do banco para quadro:', quadroId)
        
        // Buscar todos os cards do quadro do banco
        const response = await fetch(`/api/kanban/quadros/${quadroId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          console.error('❌ [KANBAN] Erro ao buscar quadro:', response.status)
          return
        }
        
        const data = await response.json()
        const colunas = data.colunas || []
        
        console.log('🔍 [KANBAN] Dados do banco:', {
          totalColunas: colunas.length,
          colunas: colunas.map((c: any) => ({
            id: c.id,
            nome: c.nome,
            totalCards: c.cards?.length || 0
          }))
        })
        
        // Construir mapeamento chatId -> colunaId do banco
        const mapping: Record<string, string> = {}
        let totalCards = 0
        
        colunas.forEach((coluna: any) => {
          const cards = coluna.cards || []
          console.log(`📋 [KANBAN] Coluna "${coluna.nome}" (${coluna.id}): ${cards.length} cards`)
          
          cards.forEach((card: any) => {
            // Backend retorna como conversaId (camelCase), não conversa_id (snake_case)
            const chatId = card.conversaId || card.conversa_id
            
            if (chatId) {
              mapping[chatId] = coluna.id
              totalCards++
              console.log(`  ✅ Card: ${chatId.slice(0, 20)} → ${coluna.nome}`)
            } else {
              console.log(`  ❌ Card SEM chatId:`, {
                id: card.id,
                nome: card.nome,
                conversaId: card.conversaId,
                conversa_id: card.conversa_id
              })
            }
          })
        })
        
        console.log(`✅ [KANBAN] Mapeamento carregado do banco: ${totalCards} cards`)
        setCardColumnMapping(mapping)
        setMappingLoaded(true)
        
        // Salvar no localStorage como backup
        localStorage.setItem(`kanban-mapping-${quadroId}`, JSON.stringify(mapping))
        
      } catch (error) {
        console.error('❌ [KANBAN] Erro ao carregar mapeamento do banco:', error)
        setMappingLoaded(true) // Marcar como carregado mesmo com erro
      }
    }
    
    loadMappingFromDatabase()
  }, [quadroId])

  // Salvar mapeamento no localStorage quando mudar
  useEffect(() => {
    if (Object.keys(cardColumnMapping).length > 0) {
      localStorage.setItem(`kanban-mapping-${quadroId}`, JSON.stringify(cardColumnMapping))
      setHasManualChanges(true)
    }
  }, [cardColumnMapping, quadroId])

  // Função REAL para criar coluna no backend
  const createColuna = async (data: any) => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token não encontrado')
    
    const response = await fetch('/api/kanban/column-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar coluna')
    }
    
    return await response.json()
  }

  const updateColuna = async (id: string, data: any) => {
    setColunas(prev => prev.map(col => 
      col.id === id ? { ...col, ...data } : col
    ))
  }

  const deleteColuna = async (id: string) => {
    setColunas(prev => prev.filter(col => col.id !== id))
  }

  const updateQuadro = async (id: string, data: any) => {
  }

  // Mapear chats do WhatsApp para as colunas
  const mapearConversasParaColunas = useCallback(() => {
    if (!colunas || colunas.length === 0) return []
    if (!whatsappChats || whatsappChats.length === 0) return colunas.map(col => ({ ...col, cards: [], totalCards: 0 }))
    
    // Filtrar chats baseado na busca
    let filteredChats = whatsappChats
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredChats = whatsappChats.filter(chat => 
        chat.name?.toLowerCase().includes(query) ||
        chat.id?.toLowerCase().includes(query) ||
        chat.lastMessage?.body?.toLowerCase().includes(query)
      )
    }

    // 🔥 APLICAR FILTROS AVANÇADOS (múltipla seleção)
    
    // Filtro por Tags (múltipla seleção)
    if (selectedTagsMulti.length > 0) {
      console.log('🏷️ [FILTRO TAGS] Selecionadas:', selectedTagsMulti)
      filteredChats = filteredChats.filter(chat => {
        const kanbanData = kanbanOptimized.cards?.[chat.id]
        const chatTags = kanbanData?.tags || []
        const chatTagIds = chatTags.map((tag: any) => tag.id || tag)
        console.log(`🏷️ [FILTRO TAGS] Chat ${chat.id} - tags:`, chatTags, 'IDs:', chatTagIds)
        return selectedTagsMulti.some(tagId => chatTagIds.includes(tagId))
      })
      console.log(`🔍 [FILTRO] Tags selecionadas: ${selectedTagsMulti.length}, Cards filtrados: ${filteredChats.length}`)
    }

    // Filtro por Filas (múltipla seleção)
    if (selectedFilasMulti.length > 0) {
      console.log('📋 [FILTRO FILAS] Selecionadas:', selectedFilasMulti)
      filteredChats = filteredChats.filter(chat => {
        const kanbanData = kanbanOptimized.cards?.[chat.id]
        const filaId = kanbanData?.fila?.id
        console.log(`📋 [FILTRO FILAS] Chat ${chat.id} - fila:`, kanbanData?.fila, 'fila.id:', filaId)
        return filaId && selectedFilasMulti.includes(filaId)
      })
      console.log(`🔍 [FILTRO] Filas selecionadas: ${selectedFilasMulti.length}, Cards filtrados: ${filteredChats.length}`)
    }

    // Filtro por Conexões (múltipla seleção)
    if (selectedConexoes.length > 0) {
      filteredChats = filteredChats.filter(chat => {
        const kanbanData = kanbanOptimized.cards?.[chat.id] as any
        const conexaoId = kanbanData?.conexao_id || kanbanData?.session_id
        return conexaoId && selectedConexoes.includes(conexaoId)
      })
      console.log(`🔍 [FILTRO] Conexões selecionadas: ${selectedConexoes.length}, Cards filtrados: ${filteredChats.length}`)
    }

    // Filtro por Atendentes (múltipla seleção)
    if (selectedAtendentes.length > 0) {
      filteredChats = filteredChats.filter(chat => {
        const kanbanData = kanbanOptimized.cards?.[chat.id]
        const responsavel = kanbanData?.responsavel
        return responsavel && selectedAtendentes.includes(responsavel)
      })
      console.log(`🔍 [FILTRO] Atendentes selecionados: ${selectedAtendentes.length}, Cards filtrados: ${filteredChats.length}`)
    }

    // Filtro por Colunas do Kanban (múltipla seleção)
    if (selectedKanbanColunas.length > 0) {
      filteredChats = filteredChats.filter(chat => {
        const colunaId = cardColumnMapping[chat.id]
        return colunaId && selectedKanbanColunas.includes(colunaId)
      })
      console.log(`🔍 [FILTRO] Colunas selecionadas: ${selectedKanbanColunas.length}, Cards filtrados: ${filteredChats.length}`)
    }

    // Filtro por Tickets/Prioridades (múltipla seleção)
    if (selectedTicketsMulti.length > 0) {
      filteredChats = filteredChats.filter(chat => {
        const kanbanData = kanbanOptimized.cards?.[chat.id] as any
        const prioridade = kanbanData?.prioridade || kanbanData?.ticket_prioridade
        return prioridade && selectedTicketsMulti.includes(prioridade)
      })
      console.log(`🔍 [FILTRO] Tickets selecionados: ${selectedTicketsMulti.length}, Cards filtrados: ${filteredChats.length}`)
    }

    // Aplicar ordenação
    if (sortBy === 'date') {
      filteredChats = filteredChats.sort((a, b) => {
        const timestampA = a.lastMessage?.timestamp || 0
        const timestampB = b.lastMessage?.timestamp || 0
        return sortOrder === 'desc' ? timestampB - timestampA : timestampA - timestampB
      })
    } else if (sortBy === 'name') {
      filteredChats = filteredChats.sort((a, b) => {
        const nameA = (a.name || a.id || '').toLowerCase()
        const nameB = (b.name || b.id || '').toLowerCase()
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      })
    }

    // Aplicar filtros baseados no activeFilter (igual ao Atendimento)
    switch (activeFilter) {
      case 'unread':
        filteredChats = filteredChats.filter(chat => (chat.unreadCount || 0) > 0)
        break
      case 'read':
        filteredChats = filteredChats.filter(chat => (chat.unreadCount || 0) === 0)
        break
      case 'read-no-reply':
        filteredChats = filteredChats.filter(chat => 
          (chat.unreadCount || 0) === 0 && !chat.lastMessage?.fromMe
        )
        break
      case 'groups':
        filteredChats = filteredChats.filter(chat => chat.id?.includes('@g.us'))
        break
      case 'favorites':
        // TODO: Implementar favoritos
        break
      case 'archived':
        // TODO: Implementar arquivados
        break
      case 'hidden':
        // TODO: Implementar ocultos
        break
      case 'em_atendimento':
        filteredChats = filteredChats.filter(chat => {
          const kanbanData = kanbanOptimized.cards?.[chat.id]
          const status = kanbanData?.status?.toLowerCase()
          const hasResponsavel = !!kanbanData?.responsavel
          
          if (status === 'em_atendimento' || status === 'atendimento') {
            return true
          } else if (hasResponsavel && !status) {
            return true
          }
          return false
        })
        break
      case 'aguardando':
        filteredChats = filteredChats.filter(chat => {
          const kanbanData = kanbanOptimized.cards?.[chat.id]
          const status = kanbanData?.status?.toLowerCase()
          const hasResponsavel = !!kanbanData?.responsavel
          
          if (status === 'aguardando' || status === 'pendente') {
            return true
          } else if (!hasResponsavel && !status) {
            return true
          }
          return false
        })
        break
      case 'finalizado':
        filteredChats = filteredChats.filter(chat => {
          const kanbanData = kanbanOptimized.cards?.[chat.id]
          const status = kanbanData?.status?.toLowerCase()
          return status === 'finalizado' || status === 'concluido'
        })
        break
      case 'agentes_ia':
        filteredChats = filteredChats.filter(chat => {
          const kanbanData = kanbanOptimized.cards?.[chat.id]
          return kanbanData?.agentes && kanbanData.agentes.length > 0
        })
        break
      case 'leads_quentes':
        filteredChats = filteredChats.filter(chat => {
          const kanbanData = kanbanOptimized.cards?.[chat.id]
          return (
            (kanbanData?.tags && kanbanData.tags.length > 0) ||
            (kanbanData?.agendamentos && kanbanData.agendamentos.length > 0) ||
            (kanbanData?.orcamentos && kanbanData.orcamentos.length > 0)
          )
        })
        break
      case 'all':
      default:
        // Mostrar todos (sem filtro adicional)
        break
    }

    // Mapear chats para colunas
    const columnasComCards = colunas.map(coluna => {
      // Pegar apenas os chats que estão mapeados para esta coluna
      const cardsNaColuna = filteredChats.filter(chat => {
        const colunaId = cardColumnMapping[chat.id]
        
        // 🔥 IMPORTANTE: Se mapeamento ainda não foi carregado, NÃO mostrar cards
        if (!mappingLoaded) {
          return false
        }
        
        // Se não tem mapeamento E já carregou, vai para primeira coluna por padrão
        if (!colunaId) {
          return coluna.ordem === 0 || coluna.id === colunas[0].id
        }
        return colunaId === coluna.id
      })

      // Limitar quantidade de cards visíveis para performance
      const cardsVisiveis = cardsNaColuna.slice(0, MAX_VISIBLE_CARDS)


      // Adicionar os dados corretos do chat (nome, telefone, etc) + dados do useKanbanOptimized
      const cardsFormatados = cardsVisiveis.map((chat, index) => {
        // Buscar dados do useKanbanOptimized para este chat
        const kanbanData = kanbanOptimized.cards?.[chat.id] || {}
        
        return {
          ...chat,
          // Priorizar nome do pushName, depois name, depois extrair do ID
          nome: chat.pushName || chat.name || chat.id?.replace('@c.us', '').replace('@g.us', '') || 'Sem nome',
          name: chat.pushName || chat.name || chat.id?.replace('@c.us', '').replace('@g.us', '') || 'Sem nome',
          phone: chat.id?.replace('@c.us', '').replace('@g.us', ''), // Extrair número do ID
          chatId: chat.id, // Manter o ID original do chat
          // 🔥 ADICIONAR dados do useKanbanOptimized (fila, status, atendente, etc)
          ...kanbanData
        }
      })

      return {
        ...coluna,
        cards: cardsFormatados,
        totalCards: cardsNaColuna.length // Guardar total real
      }
    })

    return columnasComCards
  }, [
    colunas, 
    whatsappChats, 
    cardColumnMapping, 
    searchQuery, 
    mappingLoaded, 
    kanbanOptimized.cards, 
    activeFilter, 
    sortBy, 
    sortOrder,
    selectedTagsMulti,
    selectedFilasMulti,
    selectedConexoes,
    selectedAtendentes,
    selectedKanbanColunas,
    selectedTicketsMulti
  ])

  // Handlers de edição do quadro
  const handleDoubleClickQuadroTitle = () => {
    setEditingQuadroTitle(true)
    setEditingQuadroName(quadro?.nome || '')
  }

  const handleDoubleClickQuadroDescription = () => {
    setEditingQuadroDescription(true)
    setEditingQuadroDescricao(quadro?.descricao || '')
  }

  const handleSaveQuadroTitle = async () => {
    if (editingQuadroName && editingQuadroName !== quadro?.nome) {
      await updateQuadro(quadroId, { nome: editingQuadroName })
    }
    setEditingQuadroTitle(false)
  }

  const handleSaveQuadroDescription = async () => {
    if (editingQuadroDescricao !== quadro?.descricao) {
      await updateQuadro(quadroId, { descricao: editingQuadroDescricao })
    }
    setEditingQuadroDescription(false)
  }

  // Handlers de coluna
  const handleDoubleClickColumn = (coluna: any) => {
    setEditingColumnId(coluna.id)
    setEditingColumnName(coluna.nome)
  }

  const handleSaveColumnName = async (columnId: string) => {
    if (editingColumnName) {
      await updateColuna(columnId, { nome: editingColumnName })
    }
    setEditingColumnId(null)
  }

  const handleDeleteColumn = async (columnId: string) => {
    if (confirm('Tem certeza que deseja excluir esta coluna?')) {
      await deleteColuna(columnId)
    }
  }

  // 🗑️ Função para deletar coluna com realocação de contatos
  const handleDeleteWithReallocation = async (columnId: string, targetColumnId: string) => {
    try {
      
      // 1. Encontrar a coluna que será deletada
      const sourceColumn = colunasComCards.find(col => col.id === columnId)
      if (!sourceColumn || !sourceColumn.cards) {
        console.error('❌ Coluna de origem não encontrada')
        return
      }

      // 2. Mover todos os cards para a coluna de destino
      // TODO: Implementar API para mover cards em lote
      // Por enquanto, vamos simular movendo um por um
      for (const card of sourceColumn.cards) {
        // await moveCardToColumn(card.id, targetColumnId)
      }

      // 3. Deletar a coluna vazia
      await deleteColuna(columnId)
    } catch (error) {
      console.error('❌ Erro ao realocar contatos:', error)
      alert('Erro ao realocar contatos. Tente novamente.')
    }
  }

  const handleAddCard = (columnId: string) => {
    setSelectedColumnForCard(columnId)
    setShowCriarCardModal(true)
  }

  // 🗑️ Função para deletar card do Kanban
  const handleDeleteCard = async (card: any) => {
    if (!confirm(`Tem certeza que deseja remover "${card.nome || card.name}" do Kanban?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/cards/${card.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        console.log('✅ Card removido do Kanban:', card.id)
        // Recarregar dados
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(`Erro ao remover card: ${errorData.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('❌ Erro ao deletar card:', error)
      alert('Erro ao remover card do Kanban')
    }
  }

  // Abre o modal para adicionar coluna
  const handleAddColuna = () => {
    setNovaColunaData({ nome: '', cor: '#3B82F6' })
    setColunaError('')
    setColunaSuccess(false)
    setShowAddColunaModal(true)
  }

  // Salva a nova coluna no backend
  const handleSaveColuna = async () => {
    if (!novaColunaData.nome.trim()) {
      setColunaError('Digite um nome para a coluna')
      return
    }
    
    if (novaColunaData.nome.length > 50) {
      setColunaError('O nome da coluna deve ter no máximo 50 caracteres')
      return
    }
    
    setColunaLoading(true)
    setColunaError('')
    
    try {
      const payload = {
        nome: novaColunaData.nome,
        cor: novaColunaData.cor,
        posicao: colunas.length,
        quadroId: quadroId
      }
      
      await createColuna(payload)
      
      setColunaSuccess(true)
      
      // Recarregar página inteira para garantir que vê a nova coluna
      setTimeout(() => {
        window.location.reload()
      }, 800)
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO:', {
        message: error.message,
        stack: error.stack,
        error: error
      })
      setColunaError(`Erro: ${error.message || 'Falha ao criar coluna'}`)
    } finally {
      setColunaLoading(false)
    }
  }

  // Handler para início do drag - RASTRO VISUAL
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    
    // Verificar se é um card sendo arrastado
    const colunasComCards = mapearConversasParaColunas()
    const cardArrastado = colunasComCards
      .flatMap(col => col.cards)
      .find(card => card.id === active.id)
    
    if (cardArrastado) {
      setActiveCard(cardArrastado)
      return
    }

    // Verificar se é uma coluna sendo arrastada
    const colunaArrastada = colunas.find(col => col.id === active.id)
    if (colunaArrastada) {
      setActiveColumn(colunaArrastada)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // Limpar estados ativos do rastro visual
    setActiveCard(null)
    setActiveColumn(null)
    
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string

    // 🔄 Verificar se está reordenando colunas
    const isColumnDrag = colunas.some(col => col.id === activeId)
    
    if (isColumnDrag && over.data.current?.type === 'column') {
      let targetColumnId = overId
      
      // Se o overId é de um card, pegar a coluna do card
      if (!colunas.some(col => col.id === overId)) {
        // Procurar em qual coluna está o elemento
        for (const coluna of colunasComCards) {
          if (coluna.cards?.some((card: any) => card.id === overId)) {
            targetColumnId = coluna.id
            break
          }
        }
      }
      
      // Se encontrou uma coluna válida e é diferente da origem
      if (colunas.some(col => col.id === targetColumnId) && activeId !== targetColumnId) {
        // Reordenar colunas
        const oldIndex = colunas.findIndex(col => col.id === activeId)
        const newIndex = colunas.findIndex(col => col.id === targetColumnId)
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newColunas = arrayMove(colunas, oldIndex, newIndex)
          setColunas(newColunas)
        }
      }
    } else if (!isColumnDrag) {
      // Lógica para mover cards
      let newColumnId = null
      
      // Se soltou diretamente sobre uma coluna
      if (over.data.current?.type === 'column') {
        newColumnId = overId
      }
      // Se soltou sobre outro card, usar a coluna desse card
      else if (overId !== activeId && cardColumnMapping[overId]) {
        newColumnId = cardColumnMapping[overId]
      }
      // Se não encontrou coluna específica, usar a primeira coluna disponível
      else if (colunas.length > 0) {
        newColumnId = colunas[0].id
      }

      // Atualizar mapeamento se temos uma coluna válida
      if (newColumnId) {
        setCardColumnMapping(prev => ({
          ...prev,
          [activeId]: newColumnId
        }))
        
        // 🔥 CRIAR/ATUALIZAR CARD NO BANCO
        const saveCardToDatabase = async () => {
          try {
            const token = localStorage.getItem('token')
            if (!token) return
            
            // Buscar dados do chat
            const chat = whatsappChats.find((c: any) => c.id === activeId)
            if (!chat) return
            
            const response = await fetch('/api/kanban/cards/upsert', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                conversaId: activeId,
                colunaId: newColumnId,
                nome: chat.name || chat.pushName || activeId,
                posicao: 0 // Sempre no topo
              })
            })
            
            if (!response.ok) {
              console.error('❌ Erro ao salvar card no banco:', await response.text())
            } else {
              console.log('✅ Card salvo no banco:', activeId, '→', newColumnId)
            }
          } catch (error) {
            console.error('❌ Erro ao salvar card:', error)
          }
        }
        
        saveCardToDatabase()
      }
    }
  }

  // 🔥 SINCRONIZAR MANUALMENTE TODOS OS CARDS
  const syncAllCardsManually = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Token não encontrado!')
      return
    }
    
    // 🎯 Buscar TODOS os chats do WhatsApp DIRETO do backend
    try {
      // ✅ USAR ROTA PROXY PARA FUNCIONAR EM PRODUÇÃO
      const sessionName = 'user_fb8da1d7_1758158816675' // Session padrão
      
      const response = await fetch(`/api/whatsapp/chats/cached?session=${sessionName}&limit=10000&offset=0`, {
        headers: { 
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao buscar chats')
      }
      
      const todosOsChats = await response.json()
      
      // Backend retorna array direto
      if (!Array.isArray(todosOsChats)) {
        throw new Error('Resposta inválida do backend')
      }
      
      if (todosOsChats.length === 0) {
        alert('Nenhum chat encontrado!')
        return
      }
      
      // Usar primeira coluna do quadro
      const primeiraColuna = colunas[0]
      if (!primeiraColuna) {
        alert('Nenhuma coluna encontrada no quadro!')
        return
      }
      
      if (!confirm(`🎯 Criar ${todosOsChats.length} cards na coluna "${primeiraColuna.nome}"?`)) {
        return
      }
      
      setLoading(true)
      console.log('🔄 [MANUAL] Criando', todosOsChats.length, 'cards...')
      
      let synced = 0
      let errors = 0
      
      // Criar cards em lote (10 por vez)
      const batchSize = 10
      for (let i = 0; i < todosOsChats.length; i += batchSize) {
        const batch = todosOsChats.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(async (chat: any) => {
            try {
              // Validar se chat tem ID
              if (!chat?.id) {
                console.warn('⚠️ Chat sem ID:', chat)
                return
              }

              const res = await fetch('/api/kanban/cards/upsert', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  conversaId: chat.id,
                  colunaId: primeiraColuna.id,
                  nome: chat.name || (chat.id ? chat.id.split('@')[0] : 'Sem nome'), // Usar número do telefone como nome
                  posicao: 0
                })
              })
              
              if (res.ok) {
                synced++
                console.log('✅', chat.id)
              } else {
                errors++
                console.error('❌', chat.id, await res.text())
              }
            } catch (error) {
              errors++
              console.error('❌', chat.id, error)
            }
          })
        )
        
        // Pequeno delay entre lotes
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      setLoading(false)
      alert(`✅ Sincronização completa!\n${synced} cards criados\n${errors} erros`)
      refreshData()
      
    } catch (error) {
      setLoading(false)
      alert(`❌ Erro: ${error}`)
      console.error('❌ Erro ao sincronizar cards:', error)
    }
  }

  // Funções auxiliares
  const refreshData = async () => {
    setLoading(true)
    if (kanbanOptimized.forceRefresh) {
      await kanbanOptimized.forceRefresh()
    }
    setLoading(false)
  }
  const resetAndRemap = () => {
    setCardColumnMapping({})
    localStorage.removeItem(`kanban-mapping-${quadroId}`)
    setHasManualChanges(false)
  }

  const openColorModal = (coluna: any) => {
    setSelectedColumnForColor(coluna)
    setShowColorModal(true)
  }

  // Handlers dos BottomSheets
  
  // Funções de abertura dos modais
  const onOpenChat = (card: any) => {
    setSelectedChat(card)
    setShowChatModal(true)
  }
  
  const onOpenOrcamento = (card: any) => {
    setSelectedChat(card)
    setShowOrcamentoSheet(true)
  }
  
  const onOpenAgendamento = (card: any) => {
    setSelectedChat(card)
    setShowAgendamentoSheet(true)
  }
  
  const onOpenTags = (card: any) => {
    setSelectedChat(card)
    setShowTagsSheet(true)
  }
  
  const onOpenAnotacoes = (card: any) => {
    setSelectedChat(card)
    setShowAnotacoesSheet(true)
  }
  
  const onOpenTickets = (card: any) => {
    setSelectedChat(card)
    setShowTicketsSheet(true)
  }

  if (loadingChats) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-white/60' : 'text-gray-600'
          }`}>
            Carregando chats do WhatsApp...
          </p>
          <p className={`text-xs mt-2 opacity-50 ${
            theme === 'dark' ? 'text-white/40' : 'text-gray-400'
          }`}>
            Fazendo request para /api/whatsapp/chats
          </p>
        </div>
      </div>
    )
  }

  // Mostrar erro se houver (DEPOIS de todos os hooks)
  if (errorChats) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
      }`}>
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Erro ao Carregar Chats
          </h2>
          <p className={`text-xs mb-4 opacity-50 ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            {errorChats}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Tentar Novamente
            </button>
            
            {errorChats?.includes('Token') && (
              <button
                onClick={() => router.push('/login')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                Fazer Login
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const colunasComCards = mapearConversasParaColunas()

  return (
    <div 
      className="min-h-screen transition-all duration-500"
      style={{
        background: kanbanColors.board.bgImage 
          ? `linear-gradient(to bottom right, ${kanbanColors.board.bgPrimary}dd, ${kanbanColors.board.bgSecondary}dd), url(${kanbanColors.board.bgImage})`
          : `linear-gradient(to bottom right, ${kanbanColors.board.bgPrimary}, ${kanbanColors.board.bgSecondary})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      
      {/* TopBar Original */}
      <AtendimentosTopBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Header Componentizado */}
      <KanbanHeader 
        theme={theme}
        quadro={quadro || { nome: '', descricao: '' }}
        chats={whatsappChats}
        colunas={colunas}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={loadingChats}
        showMetrics={showMetrics}
        onToggleMetrics={() => setShowMetrics(!showMetrics)}
        hasManualChanges={hasManualChanges}
        showShortcuts={showShortcuts}
        editingQuadroTitle={editingQuadroTitle}
        editingQuadroDescription={editingQuadroDescription}
        editingQuadroName={editingQuadroName}
        editingQuadroDescricao={editingQuadroDescricao}
        mapearConversasParaColunas={mapearConversasParaColunas}
        refreshData={refreshData}
        resetAndRemap={resetAndRemap}
        syncAllCardsManually={syncAllCardsManually}
        setShowShortcuts={setShowShortcuts}
        handleDoubleClickQuadroTitle={handleDoubleClickQuadroTitle}
        handleDoubleClickQuadroDescription={handleDoubleClickQuadroDescription}
        handleSaveQuadroTitle={handleSaveQuadroTitle}
        handleSaveQuadroDescription={handleSaveQuadroDescription}
        setEditingQuadroName={setEditingQuadroName}
        setEditingQuadroDescricao={setEditingQuadroDescricao}
        activeView={activeView}
        onViewChange={setActiveView}
        showFiltersSection={showFiltersSection}
        setShowFiltersSection={setShowFiltersSection}
      />

      {/* Seção de Filtros - Importado do Atendimento - Controlado pelo botão no header */}
      {showFiltersSection && (
        <SideFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag=""
          onTagChange={() => {}}
          tags={tagsParaFiltro}
          selectedTagsMulti={selectedTagsMulti}
          onTagsMultiChange={setSelectedTagsMulti}
          hideQuadrosFilter={true}
          preloadedColunas={colunas}
          selectedFila=""
          onFilaChange={() => {}}
          filas={filas || []}
          selectedFilasMulti={selectedFilasMulti}
          onFilasMultiChange={setSelectedFilasMulti}
          selectedConexoes={selectedConexoes}
          onConexoesChange={setSelectedConexoes}
          selectedAtendentes={selectedAtendentes}
          onAtendentesChange={setSelectedAtendentes}
          selectedQuadrosMulti={selectedQuadrosMulti}
          onQuadrosMultiChange={setSelectedQuadrosMulti}
          selectedKanbanColunas={selectedKanbanColunas}
          onKanbanColunasChange={setSelectedKanbanColunas}
          selectedTicketsMulti={selectedTicketsMulti}
          onTicketsMultiChange={setSelectedTicketsMulti}
          kanbanStatuses={[]}
          ticketStatuses={[]}
          priceRanges={[]}
          selectedKanbanStatus=""
          selectedTicketStatus=""
          selectedPriceRange=""
          selectedStatusFilter="all"
          onStatusFilterChange={() => {}}
          isLoadingTags={loadingTags}
          isLoadingFilas={loadingFilas}
          isLoadingKanban={false}
          isLoadingTickets={false}
          isLoadingAtendentes={false}
          totalChats={chatCounters.total}
          unreadChats={chatCounters.unread}
          readChats={chatCounters.read}
          archivedChats={0}
          groupChats={chatCounters.groups}
          favoriteChats={0}
          hiddenChats={0}
          emAtendimentoChats={chatCounters.emAtendimento}
          aguardandoChats={chatCounters.aguardando}
          finalizadoChats={chatCounters.finalizado}
          agentesIAChats={chatCounters.agentesIA}
          leadsQuentesChats={chatCounters.leadsQuentes}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchOptions={{ searchInChats: true, searchInMessages: false, searchInContacts: false }}
          onSearchOptionsChange={() => {}}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy)
            setSortOrder(newSortOrder)
          }}
        />
      )}

      {/* Renderização condicional baseada na view ativa */}
      {activeView === 'funnel' && (
        <FunnelView 
          theme={theme}
          colunas={colunas}
          chats={whatsappChats}
        />
      )}

      {activeView === 'ncs' && (
        <div className="p-6">
          <h2 className="text-2xl font-bold">NCS Analytics - Em breve</h2>
        </div>
      )}

      {/* Board Kanban com DnD - Só mostra quando activeView === 'kanban' */}
      {activeView === 'kanban' && (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        autoScroll={{ threshold: { x: 0.2, y: 0.2 } }}
      >
        <KanbanBoard theme={theme}>
          <SortableContext
            items={colunas.map(col => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            {/* Renderizar colunas */}
            {colunasComCards.map((coluna) => (
              <KanbanColumn
                key={coluna.id}
                coluna={coluna}
                theme={theme}
                notesCount={{}}
                orcamentosCount={{}}
                agendamentosCount={{}}
                assinaturasCount={{}}
                anotacoesCount={{}}
                tagsCount={{}}
                ticketsCount={{}}
                agentesCount={{}}
                contactStatus={{}}
                orcamentosData={orcamentosDataState}
                agendamentosData={agendamentosDataState}
                assinaturasData={{}}
                anotacoesData={{}}
                tagsData={{}}
                ticketsData={ticketsDataState}
                agentesData={{}}
                editingColumnId={editingColumnId}
                editingColumnName={editingColumnName}
                onDoubleClick={handleDoubleClickColumn}
                onDelete={handleDeleteColumn}
                onEditingNameChange={setEditingColumnName}
                onSaveColumnName={handleSaveColumnName}
                onOpenColorModal={openColorModal}
                handleAddCard={handleAddCard}
                onOpenAgendamento={onOpenAgendamento}
                onOpenOrcamento={onOpenOrcamento}
                onOpenTags={onOpenTags}
                onOpenChat={onOpenChat}
                showMetrics={showMetrics}
                onOpenConfig={(coluna) => {
                  setSelectedColumnForConfig(coluna)
                  setShowConfigModal(true)
                }}
                onOpenAnotacoes={onOpenAnotacoes}
                onOpenTickets={onOpenTickets}
                onDeleteCard={handleDeleteCard}
                // 🗑️ Props para modal de confirmação de exclusão
                allColumns={colunasComCards}
                onDeleteWithReallocation={handleDeleteWithReallocation}
              />
            ))}

            {/* Botão de adicionar coluna */}
            <motion.button
              onClick={handleAddColuna}
              className={`w-80 min-h-[650px] rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                theme === 'dark'
                  ? 'border-slate-600/50 hover:border-blue-400/50 hover:bg-slate-800/30'
                  : 'border-gray-300/50 hover:border-blue-400/50 hover:bg-blue-50/30'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-8 h-8 opacity-50" />
              <span className={`text-sm font-medium opacity-50 ${
                theme === 'dark' ? 'text-white' : 'text-gray-700'
              }`}>
                Adicionar Coluna
              </span>
            </motion.button>
          </SortableContext>
        </KanbanBoard>

        {/* 🎯 RASTRO VISUAL SLICK - DragOverlay */}
        <DragOverlay>
          {activeCard && (
            <motion.div 
              className="drag-ghost-card"
              initial={{ scale: 1, rotate: 0 }}
              animate={{ 
                scale: 1.05, 
                rotate: 3,
                y: -10
              }}
              style={{
                opacity: 0.95,
                filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.4)) drop-shadow(0 10px 20px rgba(59,130,246,0.3))',
                pointerEvents: 'none',
                zIndex: 1000
              }}
            >
              <KanbanCardItem 
                card={activeCard}
                columnColor="#3b82f6"
                theme={theme}
              />
            </motion.div>
          )}
          {activeColumn && (
            <motion.div 
              className="drag-ghost-column"
              initial={{ scale: 1, rotate: 0 }}
              animate={{ 
                scale: 0.95, 
                rotate: 1,
                y: -5
              }}
              style={{
                opacity: 0.85,
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                pointerEvents: 'none',
                zIndex: 1000
              }}
            >
              <div className={`w-80 p-4 rounded-xl border-2 border-dashed border-blue-400/60 ${
                theme === 'dark' 
                  ? 'bg-slate-800/95 backdrop-blur-lg' 
                  : 'bg-white/95 backdrop-blur-lg'
              }`}>
                <h3 className="font-bold text-blue-500 text-center flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    📦
                  </motion.span>
                  {activeColumn.nome}
                </h3>
              </div>
            </motion.div>
          )}
        </DragOverlay>
      </DndContext>
      )}

      {/* MODAIS REAIS DA OLDPAGE */}

      {/* Modal Adicionar Coluna */}
      {showAddColunaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-xl"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Nova Coluna
            </h3>
            
            {/* Mensagens de Status */}
            {colunaError && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">❌ {colunaError}</p>
              </div>
            )}
            
            {colunaSuccess && (
              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">✅ Coluna criada com sucesso!</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da Coluna
                </label>
                <input
                  type="text"
                  value={novaColunaData.nome}
                  onChange={(e) => setNovaColunaData({ ...novaColunaData, nome: e.target.value })}
                  disabled={colunaLoading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  placeholder="Ex: Em Progresso"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cor
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={novaColunaData.cor}
                    onChange={(e) => setNovaColunaData({ ...novaColunaData, cor: e.target.value })}
                    disabled={colunaLoading}
                    className="w-20 h-10 rounded cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {novaColunaData.cor}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAddColunaModal(false)}
                disabled={colunaLoading}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveColuna}
                disabled={colunaLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {colunaLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Coluna'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Agendamento Bottom Sheet */}
      {showAgendamentoSheet && selectedChat && (
        <AgendamentoBottomSheet 
          isOpen={showAgendamentoSheet}
          onClose={() => {
            setShowAgendamentoSheet(false)
            kanbanOptimized.forceRefresh() // ✅ Atualizar Kanban
          }}
          chatId={selectedChat.id}
        />
      )}

      {/* Orçamento Bottom Sheet */}
      {showOrcamentoSheet && selectedChat && (
        <OrcamentoBottomSheet 
          isOpen={showOrcamentoSheet}
          onClose={() => {
            setShowOrcamentoSheet(false)
            kanbanOptimized.forceRefresh() // ✅ Atualizar Kanban
          }}
          chatId={selectedChat.id}
        />
      )}

      {/* Tags Bottom Sheet */}  
      {showTagsSheet && selectedChat && (
        <TagsBottomSheet 
          isOpen={showTagsSheet}
          onClose={() => {
            setShowTagsSheet(false)
            kanbanOptimized.forceRefresh() // ✅ Atualizar Kanban
          }}
          chatId={selectedChat.id}
        />
      )}

      {/* Anotações Bottom Sheet */}
      {showAnotacoesSheet && selectedChat && (
        <AnotacoesBottomSheet 
          isOpen={showAnotacoesSheet}
          onClose={() => {
            setShowAnotacoesSheet(false)
            kanbanOptimized.forceRefresh() // ✅ Atualizar Kanban
          }}
          chatId={selectedChat.id}
        />
      )}

      {/* Chat Modal Kanban - REAL */}
      {showChatModal && selectedChat && (
        <ChatModalKanban 
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          card={selectedChat}
          theme={theme}
        />
      )}

      {/* Tickets Bottom Sheet - REAL */}
      {showTicketsSheet && selectedChat && (
        <TicketBottomSheet 
          isOpen={showTicketsSheet}
          onClose={() => {
            setShowTicketsSheet(false)
            kanbanOptimized.forceRefresh() // ✅ Atualizar Kanban
          }}
          chatId={selectedChat.id}
        />
      )}

      {/* 🎨 Color Picker Modal */}
      <ColorPickerModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
        currentColor={selectedColumnForColor?.cor || '#3B82F6'}
        onColorSelect={async (color: string) => {
          if (selectedColumnForColor) {
            await updateColuna(selectedColumnForColor.id, { cor: color })
            setShowColorModal(false)
            setSelectedColumnForColor(null)
          }
        }}
        columnName={selectedColumnForColor?.nome || ''}
      />

      {/* ⚙️ Column Config Modal */}
      {selectedColumnForConfig && (
        <ColumnConfigModal
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false)
            setSelectedColumnForConfig(null)
          }}
          coluna={selectedColumnForConfig}
          theme={theme}
        />
      )}
    </div>
  )
}

export default QuadroPage
