import { useState, useEffect, useCallback, useRef } from 'react'

export interface WhatsAppMessage {
  id: string
  chatId: string
  fromMe: boolean
  author: string
  body: string
  type: string
  timestamp: string
  status: 'pending' | 'sent' | 'delivered' | 'read'
  mediaUrl?: string
  fileName?: string
  caption?: string
  media?: {
    data?: string
    mimetype?: string
    filename?: string
  }
}

interface UseInfiniteMessagesProps {
  chatId: string | null
  pageSize?: number
}

interface UseInfiniteMessagesReturn {
  messages: WhatsAppMessage[]
  loading: boolean
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
  error: string | null
}

export function useInfiniteMessages({ 
  chatId, 
  pageSize = 50 
}: UseInfiniteMessagesProps): UseInfiniteMessagesReturn {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const loadingRef = useRef(false)

  const loadMessages = useCallback(async (reset = false) => {
    if (!chatId || loadingRef.current) return

    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const currentOffset = reset ? 0 : offset
      
      const response = await fetch(
        `/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages?limit=${pageSize}&offset=${currentOffset}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const messagesData = await response.json()
      
      // Processar mensagens para converter formato WAHA para nosso formato
      const processedMessages: WhatsAppMessage[] = messagesData.map((msg: any) => ({
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
        caption: msg.caption,
        // Adicionar dados de mídia se existirem
        media: msg.media ? {
          data: msg.media.data,
          mimetype: msg.media.mimetype,
          filename: msg.media.filename
        } : undefined
      }))

      if (reset) {
        setMessages(processedMessages)
        setOffset(processedMessages.length)
      } else {
        setMessages(prev => {
          // Evitar duplicatas
          const existingIds = new Set(prev.map(m => m.id))
          const newMessages = processedMessages.filter(m => !existingIds.has(m.id))
          return [...prev, ...newMessages]
        })
        setOffset(prev => prev + processedMessages.length)
      }

      // Se retornou menos mensagens que o limite, não há mais mensagens
      setHasMore(processedMessages.length === pageSize)

    } catch (err) {
      console.error('Erro ao carregar mensagens:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [chatId, offset, pageSize])

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadMessages(false)
    }
  }, [hasMore, loading, loadMessages])

  const refresh = useCallback(() => {
    setOffset(0)
    setHasMore(true)
    loadMessages(true)
  }, [loadMessages])

  // Carregar mensagens iniciais quando o chat mudar
  useEffect(() => {
    if (chatId) {
      setMessages([])
      setOffset(0)
      setHasMore(true)
      setError(null)
      loadMessages(true)
    }
  }, [chatId])

  return {
    messages: messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    loading,
    hasMore,
    loadMore,
    refresh,
    error
  }
}
