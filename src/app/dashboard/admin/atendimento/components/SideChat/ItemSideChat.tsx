'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Archive, 
  Eye, 
  EyeOff, 
  Trash2,
  MoreVertical,
  Heart
} from 'lucide-react'

import ButtonTransferir from './ButtonTransferir'
import LastMessageSideChat from './LastMessageSideChat'
import ChatIndicators from './ChatIndicators'

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
      whileHover={{ scale: 1.01 }}
      onClick={onSelect}
      className={`group relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
        chat.isSelected
          ? 'bg-gradient-to-r from-blue-500/10 via-blue-400/20 to-blue-500/10 backdrop-blur-sm border border-blue-300/30 shadow-lg shadow-blue-500/20 dark:from-blue-600/20 dark:via-blue-500/30 dark:to-blue-600/20 dark:border-blue-400/30'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
      } ${
        chat.isArchived ? 'opacity-60' : ''
      } ${
        chat.isHidden ? 'opacity-40' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
          {chat.avatar ? (
            <img 
              src={chat.avatar} 
              alt={chat.name}
              className={`w-12 h-12 rounded-full object-cover ${
                chat.isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''
              }`}
            />
          ) : (
            <div className={`w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 
                           flex items-center justify-center ${
                chat.isSelected ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' : ''
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
          {/* Nome e Timestamp */}
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium truncate ${
              chat.isSelected
                ? 'text-blue-700 dark:text-blue-300 font-semibold'
                : chat.lastMessage.isRead === false 
                  ? 'text-gray-900 dark:text-gray-100' 
                  : 'text-gray-700 dark:text-gray-300'
            }`}>
              {chat.name}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatTimestamp(chat.lastMessage.timestamp)}
            </span>
          </div>

          {/* Última Mensagem */}
          <LastMessageSideChat 
            message={chat.lastMessage}
            maxLength={45}
          />

          {/* Indicadores (Tags, Rating, Conexão, etc.) */}
          <div className="mt-1">
            <ChatIndicators 
              chat={chat}
              onTagsClick={onTagsClick}
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
          </div>
      </div>

      {/* Botões de Ação - Aparecem no hover (reduzidos) */}
      <motion.div
        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
                   transition-opacity flex items-center gap-0.5"
        whileHover={{ scale: 1.05 }}
      >

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
          className={`p-1 rounded border transition-colors ${
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
          className={`p-1 rounded border transition-colors ${
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
                     rounded border border-gray-300 dark:border-gray-600 transition-colors"
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
          className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-400/30 
                     transition-colors text-red-600"
          title="Deletar Chat"
        >
          <Trash2 className="w-2.5 h-2.5" />
        </motion.button>

        {/* Menu de 3 pontos (reduzido) */}
        <MoreVertical className="w-3 h-3 text-slate-400" />
      </motion.div>
    </motion.div>
  )
})

ItemSideChat.displayName = 'ItemSideChat'

export default ItemSideChat
