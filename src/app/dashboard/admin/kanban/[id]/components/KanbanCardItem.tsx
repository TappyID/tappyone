'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Calendar, 
  DollarSign, 
  StickyNote, 
  Ticket, 
  Tag, 
  MessageSquare,
  User,
  Clock,
  Phone,
  FileText,
  Bot,
  Settings
} from 'lucide-react'
import { useChatPicture } from '@/hooks/useChatPicture'
import LastMessageSideChat from '../../../atendimento/components/SideChat/LastMessageSideChat'
import { useKanbanIndicators } from '../hooks/useKanbanIndicators'
import { useChatAgente } from '@/hooks/useChatAgente'
import AgenteSelectionModal from '../../../atendimento/components/FooterChatArea/modals/AgenteSelectionModal'

interface KanbanCardItemProps {
  card: {
    id: string
    nome?: string
    name?: string
    phone?: string
    lastMessage?: {
      text?: string
      body?: string
      timestamp?: number
      fromMe?: boolean
    }
    profilePictureUrl?: string
    unreadCount?: number
  }
  theme: string
  columnColor: string
  // Contadores opcionais
  orcamentosCount?: any
  agendamentosCount?: any
  anotacoesCount?: any
  ticketsCount?: any
  tagsCount?: any
  // Handlers
  onOpenOrcamento?: (card: any) => void
  onOpenAgendamento?: (card: any) => void
  onOpenAnotacoes?: (card: any) => void
  onOpenTickets?: (card: any) => void
  onOpenTags?: (card: any) => void
  onOpenAssinatura?: (card: any) => void
  onOpenChat?: (card: any) => void
}

export default function KanbanCardItem({
  card,
  theme,
  columnColor,
  onOpenOrcamento,
  onOpenAgendamento,
  onOpenAnotacoes,
  onOpenTickets,
  onOpenTags,
  onOpenAssinatura,
  onOpenChat,
  orcamentosCount,
  agendamentosCount,
  anotacoesCount,
  ticketsCount,
  tagsCount
}: KanbanCardItemProps) {
  
  // Buscar foto de perfil do WAHA - igual ItemSideChat
  const { pictureUrl, isLoading: isLoadingPicture } = useChatPicture(card.id)
  const profileImage = card.profilePictureUrl || pictureUrl
  
  // Estados locais
  const [isHovered, setIsHovered] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
  // Hook para buscar contadores dos indicadores
  // IMPORTANTE: Passar o ID completo com @c.us para o hook
  const chatIdForIndicators = card.id?.includes('@c.us') ? card.id : 
                              card.phone ? `${card.phone}@c.us` : 
                              card.id
  console.log('🎯 [KanbanCardItem] ChatId para indicadores:', chatIdForIndicators)
  const { counts, loading: loadingIndicators } = useKanbanIndicators(chatIdForIndicators)
  
  // Debug: Mostrar os dados do card e counts
  console.log('🔍 [KanbanCardItem] Card:', {
    id: card.id,
    phone: card.phone,
    name: card.nome || card.name
  })
  console.log('🔍 [KanbanCardItem] Counts:', counts)

  // Hook para status do agente IA
  const { 
    ativo: agenteAtivo, 
    agente: agenteAtual,
    activateAgent,
    deactivateAgent,
    refetch: refetchAgente 
  } = useChatAgente(chatIdForIndicators)

  // Estado para modal de seleção de agente
  const [showAgenteModal, setShowAgenteModal] = useState(false)

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

  // Formatar timestamp para exibição
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Agora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('pt-BR')
  }

  // Formatar telefone
  const formatPhone = (phone?: string) => {
    if (!phone) return ''
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')
    // Formata como (11) 99999-9999
    if (cleaned.length === 13) { // 55 11 999999999
      return `(${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
    }
    if (cleaned.length === 11) { // 11 999999999
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  // Formatadores
  const formatTime = (timestamp: number | undefined): string => {
    if (!timestamp) return ''
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } else if (hours < 48) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }
  }

  const getMessage = (): string => {
    const msg = card.lastMessage?.text || card.lastMessage?.body
    if (!msg || msg.trim() === '') return ''
    return msg.length > 50 ? msg.substring(0, 50) + '...' : msg
  }

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      className={`relative group select-none ${
        isDragging ? 'z-50' : ''
      }`}
      style={{
        ...style, // Estilo do sortable
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // 🎭 ANIMAÇÕES FLUIDAS AVANÇADAS
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: isDragging ? 0.15 : 1, // Opacity super fraco quando dragging
        y: 0, 
        scale: isDragging ? 0.98 : (isHovered ? 1.02 : 1),
        rotateZ: isDragging ? 3 : 0
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        mass: 0.8
      }}
      // 🌊 EFEITOS VISUAIS DURANTE DRAG
      whileDrag={{
        scale: 1.05,
        rotateZ: 5,
        opacity: 0.9,
        zIndex: 1000
      }}
    >
      {/* 👻 FANTASMA AVANÇADO - Fica no lugar original */}
      {isDragging && (
        <motion.div
          className={`absolute inset-0 rounded-2xl pointer-events-none ${
            theme === 'dark'
              ? 'bg-slate-800/15'
              : 'bg-white/30'
          }`}
          style={{
            backdropFilter: 'blur(12px)',
            background: `linear-gradient(135deg, ${columnColor}08, ${columnColor}03)`,
          }}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: 0.3,
            scale: 0.98,
            boxShadow: `0 0 40px ${columnColor}10`
          }}
          transition={{ duration: 0.2 }}
        />
      )}
      
      <div
        {...listeners}
        className={`relative p-3 rounded-2xl overflow-hidden transition-all duration-150 ease-out cursor-grab active:cursor-grabbing ${
          theme === 'dark'
            ? 'bg-slate-800/60 hover:bg-slate-800/80'
            : 'bg-white hover:bg-white'
        } ${isDragging ? 'rotate-2 scale-95 opacity-60' : 'hover:scale-[1.02]'}`}
        style={{
         
          borderRadius: '20px',
          filter: !isDragging && !isHovered ? `drop-shadow(0 4px 15px rgba(0,0,0,0.05))` : 'none'
        }}
      >
        {/* 🎨 Barra de Gradiente Lateral Esquerda - SÓ VISUAL */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
          style={{
            background: `linear-gradient(180deg, ${columnColor}20 0%, ${columnColor}60 20%, ${columnColor} 40%, ${columnColor} 60%, ${columnColor}60 80%, ${columnColor}20 100%)`,
            borderRadius: '8px 0 0 8px'
          }}
        />
        
        <div className="flex items-start gap-2.5 mb-2">
          {/* Profile Picture - IGUAL ItemSideChat */}
          <div className="relative flex-shrink-0">
            {/* Foto do WAHA ou avatar fornecido */}
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={(card.nome || card.name || 'Contact')}
                className="w-10 h-10 rounded-full object-cover shadow-lg" 
              /> 
            ) : null}
            
            {/* Fallback avatar com inicial */}
            <div className={`${profileImage ? 'hidden' : ''} w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg`}>
              <span className="text-sm font-bold text-white">
                {(card.nome || card.name || 'C').charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Badge de mensagens não lidas */}
            {card.unreadCount && card.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-[10px] text-white font-bold">
                  {card.unreadCount > 99 ? '99+' : card.unreadCount}
                </span>
              </div>
            )}
          </div>

          {/* Nome, Telefone e Última Mensagem */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              {/* Nome do contato - SEM DRAG - só visual */}
              <h3 
                className={`font-semibold text-[10px] leading-tight select-none transition-all duration-200 hover:scale-105 ${
                  theme === 'dark' ? 'text-white hover:text-blue-300' : 'text-gray-900 hover:text-blue-600'
                }`} 
                style={{
                  textShadow: isDragging ? `0 0 8px ${columnColor}60` : 'none'
                }}
                title={card.nome || card.name || 'Sem nome'}>
                {(card.nome || card.name || 'Sem nome').length > 14 
                  ? `${(card.nome || card.name || 'Sem nome').substring(0, 14)}...`
                  : (card.nome || card.name || 'Sem nome')
                }
              </h3>
              
              {/* Badge de Tag no lado direito - TESTE + REAL */}
              {(counts.tags > 0 || Math.random() > 0.7) && (
                <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-medium max-w-[60px] truncate ${
                  theme === 'dark' 
                    ? 'bg-purple-500/20 text-purple-300' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {(counts as any).tagNames?.[0] || ['VIP', 'Cliente', 'Suporte'][Math.floor(Math.random() * 3)]}
                </span>
              )}
            </div>
            
            {/* Telefone/Chat ID */}
            <div className="-mt-2">
              <span className={`text-[9px] ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {(card as any).chatId || card.phone || (card as any).telefone || card.id || 'Sem telefone'}
              </span>
            </div>
            
            {/* Última Mensagem - usando componente do atendimento */}
           
          </div>
        </div>


        {/* Footer com ícones à esquerda e horário à direita */}
        <div className="flex items-center justify-between mt-2 pt-2">
          {/* Ícones de Ação - à esquerda */}
          <div 
            className="flex items-center gap-1" 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenOrcamento?.(card)
              }}
              className={`p-1 rounded-lg transition-all relative ${
                theme === 'dark'
                  ? 'hover:bg-green-500/20 text-green-400'
                  : 'hover:bg-green-50 text-green-600'
              }`}
              title="Orçamentos"
            >
              <DollarSign className="w-3.5 h-3.5" />
              {counts.orcamentos > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {counts.orcamentos > 99 ? '99+' : counts.orcamentos}
                </span>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenAgendamento?.(card)
              }}
              className={`p-1 rounded-lg transition-all relative ${
                theme === 'dark'
                  ? 'hover:bg-blue-500/20 text-blue-400'
                  : 'hover:bg-blue-50 text-blue-600'
              }`}
              title="Agendamentos"
            >
              <Calendar className="w-3.5 h-3.5" />
              {counts.agendamentos > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {counts.agendamentos > 99 ? '99+' : counts.agendamentos}
                </span>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenAnotacoes?.(card)
              }}
              className={`p-1 rounded-lg transition-all relative ${
                theme === 'dark'
                  ? 'hover:bg-yellow-500/20 text-yellow-400'
                  : 'hover:bg-yellow-50 text-yellow-600'
              }`}
              title="Anotações"
            >
              <StickyNote className="w-3.5 h-3.5" />
              {counts.anotacoes > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[10px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {counts.anotacoes > 99 ? '99+' : counts.anotacoes}
                </span>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenTickets?.(card)
              }}
              className={`p-1 rounded-lg transition-all relative ${
                theme === 'dark'
                  ? 'hover:bg-red-500/20 text-red-400'
                  : 'hover:bg-red-50 text-red-600'
              }`}
              title="Tickets"
            >
              <Ticket className="w-3.5 h-3.5" />
              {counts.tickets > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {counts.tickets > 99 ? '99+' : counts.tickets}
                </span>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenTags?.(card)
              }}
              className={`p-1 rounded-lg transition-all relative ${
                theme === 'dark'
                  ? 'hover:bg-purple-500/20 text-purple-400'
                  : 'hover:bg-purple-50 text-purple-600'
              }`}
              title="Tags"
            >
              <Tag className="w-3.5 h-3.5" />
              {counts.tags > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {counts.tags > 99 ? '99+' : counts.tags}
                </span>
              )}
            </button>

            {/* Botão Agente IA */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowAgenteModal(true)
              }}
              className={`p-1 rounded-lg transition-all relative ${
                theme === 'dark'
                  ? 'hover:bg-blue-500/20 text-blue-400'
                  : 'hover:bg-blue-50 text-blue-600'
              }`}
              title="Agente IA"
            >
              <Bot className="w-3.5 h-3.5" />
              {/* Pin Badge - Verde se ativo, Vermelho se inativo */}
              <span className={`absolute -top-1 -right-1 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[12px] h-[12px] flex items-center justify-center shadow-sm ${
                agenteAtivo ? 'bg-green-500' : 'bg-red-500'
              }`}>
                ●
              </span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenChat?.(card)
              }}
              className={`p-1 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'hover:bg-orange-500/20 text-orange-400'
                  : 'hover:bg-orange-50 text-orange-600'
              }`}
              title="Abrir Chat"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horário da última mensagem - à direita */}
          <Settings className={`w-3 h-3 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
        </div>
      </div>

      {/* Modal de Seleção de Agente */}
      <AgenteSelectionModal
        isOpen={showAgenteModal}
        onClose={() => setShowAgenteModal(false)}
        onSelect={async (agente) => {
          console.log('🤖 Agente selecionado no Kanban:', agente)
          try {
            if (agente) {
              // Ativar agente
              await activateAgent(agente.id)
              console.log('✅ Agente ativado com sucesso no Kanban!')
            } else {
              // Desativar agente
              await deactivateAgent()
              console.log('✅ Agente desativado com sucesso no Kanban!')
            }
            // Recarregar dados do agente após seleção
            refetchAgente()
          } catch (error) {
            console.error('❌ Erro ao ativar/desativar agente no Kanban:', error)
          }
        }}
        agenteAtual={agenteAtual ? { 
          ...agenteAtual, 
          cor: '#3b82f6',
          descricao: agenteAtual.descricao || 'Agente IA'
        } : null}
        chatId={chatIdForIndicators}
      />
    </motion.div>
  )
}
