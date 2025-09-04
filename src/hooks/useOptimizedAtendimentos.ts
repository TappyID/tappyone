'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { useWhatsAppData, WhatsAppChat } from './useWhatsAppData'

// Cache global para evitar requisições repetidas
const requestCache = new Map<string, { data: any; timestamp: number; expiry: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

interface BadgeCounts {
  notesCount: number
  orcamentosCount: number
  agendamentosCount: number
  assinaturasCount: number
  contactStatus: 'synced' | 'error'
}

export function useOptimizedAtendimentos() {
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    notesCount: 0,
    orcamentosCount: 0,
    agendamentosCount: 0,
    assinaturasCount: 0,
    contactStatus: 'error'
  })
  
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppChat | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isQuickActionsSidebarOpen, setIsQuickActionsSidebarOpen] = useState(false)
  const [isAnotacoesSidebarOpen, setIsAnotacoesSidebarOpen] = useState(false)
  
  const lastFetchRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Hook principal do WhatsApp
  const whatsAppData = useWhatsAppData()

  // Cache para requisições com timeout
  const getCachedRequest = useCallback(async <T>(
    cacheKey: string, 
    requestFn: () => Promise<T>,
    cacheDuration: number = CACHE_DURATION
  ): Promise<T> => {
    const cached = requestCache.get(cacheKey)
    const now = Date.now()
    
    // Se tem cache válido, retorna
    if (cached && now < cached.timestamp + cached.expiry) {
      return cached.data as T
    }
    
    try {
      const data = await requestFn()
      requestCache.set(cacheKey, {
        data,
        timestamp: now,
        expiry: cacheDuration
      })
      return data
    } catch (error) {
      // Em caso de erro, se tem cache expirado, usa ele
      if (cached) {
        console.warn(`Usando cache expirado para ${cacheKey} devido ao erro:`, error)
        return cached.data as T
      }
      throw error
    }
  }, [])

  // Função otimizada para buscar contagem
  const fetchCount = useCallback(async (endpoint: string, chatId: string) => {
    const token = localStorage.getItem('token')
    if (!token) return 0

    const response = await fetch(`/api/${endpoint}?contato_id=${encodeURIComponent(chatId)}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: abortControllerRef.current?.signal
    })
    
    if (!response.ok) return 0
    
    const data = await response.json()
    return Array.isArray(data) ? data.length : 0
  }, [])

  // Função otimizada para verificar status do contato
  const checkContactStatus = useCallback(async (chatId: string): Promise<'synced' | 'error'> => {
    const token = localStorage.getItem('token')
    if (!token) return 'error'

    const numeroTelefone = chatId.replace('@c.us', '')
    
    const response = await fetch(`/api/contatos?numero_telefone=${numeroTelefone}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: abortControllerRef.current?.signal
    })
    
    if (!response.ok) return 'error'
    
    const data = await response.json()
    if (Array.isArray(data) && data.length > 0) {
      const contato = data[0]
      return (contato.nome || contato.numero_telefone) ? 'synced' : 'error'
    }
    
    return 'error'
  }, [])

  // Função principal otimizada para carregar dados do chat
  const loadChatData = useCallback(async (chatId: string) => {
    // Cancelar requisições anteriores
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    
    // Evitar requisições duplicadas
    if (lastFetchRef.current === chatId) {
      return
    }
    lastFetchRef.current = chatId

    try {
      // Carregar mensagens (sem cache pois precisa ser tempo real)
      whatsAppData.loadChatMessages(chatId)
      
      // Usar cache para dados que não mudam frequentemente
      const [notesCount, orcamentosCount, agendamentosCount, assinaturasCount, contactStatus] = await Promise.all([
        getCachedRequest(
          `notes-${chatId}`,
          () => fetchCount('anotacoes', chatId),
          2 * 60 * 1000 // Cache de 2 minutos
        ),
        getCachedRequest(
          `orcamentos-${chatId}`,
          () => fetchCount('orcamentos', chatId),
          5 * 60 * 1000 // Cache de 5 minutos
        ),
        getCachedRequest(
          `agendamentos-${chatId}`,
          () => fetchCount('agendamentos', chatId),
          3 * 60 * 1000 // Cache de 3 minutos
        ),
        getCachedRequest(
          `assinaturas-${chatId}`,
          () => fetchCount('assinaturas', chatId),
          10 * 60 * 1000 // Cache de 10 minutos
        ),
        getCachedRequest(
          `contact-${chatId}`,
          () => checkContactStatus(chatId),
          10 * 60 * 1000 // Cache de 10 minutos
        )
      ])

      setBadgeCounts({
        notesCount,
        orcamentosCount,
        agendamentosCount,
        assinaturasCount,
        contactStatus
      })

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Erro ao carregar dados do chat:', error)
      }
    }
  }, [getCachedRequest, fetchCount, checkContactStatus, whatsAppData.loadChatMessages])

  // Função otimizada para selecionar conversa
  const selectConversation = useCallback((conversation: WhatsAppChat | null) => {
    setSelectedConversation(conversation)
    
    if (conversation) {
      const chatId = extractChatId(conversation)
      if (chatId) {
        loadChatData(chatId)
      }
    } else {
      // Reset contadores
      setBadgeCounts({
        notesCount: 0,
        orcamentosCount: 0,
        agendamentosCount: 0,
        assinaturasCount: 0,
        contactStatus: 'error'
      })
    }
  }, [loadChatData])

  // Helper function para extrair chatId
  const extractChatId = useCallback((conversation: WhatsAppChat): string | null => {
    if (typeof conversation.id === 'string') {
      return conversation.id
    } else if (conversation.id && (conversation.id as any)._serialized) {
      return (conversation.id as any)._serialized
    }
    return null
  }, [])

  // Debounced search
  const debouncedSearch = useMemo(() => {
    const timer = useRef<NodeJS.Timeout>()
    return (query: string) => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
      timer.current = setTimeout(() => {
        setSearchQuery(query)
      }, 300)
    }
  }, [])

  // Função para recarregar dados (com debounce)
  const refreshData = useCallback(() => {
    if (selectedConversation) {
      const chatId = extractChatId(selectedConversation)
      if (chatId) {
        // Limpar cache para forçar reload
        requestCache.delete(`notes-${chatId}`)
        requestCache.delete(`orcamentos-${chatId}`)
        requestCache.delete(`agendamentos-${chatId}`)
        requestCache.delete(`assinaturas-${chatId}`)
        
        loadChatData(chatId)
      }
    }
  }, [selectedConversation, extractChatId, loadChatData])

  // Cleanup
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    lastFetchRef.current = null
  }, [])

  return {
    // Estados
    selectedConversation,
    searchQuery,
    isSidebarCollapsed,
    isQuickActionsSidebarOpen,
    isAnotacoesSidebarOpen,
    badgeCounts,
    
    // Ações otimizadas
    selectConversation,
    setSearchQuery: debouncedSearch,
    setIsSidebarCollapsed,
    setIsQuickActionsSidebarOpen,
    setIsAnotacoesSidebarOpen,
    refreshData,
    cleanup,
    
    // Dados do WhatsApp
    ...whatsAppData,
    
    // Helper
    extractChatId
  }
}
