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
  
  // Typing e Seen
  onStartTyping?: () => void
  onStopTyping?: () => void
  onMarkAsSeen?: (messageId: string) => void
  
  // Estados
  disabled?: boolean
  isTyping?: boolean
  enableSignature?: boolean // Controla se deve adicionar assinatura automática
  
  // Chat selecionado
  selectedChat?: {
    id: string
    name: string
  }
}

export default function FooterChatArea({
  onSendMessage,
  onAttachFile,
  onSendImage,
  onSendAudio,
  onOpenCamera,
  onOpenEmojis,
  onStartTyping,
  onStopTyping,
  onMarkAsSeen,
  disabled = false,
  isTyping = false,
  enableSignature = true,
  selectedChat
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
      
      // Adicionar assinatura com formatação em negrito (WhatsApp usa *texto* para negrito)
      finalMessage = `${content}\n\n*- ${adminName}*`
      
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
      onStartTyping={onStartTyping}
      onStopTyping={onStopTyping}
      onMarkAsSeen={onMarkAsSeen}
      placeholder={`Mensagem para ${selectedChat.name}...`}
      disabled={disabled}
      isTyping={isTyping}
    />
  )
}
