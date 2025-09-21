'use client'

import React, { useState, useMemo, useEffect } from 'react'
import SideFilter from './components/SideFilter'
import SideChat from './components/SideChat'
import ChatHeader from './components/TopChatArea/ChatHeader'
import ChatArea from './components/ChatArea'
import FooterChatArea from './components/FooterChatArea'
import { useContatoData } from '@/hooks/useContatoData'
import { useMessagesData } from '@/hooks/useMessagesData'

// Componente temporário - será substituído
function AtendimentosTopbar({ loading, count }: { loading?: boolean, count?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Atendimento
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? '⏳ Carregando chats...' : `📱 ${count || 0} chats carregados`}
        </div>
      </div>
    </div>
  )
}

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
  
  // Hook para mensagens REAIS do chat selecionado
  const { 
    messages: realMessages, 
    loading: loadingMessages, 
    error: messagesError,
    hasMore: hasMoreMessages,
    loadMore: loadMoreMessages
  } = useMessagesData(selectedChatId)

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
    console.log('🔍 [DEBUG] Processando chats:', activeChats.length)
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
          type: 'text' as const,
          content: chat.lastMessage || 'Sem mensagens',
          timestamp: chat.timestamp || Date.now() - Math.random() * 3600000, // timestamp aleatório nas últimas horas
          sender: 'user' as const,
          isRead: chat.unreadCount === 0
        },
        tags: contatoData.tags || [],
        rating: contatoData.rating,
        unreadCount: chat.unreadCount || 0,
        isTransferred: false,
        transferredTo: undefined
      }
    }).filter(chat => chat.id) // Filtrar chats sem ID válido
    
    return result
  }, [activeChats, contatosData])
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Topbar */}
      <div className="flex-shrink-0">
        <AtendimentosTopbar loading={finalLoading || loadingContatos} count={processedChats.length} />
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
            messages={realMessages}
            isLoading={loadingMessages}
            isTyping={selectedChatId ? Math.random() > 0.7 : false}
            typingUser="Cliente"
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
            onSendMessage={(content) => {
              console.log('📤 Enviar mensagem:', content)
              // Aqui você implementaria a lógica real de envio
            }}
            onAttachFile={() => console.log('📎 Anexar arquivo')}
            onSendImage={() => console.log('🖼️ Enviar imagem')}
            onSendAudio={() => console.log('🎤 Gravar áudio')}
            onOpenCamera={() => console.log('📷 Abrir câmera')}
            onOpenEmojis={() => console.log('😊 Abrir emojis')}
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
