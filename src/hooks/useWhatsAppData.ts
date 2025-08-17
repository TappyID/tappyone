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
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker' | 'location'
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
  const [messages, setMessages] = useState<Record<string, WhatsAppMessage[]>>({})
  const [previousMessageCounts, setPreviousMessageCounts] = useState<Record<string, number>>({})
  const [presence, setPresence] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3

  // WebSocket temporariamente desabilitado para debug
  // const { isConnected: wsConnected, lastMessage } = useWebSocket({
  const wsConnected = false
  const lastMessage = null
  /*
    onMessage: (message: WSMessage) => {
      debugLogger.log('WebSocket: Received message', message)
      
      if (message.type === MESSAGE_TYPES.NEW_MESSAGE) {
        const messageData = message.data as WhatsAppMessage
        debugLogger.log('WebSocket: New WhatsApp message', messageData)
        debugLogger.log('WebSocket: Adding to chatId:', messageData.chatId)
        
        // Adicionar mensagem ao estado
        setMessages(prev => {
          const updated = {
            ...prev,
            [messageData.chatId]: [...(prev[messageData.chatId] || []), messageData]
          }
          debugLogger.log('WebSocket: Updated messages state', {
            chatId: messageData.chatId,
            messageCount: updated[messageData.chatId]?.length,
            totalChats: Object.keys(updated).length
          })
          return updated
        })
        
        // Atualizar último update para refletir nova mensagem
        setLastUpdate(Date.now())
        debugLogger.log('WebSocket: Message processing complete')
      }
    },
    onConnect: () => {
      debugLogger.log('WebSocket: Connected successfully')
    },
    onDisconnect: () => {
      debugLogger.log('WebSocket: Disconnected')
    },
    onError: (error) => {
      debugLogger.error('WebSocket: Error', error)
    },
    autoReconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
  })
  */
  
  const isConnected = wsConnected
  
  // Carregar dados iniciais
  const loadInitialData = useCallback(async () => {
    debugLogger.log('loadInitialData: Starting...', { user: user?.id, retryCount })
    
    if (!user) {
      debugLogger.log('loadInitialData: No user, aborting')
      return
    }
    
    if (retryCount >= MAX_RETRIES) {
      debugLogger.error('loadInitialData: Max retries reached, stopping')
      setError('Muitas tentativas falharam. Recarregue a página.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      debugLogger.log('loadInitialData: Set loading to true')

      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      
      debugLogger.log('loadInitialData: Config', { 
        hasToken: !!token, 
        backendUrl,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
      })
      
      if (!token) {
        debugLogger.error('loadInitialData: No token found in localStorage')
        setError('Token de autenticação não encontrado')
        setLoading(false)
        return
      }
      
      // Buscar chats
      debugLogger.log('loadInitialData: Fetching chats from:', `${backendUrl}/api/whatsapp/chats`)
      const chatsResponse = await fetch(`${backendUrl}/api/whatsapp/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      debugLogger.log('loadInitialData: Chats response status:', chatsResponse.status)
      
      if (chatsResponse.ok) {
        const chatsData = await chatsResponse.json()
        debugLogger.log('loadInitialData: Chats data received:', chatsData)
        
        // Mapear dados da WAHA API para o formato esperado
        const transformedChats = await Promise.all(chatsData.map(async (chat: any) => {
          let profilePictureUrl = null
          
          // Debug: verificar estrutura do chat
          debugLogger.log('loadInitialData: Processing chat:', { chat, chatId: chat.id, chatIdType: typeof chat.id })
          
          // Extrair o ID correto do chat (pode estar em chat.id.id ou chat.id._serialized)
          let chatId = chat.id
          if (typeof chat.id === 'object') {
            chatId = chat.id.id || chat.id._serialized || chat.id.user || JSON.stringify(chat.id)
            debugLogger.log('loadInitialData: Extracted chatId from object:', chatId)
          }
          
          // Buscar foto de perfil usando o endpoint correto da WAHA API
          try {
            const wahaApiUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'https://apiwhatsapp.vyzer.com.br/api'
            const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'atendia-waha-2024-secretkey'
            const sessionName = `user_${user.id}` // Assumindo que o user.id é usado como session
            
            debugLogger.log('loadInitialData: Fetching picture for chatId:', chatId)
            const pictureResponse = await fetch(`${wahaApiUrl}/${sessionName}/chats/${chatId}/picture`, {
              headers: {
                'X-Api-Key': wahaApiKey,
                'Content-Type': 'application/json'
              }
            })
            
            if (pictureResponse.ok) {
              const pictureData = await pictureResponse.json()
              profilePictureUrl = pictureData.url
              debugLogger.log(`loadInitialData: Profile picture loaded for ${chatId}:`, pictureData.url)
            } else {
              debugLogger.log(`loadInitialData: No profile picture for ${chatId}:`, pictureResponse.status)
            }
          } catch (pictureError) {
            debugLogger.log(`loadInitialData: Error loading picture for ${chatId}:`, pictureError)
          }
          
          return {
            ...chat,
            profilePictureUrl
          }
        }))
        
        setChats(transformedChats)
      } else {
        const errorText = await chatsResponse.text()
        debugLogger.error('loadInitialData: Failed to fetch chats', {
          status: chatsResponse.status,
          error: errorText
        })
        setRetryCount(prev => prev + 1)
        setError(`Erro ${chatsResponse.status}: ${errorText}`)
        setLoading(false)
        return
      }

      // Buscar contatos
      const contactsResponse = await fetch(`${backendUrl}/api/whatsapp/contacts`, {
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
      debugLogger.error('loadInitialData: Catch block error', err)
      setRetryCount(prev => prev + 1)
      setError('Erro ao carregar dados do WhatsApp')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Carregar mensagens de um chat específico
  const loadChatMessages = useCallback(async (chatId: string) => {
    if (!user) {
      debugLogger.error('loadChatMessages: No user found')
      return []
    }
    
    if (messages[chatId]) {
      debugLogger.log('loadChatMessages: Messages already loaded for chat:', chatId)
      return messages[chatId]
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        debugLogger.error('loadChatMessages: No token found')
        return []
      }
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      debugLogger.log('loadChatMessages: Fetching messages for chat:', chatId)
      
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const messagesData = await response.json()
        debugLogger.log('loadChatMessages: Messages loaded successfully:', {
          chatId,
          messagesCount: messagesData.length
        })
        
        const sortedMessages = messagesData.sort((a: WhatsAppMessage, b: WhatsAppMessage) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        
        setMessages(prev => ({
          ...prev,
          [chatId]: sortedMessages
        }))
        
        return sortedMessages
      } else {
        const errorText = await response.text()
        debugLogger.error('loadChatMessages: Failed to fetch messages', {
          chatId,
          status: response.status,
          error: errorText
        })
        return []
      }
    } catch (err) {
      debugLogger.error('loadChatMessages: Error loading chat messages', {
        chatId,
        error: err
      })
      return []
    }
  }, [user, messages])

  // Forçar reload das mensagens de um chat (ignora cache)
  const reloadChatMessages = useCallback(async (chatId: string) => {
    if (!user) {
      debugLogger.error('reloadChatMessages: No user found')
      return []
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        debugLogger.error('reloadChatMessages: No token found')
        return []
      }
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      debugLogger.log('reloadChatMessages: Force reloading messages for chat:', chatId)
      
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const messagesData = await response.json()
        debugLogger.log('reloadChatMessages: Messages reloaded successfully:', {
          chatId,
          messagesCount: messagesData.length
        })
        
        const sortedMessages = messagesData.sort((a: WhatsAppMessage, b: WhatsAppMessage) => 
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
        
        debugLogger.log('Sound Detection Debug:', {
          chatId,
          previousCountFromStorage: previousCount,
          currentCount: currentCount,
          newMessagesCount,
          previousMessagesInMemory: previousMessages.length,
          shouldCheckForSound: newMessagesCount > 0 && previousCount > 0
        })
        
        // Se há mensagens novas e não são do usuário atual, tocar som
        if (newMessagesCount > 0 && previousCount > 0) {
          const newMessages = sortedMessages.slice(-newMessagesCount)
          const hasNewIncomingMessages = newMessages.some(msg => !msg.fromMe)
          
          debugLogger.log('New messages analysis:', {
            newMessages: newMessages.map(msg => ({ id: msg.id, fromMe: msg.fromMe, body: msg.body?.substring(0, 50) })),
            hasNewIncomingMessages
          })
          
          if (hasNewIncomingMessages) {
            debugLogger.log('🔔 New incoming messages detected, playing notification sound!')
            playNotificationSound()
          }
        } else if (newMessagesCount > 0) {
          debugLogger.log('New messages detected but no previous messages to compare (first load)')
        } else {
          debugLogger.log('No new messages detected')
        }
        
        // Sempre atualiza, mesmo se já existir
        setMessages(prev => ({
          ...prev,
          [chatId]: sortedMessages
        }))
        
        return sortedMessages
      } else {
        debugLogger.error('reloadChatMessages: Failed to reload messages', {
          chatId,
          status: response.status,
          statusText: response.statusText
        })
        return []
      }
    } catch (err) {
      debugLogger.error('reloadChatMessages: Error reloading chat messages', {
        chatId,
        error: err
      })
      return []
    }
  }, [user])

  // Enviar mensagem
  const sendWhatsAppMessage = useCallback(async (chatId: string, text: string) => {
    if (!user) return false

    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (response.ok) {
        debugLogger.log('Message sent successfully, playing sent sound')
        playSentSound()
        return true
      }
      return false
    } catch (err) {
      console.error('Error sending message:', err)
      return false
    }
  }, [user])

  // Marcar como lida
  const markAsRead = useCallback(async (chatId: string) => {
    if (!user) return

    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      
      await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/read`, {
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

  // Obter informações de presença
  const getPresence = useCallback(async () => {
    if (!user) return null

    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      
      const response = await fetch(`${backendUrl}/api/whatsapp/presence`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const presenceData = await response.json()
        debugLogger.log('Presence data loaded:', presenceData)
        return presenceData
      }
    } catch (err) {
      debugLogger.error('Error getting presence:', err)
    }
    return null
  }, [user])

  // Marcar mensagens como lidas (implementação real)
  const markAsReadReal = useCallback(async (chatId: string) => {
    if (!user) return false

    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        debugLogger.log('Messages marked as read:', chatId)
        return true
      }
    } catch (err) {
      debugLogger.error('Error marking as read:', err)
    }
    return false
  }, [user])

  // Enviar status de digitação (implementação real)
  const sendTyping = useCallback(async (chatId: string, isTyping: boolean) => {
    if (!user) return false

    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
      
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/typing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          presence: isTyping ? 'typing' : 'paused' 
        })
      })

      if (response.ok) {
        debugLogger.log('Typing status sent:', { chatId, isTyping })
        return true
      }
    } catch (err) {
      debugLogger.error('Error sending typing status:', err)
    }
    return false
  }, [user])

  // Carregar dados iniciais apenas uma vez quando user muda
  useEffect(() => {
    debugLogger.log('useWhatsAppData: useEffect triggered', { 
      user: user?.id, 
      hasUser: !!user,
      chatsLength: chats.length,
      contactsLength: contacts.length
    })
    
    if (user && chats.length === 0 && contacts.length === 0 && !loading) {
      debugLogger.log('useWhatsAppData: Loading initial data...')
      loadInitialData()
    } else {
      debugLogger.log('useWhatsAppData: Skipping data load', {
        hasUser: !!user,
        hasChats: chats.length > 0,
        hasContacts: contacts.length > 0,
        isLoading: loading
      })
    }
  }, [user]) // Simplificado para evitar loops

  // Polling inteligente - atualiza dados a cada 5 segundos
  useEffect(() => {
    if (!user || chats.length === 0) return

    const interval = setInterval(() => {
      debugLogger.log('Polling: Updating WhatsApp data...')
      loadInitialData()
      setLastUpdate(Date.now())
    }, 3000) // 3 segundos - MAIS RÁPIDO! 🚀

    return () => clearInterval(interval)
  }, [user, chats.length, loadInitialData])

  // Função para resetar retry count
  const resetRetry = useCallback(() => {
    setRetryCount(0)
    setError(null)
    debugLogger.log('Retry count reset')
  }, [])

  // Função para refresh manual
  const refreshData = useCallback(() => {
    debugLogger.log('Manual refresh triggered')
    setLastUpdate(Date.now())
    return loadInitialData()
  }, [loadInitialData])

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
    retryCount
  }
}
