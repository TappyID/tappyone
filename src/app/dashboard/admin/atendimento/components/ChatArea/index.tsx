'use client'

import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, MessageCircle } from 'lucide-react'

import MessageBubble from './MessageBubble'

interface ChatAreaProps {
  // Mensagens do chat
  messages: Array<{
    id: string
    content: string
    type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call' | 'poll' | 'menu'
    sender: 'user' | 'agent'
    timestamp: number
    status?: 'sending' | 'sent' | 'delivered' | 'read'
    mediaUrl?: string
    metadata?: {
      // Para áudio
      duration?: number
      // Para documento
      fileName?: string
      fileSize?: number
      mimeType?: string
      // Para video
      thumbnailUrl?: string
      // Para localização
      latitude?: number
      longitude?: number
      address?: string
      locationName?: string
      // Para contato
      contactName?: string
      phoneNumber?: string
      email?: string
      organization?: string
      // Para enquete
      question?: string
      pollOptions?: Array<{id: string, text: string, votes: number}>
      totalVotes?: number
      allowMultipleAnswers?: boolean
      hasVoted?: boolean
      userVote?: string[]
      // Para menu
      menuTitle?: string
      menuDescription?: string
      menuItems?: Array<{
        id: string
        title: string
        description?: string
        icon?: string
        submenu?: any[]
      }>
    }
  }>
  
  // Estados
  isLoading?: boolean
  isTyping?: boolean
  typingUser?: string
  
  // Chat selecionado
  selectedChat?: {
    id: string
    name: string
  }
}

export default function ChatArea({ 
  messages, 
  isLoading = false,
  isTyping = false,
  typingUser,
  selectedChat
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Estado sem chat selecionado
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Bem-vindo ao Atendimento
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Selecione uma conversa na sidebar para começar a atender
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Loading inicial */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Carregando mensagens...</span>
          </div>
        )}

        {/* Lista de mensagens */}
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1
            const prevMessage = messages[index - 1]
            const showAvatar = !prevMessage || prevMessage.sender !== message.sender
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isLastMessage={isLastMessage}
                showAvatar={showAvatar}
              />
            )
          })}
        </AnimatePresence>

        {/* Indicador de digitação */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                {typingUser?.charAt(0) || '?'}
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Estado vazio */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Nenhuma mensagem ainda
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Inicie a conversa com {selectedChat.name} enviando uma mensagem
            </p>
          </div>
        )}

        {/* Referência para auto-scroll */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
