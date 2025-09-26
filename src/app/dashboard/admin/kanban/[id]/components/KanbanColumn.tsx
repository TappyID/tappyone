'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { 
  Plus, 
  Trash2, 
  MoreVertical,
  MoreHorizontal,
  Calendar, 
  DollarSign, 
  StickyNote, 
  GripVertical,
  FileSignature,
  Settings,
  Ticket,
  Target,
  AlertTriangle,
  X,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import KanbanCardItem from './KanbanCardItem'
import MetricCard from './MetricCard'

interface KanbanColumnProps {
  coluna: {
    id: string
    nome: string
    cor: string
    cards?: any[]
    ordem?: number
  }
  theme: string
  notesCount: any
  orcamentosCount: any
  agendamentosCount: any
  assinaturasCount: any
  anotacoesCount: any
  tagsCount: any
  ticketsCount: any
  agentesCount: any
  contactStatus: any
  orcamentosData: any
  agendamentosData: any
  assinaturasData: any
  anotacoesData: any
  tagsData: any
  ticketsData: any
  agentesData: any
  editingColumnId: string | null
  editingColumnName: string
  onDoubleClick: (id: string, name: string) => void
  onDelete: (id: string) => void
  onEditingNameChange: (name: string) => void
  onSaveColumnName: () => void
  onOpenColorModal: (coluna: any) => void
  handleAddCard: (colunaId: string) => void
  onOpenAgendamento?: (card: any) => void
  onOpenOrcamento?: (card: any) => void
  onOpenAssinatura?: (card: any) => void
  onOpenAnotacoes?: (card: any) => void
  onOpenTickets?: (card: any) => void
  onOpenTicket?: (card: any) => void
  onOpenAgente?: (card: any) => void
  onOpenTags?: (card: any) => void
  onOpenChat?: (card: any) => void
  showMetrics: boolean
  onOpenTransferencia?: (card: any) => void
  onOpenEditContato?: (card: any) => void
  onOpenDeleteCard?: (card: any) => void
  onOpenVideoChamada?: (card: any) => void
  onOpenLigacao?: () => void
  onOpenCompartilharTela?: () => void
  onOpenConexaoFila?: (card: any) => void
  onOpenConfig?: (coluna: any) => void
  getColumnStats?: (columnId: string) => any
  // 🗑️ Props para modal de confirmação de exclusão
  allColumns?: any[] // Lista de todas as colunas para realocação
  onDeleteWithReallocation?: (columnId: string, targetColumnId: string) => void
}

export default function KanbanColumn({
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
  editingColumnId,
  editingColumnName,
  onDoubleClick,
  onDelete,
  onEditingNameChange,
  onSaveColumnName,
  onOpenColorModal,
  handleAddCard,
  onOpenAgendamento,
  onOpenOrcamento,
  onOpenAssinatura,
  onOpenAnotacoes,
  onOpenTickets,
  onOpenAgente,
  onOpenTags,
  onOpenChat,
  showMetrics,
  onOpenTransferencia,
  onOpenEditContato,
  onOpenDeleteCard,
  onOpenVideoChamada,
  onOpenLigacao,
  onOpenCompartilharTela,
  onOpenConexaoFila,
  onOpenConfig,
  getColumnStats,
  allColumns = [],
  onDeleteWithReallocation
}: KanbanColumnProps) {
  
  const { setNodeRef, isOver } = useDroppable({
    id: coluna.id,
    data: {
      type: 'column',
      columnId: coluna.id
    }
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
  
  const combinedRef = (node: HTMLElement | null) => {
    setNodeRef(node)        // Para aceitar cards
    setSortableNodeRef(node) // Para arrastar coluna
  }

  // 🗑️ Estados para modal de confirmação de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTargetColumn, setSelectedTargetColumn] = useState('')
  
  // ⚙️ Estado para mini modal dos 3 pontinhos
  const [showActionsModal, setShowActionsModal] = useState(false)
  
  // 🎯 Fechar modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionsModal && !(event.target as Element).closest('.actions-modal-container')) {
        setShowActionsModal(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showActionsModal])

  // 🗑️ Função para abrir modal de confirmação
  const handleDeleteClick = () => {
    console.log('🗑️ [DEBUG] handleDeleteClick chamado')
    console.log('🗑️ [DEBUG] allColumns:', allColumns)
    console.log('🗑️ [DEBUG] coluna.cards:', coluna.cards)
    
    if (coluna.cards && coluna.cards.length > 0) {
      // Se tem cards, abrir modal para escolher coluna de destino
      setShowDeleteModal(true)
      // Selecionar primeira coluna disponível como padrão
      const availableColumns = allColumns.filter(col => col.id !== coluna.id)
      console.log('🗑️ [DEBUG] availableColumns:', availableColumns)
      
      if (availableColumns.length > 0) {
        setSelectedTargetColumn(availableColumns[0].id)
        console.log('🗑️ [DEBUG] selectedTargetColumn definido como:', availableColumns[0].id)
      }
    } else {
      // Se não tem cards, deletar direto
      onDelete(coluna.id)
    }
  }

  // 🗑️ Função para confirmar exclusão com realocação
  const handleConfirmDelete = () => {
    if (onDeleteWithReallocation && selectedTargetColumn) {
      onDeleteWithReallocation(coluna.id, selectedTargetColumn)
    } else {
      onDelete(coluna.id)
    }
    setShowDeleteModal(false)
    setSelectedTargetColumn('')
  }

  // Calcular totais da coluna
  const totalOrcamentos = coluna.cards?.reduce((total: number, card: any) => {
    const cardOrcamentos = orcamentosData?.[card.id] || []
    return total + cardOrcamentos.length
  }, 0) || 0

  const totalAgendamentos = coluna.cards?.reduce((total: number, card: any) => {
    const cardAgendamentos = agendamentosData?.[card.id] || []
    return total + cardAgendamentos.length
  }, 0) || 0

  const totalValor = coluna.cards?.reduce((total: number, card: any) => {
    const cardOrcamentos = orcamentosData?.[card.id] || []
    const cardTotal = cardOrcamentos.reduce((sum: number, orc: any) => {
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
  }, 0) || 0

  const totalAssinaturas = coluna.cards?.reduce((total: number, card: any) => {
    const cardAssinaturas = assinaturasData?.[card.id] || []
    return total + cardAssinaturas.length
  }, 0) || 0

  const totalValorAssinaturas = coluna.cards?.reduce((total: number, card: any) => {
    const cardAssinaturas = assinaturasData?.[card.id] || []
    const cardTotal = cardAssinaturas.reduce((sum: number, ass: any) => {
      const valor = parseFloat(ass.valor) || 0
      return sum + valor
    }, 0)
    return total + cardTotal
  }, 0) || 0

  return (
    <motion.div
      ref={combinedRef}
      {...sortableAttributes}
      className={`w-80 h-[calc(100vh-120px)] flex flex-col rounded-2xl border transition-all duration-200 ease-out ${
        isOver 
          ? theme === 'dark'
            ? 'border-blue-400/60 bg-gradient-to-b from-blue-500/10 via-blue-500/5 to-transparent shadow-2xl shadow-blue-500/30'
            : 'border-blue-400/60 bg-gradient-to-b from-blue-50 via-blue-25 to-white shadow-2xl shadow-blue-500/20'
          : theme === 'dark'
            ? 'border-slate-700/30 bg-gradient-to-b from-slate-800/40 via-slate-800/20 to-slate-800/10 hover:from-slate-800/60 hover:via-slate-800/30 hover:to-slate-800/20'
            : 'border-gray-200/40 bg-gradient-to-b from-white via-gray-50/30 to-white/80 hover:from-white hover:via-gray-50/50 hover:to-white'
      } backdrop-blur-sm overflow-hidden group ${
        isColumnDragging 
          ? 'opacity-70 z-50' 
          : 'hover:shadow-lg'
      }`}
      style={{
        ...sortableStyle,
        boxShadow: isColumnDragging
          ? `0 25px 50px rgba(0,0,0,0.25), 0 10px 30px rgba(0,0,0,0.15), 0 0 0 1px ${coluna.cor}40`
          : isOver 
            ? `0 20px 60px ${coluna.cor}30, 0 0 0 1px ${coluna.cor}20` 
            : theme === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)' 
              : '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)'
      }}
      animate={{
        scale: isOver ? 1.02 : 1,
        y: isOver ? -2 : 0,
        rotateZ: isColumnDragging ? 2 : 0
      }}
      transition={{ 
        duration: 0.15, 
        ease: [0.25, 0.46, 0.45, 0.94], // Curva de animação mais suave
        type: "tween"
      }}
    >
      {/* Header da Coluna Ultra Sofisticado */}
      <div className={`relative px-3 pt-2 -pb-1 backdrop-blur-sm ${
        theme === 'dark' ? 'bg-slate-800/20' : 'bg-white/40'
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
            
            {/* Handle para arrastar coluna - DRAG AREA */}
            <div
              {...sortableListeners}
              className={`p-2 rounded-lg cursor-grab active:cursor-grabbing select-none transition-all duration-75 ease-out ${
                theme === 'dark' 
                  ? 'hover:bg-slate-700/70 text-gray-400 hover:text-gray-200 hover:scale-110' 
                  : 'hover:bg-gray-200/70 text-gray-500 hover:text-gray-800 hover:scale-110'
              } ${isColumnDragging ? 'bg-blue-500/20 text-blue-400 scale-110' : ''}`}
              title="Arrastar coluna"
              style={{
                touchAction: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
                transform: 'translateZ(0)', // Force GPU acceleration
                willChange: 'transform'
              }}
            >
              <GripVertical className="w-4 h-4 transition-transform duration-75" />
            </div>
            
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
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border-2 transition-all duration-300 ${
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
                  className={`text-xs font-bold cursor-pointer transition-all duration-300 ${
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
            
            {/* Botão de 3 Pontinhos */}
            <div className="relative actions-modal-container">
              <motion.button
                onClick={() => setShowActionsModal(!showActionsModal)}
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  theme === 'dark'
                    ? 'hover:bg-gray-500/20 text-gray-400 hover:text-gray-300 border border-transparent hover:border-gray-500/30'
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-700 border border-transparent hover:border-gray-300/50'
                } backdrop-blur-sm shadow-sm hover:shadow-md`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Opções da coluna"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </motion.button>

              {/* Mini Modal dos 3 Pontinhos */}
              <AnimatePresence>
                {showActionsModal && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className={`absolute right-0 top-full mt-2 z-50 rounded-lg shadow-xl border ${
                      theme === 'dark' 
                        ? 'bg-slate-800 border-slate-600' 
                        : 'bg-white border-gray-200'
                    } backdrop-blur-sm min-w-[160px]`}
                  >
                    {/* Botão Configurações */}
                    <motion.button
                      onClick={() => {
                        setShowActionsModal(false)
                        onOpenConfig?.(coluna)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-blue-500/20 text-blue-400 hover:text-blue-300'
                          : 'hover:bg-blue-50 text-blue-600 hover:text-blue-700'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm font-medium">Configurações</span>
                    </motion.button>

                    {/* Botão Trocar Cor */}
                    <motion.button
                      onClick={() => {
                        setShowActionsModal(false)
                        onOpenColorModal(coluna)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-purple-500/20 text-purple-400 hover:text-purple-300'
                          : 'hover:bg-purple-50 text-purple-600 hover:text-purple-700'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full border border-white/50"
                        style={{ backgroundColor: coluna.cor }}
                      />
                      <span className="text-sm font-medium">Trocar Cor</span>
                    </motion.button>

                    {/* Divisor */}
                    <div className={`h-px mx-2 ${
                      theme === 'dark' ? 'bg-slate-600' : 'bg-gray-200'
                    }`} />

                    {/* Botão Deletar */}
                    <motion.button
                      onClick={() => {
                        setShowActionsModal(false)
                        handleDeleteClick()
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                          : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Deletar</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Métricas da Coluna */}
      {showMetrics && (
      <motion.div 
        className="p-3 space-y-1"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Orçamentos */}
        <div className={`p-2 rounded-lg ${
          theme === 'dark' ? 'bg-slate-800/60' : 'bg-white'
        } border-l-3`} style={{ borderLeftColor: coluna.cor }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <DollarSign className="w-3 h-3" style={{ color: coluna.cor }} />
              <span className={`text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Orçamentos</span>
            </div>
            <span className={`text-xs font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {Object.keys(orcamentosData || {}).reduce((total, cardId) => {
                return total + (orcamentosData[cardId]?.length || 0)
              }, 0)} / 20
            </span>
          </div>
          <div className={`h-1.5 rounded-full ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                backgroundColor: coluna.cor,
                width: `${Math.min((Object.keys(orcamentosData || {}).reduce((total, cardId) => {
                  return total + (orcamentosData[cardId]?.length || 0)
                }, 0) / 20) * 100, 100)}%`
              }}
            />
          </div>
        </div>

        {/* Agendamentos */}
        <div className={`p-2 rounded-lg ${
          theme === 'dark' ? 'bg-slate-800/60' : 'bg-white'
        } border-l-3`} style={{ borderLeftColor: coluna.cor }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" style={{ color: coluna.cor }} />
              <span className={`text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Agendamentos</span>
            </div>
            <span className={`text-xs font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {Object.keys(agendamentosData || {}).reduce((total, cardId) => {
                return total + (agendamentosData[cardId]?.length || 0)
              }, 0)} / 15
            </span>
          </div>
          <div className={`h-1.5 rounded-full ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                backgroundColor: coluna.cor,
                width: `${Math.min((Object.keys(agendamentosData || {}).reduce((total, cardId) => {
                  return total + (agendamentosData[cardId]?.length || 0)
                }, 0) / 15) * 100, 100)}%`
              }}
            />
          </div>
        </div>

        {/* Tickets */}
        <div className={`p-2 rounded-lg ${
          theme === 'dark' ? 'bg-slate-800/60' : 'bg-white'
        } border-l-3`} style={{ borderLeftColor: coluna.cor }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Ticket className="w-3 h-3" style={{ color: coluna.cor }} />
              <span className={`text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Tickets</span>
            </div>
            <span className={`text-xs font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {Object.keys(ticketsData || {}).reduce((total, cardId) => {
                return total + (ticketsData[cardId]?.length || 0)
              }, 0)} / 10
            </span>
          </div>
          <div className={`h-1.5 rounded-full ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                backgroundColor: coluna.cor,
                width: `${Math.min((Object.keys(ticketsData || {}).reduce((total, cardId) => {
                  return total + (ticketsData[cardId]?.length || 0)
                }, 0) / 10) * 100, 100)}%`
              }}
            />
          </div>
        </div>

        {/* Meta de Vendas */}
        <div className={`p-2 rounded-lg ${
          theme === 'dark' ? 'bg-slate-800/60' : 'bg-white'
        } border-l-3`} style={{ borderLeftColor: coluna.cor }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Target className="w-3 h-3" style={{ color: coluna.cor }} />
              <span className={`text-xs font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>Meta Vendas</span>
            </div>
            <span className={`text-xs font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              R$ 45.000 / R$ 100.000
            </span>
          </div>
          <div className={`h-1.5 rounded-full ${
            theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                backgroundColor: coluna.cor,
                width: '45%'
              }}
            />
          </div>
        </div>
      </motion.div>
      )}

      {/* Cards Container com Scroll - TODA ÁREA É DROPPABLE */}
      <div 
        ref={setNodeRef}
        className={`px-3 flex-1 overflow-y-auto custom-gray-scroll min-h-0 transition-all duration-200 ${
          isOver ? 
            theme === 'dark' 
              ? 'bg-blue-500/10 border-2 border-dashed border-blue-400/50' 
              : 'bg-blue-50/50 border-2 border-dashed border-blue-400/50'
            : ''
        }`}
        style={{
          minHeight: '200px' // Garante área mínima para drop mesmo sem cards
        }}
      >
        {/* Resumo de Totais da Coluna */}
        {(totalOrcamentos > 0 || totalAgendamentos > 0 || totalAssinaturas > 0) && (
          <div className="mb-4 space-y-2">
            {/* Total de Orçamentos */}
            {totalOrcamentos > 0 && (
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-green-500/10' : 'bg-green-50'
              }`}>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium">
                    {totalOrcamentos} Orçamento{totalOrcamentos > 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-xs font-bold text-green-600">
                  R$ {totalValor.toFixed(2)}
                </span>
              </div>
            )}

            {/* Total de Agendamentos */}
            {totalAgendamentos > 0 && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'
              }`}>
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium">
                  {totalAgendamentos} Agendamento{totalAgendamentos > 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Total de Assinaturas */}
            {totalAssinaturas > 0 && (
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50'
              }`}>
                <div className="flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium">
                    {totalAssinaturas} Assinatura{totalAssinaturas > 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-xs font-bold text-purple-600">
                  R$ {totalValorAssinaturas.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Lista de Cards com DnD */}
        <SortableContext
          items={coluna.cards?.map((card: any) => card.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {coluna.cards?.map((card: any) => (
              <KanbanCardItem
                key={card.id}
                card={card}
                theme={theme}
                columnColor={coluna.cor}
                // Passar os contadores como props separadas
                orcamentosCount={orcamentosCount}
                agendamentosCount={agendamentosCount}
                anotacoesCount={anotacoesCount}
                ticketsCount={ticketsCount}
                tagsCount={tagsCount}
                // Handlers
                onOpenAgendamento={onOpenAgendamento}
                onOpenOrcamento={onOpenOrcamento}
                onOpenAssinatura={onOpenAssinatura}
                onOpenAnotacoes={onOpenAnotacoes}
                onOpenTickets={onOpenTickets}
                onOpenTags={onOpenTags}
                onOpenChat={onOpenChat}
              />
            ))}
          </div>
        </SortableContext>

        {/* Área vazia para drop */}
        {(!coluna.cards || coluna.cards.length === 0) && (
          <div className={`flex flex-col items-center justify-center py-12 text-center transition-all duration-300 ${
            isOver
              ? 'opacity-100 transform scale-105'
              : 'opacity-50'
          }`}>
            <motion.div
              animate={{
                y: [0, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className={`w-16 h-16 mb-4 mx-auto rounded-2xl flex items-center justify-center ${
                theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100/50'
              }`}>
                <Plus className="w-8 h-8 opacity-30" />
              </div>
            </motion.div>
            <p className={`text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Arraste cards aqui
            </p>
            <p className={`text-xs opacity-60 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              ou clique em + para adicionar
            </p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative max-w-md w-full rounded-2xl p-6 shadow-2xl ${
                theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Excluir Coluna
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Esta ação não pode ser desfeita
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`ml-auto p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="mb-6">
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  A coluna <strong>"{coluna.nome}"</strong> possui <strong>{coluna.cards?.length || 0} contatos</strong>.
                </p>
                
                {coluna.cards && coluna.cards.length > 0 && (
                  <div className="space-y-3">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Para onde deseja realocar os contatos?
                    </p>
                    
                    <select
                      value={selectedTargetColumn}
                      onChange={(e) => setSelectedTargetColumn(e.target.value)}
                      className={`w-full p-3 rounded-lg border transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="">Selecione uma coluna...</option>
                      {(() => {
                        const filteredColumns = allColumns.filter(col => col.id !== coluna.id)
                        console.log('🗑️ [DEBUG] Renderizando select com colunas:', filteredColumns)
                        return filteredColumns.map(col => (
                          <option key={col.id} value={col.id}>
                            {col.nome} ({col.cards?.length || 0} contatos)
                          </option>
                        ))
                      })()}
                    </select>
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={coluna.cards && coluna.cards.length > 0 && !selectedTargetColumn}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {coluna.cards && coluna.cards.length > 0 ? 'Realocar e Excluir' : 'Excluir'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Estilos CSS para scroll cinza */}
      <style jsx>{`
        .custom-gray-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-gray-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-gray-scroll::-webkit-scrollbar-thumb {
          background: ${theme === 'dark' ? '#6b7280' : '#d1d5db'};
          border-radius: 3px;
        }
        
        .custom-gray-scroll::-webkit-scrollbar-thumb:hover {
          background: ${theme === 'dark' ? '#9ca3af' : '#9ca3af'};
        }
        
        /* Firefox */
        .custom-gray-scroll {
          scrollbar-width: thin;
          scrollbar-color: ${theme === 'dark' ? '#6b7280' : '#d1d5db'} transparent;
        }
      `}</style>
    </motion.div>
  )
}
