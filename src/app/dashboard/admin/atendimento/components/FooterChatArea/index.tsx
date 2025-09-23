'use client'

import React from 'react'
import MessageInput from './MessageInput'

interface FooterChatAreaProps {
  onSendMessage: (content: string, type?: 'text') => void
  onAttachFile?: () => void
  onSendImage?: () => void
  onSendAudio?: () => void
  onOpenCamera?: () => void
  onOpenEmojis?: () => void
  onAgentClick?: () => void
  onIAClick?: () => void
  onRespostaRapidaClick?: () => void
  
  // Typing e Seen
  onStartTyping?: () => void
  onStopTyping?: () => void
  onMarkAsSeen?: (messageId: string) => void
  
  // Novos handlers para envio (compatíveis com page.tsx)
  onSendContact?: (contactsData: any) => void
  onSendLocation?: (locationData: any) => void
  onSendPoll?: (pollData: any) => void
  onSendList?: (listData: any) => void
  onSendEvent?: (eventData: any) => void
  onSendMedia?: (file: File, caption: string, mediaType: 'image' | 'video' | 'document') => Promise<void>
  
  // Estados
  disabled?: boolean
  isTyping?: boolean
  enableSignature?: boolean // Controla se deve adicionar assinatura automática
  
  // Chat selecionado
  selectedChat?: {
    id: string
    name: string
  }
  
  // Estado de resposta
  replyingTo?: {
    messageId: string
    content: string
    sender: string
  } | null
  onCancelReply?: () => void
}

export default function FooterChatArea({
  onSendMessage,
  onAttachFile,
  onSendImage,
  onSendAudio,
  onOpenCamera,
  onOpenEmojis,
  onAgentClick,
  onIAClick,
  onRespostaRapidaClick,
  onStartTyping,
  onStopTyping,
  onMarkAsSeen,
  onSendContact,
  onSendLocation,
  onSendPoll,
  onSendList,
  onSendEvent,
  onSendMedia,
  disabled = false,
  isTyping = false,
  enableSignature = true,
  selectedChat,
  replyingTo,
  onCancelReply
}: FooterChatAreaProps) {
  
  // Não mostrar se não há chat selecionado
  if (!selectedChat) {
    return null
  }

  // Função para obter nome do admin logado
  const getAdminName = () => {
    // Tentar pegar do localStorage (diferentes possibilidades)
    const userName = localStorage.getItem('userName') || 
                    localStorage.getItem('user_name') ||
                    localStorage.getItem('name')
    
    if (userName) return userName
    
    // Tentar pegar do sessionStorage
    const sessionName = sessionStorage.getItem('userName') ||
                       sessionStorage.getItem('user_name')
    
    if (sessionName) return sessionName
    
    // Fallback para um nome padrão
    return 'Rodrigo TappyOne'
  }

  // Função para adicionar assinatura do admin na mensagem
  const handleSendMessageWithSignature = (content: string, type?: 'text') => {
    let finalMessage = content
    
    // Só adicionar assinatura se estiver habilitada
    if (enableSignature) {
      const adminName = getAdminName()
      
      // Adicionar assinatura no início com formatação de citação + negrito do WhatsApp
      finalMessage = `> *${adminName}*\n\n${content}`
      
      console.log('📤 Enviando mensagem com assinatura:', { 
        original: content, 
        withSignature: finalMessage,
        adminName 
      })
    } else {
      console.log('📤 Enviando mensagem sem assinatura:', content)
    }
    
    onSendMessage(finalMessage, type)
  }

  return (
    <MessageInput
      onSendMessage={handleSendMessageWithSignature}
      onAttachFile={onAttachFile}
      onSendImage={onSendImage}
      onSendAudio={onSendAudio}
      onOpenCamera={onOpenCamera}
      onOpenEmojis={onOpenEmojis}
      onAgentClick={onAgentClick}
      onIAClick={onIAClick}
      onRespostaRapidaClick={onRespostaRapidaClick}
      replyingTo={replyingTo}
      onCancelReply={onCancelReply}
      onStartTyping={onStartTyping}
      onStopTyping={onStopTyping}
      onMarkAsSeen={onMarkAsSeen}
      onSendContact={onSendContact ? async (contacts: any[], caption: string) => {
        const contactsData = { contacts, caption }
        return onSendContact(contactsData)
      } : undefined}
      onSendLocation={onSendLocation ? async (latitude: number, longitude: number, title: string, address: string) => {
        const locationData = { latitude, longitude, title, address }
        return onSendLocation(locationData)
      } : undefined}
      onSendPoll={onSendPoll ? async (name: string, options: string[], multipleAnswers: boolean) => {
        console.log('📊 FooterChatArea - Dados da enquete recebidos:', { name, options, multipleAnswers })
        const pollData = { name, options, multipleAnswers }
        console.log('📊 FooterChatArea - pollData formatado:', pollData)
        return onSendPoll(pollData)
      } : undefined}
      onSendMenu={onSendList ? async (title: string, description: string, options: string[]) => {
        console.log('🔗 FooterChatArea - Dados do menu recebidos:', { title, description, options })
        
        // Formato correto para WAHA API sendList (igual ao CURL que funcionou)
        const listData = {
          title: title || 'Menu Interativo', // ✅ Título da mensagem (obrigatório)
          description: description || 'Escolha uma das opções abaixo', // ✅ Descrição (obrigatório)
          footer: 'TappyOne CRM', // ✅ Footer (obrigatório)
          button: 'Ver Opções', // ✅ Texto do botão (obrigatório)
          sections: [
            {
              title: 'Principais', // ✅ Título da seção
              rows: options.map((option, index) => ({
                rowId: `option_${index + 1}`, // ✅ rowId (obrigatório)
                title: option, // ✅ Texto da opção
                description: null // ✅ Descrição (pode ser null)
              }))
            }
          ]
        }
        
        console.log('🔗 FooterChatArea - listData formatado para WAHA:', listData)
        return onSendList(listData)
      } : undefined}
      onSendEvent={onSendEvent ? async (title: string, dateTime: string) => {
        console.log('📅 FooterChatArea - Dados do evento recebidos:', { title, dateTime })
        
        // Converter data para timestamp Unix (segundos desde 1970)
        const startTime = dateTime ? Math.floor(new Date(dateTime).getTime() / 1000) : Math.floor(Date.now() / 1000)
        
        const eventData = { 
          name: title || 'Evento sem título',
          startTime: startTime,
          isCanceled: false,
          extraGuestsAllowed: true
        }
        
        console.log('📅 FooterChatArea - eventData formatado para WAHA:', eventData)
        return onSendEvent(eventData)
      } : undefined}
      onSendMedia={onSendMedia}
      chatId={selectedChat.id}
      placeholder={`Mensagem para ${selectedChat.name}...`}
      disabled={disabled}
      isTyping={isTyping}
    />
  )
}
