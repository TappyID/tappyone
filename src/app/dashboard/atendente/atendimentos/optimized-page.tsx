'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import AtendimentosTopBar from './components/AtendimentosTopBar'
import ConversationSidebar from './components/ConversationSidebar'
import ChatArea from './components/ChatArea'
import { useOptimizedAtendimentos } from '@/hooks/useOptimizedAtendimentos'
import { useTheme } from '@/contexts/ThemeContext'

export default function OptimizedAtendimentosPage() {
  const { actualTheme } = useTheme()
  
  const {
    // Estados otimizados
    selectedConversation,
    searchQuery,
    isSidebarCollapsed,
    isQuickActionsSidebarOpen,
    isAnotacoesSidebarOpen,
    badgeCounts,
    
    // Ações otimizadas
    selectConversation,
    setSearchQuery,
    setIsSidebarCollapsed,
    setIsQuickActionsSidebarOpen,
    setIsAnotacoesSidebarOpen,
    refreshData,
    cleanup,
    
    // Dados do WhatsApp
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
    retryCount,
    
    // Helper
    extractChatId
  } = useOptimizedAtendimentos()

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  // Polling otimizado - apenas para mensagens do chat ativo
  useEffect(() => {
    if (!selectedConversation || !isConnected) return
    
    const chatId = extractChatId(selectedConversation)
    if (!chatId) return
    
    // Polling menos agressivo - 2 minutos em vez de 1
    const interval = setInterval(() => {
      reloadChatMessages(chatId)
    }, 120000) // 2 minutos
    
    return () => clearInterval(interval)
  }, [selectedConversation, reloadChatMessages, isConnected, extractChatId])

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
        {/* Sidebar de Conversas Otimizada */}
        <ConversationSidebar
          chats={chats}
          contacts={contacts}
          selectedConversation={selectedConversation}
          onSelectConversation={selectConversation} // Função otimizada
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={loading}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isQuickActionsSidebarOpen={isQuickActionsSidebarOpen}
        />
        
        {/* Área do Chat Otimizada */}
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
          
          // Badges otimizados com cache
          notesCount={badgeCounts.notesCount}
          orcamentosCount={badgeCounts.orcamentosCount}
          agendamentosCount={badgeCounts.agendamentosCount}
          assinaturasCount={badgeCounts.assinaturasCount}
          contactStatus={badgeCounts.contactStatus}
        />
      </div>
      
      {/* Debug Info - remover em produção */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs"
        >
          <div>📊 Chats: {chats.length}</div>
          <div>🔄 Loading: {loading ? 'Sim' : 'Não'}</div>
          <div>📡 Connected: {isConnected ? 'Sim' : 'Não'}</div>
          <div>💬 Selected: {selectedConversation ? extractChatId(selectedConversation) : 'Nenhum'}</div>
          <div>🏷️ Badges: {badgeCounts.notesCount + badgeCounts.orcamentosCount + badgeCounts.agendamentosCount + badgeCounts.assinaturasCount}</div>
        </motion.div>
      )}
    </div>
  )
}
