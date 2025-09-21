import { useState, useEffect } from 'react'

interface Message {
  id: string
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call'
  sender: 'user' | 'agent'
  timestamp: number
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  mediaUrl?: string
}

interface UseMessagesDataReturn {
  messages: Message[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
}

export function useMessagesData(chatId?: string): UseMessagesDataReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const fetchMessages = async (chatId: string, offset: number = 0, append: boolean = false) => {
    try {
      if (!append) setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      // Buscar mensagens com paginação (50 por vez para performance)
      const response = await fetch(`/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages?limit=50&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`📨 Mensagens carregadas: ${data.length} para chat ${chatId}`)

      // Transformar dados da WAHA para nosso formato
      const transformedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id || `msg_${msg.timestamp}`,
        content: msg.body || msg.caption || 'Mídia enviada',
        type: getMessageType(msg),
        sender: msg.fromMe ? 'agent' : 'user',
        timestamp: msg.timestamp * 1000, // WAHA usa segundos, precisamos milissegundos
        status: msg.fromMe ? getMessageStatus(msg) : undefined,
        mediaUrl: msg.mediaUrl
      }))

      if (append) {
        setMessages(prev => [...prev, ...transformedMessages])
      } else {
        setMessages(transformedMessages.reverse()) // Mensagens mais antigas primeiro
      }

      // Se retornou menos que o limite, não há mais mensagens
      setHasMore(data.length === 50)
      
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!chatId || loading || !hasMore) return
    
    const newOffset = offset + 50
    setOffset(newOffset)
    fetchMessages(chatId, newOffset, true)
  }

  useEffect(() => {
    if (chatId) {
      setOffset(0)
      setHasMore(true)
      fetchMessages(chatId, 0, false)
    } else {
      setMessages([])
      setError(null)
      setOffset(0)
    }
  }, [chatId])

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore
  }
}

// Helper para determinar tipo da mensagem baseado nos dados da WAHA
function getMessageType(msg: any): Message['type'] {
  if (msg.type === 'image' || msg.mimetype?.startsWith('image/')) return 'image'
  if (msg.type === 'video' || msg.mimetype?.startsWith('video/')) return 'video'
  if (msg.type === 'audio' || msg.mimetype?.startsWith('audio/')) return 'audio'
  if (msg.type === 'document') return 'document'
  if (msg.type === 'location') return 'location'
  if (msg.type === 'vcard') return 'contact'
  if (msg.type === 'call_log') return 'call'
  return 'text'
}

// Helper para determinar status da mensagem
function getMessageStatus(msg: any): Message['status'] {
  if (msg.ack === 0) return 'sending'
  if (msg.ack === 1) return 'sent'  
  if (msg.ack === 2) return 'delivered'
  if (msg.ack === 3) return 'read'
  return 'sent'
}
