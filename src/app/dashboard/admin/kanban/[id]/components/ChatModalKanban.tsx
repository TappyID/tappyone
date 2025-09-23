'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, Tag, Users, Layers, Trello, FileText, Bot } from 'lucide-react'
import ChatHeader from '../../../atendimento/components/TopChatArea/ChatHeader'
import ChatArea from '../../../atendimento/components/ChatArea'
import MessageInput from '../../../atendimento/components/FooterChatArea/MessageInput'
import EditTextModal from '../../../atendimentos/components/EditTextModal'
import QuickActionsSidebar from '../../../atendimentos/components/QuickActionsSidebar'

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
  
  // Estados para os modais - IGUAL AO ATENDIMENTO
  const [showEditTextModal, setShowEditTextModal] = useState(false)
  const [showQuickActionsSidebar, setShowQuickActionsSidebar] = useState(false)
  const [showEmojisModal, setShowEmojisModal] = useState(false)
  
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
        
        // Transformar mensagens para o formato esperado pelo ChatArea - COM METADADOS COMPLETOS
        const transformedMessages = data.map((msg: any) => {
          // Determinar o tipo de mensagem baseado nos dados da WAHA
          let messageType = 'text'
          let metadata: any = {}
          
          // Detectar tipo baseado no conteúdo da mensagem WAHA
          if (msg.type === 'image' || msg.media?.mimetype?.startsWith('image/')) {
            messageType = 'image'
          } else if (msg.type === 'video' || msg.media?.mimetype?.startsWith('video/')) {
            messageType = 'video'
            metadata.thumbnailUrl = msg.media?.thumbnail
            metadata.duration = msg.media?.duration
          } else if (msg.type === 'audio' || msg.type === 'ptt' || msg.media?.mimetype?.startsWith('audio/')) {
            messageType = 'audio'
            metadata.duration = msg.media?.duration || msg.duration
          } else if (msg.type === 'document' || msg.media?.mimetype) {
            messageType = 'document'
            metadata.fileName = msg.media?.filename || msg.filename
            metadata.fileSize = msg.media?.filesize || msg.filesize
            metadata.mimeType = msg.media?.mimetype || msg.mimetype
          } else if (msg.type === 'location' || msg.location) {
            messageType = 'location'
            metadata.latitude = msg.location?.latitude || msg.lat
            metadata.longitude = msg.location?.longitude || msg.lng
            metadata.address = msg.location?.address || msg.address
            metadata.locationName = msg.location?.name || msg.locationName
          } else if (msg.type === 'contact' || msg.vcard) {
            messageType = 'contact'
            metadata.contactName = msg.contact?.name || msg.contactName
            metadata.phoneNumber = msg.contact?.phone || msg.phoneNumber
            metadata.email = msg.contact?.email
            metadata.organization = msg.contact?.organization
          } else if (msg.type === 'poll' || msg.poll) {
            messageType = 'poll'
            metadata.question = msg.poll?.name || msg.pollName
            metadata.pollOptions = msg.poll?.options || msg.pollOptions || []
            metadata.totalVotes = msg.poll?.totalVotes || 0
            metadata.allowMultipleAnswers = msg.poll?.multipleAnswers || false
          } else if (msg.type === 'list' || msg.list) {
            messageType = 'menu'
            metadata.menuTitle = msg.list?.title || msg.listTitle
            metadata.menuDescription = msg.list?.description || msg.listDescription
            metadata.menuItems = msg.list?.sections?.[0]?.rows || msg.listItems || []
          }
          
          return {
            id: msg.id || msg.messageId || `msg_${Date.now()}_${Math.random()}`,
            content: msg.text || msg.body || msg.message || msg.caption || '',
            sender: msg.fromMe ? 'assistant' : 'user',
            timestamp: new Date(msg.timestamp * 1000 || msg.createdAt || Date.now()).getTime(),
            type: messageType,
            status: msg.ack === 3 ? 'read' : msg.ack === 2 ? 'delivered' : msg.ack === 1 ? 'sent' : 'pending',
            mediaUrl: msg.mediaUrl || msg.media?.url || msg.url,
            metadata,
            quotedMsg: msg.quotedMsg || msg.quotedMessage,
            // Campos originais para compatibilidade
            text: msg.text || msg.body || msg.message || '',
            fromMe: msg.fromMe || false,
            from: msg.from || (msg.fromMe ? 'me' : chatId),
            to: msg.to || (msg.fromMe ? chatId : 'me'),
            ack: msg.ack || 0
          }
        })
        
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
        
        {/* Input de Mensagem - IGUAL AO ATENDIMENTO */}
        <div className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <MessageInput 
            chatId={chatId}
            onSendMessage={handleSendMessage}
            disabled={loading}
            onSendPoll={(pollData) => {
              if (!chatId) return
              // Usar API WAHA para enviar enquete
              fetch(getWahaUrl('/api/sendPoll'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: chatId,
                  poll: pollData
                })
              }).then(() => {
                console.log('📊 Enquete enviada')
                setTimeout(() => fetchMessages(), 500)
              })
            }}
            onSendList={(listData) => {
              if (!chatId) return
              console.log('🔗 Enviando lista/menu:', listData)
              
              // Usar API WAHA para enviar lista/menu
              fetch(getWahaUrl('/api/sendList'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: JSON.stringify({
                  chatId: chatId,
                  session: 'user_fb8da1d7_1758158816675',
                  message: listData,
                  reply_to: null
                })
              }).then(() => {
                console.log('✅ Lista enviada')
                setTimeout(() => fetchMessages(), 500)
              })
            }}
            onSendEvent={(eventData) => {
              if (!chatId) return
              // Usar API WAHA para enviar evento
              fetch(getWahaUrl('/api/user_fb8da1d7_1758158816675/events'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: JSON.stringify({
                  chatId: chatId,
                  event: eventData
                })
              }).then(() => {
                console.log('📅 Evento enviado')
                setTimeout(() => fetchMessages(), 500)
              })
            }}
            onSendContact={(contactsData) => {
              if (!chatId) return
              // Usar API WAHA para enviar contato
              fetch(getWahaUrl('/api/sendContactVcard'), {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json', 
                  'X-Api-Key': 'tappyone-waha-2024-secretkey' 
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: chatId,
                  contacts: contactsData
                })
              }).then(() => {
                console.log('👤 Contato enviado')
                setTimeout(() => fetchMessages(), 500)
              })
            }}
            onSendLocation={(locationData) => {
              if (!chatId) return
              // Usar API WAHA para enviar localização
              fetch(getWahaUrl('/api/sendLocation'), {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json', 
                  'X-Api-Key': 'tappyone-waha-2024-secretkey' 
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: chatId,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  name: locationData.name || '',
                  address: locationData.address || ''
                })
              }).then(() => {
                console.log('📍 Localização enviada')
                setTimeout(() => fetchMessages(), 500)
              })
            }}
            onSendMedia={async (file: File, caption: string, mediaType: 'image' | 'video' | 'document') => {
              console.log('📎 Enviando mídia:', { fileName: file.name, mediaType, caption })
              
              try {
                // Converter arquivo para base64
                const reader = new FileReader()
                const base64Promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => {
                    const base64 = reader.result as string
                    resolve(base64.split(',')[1])
                  }
                })
                reader.readAsDataURL(file)
                const base64Data = await base64Promise
                
                // Determinar o endpoint correto
                let endpoint = '/api/sendImage'
                if (mediaType === 'video') {
                  endpoint = '/api/sendVideo'
                } else if (mediaType === 'document') {
                  endpoint = '/api/sendFile'
                }
                
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
                  console.log('✅ Mídia enviada')
                  setTimeout(() => fetchMessages(), 500)
                }
              } catch (error) {
                console.error('❌ Erro ao enviar mídia:', error)
              }
            }}
            onSendAudio={async (audioBlob: Blob) => {
              console.log('🎤 Enviando áudio...')
              
              try {
                // Converter áudio para base64
                const reader = new FileReader()
                const base64Promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => {
                    const base64 = reader.result as string
                    resolve(base64.split(',')[1])
                  }
                })
                reader.readAsDataURL(audioBlob)
                const base64Data = await base64Promise
                
                const response = await fetch(getWahaUrl('/api/sendVoice'), {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'X-Api-Key': 'tappyone-waha-2024-secretkey'
                  },
                  body: JSON.stringify({
                    session: 'user_fb8da1d7_1758158816675',
                    chatId: chatId,
                    file: {
                      mimetype: 'audio/ogg; codecs=opus',
                      filename: `audio_${Date.now()}.ogg`,
                      data: base64Data
                    }
                  })
                })
                
                if (response.ok) {
                  console.log('✅ Áudio enviado')
                  setTimeout(() => fetchMessages(), 500)
                }
              } catch (error) {
                console.error('❌ Erro ao enviar áudio:', error)
              }
            }}
            onRespostaRapidaClick={() => {
              console.log('⚡ Abrindo respostas rápidas')
              setShowQuickActionsSidebar(true)
            }}
            onIAClick={() => {
              console.log('🤖 Abrindo resposta com I.A')
              setShowEditTextModal(true)
            }}
            onOpenEmojis={() => {
              console.log('😀 Abrindo emojis')
              setShowEmojisModal(true)
            }}
            onAcoesRapidasClick={() => {
              console.log('⚡ Abrindo ações rápidas')
              // TODO: Implementar ações rápidas
            }}
          />
        </div>

        {/* Componentes reais - IGUAL AO ATENDIMENTO */}
        {showEditTextModal && (
          <EditTextModal
            isOpen={showEditTextModal}
            onClose={() => setShowEditTextModal(false)}
            initialText=""
            contactName={contactName}
            actionTitle="Gerar com IA"
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
                  setShowEditTextModal(false)
                })
              }
            }}
          />
        )}

        <QuickActionsSidebar
          isOpen={showQuickActionsSidebar}
          onClose={() => setShowQuickActionsSidebar(false)}
          activeChatId={chatId}
          onSelectAction={(action) => {
            // Executar ação rápida selecionada
            console.log('⚡ Ação rápida:', action)
            setShowQuickActionsSidebar(false)
          }}
        />

        {showEmojisModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Emojis</h3>
              <div className="grid grid-cols-6 gap-2 mb-4">
                {['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '💯', '🎉'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      handleSendMessage(emoji)
                      setShowEmojisModal(false)
                    }}
                    className="text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowEmojisModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
