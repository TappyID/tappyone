'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, 
  Video, 
  MoreVertical, 
  User,
  Clock,
  MapPin
} from 'lucide-react'

import AgendamentosSidebar from './AgendamentosSidebar'
import OrcamentosSidebar from './OrcamentosSidebar'
import TicketsSidebar from './TicketsSidebar'
import TagsSidebar from './TagsSidebar'
// import AtendenteSidebar from './AtendenteSidebar'
// import FilaSidebar from './FilaSidebar'
// import KanbanSidebar from './KanbanSidebar'
import AgendamentosIndicator from './Indicators/AgendamentosIndicator'
import OrcamentosIndicator from './Indicators/OrcamentosIndicator'
import SimpleTagsIndicator from './Indicators/SimpleTagsIndicator'
import ContactIndicator from './Indicators/ContactIndicator'
import TicketsIndicator from './Indicators/TicketsIndicator'
import KanbanIndicator from './Indicators/KanbanIndicator'
// import FilaIndicator from './Indicators/FilaIndicator'
// import AgenteIndicator from './Indicators/AgenteIndicator'
import CreateContactModal from './CreateContactModal'
import { useChatPicture } from '@/hooks/useChatPicture'

interface ChatHeaderProps {
  chat?: {
    id: string
    name: string
    avatar?: string
    isOnline?: boolean
    lastSeen?: number
    location?: string
  }
  selectedChatId?: string // Chat ID selecionado para integração com módulos
  onCallClick?: () => void
  onVideoClick?: () => void
  onMenuClick?: () => void
}

export default function ChatHeader({ 
  chat, 
  selectedChatId,
  onCallClick, 
  onVideoClick, 
  onMenuClick 
}: ChatHeaderProps) {
  
  // Estados SEMPRE devem ser declarados antes de qualquer early return
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [agendamentosSidebarOpen, setAgendamentosSidebarOpen] = useState(false)
  const [orcamentosSidebarOpen, setOrcamentosSidebarOpen] = useState(false)
  const [ticketsSidebarOpen, setTicketsSidebarOpen] = useState(false)
  const [tagsSidebarOpen, setTagsSidebarOpen] = useState(false)
  const [atendenteSidebarOpen, setAtendenteSidebarOpen] = useState(false)
  const [filaSidebarOpen, setFilaSidebarOpen] = useState(false)
  const [kanbanSidebarOpen, setKanbanSidebarOpen] = useState(false)
  const [createContactModalOpen, setCreateContactModalOpen] = useState(false)
  
  // Extrair contato_id do chatId (remover @c.us)
  const contatoId = selectedChatId ? selectedChatId.replace('@c.us', '') : null
  
  // Buscar foto de perfil do WAHA - sempre chamar o hook, mas desabilitar se não há chat
  const { pictureUrl, isLoading: isLoadingPicture } = useChatPicture(chat?.id || '', { 
    enabled: !!chat?.id 
  })
  
  if (!chat) {
    return (
      <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 
                      flex items-center justify-center">
        <span className="text-gray-400">Selecione uma conversa</span>
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
        {/* Avatar com foto do WAHA */}
        <div className="relative">
          {(pictureUrl || chat.avatar) ? (
            <img 
              src={pictureUrl || chat.avatar} 
              alt={chat.name}
              className={`w-10 h-10 rounded-full object-cover ${
                isLoadingPicture ? 'animate-pulse' : ''
              }`}
              onError={(e) => {
                // Fallback se a imagem falhar
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextElementSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          
          {/* Fallback avatar */}
          <div 
            className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 
                       flex items-center justify-center"
            style={{ display: (pictureUrl || chat.avatar) ? 'none' : 'flex' }}
          >
            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          
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

      {/* Indicadores com Badges - Lado Direito */}
      <div className="flex items-center gap-1">
        <ContactIndicator 
          chatId={selectedChatId}
          onClick={() => {
            // Se já é contato, mostrar mensagem. Se não, abrir modal
            const numero = selectedChatId ? selectedChatId.replace('@c.us', '') : ''
            console.log('👤 [ChatHeader] Clique no ContactIndicator - chatId:', selectedChatId)
            
            // Por enquanto sempre abre modal - o ContactIndicator vai determinar se deve ou não
            setCreateContactModalOpen(true)
          }} 
        />
        <KanbanIndicator 
          contatoId={contatoId}
          onClick={() => {
            console.log('📋 [ChatHeader] Clique no KanbanIndicator - contatoId:', contatoId)
            // TODO: Abrir modal do kanban ou navegar para kanban
            alert('Funcionalidade do kanban em desenvolvimento!')
          }} 
        />
        <SimpleTagsIndicator 
          contatoId={contatoId}
          onClick={() => setTagsSidebarOpen(true)} 
        />
        <AgendamentosIndicator 
          contatoId={contatoId}
          onClick={() => {
            console.log('📅 [ChatHeader] Abrindo sidebar de agendamentos - contatoId:', contatoId)
            setAgendamentosSidebarOpen(true)
          }} 
        />
        <OrcamentosIndicator 
          contatoId={contatoId}
          onClick={() => {
            console.log('💰 [ChatHeader] Abrindo sidebar de orçamentos - contatoId:', contatoId)
            setOrcamentosSidebarOpen(true)
          }} 
        />
        <TicketsIndicator 
          contatoId={contatoId}
          onClick={() => {
            console.log('🎫 [ChatHeader] Abrindo sidebar de tickets - contatoId:', contatoId)
            setTicketsSidebarOpen(true)
          }} 
        />
        {/* TEMPORARIAMENTE COMENTADO - OUTROS INDICADORES */}
        {/*
        <FilaIndicator 
          contatoId={contatoId}
          onClick={() => setFilaSidebarOpen(true)} 
        />
        <AgenteIndicator 
          contatoId={contatoId}
          onClick={() => setAtendenteSidebarOpen(true)} 
        />
        */}
      </div>
      
      {/* Modal de Criar Contato */}
      <CreateContactModal
        isOpen={createContactModalOpen}
        onClose={() => setCreateContactModalOpen(false)}
        chatId={selectedChatId}
        chatName={chat?.name}
      />

      {/* Sidebars */}
      <TagsSidebar
        isOpen={tagsSidebarOpen}
        onClose={() => setTagsSidebarOpen(false)}
        contatoId={contatoId}
      />
      
      <AgendamentosSidebar
        isOpen={agendamentosSidebarOpen}
        onClose={() => setAgendamentosSidebarOpen(false)}
        contatoId={contatoId}
      />
      
      <OrcamentosSidebar
        isOpen={orcamentosSidebarOpen}
        onClose={() => setOrcamentosSidebarOpen(false)}
        contatoId={contatoId}
      />
      
      <TicketsSidebar
        isOpen={ticketsSidebarOpen}
        onClose={() => setTicketsSidebarOpen(false)}
        contatoId={contatoId}
      />
    </motion.div>
  )
} 
