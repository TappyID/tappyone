'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Tag,
  Star,
  Wifi,
  Kanban,
  Users,
  Ticket
} from 'lucide-react'

interface ChatIndicatorsProps {
  // Dados do chat
  chat: {
    // Conexão
    isOnline?: boolean
    connectionStatus?: 'connected' | 'disconnected' | 'connecting'
    
    // Tags
    tags?: Array<{
      id: string
      nome: string
      cor?: string
    }>
    
    // Rating
    rating?: number
    
    // Kanban (status do atendimento)
    kanbanStatus?: {
      id: string
      nome: string
      cor?: string
    }
    
    // Fila
    fila?: {
      id: string
      nome: string
      cor?: string
    }
    
    // Ticket
    ticketStatus?: {
      id: string
      nome: string
      cor?: string
    }
  }
  
  // Callbacks
  onTagsClick: (e: React.MouseEvent) => void
  onRatingClick?: (e: React.MouseEvent) => void
  onKanbanClick?: (e: React.MouseEvent) => void
  onFilaClick?: (e: React.MouseEvent) => void
  onTicketClick?: (e: React.MouseEvent) => void
}

export default function ChatIndicators({
  chat,
  onTagsClick,
  onRatingClick,
  onKanbanClick,
  onFilaClick,
  onTicketClick
}: ChatIndicatorsProps) {

  // Função para obter cor da conexão
  const getConnectionColor = () => {
    switch (chat.connectionStatus) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'disconnected': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  // Função para renderizar rating como estrelas
  const renderRatingStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-2 h-2 fill-yellow-400 text-yellow-400" />
      )
    }
    
    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-2 h-2 text-yellow-400" />
      )
    }
    
    return stars
  }

  return (
    <div className="flex items-center gap-1">
      {/* Indicador de Conexão */}
      {(chat.isOnline || chat.connectionStatus) && (
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`p-1 rounded transition-colors ${getConnectionColor()}`}
          title={`Conexão: ${chat.connectionStatus || 'online'}`}
        >
          <Wifi className="w-3 h-3" />
        </motion.div>
      )}

      {/* Botão de Tags */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onTagsClick}
        className="relative p-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded 
                   border border-emerald-400/30 transition-colors"
        title={`Gerenciar Tags${chat.tags?.length ? ` (${chat.tags.length})` : ''}`}
      >
        <Tag className="w-3 h-3 text-emerald-600" />
        
        {/* Badge de quantidade de tags */}
        {(chat.tags && chat.tags.length > 0) && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full 
                          border border-white dark:border-gray-800 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {chat.tags.length > 9 ? '9+' : chat.tags.length}
            </span>
          </div>
        )}
      </motion.button>

      {/* Botão de Rating */}
      {(chat.rating && chat.rating > 0) && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRatingClick}
          className="relative p-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded 
                     border border-yellow-400/30 transition-colors"
          title={`Rating: ${chat.rating}/5`}
        >
          <div className="flex items-center gap-0.5">
            {renderRatingStars(chat.rating)}
          </div>
        </motion.button>
      )}

      {/* Indicador de Kanban */}
      {chat.kanbanStatus && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onKanbanClick}
          className="p-1 rounded border transition-colors"
          style={{ 
            backgroundColor: `${chat.kanbanStatus.cor}20`,
            borderColor: `${chat.kanbanStatus.cor}40`
          }}
          title={`Kanban: ${chat.kanbanStatus.nome}`}
        >
          <Kanban className="w-3 h-3" style={{ color: chat.kanbanStatus.cor }} />
        </motion.button>
      )}

      {/* Indicador de Fila */}
      {chat.fila && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onFilaClick}
          className="p-1 bg-blue-500/20 hover:bg-blue-500/30 rounded 
                     border border-blue-400/30 transition-colors"
          title={`Fila: ${chat.fila.nome}`}
        >
          <Users className="w-3 h-3 text-blue-600" />
        </motion.button>
      )}

      {/* Indicador de Ticket */}
      {chat.ticketStatus && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onTicketClick}
          className="p-1 rounded border transition-colors"
          style={{ 
            backgroundColor: `${chat.ticketStatus.cor}20`,
            borderColor: `${chat.ticketStatus.cor}40`
          }}
          title={`Status: ${chat.ticketStatus.nome}`}
        >
          <Ticket className="w-3 h-3" style={{ color: chat.ticketStatus.cor }} />
        </motion.button>
      )}
    </div>
  )
}
