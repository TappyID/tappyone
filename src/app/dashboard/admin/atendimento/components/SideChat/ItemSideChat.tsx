'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Archive, 
  Eye,
  EyeOff, 
  Trash2,
  Heart
} from 'lucide-react'

import ButtonTransferir from './ButtonTransferir'
import LastMessageSideChat from './LastMessageSideChat'
import ChatIndicators from './ChatIndicators'

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
  if (days < 7) return `${days}d`
  
  // Para mais de uma semana, mostrar data
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  })
}

interface ItemSideChatProps {
  chat: {
    id: string
    name: string
    avatar?: string
    lastMessage: {
      type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call'
      content: string
      timestamp: number
      sender: 'user' | 'agent'
      isRead?: boolean
    }
    // Dados dos indicadores
    tags?: Array<{
      id: string
      nome: string
      cor?: string
    }>
    agendamentos?: Array<{
      id: string
      titulo: string
      status: string
    }>
    orcamentos?: Array<{
      id: string
      titulo: string
      status: string
    }>
    tickets?: Array<{
      id: string
      titulo: string
      status: string
    }>
    rating?: number
    isOnline?: boolean
    connectionStatus?: 'connected' | 'disconnected' | 'connecting'
    kanbanStatus?: {
      id: string
      nome: string
      cor?: string
    }
    fila?: {
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
    isSelected?: boolean
    isArchived?: boolean
    isHidden?: boolean
    isFavorite?: boolean
    unreadCount?: number
  }
  
  // Callbacks
  onSelect: () => void
  onTagsClick: (e: React.MouseEvent) => void
  onTransferClick: (e: React.MouseEvent) => void
  onArchiveClick: (e: React.MouseEvent) => void
  onHideClick: (e: React.MouseEvent) => void
  onDeleteClick: (e: React.MouseEvent) => void
  onFavoriteClick: (e: React.MouseEvent) => void
}

const ItemSideChat = React.forwardRef<HTMLDivElement, ItemSideChatProps>(({
  chat,
  onSelect,
  onTagsClick,
  onTransferClick,
  onArchiveClick,
  onHideClick,
  onDeleteClick,
  onFavoriteClick
}, ref) => {
  
  // Formatação do timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Agora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className={`group relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
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
      {/* Avatar */}
      <div className="relative flex-shrink-0">
          {chat.avatar ? (
            <img 
              src={chat.avatar} 
              alt={chat.name}
              className={`w-12 h-12 rounded-full object-cover ${
                chat.isSelected ? 'ring-2 ring-blue-400' : ''
              }`}
            />
          ) : (
            <div className={`w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 
                           flex items-center justify-center ${
                chat.isSelected ? 'ring-2 ring-blue-400' : ''
              }`}>
              <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                {chat.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Badge de mensagens não lidas */}
          {(chat.unreadCount && chat.unreadCount > 0) && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full 
                           border border-white dark:border-gray-800 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </span>
            </div>
          )}
      </div>

      {/* Informações do Chat */}
      <div className="flex-1 min-w-0">
          {/* Nome e Badge */}
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium truncate ${
              chat.isSelected
                ? 'text-blue-700 dark:text-blue-300 font-semibold'
                : chat.lastMessage.isRead === false 
                  ? 'text-gray-900 dark:text-gray-100' 
                  : 'text-gray-600 dark:text-gray-300'
            }`}>
              {chat.name.length > 15 ? `${chat.name.substring(0, 15)}...` : chat.name}
            </h3>
            {/* Contador de não lidas */}
            {chat.unreadCount && chat.unreadCount > 0 && (
              <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </div>
            )}
          </div>

          {/* Última Mensagem */}
          <LastMessageSideChat 
            message={chat.lastMessage}
            maxLength={6}
          />

      </div>

      {/* Botões de Ação + Indicadores - Aparecem no hover ou quando ativo */}
      <motion.div
        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-opacity flex items-center gap-1 ${
          chat.isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        whileHover={{ scale: 1.05 }}
      >
        {/* Indicadores (Tags, Rating, Conexão, etc.) */}
        <ChatIndicators 
          chat={chat}
          onTagsClick={onTagsClick}
          onAgendamentosClick={(e) => {
            e.stopPropagation()
            console.log('📅 Agendamentos clicados:', chat.agendamentos)
          }}
          onOrcamentosClick={(e) => {
            e.stopPropagation()
            console.log('💰 Orçamentos clicados:', chat.orcamentos)
          }}
          onTicketsClick={(e) => {
            e.stopPropagation()
            console.log('🎫 Tickets clicados:', chat.tickets)
          }}
          onRatingClick={(e) => {
            e.stopPropagation()
            console.log('⭐ Rating clicado:', chat.rating)
          }}
          onKanbanClick={(e) => {
            e.stopPropagation()
            console.log('📋 Kanban clicado:', chat.kanbanStatus)
          }}
          onFilaClick={(e) => {
            e.stopPropagation()
            console.log('👥 Fila clicada:', chat.fila)
          }}
          onTicketClick={(e) => {
            e.stopPropagation()
            console.log('🎫 Ticket clicado:', chat.ticketStatus)
          }}
        />

        {/* Botão de Transferir */}
        <ButtonTransferir
          onClick={onTransferClick}
          isTransferred={chat.isTransferred}
          transferredTo={chat.transferredTo}
        />

        {/* Botão Favoritar */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onFavoriteClick}
          className={`p-1 rounded-sm border transition-colors ${
            chat.isFavorite
              ? 'bg-red-500/20 hover:bg-red-500/30 border-red-400/30 text-red-600'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
          }`}
          title={chat.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={`w-2.5 h-2.5 ${chat.isFavorite ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Botão Arquivar (reduzido) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onArchiveClick}
          className={`p-1 rounded-sm border transition-colors ${
            chat.isArchived
              ? 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-400/30 text-orange-600'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
          }`}
          title={chat.isArchived ? 'Desarquivar' : 'Arquivar'}
        >
          <Archive className="w-2.5 h-2.5" />
        </motion.button>

        {/* Botão Ocultar/Visualizar (reduzido) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onHideClick}
          className="p-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 
                     rounded-sm border border-gray-300 dark:border-gray-600 transition-colors"
          title={chat.isHidden ? 'Mostrar' : 'Ocultar'}
        >
          {chat.isHidden ? (
            <Eye className="w-2.5 h-2.5" />
          ) : (
            <EyeOff className="w-2.5 h-2.5" />
          )}
        </motion.button>

        {/* Botão Deletar (reduzido) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDeleteClick}
          className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded-sm border border-red-400/30 
                     transition-colors text-red-600"
          title="Deletar Chat"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </motion.button>

      </motion.div>
    </motion.div>
  )
})

ItemSideChat.displayName = 'ItemSideChat'

export default ItemSideChat
