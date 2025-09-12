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
  UserCheck
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { useKanban } from '@/hooks/useKanban'
import { useKanbanOptimized } from '@/hooks/useKanbanOptimized'
import UniversalAgendamentoModal, { type AgendamentoData as UniversalAgendamentoData } from '@/components/shared/UniversalAgendamentoModal'
import AnotacoesModal from '../../atendimentos/components/modals/AnotacoesModal'
import AgendamentoModal from '../../atendimentos/components/modals/AgendamentoModal'
import CriarOrcamentoModal from '../../orcamentos/components/CriarOrcamentoModal'
import AtendimentosTopBar from '../../atendimentos/components/AtendimentosTopBar'
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
  horizontalListSortingStrategy,
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
  onOpenVideoChamada,
  onOpenLigacao,
  onOpenCompartilharTela,
  orcamentosData,
  agendamentosData,
  assinaturasData,
  anotacoesData
}: {
  cards: any[]
  theme: string
  columnColor: string
  notesCount: { [key: string]: number }
  orcamentosCount: { [key: string]: number }
  agendamentosCount: { [key: string]: number }
  assinaturasCount: { [key: string]: number }
  contactStatus: { [key: string]: string }
  onOpenAgendamento: (card: any) => void
  onOpenOrcamento: (card: any) => void
  onOpenAssinatura: (card: any) => void
  onOpenAnotacoes: (card: any) => void
  onOpenVideoChamada: () => void
  onOpenLigacao: () => void
  onOpenCompartilharTela: () => void
  orcamentosData: any
  agendamentosData: any
  assinaturasData: any
  anotacoesData: any
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
          contactStatus={(contactStatus[card.id] || 'error') as 'error' | 'synced'}
          onOpenAgendamento={onOpenAgendamento}
          onOpenOrcamento={onOpenOrcamento}
          onOpenAssinatura={onOpenAssinatura}
          onOpenAnotacoes={onOpenAnotacoes}
          onOpenVideoChamada={onOpenVideoChamada}
          onOpenLigacao={onOpenLigacao}
          onOpenCompartilharTela={onOpenCompartilharTela}
          orcamentosData={orcamentosData}
          agendamentosData={agendamentosData}
          assinaturasData={assinaturasData}
          anotacoesData={anotacoesData}
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
              : 'border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-600 hover:bg-gray-50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoadingMore ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Carregando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Carregar mais {Math.min(20, cards.length - visibleCount)} cards</span>
            </div>
          )}
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
  contactStatus,
  orcamentosData,
  agendamentosData,
  assinaturasData,
  anotacoesData,
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
  onOpenVideoChamada,
  onOpenLigacao,
  onOpenCompartilharTela,
  getColumnStats
}: { 
  coluna: any, 
  theme: string,
  notesCount: Record<string, number>,
  orcamentosCount: Record<string, number> | number,
  agendamentosCount: Record<string, number> | number,
  assinaturasCount: Record<string, number>,
  contactStatus: Record<string, 'synced' | 'error'>,
  orcamentosData: Record<string, any[]>,
  agendamentosData: Record<string, any[]>,
  assinaturasData: Record<string, any[]>,
  anotacoesData: Record<string, any[]>,
  onDoubleClick: (coluna: any) => void,
  onDelete: (colunaId: string) => void,
  editingColumnId: string | null,
  editingColumnName: string,
  onSaveColumnName: (colunaId: string) => void,
  onEditingNameChange: (name: string) => void,
  onOpenColorModal: (coluna: any) => void,
  handleAddCard: (colunaId: string) => void,
  onOpenAgendamento: (card: any) => void,
  onOpenOrcamento: (card: any) => void,
  onOpenAssinatura: (card: any) => void,
  onOpenAnotacoes: (card: any) => void,
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
                <Plus className="w-4 h-4" />
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
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Estatísticas da Coluna */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Total de Orçamentos */}
          <motion.div 
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              theme === 'dark' 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <DollarSign className="w-3 h-3" />
            {getColumnStats(coluna.id)?.totalOrcamentos || 0} Orç.
          </motion.div>
          
          {/* Total de Agendamentos - SEMPRE MOSTRA */}
          <motion.div 
            className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              theme === 'dark' 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <Calendar className="w-3 h-3" />
            {getColumnStats(coluna.id)?.totalAgendamentos || 0} Agend.
          </motion.div>
          
          {/* Total de Assinaturas - SÓ MOSTRA SE HOUVER */}
          {(getColumnStats(coluna.id)?.totalAssinaturas || 0) > 0 && (
            <motion.div 
              className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                theme === 'dark' 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <FileSignature className="w-3 h-3" />
              {getColumnStats(coluna.id)?.totalAssinaturas || 0} Ass.
            </motion.div>
          )}
          
          {/* Valor Total - SÓ MOSTRA SE HOUVER */}
          {(getColumnStats(coluna.id)?.totalValor || 0) > 0 && (
            <motion.div 
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                theme === 'dark' 
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <DollarSign className="w-3 h-3" />
              {(getColumnStats(coluna.id)?.totalValor || 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </motion.div>
          )}
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
            return total + cardOrcamentos.length
          }, 0)
          
          const totalAgendamentos = coluna.cards.reduce((total: number, card: any) => {
            const cardAgendamentos = agendamentosData?.[card.id] || []
            return total + cardAgendamentos.length
          }, 0)
          
          const totalValor = coluna.cards.reduce((total: number, card: any) => {
            const cardOrcamentos = orcamentosData?.[card.id] || []
            const cardTotal = cardOrcamentos.reduce((sum: number, orc: any) => {
              const valor = parseFloat(orc.valorTotal) || 0
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
              {/* Resumo de Orçamentos */}
              {totalOrcamentos > 0 && (
                <motion.div
                  className="px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-500 overflow-hidden relative"
                  style={{
                    background: theme === 'dark'
                      ? `linear-gradient(135deg, ${coluna.cor}15 0%, rgba(0,0,0,0.3) 100%)`
                      : `linear-gradient(135deg, ${coluna.cor}10 0%, rgba(255,255,255,0.8) 100%)`,
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0'
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign 
                        className="w-4 h-4" 
                        style={{ color: coluna.cor }}
                      />
                      <span className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {totalOrcamentos} orçamento{totalOrcamentos !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-sm font-bold" style={{ color: coluna.cor }}>
                      {totalValor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
              
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
            contactStatus={contactStatus}
            onOpenAgendamento={onOpenAgendamento}
            onOpenOrcamento={onOpenOrcamento}
            onOpenAssinatura={onOpenAssinatura}
            onOpenAnotacoes={onOpenAnotacoes}
            onOpenVideoChamada={onOpenVideoChamada}
            onOpenLigacao={onOpenLigacao}
            onOpenCompartilharTela={onOpenCompartilharTela}
            orcamentosData={orcamentosData}
            agendamentosData={agendamentosData}
            assinaturasData={assinaturasData}
            anotacoesData={anotacoesData}
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
  contactStatus: 'synced' | 'error';
  onOpenAgendamento: (card: any) => void;
  onOpenOrcamento: (card: any) => void;
  onOpenAssinatura: (card: any) => void;
  onOpenAnotacoes: (card: any) => void;
  onOpenVideoChamada: () => void;
  onOpenLigacao: () => void;
  onOpenCompartilharTela: () => void;
  orcamentosData: any;
  agendamentosData: any;
  assinaturasData: any;
  anotacoesData: any;
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
  contactStatus,
  onOpenAgendamento, 
  onOpenOrcamento,
  onOpenAssinatura,
  onOpenAnotacoes,
  onOpenVideoChamada,
  onOpenLigacao,
  onOpenCompartilharTela,
  orcamentosData,
  agendamentosData,
  assinaturasData,
  anotacoesData
}: SortableCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
  // Debug do estado
  console.log('Card render - expandedSection:', expandedSection, 'cardId:', card.id)
  
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
                alt={card.name || card.nome}
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
              <User className="w-5 h-5" />
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
              {card.name || card.nome}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs ${
                theme === 'dark' ? 'text-white/50' : 'text-gray-500'
              }`}>
                {card.lastSeen ? `Visto ${card.lastSeen}` : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {card.tags?.map((tag: string) => (
            <span
              key={tag}
              className={`px-2 py-1 rounded-full text-xs ${
                theme === 'dark'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {tag}
            </span>
          ))}
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
          {/* Badge Orçamentos - Clicável */}
          {orcamentosCount > 0 && (
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
                console.log('Clicou orçamentos, expandedSection atual:', expandedSection)
                console.log('orcamentosData para card:', card.id, orcamentosData?.[card.id])
                setExpandedSection(expandedSection === 'orcamentos' ? null : 'orcamentos')
              }}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" style={{ color: columnColor }} />
                <span className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {orcamentosCount} Orçamento{orcamentosCount > 1 ? 's' : ''}
                </span>
              </div>
              {orcamentosData && orcamentosData[card.id] && (
                <div className="text-xs font-bold" style={{ color: columnColor }}>
                  R$ {orcamentosData[card.id].reduce((sum: number, orc: any) => 
                    sum + (parseFloat(orc.valorTotal) || 0), 0
                  ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>
          )}

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
            </div>
          )}

          {/* Badge Anotações - Clicável */}
          {notesCount > 0 && (
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
                  {notesCount} Anotaç{notesCount > 1 ? 'ões' : 'ão'}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Seções Expandidas - Aparecem quando clicadas */}
        <AnimatePresence>
          {/* Detalhes Orçamentos Expandidos */}
          {expandedSection === 'orcamentos' && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-3 space-y-2"
              style={{ overflow: 'hidden' }}
            >
              {orcamentosData && orcamentosData[card.id] && Array.isArray(orcamentosData[card.id]) ? (
                <SortableContext
                  items={orcamentosData[card.id].map((orc: any) => `orc-${orc.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {orcamentosData[card.id].map((orc: any, index: number) => (
                    <SortableOrcamentoItem
                      key={orc.id}
                      orc={orc}
                      index={index}
                      columnColor={columnColor}
                      theme={theme}
                    />
                  ))}
                </SortableContext>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 rounded-lg text-center ${
                    theme === 'dark' ? 'bg-gray-800/50 text-gray-400' : 'bg-gray-100/50 text-gray-600'
                  }`}
                >
                  <DollarSign className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Carregando orçamentos...</p>
                </motion.div>
              )}
            </motion.div>
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
              {agendamentosData && agendamentosData[card.id] && Array.isArray(agendamentosData[card.id]) ? (
                agendamentosData[card.id].map((agend: any, index: number) => (
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
                        {agend.dataHora ? new Date(agend.dataHora).toLocaleDateString('pt-BR') : 'Data não definida'}
                      </span>
                      <span className="text-xs opacity-60">
                        {agend.dataHora ? new Date(agend.dataHora).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : '--:--'}
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
                  <p className="text-sm">Carregando agendamentos...</p>
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
              {assinaturasData && assinaturasData[card.id] && Array.isArray(assinaturasData[card.id]) ? (
                assinaturasData[card.id].map((ass: any, index: number) => (
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
                  <DollarSign className="w-5 h-5 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">Carregando assinaturas...</p>
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
              {console.log('DEBUG Anotações - cardId:', card.id, 'anotacoesData:', anotacoesData, 'dados do card:', anotacoesData?.[card.id])}
              {anotacoesData && anotacoesData[card.id] && Array.isArray(anotacoesData[card.id]) ? (
                anotacoesData[card.id].map((anotacao: any, index: number) => (
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
        </AnimatePresence>

      </div>
      
      {/* Área de Ações - NÃO draggable */}
      <div className="flex flex-col gap-3 mt-3">
        {/* Ações do ChatArea - Alinhadas à Esquerda */}
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-slate-700/60 to-slate-600/60 text-slate-200 border border-slate-600/30' 
            : 'bg-gradient-to-r from-gray-100/80 to-gray-200/60 text-gray-700 border border-gray-300/30'
        } backdrop-blur-sm shadow-lg self-start`}
        style={{
          boxShadow: `0 4px 12px ${columnColor || '#64748b'}15`
        }}>
          {/* Ligar */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenLigacao()
            }}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Ligar"
          >
            <Phone className="w-3 h-3" />
          </motion.button>
            
          {/* Vídeo Chamada */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenVideoChamada()
            }}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Vídeo Chamada"
          >
            <Video className="w-3 h-3" />
          </motion.button>
            
          {/* Compartilhar Tela */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onOpenCompartilharTela()
            }}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Compartilhar Tela"
          >
            <Monitor className="w-3 h-3" />
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
              <Calendar className="w-3 h-3" />
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
              <DollarSign className="w-3 h-3" />
              {/* Badge com número de orçamentos - SEMPRE MOSTRA SE > 0 */}
              {(orcamentosCount || 0) > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                  {orcamentosCount > 99 ? '99+' : orcamentosCount}
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
              <FileSignature className="w-3 h-3" />
              {/* Badge com número de assinaturas - SEMPRE MOSTRA SE > 0 */}
              {(assinaturasCount || 0) > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                  {assinaturasCount > 99 ? '99+' : assinaturasCount}
                </span>
              )}
            </motion.button>
            
          {/* Contato */}
          <motion.button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // Navegar para página de contatos com filtro
              window.open(`/dashboard/admin/contatos?search=${encodeURIComponent(card.id)}`, '_blank')
            }}
            className={`relative p-1.5 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Contato"
          >
              <UserCheck className="w-3 h-3" />
              {/* Badge de status do contato */}
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white ${
                contactStatus === 'synced' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
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
              <StickyNote className="w-3 h-3" />
              {/* Badge com número de anotações - SEMPRE MOSTRA SE > 0 */}
              {(notesCount || 0) > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-medium shadow-sm">
                  {notesCount > 99 ? '99+' : notesCount}
                </span>
              )}
          </motion.button>
        </div>
        
        {/* Informações do Card */}
        <div className="flex items-center gap-2">
          {/* Último Visto */}
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
  const [whatsappLoading, setWhatsappLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [quadro, setQuadro] = useState<any>(null)
  // Estados para armazenar metadados de cards
  const [cardMetadata, setCardMetadata] = useState<Record<string, any>>({})
  
  // Criar contagens baseadas nos dados otimizados
  const orcamentosCount = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.keys(optimizedCards).forEach(cardId => {
      const cardData = optimizedCards[cardId]
      counts[cardId] = cardData?.orcamentos?.length || 0
    })
    return counts
  }, [optimizedCards])
  
  const agendamentosCount = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.keys(optimizedCards).forEach(cardId => {
      const cardData = optimizedCards[cardId]
      counts[cardId] = cardData?.agendamentos?.length || 0
    })
    return counts
  }, [optimizedCards])
  
  // Criar dados detalhados baseados nos dados otimizados
  const orcamentosData = useMemo(() => {
    const data: Record<string, any[]> = {}
    Object.keys(optimizedCards).forEach(cardId => {
      const cardData = optimizedCards[cardId]
      data[cardId] = cardData?.orcamentos || []
    })
    return data
  }, [optimizedCards])
  
  const agendamentosData = useMemo(() => {
    const data: Record<string, any[]> = {}
    Object.keys(optimizedCards).forEach(cardId => {
      const cardData = optimizedCards[cardId]
      data[cardId] = cardData?.agendamentos || []
    })
    return data
  }, [optimizedCards])
  
  const [hasManualChanges, setHasManualChanges] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  // Estados para dados não otimizados ainda (assinaturas, anotações)
  const [assinaturasCount, setAssinaturasCount] = useState<Record<string, number>>({})
  const [anotacoesCount, setAnotacoesCount] = useState<Record<string, number>>({})
  const [assinaturasData, setAssinaturasData] = useState<Record<string, any[]>>({})
  const [anotacoesData, setAnotacoesData] = useState<Record<string, any[]>>({})
  
  // Estados para modais
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [showCreateCardModal, setShowCreateCardModal] = useState(false)
  const [selectedColunaId, setSelectedColunaId] = useState<string | null>(null)
  const [showColorModal, setShowColorModal] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<any>(null)
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false)
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false)
  const [showAssinaturaModal, setShowAssinaturaModal] = useState(false)
  const [showAnotacoesModal, setShowAnotacoesModal] = useState(false)
  const [editingQuadroTitle, setEditingQuadroTitle] = useState(false)
  const [editingQuadroName, setEditingQuadroName] = useState('')
  const [editingQuadroDescription, setEditingQuadroDescription] = useState(false)
  const [editingQuadroDescricao, setEditingQuadroDescricao] = useState('')
  
  // Função para carregar conversas manualmente
  const loadChatsManual = async () => {
    setWhatsappLoading(true)
    
    await fileLogger.log({
      component: 'Kanban',
      action: 'loadChatsManual_started',
      data: { timestamp: new Date().toISOString() },
      userId: user?.id
    })
    
    try {
      const token = localStorage.getItem('token')
      
      await fileLogger.log({
        component: 'Kanban',
        action: 'loadChatsManual_config',
        data: { 
          hasToken: !!token, 
          userId: user?.id,
          tokenLength: token?.length || 0
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
          action: 'loadChatsManual_api_error',
          data: { 
            status: response.status, 
            statusText: response.statusText,
            error: errorText,
            url: `/api/whatsapp/chats`
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
      setWhatsappLoading(false)
      
      await fileLogger.log({
        component: 'Kanban',
        action: 'loadChatsManual_finished',
        data: { 
          finalState: {
            chatsLength: chats.length,
            whatsappLoading: false
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
  const handleAgendamentoSave = async (agendamento: any) => {
    try {
      
      const token = localStorage.getItem('token')
      if (!token) return

      // Extrair número de telefone do chat ID para usar como contato_id
      const contatoId = selectedCard?.id || agendamento.contato.id
      const numeroTelefone = contatoId.replace('@c.us', '')
      
      // Converter formato UniversalAgendamentoData para formato backend
      const data = agendamento
      const inicio_em = `${data.data}T${data.hora_inicio}:00-03:00`
      const fim_em = `${data.data}T${data.hora_fim}:00-03:00`
      const backendData = {
        titulo: data.titulo,
        descricao: data.descricao,
        inicio_em,
        fim_em,
        link_meeting: data.link_video,
        contato_id: numeroTelefone,  // Enviar só o número, sem @c.us
        contato: {
          id: agendamento.contato.id,
          nome: agendamento.contato.nome,
          telefone: agendamento.contato.telefone,
          email: agendamento.contato.email,
          empresa: agendamento.contato.empresa,
          cpf: agendamento.contato.cpf,
          cnpj: agendamento.contato.cnpj,
          cep: agendamento.contato.cep,
          rua: agendamento.contato.rua,
          numero: agendamento.contato.numero,
          bairro: agendamento.contato.bairro,
          cidade: agendamento.contato.cidade,
          estado: agendamento.contato.estado,
          pais: agendamento.contato.pais
        }
      }

      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendData)
      })

      if (response.ok) {
        const result = await response.json()
        setShowAgendamentoModal(false)
        
        // Refrescar dados otimizados após salvar
        if (selectedCard?.id) {
          setTimeout(() => {
            forceRefresh() // Usar o refresh otimizado em vez de fetch individual
          }, 500)
        }
      } else {
        console.error('❌ Erro ao criar agendamento:', response.statusText)
        alert('Erro ao criar agendamento. Tente novamente.')
      }
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error)
    }
  }
  
  const handleOrcamentoSave = async (data: any) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Extrair número de telefone do chat ID para usar como contato_id
      const contatoId = selectedCard?.id || data.contato?.id
      const numeroTelefone = contatoId.replace('@c.us', '')
      
      // Preparar dados do orçamento para o backend (formato correto)
      const orcamentoData = {
        Data: `${data.data}T00:00:00Z`, // Backend espera ISO 8601 com timestamp
        titulo: data.titulo,
        cliente_nome: data.cliente || 'Cliente',
        cliente_telefone: numeroTelefone,
        data_criacao: data.data,
        data_validade: data.data_validade,
        tipo: data.tipo || 'orcamento',
        status: 'rascunho',
        valor_total: data.itens.reduce((total: number, item: any) => total + (item.valor * item.quantidade), 0),
        itens: data.itens.map((item: any) => ({
          nome: item.nome,
          descricao: item.descricao || '',
          quantidade: item.quantidade,
          valor: item.valor, // Backend espera 'valor' não 'valor_unitario'
          subtotal: item.valor * item.quantidade
        })),
        observacoes: data.observacao,
        condicoes_pagamento: data.condicoes_pagamento,
        prazo_entrega: data.prazo_entrega,
        desconto: data.desconto || 0,
        taxa_adicional: data.taxa_adicional || 0,
        contato_id: numeroTelefone
      }

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
        setShowOrcamentoModal(false)
        
        // Refrescar dados otimizados após salvar
        if (selectedCard?.id) {
          setTimeout(() => {
            forceRefresh() // Usar o refresh otimizado em vez de fetch individual
          }, 500)
        }
      } else {
        console.error('❌ Erro ao criar orçamento:', response.statusText)
        alert('Erro ao criar orçamento. Tente novamente.')
      }
    } catch (error) {
      console.error('❌ Erro ao criar orçamento:', error)
      alert('Erro ao criar orçamento. Verifique sua conexão.')
    }
  }

  const handleAssinaturaSave = async (data: any) => {
    setShowAssinaturaModal(false)
    
    // Atualizar contagens após salvar
    if (selectedCard?.id) {
      setTimeout(async () => {
        const count = await fetchAssinaturasCount(selectedCard.id)
        setAssinaturasCount(prev => ({
          ...prev,
          [selectedCard.id]: count
        }))
      }, 500)
    }
  }
  
  // Implementações futuras para vídeo chamada, ligação e compartilhar tela
  const handleVideoChamadaStart = (data: any) => {
    console.log('Vídeo chamada iniciada:', data)
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

    // Buscar contato real pelo chatId (JID)
    const contato = chats.find(c => c.id === selectedCard.id)
    
    if (contato) {
      return {
        id: contato.id || `temp-${Date.now()}`,
        nome: contato.name || 'Contato sem nome',
        telefone: contato.id || '',
        email: '',
        empresa: '',
        avatar: contato.profilePictureUrl || ''
      }
    }

    return {
      id: selectedCard.id || `temp-${Date.now()}`,
      nome: 'Contato não encontrado',
      telefone: selectedCard.id || '',
      email: '',
      empresa: '',
      avatar: ''
    }
  }


  // Função para buscar dados completos de orçamentos
  const fetchOrcamentosDetalhes = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orcamentos?contato_id=${encodeURIComponent(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
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
      const response = await fetch(`/api/agendamentos?contato_id=${encodeURIComponent(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data.slice(0, 3) : [] // Limitamos aos 3 mais recentes
      }
      return []
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      return []
    }
  }

  // Função para buscar dados completos de assinaturas
  const fetchAssinaturasDetalhes = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/assinaturas?contato_id=${encodeURIComponent(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data.slice(0, 3) : [] // Limitamos às 3 mais recentes
      }
      return []
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error)
      return []
    }
  }

  // Função para buscar contagem de orçamentos
  const fetchOrcamentosCount = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orcamentos?contato_id=${encodeURIComponent(chatId)}`, {
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
      const response = await fetch(`/api/agendamentos?contato_id=${encodeURIComponent(chatId)}`, {
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

  // Função para buscar notas/anotações count
  const fetchNotesCount = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/anotacoes?contato_id=${encodeURIComponent(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data.length : 0
      }
    } catch (error) {
      console.error('Erro ao buscar anotações:', error)
    }
    return 0
  }

  // Função para buscar contagem de assinaturas
  const fetchAssinaturasCount = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/assinaturas?contato_id=${encodeURIComponent(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data.length : 0
      }
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error)
    }
    return 0
  }

  // Função para buscar detalhes completos de assinaturas
  const fetchAssinaturasDetails = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/assinaturas?contato_id=${encodeURIComponent(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data : []
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes de assinaturas:', error)
    }
    return []
  }

  // Função para buscar detalhes completos de anotações
  const fetchAnotacoesDetails = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/anotacoes?contato_id=${encodeURIComponent(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data : []
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes de anotações:', error)
    }
    return []
  }

  // Função para buscar detalhes completos de orçamentos
  const fetchOrcamentosDetails = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orcamentos?contato_id=${encodeURIComponent(chatId)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data : []
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes de orçamentos:', error)
    }
    return []
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
  const [showShortcuts, setShowShortcuts] = useState(false)
  
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
        
        // Declarar objetos para dados detalhados não otimizados
        const assinaturasDetalhes: Record<string, any[]> = {}
        const anotacoesDetalhes: Record<string, any[]> = {}
      
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
          // Buscar apenas dados não otimizados (assinaturas, anotações)
          const [notesCount, assinaturasCount, contactStatusResult, assinaturasDetalhesData, anotacoesDetalhesData] = await Promise.all([
            fetchNotesCount(cardId),
            fetchAssinaturasCount(cardId),
            checkContactStatus(cardId),
            fetchAssinaturasDetails(cardId),
            fetchAnotacoesDetails(cardId)
          ])
          
          // Armazenar contagens não otimizadas
          notesCounts[cardId] = notesCount
          assinaturasCounts[cardId] = assinaturasCount
          
          // Dados otimizados já disponíveis via hook useKanbanOptimized
          // Mantendo apenas dados não otimizados (assinaturas, anotações)
          assinaturasDetalhes[cardId] = assinaturasDetalhesData
          anotacoesDetalhes[cardId] = anotacoesDetalhesData
          
          await fileLogger.log({
            component: 'Kanban',
            action: 'loadAllCounts_card_processed',
            data: { 
              cardId,
              notesCount,
              assinaturasCount,
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
      
      // Atualizar estados não otimizados
      setNotesCount(notesCounts)
      setAssinaturasCount(assinaturasCounts)
      setAssinaturasData(assinaturasDetalhes)
      setAnotacoesData(anotacoesDetalhes)
      
      // Os dados de orçamentos e agendamentos agora vêm do hook otimizado
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
  
  // Handlers para modais
  const handleOpenAgendamento = (card: any) => {
    setSelectedCard(card)
    setShowAgendamentoModal(true)
  }
  
  const handleOpenOrcamento = (card: any) => {
    setSelectedCard(card)
    setShowOrcamentoModal(true)
  }
  
  const handleOpenAssinatura = (card: any) => {
    setSelectedCard(card)
    setShowAssinaturaModal(true)
  }
  
  const handleOpenAnotacoes = (card: any) => {
    setSelectedCard(card)
    setShowAnotacoesModal(true)
  }
  
  const handleOpenVideoChamada = () => {
    console.log('Abrir vídeo chamada')
    // Implementação futura
  }
  
  const handleOpenLigacao = () => {
    console.log('Fazer ligação') 
    // Implementação futura
  }
  
  const handleOpenCompartilharTela = () => {
    console.log('Compartilhar tela')
    // Implementação futura
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

  // Função para extrair chat ID (compatibilidade com diferentes formatos da WAHA API)
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

  // Função para mapear conversas do WhatsApp para colunas do Kanban
  const mapearConversasParaColunas = () => {
    console.log('🗂️ mapearConversasParaColunas chamada:', {
      chats: chats?.length || 0,
      temChats: !!chats,
      loading,
      colunas: colunas?.length || 0
    })
    
    // Se está carregando, retornar colunas vazias
    if (loading) {
      console.log('⏳ Retornando colunas vazias porque está carregando')
      return colunas.map((coluna) => ({
        ...coluna,
        cards: []
      }))
    }
    
    // Se não há conversas, usar colunas vazias
    if (!chats || chats.length === 0) {
      console.log('⚠️ Retornando cards demo porque não há conversas')
      return colunas.map((coluna, index) => ({
        ...coluna,
        cards: index === 0 ? [{
          id: 'demo-1',
          nome: 'Aguardando Conversas do WhatsApp',
          descricao: 'Conecte seu WhatsApp para ver as conversas aqui',
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

    // Mapear conversas para cards com badges e metadados
    let cards = conversasFiltradas.map((chat, index) => {
      const avatar = chat.profilePictureUrl || null
      const chatId = extractChatId(chat)
      
      // Debug: verificar se o avatar está sendo definido
      console.log(`🖼️ Card ${chat.name}:`, {
        chatId,
        profilePictureUrl: chat.profilePictureUrl,
        avatar,
        hasAvatar: !!avatar
      })

      // Buscar contagens dos fluxos para este chat
      const cardData = getCardData(chatId)
      const cardCounts = {
        orcamentosCount: cardData?.orcamentos?.length || 0,
        agendamentosCount: cardData?.agendamentos?.length || 0,
        assinaturasCount: assinaturasCount[chatId] || 0,
        notesCount: notesCount[chatId] || 0
      }
      
      // Criar tags baseadas nas contagens e status
      const tags = []
      if (cardCounts.orcamentosCount > 0) tags.push(`${cardCounts.orcamentosCount} Orçamento${cardCounts.orcamentosCount > 1 ? 's' : ''}`)
      if (cardCounts.agendamentosCount > 0) tags.push(`${cardCounts.agendamentosCount} Agendamento${cardCounts.agendamentosCount > 1 ? 's' : ''}`)
      if (cardCounts.assinaturasCount > 0) tags.push(`${cardCounts.assinaturasCount} Assinatura${cardCounts.assinaturasCount > 1 ? 's' : ''}`)
      if (cardCounts.notesCount > 0) tags.push(`${cardCounts.notesCount} Anotaç${cardCounts.notesCount > 1 ? 'ões' : 'ão'}`)
      if (chat.lastMessage) tags.push('WhatsApp')
      if (tags.length === 0) tags.push('Novo Contato')
      
      return {
        id: chatId,
        nome: chat.name || 'Contato sem nome',
        descricao: chat.lastMessage?.body || 'Aguardando primeira mensagem',
        posicao: index + 1,
        tags: tags,
        prazo: chat.timestamp || new Date().toISOString(),
        comentarios: cardCounts.notesCount || 0,
        anexos: 0,
        responsavel: chat.name || 'Contato',
        avatar: avatar,
        phone: chatId ? chatId.split('@')[0] : 'N/A',
        isOnline: chat.lastMessage ? new Date(chat.timestamp).getTime() > Date.now() - 300000 : false,
        // Badges de contagem para exibição
        badges: {
          orcamentos: getCardData(chatId)?.orcamentos?.length || 0,
          agendamentos: getCardData(chatId)?.agendamentos?.length || 0,
          assinaturas: assinaturasCount[chatId] || 0,
          anotacoes: notesCount[chatId] || 0
        }
      }
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
      
      console.log(`📋 Coluna ${coluna.nome}:`, {
        colunaId: coluna.id,
        cardsComMetadados: cardsComMetadados.length,
        temMetadados,
        hasManualChanges,
        totalMetadata: Object.keys(cardMetadata).length,
        totalCards: cards.length,
        columnStats: getColumnStats(coluna.id)
      })
      
      // Se não há metadados OU não há mudanças manuais, colocar todos os cards na PRIMEIRA coluna apenas
      if (!temMetadados || !hasManualChanges) {
        // APENAS a primeira coluna recebe todos os cards novos
        if (colunaIndex === 0) {
          console.log(`📥 Todos cards novos vão para a primeira coluna "${coluna.nome}":`, cards.map(c => c.nome))
          return {
            ...coluna,
            cards: cards // Todos os cards ficam na primeira coluna
          }
        } else {
          // Outras colunas ficam vazias até o usuário arrastar manualmente
          console.log(`📭 Coluna "${coluna.nome}" fica vazia (aguardando drag manual)`)
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
  
  // Carregar conversas do WhatsApp apenas uma vez
  useEffect(() => {
    if (quadro && chats.length === 0 && !whatsappLoading) {
      console.log('🚀 Carregando conversas do WhatsApp para o Kanban...')
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
      {/* TopBar */}
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
                <ArrowLeft className="w-5 h-5" />
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
                    <Trello className="w-5 h-5" style={{ color: '#305e73' }} />
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
                disabled={whatsappLoading}
              >
                <motion.div
                  animate={whatsappLoading ? { rotate: 360 } : {}}
                  transition={{ 
                    duration: 1, 
                    repeat: whatsappLoading ? Infinity : 0,
                    ease: 'linear'
                  }}
                >
                  <Settings className={`w-4 h-4 ${
                    whatsappLoading ? 'text-blue-500' : ''
                  }`} />
                </motion.div>
                <span className="text-sm">
                  {whatsappLoading ? 'Sincronizando...' : `Atualizar (${chats.length})`}
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
                  <RotateCcw className="w-4 h-4" />
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
                <Keyboard className="w-4 h-4" />
                
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
                <MoreVertical className="w-5 h-5" />
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
              className="flex gap-6 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]"
              style={{
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* IE and Edge */
              }}
            >
              {/* Colunas */}
              <SortableContext
                items={mapearConversasParaColunas().map(col => col.id)}
                strategy={horizontalListSortingStrategy}
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
                    contactStatus={contactStatus}
                    orcamentosData={orcamentosData}
                    agendamentosData={agendamentosData}
                    assinaturasData={assinaturasData}
                    anotacoesData={anotacoesData}
                    onDoubleClick={handleDoubleClickColumn}
                    onDelete={handleDeleteColumn}
                    editingColumnId={editingColumnId}
                    editingColumnName={editingColumnName}
                    onEditingNameChange={setEditingColumnName}
                    onSaveColumnName={handleSaveColumnName}
                    onOpenColorModal={setColorPickerColumnId}
                    handleAddCard={handleAddCard}
                    onOpenAgendamento={handleOpenAgendamento}
                    onOpenOrcamento={handleOpenOrcamento}
                    onOpenAssinatura={handleOpenAssinatura}
                    onOpenAnotacoes={handleOpenAnotacoes}
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
                notesCount={0}
                orcamentosCount={0}
                agendamentosCount={0}
                assinaturasCount={0}
                contactStatus="error"
                onOpenAgendamento={() => {}}
                onOpenOrcamento={() => {}}
                onOpenAssinatura={() => {}}
                onOpenAnotacoes={() => {}}
                onOpenVideoChamada={() => {}}
                onOpenLigacao={() => {}}
                onOpenCompartilharTela={() => {}}
                orcamentosData={[]}
                agendamentosData={[]}
                assinaturasData={[]}
                anotacoesData={[]}
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
        isOpen={showAgendamentoModal}
        onClose={() => setShowAgendamentoModal(false)}
        onSave={handleAgendamentoSave}
        contactData={getContactData()}
        mode="create"
      />
      
      <CriarOrcamentoModal
        isOpen={showOrcamentoModal}
        onClose={() => setShowOrcamentoModal(false)}
        onSave={handleOrcamentoSave}
        contactData={getContactData()}
        disableContactFields={true}
      />
      
      <AssinaturaModal
        isOpen={showAssinaturaModal}
        onClose={() => setShowAssinaturaModal(false)}
        onSave={handleAssinaturaSave}
        chatId={selectedCard?.id}
        contactData={getContactData()}
      />
      
      <AnotacoesModal
        isOpen={showAnotacoesModal}
        onClose={() => setShowAnotacoesModal(false)}
        contactData={getContactData()}
        chatId={selectedCard?.id}
      />
      
      {/* Modais para vídeo chamada, ligação e compartilhar tela serão implementados futuramente */}
    </div>
  )
}
