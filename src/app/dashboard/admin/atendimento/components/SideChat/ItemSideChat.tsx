'use client'

import React, { useState } from 'react'
import TransferModal from '../TransferModal'
import { motion } from 'framer-motion'
import { 
  Archive, 
  Eye,
  EyeOff, 
  Trash2,
  Star,
  UserPlus,
  Calendar,
  DollarSign,
  Layers,
  Users,
  Tag,
  Ticket,
  UserCheck
} from 'lucide-react'

import LastMessageSideChat from './LastMessageSideChat'
import { useChatPicture } from '@/hooks/useChatPicture'

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
    profilePictureUrl?: string
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
    }
    fila?: string | {
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
    
    // Estados de UI
    isSelected?: boolean
    isArchived?: boolean
    isFavorite?: boolean
    isHidden?: boolean
    isContact?: boolean
    unreadCount?: number
  }
  onSelect: () => void
  onTagsClick: (e: React.MouseEvent) => void
  onTransferClick: (e: React.MouseEvent) => void
  onToggleFavorite?: (chatId: string) => void
  onToggleArchive?: (chatId: string) => void
  onToggleHidden?: (chatId: string) => void
  onDelete?: (chatId: string) => void
}

const ItemSideChat = React.forwardRef<HTMLDivElement, ItemSideChatProps>(({
  chat,
  onSelect,
  onTagsClick,
  onTransferClick,
  onToggleFavorite,
  onToggleArchive,
  onToggleHidden,
  onDelete
}, ref) => {
  
  // Estado para o modal de transferência
  const [showTransferModal, setShowTransferModal] = useState(false)
  
  // Buscar foto de perfil do WAHA - usar profilePictureUrl se já vier no chat
  const { pictureUrl, isLoading: isLoadingPicture } = useChatPicture(chat.id)
  const profileImage = chat.profilePictureUrl || pictureUrl || chat.avatar
  
  // Função para lidar com a transferência
  const handleTransfer = (targetId: string, type: 'atendente' | 'fila', notes?: string) => {
    console.log('Transferindo para:', { targetId, type, notes })
    // TODO: Implementar transferência real via API
    setShowTransferModal(false)
  }
  
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
    <>
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

      {/* Indicadores de estado no canto superior esquerdo */}
      <div className="absolute top-2 left-2 flex gap-1">
        {/* Indicador de Favorito */}
        {chat.isFavorite && (
          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <Star className="w-2.5 h-2.5 text-white fill-current" />
          </div>
        )}
        
        {/* Indicador de Arquivado */}
        {chat.isArchived && (
          <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
            <Archive className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      {/* Avatar com foto real do WAHA ou fallback */}
      <div className="relative flex-shrink-0">
          {/* Foto do WAHA ou avatar fornecido */}
          {profileImage ? (
            <img 
              src={profileImage} 
              alt={chat.name}
              className={`w-12 h-12 rounded-full object-cover border-2 ${
                chat.isSelected 
                  ? 'border-blue-400 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700'
              } ${isLoadingPicture ? 'animate-pulse' : ''}`}
              onError={(e) => {
                // Fallback se a imagem falhar
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          
          {/* Fallback avatar com inicial */}
          <div className={`${profileImage ? 'hidden' : ''} w-12 h-12 rounded-full 
                         bg-gradient-to-br from-blue-400 to-purple-500
                         flex items-center justify-center border-2 ${
                chat.isSelected 
                  ? 'border-blue-400 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
              <span className="text-lg font-bold text-white">
                {chat.name.charAt(0).toUpperCase()}
              </span>
          </div>
          
          {/* Badge de mensagens não lidas */}
          {!!(chat.unreadCount && chat.unreadCount > 0) && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full 
                           border-2 border-white dark:border-gray-800 flex items-center justify-center
                           shadow-md">
              <span className="text-xs font-bold text-white">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </span>
            </div>
          )}
          
          {/* Indicador de online */}
          {chat.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full 
                           border-2 border-white dark:border-gray-800"></div>
          )}
      </div>

      {/* Informações do Chat */}
      <div className="flex-1 min-w-0">
          {/* Nome e Badge */}
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-medium truncate ${
              chat.isSelected
                ? 'text-blue-700 dark:text-blue-300 font-semibold'
                : chat.lastMessage?.isRead === false 
                  ? 'text-gray-900 dark:text-gray-100' 
                  : 'text-gray-600 dark:text-gray-300'
            }`}>
              {chat.name.length > 15 ? `${chat.name.substring(0, 15)}...` : chat.name}
            </h3>
            {/* Contador de não lidas */}
            {!!(chat.unreadCount && chat.unreadCount > 0) && (
              <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </div>
            )}
          </div>

          {/* Última Mensagem */}
          <LastMessageSideChat 
            message={chat.lastMessage}
            maxLength={25}
          />

          {/* Badges de indicadores - Micro tamanho */}
          <div className="flex items-center gap-0.5 mt-0.5 flex-wrap">
            {/* Indicador de Contato Cadastrado */}
            {chat.isContact && (
              <div className="flex items-center gap-0.5 px-1 py-0.5 bg-purple-100 dark:bg-purple-900/20 rounded">
                <UserCheck className="w-2.5 h-2.5 text-purple-500" />
              </div>
            )}
            
            {/* Tags */}
            {!!(chat.tags && chat.tags.length > 0) && (
              <div className="flex items-center gap-0.5 px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                <Tag className="w-2.5 h-2.5 text-gray-500" />
                <span className="text-[10px] font-medium text-gray-600">{chat.tags.length}</span>
              </div>
            )}
            
            {/* Agendamentos */}
            {!!(chat.agendamentos && chat.agendamentos.length > 0) && (
              <div className="flex items-center gap-0.5 px-1 py-0.5 bg-blue-100 dark:bg-blue-900/20 rounded">
                <Calendar className="w-2.5 h-2.5 text-blue-500" />
                <span className="text-[10px] font-medium text-blue-600">{chat.agendamentos.length}</span>
              </div>
            )}
            
            {/* Orçamentos */}
            {!!(chat.orcamentos && chat.orcamentos.length > 0) && (
              <div className="flex items-center gap-0.5 px-1 py-0.5 bg-green-100 dark:bg-green-900/20 rounded">
                <DollarSign className="w-2.5 h-2.5 text-green-500" />
                <span className="text-[10px] font-medium text-green-600">{chat.orcamentos.length}</span>
              </div>
            )}
            
            {/* Tickets */}
            {!!(chat.tickets && chat.tickets.length > 0) && (
              <div className="flex items-center gap-0.5 px-1 py-0.5 bg-orange-100 dark:bg-orange-900/20 rounded">
                <Ticket className="w-2.5 h-2.5 text-orange-500" />
                <span className="text-[10px] font-medium text-orange-600">{chat.tickets.length}</span>
              </div>
            )}
            
            {/* Kanban */}
            {chat.kanbanStatus && (
              <div 
                className="flex items-center gap-0.5 px-1 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${chat.kanbanStatus.cor || '#6b7280'}20`,
                  color: chat.kanbanStatus.cor || '#6b7280'
                }}
              >
                <Layers className="w-2.5 h-2.5" />
                <span className="text-[10px] font-medium truncate max-w-[40px]">{chat.kanbanStatus.nome}</span>
              </div>
            )}
            
            {/* Fila */}
            {chat.fila && (
              <div 
                className="flex items-center gap-0.5 px-1 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${chat.fila.cor || '#9333ea'}20`,
                  color: chat.fila.cor || '#9333ea'
                }}
              >
                <Users className="w-2.5 h-2.5" />
                <span className="text-[10px] font-medium truncate max-w-[40px]">{chat.fila.nome}</span>
              </div>
            )}
            
            {/* Rating */}
            {!!(chat.rating && chat.rating > 0) && (
              <div className="flex items-center gap-0.5 px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                <span className="text-[10px] font-bold text-yellow-600">⭐{chat.rating}</span>
              </div>
            )}
          </div>

      </div>

      {/* Timestamp no canto superior direito */}
      <div className="absolute top-3 right-3 text-xs text-gray-400">
        {chat.lastMessage?.timestamp ? formatTimestamp(chat.lastMessage.timestamp) : 'Agora'}
      </div>

      {/* Ações rápidas no hover - IGUAL AO CONVERSATIONSIDEBAR ANTIGO */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        {/* Favoritar - IGUAL AO ANTIGO */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (onToggleFavorite) {
              onToggleFavorite(chat.id)
            } else {
              console.log('onToggleFavorite não implementado para:', chat.id)
            }
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            chat.isFavorite 
              ? 'text-yellow-400 hover:text-yellow-500' 
              : 'text-slate-400 hover:text-yellow-400'
          }`}
          title={chat.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Star className="w-4 h-4" fill={chat.isFavorite ? 'currentColor' : 'none'} />
        </button>
        
        {/* Transferir - IGUAL AO ANTIGO */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowTransferModal(true)
          }}
          className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition-colors"
          title="Transferir conversa"
        >
          <UserPlus className="w-4 h-4" />
        </button>
        
        {/* Arquivar - IGUAL AO ANTIGO */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (onToggleArchive) {
              onToggleArchive(chat.id)
            } else {
              console.log('onToggleArchive não implementado para:', chat.id)
            }
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            chat.isArchived
              ? 'text-orange-400 hover:text-orange-500' 
              : 'text-slate-400 hover:text-orange-400'
          }`}
          title={chat.isArchived ? 'Desarquivar conversa' : 'Arquivar conversa'}
        >
          <Archive className="w-4 h-4" />
        </button>
        
        {/* Ocultar/Mostrar - IGUAL AO ANTIGO */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (onToggleHidden) {
              onToggleHidden(chat.id)
            } else {
              console.log('onToggleHidden não implementado para:', chat.id)
            }
          }}
          className="p-1.5 text-slate-400 hover:text-purple-400 rounded-lg transition-colors"
          title={chat.isHidden ? 'Mostrar conversa' : 'Ocultar conversa'}
        >
          {chat.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        
        {/* Excluir - IGUAL AO ANTIGO */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (onDelete) {
              if (confirm('Tem certeza que deseja excluir esta conversa?')) {
                onDelete(chat.id)
              }
            } else {
              console.log('onDelete não implementado para:', chat.id)
            }
          }}
          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
          title="Excluir conversa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>

    {/* Modal de Transferência */}
    <TransferModal
      isOpen={showTransferModal}
      onClose={() => setShowTransferModal(false)}
      chatId={chat.id}
      chatName={chat.name}
      currentAtendente={'Não atribuído'}
      currentFila={typeof chat.fila === 'object' ? chat.fila.nome : (chat.fila || 'Sem fila')}
      onTransfer={handleTransfer}
    />
  </>
  )
})

ItemSideChat.displayName = 'ItemSideChat'

export default ItemSideChat
