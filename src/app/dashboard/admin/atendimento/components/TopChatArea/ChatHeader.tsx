'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, 
  Video, 
  MoreVertical, 
  User,
  Clock,
  MapPin
} from 'lucide-react'

import {
  TagsIndicator,
  KanbanIndicator,
  TicketsIndicator,
  AgendamentosIndicator,
  OrcamentosIndicator,
  AgenteIndicator,
  RespostaRapidaIndicator,
  FilaIndicator,
  AtendimentoIndicator
} from './StatusIndicators'

interface ChatHeaderProps {
  chat?: {
    id: string
    name: string
    avatar?: string
    isOnline?: boolean
    lastSeen?: number
    location?: string
  }
  onCallClick?: () => void
  onVideoClick?: () => void
  onMenuClick?: () => void
}

export default function ChatHeader({ 
  chat, 
  onCallClick, 
  onVideoClick, 
  onMenuClick 
}: ChatHeaderProps) {
  
  if (!chat) {
    return (
      <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 
                      flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Selecione uma conversa para começar
        </p>
      </div>
    )
  }

  const formatLastSeen = (timestamp?: number) => {
    if (!timestamp) return 'Offline'
    
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) return 'Online agora'
    if (diff < 3600000) return `Visto ${Math.floor(diff / 60000)}m atrás`
    if (diff < 86400000) return `Visto ${Math.floor(diff / 3600000)}h atrás`
    
    const date = new Date(timestamp)
    return `Visto ${date.toLocaleDateString('pt-BR')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 
                 px-4 flex items-center justify-between"
    >
      {/* Info do Contato */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          {chat.avatar ? (
            <img 
              src={chat.avatar} 
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 
                           flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
          )}
          
          {/* Status online */}
          {chat.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 
                           rounded-full border-2 border-white dark:border-gray-900" />
          )}
        </div>

        {/* Nome e Status */}
        <div className="flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {chat.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatLastSeen(chat.lastSeen)}</span>
            {chat.location && (
              <>
                <span>•</span>
                <MapPin className="w-3 h-3" />
                <span>{chat.location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Indicadores + Botões de Ação */}
      <div className="flex items-center gap-2">
        {/* Indicadores de Status */}
        {chat && (
          <div className="flex items-center gap-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
            <TagsIndicator 
              count={3}
              onClick={() => console.log('🏷️ Tags clicadas')} 
            />
            <KanbanIndicator 
              status="Em Atendimento"
              onClick={() => console.log('📋 Kanban clicado')} 
            />
            <TicketsIndicator 
              count={2}
              onClick={() => console.log('🎫 Tickets clicados')} 
            />
            <AgendamentosIndicator 
              count={3}
              onClick={() => console.log('📅 Agendamentos clicados')} 
            />
            <OrcamentosIndicator 
              count={1}
              onClick={() => console.log('💰 Orçamentos clicados')} 
            />
            <AgenteIndicator 
              nome="João Silva"
              onClick={() => console.log('👤 Agente clicado')} 
            />
            <RespostaRapidaIndicator 
              count={5}
              onClick={() => console.log('💬 Respostas Rápidas clicadas')} 
            />
            <FilaIndicator 
              nome="Suporte Técnico"
              onClick={() => console.log('👥 Fila clicada')} 
            />
            <AtendimentoIndicator 
              status="Ativo"
              onClick={() => console.log('🎧 Atendimento clicado')} 
            />
          </div>
        )}

        {/* Botões de Ação */}
        {/* Botão de Chamada */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onCallClick}
          className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 
                     dark:hover:text-green-400 rounded-lg hover:bg-gray-100 
                     dark:hover:bg-gray-800 transition-colors"
          title="Fazer chamada"
        >
          <Phone className="w-5 h-5" />
        </motion.button>

        {/* Botão de Vídeo */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onVideoClick}
          className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 
                     dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 
                     dark:hover:bg-gray-800 transition-colors"
          title="Videochamada"
        >
          <Video className="w-5 h-5" />
        </motion.button>

        {/* Menu de opções */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onMenuClick}
          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 
                     dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 
                     dark:hover:bg-gray-800 transition-colors"
          title="Mais opções"
        >
          <MoreVertical className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}
