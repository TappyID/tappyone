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
  FileText
} from 'lucide-react'
import { useChatPicture } from '@/hooks/useChatPicture'
import LastMessageSideChat from '../../../atendimento/components/SideChat/LastMessageSideChat'

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
  // Contadores - igual oldpage
  orcamentosCount?: Record<string, number>
  agendamentosCount?: Record<string, number>
  anotacoesCount?: Record<string, number>
  ticketsCount?: Record<string, number>
  tagsCount?: Record<string, number>
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
  orcamentosCount,
  agendamentosCount,
  anotacoesCount,
  ticketsCount,
  tagsCount,
  onOpenChat,
  onOpenOrcamento,
  onOpenAgendamento,
  onOpenAnotacoes,
  onOpenTickets,
  onOpenTags,
  onOpenAssinatura
}: KanbanCardItemProps) {
  
  // Buscar foto de perfil do WAHA - igual ItemSideChat
  const { pictureUrl, isLoading: isLoadingPicture } = useChatPicture(card.id)
  const profileImage = card.profilePictureUrl || pictureUrl
  const [isHovered, setIsHovered] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

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
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-50' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`relative p-3 rounded-xl transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/50'
            : 'bg-white hover:bg-gray-50 border border-gray-200'
        } ${isDragging ? 'rotate-2 scale-95' : 'hover:scale-[1.02]'}`}
        style={{
          borderLeft: `3px solid ${columnColor}`,
          boxShadow: isHovered
            ? theme === 'dark'
              ? '0 10px 30px rgba(0,0,0,0.5)'
              : '0 10px 30px rgba(0,0,0,0.1)'
            : '',
        }}
      >
        {/* Header - Avatar, Nome e Info */}
        <div className="flex items-start gap-2.5 mb-2">
          {/* Profile Picture - IGUAL ItemSideChat */}
          <div className="relative flex-shrink-0">
            {/* Foto do WAHA ou avatar fornecido */}
            {profileImage ? (
              <img 
                src={profileImage} 
                alt={card.nome || card.name || 'Contact'}
                className="w-10 h-10 rounded-full object-cover" 
              /> 
            ) : null}
            
            {/* Fallback avatar com inicial */}
            <div className={`${profileImage ? 'hidden' : ''} w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold`}>
              <span className="text-sm font-bold text-white">
                {(card.nome || card.name || 'C').charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Badge de mensagens não lidas */}
            {card.unreadCount && card.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-[10px] text-white font-bold">
                  {card.unreadCount > 99 ? '99+' : card.unreadCount}
                </span>
              </div>
            )}
          </div>

          {/* Nome, Telefone e Última Mensagem */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              {/* Nome do contato - limitado a 14 caracteres */}
              <h3 className={`font-semibold text-sm leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`} title={card.nome || card.name || 'Sem nome'}>
                {(card.nome || card.name || 'Sem nome').length > 14 
                  ? `${(card.nome || card.name || 'Sem nome').substring(0, 14)}...`
                  : (card.nome || card.name || 'Sem nome')
                }
              </h3>
              <span className={`text-[10px] ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {formatTime(card.lastMessage?.timestamp)}
              </span>
            </div>
            
            {/* Última Mensagem - usando componente do atendimento */}
            <div className="text-xs">
              <LastMessageSideChat 
                message={card.lastMessage} 
                maxLength={60}
              />
            </div>
          </div>
        </div>


        {/* Footer com ícones à esquerda e horário à direita */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/10">
          {/* Ícones de Ação - à esquerda */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenOrcamento?.(card)
              }}
              className={`p-1 rounded transition-all ${
                theme === 'dark'
                  ? 'hover:bg-green-500/20 text-green-400'
                  : 'hover:bg-green-50 text-green-600'
              }`}
              title="Orçamentos"
            >
              <DollarSign className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenAgendamento?.(card)
              }}
              className={`p-1 rounded transition-all ${
                theme === 'dark'
                  ? 'hover:bg-blue-500/20 text-blue-400'
                  : 'hover:bg-blue-50 text-blue-600'
              }`}
              title="Agendamentos"
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenAnotacoes?.(card)
              }}
              className={`p-1 rounded transition-all ${
                theme === 'dark'
                  ? 'hover:bg-yellow-500/20 text-yellow-400'
                  : 'hover:bg-yellow-50 text-yellow-600'
              }`}
              title="Anotações"
            >
              <StickyNote className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenTickets?.(card)
              }}
              className={`p-1 rounded transition-all ${
                theme === 'dark'
                  ? 'hover:bg-red-500/20 text-red-400'
                  : 'hover:bg-red-50 text-red-600'
              }`}
              title="Tickets"
            >
              <Ticket className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenTags?.(card)
              }}
              className={`p-1 rounded transition-all ${
                theme === 'dark'
                  ? 'hover:bg-purple-500/20 text-purple-400'
                  : 'hover:bg-purple-50 text-purple-600'
              }`}
              title="Tags"
            >
              <Tag className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenAssinatura?.(card)
              }}
              className={`p-1 rounded transition-all ${
                theme === 'dark'
                  ? 'hover:bg-cyan-500/20 text-cyan-400'
                  : 'hover:bg-cyan-50 text-cyan-600'
              }`}
              title="Assinaturas"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenChat?.(card)
              }}
              className={`p-1 rounded transition-all ${
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
          <span className={`text-xs ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {formatTime(card.lastMessage?.timestamp) || '12:15'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
