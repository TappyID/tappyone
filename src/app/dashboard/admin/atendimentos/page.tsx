'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AtendimentosTopBar from './components/AtendimentosTopBar'
import ConversationSidebar from './components/ConversationSidebar'
import ChatArea from './components/ChatArea'
import { useWhatsAppData, WhatsAppChat } from '@/hooks/useWhatsAppData'
import { debugLogger } from '@/utils/debugLogger'
import { useTheme } from '@/contexts/ThemeContext'

export default function AtendimentosPage() {
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppChat | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { actualTheme } = useTheme()
  
  // Helper function para extrair chatId da estrutura da WAHA API
  const extractChatId = (conversation: WhatsAppChat): string | null => {
    if (typeof conversation.id === 'string') {
      return conversation.id
    } else if (conversation.id && (conversation.id as any)._serialized) {
      return (conversation.id as any)._serialized
    }
    return null
  }
  
  // Hook para dados do WhatsApp
  const {
    chats,
    contacts,
    messages,
    presence,
    loading,
    error,
    isConnected,
    loadChatMessages,
    reloadChatMessages,
    sendWhatsAppMessage,
    markAsRead,
    markAsReadReal,
    sendTyping,
    getPresence,
    resetRetry,
    retryCount
  } = useWhatsAppData()

  // Carregar mensagens quando uma conversa for selecionada
  useEffect(() => {
    if (selectedConversation) {
      const chatId = extractChatId(selectedConversation)
      if (!chatId) {
        debugLogger.error('Unable to extract chatId from selectedConversation:', selectedConversation)
        return
      }
      
      debugLogger.log('Loading messages for selected conversation:', chatId)
      loadChatMessages(chatId)
    }
  }, [selectedConversation, loadChatMessages])

  // Polling para recarregar mensagens do chat ativo a cada 5 segundos
  useEffect(() => {
    if (!selectedConversation) return
    
    const chatId = extractChatId(selectedConversation)
    if (!chatId) return
    
    const interval = setInterval(() => {
      debugLogger.log('Polling: Reloading messages for active chat:', chatId)
      // Usar reloadChatMessages para forçar o reload
      reloadChatMessages(chatId)
    }, 3000) // 3 segundos - MAIS RÁPIDO! 🚀
    
    return () => clearInterval(interval)
  }, [selectedConversation, reloadChatMessages])

  return (
    <div className={`h-screen w-screen overflow-hidden transition-colors duration-500 ${
      actualTheme === 'dark' 
        ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
        : 'bg-white'
    }`}>
      {/* TopBar Customizada */}
      <AtendimentosTopBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Layout Principal */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar de Conversas */}
        <ConversationSidebar 
          chats={chats}
          contacts={contacts}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={loading}
        />
        
        {/* Área do Chat */}
        <ChatArea 
          conversation={selectedConversation}
          messages={selectedConversation ? (() => {
            const chatId = extractChatId(selectedConversation)
            return chatId ? messages[chatId] || [] : []
          })() : []}
          onSendMessage={(message: string) => {
            if (selectedConversation) {
              const chatId = extractChatId(selectedConversation)
              if (chatId) {
                sendWhatsAppMessage(chatId, message)
              }
            }
          }}
          onTyping={(chatId: string, isTyping: boolean) => {
            sendTyping(chatId, isTyping)
          }}
          onMarkAsRead={(chatId: string) => {
            markAsReadReal(chatId)
          }}
          isLoading={loading}
          isTyping={selectedConversation ? (() => {
            const chatId = extractChatId(selectedConversation)
            return chatId ? !!presence[chatId]?.isTyping : false
          })() : false}
        />
      </div>
      
  
    </div>
  )
}
