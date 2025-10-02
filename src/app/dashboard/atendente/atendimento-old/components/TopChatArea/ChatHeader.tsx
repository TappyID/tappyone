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

import CreateContactModal from './CreateContactModal'
import AgendamentoBottomSheet from '../FooterChatArea/BottomSheets/AgendamentoBottomSheet'
import OrcamentoBottomSheet from '../FooterChatArea/BottomSheets/OrcamentoBottomSheet'
import TicketBottomSheet from '../FooterChatArea/BottomSheets/TicketBottomSheet'
import TagsBottomSheet from '../FooterChatArea/BottomSheets/TagsBottomSheet'
import AnotacoesBottomSheet from '../FooterChatArea/BottomSheets/AnotacoesBottomSheet'
// import AtendenteSidebar from './AtendenteSidebar'
// import FilaSidebar from './FilaSidebar'
// import KanbanSidebar from './KanbanSidebar'
import AgendamentosIndicator from './Indicators/AgendamentosIndicator'
import OrcamentosIndicator from './Indicators/OrcamentosIndicator'
import SimpleTagsIndicator from './Indicators/SimpleTagsIndicator'
import ContactIndicator from './Indicators/ContactIndicator'
import TicketsIndicator from './Indicators/TicketsIndicator'
import AnotacoesIndicator from './Indicators/AnotacoesIndicator'
// import FilaIndicator from './Indicators/FilaIndicator'
// import AgenteIndicator from './Indicators/AgenteIndicator'
import { useAtendenteData } from '@/hooks/useAtendenteData'
import { useChatPicture } from '@/hooks/useChatPicture'
import { useFiltersData } from '@/hooks/useFiltersData'
import { FilaIndicator } from './StatusIndicators'

interface ChatHeaderProps {
  chat?: {
    id: string
    name: string
    avatar?: string
    isOnline?: boolean
    lastSeen?: number
    location?: string
    unreadCount?: number // Adicionar contador de não lidas
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
  const [agendamentoBottomSheetOpen, setAgendamentoBottomSheetOpen] = useState(false)
  const [orcamentoBottomSheetOpen, setOrcamentoBottomSheetOpen] = useState(false)
  const [ticketBottomSheetOpen, setTicketBottomSheetOpen] = useState(false)
  const [tagsBottomSheetOpen, setTagsBottomSheetOpen] = useState(false)
  const [anotacoesBottomSheetOpen, setAnotacoesBottomSheetOpen] = useState(false)
  const [filaSidebarOpen, setFilaSidebarOpen] = useState(false)
  const [createContactModalOpen, setCreateContactModalOpen] = useState(false)
  
  // Extrair contato_id do chatId (remover @c.us)
  const contatoId = selectedChatId ? selectedChatId.replace('@c.us', '') : null
  
  // Buscar foto de perfil do WAHA - sempre chamar o hook, mas desabilitar se não há chat
  const { pictureUrl, isLoading: isLoadingPicture } = useChatPicture(chat?.id || '', { 
    enabled: !!chat?.id 
  })
  
  // Usar o mesmo hook que funciona no TransferModal
  const { atendentes } = useFiltersData()
  
  // Buscar atendente responsável pelo chat
  const { atendenteData, refetch: refetchAtendente } = useAtendenteData(chat?.id || null)
  
  // Buscar nome do responsável usando os dados já carregados
  const nomeResponsavel = React.useMemo(() => {
    if (!atendenteData?.atendente) return ''
    
    const atendente = atendentes.find(a => a.id === atendenteData.atendente)
    return atendente?.nome || 'Rodrigo Tappy'
  }, [atendenteData?.atendente, atendentes])

  // Listener para recarregar dados quando atendimento for assumido
  React.useEffect(() => {
    const handleAtendimentoAssumido = (event: CustomEvent) => {
      if (event.detail.chatId === chat?.id) {
        console.log('🔄 [ChatHeader] Recarregando dados após assumir atendimento')
        refetchAtendente()
      }
    }

    window.addEventListener('atendimento-assumido', handleAtendimentoAssumido as EventListener)
    
    return () => {
      window.removeEventListener('atendimento-assumido', handleAtendimentoAssumido as EventListener)
    }
  }, [chat?.id, refetchAtendente])
  
  if (!chat) {
    return null
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
          
          {/* Informações do Atendente - SEMPRE MOSTRA */}
          <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 mb-1">
            <User className="w-3 h-3" />
            <span>Atendido por: {nomeResponsavel || 'Sem atendente'}</span>
            <span className="text-gray-400">•</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
              atendenteData?.status === 'em_atendimento' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : atendenteData?.status === 'aguardando'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
            }`}>
              {atendenteData?.status === 'em_atendimento' ? 'Em Atendimento' : 
               atendenteData?.status === 'aguardando' ? 'Aguardando' : 
               atendenteData?.status ? 'Finalizado' : 'Aguardando'}
            </span>
            <span className="text-gray-400">•</span>
            <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">{formatLastSeen(chat.lastSeen)}</span>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
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
      </div>

      {/* Indicadores com Badges - Lado Direito */}
      <div className="flex items-center gap-1">
        <ContactIndicator 
          chatId={selectedChatId}
          onClick={() => {
            console.log('👤 [ChatHeader] Clique no ContactIndicator - chatId:', selectedChatId)
            setCreateContactModalOpen(true)
          }} 
        />
        <SimpleTagsIndicator 
          contatoId={selectedChatId}
          onClick={() => setTagsBottomSheetOpen(true)} 
        />
        <AgendamentosIndicator 
          contatoId={selectedChatId}
          onClick={() => {
            console.log('📅 [ChatHeader] Abrindo BottomSheet de agendamentos - chatId:', selectedChatId)
            setAgendamentoBottomSheetOpen(true)
          }} 
        />
        <OrcamentosIndicator 
          contatoId={selectedChatId}
          onClick={() => {
            console.log('💰 [ChatHeader] Abrindo BottomSheet de orçamentos - chatId:', selectedChatId)
            setOrcamentoBottomSheetOpen(true)
          }} 
        />
        <TicketsIndicator 
          contatoId={selectedChatId}
          onClick={() => {
            console.log('🎫 [ChatHeader] Abrindo BottomSheet de tickets - chatId:', selectedChatId)
            setTicketBottomSheetOpen(true)
          }} 
        />
        <AnotacoesIndicator 
          contatoId={selectedChatId}
          onClick={() => {
            console.log('📝 [ChatHeader] Abrindo BottomSheet de anotações - chatId:', selectedChatId)
            setAnotacoesBottomSheetOpen(true)
          }} 
        />
        <FilaIndicator 
          chatId={selectedChatId}
          onClick={() => setFilaSidebarOpen(true)} 
        />
      </div>
      
      {/* Modals */}
      <CreateContactModal 
        isOpen={createContactModalOpen}
        onClose={() => setCreateContactModalOpen(false)}
        chatId={selectedChatId}
        chatName={chat?.name}
      />
      

      {/* BottomSheets */}
      <TagsBottomSheet
        isOpen={tagsBottomSheetOpen}
        onClose={() => setTagsBottomSheetOpen(false)}
        chatId={selectedChatId}
      />
      
      <AgendamentoBottomSheet
        isOpen={agendamentoBottomSheetOpen}
        onClose={() => setAgendamentoBottomSheetOpen(false)}
        chatId={selectedChatId}
      />
      
      <OrcamentoBottomSheet
        isOpen={orcamentoBottomSheetOpen}
        onClose={() => setOrcamentoBottomSheetOpen(false)}
        chatId={selectedChatId}
      />
      
      <TicketBottomSheet
        isOpen={ticketBottomSheetOpen}
        onClose={() => setTicketBottomSheetOpen(false)}
        chatId={selectedChatId}
      />
      
      <AnotacoesBottomSheet
        isOpen={anotacoesBottomSheetOpen}
        onClose={() => setAnotacoesBottomSheetOpen(false)}
        chatId={selectedChatId}
      />
    </motion.div>
  )
} 
