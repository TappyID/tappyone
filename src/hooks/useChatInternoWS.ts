'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from './useAuth'

export interface ChatMessage {
  id: string
  texto: string
  remetente_id: number
  destinatario_id: number
  timestamp: string
  status: 'enviando' | 'enviada' | 'lida'
  tipo: 'texto' | 'imagem' | 'arquivo' | 'audio'
}

export interface WSChatMessage {
  type: 'chat_message' | 'message_status' | 'typing' | 'user_connected' | 'user_disconnected'
  data: any
  timestamp: string
}

export interface UseChatInternoWSOptions {
  userId: string
  onMessage?: (message: ChatMessage) => void
  onUserConnected?: (userId: string) => void
  onUserDisconnected?: (userId: string) => void
  onTyping?: (userId: string, isTyping: boolean) => void
}

export function useChatInternoWS(options: UseChatInternoWSOptions) {
  const { token, user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectInterval = 3000

  const { userId, onMessage, onUserConnected, onUserDisconnected, onTyping } = options

  // Função para conectar WebSocket
  const connect = useCallback(() => {
    if (!token || !user) {
      console.log('🔌 [ChatInternoWS] Sem token ou usuário')
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔌 [ChatInternoWS] Já conectado')
      return
    }

    try {
      setConnectionStatus('connecting')

      // URL do WebSocket do backend Go
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${wsProtocol}//159.65.34.199:8081/api/chat-interno/ws?token=${token}&session=${user.id}&user_id=${user.id}`
      
      console.log('🔌 [ChatInternoWS] Conectando:', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('✅ [ChatInternoWS] Conectado')
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
      }
      
      ws.onmessage = (event) => {
        try {
          const wsMessage: WSChatMessage = JSON.parse(event.data)
          console.log('📨 [ChatInternoWS] Mensagem recebida:', wsMessage)
          
          switch (wsMessage.type) {
            case 'chat_message':
              const chatMessage: ChatMessage = wsMessage.data
              setMessages(prev => [...prev, chatMessage])
              onMessage?.(chatMessage)
              break
              
            case 'typing':
              onTyping?.(wsMessage.data.user_id, wsMessage.data.is_typing)
              break
              
            case 'user_connected':
              onUserConnected?.(wsMessage.data.user_id)
              break
              
            case 'user_disconnected':
              onUserDisconnected?.(wsMessage.data.user_id)
              break
              
            case 'message_status':
              // Atualizar status da mensagem
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === wsMessage.data.message_id 
                    ? { ...msg, status: wsMessage.data.status }
                    : msg
                )
              )
              break
          }
        } catch (error) {
          console.error('❌ [ChatInternoWS] Erro ao processar mensagem:', error)
        }
      }
      
      ws.onclose = (event) => {
        console.log('🔴 [ChatInternoWS] Desconectado:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        
        // Auto-reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          console.log(`🔄 [ChatInternoWS] Tentativa de reconexão (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }
      
      ws.onerror = (error) => {
        console.error('❌ [ChatInternoWS] Erro:', error)
        setConnectionStatus('error')
      }
      
      wsRef.current = ws
      
    } catch (error) {
      console.error('❌ [ChatInternoWS] Erro de conexão:', error)
      setConnectionStatus('error')
    }
  }, [token, user, onMessage, onUserConnected, onUserDisconnected, onTyping])

  // Função para desconectar
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  // Função para enviar mensagem
  const sendMessage = useCallback((destinatarioId: string, texto: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'send_message',
        data: {
          destinatario_id: parseInt(destinatarioId),
          texto,
          tipo: 'texto'
        },
        timestamp: new Date().toISOString()
      }
      
      wsRef.current.send(JSON.stringify(message))
      console.log('📤 [ChatInternoWS] Mensagem enviada:', message)
      return true
    } else {
      console.warn('⚠️ [ChatInternoWS] Não é possível enviar, não conectado')
      return false
    }
  }, [])

  // Função para indicar que está digitando
  const sendTyping = useCallback((destinatarioId: string, isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'typing',
        data: {
          destinatario_id: parseInt(destinatarioId),
          is_typing: isTyping
        },
        timestamp: new Date().toISOString()
      }
      
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  // Conectar automaticamente
  useEffect(() => {
    if (token && user && userId) {
      connect()
    } else {
      disconnect()
    }

    return () => disconnect()
  }, [token, user, userId, connect, disconnect])

  // Carregar histórico de mensagens
  const loadMessages = useCallback(async (otherUserId: string) => {
    if (!token || !user) return

    try {
      console.log('📜 [ChatInternoWS] Carregando mensagens com usuário:', otherUserId)
      
      const response = await fetch(`/api/chat-interno/mensagens?other_user_id=${otherUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data || [])
        console.log('✅ [ChatInternoWS] Mensagens carregadas:', data?.length || 0)
      } else {
        console.error('❌ [ChatInternoWS] Erro ao carregar mensagens:', response.status)
      }
    } catch (error) {
      console.error('❌ [ChatInternoWS] Erro ao carregar mensagens:', error)
    }
  }, [token, user])

  return {
    isConnected,
    connectionStatus,
    messages,
    sendMessage,
    sendTyping,
    loadMessages,
    connect,
    disconnect
  }
}
