'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { debugLogger } from '@/utils/debugLogger'
import { useNotificationSound } from './useNotificationSound'
import { useWebSocket, MESSAGE_TYPES, WSMessage } from './useWebSocket'

// Tipos para dados do WhatsApp
export interface WhatsAppContact {
  id: string
  name: string
  pushname?: string
  phone: string
  profilePictureUrl?: string
  isGroup: boolean
  isBlocked: boolean
  lastSeen?: string
}

export interface WhatsAppMessage {
  id: string
  chatId: string
  fromMe: boolean
  author?: string
  body: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location' | 'poll'
  timestamp: string
  status?: 'pending' | 'sent' | 'delivered' | 'read'
  quotedMessage?: WhatsAppMessage
  mediaUrl?: string
  fileName?: string
  caption?: string
}

export interface WhatsAppChat {
  id: string
  name: string
  isGroup: boolean
  profilePictureUrl?: string
  lastMessage?: WhatsAppMessage
  unreadCount: number
  timestamp: string
  isArchived: boolean
  isPinned: boolean
  labels?: string[]
  participants?: WhatsAppContact[]
}

export interface WhatsAppPresence {
  chatId: string
  isOnline: boolean
  lastSeen?: string
  isTyping: boolean
}

export function useWhatsAppData() {
  const { user } = useAuth()
  const { playNotificationSound, playSentSound } = useNotificationSound()
  const [chats, setChats] = useState<WhatsAppChat[]>([])
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [messages, setMessages] = useState<{ [chatId: string]: WhatsAppMessage[] }>({})
  const [previousMessageCounts, setPreviousMessageCounts] = useState<Record<string, number>>({})
  const [presence, setPresence] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [hasMoreChats, setHasMoreChats] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const MAX_RETRIES = 3

  // WebSocket para mensagens real-time da WAHA
  const { isConnected: wsConnected, lastMessage, connect: wsConnect } = useWebSocket({
    onMessage: (message: WSMessage) => {
      debugLogger.log('WebSocket WAHA: Received message', message)
      
      // Processar eventos da WAHA API
      if (message.event === 'message') {
        const wahaMessage = message.payload
        debugLogger.log('WebSocket WAHA: New WhatsApp message', wahaMessage)
        
        // Converter formato WAHA para nosso formato
        const convertedMessage: WhatsAppMessage = {
          id: wahaMessage.id,
          chatId: wahaMessage.from,
          fromMe: wahaMessage.fromMe || false,
          body: wahaMessage.body || '',
          type: 'text',
          timestamp: new Date(wahaMessage.timestamp * 1000).toISOString(),
          status: 'delivered'
        }
        
        // Adicionar mensagem ao estado
        setMessages(prev => {
          const updated = {
            ...prev,
            [convertedMessage.chatId]: [...(prev[convertedMessage.chatId] || []), convertedMessage]
          }
          debugLogger.log('WebSocket WAHA: Updated messages state', {
            chatId: convertedMessage.chatId,
            messageCount: updated[convertedMessage.chatId]?.length,
            totalChats: Object.keys(updated).length
          })
          return updated
        })
        
        // Atualizar último update para refletir nova mensagem
        setLastUpdate(Date.now())
        debugLogger.log('WebSocket WAHA: Message processing complete')
      }
    },
    onConnect: () => {
      debugLogger.log('WebSocket WAHA: Connected successfully')
    },
    onDisconnect: () => {
      debugLogger.log('WebSocket WAHA: Disconnected')
    },
    onError: (error) => {
      debugLogger.error('WebSocket WAHA: Error', error)
    },
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  })
  
  const isConnected = wsConnected
  
  // Conectar WebSocket quando sessão WAHA for obtida
  const connectWebSocketToWAHA = useCallback(async () => {
    try {
      // Buscar sessão ativa da WAHA para este usuário via proxy API
      const token = localStorage.getItem('token')
      const response = await fetch('/api/connections/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const result = await response.json()
        const connections = result.connections || result.data || result
        // CRITICAL: Filtrar conexão WhatsApp do usuário ATUAL, não primeira disponível
        const whatsappConnection = Array.isArray(connections) ? connections.find((conn: any) => 
          conn.platform === 'whatsapp' && conn.user_id === user?.id
        ) : null
        
        if (whatsappConnection?.session_name) {
          debugLogger.log('WebSocket WAHA: Connecting with session', whatsappConnection.session_name)
          wsConnect(whatsappConnection.session_name)
        }
      }
    } catch (error) {
      debugLogger.error('WebSocket WAHA: Error getting session', error)
    }
  }, [wsConnect])

  // Carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    if (!user) {
      return
    }
    
    if (retryCount >= MAX_RETRIES) {
      setError('Muitas tentativas falharam. Recarregue a página.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Token de autenticação não encontrado')
        setLoading(false)
        return
      }
      
      // 🚀 OTIMIZAÇÃO: Carregar apenas primeiras 50 conversas
      const INITIAL_LIMIT = 50
      const [chatsResponse, groupsResponse] = await Promise.all([
        fetch(`/api/whatsapp/chats?limit=${INITIAL_LIMIT}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/whatsapp/groups?limit=${INITIAL_LIMIT}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ])

      
      let allChats = []
      
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json()
        
        // Marcar grupos que já vêm nos chats
        const chatsWithGroupType = chatsData.map((chat: any) => {
          // Verificar se é um grupo baseado na estrutura da WAHA API
          const isGroup = chat.isGroup || 
                         (chat.id && typeof chat.id === 'string' && chat.id.includes('@g.us')) ||
                         (chat.id && typeof chat.id === 'object' && (
                           (chat.id.id && chat.id.id.includes('@g.us')) ||
                           (chat.id._serialized && chat.id._serialized.includes('@g.us'))
                         ))
          
          return {
            ...chat,
            isGroup,
            type: isGroup ? 'group' : 'individual'
          }
        })
        
        allChats = [...chatsWithGroupType]
      }
      
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        
        // Verificar se grupos já existem nos chats para evitar duplicação
        const existingChatIds = new Set(allChats.map(chat => {
          if (typeof chat.id === 'object') {
            return chat.id.id || chat.id._serialized || JSON.stringify(chat.id)
          }
          return chat.id
        }))
        
        // Filtrar grupos que não estão nos chats
        const newGroups = groupsData.filter((group: any) => {
          let groupId = group.id
          if (typeof group.id === 'object') {
            groupId = group.id.id || group.id._serialized || JSON.stringify(group.id)
          }
          return !existingChatIds.has(groupId)
        })
        
        
        // Adicionar apenas grupos novos, marcando como grupos
        const groupsWithType = newGroups.map((group: any) => ({
          ...group,
          isGroup: true,
          type: 'group'
        }))
        allChats = [...allChats, ...groupsWithType]
      }
      
      if (allChats.length > 0) {
        
        // Mapear dados da WAHA API para o formato esperado
        const transformedChats = await Promise.all(allChats.map(async (chat: any) => {
          let profilePictureUrl = null
          
          // Extrair o ID correto do chat (pode estar em chat.id.id ou chat.id._serialized)
          let chatId = chat.id
          if (typeof chat.id === 'object') {
            chatId = chat.id.id || chat.id._serialized || chat.id.user || JSON.stringify(chat.id)
          }
          
          // Buscar foto de perfil usando API route do Next.js (sem logs excessivos)
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
            }
          } catch (pictureError) {
            // Silenciar erros de foto de perfil
          }
          
          return {
            ...chat,
            profilePictureUrl
          }
        }))
        
        setChats(transformedChats)
      } else {
        const errorText = await chatsResponse.text()
        setRetryCount(prev => prev + 1)
        setError(`Erro ${chatsResponse.status}: ${errorText}`)
        setLoading(false)
        return
      }

      // Buscar contatos usando API do Next.js
      const contactsResponse = await fetch(`/api/whatsapp/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json()
        setContacts(contactsData)
      }

    } catch (err) {
      setRetryCount(prev => prev + 1)
      setError('Erro ao carregar dados do WhatsApp')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Carregar mensagens de um chat específico
  const loadChatMessages = useCallback(async (chatId: string) => {
    if (!user) {
      return []
    }
    
    if (messages[chatId]) {
      return messages[chatId]
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return []
      }
      
      // Usar API do Next.js em vez de chamada direta
      const response = await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const messagesData = await response.json()
        
        // Processar mensagens para converter formato WAHA para nosso formato
        const processedMessages = messagesData.map((msg: any) => {
          const baseMessage = {
            id: msg.id?._serialized || msg.id || `msg_${Date.now()}_${Math.random()}`,
            chatId: chatId,
            fromMe: msg.fromMe || false,
            author: msg.author || msg.from,
            body: msg.body || msg.text || '',
            type: msg.processedType || msg.type || 'text',
            timestamp: new Date(msg.timestamp * 1000 || Date.now()).toISOString(),
            status: msg.ack === 3 ? 'read' : msg.ack === 2 ? 'delivered' : msg.ack === 1 ? 'sent' : 'pending',
            mediaUrl: msg.mediaUrl,
            fileName: msg.filename || msg.fileName,
            caption: msg.caption
          } as any
          
          // Preservar dados de poll
          if (msg.poll || msg.type === 'poll') {
            baseMessage.poll = msg.poll
          }
          
          // Preservar dados de location
          if (msg.location || msg.type === 'location') {
            baseMessage.location = msg.location
            baseMessage.latitude = msg.latitude
            baseMessage.longitude = msg.longitude
          }
          
          return baseMessage
        })

        const sortedMessages = processedMessages.sort((a: WhatsAppMessage, b: WhatsAppMessage) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        
        setMessages(prev => ({
          ...prev,
          [chatId]: sortedMessages
        }))
        
        return sortedMessages
      } else {
        return []
      }
    } catch (err) {
      return []
    }
  }, [user, messages])

  // Forçar reload das mensagens de um chat (ignora cache)
  const reloadChatMessages = useCallback(async (chatId: string) => {
    if (!user) {
      return []
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return []
      }
      
      // Usar API do Next.js em vez de chamada direta
      const response = await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const messagesData = await response.json()
        
        // Processar mensagens para converter formato WAHA para nosso formato
        const processedMessages = messagesData.map((msg: any) => {
          const baseMessage = {
            id: msg.id?._serialized || msg.id || `msg_${Date.now()}_${Math.random()}`,
            chatId: chatId,
            fromMe: msg.fromMe || false,
            author: msg.author || msg.from,
            body: msg.body || msg.text || '',
            type: msg.processedType || msg.type || 'text',
            timestamp: new Date(msg.timestamp * 1000 || Date.now()).toISOString(),
            status: msg.ack === 3 ? 'read' : msg.ack === 2 ? 'delivered' : msg.ack === 1 ? 'sent' : 'pending',
            mediaUrl: msg.mediaUrl,
            fileName: msg.filename || msg.fileName,
            caption: msg.caption
          } as any
          
          // Preservar dados de poll
          if (msg.poll || msg.type === 'poll') {
            baseMessage.poll = msg.poll
          }
          
          // Preservar dados de location
          if (msg.location || msg.type === 'location') {
            baseMessage.location = msg.location
            baseMessage.latitude = msg.latitude
            baseMessage.longitude = msg.longitude
          }
          
          return baseMessage
        })

        const sortedMessages = processedMessages.sort((a: WhatsAppMessage, b: WhatsAppMessage) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        
        // Detectar mensagens novas para tocar som usando localStorage para persistência
        const storageKey = `messageCount_${chatId}`
        const previousCount = parseInt(localStorage.getItem(storageKey) || '0')
        const currentCount = sortedMessages.length
        const newMessagesCount = currentCount - previousCount
        
        // Salvar nova contagem no localStorage
        localStorage.setItem(storageKey, currentCount.toString())
        
        const previousMessages = messages[chatId] || []
        
        
        // Se há mensagens novas e não são do usuário atual, tocar som
        if (newMessagesCount > 0 && previousCount > 0) {
          const newMessages = sortedMessages.slice(-newMessagesCount)
          const hasNewIncomingMessages = newMessages.some(msg => !msg.fromMe)
          
          if (hasNewIncomingMessages) {
            playNotificationSound()
          }
        }
        
        // Sempre atualiza, mesmo se já existir
        setMessages(prev => ({
          ...prev,
          [chatId]: sortedMessages
        }))
        
        return sortedMessages
      } else {
        return []
      }
    } catch (err) {
      return []
    }
  }, [user, playNotificationSound])

  // Enviar mensagem seguindo boas práticas WAHA anti-bloqueio
  const sendWhatsAppMessage = useCallback(async (chatId: string, text: string) => {
    if (!user) return false

    try {
      const token = localStorage.getItem('token')
      
      // 1. Marcar como visualizada (sendSeen) - usar API route
      await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}/seen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // 2. Começar a digitar (startTyping) - usar API route
      await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}/typing/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // 3. Aguardar intervalo baseado no tamanho da mensagem (simular digitação)
      const typingDelay = Math.min(Math.max(text.length * 50, 1000), 5000) // 50ms por char, min 1s, max 5s
      await new Promise(resolve => setTimeout(resolve, typingDelay))

      // 4. Parar de digitar (stopTyping) - usar API route
      await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}/typing/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // 5. Enviar mensagem - usar API route
      const response = await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (response.ok) {
        playSentSound()
        return true
      }
      return false
    } catch (err) {
      console.error('Error sending message:', err)
      return false
    }
  }, [user, playSentSound])

  // Marcar como lida
  const markAsRead = useCallback(async (chatId: string) => {
    if (!user) return

    try {
      const token = localStorage.getItem('token')
      
      // Usar API route do Next.js
      await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Atualizar localmente
      setChats(prev => prev.map(chat =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      ))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }, [user])

  // Função mock para presença (removida para melhorar performance)
  const getPresence = useCallback(async () => {
    return null
  }, [])

  // Marcar mensagens como lidas (implementação real)
  const markAsReadReal = useCallback(async (chatId: string) => {
    if (!user) return false

    try {
      const token = localStorage.getItem('token')
      
      // Usar API route do Next.js
      const response = await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        return true
      }
    } catch (err) {
      // Silenciar erro
    }
    return false
  }, [user])

  // Função mock para indicador de digitação (removida para melhorar performance)
  const sendTyping = useCallback(async (chatId: string, isTyping: boolean) => {
    return true
  }, [])

  // Carregar dados iniciais apenas uma vez quando user muda
  useEffect(() => {
    if (user) {
      loadInitialData()
      connectWebSocketToWAHA() // Conectar WebSocket após carregar dados
    }
  }, [user]) // Remover dependências que causam loop

  // Polling inteligente - atualiza dados a cada 5 segundos
  useEffect(() => {
    if (!user || chats.length === 0) return

    const interval = setInterval(() => {
      loadInitialData()
      setLastUpdate(Date.now())
    }, 30000) // 30 segundos - otimizado

    return () => clearInterval(interval)
  }, [user, chats.length]) // Remover loadInitialData para evitar loop

  // Função para resetar retry count
  const resetRetry = useCallback(() => {
    setRetryCount(0)
    setError(null)
  }, [])

  // Função para refresh manual
  const refreshData = useCallback(() => {
    setLastUpdate(Date.now())
    return loadInitialData()
  }, [loadInitialData])

  // 🚀 Função para carregar mais conversas
  const loadMoreChats = useCallback(async () => {
    if (loadingMore || !hasMoreChats || !user) return

    try {
      setLoadingMore(true)
      const token = localStorage.getItem('token')
      
      if (!token) return

      const currentCount = chats.length
      const BATCH_SIZE = 50
      
      debugLogger.log(`🔄 [useWhatsAppData] Tentando carregar mais chats - offset: ${currentCount}`)
      
      const [chatsResponse, groupsResponse] = await Promise.all([
        fetch(`/api/whatsapp/chats?limit=${BATCH_SIZE}&offset=${currentCount}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => {
          debugLogger.error(`❌ Erro na requisição de chats (offset ${currentCount}):`, err)
          return { ok: false, status: 500 }
        }),
        fetch(`/api/whatsapp/groups?limit=${BATCH_SIZE}&offset=${currentCount}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => {
          debugLogger.error(`❌ Erro na requisição de grupos (offset ${currentCount}):`, err)
          return { ok: false, status: 500 }
        })
      ])

      let newChats = []
      let hasAnySuccess = false
      
      // Verificar resposta de chats
      if (chatsResponse.ok && 'json' in chatsResponse) {
        try {
          const chatsData = await chatsResponse.json()
          if (Array.isArray(chatsData)) {
            newChats = [...newChats, ...chatsData]
            hasAnySuccess = true
            debugLogger.log(`✅ Carregados ${chatsData.length} chats individuais`)
          }
        } catch (parseError) {
          debugLogger.error('❌ Erro ao parsear resposta de chats:', parseError)
        }
      } else {
        debugLogger.log(`⚠️ Falha na requisição de chats: status ${chatsResponse.status}`)
        // Se erro 500, parar tentativas futuras para evitar loop
        if (chatsResponse.status === 500) {
          debugLogger.log(`🚫 Erro 500 detectado - interrompendo carregamento adicional`)
          setHasMoreChats(false)
          return
        }
      }
      
      // Verificar resposta de grupos
      if (groupsResponse.ok && 'json' in groupsResponse) {
        try {
          const groupsData = await groupsResponse.json()
          if (Array.isArray(groupsData)) {
            newChats = [...newChats, ...groupsData]
            hasAnySuccess = true
            debugLogger.log(`✅ Carregados ${groupsData.length} grupos`)
          }
        } catch (parseError) {
          debugLogger.error('❌ Erro ao parsear resposta de grupos:', parseError)
        }
      } else {
        debugLogger.log(`⚠️ Falha na requisição de grupos: status ${groupsResponse.status}`)
        // Se erro 500, parar tentativas futuras para evitar loop
        if (groupsResponse.status === 500) {
          debugLogger.log(`🚫 Erro 500 detectado - interrompendo carregamento adicional`)
          setHasMoreChats(false)
          return
        }
      }

      // Se nenhuma requisição teve sucesso, não atualizar estado
      if (!hasAnySuccess) {
        debugLogger.log('⚠️ Nenhuma requisição teve sucesso - mantendo estado atual')
        setHasMoreChats(false)
        return
      }

      // Se retornou menos itens que o esperado, não há mais chats
      if (newChats.length < BATCH_SIZE) {
        debugLogger.log(`🏁 Fim dos chats: recebidos ${newChats.length}/${BATCH_SIZE}`)
        setHasMoreChats(false)
      }

      // Atualizar estado apenas se tiver novos chats
      if (newChats.length > 0) {
        setChats(prev => {
          // Evitar duplicatas usando Set com ID único
          const existingIds = new Set(prev.map(chat => chat.id))
          const uniqueNewChats = newChats.filter(chat => !existingIds.has(chat.id))
          
          if (uniqueNewChats.length > 0) {
            const updated = [...prev, ...uniqueNewChats]
            debugLogger.log(`📊 Total de chats após carregamento: ${updated.length} (${uniqueNewChats.length} novos)`)
            return updated
          } else {
            debugLogger.log(`⚠️ Nenhum chat novo (${newChats.length} já existiam)`)
            return prev
          }
        })
      }
      
    } catch (error) {
      debugLogger.error('❌ Erro crítico ao carregar mais chats:', error)
      // Em caso de erro crítico, parar tentativas futuras
      setHasMoreChats(false)
    } finally {
      setLoadingMore(false)
    }
  }, [chats.length, hasMoreChats, loadingMore, user])

  return {
    chats,
    contacts,
    messages,
    presence,
    loading,
    error,
    isConnected,
    lastUpdate: new Date(lastUpdate).toLocaleTimeString(),
    loadChatMessages,
    reloadChatMessages,
    sendWhatsAppMessage,
    markAsRead,
    markAsReadReal,
    sendTyping,
    getPresence,
    refreshData,
    resetRetry,
    retryCount,
    loadMoreChats,
    hasMoreChats,
    loadingMore
  }
}
