'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  Trash2,
  GripVertical,
  DollarSign,
  Calendar,
  FileSignature
} from 'lucide-react'
import KanbanCardItem from './KanbanCardItem'

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
  onOpenTags?: (card: any) => void
  onOpenChat?: (card: any) => void
  onOpenLigacao?: () => void
  onOpenCompartilharTela?: () => void
  onOpenConexaoFila?: (card: any) => void
  getColumnStats?: (columnId: string) => any
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
  getColumnStats
}: KanbanColumnProps) {
  
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
      className={`w-80 min-h-[650px] rounded-2xl border transition-all duration-500 ${
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
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Cards Container com Scroll */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
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
          <div className="space-y-3">
            {coluna.cards?.map((card: any) => (
              <KanbanCardItem
                key={card.id}
                card={{
                  ...card,
                  agendamentosCount: agendamentosCount[card.id],
                  orcamentosCount: typeof orcamentosCount === 'object' ? orcamentosCount[card.id] : 0,
                  assinaturasCount: assinaturasCount[card.id],
                  anotacoesCount: anotacoesCount[card.id],
                  tagsCount: tagsCount[card.id],
                  ticketsCount: ticketsCount[card.id],
                  agentesCount: agentesCount[card.id]
                }}
                theme={theme}
                columnColor={coluna.cor}
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
    </motion.div>
  )
}
