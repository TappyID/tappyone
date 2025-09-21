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
  
  // Estados
  disabled?: boolean
  isTyping?: boolean
  
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
  disabled = false,
  isTyping = false,
  selectedChat
}: FooterChatAreaProps) {
  
  // Não mostrar se não há chat selecionado
  if (!selectedChat) {
    return null
  }

  return (
    <MessageInput
      onSendMessage={onSendMessage}
      onAttachFile={onAttachFile}
      onSendImage={onSendImage}
      onSendAudio={onSendAudio}
      onOpenCamera={onOpenCamera}
      onOpenEmojis={onOpenEmojis}
      placeholder={`Mensagem para ${selectedChat.name}...`}
      disabled={disabled}
      isTyping={isTyping}
    />
  )
}
