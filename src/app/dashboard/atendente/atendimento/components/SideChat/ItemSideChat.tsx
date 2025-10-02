'use client'

import React, { useState, useEffect } from 'react'
import TransferModal from '../TransferModal'
import AssumirModal from './AssumirModal'
import { motion } from 'framer-motion'
import {
  Archive,
  Eye,
  EyeOff,
  Trash2,
  Star,
  UserPlus,
  Calendar,
  DollarSign,
  Layers,
  Users,
  User,
  Tag,
  Ticket,
  UserCheck,
  StickyNote,
  CheckCircle,
  Bot
} from 'lucide-react'
import LastMessageSideChat from './LastMessageSideChat'
import { useChatPicture } from '@/hooks/useChatPicture'
import { useChatAgente } from '@/hooks/useChatAgente'
import { useAtendimentoStates } from '@/hooks/useAtendimentoStates'
import { useFiltersData } from '@/hooks/useFiltersData'
import { useKanbanInfo } from '@/hooks/useKanbanInfo'
import { useAtendenteData } from '@/hooks/useAtendenteData'
import { useIndicatorData } from '../TopChatArea/Indicators/useIndicatorData'
import { normalizeTags } from '@/utils/tags'

// Helper para formatar tempo relativo
function formatTimeRelative(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`

  return `${days}d`
}

// Componente para badges de tags
function TagBadges({ chatId }: { chatId: string }) {
  const { data } = useIndicatorData(chatId, 'tags')
  const normalized = normalizeTags(data)

  if (normalized.length === 0) return null

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {normalized.slice(0, 2).map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-0.5 px-1 py-0.5 rounded-full text-white"
          style={{ backgroundColor: tag.cor || '#9333ea' }}
          title={`Tag: ${tag.nome}`}
        >
          <span className="text-[8px] font-medium truncate max-w-[40px]">
            {tag.nome}
          </span>
        </div>
      ))}
      {normalized.length > 2 && (
        <div className="flex items-center gap-0.5 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
          <span className="text-[8px] font-medium text-gray-600 dark:text-gray-400">
            +{normalized.length - 2}
          </span>
        </div>
      )}
    </div>
  )
}

interface ItemSideChatProps {
  chat: {
    id: string
    name: string
    avatar?: string
    profilePictureUrl?: string
    sessionName?: string // 🔥 CRÍTICO: Identificador da sessão WhatsApp
    lastMessage: {
      type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call'
      content: string
      timestamp: number
      sender: 'user' | 'agent'
      isRead?: boolean
    }
    // Dados básicos do chat (outros vêm do hook)
    rating?: number
    isOnline?: boolean
    connectionStatus?: 'connected' | 'disconnected' | 'connecting'
    fila?: string | {
      id: string
      nome: string
      cor?: string
    }
    ticketStatus?: {
      id: string
      nome: string
      cor?: string
    }

    // Estados do chat
    isTransferred?: boolean
    transferredTo?: {
      nome: string
      avatar?: string
    }

    // Estados de UI
    isSelected?: boolean
    isArchived?: boolean
    isFavorite?: boolean
    isHidden?: boolean
    isContact?: boolean
    unreadCount?: number
    tags?: Array<{
      id: string
      nome: string
      cor?: string
    }>
    
    // Chat Lead Status (dados do banco)
    chatLeadStatus?: {
      fila_id?: string
      status?: string
      responsavel?: string
      [key: string]: any
    }
  }
  onSelect: () => void
  onTagsClick: (e: React.MouseEvent) => void
  onTransferClick: (e: React.MouseEvent) => void
  onToggleFavorite?: (chatId: string) => void
  onToggleArchive?: (chatId: string) => void
  onToggleHidden?: (chatId: string) => void
  onDelete?: (chatId: string) => void
  conexoes: any[]
  filas: any[]
  loadingConexoes: boolean
  atendentes: Array<{
    id: string
    nome: string
    email?: string
  }>
}

type LeadStatusType = 'aguardando' | 'atendimento' | 'finalizado'

const normalizeLeadStatus = (status?: string | null): LeadStatusType | null => {
  if (!status) return null
  const normalized = status === 'em_atendimento' ? 'atendimento' : status
  if (normalized === 'aguardando' || normalized === 'atendimento' || normalized === 'finalizado') {
    return normalized
  }
  return null
}

const ItemSideChat = React.forwardRef<HTMLDivElement, ItemSideChatProps>(({
  chat,
  onSelect,
  onTagsClick,
  onTransferClick,
  onToggleFavorite,
  onToggleArchive,
  onToggleHidden,
  onDelete,
  conexoes,
  filas,
  loadingConexoes,
  atendentes,
}, ref) => {

  // Estado para o modal de transferência
  const [showTransferModal, setShowTransferModal] = useState(false)

  // Estado para o modal de assumir
  const [showAssumirModal, setShowAssumirModal] = useState(false)

  // Estado para o mini modal de status
  const [showStatusModal, setShowStatusModal] = useState(false)

  // Buscar status do chat lead
  const { buscarStatusChat, finalizarAtendimento } = useAtendimentoStates()
  const [chatLead, setChatLead] = useState<any>(null)
  const [loadingLead, setLoadingLead] = useState(false)
  const [showFinalizarModal, setShowFinalizarModal] = useState(false)
  const [isFinalizando, setIsFinalizando] = useState(false)

  // Buscar informações do Kanban REAL
  const { kanbanInfo: realKanbanInfo } = useKanbanInfo(chat.id)
  
  // 🔍 DEBUG: Ver dados do Kanban
  React.useEffect(() => {
    if (chat.name && chat.name.includes('Jorge')) {
      console.log('📊 [KANBAN DEBUG] Chat Jorge:', {
        chatId: chat.id,
        realKanbanInfo,
        hasBoard: !!realKanbanInfo.board,
        hasColumn: !!realKanbanInfo.column
      });
    }
  }, [chat.id, chat.name, realKanbanInfo]);

  const applyChatLeadStatus = React.useCallback((status: any) => {
    if (!status) {
      setChatLead(null)
      return
    }

    const normalizedStatus = normalizeLeadStatus(status.status) || 'aguardando'
    setChatLead({ ...status, status: normalizedStatus })
  }, [])

  // Buscar foto de perfil do WAHA
  const { pictureUrl: profileImage, isLoading: isLoadingPicture } = useChatPicture(chat.id, {
    enabled: !!chat.id
  })

  // Estados para conexões e filas agora são recebidos via props compartilhadas

  // Função para obter dados da conexão baseado no chat
  const getConexaoInfo = () => {
    if (!chat.id || conexoes.length === 0) {

      return null
    }

    // 🔥 CORREÇÃO: Usar sessionName do chat para identificar a conexão correta
    const chatSessionName = (chat as any).sessionName

    let conexaoDoChat = null

    // Estratégia 1: Usar sessionName se disponível (MÉTODO CORRETO)
    if (chatSessionName) {
      conexaoDoChat = conexoes.find(c => c.sessionName === chatSessionName)

    }

    // Estratégia 2: Fallback - usar primeira conexão (TEMPORÁRIO)
    if (!conexaoDoChat && conexoes.length > 0) {

      conexaoDoChat = conexoes[0]
    }

    if (conexaoDoChat) {
      return {
        nome: conexaoDoChat.nome ||
              conexaoDoChat.modulation?.connectionName ||
              conexaoDoChat.sessionData?.push_name ||
              'WhatsApp',
        pushName: conexaoDoChat.sessionData?.push_name || conexaoDoChat.nome || 'WhatsApp',
        filas: conexaoDoChat.modulation?.selectedFilas || []
      }
    }

    // Fallback final

    return null
  }

  // Função para obter dados da fila por ID
  const getFilaById = (filaId: string) => {
    return filas.find(fila => fila.id === filaId)
  }

  // Função para buscar status do chat
  const fetchLeadStatus = async () => {
    if (!chat.id) return

    setLoadingLead(true)
    try {
      const status = await buscarStatusChat(chat.id)
      console.log('📥 [FETCH LEAD] Status recebido:', status)
      applyChatLeadStatus(status)
      setLeadStatus(normalizeLeadStatus(status?.status) || null)
    } catch (error) {
      console.error('❌ [FETCH LEAD] Erro:', error)
    } finally {
      setLoadingLead(false)
    }
  }

  // Buscar status do chat lead
  useEffect(() => {
    fetchLeadStatus()
  }, [chat.id, buscarStatusChat])

  // Escutar eventos globais de atualização
  useEffect(() => {
    const handleChatUpdate = (event: CustomEvent) => {
      if (event.detail.chatId === chat.id) {
        fetchLeadStatus()
      }
    }

    window.addEventListener('chatStatusUpdated', handleChatUpdate as EventListener)

    return () => {
      window.removeEventListener('chatStatusUpdated', handleChatUpdate as EventListener)
    }
  }, [chat.id])

  // Estado para informações do Kanban
  const [kanbanInfo, setKanbanInfo] = useState<{ board?: string, column?: string }>({})
  const [loadingKanbanData, setLoadingKanbanData] = useState(false)

  // Tags simplificadas - usando mesmo padrão do ChatHeader

  const canFinalizarAtendimento = chatLead?.status === 'atendimento'

  const handleFinalizarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!canFinalizarAtendimento) return
    setShowFinalizarModal(true)
  }

  const handleConfirmFinalizar = async () => {
    if (!canFinalizarAtendimento) return

    setIsFinalizando(true)
    try {
      const result = await finalizarAtendimento(chat.id)
      applyChatLeadStatus(result)
      setLeadStatus('finalizado')
      window.dispatchEvent(new CustomEvent('chatStatusUpdated', {
        detail: { chatId: chat.id }
      }))
      setShowFinalizarModal(false)

    } catch {

      alert('Erro ao finalizar atendimento. Tente novamente.')
    } finally {
      setIsFinalizando(false)
    }
  }

  const handleCancelFinalizar = () => {
    if (isFinalizando) return
    setShowFinalizarModal(false)
  }

  // Estado de conexão - usar isOnline do chat ou um valor default
  const conexaoStatus = chat.isOnline ? 'WhatsApp' : null

  // Buscar agente responsável pelo chat
  const { agente } = useChatAgente(chat.id)

  // Buscar atendente responsável pelo chat
  const { atendenteData, refetch: refetchAtendente } = useAtendenteData(chat.id)

  // Buscar nome do responsável usando os dados já carregados
  const [nomeResponsavelFetched, setNomeResponsavelFetched] = React.useState<string>('')
  
  // Buscar nome do responsável via API quando não encontrar na lista
  React.useEffect(() => {
    const responsavelId = chat.chatLeadStatus?.responsavel || atendenteData?.atendente
    if (!responsavelId) {
      return
    }
    
    // Se já encontrou na lista de atendentes, não buscar
    const atendente = atendentes.find(a => a.id === responsavelId)
    if (atendente?.nome) {
      setNomeResponsavelFetched(atendente.nome)
      return
    }
    
    // Se já buscou, não buscar novamente
    if (nomeResponsavelFetched) {
      return
    }
    
    // Buscar nome do usuário via API
    const fetchNome = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/users/${responsavelId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          // O endpoint retorna { usuario: { nome: "helio" } }
          const nome = data.usuario?.nome || data.nome || data.name || ''
          if (nome) {
            setNomeResponsavelFetched(nome)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar nome:', error)
      }
    }
    fetchNome()
  }, [chat.chatLeadStatus?.responsavel, atendenteData?.atendente, atendentes, nomeResponsavelFetched])
  
  const nomeResponsavel = React.useMemo(() => {
    // 🎯 PRIORIDADE 1: Nome buscado via API
    if (nomeResponsavelFetched) {
      return nomeResponsavelFetched
    }
    
    // 🎯 PRIORIDADE 2: chatLead.responsavelUser.nome (do backend com JOIN)
    if (chatLead?.responsavelUser?.nome) {
      return chatLead.responsavelUser.nome
    }
    
    // Fallback: ID truncado
    const responsavelId = chatLead?.responsavel || chat.chatLeadStatus?.responsavel || atendenteData?.atendente
    if (!responsavelId) return ''
    
    return `ID:${responsavelId.slice(0, 8)}`
  }, [nomeResponsavelFetched, chatLead, chat.chatLeadStatus?.responsavel, atendenteData?.atendente])

  // Estado para status do lead
  const [leadStatus, setLeadStatus] = useState<string | null>(null)

  const leadStatusDisplay = React.useMemo<LeadStatusType | null>(() => {
    // Priorizar chatLeadStatus (vem das props via page.tsx)
    if (chat.chatLeadStatus?.status) {
      return normalizeLeadStatus(chat.chatLeadStatus.status)
    }
    // Se tem chatLead com status definido
    if (chatLead?.status) {
      return chatLead.status as LeadStatusType
    }
    // Se tem leadStatus local
    if (leadStatus) {
      return normalizeLeadStatus(leadStatus)
    }
    // Padrão: se não tem responsável, está aguardando
    const responsavelId = chat.chatLeadStatus?.responsavel || atendenteData?.atendente
    if (!responsavelId) {
      return 'aguardando'
    }
    return null
  }, [chat.chatLeadStatus?.status, chat.chatLeadStatus?.responsavel, chatLead?.status, leadStatus, atendenteData?.atendente])

  // Listener para recarregar dados quando atendimento for assumido
  React.useEffect(() => {
    const handleAtendimentoAssumido = (event: CustomEvent) => {
      if (event.detail.chatId === chat.id) {

        refetchAtendente()
        // Também recarregar o status do chat lead
        const fetchStatus = async () => {
          try {
            const status = await buscarStatusChat(chat.id)
            applyChatLeadStatus(status)
            setLeadStatus(normalizeLeadStatus(status?.status) || null)
          } catch {}
        }
        fetchStatus()
      }
    }

    window.addEventListener('atendimento-assumido', handleAtendimentoAssumido as EventListener)

    return () => {
      window.removeEventListener('atendimento-assumido', handleAtendimentoAssumido as EventListener)
    }
  }, [chat.id, refetchAtendente, buscarStatusChat])

  // Buscar status do lead
  useEffect(() => {
    const fetchLeadStatus = async () => {
      try {
        const token = localStorage.getItem('token') || 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDE9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'

        // Buscar status do lead no backend GO
        const baseUrl = 'http://159.65.34.199:8081'
        const response = await fetch(`${baseUrl}/api/chats/${encodeURIComponent(chat.id)}/leads`, {
          headers: {
            'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
          }
        })

        if (response.ok) {
          const leadData = await response.json()
          const leadApiStatus = leadData?.status || leadData?.lead_status || null
          const normalized = normalizeLeadStatus(leadApiStatus)
          setLeadStatus(normalized || leadApiStatus)

        }
      } catch {}
    }

    if (chat.id) {
      fetchLeadStatus()
    }
  }, [chat.id])

  // Buscar informações do Kanban para este chat
  useEffect(() => {
    const fetchKanbanInfo = async () => {
      try {
        const token = localStorage.getItem('token') || 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDE9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'

        setLoadingKanbanData(true)

        // Buscar todos os quadros
        const quadrosResponse = await fetch('/api/kanban/quadros', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!quadrosResponse.ok) {
          setLoadingKanbanData(false)
          return
        }

        const quadrosData = await quadrosResponse.json()
        const quadros = quadrosData.data || quadrosData.quadros || quadrosData || []

        // Para cada quadro, buscar os metadados
        for (const quadro of quadros) {
          const metadataResponse = await fetch(`/api/kanban/${quadro.id}/metadata`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })

          if (!metadataResponse.ok) continue

          const metadata = await metadataResponse.json()
          const cards = metadata?.cards || []

          // Procurar este chat no quadro
          const phoneNumber = chat.id.replace('@c.us', '')
          const card = cards.find((c: any) => {
            const cardPhone = c.telefone || c.phone || c.chatId?.replace('@c.us', '') || ''
            return c.chatId === chat.id ||
                   cardPhone === phoneNumber ||
                   c.id === chat.id
          })

          if (card) {
            // Buscar nome da coluna
            const columnInfo = metadata?.columns?.find((col: any) => col.id === card.column_id)
            const columnName = columnInfo?.nome || columnInfo?.title || card.columnTitle || card.coluna

            setKanbanInfo({
              board: quadro.nome,
              column: columnName
            })
            setLoadingKanbanData(false)
            return // Encontrou, pode parar
          }
        }

        setLoadingKanbanData(false)
      } catch {
        setLoadingKanbanData(false)
      }
    }

    if (chat.id) {
      fetchKanbanInfo()
    }
  }, [chat.id])

  // Função handleTransfer removida - agora usamos o TransferModal integrado

  // Formatação do timestamp igual WhatsApp Web
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()

    // Comparar apenas as datas (sem horário) para melhor precisão
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffDays = Math.floor((today.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24))

    // Se for hoje (mesmo dia)
    if (diffDays === 0) {
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }

    // Se for ontem (1 dia atrás)
    if (diffDays === 1) {
      return 'Ontem'
    }

    // Se for esta semana (2-6 dias atrás)
    if (diffDays >= 2 && diffDays <= 6) {
      return date.toLocaleDateString('pt-BR', { weekday: 'short' })
    }

    // Mais antigo, mostrar data (12/09)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onSelect}
      className={`group relative flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-all border-b border-gray-100/50 dark:border-gray-700/30 ${
        chat.isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      } ${
        chat.isArchived ? 'opacity-50' : ''
      }`}
    >
      {/* Bordinha azul no lado direito quando ativo */}
      {chat.isSelected && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-l-full shadow-md" />
      )}

      {/* Indicadores de estado no canto superior esquerdo */}
      <div className="absolute top-2 left-2 flex gap-1">
        {/* Indicador de Favorito */}
        {chat.isFavorite && (
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <Star className="w-2.5 h-2.5 text-white fill-current" />
          </div>
        )}

        {/* Indicador de Arquivado */}
        {chat.isArchived && (
          <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
            <Archive className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      {/* Avatar maior e mais à esquerda */}
      <div className="relative flex-shrink-0 ml-1">
          {/* Foto do WAHA ou avatar fornecido */}
          {profileImage ? (
            <img
              src={profileImage}
              alt={chat.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : null}

          {/* Fallback avatar com inicial */}
          <div className={`${profileImage ? 'hidden' : ''} w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold border-2 ${
                  chat.isSelected
                  ? 'border-blue-400 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
              <span className="text-lg font-bold text-white">
                {chat.name.charAt(0).toUpperCase()}
              </span>
          </div>

          {/* Badge removida - usando só o pin abaixo do horário */}

          {/* Indicador de online */}
          {chat.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full
                           border-2 border-white dark:border-gray-800"></div>
          )}
      </div>

      {/* Informações do Chat */}
      <div className="flex-1 min-w-0">
          {/* Nome e contador */}
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-sm font-medium truncate ${
              chat.isSelected
                ? 'text-blue-700 dark:text-blue-300 font-semibold'
                : chat.lastMessage?.isRead === false
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-300'
            }`}>
              {chat.name.length > 15 ? `${chat.name.substring(0, 15)}...` : chat.name}
            </h3>

            {/* Contador removido - usando só o pin abaixo do horário */}
          </div>

          {/* Telefone abaixo do nome */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {chat.id.replace('@c.us', '').replace(/(\d{2})(\d{2})(\d{4,5})(\d{4})/, '($1) $2 $3-$4')}
          </div>

          {/* Última Mensagem */}
          <LastMessageSideChat
            message={chat.lastMessage}
            maxLength={25}
          />

          {/* Todas as badges abaixo do telefone */}
          <div className="flex flex-col gap-1 mt-0.5">
            {/* Badges normais */}
            <div className="flex items-center gap-0.5 flex-wrap">

            {/* Indicador de Contato Cadastrado */}

            {/* Loading Indicator para dados do Kanban */}
            {loadingKanbanData && (
              <div className="flex items-center px-0.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
              </div>
            )}

            {/* Conexão/Status - sempre mostrar com fallback rápido */}
            {(() => {
              const conexaoInfo = getConexaoInfo()
              const nomeConexao = conexaoInfo?.nome || conexaoStatus || 'WhatsApp'
              const isLoading = loadingConexoes && conexoes.length === 0

              return (
                <div
                  className="flex items-center gap-0.5 px-0.5 py-0.5 bg-green-100 dark:bg-green-900/20 rounded-full"
                  title={`Conexão: ${nomeConexao}${isLoading ? ' (carregando...)' : ''}`}
                >
                  <div className={`w-1.5 h-1.5 bg-green-500 rounded-full ${isLoading ? 'animate-spin' : 'animate-pulse'}`}></div>
                  <span className="text-[8px] font-medium text-green-600">
                    {isLoading ? 'Carregando...' : nomeConexao}
                  </span>
                </div>
              )
            })()}

            {/* Fila do Chat (SEMPRE do chatLead.fila_id) */}
            {(() => {
              // 🎯 PRIORIDADE 1: Buscar fila do chatLeadStatus (vem das props via page.tsx)
              const filaIdDoBanco = chat.chatLeadStatus?.fila_id || chatLead?.fila_id
              
              if (filaIdDoBanco) {
                const fila = getFilaById(filaIdDoBanco)
                
                if (fila) {
                  return (
                    <div
                      className="flex items-center gap-0.5 px-0.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${fila.cor || '#9333ea'}20`,
                        color: fila.cor || '#9333ea'
                      }}
                      title={`Fila: ${fila.nome} (ID: ${filaIdDoBanco})`}
                    >
                      <Users className="w-1.5 h-1.5" />
                      <span className="text-[8px] font-medium truncate max-w-[46px]">{fila.nome}</span>
                    </div>
                  )
                }
              }

              // Se não tem fila no banco, mostrar "Sem fila"
              return (
                <div
                  className="flex items-center gap-0.5 px-1 py-0.5 bg-gray-100 dark:bg-gray-800/40 rounded-full"
                  title="Este chat não está em nenhuma fila"
                >
                  <Users className="w-1.5 h-1.5 text-gray-400" />
                  <span className="text-[8px] font-medium text-gray-500 dark:text-gray-400">
                    Sem fila
                  </span>
                </div>
              )
            })()}

            {/* Kanban Badge */}
            {(realKanbanInfo.board && realKanbanInfo.column) && (
              <div
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: realKanbanInfo.columnColor 
                    ? `${realKanbanInfo.columnColor}15` 
                    : 'rgb(219 234 254)',
                  color: realKanbanInfo.columnColor || 'rgb(37 99 235)'
                }}
                title={`${realKanbanInfo.board} → ${realKanbanInfo.column}`}
              >
                <Layers className="w-1.5 h-1.5" style={{ color: realKanbanInfo.columnColor || 'rgb(59 130 246)' }} />
                <span className="text-[8px] font-medium truncate max-w-[120px]">
                  {realKanbanInfo.board} → {realKanbanInfo.column}
                </span>
              </div>
            )}

            {/* Badge Atendente Responsável */}
            {nomeResponsavel && (
              <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                (chatLead?.responsavel || atendenteData?.atendente) === 'fb8da1d7-d28f-4ef9-b8b0-e01f7466f578'
                  ? 'bg-green-100 dark:bg-green-900/20'
                  : 'bg-blue-100 dark:bg-blue-900/20'
              }`}>
                <UserCheck className={`w-1.5 h-1.5 ${
                  (chatLead?.responsavel || atendenteData?.atendente) === 'fb8da1d7-d28f-4ef9-b8b0-e01f7466f578'
                    ? 'text-green-600'
                    : 'text-blue-600'
                }`} />
                <span className={`text-[8px] font-medium truncate max-w-[80px] ${
                  (chatLead?.responsavel || atendenteData?.atendente) === 'fb8da1d7-d28f-4ef9-b8b0-e01f7466f578'
                    ? 'text-green-600'
                    : 'text-blue-600'
                }`}>
                  {nomeResponsavel}
                </span>
              </div>
            )}
            </div>
          </div>

      </div>

      {/* Badges do Status e Tags */}
      <div className="absolute top-1.5 right-[40px] flex items-center gap-1.5">

        {leadStatusDisplay && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (leadStatusDisplay === 'atendimento') {
                  setShowFinalizarModal(true)
                }
              }}
              disabled={leadStatusDisplay !== 'atendimento'}
              className={`flex items-center gap-0.5 px-1 py-0.5 rounded-full transition-all ${
                leadStatusDisplay === 'aguardando'
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 cursor-not-allowed'
                  : leadStatusDisplay === 'atendimento'
                  ? 'bg-green-100 dark:bg-green-900/20 hover:ring-2 hover:ring-green-300 cursor-pointer'
                  : 'bg-gray-100 dark:bg-gray-900/20 cursor-not-allowed'
              }`}
              title={leadStatusDisplay === 'atendimento' ? 'Clique para finalizar atendimento' : ''}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                leadStatusDisplay === 'aguardando'
                  ? 'bg-yellow-500'
                  : leadStatusDisplay === 'atendimento'
                  ? 'bg-green-500'
                  : 'bg-gray-500'
              }`}></div>
              <span className={`text-[8px] font-medium truncate max-w-[46px] ${
                leadStatusDisplay === 'aguardando'
                  ? 'text-yellow-600'
                  : leadStatusDisplay === 'atendimento'
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}>
                {leadStatusDisplay === 'aguardando'
                  ? 'Aguardando'
                  : leadStatusDisplay === 'atendimento'
                  ? 'Em Atendimento'
                  : 'Finalizado'}
              </span>
            </button>

            {/* Mini Modal de Status - REMOVIDO para atendente (só visualização) */}
            {false && showStatusModal && (
              <>
                {/* Overlay para fechar ao clicar fora */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowStatusModal(false)
                  }}
                />

                {/* Modal */}
                <div
                  className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-[160px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1 px-2">
                    Alterar Status
                  </div>

                  {leadStatusDisplay === 'aguardando' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        setShowStatusModal(false)
                        setShowAssumirModal(true)
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Assumir Atendimento</span>
                    </button>
                  )}

                  {leadStatusDisplay === 'atendimento' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        setShowStatusModal(false)
                        setShowFinalizarModal(true)
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Encerrar Atendimento</span>
                    </button>
                  )}

                  {leadStatusDisplay === 'finalizado' && (
                    <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 text-center">
                      Atendimento finalizado
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Badge de Agente IA - Verde se ativo */}
        {agente?.ativo && (
          <div className="relative flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/20">
            <Bot className="w-2 h-2 text-cyan-600" />
            {/* Pin indicador - Verde se ativo */}
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-[8px] font-medium truncate max-w-[40px] text-cyan-600">
              {agente?.nome || 'IA'}
            </span>
          </div>
        )}

        {/* Tags como badges coloridas */}
        <TagBadges chatId={chat.id} />
      </div>

      {/* Timestamp no canto superior direito */}
      <div className="absolute top-1.5 right-2 flex flex-col items-end gap-0.5">
        <div className="text-[9px] font-medium text-gray-400 dark:text-gray-500">
          {chat.lastMessage?.timestamp ? formatTimestamp(chat.lastMessage.timestamp) : 'Agora'}
        </div>

        {/* Pin/Badge de mensagens novas - compacto */}
        {!!(chat.unreadCount && chat.unreadCount > 0) && (
          <div className="bg-green-500 text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full shadow-sm">
            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
          </div>
        )}
      </div>

      {/* Ações rápidas - sempre visíveis */}
      <div className="absolute right-2 bottom-2 flex items-center gap-0">
        {/* Favoritar - IGUAL AO ANTIGO */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (onToggleFavorite) {
              onToggleFavorite(chat.id)
            }
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            chat.isFavorite
              ? 'text-yellow-400 hover:text-yellow-500'
              : 'text-slate-400 hover:text-yellow-400'
          }`}
          title={chat.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Star className="w-3 h-3" fill={chat.isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Transferir - com indicador de atendente */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowTransferModal(true)
          }}
          className={`relative p-1.5 rounded-lg transition-colors ${
            atendenteData?.atendente
              ? 'text-blue-500 hover:text-blue-600'
              : 'text-slate-400 hover:text-blue-400'
          }`}
          title={
            atendenteData?.atendente
              ? `Transferir de ${nomeResponsavel || 'Atendente atual'}`
              : 'Transferir conversa'
          }
        >
          <UserPlus className="w-3 h-3" />
          {/* Badge indicando que tem atendente */}
          {atendenteData?.atendente && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white dark:border-gray-800"></div>
          )}
        </button>

        {/* Arquivar - IGUAL AO ANTIGO */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (onToggleArchive) {
              onToggleArchive(chat.id)
            }
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            chat.isArchived
              ? 'text-orange-400 hover:text-orange-500'
              : 'text-slate-400 hover:text-orange-400'
          }`}
          title={chat.isArchived ? 'Desarquivar conversa' : 'Arquivar conversa'}
        >
          <Archive className="w-3 h-3" />
        </button>

        {/* Ícone de mensagens removido - usando só o pin abaixo do horário */}

        {/* Excluir - IGUAL AO ANTIGO */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (onDelete) {
              if (confirm('Tem certeza que deseja excluir esta conversa?')) {
                onDelete(chat.id)
              }
            }
          }}
          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
          title="Excluir conversa"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>

    {/* Modal de confirmação de finalização */}
    {showFinalizarModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleCancelFinalizar}
        />
        <div className="relative w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 shadow-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Finalizar atendimento?</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                O chat será marcado como finalizado e sairá da fila de atendimentos ativos.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancelFinalizar}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={isFinalizando}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmFinalizar}
              disabled={isFinalizando}
              className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isFinalizando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirmar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de Transferência */}
    <TransferModal
      isOpen={showTransferModal}
      onClose={() => setShowTransferModal(false)}
      chatId={chat.id}
      chatName={chat.name}
      currentAtendente={chatLead?.responsavelUser?.nome || (chatLead?.responsavel && chatLead.responsavel !== 'Não atribuído' ? `ID:${chatLead.responsavel.slice(0,8)}` : 'Não atribuído')}
      currentFila={(typeof chat.fila === 'object' ? chat.fila?.id : null) || chatLead?.fila?.id || chatLead?.fila_id || 'Sem fila'}
      onTransferSuccess={() => {
          // Recarregar status do chat após transferência
          const fetchStatus = async () => {
            try {
              const status = await buscarStatusChat(chat.id)
              applyChatLeadStatus(status)

              // Invalidar cache do React Query para forçar reload
              if (typeof window !== 'undefined') {
                // @ts-ignore
                window.__REACT_QUERY_CACHE_INVALIDATE?.()
              }

              // Disparar evento global para atualizar toda a lista
              window.dispatchEvent(new CustomEvent('chatTransferred', {
                detail: { chatId: chat.id }
              }))

              // Forçar reload da página após 500ms para garantir atualização
              setTimeout(() => {
                window.location.reload()
              }, 500)

            } catch {}
          }
          fetchStatus()
        }}
      />

      {/* Modal de Assumir */}
      <AssumirModal
        isOpen={showAssumirModal}
        onClose={() => setShowAssumirModal(false)}
        chatId={chat.id}
        chatName={chat.name}
        currentAtendente={nomeResponsavel || 'Sem atendente'}
        onAssumirSuccess={async () => {
          // Buscar status atualizado
          const fetchStatus = async () => {
            try {
              const status = await buscarStatusChat(chat.id)
              if (status) {
                applyChatLeadStatus(status)
              }

              // Disparar evento para atualizar ChatHeader
              const event = new CustomEvent('atendimento-assumido', {
                detail: { chatId: chat.id }
              })
              window.dispatchEvent(event)

              // Disparar evento para atualizar lista de chats
              window.dispatchEvent(new CustomEvent('chatStatusUpdated', {
                detail: { chatId: chat.id }
              }))

              // Forçar re-render do componente
              setShowAssumirModal(false)
            } catch {}
          }
          fetchStatus()
        }}
      />
  </>
  )
})

ItemSideChat.displayName = 'ItemSideChat'

export default ItemSideChat
