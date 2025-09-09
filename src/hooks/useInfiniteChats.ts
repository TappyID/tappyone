'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { globalCache, cacheKeys, fetchWithCache } from '@/utils/globalCache'

// Declarar tipo para cache global
declare global {
  interface Window {
    __allChatsCache?: any[]
  }
}

const ITEMS_PER_PAGE = 8

export interface ChatItem {
  id: string
  name: string
  lastMessage: string
  timestamp: number
  unreadCount: number
  isGroup: boolean
  profilePicUrl?: string
}

export function useInfiniteChats() {
  const [chats, setChats] = useState<ChatItem[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [token, setToken] = useState<string | null>(null)
  
  const loadingRef = useRef(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Verificar token no localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    setToken(savedToken)
  }, [])

  // Função para buscar chats da API COM CACHE E PAGINAÇÃO
  const fetchChats = useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    if (loadingRef.current || !token) return
    
    try {
      loadingRef.current = true
      setLoading(true)

      // APENAS na primeira página, buscar dados da API
      if (pageNum === 0 || reset) {
        console.log(`🔄 Buscando dados da API (página ${pageNum}, reset: ${reset})`)
        
        // Buscar chats e grupos com cache (evita requisições duplicadas)
        const [chatsData, groupsData] = await Promise.all([
          fetchWithCache(
            cacheKeys.whatsappChats(token),
            '/api/whatsapp/chats',
            { headers: { 'Authorization': `Bearer ${token}` } },
            30 * 1000 // Cache de 30 segundos para chats (dados mais dinâmicos)
          ),
          fetchWithCache(
            cacheKeys.whatsappGroups(token),
            '/api/whatsapp/groups', 
            { headers: { 'Authorization': `Bearer ${token}` } },
            60 * 1000 // Cache de 1 minuto para grupos (menos dinâmicos)
          )
        ])

        // Combinar chats individuais e grupos
        const allChats = [...(Array.isArray(chatsData) ? chatsData : []), ...(Array.isArray(groupsData) ? groupsData : [])]
        
        console.log(`📊 useInfiniteChats Debug:`, {
          chatsCount: Array.isArray(chatsData) ? chatsData.length : 0,
          groupsCount: Array.isArray(groupsData) ? groupsData.length : 0,
          totalChats: allChats.length,
          pageNum,
          itemsPerPage: ITEMS_PER_PAGE
        })
        
        // Ordenar por timestamp (mais recente primeiro)
        const sortedChats = allChats.sort((a, b) => {
          const timestampA = a.conversationTimestamp || a.timestamp || 0
          const timestampB = b.conversationTimestamp || b.timestamp || 0
          return timestampB - timestampA
        })

        // Salvar todos os chats ordenados para paginação local
        window.__allChatsCache = sortedChats
      }

      // Paginação local nos dados em cache
      const allChats = window.__allChatsCache || []
      const startIndex = pageNum * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const pageChats = allChats.slice(startIndex, endIndex)
      
      console.log(`📄 Paginação: página ${pageNum}, ${startIndex}-${endIndex} de ${allChats.length} total (${pageChats.length} nesta página)`)

      // Mapear para formato padrão e buscar fotos de perfil
      const mappedChats: ChatItem[] = await Promise.all(
        pageChats.map(async chat => {
          let profilePictureUrl = null
          
          // Extrair o ID correto do chat
          let chatId = chat.id
          if (typeof chat.id === 'object') {
            chatId = chat.id.id || chat.id._serialized || chat.id.user || JSON.stringify(chat.id)
          }
          
          // Buscar foto de perfil
          try {
            const pictureResponse = await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}/picture`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (pictureResponse.ok) {
              const pictureData = await pictureResponse.json()
              profilePictureUrl = pictureData.url
              console.log(`✅ Foto encontrada para ${chat.name || chatId}:`, profilePictureUrl)
            } else {
              console.warn(`❌ Foto não encontrada para ${chat.name || chatId} (${pictureResponse.status}):`, chatId)
            }
          } catch (error) {
            console.error(`🚨 Erro ao buscar foto de ${chat.name || chatId}:`, error)
          }
          
          // Debug: Verificar dados de unread
          const unreadCount = chat.unreadCount || chat.unread || 0
          console.log(`💬 Debug ${chat.name || chat.id}:`, {
            unreadCount: chat.unreadCount,
            unread: chat.unread,
            finalUnreadCount: unreadCount,
            rawChat: { id: chat.id, unreadCount: chat.unreadCount, unread: chat.unread }
          })
          
          return {
            id: chat.id,
            name: chat.name || chat.pushName || chat.id.split('@')[0],
            lastMessage: chat.lastMessage?.body || 'Sem mensagens',
            timestamp: chat.conversationTimestamp || chat.timestamp || Date.now(),
            unreadCount: unreadCount,
            isGroup: chat.isGroup || chat.id.includes('@g.us'),
            profilePicUrl: profilePictureUrl,
            profilePictureUrl: profilePictureUrl
          }
        })
      )

      if (reset || pageNum === 0) {
        setChats(mappedChats)
      } else {
        setChats(prev => [...prev, ...mappedChats])
      }

      // Verificar se tem mais páginas
      const allChatsForCheck = window.__allChatsCache || []
      setHasMore(endIndex < allChatsForCheck.length)
      
    } catch (error) {
      console.error('Erro ao carregar chats:', error)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [token])

  // Carregar mais chats (próxima página)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchChats(nextPage, false)
    }
  }, [loading, hasMore, page, fetchChats])

  // Recarregar do início
  const refresh = useCallback(() => {
    setPage(0)
    setHasMore(true)
    fetchChats(0, true)
  }, [fetchChats])

  // Hook de scroll infinito com debug melhorado
  const handleScroll = useCallback((element: HTMLElement) => {
    if (!element) {
      console.log('🚫 handleScroll: elemento não encontrado')
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = element
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200 // 200px antes do fim (mais sensível)
    
    // Debug detalhado do scroll
    console.log('📊 Scroll Debug:', {
      scrollTop: Math.round(scrollTop),
      scrollHeight: scrollHeight,
      clientHeight: clientHeight,
      distanceFromBottom: scrollHeight - (scrollTop + clientHeight),
      isNearBottom,
      loading,
      hasMore,
      willLoadMore: isNearBottom && !loading && hasMore
    })

    if (isNearBottom && !loading && hasMore) {
      console.log('🔄 Disparando loadMore() - scroll chegou ao final!')
      loadMore()
    }
  }, [loading, hasMore, loadMore])

  // Carregar chats iniciais
  useEffect(() => {
    if (token) {
      fetchChats(0, true)
    }
  }, [token])

  // Função para configurar Intersection Observer (mais confiável que scroll)
  const setupIntersectionObserver = useCallback((element: HTMLElement) => {
    if (!element || observerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !loading && hasMore) {
          console.log('🎯 Intersection Observer: Carregando mais itens!')
          loadMore()
        }
      },
      {
        root: element,
        rootMargin: '100px', // Disparar 100px antes do final
        threshold: 0.1
      }
    )

    observerRef.current = observer
  }, [loading, hasMore, loadMore])

  // Cleanup do observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [])

  return {
    chats,
    loading,
    hasMore,
    loadMore,
    refresh,
    handleScroll,
    setupIntersectionObserver
  }
}
