'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

interface OptimizedChat {
  id: string
  name: string
  lastMessage: string
  timestamp: number
  isGroup: boolean
  isOnline?: boolean
  unreadCount?: number
  avatar?: string
}

export function useOptimizedChats() {
  const [allChats, setAllChats] = useState<OptimizedChat[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(true)
  
  const ITEMS_PER_PAGE = 50 // Carregar 50 por vez

  // Cache para avatars
  const [avatarCache, setAvatarCache] = useState<Map<string, string>>(new Map())

  // Carregar chats paginados
  const loadChats = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      setLoading(true)

      // Buscar apenas chats essenciais primeiro (sem detalhes pesados)
      const response = await fetch(`/api/whatsapp/chats?page=${pageNum}&limit=${ITEMS_PER_PAGE}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const optimizedChats: OptimizedChat[] = data.chats.map((chat: any) => ({
          id: extractChatId(chat),
          name: getOptimizedName(chat),
          lastMessage: getLastMessageQuick(chat),
          timestamp: getTimestampQuick(chat),
          isGroup: isGroupChat(chat),
          unreadCount: chat.unreadCount || 0
        }))

        if (reset) {
          setAllChats(optimizedChats)
        } else {
          setAllChats(prev => [...prev, ...optimizedChats])
        }

        setHasNextPage(data.hasNextPage || false)
        setPage(pageNum + 1)
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Função otimizada para extrair ID do chat
  const extractChatId = (chat: any): string => {
    if (typeof chat.id === 'string') return chat.id
    if (chat.id?._serialized) return chat.id._serialized
    if (chat.id?.id) return chat.id.id
    return chat.chatId || 'unknown'
  }

  // Nome otimizado (sem busca pesada de contatos)
  const getOptimizedName = (chat: any): string => {
    // Usar nome do chat se disponível
    if (chat.name && chat.name !== extractChatId(chat)) {
      return chat.name
    }

    // Para grupos, usar o nome do grupo
    if (chat.isGroup && chat.groupMetadata?.subject) {
      return chat.groupMetadata.subject
    }

    // Extrair número do telefone rapidamente
    const chatId = extractChatId(chat)
    if (chatId.includes('@')) {
      const phone = chatId.split('@')[0]
      return `+${phone}`
    }

    return 'Contato'
  }

  // Última mensagem otimizada
  const getLastMessageQuick = (chat: any): string => {
    if (chat.lastMessage?.body) return chat.lastMessage.body.slice(0, 50)
    if (chat.lastMessage?.content) return chat.lastMessage.content.slice(0, 50)
    return 'Sem mensagens'
  }

  // Timestamp otimizado
  const getTimestampQuick = (chat: any): number => {
    if (chat.lastMessage?.timestamp) return chat.lastMessage.timestamp
    if (chat.timestamp) return chat.timestamp
    return Date.now()
  }

  // Verificar se é grupo
  const isGroupChat = (chat: any): boolean => {
    return chat.isGroup || 
           extractChatId(chat).includes('@g.us') || 
           !!chat.groupMetadata
  }

  // Carregar avatar lazy (apenas quando necessário)
  const loadAvatar = useCallback(async (chatId: string) => {
    if (avatarCache.has(chatId)) {
      return avatarCache.get(chatId)
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}/picture`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.profilePictureUrl) {
          setAvatarCache(prev => new Map(prev.set(chatId, data.profilePictureUrl)))
          return data.profilePictureUrl
        }
      }
    } catch (error) {
      console.error('Erro ao carregar avatar:', error)
    }

    return null
  }, [avatarCache])

  // Busca otimizada
  const searchChats = useMemo(() => {
    return (query: string): OptimizedChat[] => {
      if (!query) return allChats

      const lowerQuery = query.toLowerCase()
      return allChats.filter(chat => 
        chat.name.toLowerCase().includes(lowerQuery) ||
        chat.lastMessage.toLowerCase().includes(lowerQuery)
      )
    }
  }, [allChats])

  // Inicializar
  useEffect(() => {
    loadChats(1, true)
  }, [loadChats])

  return {
    chats: allChats,
    loading,
    hasNextPage,
    loadMore: () => loadChats(page),
    refresh: () => loadChats(1, true),
    searchChats,
    loadAvatar
  }
}
