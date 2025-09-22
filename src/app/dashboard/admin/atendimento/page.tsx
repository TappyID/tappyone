'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import SideFilter from './components/SideFilter'
import SideChat from './components/SideChat'
import ChatHeader from './components/TopChatArea/ChatHeader'
import ChatArea from './components/ChatArea'
import FooterChatArea from './components/FooterChatArea'
import { useContatoData } from '@/hooks/useContatoData'
import useMessagesData from '@/hooks/useMessagesDataTemp'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'

// Mock data para demonstração
const mockTags = [
  { id: '1', nome: 'VIP', cor: '#10B981' },
  { id: '2', nome: 'Suporte', cor: '#3B82F6' },
  { id: '3', nome: 'Vendas', cor: '#F59E0B' }
]

const mockFilas = [
  { id: '1', nome: 'Atendimento', cor: '#8B5CF6', atendentes: [] },
  { id: '2', nome: 'Vendas', cor: '#EF4444', atendentes: [] },
  { id: '3', nome: 'Suporte', cor: '#06B6D4', atendentes: [] }
]

const mockChats = [
  {
    id: '1',
    name: 'João Silva',
    lastMessage: {
      type: 'text' as const,
      content: 'Olá, preciso de ajuda com meu pedido',
      timestamp: Date.now() - 300000,
      sender: 'user' as const,
      isRead: false
    },
    tags: [{ id: '1', nome: 'VIP', cor: '#10B981' }],
    rating: 4.5,
    unreadCount: 2
  },
  {
    id: '2', 
    name: 'Maria Santos',
    lastMessage: {
      type: 'image' as const,
      content: '',
      timestamp: Date.now() - 600000,
      sender: 'user' as const,
      isRead: true
    },
    tags: [{ id: '2', nome: 'Suporte', cor: '#3B82F6' }],
    isTransferred: true,
    transferredTo: { nome: 'Carlos' }
  },
  {
    id: '3',
    name: 'Pedro Costa',
    lastMessage: {
      type: 'text' as const,
      content: 'Obrigado pelo atendimento!',
      timestamp: Date.now() - 900000,
      sender: 'user' as const,
      isRead: true
    },
    rating: 5.0
  }
]

export default function AtendimentoPage() {
  // Estados dos filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('todas')
  const [selectedFila, setSelectedFila] = useState('todas')
  
  // Estados do chat
  const [selectedChatId, setSelectedChatId] = useState<string>()
  
  // Hook para mensagens do chat selecionado
  const { 
    messages: realMessages, 
    loading: loadingMessages, 
    error: messagesError,
    hasMore: hasMoreMessages,
    totalMessages,
    loadMore: loadMoreMessages,
    refreshMessages
  } = useMessagesData(selectedChatId)


  // refreshMessages já vem do hook useMessagesData

  // Função para votar em enquete
  const handlePollVote = useCallback(async (messageId: string, chatId: string, votes: string[]) => {
    try {
      console.log('🗳️ Votando na enquete:', { messageId, chatId, votes })
      
      const response = await fetch('http://159.65.34.199:3001/api/sendPollVote', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Api-Key': 'tappyone-waha-2024-secretkey'
        },
        body: JSON.stringify({
          session: 'user_fb8da1d7_1758158816675',
          chatId,
          pollMessageId: messageId,
          votes
        })
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      console.log('✅ Voto enviado com sucesso!')
      // Recarregar mensagens para mostrar o resultado
      setTimeout(() => refreshMessages(), 1000)
      
    } catch (error) {
      console.error('❌ Erro ao votar:', error)
      alert('Erro ao votar na enquete. Tente novamente.')
    }
  }, [refreshMessages])

  // Usar apenas mensagens reais vindas da API
  const displayMessages = useMemo(() => {
    if (!selectedChatId) return []
    console.log('📋 Display Messages:', {
      chatId: selectedChatId,
      messages: realMessages.length,
      hasMore: hasMoreMessages,
      totalMessages,
      loading: loadingMessages
    })
    return realMessages
  }, [selectedChatId, realMessages, hasMoreMessages, totalMessages, loadingMessages])

  // Estados para chats com pesquisa
  const [whatsappChats, setWhatsappChats] = useState<any[]>([])
  const [loadingChats, setLoadingChats] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  // Função para buscar chats (inicial ou pesquisa)
  const fetchChats = async (searchTerm: string = '') => {
    try {
      const isSearch = searchTerm.length > 0
      if (isSearch) setIsSearching(true)
      else setLoadingChats(true)

      const token = localStorage.getItem('token')
      if (!token) {
        console.error('Token não encontrado')
        setWhatsappChats([])
        return
      }

      const response = await fetch('/api/whatsapp/chats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const allChats = await response.json()
        
        let filteredChats = allChats
        
        // Se tem pesquisa, filtrar
        if (searchTerm) {
          filteredChats = allChats.filter((chat: any) => 
            chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          console.log(`🔍 Pesquisa "${searchTerm}": ${filteredChats.length} resultados de ${allChats.length} total`)
        } else {
          // Sem pesquisa, pegar apenas os primeiros 20
          filteredChats = allChats.slice(0, 20)
          console.log(`📱 Carregando inicial: ${filteredChats.length} de ${allChats.length} total`)
        }
        
        // Remover URLs de imagem para evitar requisições extras
        const chatsWithoutImages = filteredChats.map((chat: any) => ({
          ...chat,
          profilePictureUrl: undefined
        }))
        
        setWhatsappChats(chatsWithoutImages)
      } else {
        console.error('Erro na API:', response.status)
        setWhatsappChats([])
      }
    } catch (error) {
      console.error('Erro ao buscar chats:', error)
      setWhatsappChats([])
    } finally {
      setLoadingChats(false)
      setIsSearching(false)
    }
  }

  // Carregamento inicial
  useEffect(() => {
    fetchChats()
  }, [])

  // Debounce para pesquisa
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchChats(searchQuery)
    }, 300) // 300ms de delay

    return () => clearTimeout(timeoutId)
  }, [searchQuery])
  
  // Helper functions para processar mensagens da WAHA
  const getMessageType = (lastMessage: any): 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call' => {
    if (!lastMessage) return 'text'
    if (lastMessage.type === 'image' || lastMessage.mimetype?.startsWith('image/')) return 'image'
    if (lastMessage.type === 'video' || lastMessage.mimetype?.startsWith('video/')) return 'video'
    if (lastMessage.type === 'audio' || lastMessage.mimetype?.startsWith('audio/')) return 'audio'
    if (lastMessage.type === 'document') return 'document'
    if (lastMessage.type === 'location') return 'location'
    if (lastMessage.type === 'vcard') return 'contact'
    if (lastMessage.type === 'call_log') return 'call'
    return 'text'
  }

  const getLastMessageContent = (chat: any): string => {
    const lastMessage = chat.lastMessage
    
    if (!lastMessage) {
      return 'Conversa iniciada' // Em vez de "Sem mensagens"
    }
    
    // Se for string, retorna direto (formato antigo)
    if (typeof lastMessage === 'string') {
      return lastMessage || 'Conversa iniciada'
    }
    
    // Se for objeto (formato WAHA), extrai conteúdo baseado no tipo
    const type = getMessageType(lastMessage)
    
    switch (type) {
      case 'image': return '📷 Imagem'
      case 'video': return '🎥 Vídeo' 
      case 'audio': return '🎵 Áudio'
      case 'document': return '📄 Documento'
      case 'location': return '📍 Localização'
      case 'contact': return '👤 Contato'
      case 'call': return '📞 Chamada'
      default: 
        return lastMessage.body || lastMessage.caption || lastMessage.content || 'Conversa iniciada'
    }
  }

  const getMessageSender = (chat: any): 'user' | 'agent' => {
    const lastMessage = chat.lastMessage
    
    // Se não há mensagem, considerar como user (novo chat)
    if (!lastMessage) return 'user'
    
    // Se for string simples, usar o fromMe do chat
    if (typeof lastMessage === 'string') {
      return chat.fromMe ? 'agent' : 'user'
    }
    
    // Se for objeto WAHA, verificar fromMe da mensagem
    return lastMessage.fromMe ? 'agent' : 'user'
  }

  const getMessageReadStatus = (chat: any): boolean => {
    const lastMessage = chat.lastMessage
    
    // Se não há mensagem, considerar como lida
    if (!lastMessage) return true
    
    // Para mensagens do agente (enviadas por nós), sempre consideramos lidas
    if (getMessageSender(chat) === 'agent') return true
    
    // Para mensagens do usuário, verificar se há unreadCount
    // Se unreadCount é 0, a última mensagem foi lida
    return (chat.unreadCount || 0) === 0
  }
  
  // Usar todos os chats encontrados (pesquisa ou inicial)
  const finalChats = whatsappChats
  const finalLoading = loadingChats || isSearching
  
  // Usar todos os chats (não limitar mais a 5)
  const activeChats = useMemo(() => {
    return finalChats
  }, [finalChats])

  // Obter IDs dos chats para buscar dados dos contatos
  const activeChatIds = useMemo(() => {
    return activeChats.map(chat => {
      // Verificação mais segura para diferentes formatos de ID
      if (typeof chat.id === 'string') {
        return chat.id
      } else if (chat.id && typeof chat.id === 'object' && '_serialized' in chat.id) {
        return (chat.id as any)._serialized
      }
      return ''
    }).filter(Boolean)
  }, [activeChats])

  const { contatos: contatosData, loading: loadingContatos } = useContatoData(activeChatIds)

  // Transformar dados para o formato esperado pelos componentes
  const processedChats = useMemo(() => {
    const result = activeChats.map((chat: any) => {
      // Extrair ID de forma segura
      let chatId = ''
      if (typeof chat.id === 'string') {
        chatId = chat.id
      } else if (chat.id && typeof chat.id === 'object' && '_serialized' in chat.id) {
        chatId = chat.id._serialized
      }
      
      const contatoData: any = contatosData[chatId] || {}
      
      return {
        id: chatId,
        name: chat.name || chat.contact?.name || 'Contato sem nome',
        avatar: chat.profilePictureUrl || chat.contact?.profilePictureUrl,
        lastMessage: {
          type: getMessageType(chat.lastMessage),
          content: getLastMessageContent(chat),
          timestamp: chat.timestamp || Date.now() - Math.random() * 3600000,  
          sender: getMessageSender(chat),
          isRead: getMessageReadStatus(chat)
        },
        // Indicadores
        tags: contatoData.tags || [],
        rating: contatoData.rating,
        isOnline: Math.random() > 0.7, // Mock - depois integrar com dados reais
        connectionStatus: ['connected', 'disconnected', 'connecting'][Math.floor(Math.random() * 3)] as 'connected' | 'disconnected' | 'connecting',
        kanbanStatus: Math.random() > 0.6 ? {
          id: '1',
          nome: 'Em Atendimento',
          cor: '#3B82F6'
        } : undefined,
        fila: Math.random() > 0.8 ? {
          id: '1', 
          nome: 'Suporte',
          cor: '#10B981'
        } : undefined,
        ticketStatus: Math.random() > 0.7 ? {
          id: '1',
          nome: 'Aberto',
          cor: '#F59E0B'
        } : undefined,
        
        // Estados do chat
        unreadCount: chat.unreadCount > 0 ? chat.unreadCount : undefined,
        isTransferred: false,
        transferredTo: undefined,
        isFavorite: Math.random() > 0.8 // Mock - 20% dos chats são favoritos
      }
    }).filter(chat => chat.id) // Filtrar chats sem ID válido
    
    return result
  }, [activeChats, contatosData])
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Topbar */}
      <div className="flex-shrink-0">
        <AtendimentosTopBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Container principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Esquerda - Filtros + Chats */}
        <div className="w-[28rem] flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
          {/* Filtros */}
          <div className="flex-shrink-0">
            <SideFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTag={selectedTag}
              onTagChange={setSelectedTag}
              tags={mockTags}
              selectedFila={selectedFila}
              onFilaChange={setSelectedFila}
              filas={mockFilas}
            />
          </div>

          {/* Lista de Chats */}
          <div className="flex-1 overflow-hidden">
            <SideChat
              chats={processedChats}
              selectedChatId={selectedChatId}
              onSelectChat={setSelectedChatId}
              isLoading={finalLoading || loadingContatos}
              onTagsClick={(chatId, e) => {
                e.stopPropagation()
                console.log('🏷️ Tags clicadas:', chatId)
              }}
              onTransferClick={(chatId, e) => {
                e.stopPropagation()
                console.log('↔️ Transferir:', chatId)
              }}
              onArchiveClick={(chatId, e) => {
                e.stopPropagation()
                console.log('📁 Arquivar:', chatId)
              }}
              onHideClick={(chatId, e) => {
                e.stopPropagation()
                console.log('👁️ Ocultar:', chatId)
              }}
              onDeleteClick={(chatId, e) => {
                e.stopPropagation()
                console.log('🗑️ Deletar:', chatId)
              }}
              onFavoriteClick={(chatId, e) => {
                e.stopPropagation()
                console.log('❤️ Favoritar:', chatId)
              }}
            />
          </div>
        </div>

        {/* Área Principal - Chat Completa */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {/* Header do Chat */}
          <ChatHeader
            chat={selectedChatId ? {
              id: selectedChatId,
              name: processedChats.find(c => c.id === selectedChatId)?.name || 'Usuário',
              isOnline: Math.random() > 0.5, // Mock
              lastSeen: Date.now() - Math.random() * 3600000,
              location: 'São Paulo, SP'
            } : undefined}
            onCallClick={() => console.log('📞 Chamada iniciada')}
            onVideoClick={() => console.log('📹 Videochamada iniciada')}
            onMenuClick={() => console.log('⚙️ Menu aberto')}
          />

          {/* Área de Mensagens */}
          <ChatArea
            messages={displayMessages}
            isLoading={loadingMessages}
            hasMore={hasMoreMessages}
            totalMessages={totalMessages}
            onLoadMore={loadMoreMessages}
            selectedChat={selectedChatId ? {
              id: selectedChatId,
              name: processedChats.find(c => c.id === selectedChatId)?.name || 'Usuário'
            } : undefined}
          />
          
          {/* Debug info para mensagens */}
          {messagesError && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ Erro ao carregar mensagens: {messagesError}
              </p>
            </div>
          )}

          {/* Footer - Input de Mensagem */}
          <FooterChatArea
            onStartTyping={() => {
              if (!selectedChatId) return
              // Usar API WAHA para mostrar "digitando..."
              fetch('http://159.65.34.199:3001/api/startTyping', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Api-Key': 'tappyone-waha-2024-secretkey'
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId
                })
              }).then(() => console.log('⌨️ Iniciou digitando'))
            }}
            onStopTyping={() => {
              if (!selectedChatId) return
              // Usar API WAHA para parar "digitando..."
              fetch('http://159.65.34.199:3001/api/stopTyping', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Api-Key': 'tappyone-waha-2024-secretkey'
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId
                })
              }).then(() => console.log('⏹️ Parou de digitar'))
            }}
            onMarkAsSeen={(messageId) => {
              if (!selectedChatId) return
              // Usar API WAHA para marcar como vista (✓✓ azul)
              fetch('http://159.65.34.199:3001/api/sendSeen', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Api-Key': 'tappyone-waha-2024-secretkey'
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  messageId: messageId
                })
              }).then(() => console.log('👁️ Marcado como visto'))
            }}
            onSendMessage={(content) => {
              if (!selectedChatId) return
              // Usar API WAHA para enviar texto
              fetch('http://159.65.34.199:3001/api/sendText', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Api-Key': 'tappyone-waha-2024-secretkey'
                },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  text: content,
                  reply_to: null,
                  linkPreview: true,
                  linkPreviewHighQuality: false
                })
              }).then(async response => {
                if (response.ok) {
                  const result = await response.json()
                  console.log('✅ Mensagem enviada:', content)
                  console.log('📋 Resposta WAHA:', result)
                  
                  // Recarregar mensagens imediatamente (sem reload da página)
                  setTimeout(() => refreshMessages(), 500)
                } else {
                  const errorData = await response.json().catch(() => null)
                  console.error('❌ Erro ao enviar:', response.status, response.statusText)
                  console.error('📋 Detalhes do erro:', errorData)
                }
              }).catch(error => console.error('❌ Erro de rede:', error))
            }}
            onAttachFile={(file) => {
              if (!selectedChatId || !file) return
              // Usar API WAHA para enviar arquivo
              const formData = new FormData()
              formData.append('chatId', selectedChatId)
              formData.append('file', file)
              
              fetch('http://159.65.34.199:3001/api/user_fb8da1d7_1758158816675/sendFile', {
                method: 'POST',
                headers: { 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: formData
              }).then(response => {
                if (response.ok) {
                  console.log('✅ Arquivo enviado')
                } else {
                  console.error('❌ Erro ao enviar arquivo:', response.status)
                }
              })
            }}
            onSendImage={(file) => {
              if (!selectedChatId || !file) return
              // Usar API WAHA para enviar imagem
              const formData = new FormData()
              formData.append('chatId', selectedChatId)
              formData.append('file', file)
              
              fetch('http://159.65.34.199:3001/api/user_fb8da1d7_1758158816675/sendImage', {
                method: 'POST',
                headers: { 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: formData
              }).then(response => {
                if (response.ok) {
                  console.log('✅ Imagem enviada')
                } else {
                  console.error('❌ Erro ao enviar imagem:', response.status)
                }
              })
            }}
            onSendAudio={(audioBlob) => {
              if (!selectedChatId || !audioBlob) return
              // Usar API WAHA para enviar áudio
              const formData = new FormData()
              formData.append('session', 'user_fb8da1d7_1758158816675')
              formData.append('chatId', selectedChatId)
              formData.append('file', audioBlob, 'audio.ogg')
              
              fetch('http://159.65.34.199:3001/api/user_fb8da1d7_1758158816675/sendVoice', {
                method: 'POST',
                headers: { 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: formData
              }).then(response => {
                if (response.ok) {
                  console.log('✅ Áudio enviado')
                } else {
                  console.error('❌ Erro ao enviar áudio:', response.status)
                }
              })
            }}
            onOpenCamera={() => console.log('📷 Abrir câmera')}
            onOpenEmojis={() => console.log('😊 Abrir emojis')}
            onRespostaRapidaClick={() => console.log('💬 Resposta rápida')}
            onIAClick={() => console.log('🤖 I.A clicada')}
            onSendPoll={(pollData) => {
              if (!selectedChatId) return
              // Usar API WAHA para enviar enquete
              fetch('http://159.65.34.199:3001/api/sendPoll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  poll: pollData
                })
              }).then(() => console.log('📊 Enquete enviada'))
            }}
            onSendList={(listData) => {
              if (!selectedChatId) return
              // Usar API WAHA para enviar lista/menu
              fetch('http://159.65.34.199:3001/api/sendList', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  message: listData
                })
              }).then(() => console.log('🔗 Lista enviada'))
            }}
            onSendEvent={(eventData) => {
              if (!selectedChatId) return
              // Usar API WAHA para enviar evento
              fetch(`http://159.65.34.199:3001/api/user_fb8da1d7_1758158816675/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: JSON.stringify({
                  chatId: selectedChatId,
                  event: eventData
                })
              }).then(() => console.log('📅 Evento enviado'))
            }}
            onReaction={(messageId, emoji) => {
              if (!selectedChatId) return
              // Usar API WAHA para reagir à mensagem
              fetch('http://159.65.34.199:3001/api/reaction', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Api-Key': 'tappyone-waha-2024-secretkey' },
                body: JSON.stringify({
                  session: 'user_fb8da1d7_1758158816675',
                  chatId: selectedChatId,
                  messageId,
                  reaction: emoji
                })
              }).then(() => console.log('😀 Reação enviada'))
            }}
            selectedChat={selectedChatId ? {
              id: selectedChatId,
              name: processedChats.find(c => c.id === selectedChatId)?.name || 'Usuário'
            } : undefined}
          />
        </div>
      </div>
    </div>
  )
}
