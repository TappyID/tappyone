'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Archive, 
  Eye, 
  EyeOff, 
  Trash2,
  MoreVertical 
} from 'lucide-react'

import ButtonTagSideChat from './ButtonTagSideChat'
import ButtonRating from './ButtonRating'
import ButtonTransferir from './ButtonTransferir'
import LastMessageSideChat from './LastMessageSideChat'

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
    tags?: Array<{
      id: string
      nome: string
      cor?: string
    }>
    rating?: number
    isTransferred?: boolean
    transferredTo?: {
      nome: string
      avatar?: string
    }
    isSelected?: boolean
    isArchived?: boolean
    isHidden?: boolean
    unreadCount?: number
  }
  
  // Callbacks
  onSelect: () => void
  onTagsClick: (e: React.MouseEvent) => void
  onTransferClick: (e: React.MouseEvent) => void
  onArchiveClick: (e: React.MouseEvent) => void
  onHideClick: (e: React.MouseEvent) => void
  onDeleteClick: (e: React.MouseEvent) => void
}

export default function ItemSideChat({
  chat,
  onSelect,
  onTagsClick,
  onTransferClick,
  onArchiveClick,
  onHideClick,
  onDeleteClick
}: ItemSideChatProps) {
  
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`group relative p-4 border-b border-gray-200 dark:border-gray-700 
                  cursor-pointer transition-all duration-200 ${
        chat.isSelected 
          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      } ${
        chat.isArchived ? 'opacity-60' : ''
      } ${
        chat.isHidden ? 'opacity-40' : ''
      }`}
      onClick={onSelect}
    >
      {/* Conteúdo Principal */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {chat.avatar ? (
            <img 
              src={chat.avatar} 
              alt={chat.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 
                           flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                {chat.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Badge de mensagens não lidas */}
          {chat.unreadCount && chat.unreadCount > 0 && (
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
              chat.lastMessage.isRead === false 
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

          {/* Rating */}
          {chat.rating && (
            <div className="mt-2">
              <ButtonRating rating={chat.rating} />
            </div>
          )}
        </div>
      </div>

      {/* Botões de Ação - Aparecem no hover */}
      <motion.div
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
                   transition-opacity flex items-center gap-1"
        whileHover={{ scale: 1.05 }}
      >
        {/* Botão de Tags */}
        <ButtonTagSideChat
          onClick={onTagsClick}
          tags={chat.tags}
        />

        {/* Botão de Transferir */}
        <ButtonTransferir
          onClick={onTransferClick}
          isTransferred={chat.isTransferred}
          transferredTo={chat.transferredTo}
        />

        {/* Botão Arquivar */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onArchiveClick}
          className={`p-2 rounded-lg border transition-colors ${
            chat.isArchived
              ? 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-400/30 text-orange-600'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
          }`}
          title={chat.isArchived ? 'Desarquivar' : 'Arquivar'}
        >
          <Archive className="w-3 h-3" />
        </motion.button>

        {/* Botão Ocultar/Visualizar */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onHideClick}
          className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 
                     rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
          title={chat.isHidden ? 'Mostrar' : 'Ocultar'}
        >
          {chat.isHidden ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3" />
          )}
        </motion.button>

        {/* Botão Deletar */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDeleteClick}
          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg border border-red-400/30 
                     transition-colors text-red-600"
          title="Deletar Chat"
        >
          <Trash2 className="w-3 h-3" />
        </motion.button>

        {/* Menu de 3 pontos */}
        <MoreVertical className="w-4 h-4 text-slate-400" />
      </motion.div>
    </motion.div>
  )
}
