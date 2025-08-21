'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Inbox,
  Archive,
  Layers,
  Zap,
  Video,
  Monitor,
  DollarSign,
  FileSignature,
  Hash
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { useKanban } from '@/hooks/useKanban'
import { useWhatsAppData, WhatsAppChat } from '@/hooks/useWhatsAppData'
import AgendamentoModal from '@/app/dashboard/admin/atendimentos/components/modals/AgendamentoModal'
import OrcamentoModal from '@/app/dashboard/admin/atendimentos/components/modals/OrcamentoModal'
import AssinaturaModal from '@/app/dashboard/admin/atendimentos/components/modals/AssinaturaModal'
import VideoChamadaModal from '@/app/dashboard/admin/atendimentos/components/modals/VideoChamadaModal'
import LigacaoModal from '@/app/dashboard/admin/atendimentos/components/modals/LigacaoModal'
import CompartilharTelaModal from '@/app/dashboard/admin/atendimentos/components/modals/CompartilharTelaModal'
import AtendimentosTopBar from '../../atendimentos/components/AtendimentosTopBar'
import CriarCardModal from '../components/CriarCardModal'
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

// Componente de Área Droppable Ultra Sofisticado com Modal de Cores
function DroppableArea({ 
  coluna, 
  theme, 
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
  onOpenVideoChamada,
  onOpenLigacao,
  onOpenCompartilharTela
}: { 
  coluna: any, 
  theme: string,
  onDoubleClick: (coluna: any) => void,
  onDelete: (colunaId: string) => void,
  editingColumnId: string | null,
  editingColumnName: string,
  onSaveColumnName: (colunaId: string) => void,
  onEditingNameChange: (name: string) => void,
  onOpenColorModal: (coluna: any) => void,
  handleAddCard: (colunaId: string) => void,
  onOpenAgendamento: () => void,
  onOpenOrcamento: () => void,
  onOpenAssinatura: () => void,
  onOpenVideoChamada: () => void,
  onOpenLigacao: () => void,
  onOpenCompartilharTela: () => void
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
        
        {/* Barra de Progresso Sutil */}
        <div className={`h-1 rounded-full overflow-hidden ${
          theme === 'dark' ? 'bg-slate-700/30' : 'bg-gray-200/40'
        }`}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: coluna.cor }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((coluna.cards?.length || 0) * 10, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Área de Cards */}
      <div className="p-4 flex-1">
        <SortableContext
          items={coluna.cards?.map((card: any) => card.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {coluna.cards?.map((card: any) => (
              <SortableCard 
                key={card.id} 
                card={card} 
                theme={theme} 
                columnColor={coluna.cor}
                onOpenAgendamento={onOpenAgendamento}
                onOpenOrcamento={onOpenOrcamento}
                onOpenAssinatura={onOpenAssinatura}
                onOpenVideoChamada={onOpenVideoChamada}
                onOpenLigacao={onOpenLigacao}
                onOpenCompartilharTela={onOpenCompartilharTela}
              />
            ))}
          </div>
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



// Componente Card Sortable
function SortableCard({ 
  card, 
  theme, 
  columnColor, 
  onOpenAgendamento,
  onOpenOrcamento,
  onOpenAssinatura,
  onOpenVideoChamada,
  onOpenLigacao,
  onOpenCompartilharTela
}: { 
  card: any, 
  theme: string, 
  columnColor?: string,
  onOpenAgendamento: () => void,
  onOpenOrcamento: () => void,
  onOpenAssinatura: () => void,
  onOpenVideoChamada: () => void,
  onOpenLigacao: () => void,
  onOpenCompartilharTela: () => void
}) {
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
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-800/30 via-slate-800/20 to-slate-800/10 border-l-4 text-white backdrop-blur-xl'
          : 'bg-gradient-to-br from-white/60 via-white/40 to-white/20 text-gray-900 backdrop-blur-xl shadow-xl border-l-4'
      } ${
        isDragging ? 'opacity-50 transform rotate-2 scale-95' : 'hover:shadow-2xl hover:scale-[1.02]'
      }`}
      style={{
        ...style,
        userSelect: 'none',
        touchAction: 'none',
        ...(theme === 'dark' 
          ? {
              borderLeftColor: columnColor || '#475569',
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
            }
          : {
              borderLeftColor: columnColor || '#d1d5db',
              boxShadow: `0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)`
            }
        )
      }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: theme === 'dark'
          ? `0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`
          : `0 12px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)`
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Card inteiro é draggable - sem indicador visual */}
      <div className="flex-1">
        {/* Header do Card com Avatar Real */}
        <div className="flex items-center gap-3 mb-3">
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

        {/* Rodapé do Card com Ações do ChatArea */}
        <div className="flex flex-col gap-3">
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
              onClick={onOpenLigacao}
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
              onClick={onOpenVideoChamada}
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
              onClick={onOpenCompartilharTela}
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
              onClick={onOpenAgendamento}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                theme === 'dark' 
                  ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                  : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Agendar"
            >
              <Calendar className="w-3 h-3" />
            </motion.button>
            
            {/* Orçamento */}
            <motion.button 
              onClick={onOpenOrcamento}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                theme === 'dark' 
                  ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                  : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Orçamento"
            >
              <DollarSign className="w-3 h-3" />
            </motion.button>
            
            {/* Assinatura */}
            <motion.button 
              onClick={onOpenAssinatura}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                theme === 'dark' 
                  ? 'hover:bg-slate-600/50 text-slate-300 hover:text-white' 
                  : 'hover:bg-gray-200/50 text-gray-600 hover:text-gray-800'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Assinatura"
            >
              <FileSignature className="w-3 h-3" />
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
    </motion.div>
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
  
  // Hook customizado para Kanban - sem polling automático
  const [chats, setChats] = useState<WhatsAppChat[]>([])
  const [whatsappLoading, setWhatsappLoading] = useState(false)
  
  // Estados para modal de cores
  const [showColorModal, setShowColorModal] = useState(false)
  const [selectedColumnForColor, setSelectedColumnForColor] = useState<any>(null)
  
  // Estados para modais do ChatArea
  const [showAgendamentoModal, setShowAgendamentoModal] = useState(false)
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false)
  const [showAssinaturaModal, setShowAssinaturaModal] = useState(false)
  const [showVideoChamadaModal, setShowVideoChamadaModal] = useState(false)
  const [showLigacaoModal, setShowLigacaoModal] = useState(false)
  const [showCompartilharTelaModal, setShowCompartilharTelaModal] = useState(false)
  
  // Estados para edição do quadro
  const [editingQuadroTitle, setEditingQuadroTitle] = useState(false)
  const [editingQuadroName, setEditingQuadroName] = useState('')
  const [editingQuadroDescription, setEditingQuadroDescription] = useState(false)
  const [editingQuadroDescricao, setEditingQuadroDescricao] = useState('')
  
  // Função para carregar conversas manualmente
  const loadChatsManual = async () => {
    setWhatsappLoading(true)
    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      
      const response = await fetch(`${backendUrl}/api/whatsapp/chats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('📱 Conversas carregadas para Kanban:', data.length)
        
        // Aplicar a mesma lógica do useWhatsAppData para buscar fotos de perfil
        const transformedChats = await Promise.all(data.map(async (chat: any) => {
          let profilePictureUrl = null
          
          // Debug: verificar estrutura do chat
          console.log('🔍 Processing chat:', { chat, chatId: chat.id, chatIdType: typeof chat.id })
          
          // Extrair o ID correto do chat (pode estar em chat.id.id ou chat.id._serialized)
          let chatId = chat.id
          if (typeof chat.id === 'object') {
            chatId = chat.id.id || chat.id._serialized || chat.id.user || JSON.stringify(chat.id)
            console.log('🔍 Extracted chatId from object:', chatId)
          }
          
          // Buscar foto de perfil usando o endpoint correto da WAHA API
          try {
            const wahaApiUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'https://server.tappy.id/api'
            const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'tappyone-waha-2024-secretkey'
            const sessionName = `user_${user?.id}` // Usando user do contexto de auth
            
            console.log('🖼️ Fetching picture for chatId:', chatId)
            const pictureResponse = await fetch(`${wahaApiUrl}/${sessionName}/chats/${chatId}/picture`, {
              headers: {
                'X-Api-Key': wahaApiKey,
                'Content-Type': 'application/json'
              }
            })
            
            if (pictureResponse.ok) {
              const pictureData = await pictureResponse.json()
              profilePictureUrl = pictureData.url
              console.log(`✅ Profile picture loaded for ${chatId}:`, pictureData.url)
            } else {
              console.log(`⚠️ No profile picture for ${chatId}:`, pictureResponse.status)
            }
          } catch (pictureError) {
            console.log(`❌ Error loading picture for ${chatId}:`, pictureError)
          }
          
          return {
            ...chat,
            profilePictureUrl
          }
        }))
        
        setChats(transformedChats || [])
        
        // Feedback visual de sucesso
        if (data && data.length > 0) {
          console.log(`✅ ${data.length} conversas sincronizadas com sucesso!`)
        }
      } else {
        console.error('❌ Erro na resposta da API:', response.status)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error)
    } finally {
      setWhatsappLoading(false)
    }
  }
  
  const refreshData = () => {
    console.log('🔄 Atualizando dados do WhatsApp...')
    loadChatsManual()
  }
  
  // Funções auxiliares
  const getColunaName = (colunaId: string) => {
    const coluna = colunas.find(col => col.id === colunaId)
    return coluna?.nome || 'Coluna desconhecida'
  }
  
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    console.log(`🔔 ${type.toUpperCase()}: ${message}`)
    // TODO: Implementar toast notifications
  }
  
  // Handlers dos modais do ChatArea
  const handleAgendamentoSave = (data: any) => {
    console.log('📅 Agendamento salvo:', data)
    setShowAgendamentoModal(false)
  }
  
  const handleOrcamentoSave = (data: any) => {
    console.log('💰 Orçamento salvo:', data)
    setShowOrcamentoModal(false)
  }
  
  const handleAssinaturaSave = (data: any) => {
    console.log('📝 Assinatura salva:', data)
    setShowAssinaturaModal(false)
  }
  
  const handleVideoChamadaStart = (data: any) => {
    console.log('📹 Vídeo chamada iniciada:', data)
    setShowVideoChamadaModal(false)
  }
  
  const handleLigacaoStart = (data: any) => {
    console.log('📞 Ligação iniciada:', data)
    setShowLigacaoModal(false)
  }
  
  const handleCompartilharTelaStart = (data: any) => {
    console.log('🖥️ Compartilhamento de tela iniciado:', data)
    setShowCompartilharTelaModal(false)
  }
  
  // Função para obter dados do contato (mock)
  const getContactData = () => {
    return {
      nome: 'Contato Kanban',
      telefone: '+55 11 99999-9999'
    }
  }
  
  const [quadro, setQuadro] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [colunas, setColunas] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCard, setActiveCard] = useState<any>(null)
  const [activeColumn, setActiveColumn] = useState<any>(null)
  const [showCreateCardModal, setShowCreateCardModal] = useState(false)
  const [selectedColunaId, setSelectedColunaId] = useState<string>('')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [hasManualChanges, setHasManualChanges] = useState(false)
  const [cardMetadata, setCardMetadata] = useState<Record<string, any>>({})
  
  // Estados para edição de colunas
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingColumnName, setEditingColumnName] = useState('')
  
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
    setSelectedColumnForColor(coluna)
    setShowColorModal(true)
  }
  
  // Função para atualizar cor da coluna
  const handleUpdateColumnColor = async (newColor: string) => {
    if (!selectedColumnForColor) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kanban/coluna/${selectedColumnForColor.id}/color`, {
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
          col.id === selectedColumnForColor.id ? { ...col, cor: newColor } : col
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kanban/coluna/reorder`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kanban/card-movement`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kanban/${id}/metadata`, {
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
    // Se não há conversas, usar colunas vazias
    if (!chats || chats.length === 0) {
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

    // Mapear conversas para cards
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
      
      return {
        id: chatId,
        nome: chat.name || 'Contato sem nome',
        descricao: chat.lastMessage?.body || 'Sem mensagens',
        posicao: index + 1,
        tags: chat.lastMessage ? ['WhatsApp'] : ['Sem mensagem'],
        prazo: chat.timestamp || new Date().toISOString(),
        comentarios: 0,
        anexos: 0,
        responsavel: chat.name || 'Contato',
        avatar: avatar,
        phone: chatId ? chatId.split('@')[0] : 'N/A',
        isOnline: chat.lastMessage ? new Date(chat.timestamp).getTime() > Date.now() - 300000 : false
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
        totalCards: cards.length
      })
      
      // Se não há metadados OU não há mudanças manuais, usar distribuição automática
      if (!temMetadados || !hasManualChanges) {
        const cardsPerColumn = Math.ceil(cards.length / colunas.length)
        const startIndex = colunaIndex * cardsPerColumn
        const endIndex = startIndex + cardsPerColumn
        const cardsAutomaticos = cards.slice(startIndex, endIndex)
        console.log(`🎯 Distribuição automática para ${coluna.nome}:`, cardsAutomaticos.map(c => c.nome))
        return {
          ...coluna,
          cards: cardsAutomaticos
        }
      }
      
      // Se há metadados E mudanças manuais, combinar cards com e sem metadados
      const cardsSemMetadados = cards.filter(card => !cardMetadata[card.id])
      
      // Distribuir cards sem metadados igualmente entre as colunas
      const cardsSemMetadadosParaEstaColuna = cardsSemMetadados.filter((_, index) => 
        index % colunas.length === colunaIndex
      )
      
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kanban/column-edit`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kanban/column-delete`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kanban/quadros/${id}`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kanban/quadros/${id}`, {
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

  useEffect(() => {
    const loadQuadro = async () => {
      try {
        if (params.id && !quadro) { // Só carrega se não tiver quadro ainda
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

    if (loading && params.id) { // Só executa se estiver carregando
      loadQuadro()
    }
  }, [params.id, loading, quadro]) // Dependências controladas

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
  const filtrarConversas = (conversas: WhatsAppChat[]) => {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/kanban/column-create`, {
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
                    onDoubleClick={handleDoubleClickColumn}
                    onDelete={handleDeleteColumn}
                    editingColumnId={editingColumnId}
                    editingColumnName={editingColumnName}
                    onSaveColumnName={handleSaveColumnName}
                    onEditingNameChange={setEditingColumnName}
                    onOpenColorModal={handleOpenColorModal}
                    handleAddCard={handleAddCard}
                    onOpenAgendamento={() => setShowAgendamentoModal(true)}
                    onOpenOrcamento={() => setShowOrcamentoModal(true)}
                    onOpenAssinatura={() => setShowAssinaturaModal(true)}
                    onOpenVideoChamada={() => setShowVideoChamadaModal(true)}
                    onOpenLigacao={() => setShowLigacaoModal(true)}
                    onOpenCompartilharTela={() => setShowCompartilharTelaModal(true)}
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
        
        {/* DragOverlay para mostrar o item sendo arrastado */}
        <DragOverlay>
          {activeCard && (
            <div className="opacity-80">
              <SortableCard 
                card={activeCard} 
                theme={theme} 
                columnColor={activeCard.columnColor}
                onOpenAgendamento={() => setShowAgendamentoModal(true)}
                onOpenOrcamento={() => setShowOrcamentoModal(true)}
                onOpenAssinatura={() => setShowAssinaturaModal(true)}
                onOpenVideoChamada={() => setShowVideoChamadaModal(true)}
                onOpenLigacao={() => setShowLigacaoModal(true)}
                onOpenCompartilharTela={() => setShowCompartilharTelaModal(true)}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
      
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
        currentColor={selectedColumnForColor?.cor || '#3b82f6'}
        onColorSelect={handleUpdateColumnColor}
        columnName={selectedColumnForColor?.nome || ''}
      />
      
      {/* Modais do ChatArea */}
      <AgendamentoModal
        isOpen={showAgendamentoModal}
        onClose={() => setShowAgendamentoModal(false)}
        onSave={handleAgendamentoSave}
        contactData={getContactData()}
      />
      
      <OrcamentoModal
        isOpen={showOrcamentoModal}
        onClose={() => setShowOrcamentoModal(false)}
        onSave={handleOrcamentoSave}
        contactData={getContactData()}
      />
      
      <AssinaturaModal
        isOpen={showAssinaturaModal}
        onClose={() => setShowAssinaturaModal(false)}
        onSave={handleAssinaturaSave}
        contactData={getContactData()}
      />
      
      <VideoChamadaModal
        isOpen={showVideoChamadaModal}
        onClose={() => setShowVideoChamadaModal(false)}
        onStartCall={handleVideoChamadaStart}
        contactData={getContactData()}
      />
      
      <LigacaoModal
        isOpen={showLigacaoModal}
        onClose={() => setShowLigacaoModal(false)}
        onStartCall={handleLigacaoStart}
        contactData={getContactData()}
      />
      
      <CompartilharTelaModal
        isOpen={showCompartilharTelaModal}
        onClose={() => setShowCompartilharTelaModal(false)}
        onStartShare={handleCompartilharTelaStart}
        contactData={getContactData()}
      />
    </div>
  )
}
