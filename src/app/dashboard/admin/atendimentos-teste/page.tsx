'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import InfiniteConversationSidebar from '../atendimentos/components/InfiniteConversationSidebar'
import ChatArea from '../atendimentos/components/ChatArea'
import { useWhatsAppData, WhatsAppChat } from '@/hooks/useWhatsAppData'
import { useTheme } from '@/contexts/ThemeContext'

export default function AtendimentosTestePage() {
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppChat | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isQuickActionsSidebarOpen, setIsQuickActionsSidebarOpen] = useState(false)
  const [isAnotacoesSidebarOpen, setIsAnotacoesSidebarOpen] = useState(false)
  const { actualTheme } = useTheme()
  
  // Estados para contadores de badges (simplificados para teste)
  const [notesCount, setNotesCount] = useState(0)
  const [orcamentosCount, setOrcamentosCount] = useState(0)
  const [agendamentosCount, setAgendamentosCount] = useState(0)
  const [assinaturasCount, setAssinaturasCount] = useState(0)
  const [contactStatus, setContactStatus] = useState<'synced' | 'error'>('error')
  
  // Hook para dados do WhatsApp (mantém o original)
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

  // Helper function para extrair chatId
  const extractChatId = (conversation: WhatsAppChat): string | null => {
    if (typeof conversation.id === 'string') {
      return conversation.id
    } else if (conversation.id && (conversation.id as any)._serialized) {
      return (conversation.id as any)._serialized
    }
    return null
  }

  // Quando seleciona conversa, carrega mensagens
  useEffect(() => {
    if (selectedConversation) {
      const chatId = extractChatId(selectedConversation)
      if (chatId) {
        loadChatMessages(chatId)
        
        // Reset badges por enquanto (para não fazer requisições)
        setNotesCount(Math.floor(Math.random() * 5))
        setOrcamentosCount(Math.floor(Math.random() * 3))
        setAgendamentosCount(Math.floor(Math.random() * 2))
        setAssinaturasCount(Math.floor(Math.random() * 1))
        setContactStatus(Math.random() > 0.5 ? 'synced' : 'error')
      }
    } else {
      setNotesCount(0)
      setOrcamentosCount(0)
      setAgendamentosCount(0)
      setAssinaturasCount(0)
      setContactStatus('error')
    }
  }, [selectedConversation, loadChatMessages])

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
        {/* NOVA Sidebar com Scroll Infinito */}
        <InfiniteConversationSidebar 
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={loading}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isQuickActionsSidebarOpen={isQuickActionsSidebarOpen}
        />
        
        {/* Área do Chat (mantém original) */}
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
          isQuickActionsSidebarOpen={isQuickActionsSidebarOpen}
          onToggleQuickActionsSidebar={() => setIsQuickActionsSidebarOpen(!isQuickActionsSidebarOpen)}
          isAnotacoesSidebarOpen={isAnotacoesSidebarOpen}
          onToggleAnotacoesSidebar={() => setIsAnotacoesSidebarOpen(!isAnotacoesSidebarOpen)}
          notesCount={notesCount}
          orcamentosCount={orcamentosCount}
          agendamentosCount={agendamentosCount}
          assinaturasCount={assinaturasCount}
          contactStatus={contactStatus}
        />
      </div>
      
      {/* Badge de Teste */}
      <div className="fixed top-20 right-4 bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">
        🧪 VERSÃO TESTE - SCROLL INFINITO
      </div>
    </div>
  )
}
