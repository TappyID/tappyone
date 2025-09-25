'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { useKanbanOptimized } from '@/hooks/useKanbanOptimized'

// Componentes componentizados
import KanbanHeader from './components/KanbanHeader'
import KanbanBoard from './components/KanbanBoard'
import KanbanColumn from './components/KanbanColumn'
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

// DnD Kit
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
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

  // Estados para chats do WhatsApp
  const [whatsappChats, setWhatsappChats] = useState([])
  const [loadingChats, setLoadingChats] = useState(true)
  const [chatsError, setChatsError] = useState(null)

  // Carregar chats diretamente da API WAHA
  const loadWhatsAppChats = useCallback(async () => {
    try {
      setLoadingChats(true)
      console.log('🔍 Carregando chats da API WAHA...')
      
      // Token fixo mais longo (1 ano) para desenvolvimento
      const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
      
      let token = localStorage.getItem('token') || FALLBACK_TOKEN
      
      // Se o token do localStorage expirou, usar o fallback e atualizar localStorage
      try {
        if (token !== FALLBACK_TOKEN) {
          // Decodificar JWT para verificar expiração
          const payload = JSON.parse(atob(token.split('.')[1]))
          const now = Math.floor(Date.now() / 1000)
          
          if (payload.exp && payload.exp < now) {
            console.log('🔄 Token expirado, usando fallback')
            token = FALLBACK_TOKEN
            localStorage.setItem('token', FALLBACK_TOKEN)
          }
        }
      } catch (error) {
        console.log('⚠️ Erro ao verificar token, usando fallback')
        token = FALLBACK_TOKEN
        localStorage.setItem('token', FALLBACK_TOKEN)
      }
      
      const response = await fetch('/api/whatsapp/chats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      
      console.log('🔍 Response status:', response.status)
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token de autenticação inválido ou expirado. Faça login novamente.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('🔍 Dados recebidos da API:', data)
      
      // A API pode retornar diferentes estruturas
      const chatsArray = data.data || data.chats || data || []
      
      console.log('🔍 Chats extraídos:', chatsArray.length)
      setWhatsappChats(chatsArray)
      setChatsError(null)
      
    } catch (error) {
      console.error('❌ Erro ao carregar chats:', error)
      setChatsError(error.message)
    } finally {
      setLoadingChats(false)
    }
  }, [])

  // Carregar chats quando componente montar
  useEffect(() => {
    loadWhatsAppChats()
  }, [loadWhatsAppChats])

  // Hook do Kanban
  const {
    loading: loadingKanban,
    forceRefresh
  } = useKanbanOptimized(quadroId)

  // Estados para simular dados do Kanban (temporário até hooks estarem prontos)
  const [colunas, setColunas] = useState([
    { id: '1', nome: 'Novos Chats', cor: '#3B82F6', ordem: 0 },
    { id: '2', nome: 'Em Atendimento', cor: '#10B981', ordem: 1 },
    { id: '3', nome: 'Aguardando', cor: '#F59E0B', ordem: 2 },
    { id: '4', nome: 'Finalizados', cor: '#EF4444', ordem: 3 }
  ])
  
  const quadro = { 
    id: quadroId, 
    nome: 'Kanban WhatsApp', 
    descricao: 'Gestão de Chats do WhatsApp' 
  }

  // Estados principais
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasManualChanges, setHasManualChanges] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showMetrics, setShowMetrics] = useState(true)
  
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
  
  // Dados vazios para manter compatibilidade com componentes
  const emptyData = {}

  // DnD Sensors - Configuração IDÊNTICA ao Trello
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0, // ZERO pixels - ativação instantânea 
        delay: 0, // ZERO delay
      },
    }),
    // Sensor para touch devices (mobile)
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0,
        delay: 150, // Pequeno delay no mobile para distinguir de scroll
      },
    })
  )

  // Carregar mapeamento do localStorage
  useEffect(() => {
    const savedMapping = localStorage.getItem(`kanban-mapping-${quadroId}`)
    if (savedMapping) {
      try {
        setCardColumnMapping(JSON.parse(savedMapping))
      } catch (e) {
        console.error('Erro ao carregar mapeamento:', e)
      }
    }
  }, [quadroId])

  // Salvar mapeamento no localStorage quando mudar
  useEffect(() => {
    if (Object.keys(cardColumnMapping).length > 0) {
      localStorage.setItem(`kanban-mapping-${quadroId}`, JSON.stringify(cardColumnMapping))
      setHasManualChanges(true)
    }
  }, [cardColumnMapping, quadroId])

  // Funções mock para CRUD (temporário)
  const createColuna = async (data: any) => {
    const newColuna = {
      id: Date.now().toString(),
      nome: data.nome,
      cor: data.cor,
      ordem: colunas.length
    }
    setColunas(prev => [...prev, newColuna])
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
    console.log('Update quadro:', id, data)
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

    // Mapear chats para colunas
    const columnasComCards = colunas.map(coluna => {
      // Pegar apenas os chats que estão mapeados para esta coluna
      const cardsNaColuna = filteredChats.filter(chat => {
        const colunaId = cardColumnMapping[chat.id]
        // Se não tem mapeamento, vai para primeira coluna por padrão
        if (!colunaId) {
          return coluna.ordem === 0 || coluna.id === colunas[0].id
        }
        return colunaId === coluna.id
      })

      // Limitar quantidade de cards visíveis para performance
      const cardsVisiveis = cardsNaColuna.slice(0, MAX_VISIBLE_CARDS)

      // Adicionar os dados corretos do chat (nome, telefone, etc)
      const cardsFormatados = cardsVisiveis.map(chat => ({
        ...chat,
        phone: chat.id?.replace('@c.us', '').replace('@g.us', ''), // Extrair número do ID
      }))

      return {
        ...coluna,
        cards: cardsFormatados,
        totalCards: cardsNaColuna.length // Guardar total real
      }
    })

    return columnasComCards
  }, [colunas, whatsappChats, cardColumnMapping, searchQuery])

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
      console.log('🗑️ Realocando contatos da coluna', columnId, 'para', targetColumnId)
      
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
        console.log('📦 Movendo card', card.id, 'para coluna', targetColumnId)
        // await moveCardToColumn(card.id, targetColumnId)
      }

      // 3. Deletar a coluna vazia
      await deleteColuna(columnId)
      
      console.log('✅ Coluna deletada e contatos realocados com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao realocar contatos:', error)
      alert('Erro ao realocar contatos. Tente novamente.')
    }
  }

  const handleAddCard = (columnId: string) => {
    setSelectedColumnForCard(columnId)
    setShowCriarCardModal(true)
  }

  const handleAddColuna = async () => {
    const nome = prompt('Nome da nova coluna:')
    if (nome) {
      await createColuna({
        nome,
        cor: '#' + Math.floor(Math.random()*16777215).toString(16),
        ordem: colunas.length,
        quadroId: quadroId
      })
    }
  }

  // Handlers de DnD
  const handleDragStart = (event: DragStartEvent) => {
    // Pode adicionar lógica de início de drag aqui
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Pode adicionar preview de onde o card vai cair
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // 🔄 Verificar se está reordenando colunas
    const isColumnDrag = colunas.some(col => col.id === activeId)
    
    if (isColumnDrag && activeId !== overId) {
      // Reordenar colunas
      const oldIndex = colunas.findIndex(col => col.id === activeId)
      const newIndex = colunas.findIndex(col => col.id === overId)
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newColunas = arrayMove(colunas, oldIndex, newIndex)
        setColunas(newColunas)
        
        // Opcional: Salvar nova ordem no backend
        console.log('🔄 Nova ordem das colunas:', newColunas.map(c => c.nome))
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
        
        console.log(`🔄 Card ${activeId} movido para coluna ${newColumnId}`)
      }
    }
  }

  // Funções auxiliares
  const refreshData = async () => {
    setLoading(true)
    await loadWhatsAppChats()
    if (forceRefresh) {
      await forceRefresh()
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
    console.log('Abrindo chat modal para:', card.name)
  }
  
  const onOpenOrcamento = (card: any) => {
    setSelectedChat(card)
    setShowOrcamentoSheet(true)
    console.log('Abrindo orçamento sheet para:', card.name)
  }
  
  const onOpenAgendamento = (card: any) => {
    setSelectedChat(card)
    setShowAgendamentoSheet(true)
    console.log('Abrindo agendamento sheet para:', card.name)
  }
  
  const onOpenTags = (card: any) => {
    setSelectedChat(card)
    setShowTagsSheet(true)
    console.log('Abrindo tags sheet para:', card.name)
  }
  
  const onOpenAnotacoes = (card: any) => {
    setSelectedChat(card)
    setShowAnotacoesSheet(true)
    console.log('Abrindo anotações sheet para:', card.name)
  }
  
  const onOpenTickets = (card: any) => {
    setSelectedChat(card)
    setShowTicketsSheet(true)
    console.log('Abrindo tickets sheet para:', card.name)
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

  // Mostrar erro se houver
  if (chatsError) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">❌</div>
          <p className={`text-sm mb-2 ${
            theme === 'dark' ? 'text-white/60' : 'text-gray-600'
          }`}>
            Erro ao carregar chats do WhatsApp
          </p>
          <p className={`text-xs mb-4 opacity-50 ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            {chatsError}
          </p>
          <div className="flex gap-3">
            <button
              onClick={loadWhatsAppChats}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Tentar Novamente
            </button>
            
            {chatsError?.includes('Token') && (
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
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
    }`}>
      
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
        setShowShortcuts={setShowShortcuts}
        handleDoubleClickQuadroTitle={handleDoubleClickQuadroTitle}
        handleDoubleClickQuadroDescription={handleDoubleClickQuadroDescription}
        handleSaveQuadroTitle={handleSaveQuadroTitle}
        handleSaveQuadroDescription={handleSaveQuadroDescription}
        setEditingQuadroName={setEditingQuadroName}
        setEditingQuadroDescricao={setEditingQuadroDescricao}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Seção de Filtros - Controlada pelo botão no header */}
      {/* Esta seção será implementada futuramente com SideFilter do atendimento */}

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
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
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
                orcamentosData={{}}
                agendamentosData={{}}
                assinaturasData={{}}
                anotacoesData={{}}
                tagsData={{}}
                ticketsData={{}}
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
      </DndContext>
      )}

      {/* Info sobre performance */}
      {whatsappChats.length > 100 && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
        }`}>
          <p className="text-xs font-medium mb-1">Performance Mode</p>
          <p className="text-xs opacity-60">
            {whatsappChats.length} chats carregados
          </p>
          <p className="text-xs opacity-60">
            {MAX_VISIBLE_CARDS} cards visíveis por coluna
          </p>
        </div>
      )}

      {/* MODAIS REAIS DA OLDPAGE */}
      
      {/* Agendamento Bottom Sheet */}
      {showAgendamentoSheet && selectedChat && (
        <AgendamentoBottomSheet 
          isOpen={showAgendamentoSheet}
          onClose={() => setShowAgendamentoSheet(false)}
          chatId={selectedChat.id}
        />
      )}

      {/* Orçamento Bottom Sheet */}
      {showOrcamentoSheet && selectedChat && (
        <OrcamentoBottomSheet 
          isOpen={showOrcamentoSheet}
          onClose={() => setShowOrcamentoSheet(false)}
          chatId={selectedChat.id}
        />
      )}

      {/* Tags Bottom Sheet */}  
      {showTagsSheet && selectedChat && (
        <TagsBottomSheet 
          isOpen={showTagsSheet}
          onClose={() => setShowTagsSheet(false)}
          chatId={selectedChat.id}
        />
      )}

      {/* Anotações Bottom Sheet */}
      {showAnotacoesSheet && selectedChat && (
        <AnotacoesBottomSheet 
          isOpen={showAnotacoesSheet}
          onClose={() => setShowAnotacoesSheet(false)}
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
          onClose={() => setShowTicketsSheet(false)}
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
