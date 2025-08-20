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
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      
      if (!token) {
        setError('Token de autenticação não encontrado')
        setLoading(false)
        return
      }
      
      // Buscar chats e grupos em paralelo
      
      const [chatsResponse, groupsResponse] = await Promise.all([
        fetch(`${backendUrl}/api/whatsapp/chats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${backendUrl}/api/whatsapp/groups`, {
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
          
          // Buscar foto de perfil usando o endpoint correto da WAHA API (sem logs excessivos)
          try {
            const wahaApiUrl = process.env.NEXT_PUBLIC_WAHA_API_URL || 'https://apiwhatsapp.vyzer.com.br/api'
            const wahaApiKey = process.env.NEXT_PUBLIC_WAHA_API_KEY || 'atendia-waha-2024-secretkey'
            const sessionName = `user_${user.id}`
            
            const pictureResponse = await fetch(`${wahaApiUrl}/${sessionName}/chats/${chatId}/picture`, {
              headers: {
                'X-Api-Key': wahaApiKey,
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
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const messagesData = await response.json()
        
        // Processar mensagens para converter formato WAHA para nosso formato
        const processedMessages = messagesData.map((msg: any) => ({
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
        }))

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
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const messagesData = await response.json()
        
        // Processar mensagens para converter formato WAHA para nosso formato
        const processedMessages = messagesData.map((msg: any) => ({
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
        }))

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

  // Enviar mensagem
  const sendWhatsAppMessage = useCallback(async (chatId: string, text: string) => {
    if (!user) return false

    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/messages`, {
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
  }, [user])

  // Marcar como lida
  const markAsRead = useCallback(async (chatId: string) => {
    if (!user) return

    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      
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

  // Função mock para presença (removida para melhorar performance)
  const getPresence = useCallback(async () => {
    return null
  }, [])

  // Marcar mensagens como lidas (implementação real)
  const markAsReadReal = useCallback(async (chatId: string) => {
    if (!user) return false

    try {
      const token = localStorage.getItem('token')
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      
      const response = await fetch(`${backendUrl}/api/whatsapp/chats/${chatId}/read`, {
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
    if (user && chats.length === 0 && contacts.length === 0 && !loading) {
      loadInitialData()
    }
  }, [user]) // Simplificado para evitar loops

  // Polling inteligente - atualiza dados a cada 5 segundos
  useEffect(() => {
    if (!user || chats.length === 0) return

    const interval = setInterval(() => {
      loadInitialData()
      setLastUpdate(Date.now())
    }, 30000) // 30 segundos - otimizado

    return () => clearInterval(interval)
  }, [user, chats.length, loadInitialData])

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
