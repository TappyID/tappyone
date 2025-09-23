'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import ChatHeader from '../../../atendimento/components/TopChatArea/ChatHeader'
import ChatArea from '../../../atendimento/components/ChatArea'
import MessageInput from '../../../atendimento/components/FooterChatArea/MessageInput'

interface ChatModalKanbanProps {
  isOpen: boolean
  onClose: () => void
  card: any
  theme: string
}

export default function ChatModalKanban({ isOpen, onClose, card, theme }: ChatModalKanbanProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Extrair o chatId do card
  const chatId = card?.id || ''
  const contactName = card?.name || card?.nome || 'Contato'
  const contactNumber = chatId.replace('@c.us', '')
  
  // Buscar mensagens quando abrir o modal
  useEffect(() => {
    if (isOpen && chatId) {
      fetchMessages()
    }
  }, [isOpen, chatId])
  
  const fetchMessages = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/whatsapp/chats/${chatId}/messages?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSendMessage = async (message: string, attachments?: any[]) => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/whatsapp/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId,
          message,
          attachments
        })
      })
      
      if (response.ok) {
        // Recarregar mensagens
        fetchMessages()
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className={`${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      } rounded-xl shadow-2xl w-[90vw] h-[85vh] max-w-6xl flex flex-col overflow-hidden`}>
        
        {/* Header do Modal */}
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {contactName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {contactName}
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {contactNumber}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Chat Header com informações do contato */}
        <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <ChatHeader 
            selectedChat={{
              id: chatId,
              name: contactName,
              profilePictureUrl: card?.profilePictureUrl,
              isGroup: false,
              lastMessage: null,
              timestamp: Date.now()
            }}
            theme={theme}
            onBack={() => {}}
            showBackButton={false}
          />
        </div>
        
        {/* Área de Mensagens */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <ChatArea 
              messages={messages}
              selectedChatId={chatId}
              theme={theme}
              currentUserId="user"
              onLoadMore={() => {}}
              hasMore={false}
            />
          )}
        </div>
        
        {/* Input de Mensagem */}
        <div className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <MessageInput 
            onSendMessage={handleSendMessage}
            theme={theme}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  )
}
