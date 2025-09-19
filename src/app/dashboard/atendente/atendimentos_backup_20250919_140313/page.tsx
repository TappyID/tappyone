'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AtendimentosTopBar from './components/AtendimentosTopBar'
import ConversationSidebar from './components/ConversationSidebar'
import ChatArea from './components/ChatArea'
import { useWhatsAppDataFiltered } from '@/hooks/useWhatsAppDataFiltered'
import { WhatsAppChat } from '@/hooks/useWhatsAppData'
import { debugLogger } from '@/utils/debugLogger'
import { useTheme } from '@/contexts/ThemeContext'

export default function AtendimentosPage() {
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppChat | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isQuickActionsSidebarOpen, setIsQuickActionsSidebarOpen] = useState(false)
  const [isAnotacoesSidebarOpen, setIsAnotacoesSidebarOpen] = useState(false)
  const { actualTheme } = useTheme()
  
  // Estados para contadores de badges
  const [notesCount, setNotesCount] = useState(0)
  const [orcamentosCount, setOrcamentosCount] = useState(0)
  const [agendamentosCount, setAgendamentosCount] = useState(0)
  const [assinaturasCount, setAssinaturasCount] = useState(0)
  const [ticketsCount, setTicketsCount] = useState(0)
  const [contactStatus, setContactStatus] = useState<'synced' | 'error'>('error')
  
  // Funções para buscar contagens
  const fetchNotesCount = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/anotacoes?contato_id=${encodeURIComponent(chatId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data.length : 0
      }
    } catch (error) {
      console.error('Erro ao buscar anotações:', error)
    }
    return 0
  }

  const fetchOrcamentosCount = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orcamentos?contato_id=${encodeURIComponent(chatId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data.length : 0
      }
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error)
    }
    return 0
  }

  const fetchAgendamentosCount = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/agendamentos?contato_id=${encodeURIComponent(chatId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data.length : 0
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    }
    return 0
  }

  const fetchAssinaturasCount = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/assinaturas?contato_id=${encodeURIComponent(chatId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data.length : 0
      }
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error)
    }
    return 0
  }

  const fetchTicketsCount = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tickets?contato_id=${encodeURIComponent(chatId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        return Array.isArray(data) ? data.length : 0
      }
    } catch (error) {
      console.error('Erro ao buscar tickets:', error)
    }
    return 0
  }

  // Função para verificar status do contato
  const checkContactStatus = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')
      const numeroTelefone = chatId.replace('@c.us', '')
      
      const response = await fetch(`/api/contatos?numero_telefone=${numeroTelefone}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          const contato = data[0]
          if (contato.nome || contato.numero_telefone) {
            return 'synced'
          }
        }
      }
      return 'error'
    } catch (error) {
      console.error('Erro ao verificar status do contato:', error)
      return 'error'
    }
  }
  
  // Helper function para extrair chatId da estrutura da WAHA API
  const extractChatId = (conversation: WhatsAppChat): string | null => {
    if (typeof conversation.id === 'string') {
      return conversation.id
    } else if (conversation.id && (conversation.id as any)._serialized) {
      return (conversation.id as any)._serialized
    }
    return null
  }
  
  // Hook para dados do WhatsApp filtrados por fila
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
    retryCount,
    filas,
    filaContatos
  } = useWhatsAppDataFiltered()

  // Carregar mensagens quando uma conversa for selecionada
  useEffect(() => {
    if (selectedConversation) {
      const chatId = extractChatId(selectedConversation)
  
      
      if (!chatId) {
        console.error('❌ [DEBUG] Não foi possível extrair chatId da conversa')
        return
      }
      
      console.log('📨 [DEBUG] Carregando mensagens para chatId:', chatId)
      loadChatMessages(chatId)
      
      // Buscar contagens dos badges
      const fetchBadgeCounts = async () => {
        try {
          const [notesCountResult, orcamentosCountResult, agendamentosCountResult, assinaturasCountResult, ticketsCountResult, contactStatusResult] = await Promise.all([
            fetchNotesCount(chatId),
            fetchOrcamentosCount(chatId),
            fetchAgendamentosCount(chatId),
            fetchAssinaturasCount(chatId),
            fetchTicketsCount(chatId),
            checkContactStatus(chatId)
          ])
          
          setNotesCount(notesCountResult)
          setOrcamentosCount(orcamentosCountResult)
          setAgendamentosCount(agendamentosCountResult)
          setAssinaturasCount(assinaturasCountResult)
          setTicketsCount(ticketsCountResult)
          setContactStatus(contactStatusResult)
          
          console.log(`📊 Chat ${chatId}: ${notesCountResult} anotações, ${orcamentosCountResult} orçamentos, ${agendamentosCountResult} agendamentos, ${assinaturasCountResult} assinaturas, ${ticketsCountResult} tickets, status: ${contactStatusResult}`)
        } catch (error) {
          console.error('Erro ao buscar contagens:', error)
        }
      }
      
      fetchBadgeCounts()
    } else {
      // Reset contadores quando não há conversa selecionada
      setNotesCount(0)
      setOrcamentosCount(0)
      setAgendamentosCount(0)
      setAssinaturasCount(0)
      setTicketsCount(0)
      setContactStatus('error')
    }
  }, [selectedConversation, loadChatMessages])

  // Polling para recarregar mensagens do chat ativo a cada 5 segundos
  useEffect(() => {
    if (!selectedConversation) return
    
    const chatId = extractChatId(selectedConversation)
    if (!chatId) return
    
    const interval = setInterval(() => {
      // Usar reloadChatMessages para forçar o reload
      reloadChatMessages(chatId)
    }, 60000) // 60 segundos - otimizado
    
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
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isQuickActionsSidebarOpen={isQuickActionsSidebarOpen}
        />
        
        {/* Área do Chat */}
        <ChatArea 
          conversation={selectedConversation}
          messages={selectedConversation ? (() => {
            const chatId = extractChatId(selectedConversation)
            const chatMessages = chatId ? messages[chatId] || [] : []
            console.log('💬 [DEBUG] Mensagens sendo passadas para ChatArea:', {
              chatId: chatId,
              messageCount: chatMessages.length,
              messages: chatMessages,
              allMessages: messages
            })
            return chatMessages
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
      
  
    </div>
  )
}
