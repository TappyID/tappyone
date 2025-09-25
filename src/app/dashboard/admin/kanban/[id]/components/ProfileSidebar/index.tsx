'use client'

import React from 'react'
import { X } from 'lucide-react'
import ProfileHeader from './ProfileHeader'
import ProfileAvatar from './ProfileAvatar'
import ProfileInfoCard from './ProfileInfoCard'
import ProfileActionButton from './ProfileActionButton'

interface ProfileSidebarProps {
  isOpen: boolean
  onClose: () => void
  theme: string
  contactName: string
  contactNumber: string
  chatId: string
  card?: any
  onTagsClick: () => void
  onOrcamentoClick: () => void
  onAgendamentoClick: () => void
  onTicketsClick: () => void
  onAnotacoesClick: () => void
  onAssinaturaClick: () => void
  tags?: any[]
  tickets?: any[]
  orcamentos?: any[]
  agendamentos?: any[]
  anotacoes?: any[]
  assinaturas?: any[]
}

export default function ProfileSidebar({
  isOpen,
  onClose,
  theme,
  contactName,
  contactNumber,
  chatId,
  card,
  onTagsClick,
  onOrcamentoClick,
  onAgendamentoClick,
  onTicketsClick,
  onAnotacoesClick,
  onAssinaturaClick
}: ProfileSidebarProps) {
  if (!isOpen) return null

  return (
    <div className={`w-1/3 flex flex-col transition-all duration-300 ${
      theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'
    } rounded-r-2xl border-l ${
      theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
    }`}>
      {/* Header */}
      <ProfileHeader
        theme={theme}
        onClose={onClose}
      />

      {/* Conteúdo */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Avatar */}
        <ProfileAvatar
          contactName={contactName}
          contactNumber={contactNumber}
          profilePictureUrl={card?.profilePictureUrl}
          theme={theme}
        />

        {/* Informações */}
        <div className="space-y-4">
          <ProfileInfoCard
            theme={theme}
            icon="📱"
            title="Contato"
            content={`WhatsApp: ${contactNumber}`}
          />

          <ProfileInfoCard
            theme={theme}
            icon="💬"
            title="Conversa"
            content={`ID: ${chatId}`}
          />

          <ProfileInfoCard
            theme={theme}
            icon="🏷️"
            title="Tags"
            content={
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Cliente
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Ativo
                </span>
              </div>
            }
          />
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2 pt-4">
          <ProfileActionButton
            theme={theme}
            icon="🏷️"
            text="Gerenciar Tags"
            onClick={onTagsClick}
          />
          
          <ProfileActionButton
            theme={theme}
            icon="💰"
            text="Gerenciar Orçamentos"
            onClick={onOrcamentoClick}
          />
          
          <ProfileActionButton
            theme={theme}
            icon="📅"
            text="Gerenciar Agendamentos"
            onClick={onAgendamentoClick}
          />
          
          <ProfileActionButton
            theme={theme}
            icon="📝"
            text="Gerenciar Anotações"
            onClick={onAnotacoesClick}
          />
          
          <ProfileActionButton
            theme={theme}
            icon="🎫"
            text="Gerenciar Tickets"
            onClick={onTicketsClick}
          />
          
          <ProfileActionButton
            theme={theme}
            icon="✍️"
            text="Gerenciar Assinaturas"
            onClick={onAssinaturaClick}
          />
        </div>
      </div>
    </div>
  )
}
