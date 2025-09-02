'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from './useAuth'

// Tipos de mensagem WebSocket
export interface WSMessage {
  type: string
  data: any
  user_id?: string
  timestamp: string
}

// Tipos de mensagem
export const MESSAGE_TYPES = {
  NEW_MESSAGE: 'new_message',
  MESSAGE_STATUS: 'message_status',
  TYPING: 'typing',
  PRESENCE: 'presence',
  CONNECTION: 'connection',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong'
} as const

export interface UseWebSocketOptions {
  onMessage?: (message: WSMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  autoReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user, isAuthenticated, token } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options

  // Função para conectar WebSocket
  const connect = useCallback(() => {
    if (!isAuthenticated || !user) {
      console.log('WebSocket: User not authenticated')
      return
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Already connected')
      return
    }

    try {
      setConnectionStatus('connecting')
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Construir URL WebSocket com token como query parameter
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
      const wsUrl = backendUrl.replace(/^https?:/, wsProtocol) + `/ws?token=${encodeURIComponent(token)}`
      
      console.log('WebSocket: Connecting to', wsUrl)
      
      const ws = new WebSocket(wsUrl)
      
      // Adicionar token no header (se suportado pelo navegador)
      // Como WebSocket não suporta headers customizados, vamos enviar o token na primeira mensagem
      
      ws.onopen = () => {
        console.log('WebSocket: Connected')
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttemptsRef.current = 0
        
        // Enviar token de autenticação
        ws.send(JSON.stringify({
          type: 'auth',
          data: { token },
          timestamp: new Date().toISOString()
        }))
        
        // Iniciar ping/pong
        startPingPong()
        
        onConnect?.()
      }
      
      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          console.log('WebSocket: Received message', message)
          
          setLastMessage(message)
          
          // Handle pong messages
          if (message.type === MESSAGE_TYPES.PONG) {
            console.log('WebSocket: Received pong')
            return
          }
          
          onMessage?.(message)
        } catch (error) {
          console.error('WebSocket: Error parsing message', error)
        }
      }
      
      ws.onclose = (event) => {
        console.log('WebSocket: Disconnected', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        stopPingPong()
        
        onDisconnect?.()
        
        // Auto-reconnect
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          console.log(`WebSocket: Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket: Error', error)
        setConnectionStatus('error')
        onError?.(error)
      }
      
      wsRef.current = ws
      
    } catch (error) {
      console.error('WebSocket: Connection error', error)
      setConnectionStatus('error')
    }
  }, [isAuthenticated, user, onConnect, onDisconnect, onError, onMessage, autoReconnect, maxReconnectAttempts, reconnectInterval])

  // Função para desconectar
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    stopPingPong()
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  // Função para enviar mensagem
  const sendMessage = useCallback((type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        type,
        data,
        timestamp: new Date().toISOString()
      }
      
      wsRef.current.send(JSON.stringify(message))
      console.log('WebSocket: Sent message', message)
      return true
    } else {
      console.warn('WebSocket: Cannot send message, not connected')
      return false
    }
  }, [])

  // Ping/Pong para manter conexão viva
  const startPingPong = useCallback(() => {
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage(MESSAGE_TYPES.PING, { timestamp: Date.now() })
      }
    }, 30000) // Ping a cada 30 segundos
  }, [sendMessage])

  const stopPingPong = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
  }, [])

  // Conectar automaticamente quando autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      connect()
    } else {
      disconnect()
    }

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [isAuthenticated, user, connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    connect,
    disconnect,
    sendMessage
  }
}
