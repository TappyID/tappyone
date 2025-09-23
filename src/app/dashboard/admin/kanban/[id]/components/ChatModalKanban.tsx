'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, Tag, Users, Layers, Trello, FileText, Bot } from 'lucide-react'
import ChatHeader from '../../../atendimento/components/TopChatArea/ChatHeader'
import ChatArea from '../../../atendimento/components/ChatArea'
import MessageInput from '../../../atendimento/components/FooterChatArea/MessageInput'
// import QuickRepliesModal from '../../../atendimento/components/FooterChatArea/QuickRepliesModal'
// import AIResponseModal from '../../../atendimento/components/FooterChatArea/AIResponseModal'

interface ChatModalKanbanProps {
  isOpen: boolean
  onClose: () => void
  card: any
  theme: string
}

// Função para obter URL da WAHA - IGUAL DO ATENDIMENTO!
const getWahaUrl = (path: string = '') => {
  const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const baseUrl = isProduction ? '/api/waha-proxy' : 'http://159.65.34.199:3001'
  return `${baseUrl}${path}`
}

export default function ChatModalKanban({ isOpen, onClose, card, theme }: ChatModalKanbanProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<any>(null)
  
  // Estados para os modais
  const [showQuickRepliesModal, setShowQuickRepliesModal] = useState(false)
  const [showAIResponseModal, setShowAIResponseModal] = useState(false)
  
  // Extrair o chatId do card
  const chatId = card?.id || ''
  const contactName = card?.name || card?.nome || card?.contato?.nome || 'Contato'
  const contactNumber = chatId.replace('@c.us', '').replace('@s.whatsapp.net', '')
  
  // Buscar mensagens quando abrir o modal
  useEffect(() => {
    if (isOpen && chatId) {
      fetchMessages()
      // Criar objeto de chat para o ChatHeader
      setSelectedChat({
        id: chatId,
        name: contactName,
        profilePictureUrl: card?.profilePictureUrl || card?.avatar || null,
        isGroup: false,
        lastMessage: null,
        timestamp: Date.now(),
        numeroTelefone: contactNumber
      })
    }
  }, [isOpen, chatId])
  
  const fetchMessages = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      console.log('🔍 Buscando mensagens para:', chatId)
      
      // Usar a API da WAHA
      const response = await fetch(`/api/whatsapp/chats/${chatId}/messages?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📨 Mensagens recebidas:', data)
        
        // Transformar mensagens da WAHA para o formato esperado pelo ChatArea
        const transformedMessages = (data.messages || data || []).map((msg: any) => ({
          id: msg.id || msg._id || Math.random().toString(),
          content: msg.text || msg.body || msg.message || '',
          sender: msg.fromMe ? 'assistant' : 'user',
          timestamp: new Date(msg.timestamp * 1000 || msg.createdAt || Date.now()).toISOString(),
          type: msg.type || 'text',
          status: msg.ack === 3 ? 'read' : msg.ack === 2 ? 'delivered' : msg.ack === 1 ? 'sent' : 'pending',
          mediaUrl: msg.mediaUrl || msg.media?.url,
          quotedMsg: msg.quotedMsg || msg.quotedMessage,
          // Campos originais para compatibilidade
          text: msg.text || msg.body || msg.message || '',
          fromMe: msg.fromMe || false,
          from: msg.from || (msg.fromMe ? 'me' : chatId),
          to: msg.to || (msg.fromMe ? chatId : 'me'),
          ack: msg.ack || 0
        }))
        
        console.log('📨 Mensagens transformadas:', transformedMessages)
        setMessages(transformedMessages)
      } else {
        console.error('Erro na resposta:', response.status, response.statusText)
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
      
      console.log('📤 Enviando mensagem:', { chatId, message, attachments })
      
      // Usar o mesmo endpoint do atendimento - CORRETO!
      const response = await fetch(getWahaUrl('/api/sendText'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'tappyone-waha-2024-secretkey'
        },
        body: JSON.stringify({
          session: 'user_fb8da1d7_1758158816675',
          chatId: chatId,
          text: message
        })
      })
      
      console.log('📤 Resposta do envio:', response.status, response.statusText)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Mensagem enviada:', result)
        // Recarregar mensagens após 1 segundo
        setTimeout(() => {
          fetchMessages()
        }, 1000)
      } else {
        const error = await response.text()
        console.error('❌ Erro no envio:', error)
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
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
          
          {/* Ações do Kanban */}
          <div className="flex items-center gap-2">
            {/* Voltar ao Kanban */}
            <button
              title="Voltar ao Kanban"
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Trello className="w-4 h-4" />
            </button>
            
            {/* Tags */}
            <button
              title="Gerenciar Tags"
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Tag className="w-4 h-4" />
            </button>
            
            {/* Fila */}
            <button
              title="Gerenciar Fila"
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            
            {/* Orçamento */}
            <button
              title="Criar Orçamento"
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </button>
            
            {/* Agendamento */}
            <button
              title="Criar Agendamento"
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </button>
            
            {/* Agente IA */}
            <button
              title="Gerenciar Agente IA"
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bot className="w-4 h-4" />
            </button>
            
            {/* Separador */}
            <div className={`w-px h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
            
            {/* Fechar */}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400' 
                  : 'hover:bg-red-50 text-gray-600 hover:text-red-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Chat Header com informações do contato */}
        <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <ChatHeader 
            selectedChatId={chatId}
            theme={theme}
            onBack={() => {}}
            showBackButton={false}
          />
        </div>
        
        {/* Área de Mensagens com scroll */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : messages.length > 0 ? (
            <ChatArea 
              messages={messages}
              selectedChat={selectedChat}
              currentUserId="user"
              onLoadMore={() => {
                // Implementar carregamento de mais mensagens
                console.log('📜 Carregar mais mensagens...')
              }}
              hasMore={messages.length >= 50}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Nenhuma mensagem ainda
              </p>
            </div>
          )}
        </div>
        
        {/* Input de Mensagem */}
        <div className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <MessageInput 
            chatId={chatId}
            onSendMessage={handleSendMessage}
            disabled={loading}
            onSendMedia={async (file: File, caption: string, mediaType: 'image' | 'video' | 'document') => {
              console.log('📎 Enviando mídia:', { fileName: file.name, mediaType, caption })
              
              try {
                // Converter arquivo para base64
                const reader = new FileReader()
                const base64Promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => {
                    const base64 = reader.result as string
                    resolve(base64.split(',')[1]) // Remove o prefixo data:...
                  }
                })
                reader.readAsDataURL(file)
                const base64Data = await base64Promise
                
                // Determinar o endpoint correto baseado no tipo de mídia
                let endpoint = '/api/sendImage'
                if (mediaType === 'video') {
                  endpoint = '/api/sendVideo'
                } else if (mediaType === 'document') {
                  endpoint = '/api/sendFile'
                }
                
                // Enviar mídia via WAHA - ENDPOINT CORRETO!
                const response = await fetch(getWahaUrl(endpoint), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': 'tappyone-waha-2024-secretkey'
                  },
                  body: JSON.stringify({
                    session: 'user_fb8da1d7_1758158816675',
                    chatId: chatId,
                    file: {
                      mimetype: file.type,
                      filename: file.name,
                      data: base64Data
                    },
                    caption: caption || ''
                  })
                })
                
                if (response.ok) {
                  console.log('✅ Mídia enviada com sucesso')
                  setTimeout(() => fetchMessages(), 1000)
                }
              } catch (error) {
                console.error('❌ Erro ao enviar mídia:', error)
              }
            }}
            onSendAudio={async (audioBlob: Blob) => {
              console.log('🎤 Enviando áudio...')
              // Implementar envio de áudio
            }}
            onSendList={(listData: any) => {
              console.log('📋 Enviando lista:', listData)
              // Implementar envio de lista
            }}
            onSendEvent={async (title: string, dateTime: string) => {
              console.log('📅 Enviando evento:', { title, dateTime })
              // Implementar envio de evento
            }}
            onQuickReply={() => {
              console.log('⚡ Abrindo respostas rápidas')
              setShowQuickRepliesModal(true)
            }}
            onAIResponse={() => {
              console.log('🤖 Abrindo resposta com I.A')
              setShowAIResponseModal(true)
            }}
          />
        </div>

        {/* Modal de Respostas Rápidas */}
        {showQuickRepliesModal && (
          <QuickRepliesModal
            isOpen={showQuickRepliesModal}
            onClose={() => setShowQuickRepliesModal(false)}
            onSelectReply={(reply) => {
              // Enviar resposta rápida
              handleSendMessage(reply)
              setShowQuickRepliesModal(false)
            }}
            chatId={chatId}
          />
        )}

        {/* Modal de Resposta com I.A */}
        {showAIResponseModal && (
          <AIResponseModal
            isOpen={showAIResponseModal}
            onClose={() => setShowAIResponseModal(false)}
            onSend={(message) => {
              // Enviar mensagem gerada pela IA
              if (chatId) {
                fetch(getWahaUrl('/api/sendText'), {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'X-Api-Key': 'tappyone-waha-2024-secretkey' 
                  },
                  body: JSON.stringify({
                    session: 'user_fb8da1d7_1758158816675',
                    chatId: chatId,
                    text: message
                  })
                }).then(() => {
                  console.log('🤖 Mensagem IA enviada')
                  setTimeout(() => fetchMessages(), 500)
                  setShowAIResponseModal(false)
                })
              }
            }}
            chatId={chatId}
          />
        )}
      </div>
    </div>
  )
}
