'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Plus,
  MoreVertical,
  Users,
  Calendar,
  Settings,
  Star,
  Trello,
  Eye,
  MessageSquare,
  Paperclip,
  Clock,
  Phone,
  User,
  CheckCircle2,
  Trash2,
  GripVertical,
  Keyboard,
  RotateCcw,
  MessageCircle,
  CreditCard,
  Columns,
  Filter,
  Archive,
  Layers,
  Zap,
  Video,
  Monitor,
  Inbox,
  CalendarDays,
  FileSignature,
  DollarSign,
  StickyNote,
  UserCheck,
  Bot,
  Network,
  Tag,
  Ticket
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { useKanban } from '@/hooks/useKanban'
import { useKanbanOptimized } from '@/hooks/useKanbanOptimized'
import { WhatsAppChat } from '@/hooks/useWhatsAppData'
import { useAgentes } from '@/hooks/useAgentes'
import { useConexaoFila } from '@/hooks/useConexaoFila'
// Modais antigos (vamos substituir gradualmente)
import TicketModal from '../../atendimentos/components/modals/TicketModal'
import AgenteSelectionModal from '../../atendimentos/components/modals/AgenteSelectionModal'
import TransferirAtendimentoModal from '../../atendimentos/components/modals/TransferirAtendimentoModal'
import EditContactModalSteps from '@/components/shared/EditContactModalSteps'
import DeleteCardModal from '@/components/shared/DeleteCardModal'
import AtendimentosTopBar from '../../atendimentos/components/AtendimentosTopBar'
import UniversalAgendamentoModal, { type AgendamentoData as UniversalAgendamentoData } from '@/components/shared/UniversalAgendamentoModal'
import AnotacoesModal from '../../atendimentos/components/modals/AnotacoesModal'
import AgendamentoModal from '../../atendimentos/components/modals/AgendamentoModal'
import CriarOrcamentoModal from '../../orcamentos/components/CriarOrcamentoModal'

// BottomSheets do chat (reutilizando)
import AgendamentoBottomSheet from '../../atendimento/components/FooterChatArea/BottomSheets/AgendamentoBottomSheet'
import OrcamentoBottomSheet from '../../atendimento/components/FooterChatArea/BottomSheets/OrcamentoBottomSheet'
import TicketBottomSheet from '../../atendimento/components/FooterChatArea/BottomSheets/TicketBottomSheet'
import AnotacoesBottomSheet from '../../atendimento/components/FooterChatArea/BottomSheets/AnotacoesBottomSheet'
import AssinaturaBottomSheet from '../../atendimento/components/FooterChatArea/BottomSheets/AssinaturaBottomSheet'
import TagsBottomSheet from '../../atendimento/components/FooterChatArea/BottomSheets/TagsBottomSheet'
import ChatHeader from '../../atendimento/components/TopChatArea/ChatHeader'
import ChatArea from '../../atendimento/components/MiddleChatArea'
import MessageInput from '../../atendimento/components/FooterChatArea/MessageInput'
import ConexaoFilaBadges from './components/ConexaoFilaBadges'
import ConexaoFilaModal from './components/ConexaoFilaModal'
import OrcamentosBadge from './components/OrcamentosBadge'
import OrcamentosExpandido from './components/OrcamentosExpandido'
import TagsBadge from './components/TagsBadge'
import OrcamentosTotalColuna from './components/OrcamentosTotalColuna'
import ChatModalKanban from './components/ChatModalKanban'
import { fileLogger } from '@/utils/fileLogger'
import CriarCardModal from '../components/CriarCardModal'
import AssinaturaModal from '../../atendimentos/components/modals/AssinaturaModal'
import VideoChamadaModal from '../../atendimentos/components/modals/VideoChamadaModal'
import LigacaoModal from '../../atendimentos/components/modals/LigacaoModal'
import CompartilharTelaModal from '../../atendimentos/components/modals/CompartilharTelaModal'
import ColorPickerModal from '../components/ColorPickerModal'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

// Component para renderização otimizada de cards
function LazyCardsList({
  cards,
  theme,
  columnColor,
  notesCount,
  orcamentosCount,
  agendamentosCount,
  assinaturasCount,
  contactStatus,
  onOpenAgendamento,
  onOpenOrcamento,
  onOpenAssinatura,
  onOpenAnotacoes,
  onOpenTicket,
  onOpenAgente,
  onOpenTags,
  onOpenChat,
  onOpenTransferencia,
  onOpenEditContato,
  onOpenDeleteCard,
  onOpenVideoChamada,
  onOpenLigacao,
  onOpenCompartilharTela,
  onOpenConexaoFila,
  orcamentosData,
  agendamentosData,
  assinaturasData,
  anotacoesData,
  anotacoesCount,
  tagsCount,
  ticketsCount,
  agentesCount,
  tagsData,
  ticketsData,
  agentesData
}: {
  cards: any[]
  theme: string
  columnColor: string
  notesCount: { [key: string]: number }
  orcamentosCount: { [key: string]: number }
  agendamentosCount: { [key: string]: number }
  assinaturasCount: { [key: string]: number }
  anotacoesCount: { [key: string]: number }
  tagsCount: { [key: string]: number }
  ticketsCount: { [key: string]: number }
  agentesCount: { [key: string]: number }
  contactStatus: { [key: string]: string }
  onOpenAgendamento: (card: any) => void
  onOpenOrcamento: (card: any) => void
  onOpenAssinatura: (card: any) => void
  onOpenAnotacoes: (card: any) => void
  onOpenTicket: (card: any) => void
  onOpenAgente: (card: any) => void
  onOpenTransferencia: (card: any) => void
  onOpenEditContato: (card: any) => void
  onOpenDeleteCard: (card: any) => void
  onOpenVideoChamada: () => void
  onOpenLigacao: () => void
  onOpenCompartilharTela: () => void
  onOpenConexaoFila: (card: any) => void
  orcamentosData: any
  agendamentosData: any
  assinaturasData: any
  anotacoesData: any
  tagsData: any
  ticketsData: any
  agentesData: any
}) {
  // Usar lazy loading apenas se há muitos cards (50+)
  const shouldUseLazyLoading = cards.length > 50
  const [visibleCount, setVisibleCount] = useState(shouldUseLazyLoading ? 25 : cards.length)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Resetar quando cards mudam
  useEffect(() => {
    if (shouldUseLazyLoading) {
      setVisibleCount(25)
    } else {
      setVisibleCount(cards.length)
    }
  }, [cards.length, shouldUseLazyLoading])

  const visibleCards = cards.slice(0, visibleCount)
  const hasMore = visibleCount < cards.length

  const loadMore = () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 20, cards.length))
      setIsLoadingMore(false)
    }, 150)
  }

  return (
    <div className="space-y-3">
      {visibleCards.map((card: any) => (
        <SortableCard
          key={card.id}
          card={card}
          theme={theme}
          columnColor={columnColor}
          notesCount={notesCount[card.id] || 0}
          orcamentosCount={orcamentosCount[card.id] || 0}
          agendamentosCount={agendamentosCount[card.id] || 0}
          assinaturasCount={assinaturasCount[card.id] || 0}
          anotacoesCount={anotacoesCount[card.id] || 0}
          tagsCount={tagsCount[card.id] || 0}
          ticketsCount={ticketsCount[card.id] || 0}
          agentesCount={(agentesCount || {})[card.id] || 0}
          contactStatus="synced"
          onOpenAgendamento={onOpenAgendamento}
          onOpenOrcamento={onOpenOrcamento}
          onOpenAssinatura={onOpenAssinatura}
          onOpenAnotacoes={onOpenAnotacoes}
          onOpenTicket={onOpenTicket}
          onOpenAgente={onOpenAgente}
          onOpenTags={onOpenTags}
          onOpenChat={onOpenChat}
          onOpenTransferencia={onOpenTransferencia}
          onOpenEditContato={onOpenEditContato}
          onOpenDeleteCard={onOpenDeleteCard}
          onOpenConexaoFila={onOpenConexaoFila}
          onOpenVideoChamada={onOpenVideoChamada}
          onOpenLigacao={onOpenLigacao}
          onOpenCompartilharTela={onOpenCompartilharTela}
          orcamentosData={orcamentosData[card.id] || []}
          agendamentosData={agendamentosData[card.id] || []}
          assinaturasData={assinaturasData[card.id] || []}
          anotacoesData={anotacoesData[card.id] || []}
          tagsData={tagsData[card.id] || []}
          ticketsData={ticketsData[card.id] || []}
          agentesData={(agentesData || {})[card.id] || []}
        />
      ))}
      
      {/* Botão "Carregar Mais" para otimização */}
      {hasMore && (
        <motion.button
          onClick={loadMore}
          disabled={isLoadingMore}
          className={`w-full py-3 px-4 rounded-lg border-2 border-dashed transition-all duration-300 ${
            theme === 'dark'
              ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700 hover:bg-gray-50/50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center gap-2">
            {isLoadingMore ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Carregando...</span>
              </>
            ) : (
              <>
                <Plus className="w-[15px] h-[15px]" />
                <span>Carregar mais {Math.min(20, cards.length - visibleCount)} cards</span>
              </>
            )}
          </div>
        </motion.button>
      )}
    </div>
  )
}

// Componente de Área Droppable Ultra Sofisticado com Modal de Cores
function DroppableArea({ 
  coluna, 
  theme,
  notesCount,
  orcamentosCount,
  agendamentosCount,
  assinaturasCount,
  anotacoesCount,
  tagsCount,
  ticketsCount,
  agentesCount,
  contactStatus,
  orcamentosData,
  agendamentosData,
  assinaturasData,
  anotacoesData,
  tagsData,
  ticketsData,
  agentesData,
  onDoubleClick, 
  onDelete, 
  editingColumnId, 
  editingColumnName, 
  onSaveColumnName, 
  onEditingNameChange,
  onOpenColorModal,
  handleAddCard,
  onOpenAgendamento,
  onOpenOrcamento,
  onOpenAssinatura,
  onOpenAnotacoes,
  onOpenTicket,
  onOpenAgente,
  onOpenTags,
  onOpenChat,
  onOpenTransferencia,
  onOpenEditContato,
  onOpenDeleteCard,
  onOpenVideoChamada,
  onOpenLigacao,
  onOpenCompartilharTela,
  getColumnStats
}: { 
  coluna: any, 
  theme: string,
  notesCount: Record<string, number>,
  orcamentosCount: number | Record<string, number>,
  agendamentosCount: Record<string, number>,
  assinaturasCount: Record<string, number>,
  anotacoesCount: Record<string, number>,
  tagsCount: Record<string, number>,
  ticketsCount: Record<string, number>,
  agentesCount: Record<string, number>,
  contactStatus: Record<string, string>,
  orcamentosData: any,
  agendamentosData: any,
  assinaturasData: any,
  anotacoesData: any,
  tagsData: any,
  ticketsData: any,
  agentesData: any,
  onDoubleClick: (coluna: any) => void,
  onDelete: (columnId: string) => void,
  editingColumnId: string | null,
  editingColumnName: string,
  onEditingNameChange: (name: string) => void,
  onSaveColumnName: (columnId: string) => void,
  onOpenColorModal: (coluna: any) => void,
  handleAddCard: (columnId: string) => void,
  onOpenAgendamento: (card: any) => void,
  onOpenOrcamento: (card: any) => void,
  onOpenAssinatura: (card: any) => void,
  onOpenAnotacoes: (card: any) => void,
  onOpenTicket: (card: any) => void,
  onOpenAgente: (card: any) => void,
  onOpenTransferencia: (card: any) => void,
  onOpenEditContato: (card: any) => void,
  onOpenDeleteCard: (card: any) => void,
  onOpenVideoChamada: () => void,
  onOpenLigacao: () => void,
  onOpenCompartilharTela: () => void,
  getColumnStats: (columnId: string) => any
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: coluna.id,
  })
  
  // Tornar a coluna sortable para poder mover
  const {
    attributes: sortableAttributes,
    listeners: sortableListeners,
    setNodeRef: setSortableNodeRef,
    transform: sortableTransform,
    transition: sortableTransition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: coluna.id,
    data: {
      type: 'column',
      column: coluna,
    },
  })
  
  const sortableStyle = {
    transform: CSS.Transform.toString(sortableTransform),
    transition: sortableTransition,
    opacity: isColumnDragging ? 0.5 : 1,
  }
  
  // Combinar refs
  const combinedRef = (node: HTMLElement | null) => {
    setNodeRef(node)
    setSortableNodeRef(node)
  }

  return (
    <motion.div
      ref={combinedRef}
      {...sortableAttributes}
      className={`min-h-[650px] rounded-2xl border transition-all duration-500 ${
        isOver 
          ? theme === 'dark'
            ? 'border-blue-400/60 bg-gradient-to-b from-blue-500/10 via-blue-500/5 to-transparent shadow-2xl shadow-blue-500/30'
            : 'border-blue-400/60 bg-gradient-to-b from-blue-50 via-blue-25 to-white shadow-2xl shadow-blue-500/20'
          : theme === 'dark'
            ? 'border-slate-700/30 bg-gradient-to-b from-slate-800/40 via-slate-800/20 to-slate-800/10 hover:from-slate-800/60 hover:via-slate-800/30 hover:to-slate-800/20'
            : 'border-gray-200/40 bg-gradient-to-b from-white via-gray-50/30 to-white/80 hover:from-white hover:via-gray-50/50 hover:to-white'
      } backdrop-blur-sm overflow-hidden group ${
        isColumnDragging ? 'opacity-50 transform rotate-1' : ''
      }`}
      style={{
        ...sortableStyle,
        boxShadow: isOver 
          ? `0 20px 60px ${coluna.cor}30, 0 0 0 1px ${coluna.cor}20` 
          : theme === 'dark' 
            ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)' 
            : '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)'
      }}
      animate={{
        scale: isOver ? 1.02 : 1,
        y: isOver ? -2 : 0
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header da Coluna Ultra Sofisticado */}
      <div className={`relative p-5 border-b backdrop-blur-sm ${
        theme === 'dark' ? 'border-slate-700/30 bg-slate-800/20' : 'border-gray-200/30 bg-white/40'
      }`}>
        {/* Glow Effect no Header */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${coluna.cor}08 0%, transparent 50%, ${coluna.cor}05 100%)`
          }}
        />
        
        <div className="relative flex items-center justify-between mb-4">
          {/* Lado Esquerdo - Indicador e Nome */}
          <div className="flex items-center gap-4 flex-1">
            {/* Indicador de Cor Sofisticado com Color Picker */}
            <div className="relative">
              <motion.div
                onClick={() => onOpenColorModal(coluna)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  theme === 'dark' ? 'hover:scale-110' : 'hover:scale-110'
                }`}
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                title="Clique para trocar a cor"
              >
                <div 
                  className="w-4 h-4 rounded-full shadow-lg border-2 border-white/20"
                  style={{ 
                    backgroundColor: coluna.cor,
                    boxShadow: `0 0 20px ${coluna.cor}40, inset 0 1px 0 rgba(255,255,255,0.3)`
                  }}
                />
              </motion.div>
            </div>
            
            {/* Handle para arrastar coluna */}
            <motion.div
              {...sortableListeners}
              className={`p-1 rounded cursor-grab active:cursor-grabbing ${
                theme === 'dark' ? 'hover:bg-slate-700/50' : 'hover:bg-gray-200/50'
              }`}
              whileHover={{ scale: 1.1 }}
              title="Arrastar coluna"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </motion.div>
            
            {/* Nome da Coluna */}
            <div className="flex-1">
              {editingColumnId === coluna.id ? (
                <motion.input
                  type="text"
                  value={editingColumnName}
                  onChange={(e) => onEditingNameChange(e.target.value)}
                  onBlur={() => onSaveColumnName(coluna.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSaveColumnName(coluna.id)
                    }
                  }}
                  className={`w-full px-3 py-2 text-sm font-semibold rounded-xl border-2 transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:bg-slate-700 focus:border-blue-500'
                      : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500'
                  } focus:outline-none focus:ring-4 focus:ring-blue-500/20 backdrop-blur-sm`}
                  autoFocus
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <motion.h3 
                  className={`text-sm font-bold cursor-pointer transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'text-white hover:text-blue-300' 
                      : 'text-gray-900 hover:text-blue-600'
                  }`}
                  onDoubleClick={() => onDoubleClick(coluna)}
                  title="Clique duplo para editar"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {coluna.nome}
                </motion.h3>
              )}
            </div>
          </div>
          
          {/* Lado Direito - Contador e Ações */}
          <div className="flex items-center gap-3">
            {/* Contador de Cards Sofisticado */}
            <motion.div 
              className={`px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-slate-700/60 to-slate-600/60 text-slate-200 border border-slate-600/30' 
                  : 'bg-gradient-to-r from-gray-100/80 to-gray-200/60 text-gray-700 border border-gray-300/30'
              } backdrop-blur-sm shadow-lg`}
              style={{
                boxShadow: `0 4px 12px ${coluna.cor}15`
              }}
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: isOver 
                  ? [`0 4px 12px ${coluna.cor}15`, `0 6px 20px ${coluna.cor}25`, `0 4px 12px ${coluna.cor}15`]
                  : `0 4px 12px ${coluna.cor}15`
              }}
              transition={{ duration: 0.6, repeat: isOver ? Infinity : 0 }}
            >
              {coluna.cards?.length || 0}
            </motion.div>
            
            {/* Botões de Ação Sofisticados */}
            <div className="flex items-center gap-1">
              {/* Botão Adicionar */}
              <motion.button
                onClick={() => handleAddCard(coluna.id)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'hover:bg-green-500/20 text-green-400 hover:text-green-300 border border-transparent hover:border-green-500/30'
                    : 'hover:bg-green-50 text-green-600 hover:text-green-700 border border-transparent hover:border-green-300/50'
                } backdrop-blur-sm shadow-lg hover:shadow-xl`}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                title="Adicionar card"
              >
                <Plus className="w-[15px] h-[15px]" />
              </motion.button>
              
              {/* Botão Deletar */}
              <motion.button
                onClick={() => onDelete(coluna.id)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-transparent hover:border-red-500/30'
                    : 'hover:bg-red-50 text-red-500 hover:text-red-600 border border-transparent hover:border-red-300/50'
                } backdrop-blur-sm shadow-lg hover:shadow-xl`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Deletar coluna"
              >
                <Trash2 className="w-[15px] h-[15px]" />
              </motion.button>
            </div>
          </div>
        </div>
        
      
        {/* Barra de Progresso Enhanced */}
        <div className={`relative h-2 rounded-full overflow-hidden ${
          theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100/60'
        } backdrop-blur-sm`}>
          {/* Background Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${coluna.cor}20 0, ${coluna.cor}20 2px, transparent 2px, transparent 8px)`
            }}
          />
          
          {/* Main Progress Bar */}
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: `linear-gradient(90deg, ${coluna.cor}E6, ${coluna.cor}, ${coluna.cor}CC)`
            }}
            initial={{ width: 0, x: '-100%' }}
            animate={{ 
              width: `${Math.min((coluna.cards?.length || 0) * 12, 100)}%`,
              x: '0%'
            }}
            transition={{ 
              duration: 1.2, 
              ease: "easeOut",
              delay: 0.3 
            }}
            whileHover={{
              filter: 'brightness(1.2)',
              boxShadow: `0 0 20px ${coluna.cor}60`
            }}
          >
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3
              }}
              style={{ width: '30%' }}
            />
            
            {/* Pulse Effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle, ${coluna.cor}40 0%, transparent 70%)`
              }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity
              }}
            />
          </motion.div>
          
          {/* Progress Indicator */}
          <motion.div
            className="absolute top-0 h-full w-1 rounded-full"
            style={{
              background: coluna.cor,
              filter: `drop-shadow(0 0 4px ${coluna.cor})`
            }}
            initial={{ left: '0%' }}
            animate={{ 
              left: `${Math.min((coluna.cards?.length || 0) * 12, 100)}%`
            }}
            transition={{ 
              duration: 1.2, 
              ease: "easeOut",
              delay: 0.6
            }}
          />
        </div>
      </div>

      {/* Área de Cards */}
      <div className="p-4 flex-1">
        {/* Resumo de Orçamentos da Coluna */}
        {(() => {
          const totalOrcamentos = coluna.cards.reduce((total: number, card: any) => {
            const cardOrcamentos = orcamentosData?.[card.id] || []
            console.log('🔍 [COLUNA] Card:', card.id, 'Orçamentos:', cardOrcamentos.length)
            return total + cardOrcamentos.length
          }, 0)
          
          console.log('🔍 [COLUNA] Total orçamentos na coluna:', totalOrcamentos)
          
          const totalAgendamentos = coluna.cards.reduce((total: number, card: any) => {
            const cardAgendamentos = agendamentosData?.[card.id] || []
            return total + cardAgendamentos.length
          }, 0)
          
          const totalValor = coluna.cards.reduce((total: number, card: any) => {
            const cardOrcamentos = orcamentosData?.[card.id] || []
            const cardTotal = cardOrcamentos.reduce((sum: number, orc: any) => {
              // Calcular valor total dos itens se valorTotal for 0
              let valor = parseFloat(orc.valorTotal) || 0
              
              if (valor === 0 && orc.itens && Array.isArray(orc.itens)) {
                valor = orc.itens.reduce((itemSum: number, item: any) => {
                  const quantidade = parseFloat(item.quantidade) || 0
                  const valorUnitario = parseFloat(item.valorUnitario) || 0
                  return itemSum + (quantidade * valorUnitario)
                }, 0)
              }
              
              return sum + valor
            }, 0)
            return total + cardTotal
          }, 0)
          
          const totalAssinaturas = coluna.cards.reduce((total: number, card: any) => {
            const cardAssinaturas = assinaturasData?.[card.id] || []
            return total + cardAssinaturas.length
          }, 0)

          // Só renderizar se houver orçamentos, agendamentos ou assinaturas
          if (totalOrcamentos === 0 && totalAgendamentos === 0 && totalAssinaturas === 0) return null
          
          return (
            <div className="mb-4 space-y-2">
              {/* Resumo de Orçamentos - Componente Isolado */}
              <OrcamentosTotalColuna 
                cards={coluna.cards || []}
                columnColor={coluna.cor}
                theme={theme}
              />
              
              {/* Resumo de Agendamentos */}
              {totalAgendamentos > 0 && (
                <motion.div
                  className="px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-500 overflow-hidden relative"
                  style={{
                    background: theme === 'dark'
                      ? `linear-gradient(135deg, #8B5CF615 0%, rgba(0,0,0,0.3) 100%)`
                      : `linear-gradient(135deg, #8B5CF610 0%, rgba(255,255,255,0.8) 100%)`,
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0'
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar 
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {totalAgendamentos} agendamento{totalAgendamentos !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-purple-500">
                      {totalAgendamentos} total
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Resumo de Assinaturas */}
              {(() => {
                const totalAssinaturas = coluna.cards.reduce((total: number, card: any) => {
                  const cardAssinaturas = assinaturasData?.[card.id] || []
                  return total + cardAssinaturas.length
                }, 0)
                
                const totalValorAssinaturas = coluna.cards.reduce((total: number, card: any) => {
                  const cardAssinaturas = assinaturasData?.[card.id] || []
                  const cardTotal = cardAssinaturas.reduce((sum: number, ass: any) => {
                    const valor = parseFloat(ass.valor) || 0
                    return sum + valor
                  }, 0)
                  return total + cardTotal
                }, 0)
                
                if (totalAssinaturas === 0) return null
                
                return (
                  <motion.div
                    className="px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-500 overflow-hidden relative"
                    style={{
                      background: theme === 'dark'
                        ? `linear-gradient(135deg, #F59E0B15 0%, rgba(0,0,0,0.3) 100%)`
                        : `linear-gradient(135deg, #F59E0B10 0%, rgba(255,255,255,0.8) 100%)`,
                      borderColor: theme === 'dark' ? '#334155' : '#e2e8f0'
                    }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileSignature 
                          className="w-4 h-4 text-amber-500"
                        />
                        <span className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {totalAssinaturas} assinatura{totalAssinaturas !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-amber-500">
                        {totalValorAssinaturas.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </div>
                    </div>
                  </motion.div>
                )
              })()}
            </div>
          )
        })()}
        
        <SortableContext
          items={coluna.cards?.map((card: any) => card.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <LazyCardsList
            cards={coluna.cards || []}
            theme={theme}
            columnColor={coluna.cor}
            notesCount={notesCount}
            orcamentosCount={typeof orcamentosCount === 'number' ? {} : orcamentosCount}
            agendamentosCount={typeof agendamentosCount === 'number' ? {} : agendamentosCount}
            assinaturasCount={assinaturasCount}
            anotacoesCount={notesCount}
            tagsCount={tagsCount}
            ticketsCount={ticketsCount}
            agentesCount={agentesCount || {}}
            contactStatus={contactStatus}
            onOpenAgendamento={onOpenAgendamento}
            onOpenOrcamento={onOpenOrcamento}
            onOpenAssinatura={onOpenAssinatura}
            onOpenAnotacoes={onOpenAnotacoes}
            onOpenTicket={onOpenTicket}
            onOpenAgente={onOpenAgente}
            onOpenTags={onOpenTags}
            onOpenChat={onOpenChat}
            onOpenTransferencia={onOpenTransferencia}
            onOpenEditContato={(card) => {
              console.log('🚀 Disparando evento openEditContactModal:', card);
              const event = new CustomEvent('openEditContactModal', { detail: card });
              window.dispatchEvent(event);
              console.log('✅ Evento openEditContactModal disparado');
            }}
            onOpenDeleteCard={(card) => {
              console.log('🚀 Disparando evento openDeleteCardModal:', card);
              const event = new CustomEvent('openDeleteCardModal', { detail: card });
              window.dispatchEvent(event);
              console.log('✅ Evento openDeleteCardModal disparado');
            }}
            onOpenVideoChamada={onOpenVideoChamada}
            onOpenLigacao={onOpenLigacao}
            onOpenCompartilharTela={onOpenCompartilharTela}
            onOpenConexaoFila={(card) => {
              console.log('🚀 Disparando evento openConexaoFilaModal:', card);
              const event = new CustomEvent('openConexaoFilaModal', { detail: card });
              window.dispatchEvent(event);
              console.log('✅ Evento openConexaoFilaModal disparado');
            }}
            orcamentosData={orcamentosData}
            agendamentosData={agendamentosData}
            assinaturasData={assinaturasData}
            anotacoesData={anotacoesData}
            tagsData={tagsData}
            ticketsData={ticketsData}
            agentesData={agentesData || {}}
          />
        </SortableContext>
        
        {/* Área vazia para drop */}
        {(!coluna.cards || coluna.cards.length === 0) && (
          <div className={`flex flex-col items-center justify-center py-12 text-center transition-all duration-300 ${
            isOver 
              ? theme === 'dark'
                ? 'text-blue-300'
                : 'text-blue-600'
              : theme === 'dark'
                ? 'text-slate-500'
                : 'text-gray-400'
          }`}>
            <motion.div
              animate={{
                scale: isOver ? [1, 1.1, 1] : 1,
                opacity: isOver ? [0.5, 1, 0.5] : 0.5
              }}
              transition={{ duration: 0.8, repeat: isOver ? Infinity : 0 }}
            >
              <Inbox className="w-8 h-8 mb-2" />
            </motion.div>
            <p className="text-sm font-medium">
              {isOver ? 'Solte aqui' : 'Arraste cards para cá'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}



interface SortableCardProps {
  card: any;
  theme: string;
  columnColor: string;
  notesCount: number;
  orcamentosCount: number;
  agendamentosCount: number;
  assinaturasCount: number;
  anotacoesCount: number;
  tagsCount: number;
  ticketsCount: number;
  agentesCount: number;
  contactStatus: 'synced' | 'error';
  onOpenAgendamento: (card: any) => void;
  onOpenOrcamento: (card: any) => void;
  onOpenAssinatura: (card: any) => void;
  onOpenAnotacoes: (card: any) => void;
  onOpenTicket: (card: any) => void;
  onOpenAgente: (card: any) => void;
  onOpenTags: (card: any) => void;
  onOpenChat: (card: any) => void;
  onOpenTransferencia: (card: any) => void;
  onOpenEditContato: (card: any) => void;
  onOpenDeleteCard: (card: any) => void;
  onOpenVideoChamada: () => void;
  onOpenLigacao: () => void;
  onOpenCompartilharTela: () => void;
  onOpenConexaoFila: (card: any) => void;
  orcamentosData: any;
  agendamentosData: any;
  assinaturasData: any;
  anotacoesData: any;
  tagsData: any;
  ticketsData: any;
  agentesData: any;
}

// Componente Sortable para Orçamentos dentro dos cards
function SortableOrcamentoItem({ orc, index, columnColor, theme }: {
  orc: any;
  index: number;
  columnColor: string;
  theme: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `orc-${orc.id}`,
    data: {
      type: 'orcamento',
      orc,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    borderLeft: `3px solid ${columnColor}`,
    background: theme === 'dark' 
      ? `linear-gradient(135deg, ${columnColor}10 0%, transparent 100%)`
      : `linear-gradient(135deg, ${columnColor}08 0%, transparent 100%)`
  }

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-2 rounded-lg cursor-grab active:cursor-grabbing ${
        theme === 'dark' ? 'bg-black/30' : 'bg-white/50'
      } ${isDragging ? 'rotate-2 scale-95' : 'hover:scale-[1.02]'}`}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className={`font-medium text-xs ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          {orc.titulo}
        </h4>
        <span className="text-xs font-bold" style={{ color: columnColor }}>
          R$ {parseFloat(orc.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className={`text-xs px-2 py-1 rounded-full ${
          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
        }`}>
          {orc.status}
        </span>
        {orc.dataVencimento && (
          <span className="text-xs opacity-60">
            {new Date(orc.dataVencimento).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
    </motion.div>
  )
}

// Componente Sortable para Agendamentos dentro dos cards
function SortableAgendamentoItem({ agend, index, columnColor, theme }: {
  agend: any;
  index: number;
  columnColor: string;
  theme: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `agend-${agend.id}`,
    data: {
      type: 'agendamento',
      agend,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-2 rounded-lg cursor-grab active:cursor-grabbing ${
        theme === 'dark' ? 'bg-black/30' : 'bg-white/50'
      } ${isDragging ? 'rotate-2 scale-95' : 'hover:scale-[1.02]'}`}
      style={{
        ...style,
        borderLeft: `3px solid ${columnColor}`,
        background: theme === 'dark' 
          ? `linear-gradient(135deg, ${columnColor}10 0%, transparent 100%)`
          : `linear-gradient(135deg, ${columnColor}08 0%, transparent 100%)`
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex justify-between items-center">
        <h4 className={`font-medium text-xs ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          {agend.titulo}
        </h4>
        <span className={`text-xs px-2 py-1 rounded-full ${
          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
        }`}>
          {agend.status || 'Agendado'}
        </span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs opacity-60">
          {agend.inicio_em ? new Date(agend.inicio_em).toLocaleDateString('pt-BR') : 
           agend.dataHora ? new Date(agend.dataHora).toLocaleDateString('pt-BR') : 
           'Data não definida'}
        </span>
        <span className="text-xs opacity-60">
          {agend.inicio_em ? new Date(agend.inicio_em).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : agend.dataHora ? new Date(agend.dataHora).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '--:--'}
        </span>
      </div>
      {agend.descricao && (
        <div className="mt-1">
          <span className="text-xs opacity-60">
            {agend.descricao}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// Componente Card Sortable
function SortableCard({ 
  card, 
  theme, 
  columnColor,
  notesCount,
  orcamentosCount,
  agendamentosCount,
  assinaturasCount,
  anotacoesCount,
  tagsCount,
  ticketsCount,
  agentesCount,
  contactStatus,
  onOpenAgendamento, 
  onOpenOrcamento,
  onOpenAssinatura,
  onOpenAnotacoes,
  onOpenTicket,
  onOpenAgente,
  onOpenTags,
  onOpenChat,
  onOpenTransferencia,
  onOpenEditContato,
  onOpenDeleteCard,
  onOpenVideoChamada,
  onOpenLigacao,
  onOpenCompartilharTela,
  onOpenConexaoFila,
  orcamentosData,
  agendamentosData,
  assinaturasData,
  anotacoesData,
  tagsData,
  ticketsData,
  agentesData
}: SortableCardProps) {
  // DEBUG: Verificar props chegando no SortableCard
  console.log('🃏 [SORTABLE CARD] Props recebidas:', {
    cardId: card.id,
    agentesCount,
    agentesData: Array.isArray(agentesData) ? agentesData.length : 'not array',
    agentesDataValue: agentesData,
    orcamentosCount,
    agendamentosCount,
    anotacoesCount,
    tagsCount,
    ticketsCount
  })
  
  // DEBUG específico para agentes
  console.log('🤖 [SORTABLE CARD] Dados de agentes detalhados:', {
    cardId: card.id,
    agentesCount,
    agentesCountType: typeof agentesCount,
    agentesData,
    agentesDataType: typeof agentesData,
    agentesDataIsArray: Array.isArray(agentesData),
    agentesDataLength: Array.isArray(agentesData) ? agentesData.length : 'N/A'
  })
  
  // DEBUG ESPECÍFICO AGENTES
  console.log('🤖 [SORTABLE CARD AGENTES] agentesCount para', card.id, ':', agentesCount)
  console.log(`📊 ticketsData prop:`, ticketsData)
  console.log(`  📊 ticketsData length:`, ticketsData?.length)
  console.log(`  📊 ticketsCount > 0?`, (ticketsCount || 0) > 0)
  console.log(`  📊 Vai mostrar badge?`, (ticketsCount || 0) > 0)
  
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isExpandedView, setIsExpandedView] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
  // Debug do estado
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={`p-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-800/30 via-slate-800/20 to-slate-800/10 text-white backdrop-blur-xl'
          : 'bg-gradient-to-br from-white/60 via-white/40 to-white/20 text-gray-900 backdrop-blur-xl shadow-xl'
      } ${
        isDragging ? 'opacity-50 transform rotate-2 scale-95' : 'hover:shadow-2xl hover:scale-[1.02]'
      }`}
      style={{
        ...style,
        borderLeft: `6px solid ${columnColor || '#475569'}`,
        ...(theme === 'dark' 
          ? {
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
            }
          : {
              boxShadow: `0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)`
            }
        )
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Área de drag - Só o header é draggable */}
      <div className="flex-1">
        {/* Header do Card com Avatar Real - ÁREA DRAGGABLE */}
        <div 
          {...listeners}
          className="flex items-center gap-3 mb-3 cursor-grab active:cursor-grabbing"
        >
          {/* Avatar da Conversa */}
          <div className="relative">
            {card.avatar ? (
              <img 
                src={card.avatar} 
                alt={card.contato?.nome || card.name || card.nome || 'Contato'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 shadow-sm"
onError={(e) => {
                  // Fallback se a imagem não carregar
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
            ) : null}
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-white/20 shadow-sm ${
                card.avatar ? 'hidden' : 'flex'
              } ${
                theme === 'dark' ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-300' : 'bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700'
              }`}
              style={{ display: card.avatar ? 'none' : 'flex' }}
            >
              <User className="w-[19px] h-[19px]" />
            </div>
            
            {/* Indicador Online */}
            {card.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm leading-tight truncate ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {card.contato?.nome || card.name || card.nome || card.id.replace('@c.us', '')}
            </h4>
            <div className="flex flex-col gap-1 mt-0.5">
              <span className={`text-xs ${
                theme === 'dark' ? 'text-white/50' : 'text-gray-500'
              }`}>
                {card.contato?.telefone || card.id.replace('@c.us', '')}
              </span>
              {card.contato?.email && (
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-white/40' : 'text-gray-400'
                }`}>
                  {card.contato.email}
                </span>
              )}
              {card.contato?.empresa && (
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  {card.contato.empresa}
                </span>
              )}
              <span className={`text-xs ${
                theme === 'dark' ? 'text-white/30' : 'text-gray-400'
              }`}>
                {card.lastSeen ? `Visto ${card.lastSeen}` : 'Offline'}
              </span>
            </div>
          </div>
        </div>


        {/* Filas, Atendentes, Conexões */}
        <ConexaoFilaBadges card={card} onClick={onOpenConexaoFila} />

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {(() => {
            // DEBUG: verificar que dados estão disponíveis
            console.log(`🏷️ [CARD TAGS] ${card.id}:`)
            console.log('  📦 card:', JSON.stringify(card, null, 2))
            console.log('  👤 card.contato:', JSON.stringify(card.contato, null, 2))
            console.log('  🏷️ card.contato?.tags:', JSON.stringify(card.contato?.tags, null, 2))
            console.log('  📋 card.tags:', JSON.stringify(card.tags, null, 2))
            console.log('  📊 tagsData:', JSON.stringify(tagsData, null, 2))
            
            // Tentar diferentes fontes de tags
            const cardTags = card.contato?.tags || card.tags || tagsData || []
            
            if (!Array.isArray(cardTags) || cardTags.length === 0) {
              return null
            }
            
            return cardTags.map((tag: any, index: number) => (
              <span
                key={tag.id || tag || index}
                className="px-2 py-1 rounded-full text-xs font-medium border"
                style={{
                  backgroundColor: tag.cor ? `${tag.cor}20` : (theme === 'dark' ? '#1e293b20' : '#f1f5f920'),
                  borderColor: tag.cor || (theme === 'dark' ? '#475569' : '#cbd5e1'),
                  color: tag.cor || (theme === 'dark' ? '#cbd5e1' : '#475569')
                }}
                title={tag.nome || tag}
              >
                {tag.nome || tag}
              </span>
            ))
          })()}

          {/* Agentes IA */}
          {(() => {
            const cardAgentes = agentesData || []
            
            if (!Array.isArray(cardAgentes) || cardAgentes.length === 0) {
              return null
            }
            
            return cardAgentes.map((agente: any, index: number) => (
              <span
                key={agente.id || index}
                className="px-2 py-1 rounded-full text-xs font-medium border"
                style={{
                  backgroundColor: theme === 'dark' ? '#7c3aed20' : '#e9d5ff',
                  borderColor: theme === 'dark' ? '#7c3aed' : '#c084fc',
                  color: theme === 'dark' ? '#c4b5fd' : '#7c2d12'
                }}
                title={`Agente IA: ${agente.nome || agente.id}`}
              >
                🤖 {agente.nome || 'Agente IA'}
              </span>
            ))
          })()}

          {/* Badge Tickets */}
          {(() => {
            const ticketCount = ticketsCount || 0
            const openTickets = ticketsData?.filter((t: any) => t.status === 'ABERTO').length || 0
       
            
            return ticketCount > 0 && (
              <div
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border cursor-pointer hover:scale-105 transition-all"
                style={{
                  backgroundColor: '#ef444420',
                  borderColor: '#ef444440',
                  color: '#ef4444'
                }}
                title={`${ticketCount} ticket(s) - ${openTickets} aberto(s)`}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenTicket(card)
                }}
              >
                <Ticket className="w-[11px] h-[11px]" />
                <span>{ticketCount}</span>
              </div>
            )
          })()}

          {/* Badge Agentes Ativos */}
          {(() => {
            const agentesAtivos = (agentesCount || {})[card.id] || 0
            
            console.log('🤖 [BADGE DEBUG] Card:', card.id, 'agentesAtivos:', agentesAtivos, 'agentesCount:', agentesCount)
            
            // Mostrar badge apenas quando há agentes ativos
            if (agentesAtivos === 0) return null
            
            return (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition-transform"
                style={{
                  backgroundColor: agentesAtivos > 0 ? '#10b98110' : '#6b728010',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: agentesAtivos > 0 ? '#10b98140' : '#6b728040',
                  color: agentesAtivos > 0 ? '#10b981' : '#6b7280'
                }}
                title={`${agentesAtivos} agente(s) ativo(s)`}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenAgente(card)
                }}
              >
                <Bot className="w-[11px] h-[11px]" />
                <span>{agentesAtivos}</span>
              </div>
            )
          })()}

          {/* Badge Tags - Componente Isolado */}
          <TagsBadge cardId={card.id} theme={theme} />

          {/* Badge Filas */}
          {(() => {
            const filasCount = card.filas?.length || 0
            
            return filasCount > 0 && (
              <div
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
                style={{
                  backgroundColor: '#3b82f620',
                  borderColor: '#3b82f640',
                  color: '#3b82f6'
                }}
                title={`${filasCount} fila(s) atribuída(s)`}
              >
                <Layers className="w-[11px] h-[11px]" />
                <span>{filasCount}</span>
              </div>
            )
          })()}

          {/* Badge Atendentes */}
          {(() => {
            const atendentesCount = card.atendentes?.length || 0
            
            return atendentesCount > 0 && (
              <div
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
                style={{
                  backgroundColor: '#8b5cf620',
                  borderColor: '#8b5cf640',
                  color: '#8b5cf6'
                }}
                title={`${atendentesCount} atendente(s) responsável(eis)`}
              >
                <UserCheck className="w-[11px] h-[11px]" />
                <span>{atendentesCount}</span>
              </div>
            )
          })()}
        </div>

        {/* Badges que aparecem apenas no hover */}
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            height: isHovered ? 'auto' : 0
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          {/* Badge Tags */}
          {(() => {
            const tags = tagsData?.[card.id] || []
            return tags.length > 0 && (
              <div
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{
                  background: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}
              >
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs rounded-full"
                      style={{
                        backgroundColor: tag.cor + '20',
                        color: tag.cor,
                        border: `1px solid ${tag.cor}40`
                      }}
                    >
                      {tag.nome}
                    </span>
                  ))}
                </div>
              </div>
            )
          })()}
          
          {/* Badge Agente Responsável */}
          {(() => {
            const agente = agentesData?.[card.id]
            return agente && (
              <div
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{
                  background: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}
              >
                <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                <span className={`text-xs ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                  Agente: <strong>{agente.nome || agente.email}</strong>
                </span>
              </div>
            )
          })()}
          
          {/* Badge Orçamentos - Componente Isolado */}
          <OrcamentosBadge 
            cardId={card.id} 
            columnColor={columnColor} 
            theme={theme}
            onClick={() => {
              console.log('Clicou orçamentos, expandedSection atual:', expandedSection)
              setExpandedSection(expandedSection === 'orcamentos' ? null : 'orcamentos')
            }}
          />

          {/* Badge Agendamentos - Clicável */}
          {agendamentosCount > 0 && (
            <div
              className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200"
              style={{
                background: theme === 'dark' 
                  ? `${columnColor}15`
                  : `${columnColor}10`,
                border: `1px solid ${columnColor}30`
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Clicou agendamentos, expandedSection atual:', expandedSection)
                setExpandedSection(expandedSection === 'agendamentos' ? null : 'agendamentos')
              }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" style={{ color: columnColor }} />
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {agendamentosCount} Agendamento{agendamentosCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Badge Assinaturas - Clicável */}
          {assinaturasCount > 0 && (
            <div
              className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200"
              style={{
                background: theme === 'dark' 
                  ? `${columnColor}15`
                  : `${columnColor}10`,
                border: `1px solid ${columnColor}30`
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Clicou assinaturas, expandedSection atual:', expandedSection)
                setExpandedSection(expandedSection === 'assinaturas' ? null : 'assinaturas')
              }}
            >
              <div className="flex items-center gap-2">
                <FileSignature className="w-3.5 h-3.5" style={{ color: columnColor }} />
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {assinaturasCount} Assinatura{assinaturasCount > 1 ? 's' : ''}
                </span>
              </div>
              {assinaturasData && assinaturasData[card.id] && (
                <div className="text-xs font-bold" style={{ color: columnColor }}>
                  R$ {assinaturasData[card.id].reduce((sum: number, ass: any) => 
                    sum + (parseFloat(ass.valor) || 0), 0
                  ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>
          )}

          {/* Badge Anotações - Clicável */}
          {anotacoesCount > 0 && (
            <div
              className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200"
              style={{
                background: theme === 'dark' 
                  ? `${columnColor}15`
                  : `${columnColor}10`,
                border: `1px solid ${columnColor}30`
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Clicou anotações, expandedSection atual:', expandedSection)
                setExpandedSection(expandedSection === 'anotacoes' ? null : 'anotacoes')
              }}
            >
              <div className="flex items-center gap-2">
                <StickyNote className="w-3.5 h-3.5" style={{ color: columnColor }} />
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {anotacoesCount} Anotaç{anotacoesCount > 1 ? 'ões' : 'ão'}
                </span>
              </div>
            </div>
          )}

          {/* Badge Tickets - Clicável */}
          {ticketsCount > 0 && (
            <div
              className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200"
              style={{
                background: theme === 'dark' 
                  ? `${columnColor}15`
                  : `${columnColor}10`,
                border: `1px solid ${columnColor}30`
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Clicou tickets, expandedSection atual:', expandedSection)
                setExpandedSection(expandedSection === 'tickets' ? null : 'tickets')
              }}
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-3.5 h-3.5" style={{ color: columnColor }} />
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {ticketsCount} Ticket{ticketsCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Agentes - Clicável */}
          {agentesCount > 0 && (
            <div
              className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:scale-105 transition-all duration-200"
              style={{
                background: theme === 'dark' 
                  ? `${columnColor}15`
                  : `${columnColor}10`,
                border: `1px solid ${columnColor}30`
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Clicou agentes, expandedSection atual:', expandedSection)
                setExpandedSection(expandedSection === 'agentes' ? null : 'agentes')
              }}
            >
              <div className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5" style={{ color: columnColor }} />
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {agentesCount} Agente{agentesCount > 1 ? 's' : ''} IA
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Seções Expandidas - Aparecem quando clicadas */}
        <AnimatePresence>
          {/* Detalhes Orçamentos Expandidos - Componente Isolado */}
          {expandedSection === 'orcamentos' && (
            <OrcamentosExpandido 
              cardId={card.id}
              columnColor={columnColor}
              theme={theme}
              onOpenOrcamento={() => onOpenOrcamento(card)}
            />
          )}

          {/* Detalhes Agendamentos Expandidos */}
          {expandedSection === 'agendamentos' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-3 space-y-2"
              style={{ overflow: 'hidden' }}
            >
              {agendamentosData && Array.isArray(agendamentosData) && agendamentosData.length > 0 ? (
                agendamentosData.map((agend: any, index: number) => (
                  <motion.div
                    key={agend.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-black/30' : 'bg-white/50'
                    }`}
                    style={{
                      borderLeft: `3px solid ${columnColor}`,
                      background: theme === 'dark' 
                        ? `linear-gradient(135deg, ${columnColor}10 0%, transparent 100%)`
                        : `linear-gradient(135deg, ${columnColor}08 0%, transparent 100%)`
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className={`font-medium text-xs ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {agend.titulo}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {agend.status || 'Agendado'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs opacity-60">
                        {(() => {
                          const data = agend.dataHora || agend.data || agend.createdAt || agend.criadoEm
                          console.log('🔍 DEBUG Agendamento data:', { dataHora: agend.dataHora, data: agend.data, createdAt: agend.createdAt, criadoEm: agend.criadoEm })
                          return data ? new Date(data).toLocaleDateString('pt-BR') : 'Data não definida'
                        })()}
                      </span>
                      <span className="text-xs opacity-60">
                        {(() => {
                          const data = agend.dataHora || agend.data || agend.createdAt || agend.criadoEm
                          return data ? new Date(data).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : '--:--'
                        })()}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg text-center ${
                    theme === 'dark' ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100/50 text-gray-600'
                  }`}
                >
                  <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum agendamento encontrado</p>
                  <button
                    onClick={() => onOpenAgendamento(card)}
                    className="mt-2 text-xs underline hover:opacity-80"
                    style={{ color: columnColor }}
                  >
                    Criar novo agendamento
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Detalhes Assinaturas Expandidos */}
          {expandedSection === 'assinaturas' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-3 space-y-2"
              style={{ overflow: 'hidden' }}
            >
              {assinaturasData && Array.isArray(assinaturasData) && assinaturasData.length > 0 ? (
                assinaturasData.map((ass: any, index: number) => (
                  <motion.div
                    key={ass.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-black/30' : 'bg-white/50'
                    }`}
                    style={{
                      borderLeft: `3px solid ${columnColor}`,
                      background: theme === 'dark' 
                        ? `linear-gradient(135deg, ${columnColor}10 0%, transparent 100%)`
                        : `linear-gradient(135deg, ${columnColor}08 0%, transparent 100%)`
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className={`font-medium text-xs ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {ass.nome || ass.titulo || 'Assinatura'}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {ass.status || 'Ativa'}
                      </span>
                    </div>
                    {ass.valor && (
                      <div className="mt-1">
                        <span className="text-xs font-bold" style={{ color: columnColor }}>
                          R$ {parseFloat(ass.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 rounded-lg text-center ${
                    theme === 'dark' ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100/50 text-gray-600'
                  }`}
                >
                  <FileSignature className="w-5 h-5 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">Nenhuma assinatura encontrada</p>
                  <button
                    onClick={() => onOpenAssinatura(card)}
                    className="mt-2 text-xs underline hover:opacity-80"
                    style={{ color: columnColor }}
                  >
                    Criar nova assinatura
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Detalhes Anotações Expandidos */}
          {expandedSection === 'anotacoes' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-3 space-y-2"
              style={{ overflow: 'hidden' }}
            >
              {anotacoesData && Array.isArray(anotacoesData) && anotacoesData.length > 0 ? (
                anotacoesData.map((anotacao: any, index: number) => (
                  <motion.div
                    key={anotacao.id}
                    onClick={() => onOpenAnotacoes(card)}
                    className={`p-2 rounded-lg cursor-pointer hover:scale-[1.02] transition-transform ${
                      theme === 'dark' ? 'bg-black/30' : 'bg-white/50'
                    }`}
                    style={{
                      borderLeft: `3px solid ${columnColor}`,
                      background: theme === 'dark' 
                        ? `linear-gradient(135deg, ${columnColor}10 0%, transparent 100%)`
                        : `linear-gradient(135deg, ${columnColor}08 0%, transparent 100%)`
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-medium text-xs ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {anotacao.titulo || 'Anotação'}
                      </h4>
                      <span className="text-xs opacity-60">
                        {anotacao.createdAt ? new Date(anotacao.createdAt).toLocaleDateString('pt-BR') : ''}
                      </span>
                    </div>
                    <p className="text-xs opacity-80">
                      {anotacao.conteudo || anotacao.texto || 'Sem conteúdo'}
                    </p>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg text-center ${
                    theme === 'dark' ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100/50 text-gray-600'
                  }`}
                >
                  <StickyNote className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Nenhuma anotação encontrada</p>
                  <button
                    onClick={() => onOpenAnotacoes(card)}
                    className="mt-2 text-xs underline hover:opacity-80"
                    style={{ color: columnColor }}
                  >
                    Adicionar primeira anotação
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Detalhes Agentes Expandidos */}
          {expandedSection === 'agentes' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-3 space-y-2"
              style={{ overflow: 'hidden' }}
            >
              {agentesData ? (
                [agentesData].map((agente: any, index: number) => (
                  <motion.div
                    key={agente.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-800/50 border-gray-700/50 text-gray-200' 
                        : 'bg-white/80 border-gray-200/50 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <Bot className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium truncate">
                            {agente.nome || 'Agente IA'}
                          </h4>
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                            {agente.categoria || 'Geral'}
                          </span>
                        </div>
                        {agente.funcao && (
                          <p className="text-xs text-gray-500 mb-2">
                            Função: {agente.funcao}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-600 font-medium">
                            ● Ativo
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onOpenAgente(card)
                            }}
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                          >
                            Gerenciar
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 rounded-lg text-center ${
                    theme === 'dark' ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100/50 text-gray-600'
                  }`}
                >
                  <Bot className="w-5 h-5 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">Nenhum agente ativo</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Detalhes Tickets Expandidos */}
          {expandedSection === 'tickets' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-3 space-y-2"
              style={{ overflow: 'hidden' }}
            >
              {ticketsData && Array.isArray(ticketsData) && ticketsData.length > 0 ? (
                ticketsData.map((ticket: any, index: number) => (
                  <motion.div
                    key={ticket.id}
                    onClick={() => onOpenTicket(card)}
                    className={`p-2 rounded-lg cursor-pointer hover:scale-[1.02] transition-transform ${
                      theme === 'dark' ? 'bg-black/30' : 'bg-white/50'
                    }`}
                    style={{
                      borderLeft: `3px solid ${columnColor}`,
                      background: theme === 'dark' 
                        ? `linear-gradient(135deg, ${columnColor}10 0%, transparent 100%)`
                        : `linear-gradient(135deg, ${columnColor}08 0%, transparent 100%)`
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-medium text-xs ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {ticket.titulo || ticket.title || 'Ticket'}
                      </h4>
                      <span className="text-xs opacity-60">
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('pt-BR') : ''}
                      </span>
                    </div>
                    <p className="text-xs opacity-80">
                      {ticket.descricao || ticket.description || ticket.conteudo || 'Sem descrição'}
                    </p>
                    {ticket.status && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          ticket.status === 'open' ? 'bg-green-500/20 text-green-400' :
                          ticket.status === 'closed' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {ticket.status === 'open' ? 'Aberto' : 
                           ticket.status === 'closed' ? 'Fechado' : 
                           ticket.status === 'pending' ? 'Pendente' : ticket.status}
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg text-center ${
                    theme === 'dark' ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100/50 text-gray-600'
                  }`}
                >
                  <Ticket className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Nenhum ticket encontrado</p>
                  <button
                    onClick={() => onOpenTicket(card)}
                    className="mt-2 text-xs underline hover:opacity-80"
                    style={{ color: columnColor }}
                  >
                    Criar primeiro ticket
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Área de Ações - NÃO draggable */}
      <div className="flex flex-col gap-3 mt-3">
        {/* Ações do ChatArea - Alinhadas à Esquerda */}
        <div className={`flex items-center gap-0.2 px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-slate-700/60 to-slate-600/60 text-slate-200 border border-slate-600/30' 
            : 'bg-gradient-to-r from-gray-100/80 to-gray-200/60 text-gray-700 border border-gray-300/30'
        } backdrop-blur-sm shadow-lg self-start`}
        style={{
          boxShadow: `0 4px 12px ${columnColor || '#64748b'}15`
        }}>
      
          {/* Conexão/Fila
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenConexaoFila(card)
            }}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Gerenciar Conexão/Fila"
          >
            <Network className="w-[11px] h-[11px]" />
          </motion.button> */}

          {/* Gerenciar Agente IA */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenAgente(card)
            }}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Gerenciar Agente IA"
          >
            <Bot className="w-[11px] h-[11px]" />
            
            {/* Badge de quantidade de agentes */}
            {(() => {
              const agentesAtivos = agentesCount || 0
              
              console.log('🤖 [BOT BADGE] Card:', card.id, 'agentesCount:', agentesCount, 'agentesAtivos:', agentesAtivos)
              
              if (agentesAtivos > 0) {
                return (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-md">
                    {agentesAtivos}
                  </div>
                )
              }
              return null
            })()}
          </motion.button>

          {/* Editar Contato */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('🔧 Clicou em Editar Contato:', card)
              onOpenEditContato(card)
            }}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-blue-600/50 text-blue-300 hover:text-blue-200' 
                : 'hover:bg-blue-200/50 text-blue-600 hover:text-blue-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Editar Contato"
          >
            <UserCheck className="w-[11px] h-[11px]" />
          </motion.button>
            
          {/* Deletar Card */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('🗑️ Clicou em Deletar Card:', card)
              onOpenDeleteCard(card)
            }}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-red-600/50 text-red-300 hover:text-red-200' 
                : 'hover:bg-red-200/50 text-red-600 hover:text-red-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Excluir Card"
          >
            <Trash2 className="w-[11px] h-[11px]" />
          </motion.button>
            
          {/* Agendar */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenAgendamento(card)
            }}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Agendar"
          >
              <Calendar className="w-[11px] h-[11px]" />
              {/* Badge com número de agendamentos - SEMPRE MOSTRA SE > 0 */}
              {(agendamentosCount || 0) > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                  {agendamentosCount > 99 ? '99+' : agendamentosCount}
                </span>
              )}
            </motion.button>
            
          {/* Orçamento */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenOrcamento(card)
            }}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Orçamento"
          >
              <DollarSign className="w-[11px] h-[11px]" />
              {/* Badge com número de orçamentos - SEMPRE MOSTRA SE > 0 */}
              {(orcamentosCount[card.id] || 0) > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                  {orcamentosCount[card.id] > 99 ? '99+' : orcamentosCount[card.id]}
                </span>
              )}
            </motion.button>
            
          {/* Assinatura */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenAssinatura(card)
            }}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Assinatura"
          >
              <FileSignature className="w-[11px] h-[11px]" />
              {/* Badge com número de assinaturas - SEMPRE MOSTRA SE > 0 */}
              {(assinaturasCount || 0) > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                  {assinaturasCount > 99 ? '99+' : assinaturasCount}
                </span>
              )}
            </motion.button>
            
            
          {/* Anotações */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenAnotacoes(card)
            }}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Anotações"
          >
              <StickyNote className="w-[11px] h-[11px]" />
              {/* Badge com número de anotações - SEMPRE MOSTRA SE > 0 */}
              {(notesCount || 0) > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                  {notesCount > 99 ? '99+' : notesCount}
                </span>
              )}
            </motion.button>
            
          {/* Ticket */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenTicket(card)
            }}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Ticket"
          >
            <Ticket className="w-[11px] h-[11px]" />
            {/* Badge com número de tickets - SEMPRE MOSTRA SE > 0 */}
            {(ticketsCount || 0) > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                {ticketsCount > 99 ? '99+' : ticketsCount}
              </span>
            )}
          </motion.button>
          
          {/* Tags */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenTags(card)
            }}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Tags"
          >
            <Tag className="w-[11px] h-[11px]" />
            {/* Badge com número de tags */}
            {(tagsCount[card.id] || 0) > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                {tagsCount[card.id] > 99 ? '99+' : tagsCount[card.id]}
              </span>
            )}
          </motion.button>
          
          {/* Chat */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenChat(card)
            }}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Abrir Chat"
          >
            <MessageCircle className="w-[11px] h-[11px]" />
          </motion.button>
        </div>
        
        {/* Informações adicionais */}
        <div className="flex items-center gap-3 text-xs">
          {/* Última visualização */}
          {card.lastSeen && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#273155]" />
              <span className={`text-xs ${
                theme === 'dark' ? 'text-white/60' : 'text-gray-500'
              }`}>
                {card.lastSeen}
              </span>
            </div>
          )}
          
          {/* Mídia/Anexos */}
          {card.anexos > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3 text-[#273155]" />
              <span className={`text-xs ${
                theme === 'dark' ? 'text-white/60' : 'text-gray-500'
              }`}>
                {card.anexos}
              </span>
            </div>
          )}
          
         
        </div>
      </div>
    </div>
  )
}

// Mock data para colunas e cards (será substituído pela IA)
const mockColunas = [
  {
    id: '1',
    nome: 'Leads Qualificados',
    cor: '#3b82f6',
    posicao: 1,
    cards: [
      {
        id: '1',
        name: 'Tech Startup Solutions',
        nome: 'Tech Startup Solutions',
        profilePicUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        posicao: 1,
        tags: ['Hot Lead', 'Tech', 'SaaS'],
        lastSeen: 'há 2 min',
        responsavel: 'João Silva',
        comentarios: 0,
        anexos: 3,
        isOnline: true
      },
      {
        id: '2',
        name: 'Premium Food Chain',
        nome: 'Premium Food Chain',
        profilePicUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        posicao: 2,
        tags: ['Premium', 'Food', 'Enterprise'],
        lastSeen: 'há 15 min',
        responsavel: 'Maria Santos',
        comentarios: 2,
        anexos: 5,
        isOnline: false
      }
    ]
  },
  {
    id: '2',
    nome: 'Em Negociação',
    cor: '#f59e0b',
    posicao: 2,
    cards: [
      {
        id: '3',
        name: 'FoodCorp Enterprise',
        nome: 'FoodCorp Enterprise',
        profilePicUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        posicao: 1,
        tags: ['Proposta', 'Enterprise', 'B2B'],
        lastSeen: 'há 1 hora',
        responsavel: 'Carlos Lima',
        comentarios: 1,
        anexos: 8,
        isOnline: true
      }
    ]
  },
  {
    id: '3',
    nome: 'Fechamento',
    cor: '#10b981',
    posicao: 3,
    cards: [
      {
        id: '4',
        name: 'DeliveryMax Startup',
        nome: 'DeliveryMax Startup',
        profilePicUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        posicao: 1,
        tags: ['Contrato', 'Startup', 'Delivery'],
        lastSeen: 'há 30 min',
        responsavel: 'Ana Costa',
        comentarios: 0,
        anexos: 12,
        isOnline: false
      }
    ]
  },
  {
    id: '4',
    nome: 'Pós-Venda',
    cor: '#8b5cf6',
    posicao: 4,
    cards: [
      {
        id: '5',
        name: 'QuickFood Solutions',
        nome: 'QuickFood Solutions',
        profilePicUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        posicao: 1,
        tags: ['Onboarding', 'Training', 'Support'],
        lastSeen: 'há 3 horas',
        responsavel: 'Pedro Oliveira',
        comentarios: 3,
        anexos: 7,
        isOnline: true
      }
    ]
  }
]

export default function QuadroPage() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const { getQuadro } = useKanban()
  const id = params.id as string
  
  // Hook otimizado para Kanban com batch fetching e cache
  const {
    cards: optimizedCards,
    loading: optimizedLoading,
    error: optimizedError,
    columnStats,
    prefetching,
    forceRefresh,
    getCardData,
    getColumnStats
  } = useKanbanOptimized(id)
  
  // Hook customizado para Kanban - contatos do CRM
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [quadro, setQuadro] = useState<any>(null)
  // Estados para armazenar metadados de cards
  const [cardMetadata, setCardMetadata] = useState<Record<string, any>>({})
  
  // Estados para dados individuais (orçamentos, agendamentos, assinaturas, anotações, tags, tickets, agentes)
  const [orcamentosDataState, setOrcamentosDataState] = useState<Record<string, any[]>>({})
  const [agendamentosDataState, setAgendamentosDataState] = useState<Record<string, any[]>>({})
  const [assinaturasCount, setAssinaturasCount] = useState<Record<string, number>>({})
  const [anotacoesDataState, setAnotacoesDataState] = useState<Record<string, any[]>>({})
  const [tagsDataState, setTagsDataState] = useState<Record<string, any[]>>({})
  const [ticketsDataState, setTicketsDataState] = useState<Record<string, any[]>>({})
  const [agentesDataState, setAgentesDataState] = useState<Record<string, any[]>>({})
  
  // Criar contagens baseadas nos dados individuais - MOVIDO PARA DEPOIS
  
  const agendamentosCount = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.keys(agendamentosDataState).forEach(cardId => {
      counts[cardId] = agendamentosDataState[cardId]?.length || 0
    })
    return counts
  }, [agendamentosDataState])

  const anotacoesCount = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.keys(anotacoesDataState).forEach(cardId => {
      counts[cardId] = anotacoesDataState[cardId]?.length || 0
    })
    return counts
  }, [anotacoesDataState])

  const tagsCount = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.keys(tagsDataState).forEach(cardId => {
      counts[cardId] = tagsDataState[cardId]?.length || 0
    })
    return counts
  }, [tagsDataState])

  const ticketsCount = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.keys(ticketsDataState).forEach(cardId => {
      counts[cardId] = ticketsDataState[cardId]?.length || 0
    })
    console.log('🎫 [TICKETS COUNT] counts calculadas:', counts)
    console.log('🎫 [TICKETS COUNT] ticketsDataState atual:', ticketsDataState)
    console.log('🎫 [TICKETS COUNT] Total de cards com dados:', Object.keys(ticketsDataState).length)
    
    // Debug específico para cards com tickets
    Object.keys(ticketsDataState).forEach(cardId => {
      if (ticketsDataState[cardId]?.length > 0) {
        console.log(`🎫 [TICKETS COUNT] Card ${cardId} tem ${ticketsDataState[cardId].length} tickets:`, ticketsDataState[cardId])
      }
    })
    
    return counts
  }, [ticketsDataState])

  const agentesCount = useMemo(() => {
    const counts: Record<string, number> = {}
    
    // Aguardar dados do batch carregarem
    if (optimizedLoading) {
      console.log('🤖 [AGENTES COUNT] Aguardando dados carregarem - optimizedLoading:', optimizedLoading)
      return counts // Retorna vazio enquanto carrega
    }
    
    console.log('🤖 [DEBUG] optimizedCards disponível?', !!optimizedCards)
    console.log('🤖 [DEBUG] optimizedCards keys:', optimizedCards ? Object.keys(optimizedCards) : 'undefined')
    
    // USAR DADOS DO BATCH (useKanbanOptimized) quando carregou
    if (optimizedCards && Object.keys(optimizedCards).length > 0) {
      console.log('🤖 [AGENTES COUNT] Usando dados do batch otimizado')
      console.log('🤖 [AGENTES COUNT] optimizedCards:', optimizedCards)
      
      // Contar agentes dos dados otimizados
      Object.keys(optimizedCards).forEach(cardId => {
        const cardData = optimizedCards[cardId]
        if (cardData?.agentes && Array.isArray(cardData.agentes)) {
          counts[cardId] = cardData.agentes.length
          console.log('🤖 [AGENTES COUNT] Card', cardId, ':', cardData.agentes.length, 'agentes')
        } else {
          console.log('🤖 [AGENTES COUNT] Card', cardId, ': SEM agentes ou não array')
        }
      })
    } else {
      // Fallback para agentesDataState se batch não disponível
      console.log('🤖 [AGENTES COUNT] Fallback para individual:', agentesDataState)
      Object.keys(agentesDataState).forEach(cardId => {
        counts[cardId] = agentesDataState[cardId]?.length || 0
      })
    }
    
    console.log('🤖 [AGENTES COUNT] Counts finais:', counts)
    return counts
  }, [optimizedCards, agentesDataState, optimizedLoading])
  
  const [hasManualChanges, setHasManualChanges] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Usar dados individuais ao invés dos dados otimizados vazios
  const orcamentosData = orcamentosDataState
  const agendamentosData = agendamentosDataState
  const anotacoesData = anotacoesDataState
  const tagsData = tagsDataState
  const ticketsData = ticketsDataState
  const agentesData = agentesDataState
  
  // Calcular contagens após declarar os dados - IGUAL AOS TICKETS
  const orcamentosCount = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.keys(orcamentosDataState).forEach(cardId => {
      counts[cardId] = orcamentosDataState[cardId]?.length || 0
    })
    console.log('💰 [ORCAMENTOS COUNT] counts calculadas:', counts)
    console.log('💰 [ORCAMENTOS COUNT] orcamentosDataState atual:', orcamentosDataState)
    console.log('💰 [ORCAMENTOS COUNT] Total de cards com dados:', Object.keys(orcamentosDataState).length)
    return counts
  }, [orcamentosDataState])
  
  // Buscar dados de assinaturas do hook otimizado
  const assinaturasData: { [cardId: string]: any[] } = {}
  Object.keys(optimizedCards).forEach(cardId => {
    const cardData = optimizedCards[cardId]
    if (cardData?.assinaturas) {
      assinaturasData[cardId] = cardData.assinaturas
    }
  })
  
  // Estados para modais
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [showCreateCardModal, setShowCreateCardModal] = useState(false)
  const [selectedColunaId, setSelectedColunaId] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [agendamentoModal, setAgendamentoModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [orcamentoModal, setOrcamentoModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [assinaturaModal, setAssinaturaModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [anotacoesModal, setAnotacoesModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [ticketModal, setTicketModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [agenteModal, setAgenteModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [conexaoFilaModal, setConexaoFilaModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [editContactModal, setEditContactModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [deleteCardModal, setDeleteCardModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [tagsModal, setTagsModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [chatModal, setChatModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [criarCardModal, setCriarCardModal] = useState({ isOpen: false, colunaId: '' })
  const [videoChamadaModal, setVideoChamadaModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [ligacaoModal, setLigacaoModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [compartilharTelaModal, setCompartilharTelaModal] = useState({ isOpen: false, card: null as WhatsAppChat | null })
  const [colorPickerModal, setColorPickerModal] = useState({ isOpen: false, colunaId: '', currentColor: '#3b82f6' })
  const [selectedCompartilharTelaCard, setSelectedCompartilharTelaCard] = useState<any>(null)
  const [editingQuadroName, setEditingQuadroName] = useState('')
  const [editingQuadroTitle, setEditingQuadroTitle] = useState(false)
  const [editingQuadroDescription, setEditingQuadroDescription] = useState(false)
  const [editingQuadroDescricao, setEditingQuadroDescricao] = useState('')
  
  // Função para carregar contatos do CRM
  const loadChatsManual = async () => {
    setLoading(true)
    
    await fileLogger.log({
      component: 'Kanban',
      action: 'loadContatos_started',
      data: { timestamp: new Date().toISOString() },
      userId: user?.id
    })
    
    try {
      const token = localStorage.getItem('token')
      
      await fileLogger.log({
        component: 'Kanban',
        action: 'loadContatos_config',
        data: { 
          hasToken: !!token, 
          userId: user?.id,
          timestamp: new Date().toISOString()
        },
        userId: user?.id
      })
      
      if (!token) {
        console.error('Token não encontrado')
        return
      }

      await fileLogger.log({
        component: 'Kanban',
        action: 'loadChatsManual_response',
        data: { 
        },
        userId: user?.id
      })
      
      const response = await fetch(`/api/contatos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      await fileLogger.log({
        component: 'Kanban',
        action: 'loadContatos_response',
        data: { 
          status: response.status, 
          ok: response.ok,
          timestamp: new Date().toISOString(),
        },
        userId: user?.id
      })

      await fileLogger.log({
        component: 'Kanban',
        action: 'loadChatsManual_response',
        data: { 
          status: response.status, 
          ok: response.ok,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        },
        userId: user?.id
      })

      if (response.ok) {
        const data = await response.json()
        
        await fileLogger.log({
          component: 'Kanban',
          action: 'loadContactsManual_data_received',
          data: { 
            type: typeof data, 
            isArray: Array.isArray(data), 
            length: data?.length || 0,
            sample: data?.slice(0, 3) || [],
            rawData: data
          },
          userId: user?.id
        })
        
        // Transformar contatos para formato compatível com o kanban
        const transformedContacts = data.map((contact: any) => {
          // Criar chatId a partir do número de telefone do contato
          const chatId = contact.numeroTelefone ? `${contact.numeroTelefone}@c.us` : `contact_${contact.id}@c.us`
          
          return {
            id: chatId, // Usar chatId como ID para compatibilidade
            name: contact.nome || 'Sem nome',
            title: contact.nome || 'Sem nome',
            pushname: contact.nome,
            numeroTelefone: contact.numeroTelefone,
            email: contact.email,
            empresa: contact.empresa,
            profilePictureUrl: contact.fotoPerfil || null,
            isGroup: false,
            lastMessage: null,
            timestamp: contact.createdAt || Date.now(),
            contactId: contact.id, // Manter o ID original do contato
            // Dados adicionais do contato
            cpf: contact.cpf,
            cnpj: contact.cnpj,
            endereco: {
              cep: contact.cep,
              rua: contact.rua,
              numero: contact.numero,
              bairro: contact.bairro,
              cidade: contact.cidade,
              estado: contact.estado,
              pais: contact.pais
            }
          }
        })
        
        await fileLogger.log({
          component: 'Kanban',
          action: 'loadContactsManual_contacts_transformed',
          data: { 
            count: transformedContacts?.length || 0,
            firstContact: transformedContacts?.[0] || null,
            allContactNames: transformedContacts?.map(c => c.name) || []
          },
          userId: user?.id
        })
        
        setChats(transformedContacts || [])
        
        await fileLogger.log({
          component: 'Kanban',
          action: 'loadContactsManual_success',
          data: { 
            finalContactCount: transformedContacts?.length || 0,
            success: true
          },
          userId: user?.id
        })
        
      } else {
        const errorText = await response.text()
        
        await fileLogger.log({
          component: 'Kanban',
          action: 'loadContatos_api_error',
          data: { 
            status: response.status, 
            statusText: response.statusText,
            error: errorText,
            url: `/api/contatos`
          },
          userId: user?.id
        })
      }
    } catch (error) {
      await fileLogger.log({
        component: 'Kanban',
        action: 'loadChatsManual_exception',
        data: { 
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : null
        },
        userId: user?.id
      })
    } finally {
      setLoading(false)
      
      await fileLogger.log({
        component: 'Kanban',
        action: 'loadChatsManual_finished',
        data: { 
          finalState: {
            chatsLength: chats.length,
            loading: false
          }
        },
        userId: user?.id
      })
    }
  }
  
  const refreshData = () => {
    loadChatsManual()
  }
  
  // Funções auxiliares
  const getColunaName = (colunaId: string) => {
    const coluna = colunas.find(col => col.id === colunaId)
    return coluna?.nome || 'Coluna desconhecida'
  }
  
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    // TODO: Implementar toast notifications
  }
  
  // Handlers dos modais do ChatArea
  const handleAgendamentoSave = async (agendamento: any): Promise<void> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Preparar dados do contato baseado no card selecionado
      const contatoData = getContactData()
      
      // Se não temos contato existente, criar um novo
      let contatoId = contatoData.id
      if (!contatoId && selectedCard) {
        const novoContato = {
          nome: contatoData.nome || selectedCard.name || 'Contato',
          numeroTelefone: contatoData.telefone || selectedCard.id.replace('@c.us', ''),
          email: contatoData.email || '',
          empresa: contatoData.empresa || ''
        }

        const contatoResponse = await fetch('/api/contatos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(novoContato)
        })

        if (contatoResponse.ok) {
          const contato = await contatoResponse.json()
          contatoId = contato.id
        }
      }

      // Extrair número de telefone do chat ID para usar como contato_id
      const numeroTelefone = selectedCard?.id.replace('@c.us', '') || contatoData.telefone?.replace('@c.us', '')

      // ✅ CORRIGIR MAPEAMENTO DE CAMPOS - Backend espera InicioEm/FimEm ao invés de hora_inicio/hora_fim
      // ✅ CORRIGIR FORMATO DOS CAMPOS DE TEMPO - Backend espera datetime completo como ChatArea
      const agendamentoData = {
        titulo: agendamento.titulo,
        descricao: agendamento.descricao,
        // Usar formato ChatArea: inicio_em e fim_em com datetime completo
        inicio_em: `${agendamento.data}T${agendamento.hora_inicio || agendamento.InicioEm}:00-03:00`,
        fim_em: `${agendamento.data}T${agendamento.hora_fim || agendamento.FimEm}:00-03:00`,
        link_meeting: agendamento.link_video,
        contato_id: numeroTelefone,
        cliente_nome: contatoData.nome || agendamento.cliente || 'Cliente',
        status: agendamento.status,
        observacoes: agendamento.observacoes
      }

      console.log('📅 [DEBUG] Enviando agendamento com campos corretos:', agendamentoData)

      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(agendamentoData)
      })

      if (response.ok) {
        showNotification('Agendamento criado com sucesso!', 'success')
        setAgendamentoModal({ isOpen: false, card: null })
        
        // Invalidar cache e atualizar dados do kanban
        setTimeout(async () => {
          console.log('🔄 [DEBUG] Forçando reload completo dos dados após agendamento')
          await forceRefresh()
          await carregarMetadados()
          // Força reload dos chats também
          loadChatsManual()
        }, 500)
      } else {
        const error = await response.json()
        console.error('❌ [DEBUG] Erro do backend ao criar agendamento:', error)
        showNotification(`Erro ao criar agendamento: ${error.error || error.message || 'Erro desconhecido'}`, 'error')
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error)
      showNotification('Erro ao salvar agendamento', 'error')
    }
  }
  
  const handleOrcamentoSave = async (data: any) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Extrair número de telefone do chat ID
      const contatoId = selectedCard?.id || data.contato?.id
      const numeroTelefone = contatoId.replace('@c.us', '')
      
      console.log('💰 [Kanban] Buscando UUID do contato pelo telefone:', numeroTelefone)
      
      // 1. PRIMEIRO: Buscar o UUID do contato pelo telefone (IGUAL AO BOTTOMSHEET)
      const contactResponse = await fetch(`/api/contatos?telefone=${numeroTelefone}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!contactResponse.ok) {
        console.error('❌ Erro ao buscar contato:', contactResponse.status)
        showNotification('Erro ao buscar contato. Tente novamente.', 'error')
        return
      }
      
      const contactData = await contactResponse.json()
      let contatoUUID = null
      
      if (Array.isArray(contactData) && contactData.length > 0) {
        const specificContact = contactData.find((c: any) => c.numeroTelefone === numeroTelefone)
        contatoUUID = specificContact?.id
      } else if (contactData?.data && Array.isArray(contactData.data)) {
        const specificContact = contactData.data.find((c: any) => c.numeroTelefone === numeroTelefone)
        contatoUUID = specificContact?.id
      }
      
      if (!contatoUUID) {
        console.error('❌ UUID do contato não encontrado')
        showNotification('Contato não encontrado. Crie o contato primeiro.', 'error')
        return
      }
      
      console.log('✅ UUID do contato encontrado:', contatoUUID)
      
      // 2. SEGUNDO: Criar orçamento com formato EXATO do BottomSheet
      const valorTotal = data.itens.reduce((total: number, item: any) => 
        total + (item.valor * item.quantidade), 0
      )
      
      const orcamentoData = {
        titulo: data.titulo,
        descricao: data.descricao || '',
        data: new Date().toISOString(), // minúsculo, ISO completo
        tipo: 'orcamento', // minúsculo
        valorTotal: valorTotal,
        status: 'PENDENTE',
        contato_id: contatoUUID, // UUID, não telefone!
        observacao: data.observacao || null,
        itens: data.itens.map((item: any) => ({
          descricao: item.descricao || item.nome || '',
          quantidade: item.quantidade,
          valor: item.valor,
          valorUnitario: item.valor, // Adicionar também como valorUnitario
          subtotal: item.quantidade * item.valor // Calcular subtotal do item
        })),
        subtotal: valorTotal,
        desconto: data.desconto || 0,
        chatId: contatoId // manter o ID original do chat
      }
      
      console.log('💰 [Kanban] Dados do orçamento a enviar:', orcamentoData)
      console.log('💰 [Kanban] Valor total calculado:', valorTotal)
      console.log('💰 [Kanban] Itens:', data.itens)

      const response = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orcamentoData)
      })

      if (response.ok) {
        console.log('✅ Orçamento criado com sucesso')
        setOrcamentoModal({ isOpen: false, card: null })
        showNotification('Orçamento criado com sucesso!', 'success')
        
        // Invalidar cache e atualizar dados do kanban
        setTimeout(async () => {
          console.log('🔄 [DEBUG] Forçando reload completo dos dados após orçamento')
          console.log('🔄 [DEBUG] Card ID:', selectedCard?.id)
          await forceRefresh()
          await carregarMetadados()
          // Força reload dos chats também
          loadChatsManual()
          console.log('🔄 [DEBUG] Reload completo finalizado')
        }, 500)
      } else {
        console.error('❌ Erro ao criar orçamento:', response.statusText)
        showNotification('Erro ao criar orçamento. Tente novamente.', 'error')
      }
    } catch (error) {
      console.error('❌ Erro ao criar orçamento:', error)
      showNotification('Erro ao criar orçamento. Tente novamente.', 'error')
    }
  }

  const handleAssinaturaSave = async (data: any) => {
    // O AssinaturaModal já salva no backend, aqui só fechamos e atualizamos
    console.log('Assinatura salva:', data)
    setAssinaturaModal({ isOpen: false, card: null })
    
    // Fazer refresh dos dados otimizados após salvar
    setTimeout(async () => {
      console.log('🔄 [DEBUG] Forçando reload completo dos dados após assinatura')
      await forceRefresh()
      await carregarMetadados()
      loadChatsManual()
    }, 500)
  }

  const handleAgenteSave = async (data?: any) => {
    console.log('🤖 [AGENTE SAVE] *** CHAMADO *** - Agente:', data)
    setAgenteModal({ isOpen: false, card: null })
    
    // Invalidar cache e atualizar dados - MESMO PADRÃO dos orçamentos
    setTimeout(async () => {
      console.log('🔄 [DEBUG] Forçando reload após agente - IGUAL orçamento')
      await forceRefresh()
      await carregarMetadados()
      loadChatsManual()
    }, 500)
  }

  const handleLigacaoStart = (data: any) => {
    console.log('Ligação iniciada:', data)
  }
  
  const handleCompartilharTelaStart = (data: any) => {
    console.log('Compartilhamento de tela iniciado:', data)
  }
  
  // Função para obter dados do contato real
const getContactData = () => {
  if (!selectedCard?.id) {
    return {
      id: `temp-${Date.now()}`,
      nome: 'Contato não encontrado',
      telefone: '',
      email: '',
      empresa: '',
      avatar: ''
    }
  }

  // Primeiro, buscar nos dados otimizados do banco (contatos criados recentemente)
  const cardData = getCardData(selectedCard.id)
  if (cardData?.contato) {
    console.log('📞 [getContactData] Encontrado contato nos dados otimizados:', cardData.contato)
    return {
      id: cardData.contato.id || selectedCard.id,
      nome: cardData.contato.nome || 'Contato sem nome',
      telefone: selectedCard.id, // IMPORTANTE: usar o chat ID completo (com @c.us) para consistência
      email: cardData.contato.email || '',
      empresa: cardData.contato.empresa || '',
      cpf: cardData.contato.cpf || '',
      cnpj: cardData.contato.cnpj || '',
      cep: cardData.contato.cep || '',
      endereco: cardData.contato.endereco || '',
      bairro: cardData.contato.bairro || '',
      rua: cardData.contato.rua || '',
      numero: cardData.contato.numero || '',
      estado: cardData.contato.estado || '',
      cidade: cardData.contato.cidade || '',
      pais: cardData.contato.pais || 'Brasil',
      tags: cardData.contato.tags || [],
      avatar: cardData.contato.avatar || ''
    }
  }

  // Fallback: buscar contato real pelo chatId (JID) nos dados do WhatsApp
  const contato = chats.find(c => c.id === selectedCard.id)
  
  if (contato) {
    console.log('📞 [getContactData] Encontrado contato nos dados do WhatsApp:', contato)
    return {
      id: contato.id || `temp-${Date.now()}`,
      nome: contato.name || 'Contato sem nome',
      telefone: contato.id || '', // Chat ID completo com @c.us
      email: '',
      empresa: '',
      avatar: contato.profilePictureUrl || ''
    }
  }

  console.log('⚠️ [getContactData] Contato não encontrado para selectedCard:', selectedCard.id)
  return {
    id: selectedCard.id || `temp-${Date.now()}`,
    nome: 'Contato não encontrado',
    telefone: selectedCard.id || '', // Chat ID completo como fallback
    email: '',
    empresa: '',
    avatar: ''
  }
}


  // Helper para buscar UUID do contato
  const getContactUUID = async (telefone: string): Promise<string | null> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null
      
      const response = await fetch(`http://159.65.34.199:8081/api/contatos?telefone=${telefone}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) return null
      
      const data = await response.json()
      let contato = null
      
      if (Array.isArray(data) && data.length > 0) {
        contato = data.find((c: any) => c.numeroTelefone === telefone)
      } else if (data?.data && Array.isArray(data.data)) {
        contato = data.data.find((c: any) => c.numeroTelefone === telefone)
      }
      
      return contato?.id || null
    } catch (error) {
      console.error('Erro ao buscar UUID:', error)
      return null
    }
  }

  // Função para buscar dados completos de orçamentos
  const fetchOrcamentosDetalhes = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      console.log('💰 [Kanban] Buscando orçamentos para:', chatId)
      
      // Extrair número do telefone
      const numeroTelefone = chatId.replace('@c.us', '').replace('@g.us', '')
      
      // Buscar UUID do contato
      const contatoUUID = await getContactUUID(numeroTelefone)
      if (!contatoUUID) {
        console.log('💰 [Kanban] UUID não encontrado para:', numeroTelefone)
        return []
      }
      
      console.log('💰 [Kanban] UUID encontrado:', contatoUUID)
      
      const response = await fetch(`http://159.65.34.199:8081/api/orcamentos?contato_id=${contatoUUID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        const data = result.data || result || []
        console.log('💰 [Kanban] Orçamentos recebidos:', data.length)
        return Array.isArray(data) ? data.slice(0, 3) : [] // Limitamos aos 3 mais recentes
      }
      return []
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error)
      return []
    }
  }

  // Função para buscar dados completos de agendamentos
  const fetchAgendamentosDetalhes = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      console.log('📅 [Kanban] Buscando agendamentos para:', chatId)
      
      // Extrair número do telefone
      const numeroTelefone = chatId.replace('@c.us', '').replace('@g.us', '')
      
      // Buscar UUID do contato
      const contatoUUID = await getContactUUID(numeroTelefone)
      if (!contatoUUID) {
        console.log('📅 [Kanban] UUID não encontrado para:', numeroTelefone)
        return []
      }
      
      console.log('📅 [Kanban] UUID encontrado:', contatoUUID)
      
      const response = await fetch(`http://159.65.34.199:8081/api/agendamentos?contato_id=${contatoUUID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        const data = result.data || result || []
        console.log('📅 [Kanban] Agendamentos recebidos:', data.length)
        return Array.isArray(data) ? data.slice(0, 3) : [] // Limitamos aos 3 mais recentes
      }
      return []
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      return []
    }
  }

  // Função para buscar dados de assinaturas do batch otimizado
  const getAssinaturasFromBatch = (chatId: string) => {
    const cardData = getCardData(chatId)
    return cardData?.assinaturas || []
  }

  // Função para buscar contagem de orçamentos
  const fetchOrcamentosCount = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      // Buscar pelo UUID do contato
      const card = chats?.find(c => c.id === chatId)
      const contactId = card?.contactId
      if (!contactId) return 0
      
      const response = await fetch(`/api/orcamentos?contato_id=${encodeURIComponent(contactId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        return data.length || 0
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de orçamentos:', error)
    }
    return 0
  }

  // Função para buscar contagem de agendamentos
  const fetchAgendamentosCount = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      // Buscar pelo UUID do contato
      const card = chats?.find(c => c.id === chatId)
      const contactId = card?.contactId
      if (!contactId) return 0
      
      const response = await fetch(`/api/agendamentos?contato_id=${encodeURIComponent(contactId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        return data.length || 0
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de agendamentos:', error)
    }
    return 0
  }

  // Função para buscar contagem de anotações do batch otimizado
  const getAnotacoesCountFromBatch = (chatId: string) => {
    const cardData = getCardData(chatId)
    return cardData?.anotacoes?.length || 0
  }

  // Função para buscar contagem de assinaturas do batch otimizado
  const getAssinaturasCountFromBatch = (chatId: string) => {
    const cardData = getCardData(chatId)
    return cardData?.assinaturas?.length || 0
  }

  // Função para buscar detalhes completos de assinaturas do batch otimizado
  const getAssinaturasDetailsFromBatch = (chatId: string) => {
    const cardData = getCardData(chatId)
    const assinaturas = cardData?.assinaturas || []
    console.log('🔍 DEBUG Assinaturas do batch para', chatId, ':', assinaturas)
    console.log('🔍 DEBUG Quantidade de assinaturas:', assinaturas.length)
    return assinaturas
  }

  // Função para buscar detalhes completos de anotações do batch otimizado
  const getAnotacoesDetailsFromBatch = (chatId: string) => {
    const cardData = getCardData(chatId)
    const anotacoes = cardData?.anotacoes || []
    console.log('🔍 DEBUG Anotações do batch para', chatId, ':', anotacoes)
    console.log('🔍 DEBUG Quantidade de anotações:', anotacoes.length)
    return anotacoes
  }

  // Função para buscar detalhes completos de orçamentos
  const fetchOrcamentosDetails = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      console.log('🔍 DEBUG fetchOrcamentosDetails para card:', chatId)
      const response = await fetch(`/api/orcamentos?contato_id=${encodeURIComponent(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 DEBUG orcamentos data recebida:', data)
        return data || []
      }
      return []
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error)
      return []
    }
  }

  // Função para buscar detalhes completos de agendamentos
  const fetchAgendamentosDetails = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/agendamentos?contato_id=${encodeURIComponent(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data : []
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes de agendamentos:', error)
    }
    return []
  }

  // Função para buscar detalhes completos de tags
  const fetchTagsDetails = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      console.log('🏷️ [Kanban] Buscando tags para:', chatId)
      
      // Extrair número do telefone
      const numeroTelefone = chatId.replace('@c.us', '').replace('@g.us', '')
      
      // Buscar UUID do contato
      const contatoUUID = await getContactUUID(numeroTelefone)
      if (!contatoUUID) {
        console.log('🏷️ [Kanban] UUID não encontrado para:', numeroTelefone)
        return []
      }
      
      console.log('🏷️ [Kanban] UUID encontrado:', contatoUUID)
      
      const response = await fetch(`http://159.65.34.199:8081/api/contatos/${contatoUUID}/tags`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        const data = result.data || result || []
        console.log('🏷️ [Kanban] Tags recebidas:', data.length)
        return Array.isArray(data) ? data : []
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes de tags:', error)
    }
    return []
  }

  // Função para buscar detalhes completos de tickets
  const fetchTicketsDetails = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const numeroTelefone = chatId.replace('@c.us', '')
      console.log('🎫 [FETCH TICKETS] Para card:', chatId, 'numeroTelefone:', numeroTelefone)
      
      const response = await fetch(`/api/tickets?contato_id=${numeroTelefone}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('🎫 [FETCH TICKETS] Data recebida para', chatId, ':', data)
        console.log('🎫 [FETCH TICKETS] É array?', Array.isArray(data))
        console.log('🎫 [FETCH TICKETS] Tamanho:', data?.length)
        return Array.isArray(data) ? data : []
      } else {
        console.log('🎫 [FETCH TICKETS] Response não OK:', response.status, response.statusText)
      }
      return []
    } catch (error) {
      console.error('🎫 [FETCH TICKETS] Erro:', error)
      return []
    }
  }

  // Função para buscar detalhes completos de agentes
  const fetchAgentesDetails = async (cardId: string) => {
    try {
      const token = localStorage.getItem('token')
      
      // Extrair número de telefone real do card usando os dados otimizados
      const cardData = getCardData(cardId)
      let numeroTelefone = ''
      
      if (cardData?.contato?.telefone) {
        // Se tem telefone no contato
        numeroTelefone = cardData.contato.telefone.replace(/[@c.us]/g, '')
      } else if (cardData?.contato?.numero_telefone) {
        // Se tem numero_telefone no contato
        numeroTelefone = cardData.contato.numero_telefone.replace(/[@c.us]/g, '')
      } else {
        // Fallback: tentar usar cardId diretamente se parece com telefone
        numeroTelefone = cardId.includes('@') ? cardId.replace('@c.us', '') : cardId
      }
      
      console.log('🤖 [FETCH AGENTES] Para card:', cardId, 'numeroTelefone:', numeroTelefone, 'cardData:', cardData)
      
      const response = await fetch(`/api/agentes-chat?contato_id=${numeroTelefone}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('🤖 [FETCH AGENTES] Data recebida para', cardId, ':', data)
        console.log('🤖 [FETCH AGENTES] É array?', Array.isArray(data))
        console.log('🤖 [FETCH AGENTES] Tamanho:', data?.length)
        return Array.isArray(data) ? data : []
      } else {
        console.log('🤖 [FETCH AGENTES] Response não OK:', response.status, response.statusText)
      }
      return []
    } catch (error) {
      console.error('🤖 [FETCH AGENTES] Erro:', error)
      return []
    }
  }

  // Função para verificar status do contato
  const checkContactStatus = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      // Extrair número do JID
      const numeroTelefone = chatId.replace('@c.us', '')
      
      const response = await fetch(`/api/contatos?numero_telefone=${numeroTelefone}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          const contato = data[0]
          // Verifica se tem nome ou dados básicos
          if (contato.nome || contato.numero_telefone) {
            return 'synced'
          }
        }
      }
      return 'error'
    } catch (error) {
      console.error('Erro ao verificar status do contato:', error)
      return 'error'
    }
  }

  // Estados para dados não otimizados e UI
  const [colunas, setColunas] = useState<any[]>([])
  const [activeCard, setActiveCard] = useState<any>(null)
  const [activeColumn, setActiveColumn] = useState<any>(null)
  const [notesCount, setNotesCount] = useState<Record<string, number>>({}) // Contador real de anotações
  const [contactStatus, setContactStatus] = useState<Record<string, 'synced' | 'error'>>({}) // Status dos contatos
  const [showColorModal, setShowColorModal] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<any>(null)
  const [selectedEditCard, setSelectedEditCard] = useState<any>(null)
  const [showEditContactModal, setShowEditContactModal] = useState(false)
  const [selectedDeleteCard, setSelectedDeleteCard] = useState<any>(null)
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [selectedTicketCard, setSelectedTicketCard] = useState<any>(null)
  const [showAgenteModal, setShowAgenteModal] = useState(false)
  const [selectedAgenteCard, setSelectedAgenteCard] = useState<any>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [selectedTransferCard, setSelectedTransferCard] = useState<any>(null)
  const [showVideoChamadaModal, setShowVideoChamadaModal] = useState(false)
  const [selectedVideoChamadaCard, setSelectedVideoChamadaCard] = useState<any>(null)
  const [showLigacaoModal, setShowLigacaoModal] = useState(false)
  const [selectedLigacaoCard, setSelectedLigacaoCard] = useState<any>(null)
  const [showCompartilharTelaModal, setShowCompartilharTelaModal] = useState(false)
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false)
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false)
  const [showAssinaturaModal, setShowAssinaturaModal] = useState(false)
  const [showAnotacoesModal, setShowAnotacoesModal] = useState(false)
  
  // Estados para BottomSheets
  const [showAgendamentoSheet, setShowAgendamentoSheet] = useState(false)
  const [showOrcamentoSheet, setShowOrcamentoSheet] = useState(false)
  const [showTicketSheet, setShowTicketSheet] = useState(false)
  const [showAnotacoesSheet, setShowAnotacoesSheet] = useState(false)
  const [showAssinaturaSheet, setShowAssinaturaSheet] = useState(false)
  const [selectedSheetCard, setSelectedSheetCard] = useState<any>(null)
  
  // Estados para edição de colunas
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingColumnName, setEditingColumnName] = useState('')

  // Buscar contagens reais de todos os fluxos após todas as declarações
  useEffect(() => {
    const loadAllCounts = async () => {
      if (loading) return
      
      await fileLogger.log({
        component: 'Kanban',
        action: 'loadAllCounts_started',
        data: { 
          loading,
          chatsLength: chats.length
        },
        userId: user?.id
      })
      
      const notesCounts: Record<string, number> = {}
      const assinaturasCounts: Record<string, number> = {}
            // Os dados otimizados já são carregados pelo hook useKanbanOptimized
        // Este useEffect agora apenas carrega dados não otimizados (assinaturas, anotações)
        console.log(' Dados otimizados disponíveis via hook:', Object.keys(optimizedCards).length, 'cards')
        
        // Declarar objetos para dados detalhados individuais
        const orcamentosDetalhes: Record<string, any[]> = {}
        const agendamentosDetalhes: Record<string, any[]> = {}
        const assinaturasDetalhes: Record<string, any[]> = {}
        const anotacoesDetalhes: Record<string, any[]> = {}
        const tagsDetalhes: Record<string, any[]> = {}
        const ticketsDetalhes: Record<string, any[]> = {}
        const agentesDetalhes: Record<string, any[]> = {}
      
      const allCards = mapearConversasParaColunas().flatMap(col => col.cards || [])
      const uniqueCardIds = allCards.map(card => card.id).filter((id, index, arr) => arr.indexOf(id) === index && id)
      
      await fileLogger.log({
        component: 'Kanban',
        action: 'loadAllCounts_cards_mapped',
        data: { 
          totalCards: allCards.length,
          uniqueCardIds: uniqueCardIds.length,
          sampleCardIds: uniqueCardIds.slice(0, 5),
          allCardIds: uniqueCardIds
        },
        userId: user?.id
      })
      
      for (const cardId of uniqueCardIds) {
        try {
          // Buscar dados individuais - mantendo orçamentos individual e usando batch para agendamentos
          const [orcamentosDetalhesData, tagsDetalhesData, ticketsDetalhesData, agentesDetalhesData] = await Promise.all([
            fetchOrcamentosDetails(cardId),
            fetchTagsDetails(cardId),
            fetchTicketsDetails(cardId),
            fetchAgentesDetails(cardId)
          ])
          
          // Obter agendamentos do batch otimizado (fallback para individual se não houver)
          const cardData = getCardData(cardId)
          let agendamentosDetalhesData = cardData?.agendamentos || []
          
          // Fallback: se batch não retornou dados, usar individual
          if (agendamentosDetalhesData.length === 0) {
            try {
              agendamentosDetalhesData = await fetchAgendamentosDetails(cardId)
              console.log(`🔄 [FALLBACK] Usando dados individuais para agendamentos do card ${cardId}`)
            } catch (error) {
              console.warn(`⚠️ [FALLBACK] Erro ao buscar agendamentos individuais:`, error)
              agendamentosDetalhesData = []
            }
          }
          
          // Debug: verificar se dados estão funcionando
          console.log(`📊 [DEBUG] Card ${cardId}:`, {
            cardData: cardData ? 'existe' : 'null',
            agendamentosBatch: cardData?.agendamentos?.length || 0,
            agendamentosFinal: agendamentosDetalhesData.length,
            orcamentos: orcamentosDetalhesData.length
          })
          
          const contactStatusResult = 'synced' // Todos os contatos do banco têm status synced
          
          // Armazenar contagens do batch otimizado
          notesCounts[cardId] = getAnotacoesCountFromBatch(cardId)
          assinaturasCounts[cardId] = getAssinaturasCountFromBatch(cardId)
          
          // Salvar todos os dados individuais
          orcamentosDetalhes[cardId] = orcamentosDetalhesData
          agendamentosDetalhes[cardId] = agendamentosDetalhesData
          assinaturasDetalhes[cardId] = getAssinaturasDetailsFromBatch(cardId)
          anotacoesDetalhes[cardId] = getAnotacoesDetailsFromBatch(cardId)
          tagsDetalhes[cardId] = tagsDetalhesData
          ticketsDetalhes[cardId] = ticketsDetalhesData
          agentesDetalhes[cardId] = agentesDetalhesData
          
          // Debug específico para tickets
          console.log('🎫 [DEBUG TICKETS] Card:', cardId)
          console.log('🎫 [DEBUG TICKETS] ticketsDetalhesData:', ticketsDetalhesData)
          console.log('🎫 [DEBUG TICKETS] ticketsDetalhes[cardId]:', ticketsDetalhes[cardId])
          
          await fileLogger.log({
            component: 'Kanban',
            action: 'loadAllCounts_card_processed',
            data: { 
              cardId,
              notesCount: getAnotacoesCountFromBatch(cardId),
              assinaturasCount: getAssinaturasCountFromBatch(cardId),
              contactStatus: contactStatusResult
            },
            userId: user?.id
          })
          
          // Atualizar status do contato
          setContactStatus(prev => ({
            ...prev,
            [cardId]: contactStatusResult
          }))
          
        } catch (error) {
          await fileLogger.log({
            component: 'Kanban',
            action: 'loadAllCounts_card_error',
            data: { 
              cardId,
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : null
            },
            userId: user?.id
          })
          
          notesCounts[cardId] = 0
          assinaturasCounts[cardId] = 0
          orcamentosDetalhes[cardId] = []
          assinaturasDetalhes[cardId] = []
        }
      }
      
      await fileLogger.log({
        component: 'Kanban',
        action: 'loadAllCounts_final_data',
        data: { 
          notesCounts,
          orcamentosCounts: 'usando dados otimizados do hook',
          agendamentosCounts: 'usando dados otimizados do hook',
          assinaturasCounts,
          totalOptimizedCards: Object.keys(optimizedCards).length
        },
        userId: user?.id
      })
      
      // Debug: verificar dados antes de atualizar estados
      console.log('🔍 [DEBUG STATES] Dados a serem salvos nos estados:', {
        orcamentosDetalhes: Object.keys(orcamentosDetalhes).length,
        agendamentosDetalhes: Object.keys(agendamentosDetalhes).length,
        primeiroAgendamento: Object.keys(agendamentosDetalhes)[0] ? {
          cardId: Object.keys(agendamentosDetalhes)[0],
          quantidade: agendamentosDetalhes[Object.keys(agendamentosDetalhes)[0]]?.length || 0
        } : 'nenhum'
      })
      
      // Atualizar estados não otimizados
      setNotesCount(notesCounts)
      setAssinaturasCount(assinaturasCounts)
      setOrcamentosDataState(orcamentosDetalhes)
      setAgendamentosDataState(agendamentosDetalhes)
      // setAssinaturasData não implementado ainda
      setAnotacoesDataState(anotacoesDetalhes)
      setTagsDataState(tagsDetalhes)
      setTicketsDataState(ticketsDetalhes)
      setAgentesDataState(agentesDetalhes)
      
      // Debug final dos tickets
      console.log('🎫 [FINAL DEBUG] ticketsDetalhes antes de setar:', ticketsDetalhes)
      console.log('🎫 [FINAL DEBUG] Quantidade de cards com tickets:', Object.keys(ticketsDetalhes).length)
    }
    
    loadAllCounts()
  }, [loading, chats.length])
  
  // Estados para color picker
  const [colorPickerColumnId, setColorPickerColumnId] = useState<string | null>(null)
  
  // Cores predefinidas para as colunas
  const predefinedColors = [
    '#ef4444', // red
    '#f97316', // orange  
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#6366f1', // indigo
    '#84cc16'  // lime
  ]
  
  // Função para adicionar card
  const handleAddCard = (colunaId: string) => {
    setSelectedColunaId(colunaId)
    setShowCreateCardModal(true)
  }
  
  // Função para abrir modal de cores
  const handleOpenColorModal = (coluna: any) => {
    setSelectedColumn(coluna)
    setShowColorModal(true)
  }
  
  // Handlers para agente
  const handleAgenteModal = (card: any) => {
    setSelectedCard(card)
    setAgenteModal({ isOpen: true, card })
  }

  // Handler para conexão/fila modal
  const handleConexaoFilaModal = (card: any) => {
    setSelectedCard(card)
    setConexaoFilaModal({ isOpen: true, card })
  }

  const handleOpenAgendamento = (card: any) => {
  // IMPORTANTE: Definir selectedCard antes de abrir o modal
  // para que getContactData() funcione corretamente
  setSelectedCard(card)
  setAgendamentoModal({ isOpen: true, card })
}

  const handleOpenOrcamento = (card: any) => {
    setSelectedCard(card)
    setOrcamentoModal({ isOpen: true, card })
  }
  
  const handleOpenAssinatura = (card: any) => {
    setSelectedCard(card)
    setAssinaturaModal({ isOpen: true, card })
  }
  
  const handleOpenAnotacoes = (card: any) => {
    setSelectedCard(card)
    setAnotacoesModal({ isOpen: true, card })
    setShowAnotacoesModal(true)
  }
  
  const handleOpenTags = (card: any) => {
    setSelectedCard(card)
    setTagsModal({ isOpen: true, card })
  }
  
  const handleOpenChat = (card: any) => {
    setSelectedCard(card)
    setChatModal({ isOpen: true, card })
  }

  const handleOpenEditContact = (card: any) => {
    console.log('🔍 [DEBUG] handleOpenEditContact - Card data:', card)
    setEditContactModal({ isOpen: true, card })
  }

  const handleOpenDeleteCard = (card: any) => {
    setDeleteCardModal({ isOpen: true, card })
  }
  
  const handleOpenVideoChamada = (card?: any) => {
    console.log('Abrir vídeo chamada')
    setSelectedVideoChamadaCard(card || selectedCard)
    setShowVideoChamadaModal(true)
  }
  
  const handleOpenLigacao = (card?: any) => {
    console.log('Fazer ligação') 
    setSelectedLigacaoCard(card || selectedCard)
    setShowLigacaoModal(true)
  }
  
  const handleOpenCompartilharTela = (card?: any) => {
    console.log('Compartilhar tela')
    setSelectedCompartilharTelaCard(card || selectedCard)
    setShowCompartilharTelaModal(true)
  }
  
  // Função para atualizar cor da coluna
  const handleUpdateColumnColor = async (newColor: string) => {
    if (!selectedColumn) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/coluna/${selectedColumn.id}/color`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cor: newColor })
      })
      
      if (response.ok) {
        // Atualizar estado local
        setColunas(prev => prev.map(col => 
          col.id === selectedColumn.id ? { ...col, cor: newColor } : col
        ))
        showNotification('Cor da coluna atualizada com sucesso!')
      } else {
        throw new Error('Erro ao atualizar cor')
      }
    } catch (error) {
      console.error('Erro ao atualizar cor da coluna:', error)
      showNotification('Erro ao atualizar cor da coluna', 'error')
    }
  }
  
  // Função para mover colunas
  const handleColumnDragEnd = async (event: any) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    const oldIndex = colunas.findIndex(col => col.id === active.id)
    const newIndex = colunas.findIndex(col => col.id === over.id)
    
    if (oldIndex === -1 || newIndex === -1) return
    
    // Atualizar ordem local imediatamente
    const newColunas = [...colunas]
    const [movedColumn] = newColunas.splice(oldIndex, 1)
    newColunas.splice(newIndex, 0, movedColumn)
    setColunas(newColunas)
    
    // Persistir no backend
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/coluna/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quadroId: id,
          columnOrder: newColunas.map((col, index) => ({ id: col.id, ordem: index }))
        })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao reordenar colunas')
      }
      
      showNotification('Ordem das colunas atualizada!')
    } catch (error) {
      console.error('Erro ao reordenar colunas:', error)
      // Reverter mudança local em caso de erro
      setColunas(colunas)
      showNotification('Erro ao reordenar colunas', 'error')
    }
  }
  
  // Função para persistir movimento de card com índice
  const persistirMovimentoCard = async (cardId: string, sourceColumnId: string, targetColumnId: string, newIndex?: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/card-movement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quadroId: id,
          cardId,
          sourceColumnId,
          targetColumnId,
          newIndex: newIndex || 0,
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao persistir movimento')
      }
      
      // Atualizar metadados locais
      setCardMetadata(prev => ({
        ...prev,
        [cardId]: {
          ...prev[cardId],
          colunaId: targetColumnId,
          posicao: newIndex || 0,
          ultimoMovimento: new Date().toISOString()
        }
      }))
      
      // Recarregar metadados após movimento bem-sucedido
      setTimeout(async () => {
        await carregarMetadados()
        setHasManualChanges(true)
        console.log('✅ Card movido com sucesso - metadados recarregados:', { cardId, sourceColumnId, targetColumnId, newIndex })
      }, 100)
      
    } catch (error) {
      console.error('Erro ao persistir movimento:', error)
      // Não mostrar erro para o usuário, apenas logar
    }
  }
  
  // Função para carregar metadados dos cards
  const carregarMetadados = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/${id}/metadata`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const metadata = await response.json()
        console.log('📊 Metadados carregados do backend:', metadata)
        console.log('💾 Cards nos metadados:', Object.keys(metadata.cards || {}))
        setCardMetadata(metadata.cards || {})
        
        // Forçar hasManualChanges se há metadados
        if (Object.keys(metadata.cards || {}).length > 0) {
          setHasManualChanges(true)
          console.log('✅ hasManualChanges definido como true devido aos metadados')
        }
      } else {
        console.log('⚠️ Metadados não encontrados, usando padrão')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar metadados:', error)
    }
  }

  // Função para extrair chat ID (compatibilidade com contatos do CRM)
  const extractChatId = (chat: any): string => {
    if (typeof chat.id === 'string') {
      return chat.id
    }
    if (chat.id && chat.id._serialized) {
      return chat.id._serialized
    }
    if (chat.id && typeof chat.id === 'object') {
      return Object.values(chat.id)[0] as string || 'unknown'
    }
    return 'unknown'
  }

  // Função de debug para verificar estado
  const debugEstado = () => {
    console.log('🔍 DEBUG ESTADO:', {
      hasManualChanges,
      cardMetadata,
      totalCards: chats?.length || 0,
      metadataKeys: Object.keys(cardMetadata)
    })
  }

  // Função para mapear contatos do BD para colunas do Kanban
  const mapearConversasParaColunas = () => {
    
    // Se está carregando, retornar colunas vazias
    if (loading) {
      console.log('⏳ Retornando colunas vazias porque está carregando')
      return colunas.map((coluna) => ({
        ...coluna,
        cards: []
      }))
    }
    
    // USAR CONTATOS DO BD via useKanbanOptimized em vez de chats WhatsApp
    const cardsFromDB = Object.values(optimizedCards || {})
    console.log('📊 Contatos do BD disponíveis:', cardsFromDB.length)
    
    // 🚨 DEBUG INTENSIVO - DADOS ORIGINAIS
    console.log('🔍 [MEGA DEBUG] ESTADO COMPLETO DOS DADOS:', {
      optimizedCards,
      cardsFromDB,
      totalCards: cardsFromDB.length,
      firstCard: cardsFromDB[0],
      optimizedLoading,
      optimizedError,
      columnStats
    })
    
    
    
    if (!cardsFromDB || cardsFromDB.length === 0) {
      console.log('⚠️ Retornando colunas vazias - sem contatos no BD')
      return colunas.map((coluna, index) => ({
        ...coluna,
        cards: index === 0 ? [{
          id: 'demo-1',
          nome: 'Aguardando Contatos do CRM',
          descricao: 'Cadastre contatos para vê-los no kanban',
          posicao: 1,
          tags: ['Demo'],
          prazo: new Date().toISOString(),
          comentarios: 0,
          anexos: 0,
          responsavel: 'Sistema'
        }] : []
      }))
    }

    // Filtrar conversas baseado na busca
    const conversasFiltradas = searchQuery.trim() 
      ? chats.filter(chat => {
          const chatId = extractChatId(chat)
          return chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 chat.lastMessage?.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 chatId.includes(searchQuery)
        })
      : chats

    // MAPEAR CONTATOS DO BD EM VEZ DE CHATS WHATSAPP
    let cards = cardsFromDB.map((cardData, index) => {
      const chatId = cardData.id // CardData já tem id
      
      // 🔍 DEBUG PESADO - DESCOBRIR POR QUE ORÇAMENTOS NÃO APARECEM
     

      // Buscar contagens dos fluxos para este chat
      const cardCounts = {
        orcamentosCount: cardData.orcamentos?.length || 0,
        agendamentosCount: cardData.agendamentos?.length || 0,
        assinaturasCount: assinaturasCount[chatId] || 0,
        notesCount: notesCount[chatId] || 0
      }
      
      
      // Criar tags baseadas nas contagens e status
      const tags = []
      if (cardCounts.orcamentosCount > 0) tags.push(`${cardCounts.orcamentosCount} Orçamento${cardCounts.orcamentosCount > 1 ? 's' : ''}`)
      if (cardCounts.agendamentosCount > 0) tags.push(`${cardCounts.agendamentosCount} Agendamento${cardCounts.agendamentosCount > 1 ? 's' : ''}`)
      if (cardCounts.assinaturasCount > 0) tags.push(`${cardCounts.assinaturasCount} Assinatura${cardCounts.assinaturasCount > 1 ? 's' : ''}`)
      if (cardCounts.notesCount > 0) tags.push(`${cardCounts.notesCount} Anotaç${cardCounts.notesCount > 1 ? 'ões' : 'ão'}`)
      if (tags.length === 0) tags.push('Orçamentos')
      
      // Extrair número do telefone do ID (formato: "5518999999999@c.us")
      const phoneNumber = chatId.includes('@') ? chatId.split('@')[0] : chatId
      
      const finalCard = {
        id: chatId,
        nome: `Lead# ${phoneNumber.slice(-4)}`, // Usar últimos 4 dígitos do telefone
        descricao: `Contato WhatsApp ${phoneNumber}`,
        posicao: index + 1,
        tags: tags, // Tags sintéticas de contagem
        prazo: new Date().toISOString(),
        comentarios: cardCounts.notesCount || 0,
        anexos: 0,
        responsavel: `Contato ${phoneNumber.slice(-4)}`,
        avatar: null,
        phone: phoneNumber,
        isOnline: false,
        // PRESERVAR DADOS DO CONTATO COM TAGS REAIS
        contato: (cardData as any).contato,
        // Badges de contagem para exibição
        badges: {
          orcamentos: cardCounts.orcamentosCount,
          agendamentos: cardCounts.agendamentosCount,
          assinaturas: cardCounts.assinaturasCount,
          anotacoes: cardCounts.notesCount
        }
      }
      
    
      
      return finalCard
    })
    
    // Ordenar cards baseado nos metadados salvos
    cards = cards.sort((a, b) => {
      const metaA = cardMetadata[a.id]
      const metaB = cardMetadata[b.id]
      
      // Se ambos têm posição salva, usar a posição
      if (metaA?.posicao !== undefined && metaB?.posicao !== undefined) {
        return metaA.posicao - metaB.posicao
      }
      
      // Se só um tem posição, priorizar o que tem
      if (metaA?.posicao !== undefined) return -1
      if (metaB?.posicao !== undefined) return 1
      
      // Caso contrário, ordenar por timestamp
      return new Date(b.prazo).getTime() - new Date(a.prazo).getTime()
    })

    // Distribuir cards pelas colunas baseado nos metadados ou distribuição padrão
    return colunas.map((coluna, colunaIndex) => {
      // Verificar se existem metadados salvos
      const temMetadados = Object.keys(cardMetadata).length > 0
      
      // Filtrar cards que pertencem a esta coluna baseado nos metadados
      const cardsComMetadados = cards.filter(card => {
        const meta = cardMetadata[card.id]
        return meta?.colunaId === coluna.id
      })
      
   
      
      // Se não há metadados OU não há mudanças manuais, colocar todos os cards na PRIMEIRA coluna apenas
      if (!temMetadados || !hasManualChanges) {
        // APENAS a primeira coluna recebe todos os cards novos
        if (colunaIndex === 0) {
          return {
            ...coluna,
            cards: cards // Todos os cards ficam na primeira coluna
          }
        } else {
          // Outras colunas ficam vazias até o usuário arrastar manualmente
          return {
            ...coluna,
            cards: [] // Colunas 2+ ficam vazias
          }
        }
      }
      
      // Se há metadados E mudanças manuais, combinar cards com e sem metadados
      const cardsSemMetadados = cards.filter(card => !cardMetadata[card.id])
      
      // Cards novos sem metadados vão APENAS para a primeira coluna
      const cardsSemMetadadosParaEstaColuna = colunaIndex === 0 ? cardsSemMetadados : []
      
      const todosCardsDestaColuna = [...cardsComMetadados, ...cardsSemMetadadosParaEstaColuna]
      
      console.log(`💾 Combinando para ${coluna.nome}:`, {
        comMetadados: cardsComMetadados.map(c => c.nome),
        semMetadados: cardsSemMetadadosParaEstaColuna.map(c => c.nome),
        total: todosCardsDestaColuna.map(c => c.nome)
      })
      
      return {
        ...coluna,
        cards: todosCardsDestaColuna.sort((a, b) => {
          const metaA = cardMetadata[a.id]
          const metaB = cardMetadata[b.id]
          
          // Cards com metadados primeiro, ordenados por posição
          if (metaA && metaB) {
            return (metaA.posicao || 0) - (metaB.posicao || 0)
          }
          if (metaA && !metaB) return -1
          if (!metaA && metaB) return 1
          
          // Cards sem metadados ordenados por nome
          return a.nome.localeCompare(b.nome)
        })
      }
    })
  }

  // Função para resetar mudanças manuais e remapear
  const resetAndRemap = () => {
    setHasManualChanges(false)
    setCardMetadata({})
    showNotification('Mudanças resetadas! Conversas remapeadas.', 'success')
  }
  
  // Funções para edição de colunas
  const handleDoubleClickColumn = (coluna: any) => {
    setEditingColumnId(coluna.id)
    setEditingColumnName(coluna.nome)
  }
  
  const handleSaveColumnName = async (colunaId: string) => {
    if (!editingColumnName.trim()) return
    
    // Atualizar estado local preservando cards existentes
    setColunas(prev => prev.map(col => {
      if (col.id === colunaId) {
        return {
          ...col,
          nome: editingColumnName.trim(),
          // Preservar cards existentes
          cards: col.cards || []
        }
      }
      return col
    }))
    
    // Persistir no backend
    await persistirEdicaoColuna(colunaId, editingColumnName.trim())
    
    // Limpar edição
    setEditingColumnId(null)
    setEditingColumnName('')
    // NÃO marcar como hasManualChanges para preservar conversas
    
    showNotification('Título da coluna atualizado!', 'success')
  }
  
  const handleDeleteColumn = async (colunaId: string) => {
    const coluna = colunas.find(col => col.id === colunaId)
    if (!coluna) return
    
    const hasCards = coluna.cards.length > 0
    const confirmMessage = hasCards 
      ? `Tem certeza que deseja excluir a coluna "${coluna.nome}"? Ela contém ${coluna.cards.length} card(s) que serão perdidos.`
      : `Tem certeza que deseja excluir a coluna "${coluna.nome}"?`
    
    if (confirm(confirmMessage)) {
      // Persistir no backend primeiro
      await persistirExclusaoColuna(colunaId)
      
      // Recarregar colunas do backend para ter o estado atualizado
      try {
        const quadroData = await getQuadro(params.id as string)
        const quadroAny = quadroData as any
        
        if (quadroAny.colunas && quadroAny.colunas.length > 0) {
          console.log('📋 Recarregando colunas após exclusão:', quadroAny.colunas)
          setColunas(quadroAny.colunas.map((col: any) => ({
            ...col,
            cards: [] // Cards serão preenchidos pelo mapeamento
          })))
        } else {
          // Se não há colunas, usar array vazio
          setColunas([])
        }
        
        showNotification(`Coluna "${coluna.nome}" excluída!`, 'success')
      } catch (error) {
        console.error('❌ Erro ao recarregar colunas:', error)
        // Fallback: remover apenas do estado local
        setColunas(prev => prev.filter(col => col.id !== colunaId))
        showNotification(`Coluna "${coluna.nome}" excluída!`, 'success')
      }
    }
  }

// Função para persistir edição de coluna
const persistirEdicaoColuna = async (colunaId: string, novoNome: string) => {
  try {
    console.log('📝 Salvando edição de coluna no backend:', {
      quadroId: id,
      colunaId,
      novoNome,
      timestamp: new Date().toISOString()
    })
    
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/kanban/column-edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quadroId: id,
        colunaId,
        novoNome,
        timestamp: new Date().toISOString()
      })
    })
      
      if (response.ok) {
        console.log('✅ Edição de coluna salva no backend')
      } else {
        console.error('❌ Erro na resposta do backend:', response.status)
      }
      
    } catch (error) {
      console.error('❌ Erro ao persistir edição de coluna:', error)
    }
  }
  
  // Função para persistir exclusão de coluna
  const persistirExclusaoColuna = async (colunaId: string) => {
    try {
      console.log('🗑️ Salvando exclusão de coluna no backend:', {
        quadroId: id,
        colunaId,
        timestamp: new Date().toISOString()
      })
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/column-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quadroId: id,
          colunaId,
          timestamp: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        console.log('✅ Exclusão de coluna salva no backend')
      } else {
        console.error('❌ Erro na resposta do backend:', response.status)
      }
      
    } catch (error) {
      console.error('❌ Erro ao persistir exclusão de coluna:', error)
    }
  }
  
  // Funções para edição do quadro
  const handleDoubleClickQuadroTitle = () => {
    setEditingQuadroTitle(true)
    setEditingQuadroName(quadro?.nome || '')
  }
  
  const handleSaveQuadroTitle = async () => {
    if (!editingQuadroName.trim()) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/quadros/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: editingQuadroName.trim()
        })
      })
      
      if (response.ok) {
        setQuadro(prev => prev ? { ...prev, nome: editingQuadroName.trim() } : prev)
        setEditingQuadroTitle(false)
        console.log('✅ Título do quadro atualizado com sucesso!')
      } else {
        throw new Error('Erro ao atualizar título')
      }
    } catch (error) {
      console.error('Erro ao salvar título do quadro:', error)
      console.error('❌ Erro ao atualizar título do quadro')
    }
  }
  
  const handleDoubleClickQuadroDescription = () => {
    setEditingQuadroDescription(true)
    setEditingQuadroDescricao(quadro?.descricao || '')
  }
  
  const handleSaveQuadroDescription = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/quadros/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          descricao: editingQuadroDescricao.trim()
        })
      })
      
      if (response.ok) {
        setQuadro(prev => prev ? { ...prev, descricao: editingQuadroDescricao.trim() } : prev)
        setEditingQuadroDescription(false)
        console.log('✅ Descrição do quadro atualizada com sucesso!')
      } else {
        throw new Error('Erro ao atualizar descrição')
      }
    } catch (error) {
      console.error('Erro ao salvar descrição do quadro:', error)
      console.error('❌ Erro ao atualizar descrição do quadro')
    }
  }
  
  // Sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Evita ativação acidental
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Estado para hidratação já declarado acima

  // Aguardar hidratação do cliente
  useEffect(() => {
    setIsClient(true)
    
    // Event listeners para os modais
    const handleOpenEditContact = (event: CustomEvent) => {
      console.log('🎯 Event listener para openEditContactModal executado:', event.detail);
      const card = event.detail;
      setSelectedEditCard(card);
      setShowEditContactModal(true);
      console.log('✅ Modal de editar contato deve abrir agora');
    };
    
    const handleOpenDeleteCard = (event: CustomEvent) => {
      console.log('🎯 Event listener para openDeleteCardModal executado:', event.detail);
      const card = event.detail;
      setSelectedDeleteCard(card);
      setShowDeleteCardModal(true);
      console.log('✅ Modal de excluir card deve abrir agora');
    };
    
    const handleOpenConexaoFila = (event: CustomEvent) => {
      const card = event.detail;
      console.log('🔗 EVENT LISTENER EXECUTOU! Card:', card);
      console.log('🔗 Estado atual conexaoFilaModal:', conexaoFilaModal);
      setConexaoFilaModal({ isOpen: true, card });
      console.log('🔗 Estado setado para: { isOpen: true, card }');
    };

    window.addEventListener('openEditContactModal', handleOpenEditContact as EventListener);
    window.addEventListener('openDeleteCardModal', handleOpenDeleteCard as EventListener);
    window.addEventListener('openConexaoFilaModal', handleOpenConexaoFila as EventListener);
    
    return () => {
      window.removeEventListener('openEditContactModal', handleOpenEditContact as EventListener);
      window.removeEventListener('openDeleteCardModal', handleOpenDeleteCard as EventListener);
      window.removeEventListener('openConexaoFilaModal', handleOpenConexaoFila as EventListener);
    };
  }, [])

  useEffect(() => {
    const loadQuadro = async () => {
      try {
        if (params.id && !quadro) { // Só carrega se cliente estiver hidratado
          const quadroData = await getQuadro(params.id as string)
          setQuadro(quadroData)
          
          // Se o quadro tem colunas, usar elas; senão usar mock
          const quadroAny = quadroData as any
          if (quadroAny.colunas && quadroAny.colunas.length > 0) {
            console.log('📋 Carregando colunas do backend:', quadroAny.colunas)
            setColunas(quadroAny.colunas.map((col: any) => ({
              ...col,
              cards: [] // Inicializar cards vazios, serão preenchidos pelas conversas
            })))
          } else {
            console.log('📋 Usando colunas mock (quadro sem colunas)')
            setColunas(mockColunas)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar quadro:', error)
      } finally {
        setLoading(false)
      }
    }

    if (loading && params.id && isClient) { // Só executa se cliente estiver hidratado
      loadQuadro()
    }
  }, [params.id, loading, quadro, isClient]) // Incluir isClient nas dependências

  // Carregar metadados salvos na inicialização
  useEffect(() => {
    if (quadro && params.id) {
      console.log('📊 Carregando metadados salvos na inicialização...')
      carregarMetadados()
    }
  }, [quadro]) // Executa quando o quadro é carregado
  
  // Carregar contatos do CRM apenas uma vez
  useEffect(() => {
    if (quadro && chats.length === 0 && !loading) {
      console.log('🚀 Carregando contatos do CRM para o Kanban...')
      loadChatsManual()
    }
  }, [quadro]) // Só executa quando o quadro é carregado
  
  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N = Nova coluna
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleAddColuna()
        showNotification('Nova coluna criada! (Ctrl+N)', 'success')
      }
      
      // Ctrl/Cmd + R = Atualizar conversas
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault()
        refreshData()
        showNotification('Conversas atualizadas! (Ctrl+R)', 'success')
      }
      
      // Escape = Fechar modais
      if (e.key === 'Escape') {
        setShowCreateCardModal(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])
  
  // Funções de Drag and Drop
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeData = active.data.current
    
    if (activeData?.type === 'card') {
      setActiveCard(activeData.card)
    }
  }
  
  const handleDragOver = (event: DragOverEvent) => {
    // Feedback visual já é fornecido pelo isOver do useDroppable
  }

  // Filtrar conversas baseado na busca
  const filtrarConversas = (conversas: any[]) => {
    if (!searchQuery.trim()) return conversas
    
    const query = searchQuery.toLowerCase()
    return conversas.filter(chat => 
      chat.name.toLowerCase().includes(query) ||
      chat.lastMessage?.body.toLowerCase().includes(query) ||
      chat.id.includes(query)
    )
  }
  




  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveCard(null)
    setActiveColumn(null)
    
    if (!over) {
      return
    }

    const activeId = String(active.id)
    const overId = String(over.id)
    
    // Se é o mesmo lugar, não fazer nada
    if (activeId === overId) {
      return
    }
    
    // Verificar se estamos arrastando uma coluna
    const activeData = active.data.current
    if (activeData?.type === 'column') {
      handleColumnDragEnd(event)
      return
    }

    // Encontrar o card ativo e as colunas
    let sourceColumnId = ''
    let targetColumnId = ''
    let cardToMove: any = null
    
    // Usar as colunas mapeadas (que contêm os cards atuais)
    const colunasAtuais = mapearConversasParaColunas()
    
    // Encontrar coluna de origem do card
    for (const coluna of colunasAtuais) {
      const card = coluna.cards.find((c: any) => String(c.id) === activeId)
      if (card) {
        sourceColumnId = coluna.id
        cardToMove = card
        break
      }
    }
    
    // Determinar coluna de destino
    // Se overId é uma coluna, usar diretamente
    const targetColumn = colunasAtuais.find(col => col.id === overId)
    if (targetColumn) {
      targetColumnId = overId
    } else {
      // Se overId é um card, encontrar sua coluna
      for (const coluna of colunasAtuais) {
        const card = coluna.cards.find((c: any) => String(c.id) === overId)
        if (card) {
          targetColumnId = coluna.id
          break
        }
      }
    }
    
    if (!cardToMove || !sourceColumnId || !targetColumnId) {
      return
    }
    
    // Atualizar estado das colunas - usar as colunas mapeadas como base
    setColunas(prevColunas => {
      // Usar as colunas atuais mapeadas como base
      const newColunas = colunasAtuais.map(coluna => ({ ...coluna, cards: [...coluna.cards] }))
      
      // Remover da coluna de origem
      const sourceCol = newColunas.find(col => col.id === sourceColumnId)
      if (sourceCol) {
        sourceCol.cards = sourceCol.cards.filter((c: any) => String(c.id) !== activeId)
      }
      
      // Adicionar na coluna de destino
      const targetCol = newColunas.find(col => col.id === targetColumnId)
      let newIndex = 0
      if (targetCol) {
        // Se estamos soltando sobre outro card, inserir na posição correta
        if (overId !== targetColumnId) {
          const targetCardIndex = targetCol.cards.findIndex((c: any) => String(c.id) === overId)
          if (targetCardIndex !== -1) {
            newIndex = targetCardIndex
            targetCol.cards.splice(targetCardIndex, 0, cardToMove)
          } else {
            newIndex = targetCol.cards.length
            targetCol.cards.push(cardToMove)
          }
        } else {
          // Soltando na coluna vazia, adicionar no final
          newIndex = targetCol.cards.length
          targetCol.cards.push(cardToMove)
        }
      }
      
      showNotification(`Card movido para ${getColunaName(targetColumnId)}`, 'success')
      setHasManualChanges(true)
      
      // Persistir movimento no backend com índice
      persistirMovimentoCard(activeId, sourceColumnId, targetColumnId, newIndex)
      
      return newColunas
    })
  }

  const handleDeleteColuna = (columnId: string) => {
    setColunas(prev => prev.filter(col => col.id !== columnId))
    showNotification('Coluna deletada com sucesso!', 'success')
  }

  const handleCreateCard = (cardData: any) => {
    setColunas(prev => 
      prev.map(coluna => 
        coluna.id === selectedColunaId
          ? { ...coluna, cards: [...coluna.cards, cardData] }
          : coluna
      )
    )
    
    showNotification(`Card "${cardData.nome}" criado com sucesso!`, 'success')
  }

  const handleAddColuna = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/column-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quadroId: id,
          nome: `Nova Coluna ${colunas.length + 1}`,
          cor: '#6366f1',
          posicao: colunas.length + 1
        })
      })
      
      if (response.ok) {
        const novaColuna = await response.json()
        console.log('✅ Nova coluna criada no backend:', novaColuna)
        
        setColunas(prev => [...prev, {
          ...novaColuna,
          cards: []
        }])
        
        showNotification(`Coluna "${novaColuna.nome}" criada!`, 'success')
      } else {
        console.error('❌ Erro ao criar coluna no backend')
        showNotification('Erro ao criar coluna', 'error')
      }
    } catch (error) {
      console.error('❌ Erro ao criar coluna:', error)
      showNotification('Erro ao criar coluna', 'error')
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-white/60' : 'text-gray-600'
            }`}>Carregando quadro...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!quadro) {
    return (
      <div className={`min-h-screen transition-all duration-500 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className={`text-sm mb-4 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>Quadro não encontrado</p>
            <button
              onClick={() => router.push('/dashboard/admin/kanban')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Voltar aos Quadros
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
    }`}>
    
      
      {/* AtendimentosTopBar */}
      <AtendimentosTopBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Header do Quadro */}
      <div className={`border-b backdrop-blur-sm ${
        theme === 'dark' 
          ? 'bg-slate-900/50 border-slate-700/50' 
          : 'bg-white/50 border-gray-200/50'
      }`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Botão Voltar */}
              <motion.button
                onClick={() => router.push('/dashboard/admin/kanban')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-white/10 text-white/60 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-[19px] h-[19px]" />
              </motion.button>
              


              <div className="flex items-center justify-between">
                {/* Lado Esquerdo - Ícone e Título */}
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`p-2.5 rounded-xl ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50'
                        : 'bg-gradient-to-br from-blue-50 to-blue-100/50'
                    }`}
                    style={{ 
                      boxShadow: theme === 'dark' 
                        ? `0 0 20px #305e7315` 
                        : `0 4px 20px #305e7320`
                    }}
                    whileHover={{ rotate: 5, scale: 1.05 }}
                  >
                    <Trello className="w-[19px] h-[19px]" style={{ color: '#305e73' }} />
                  </motion.div>
                  
                  <div>
                    {editingQuadroTitle ? (
                      <input
                        type="text"
                        value={editingQuadroName}
                        onChange={(e) => setEditingQuadroName(e.target.value)}
                        onBlur={() => handleSaveQuadroTitle()}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveQuadroTitle()
                          }
                        }}
                        className={`text-base font-bold bg-transparent border-b-2 border-blue-500 outline-none ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                        autoFocus
                      />
                    ) : (
                      <h1 
                        className={`text-base font-bold cursor-pointer hover:text-blue-600 transition-colors ${
                          theme === 'dark' ? 'text-white hover:text-blue-400' : 'text-gray-900'
                        }`}
                        onDoubleClick={() => handleDoubleClickQuadroTitle()}
                      >
                        {quadro.nome}
                      </h1>
                    )}
                    
                    {editingQuadroDescription ? (
                      <input
                        type="text"
                        value={editingQuadroDescricao}
                        onChange={(e) => setEditingQuadroDescricao(e.target.value)}
                        onBlur={() => handleSaveQuadroDescription()}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveQuadroDescription()
                          }
                        }}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 bg-transparent border border-blue-500 outline-none ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                        autoFocus
                      />
                    ) : (
                      <div 
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 cursor-pointer hover:bg-blue-100 transition-colors ${
                          theme === 'dark'
                            ? 'bg-white/5 text-white/60 border border-white/10 hover:bg-blue-900/20'
                            : 'bg-gray-100/80 text-gray-600 border border-gray-200/50'
                        }`}
                        onDoubleClick={() => handleDoubleClickQuadroDescription()}
                      >
                        {quadro.descricao}
                      </div>
                    )}
                  </div>
                </div>

                {/* Centro - Estatísticas Sofisticadas */}
                <div className="flex items-center gap-3 mx-16">
                  {/* Conversas */}
                  <motion.div 
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border transition-all ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-white/60 border-white/20 hover:bg-white/80'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <MessageCircle className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <span className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Conversas
                    </span>
                    <div className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold ${
                      theme === 'dark'
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {chats.length}
                    </div>
                  </motion.div>

                  {/* Cards */}
                  <motion.div 
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border transition-all ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-white/60 border-white/20 hover:bg-white/80'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CreditCard className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-600'
                    }`} />
                    <span className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Cards
                    </span>
                    <div className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold ${
                      theme === 'dark'
                        ? 'bg-green-500 text-white'
                        : 'bg-green-600 text-white'
                    }`}>
                      {mapearConversasParaColunas().reduce((total, col) => total + col.cards.length, 0)}
                    </div>
                  </motion.div>

                  {/* Colunas */}
                  <motion.div 
                    className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border transition-all ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-white/60 border-white/20 hover:bg-white/80'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Columns className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <span className={`text-xs font-medium ${
                      theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Colunas
                    </span>
                    <div className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold ${
                      theme === 'dark'
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-600 text-white'
                    }`}>
                      {colunas.length}
                    </div>
                  </motion.div>

                  {/* Status do Filtro */}
                  {searchQuery && (
                    <motion.div 
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border transition-all ${
                        theme === 'dark'
                          ? 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20'
                          : 'bg-orange-100/80 border-orange-200/40 hover:bg-orange-200/60'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Filter className={`w-4 h-4 ${
                        theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                      }`} />
                      <span className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-orange-300' : 'text-orange-700'
                      }`}>
                        Filtrado
                      </span>
                      <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                        theme === 'dark'
                          ? 'bg-orange-400'
                          : 'bg-orange-500'
                      }`}></div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Lado Direito - Ações do Header */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={refreshData}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 text-white/80'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <motion.div
                  animate={loading ? { rotate: 360 } : {}}
                  transition={{ 
                    duration: 1, 
                    repeat: loading ? Infinity : 0,
                    ease: 'linear'
                  }}
                >
                  <Settings className={`w-4 h-4 ${
                    loading ? 'text-blue-500' : ''
                  }`} />
                </motion.div>
                <span className="text-sm">
                  {loading ? 'Carregando...' : `Atualizar (${chats.length})`}
                </span>
                <span className={`text-xs opacity-60 ${
                  theme === 'dark' ? 'text-white/40' : 'text-gray-400'
                }`}>
                  Ctrl+R
                </span>
              </motion.button>
              
              {/* Botão de Reset (só aparece se houve mudanças manuais) */}
              {hasManualChanges && (
                <motion.button
                  onClick={resetAndRemap}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300 border border-yellow-500/30'
                      : 'hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700 border border-yellow-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Resetar mudanças manuais e remapear conversas"
                >
                  <RotateCcw className="w-[15px] h-[15px]" />
                  <span className="text-sm">
                    Remapear
                  </span>
                </motion.button>
              )}
              
              {/* Botão de Atalhos */}
              <motion.button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className={`relative p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-white/10 text-white/60 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Keyboard className="w-[15px] h-[15px]" />
                
                {/* Tooltip com atalhos */}
                {showShortcuts && (
                  <motion.div
                    className={`absolute top-full right-0 mt-2 p-3 rounded-lg shadow-lg border z-50 ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="text-sm font-medium mb-2">Atalhos:</div>
                    <div className="space-y-1 text-xs whitespace-nowrap">
                      <div>Ctrl+N - Nova coluna</div>
                      <div>Ctrl+R - Atualizar conversas</div>
                      <div>Esc - Fechar modais</div>
                      <div>Arrastar - Mover cards</div>
                    </div>
                  </motion.div>
                )}
              </motion.button>

              <motion.button
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-white/10 text-white/60 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MoreVertical className="w-[19px] h-[19px]" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Board Kanban */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="p-6">
          {/* Container com botões de navegação estilo Netflix */}
          <div className="relative group">
            {/* Botão Scroll Esquerda */}
            <button
              onClick={() => {
                const container = document.getElementById('kanban-scroll-container')
                if (container) {
                  container.scrollBy({ left: -320, behavior: 'smooth' })
                }
              }}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                theme === 'dark'
                  ? 'bg-slate-800/90 hover:bg-slate-700/90 text-white shadow-lg'
                  : 'bg-white/90 hover:bg-gray-50/90 text-gray-700 shadow-lg'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Botão Scroll Direita */}
            <button
              onClick={() => {
                const container = document.getElementById('kanban-scroll-container')
                if (container) {
                  container.scrollBy({ left: 320, behavior: 'smooth' })
                }
              }}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 ${
                theme === 'dark'
                  ? 'bg-slate-800/90 hover:bg-slate-700/90 text-white shadow-lg'
                  : 'bg-white/90 hover:bg-gray-50/90 text-gray-700 shadow-lg'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Container de scroll sem scrollbar visível */}
            <style jsx>{`
              #kanban-scroll-container::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div 
              id="kanban-scroll-container"
              className="flex gap-7 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]"
              style={{
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* IE and Edge */
              }}
            >
              {/* Colunas */}
              <SortableContext
                items={mapearConversasParaColunas().map(col => col.id)}
                strategy={verticalListSortingStrategy}
              >
                {mapearConversasParaColunas().map((coluna) => (
                  <div key={coluna.id} className="flex-shrink-0 w-80">
                    <DroppableArea 
                    coluna={coluna} 
                    theme={theme}
                    notesCount={notesCount}
                    orcamentosCount={orcamentosCount}
                    agendamentosCount={agendamentosCount}
                    assinaturasCount={assinaturasCount}
                    anotacoesCount={anotacoesCount}
                    tagsCount={tagsCount}
                    ticketsCount={ticketsCount}
                    agentesCount={agentesCount}
                    contactStatus={contactStatus}
                    orcamentosData={orcamentosData}
                    agendamentosData={agendamentosData}
                    assinaturasData={assinaturasData}
                    anotacoesData={anotacoesData}
                    tagsData={tagsData}
                    ticketsData={ticketsData}
                    agentesData={agentesData}
                    onDoubleClick={handleDoubleClickColumn}
                    onDelete={handleDeleteColumn}
                    editingColumnId={editingColumnId}
                    editingColumnName={editingColumnName}
                    onEditingNameChange={setEditingColumnName}
                    onSaveColumnName={handleSaveColumnName}
                    onOpenColorModal={setColorPickerColumnId}
                    handleAddCard={handleAddCard}
                    onOpenAgendamento={(card) => {
                      setSelectedSheetCard(card)
                      setShowAgendamentoSheet(true)
                    }}
                    onOpenOrcamento={(card) => {
                      setSelectedSheetCard(card)
                      setShowOrcamentoSheet(true)
                    }}
                    onOpenAssinatura={(card) => {
                      setSelectedSheetCard(card)
                      setShowAssinaturaSheet(true)
                    }}
                    onOpenAnotacoes={(card) => {
                      setSelectedSheetCard(card)
                      setShowAnotacoesSheet(true)
                    }}
                    onOpenTicket={(card) => {
                      setSelectedSheetCard(card)
                      setShowTicketSheet(true)
                    }}
                    onOpenAgente={(card) => {
                      console.log(`🚀 CLICK BOT! Card ID: ${card?.id}`)
                      setAgenteModal({ isOpen: true, card })
                      
                      // Debug imediato
                      setTimeout(() => {
                        console.log(`🔍 DEBUG ESTADO: showAgenteModal: ${showAgenteModal}, selectedAgenteCard: ${selectedAgenteCard?.id}`)
                      }, 100)
                    }}
                    onOpenTags={handleOpenTags}
                    onOpenChat={handleOpenChat}
                    onOpenTransferencia={(card) => {
                      setSelectedTransferCard(card)
                      setShowTransferModal(true)
                    }}
                    onOpenEditContato={handleOpenEditContact}
                    onOpenDeleteCard={handleOpenDeleteCard}
                    onOpenVideoChamada={handleOpenVideoChamada}
                    onOpenLigacao={handleOpenLigacao}
                    onOpenCompartilharTela={handleOpenCompartilharTela}
                    getColumnStats={getColumnStats}
                    />
                  </div>
                ))}
              </SortableContext>

            {/* Botão Adicionar Coluna */}
            <motion.div
              className={`flex-shrink-0 w-80 rounded-2xl p-4 border-2 border-dashed cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'border-slate-600 hover:border-slate-500 bg-slate-800/20 hover:bg-slate-800/40'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-100/50'
              }`}
              onClick={handleAddColuna}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex flex-col items-center justify-center py-8 h-32">
                <Plus className={`w-8 h-8 mb-2 ${
                  theme === 'dark' ? 'text-white/40' : 'text-gray-400'
                }`} />
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                }`}>
                  Adicionar Coluna
                </span>
                <span className={`text-xs opacity-60 ${
                  theme === 'dark' ? 'text-white/40' : 'text-gray-400'
                }`}>
                  Ctrl+N
                </span>
              </div>
            </motion.div>
            </div>
          </div>
        </div>
      </DndContext>
        
        {/* DragOverlay para mostrar o item sendo arrastado */}
        <DragOverlay>
          {activeCard && (
            <div className="opacity-80">
              <SortableCard 
                card={activeCard} 
                theme={theme} 
                columnColor={activeCard.columnColor}
                onOpenConexaoFila={() => {}}
                notesCount={0}
                orcamentosCount={0}
                agendamentosCount={0}
                assinaturasCount={0}
                anotacoesCount={0}
                tagsCount={0}
                ticketsCount={0}
                agentesCount={0}
                contactStatus="error"
                onOpenAgendamento={() => {}}
                onOpenOrcamento={() => {}}
                onOpenAssinatura={() => {}}
                onOpenAnotacoes={() => {}}
                onOpenTicket={() => {}}
                onOpenAgente={() => {}}
                onOpenTags={() => {}}
                onOpenChat={() => {}}
                onOpenTransferencia={() => {}}
                onOpenEditContato={(card) => {
                  setSelectedEditCard(card)
                  setShowEditContactModal(true)
                }}
                onOpenDeleteCard={(card) => {
                  setSelectedDeleteCard(card)
                  setShowDeleteCardModal(true)
                }}
                onOpenVideoChamada={() => {}}
                onOpenLigacao={() => {}}
                onOpenCompartilharTela={() => {}}
                orcamentosData={[]}
                agendamentosData={[]}
                assinaturasData={[]}
                anotacoesData={[]}
                tagsData={[]}
                ticketsData={[]}
                agentesData={[]}
              />
            </div>
          )}
        </DragOverlay>
      
      {/* Modal de Criar Card */}
      <CriarCardModal
        isOpen={showCreateCardModal}
        onClose={() => setShowCreateCardModal(false)}
        onCreateCard={handleCreateCard}
        colunaId={selectedColunaId}
        colunaNome={getColunaName(selectedColunaId)}
      />
      
      {/* Modal de Seleção de Cores */}
      <ColorPickerModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
        currentColor={selectedColumn?.cor || '#3b82f6'}
        onColorSelect={handleUpdateColumnColor}
        columnName={selectedColumn?.nome || ''}
      />
      
      {/* Modais do ChatArea */}
      <UniversalAgendamentoModal
        isOpen={agendamentoModal.isOpen}
        onClose={() => setAgendamentoModal({ isOpen: false, card: null })}
        onSave={handleAgendamentoSave}
        contactData={getContactData()}
        mode="create"
      />
      
      <CriarOrcamentoModal
        isOpen={orcamentoModal.isOpen}
        onClose={() => setOrcamentoModal({ isOpen: false, card: null })}
        onSave={handleOrcamentoSave}
        contactData={getContactData()}
        disableContactFields={true}
      />
      
      <AssinaturaModal
        isOpen={assinaturaModal.isOpen}
        onClose={() => setAssinaturaModal({ isOpen: false, card: null })}
        onSave={handleAssinaturaSave}
        chatId={selectedCard?.id}
        contactData={getContactData()}
      />
      
      <AnotacoesModal
        isOpen={showAnotacoesModal}
        onClose={() => {
          setShowAnotacoesModal(false)
          // Fazer refresh dos dados otimizados após fechar modal de anotações
          setTimeout(() => {
            forceRefresh()
          }, 500)
        }}
        contactData={getContactData()}
        chatId={selectedCard?.id}
      />

      {/* Modal de Tickets */}
      <TicketModal 
        isOpen={showTicketModal}
        onClose={() => {
          setShowTicketModal(false)
          setSelectedTicketCard(null)
        }}
        contactId={selectedTicketCard?.chatId || selectedTicketCard?.id || ''}
        contactName={selectedTicketCard?.nome || selectedTicketCard?.name || ''}
        onSuccess={() => {
          // Fazer refresh dos dados otimizados após criar ticket
          setTimeout(() => {
            forceRefresh()
          }, 500)
        }}
      />

      {/* Modal de Agente IA */}
      <AgenteSelectionModal 
        isOpen={agenteModal.isOpen}
        onClose={() => setAgenteModal({ isOpen: false, card: null })}
        chatId={agenteModal.card?.id || null}
        onAgentActivated={handleAgenteSave}
      />

      {/* Modal de Transferir Atendimento */}
      <TransferirAtendimentoModal 
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false)
          setSelectedTransferCard(null)
        }}
        chatId={selectedTransferCard?.chatId || selectedTransferCard?.id || ''}
        contactData={{
          id: selectedTransferCard?.chatId || selectedTransferCard?.id || '',
          nome: selectedTransferCard?.nome || selectedTransferCard?.name || '',
          telefone: selectedTransferCard?.telefone || selectedTransferCard?.id || ''
        }}
        onConfirm={async (dados) => {
          // Implementar lógica de transferência de atendimento
          console.log('🔄 [Kanban] Transferindo atendimento:', dados)
          // TODO: Implementar API de transferência
        }}
      />

      {/* Modal de Vídeo Chamada */}
      <VideoChamadaModal 
        isOpen={showVideoChamadaModal}
        onClose={() => {
          setShowVideoChamadaModal(false)
          setSelectedVideoChamadaCard(null)
        }}
        contactData={{
          nome: selectedVideoChamadaCard?.nome || selectedVideoChamadaCard?.name || '',
          telefone: selectedVideoChamadaCard?.telefone || selectedVideoChamadaCard?.id || ''
        }}
        onStartCall={() => {
          console.log('🎥 [Kanban] Iniciando vídeo chamada')
          // TODO: Implementar lógica de vídeo chamada
        }}
      />

      {/* BottomSheet de Tags */}
      {tagsModal.isOpen && tagsModal.card && (
        <TagsBottomSheet
          isOpen={tagsModal.isOpen}
          onClose={() => setTagsModal({ isOpen: false, card: null })}
          contactData={{
            id: tagsModal.card.id,
            nome: tagsModal.card.name || tagsModal.card.nome,
            telefone: tagsModal.card.id.replace('@c.us', '')
          }}
        />
      )}

      {/* Modal de Chat com componentes reutilizados */}
      <ChatModalKanban 
        isOpen={chatModal.isOpen}
        onClose={() => setChatModal({ isOpen: false, card: null })}
        card={chatModal.card}
        theme={theme}
      />

      {/* Modal de Ligação */}
      <LigacaoModal 
        isOpen={showLigacaoModal}
        onClose={() => {
          setShowLigacaoModal(false)
          setSelectedLigacaoCard(null)
        }}
        contactData={{
          nome: selectedLigacaoCard?.nome || selectedLigacaoCard?.name || '',
          telefone: selectedLigacaoCard?.telefone || selectedLigacaoCard?.id || ''
        }}
        onStartCall={() => {
          console.log('📞 [Kanban] Iniciando ligação')
          // TODO: Implementar lógica de ligação
        }}
      />

      {/* Modal de Compartilhar Tela */}
      <CompartilharTelaModal 
        isOpen={showCompartilharTelaModal}
        onClose={() => {
          setShowCompartilharTelaModal(false)
          setSelectedCompartilharTelaCard(null)
        }}
        contactData={{
          nome: selectedCompartilharTelaCard?.nome || selectedCompartilharTelaCard?.name || '',
          telefone: selectedCompartilharTelaCard?.telefone || selectedCompartilharTelaCard?.id || ''
        }}
        onStartShare={() => {
          console.log('🖥️ [Kanban] Iniciando compartilhamento de tela')
          // TODO: Implementar lógica de compartilhamento de tela
        }}
      />

      {/* Modal de Editar Contato */}
      <EditContactModalSteps 
        isOpen={showEditContactModal}
        onClose={() => {
          setShowEditContactModal(false)
          setSelectedEditCard(null)
        }}
        contactData={{
          id: selectedEditCard?.contato?.id || selectedEditCard?.id || '',
          nome: selectedEditCard?.contato?.nome || '',
          numeroTelefone: selectedEditCard?.contato?.numeroTelefone || selectedEditCard?.phone || '',
          email: selectedEditCard?.contato?.email || '',
          empresa: selectedEditCard?.contato?.empresa || '',
          cpf: selectedEditCard?.contato?.cpf || '',
          cnpj: selectedEditCard?.contato?.cnpj || '',
          cep: selectedEditCard?.contato?.cep || '',
          rua: selectedEditCard?.contato?.rua || '',
          numero: selectedEditCard?.contato?.numero || '',
          bairro: selectedEditCard?.contato?.bairro || '',
          cidade: selectedEditCard?.contato?.cidade || '',
          estado: selectedEditCard?.contato?.estado || '',
          pais: selectedEditCard?.contato?.pais || 'Brasil',
          fotoPerfil: selectedEditCard?.contato?.fotoPerfil || '',
          tags: selectedEditCard?.contato?.tags?.map((tag: any) => tag.nome) || []
        }}
        onSave={async (data) => {
          try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/contatos/${data.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(data)
            })

            if (response.ok) {
              const updatedContact = await response.json()
              console.log('✅ Contato atualizado com sucesso:', updatedContact)
              
              // Atualizar dados do card selecionado com os dados do DB
              setSelectedEditCard({
                ...selectedEditCard,
                nome: updatedContact.nome,
                email: updatedContact.email,
                empresa: updatedContact.empresa,
                cpf: updatedContact.cpf,
                cnpj: updatedContact.cnpj,
                cep: updatedContact.cep,
                rua: updatedContact.rua,
                numero: updatedContact.numero,
                bairro: updatedContact.bairro,
                cidade: updatedContact.cidade,
                estado: updatedContact.estado,
                pais: updatedContact.pais
              })
              
              // Recarregar dados do kanban - invalidar cache
              await forceRefresh()
              loadChatsManual()
            } else {
              console.error('❌ Erro ao atualizar contato')
            }
          } catch (error) {
            console.error('❌ Erro ao atualizar contato:', error)
          }
        }}
      />

      {/* Modal de Excluir Card */}
      <DeleteCardModal 
        isOpen={showDeleteCardModal}
        onClose={() => {
          setShowDeleteCardModal(false)
          setSelectedDeleteCard(null)
        }}
        cardData={{
          id: selectedDeleteCard?.chatId || selectedDeleteCard?.id || '',
          nome: selectedDeleteCard?.nome || selectedDeleteCard?.name || ''
        }}
        onConfirm={async (cardId) => {
          try {
            console.log('🔍 [DEBUG] Tentando excluir card ID:', cardId)
            console.log('🔍 [DEBUG] selectedDeleteCard:', selectedDeleteCard)
            
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/kanban/cards/${cardId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })

            console.log('🔍 [DEBUG] Response status:', response.status)
            console.log('🔍 [DEBUG] Response ok:', response.ok)

            if (response.ok) {
              console.log('✅ Card excluído com sucesso')
              // Invalidar cache e recarregar dados do kanban
              setTimeout(async () => {
                console.log('🔄 [DEBUG] Forçando reload completo dos dados após exclusão de card')
                await forceRefresh()
                await carregarMetadados()
                loadChatsManual()
              }, 500)
            } else {
              const errorData = await response.text()
              console.error('❌ Erro ao excluir card - Status:', response.status, 'Error:', errorData)
            }
          } catch (error) {
            console.error('❌ Erro ao excluir card:', error)
          }
        }}
      />

      {/* Modal de Conexão e Fila */}
      {console.log('🔗 RENDERIZANDO ConexaoFilaModal com:', { isOpen: conexaoFilaModal.isOpen, card: conexaoFilaModal.card })}
      <ConexaoFilaModal
        isOpen={conexaoFilaModal.isOpen}
        onClose={() => setConexaoFilaModal({ isOpen: false, card: null })}
        card={conexaoFilaModal.card || { id: '' }}
      />

      {/* BottomSheets do Chat (Reutilizados) */}
      <AgendamentoBottomSheet
        isOpen={showAgendamentoSheet}
        onClose={() => {
          setShowAgendamentoSheet(false)
          setSelectedSheetCard(null)
          // Recarregar dados após fechar
          setTimeout(() => {
            forceRefresh()
          }, 500)
        }}
        chatId={selectedSheetCard?.id}
      />

      <OrcamentoBottomSheet
        isOpen={showOrcamentoSheet}
        onClose={() => {
          setShowOrcamentoSheet(false)
          setSelectedSheetCard(null)
          // Recarregar dados após fechar
          setTimeout(() => {
            forceRefresh()
          }, 500)
        }}
        chatId={selectedSheetCard?.id}
      />

      <TicketBottomSheet
        isOpen={showTicketSheet}
        onClose={() => {
          setShowTicketSheet(false)
          setSelectedSheetCard(null)
          // Recarregar dados após fechar
          setTimeout(() => {
            forceRefresh()
          }, 500)
        }}
        chatId={selectedSheetCard?.id}
      />

      <AnotacoesBottomSheet
        isOpen={showAnotacoesSheet}
        onClose={() => {
          setShowAnotacoesSheet(false)
          setSelectedSheetCard(null)
          // Recarregar dados após fechar
          setTimeout(() => {
            forceRefresh()
          }, 500)
        }}
        chatId={selectedSheetCard?.id}
      />

      <AssinaturaBottomSheet
        isOpen={showAssinaturaSheet}
        onClose={() => {
          setShowAssinaturaSheet(false)
          setSelectedSheetCard(null)
          // Recarregar dados após fechar
          setTimeout(() => {
            forceRefresh()
          }, 500)
        }}
        chatId={selectedSheetCard?.id}
      />
    </div>
  )
}
