import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call' | 'poll' | 'menu' | 'event' | 'link-preview'
  sender: 'user' | 'agent'
  timestamp: number
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  mediaUrl?: string
  metadata?: any
}

interface UseMessagesDataReturn {
  messages: Message[]
  loading: boolean
  error: string | null
  hasMore: boolean
  totalMessages: number
  loadMore: () => void
  refreshMessages: () => void
}

export default function useMessagesData(chatId?: string): UseMessagesDataReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalMessages, setTotalMessages] = useState(0)
  const [offset, setOffset] = useState(0)

  const INITIAL_LIMIT = 5
  const LOAD_MORE_LIMIT = 20

  const refreshMessages = () => {
    if (chatId) {
      fetchMessages(chatId, 0, false)
    }
  }

  const fetchMessages = async (chatId: string, offset: number = 0, append: boolean = false) => {
    try {
      if (!append) setLoading(true)
      setError(null)

      const limit = offset === 0 ? INITIAL_LIMIT : LOAD_MORE_LIMIT
      console.log(`🔄 Buscando ${limit} mensagens (offset: ${offset})`)
      
      const response = await fetch(`http://159.65.34.199:3001/api/user_fb8da1d7_1758158816675/chats/${chatId}/messages?limit=${limit}&offset=${offset}`, {
        headers: {
          'X-Api-Key': 'tappyone-waha-2024-secretkey'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📨 Mensagens carregadas:', data.length, 'para chat', chatId)
      
      // Lógica simples para hasMore
      if (data.length < limit) {
        setHasMore(false)
        setTotalMessages(offset + data.length)
      } else {
        setHasMore(true)
        setTotalMessages(offset === 0 ? data.length + 10 : (offset + data.length) + 5)
      }
      
      if (data.length === 0) {
        setHasMore(false)
        if (!append) setLoading(false)
        return
      }

      // Transformar mensagens com detecção de tipos
      const transformedMessages: Message[] = data.map((msg: any) => {
        const messageType = getMessageType(msg)
        const metadata = extractMetadata(msg, messageType)
        
        return {
          id: msg.id,
          content: msg.body || getDefaultContent(messageType),
          type: messageType,
          sender: msg.fromMe ? 'agent' as const : 'user' as const,
          timestamp: msg.timestamp * 1000,
          status: getMessageStatus(msg),
          mediaUrl: msg.media?.url,
          metadata
        }
      })

      if (append) {
        // Adicionar mensagens mais antigas no INÍCIO da lista
        setMessages(prev => [...transformedMessages, ...prev])
      } else {
        // Reverter ordem - mais antigas primeiro (igual WhatsApp Web)
        setMessages(transformedMessages.reverse())
      }

    } catch (err) {
      console.error('Erro ao buscar mensagens:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    console.log('🔄 LoadMore chamado:', { chatId, loading, hasMore, offset })
    
    if (!chatId || loading || !hasMore) return
    
    const newOffset = offset + (offset === 0 ? INITIAL_LIMIT : LOAD_MORE_LIMIT)
    setOffset(newOffset)
    fetchMessages(chatId, newOffset, true)
  }

  useEffect(() => {
    if (!chatId) return

    setMessages([])
    setError(null)
    setOffset(0)
    setHasMore(true)
    setTotalMessages(0)

    fetchMessages(chatId, 0, false)
  }, [chatId])

  return {
    messages,
    loading,
    error,
    hasMore,
    totalMessages,
    loadMore,
    refreshMessages
  }
}

// Helper functions copiadas do arquivo original
function getMessageType(msg: any): Message['type'] {
  // Verificar por tipo de mensagem específica no _data.Message
  if (msg._data?.Message) {
    if (msg._data.Message.eventMessage) return 'event'
    if (msg._data.Message.pollCreationMessage || msg._data.Message.pollCreationMessageV3) return 'poll'
    if (msg._data.Message.contactMessage) return 'contact'
    if (msg._data.Message.documentMessage) return 'document'
    if (msg._data.Message.locationMessage) return 'location'
    if (msg._data.Message.imageMessage) return 'image'
    if (msg._data.Message.videoMessage) return 'video'
    if (msg._data.Message.audioMessage) return 'audio'
    if (msg._data.Message.listMessage) return 'menu'
    if (msg._data.Message.buttonsMessage) return 'menu'
    if (msg._data.Message.extendedTextMessage?.contextInfo?.externalAdReply) return 'link-preview'
  }
  
  // Verificar mídia por mimetype
  if (msg.hasMedia && msg.media?.mimetype) {
    const mimetype = msg.media.mimetype
    if (mimetype.startsWith('image/')) return 'image'
    if (mimetype.startsWith('video/')) return 'video' 
    if (mimetype.startsWith('audio/')) return 'audio'
    if (mimetype.startsWith('application/')) return 'document'
  }
  
  return 'text'
}

function getDefaultContent(type: Message['type']): string {
  switch (type) {
    case 'image': return 'Imagem'
    case 'video': return 'Vídeo'  
    case 'audio': return 'Áudio'
    case 'document': return 'Documento'
    case 'location': return 'Localização'
    case 'contact': return 'Contato'
    case 'call': return 'Chamada'
    case 'poll': return 'Enquete'
    case 'menu': return 'Menu'
    case 'event': return 'Evento'
    case 'link-preview': return 'Link'
    default: return 'Mensagem'
  }
}

function getMessageStatus(msg: any): Message['status'] {
  if (msg.ack === undefined || msg.ack === null) return 'sent'
  
  switch (msg.ack) {
    case -1: return 'sending'
    case 0: return 'sending'
    case 1: return 'sent'
    case 2: return 'delivered'
    case 3: return 'read'
    default: return 'sent'
  }
}

function extractMetadata(msg: any, messageType: Message['type']): any {
  const metadata: any = {}
  
  // Metadados de enquete
  if (messageType === 'poll') {
    const pollMessage = msg._data?.Message?.pollCreationMessageV3 || msg._data?.Message?.pollCreationMessage
    if (pollMessage) {
      metadata.question = pollMessage.name
      metadata.pollOptions = pollMessage.options?.map((opt: any, index: number) => ({
        id: index.toString(),
        text: opt.optionName,
        votes: 0
      }))
      metadata.totalVotes = 0
      metadata.allowMultipleAnswers = pollMessage.selectableOptionsCount > 1
      metadata.hasVoted = false
    }
  }

  // Metadados de menu/lista
  if (messageType === 'menu') {
    const listMessage = msg._data?.Message?.listMessage
    const buttonsMessage = msg._data?.Message?.buttonsMessage
    
    if (listMessage) {
      metadata.menuTitle = listMessage.title
      metadata.menuDescription = listMessage.description
      metadata.menuItems = listMessage.sections?.[0]?.rows?.map((row: any) => ({
        id: row.rowID,
        title: row.title,
        description: row.description
      }))
    }
    
    if (buttonsMessage) {
      metadata.menuTitle = buttonsMessage.headerText || 'Opções'
      metadata.menuItems = buttonsMessage.buttons?.map((btn: any) => ({
        id: btn.buttonId,
        title: btn.displayText
      }))
    }
  }

  // Metadados de contato
  if (messageType === 'contact') {
    const contactMessage = msg._data?.Message?.contactMessage
    if (contactMessage) {
      metadata.contactName = contactMessage.displayName
      metadata.phoneNumber = contactMessage.vcard?.match(/TEL.*?:(.+)/)?.[1]
    }
  }

  // Metadados de localização
  if (messageType === 'location') {
    const locationMessage = msg._data?.Message?.locationMessage
    if (locationMessage) {
      metadata.latitude = locationMessage.degreesLatitude
      metadata.longitude = locationMessage.degreesLongitude
      metadata.address = locationMessage.address
      metadata.locationName = locationMessage.name
    }
  }

  // Metadados de documento
  if (messageType === 'document') {
    const documentMessage = msg._data?.Message?.documentMessage
    if (documentMessage) {
      metadata.fileName = documentMessage.fileName || documentMessage.title
      metadata.fileSize = documentMessage.fileLength
      metadata.mimeType = documentMessage.mimetype
    }
  }

  // Metadados de mídia
  if (msg.media && (messageType === 'image' || messageType === 'video' || messageType === 'audio')) {
    metadata.fileName = msg.media.filename
    metadata.fileSize = msg.media.filesize
    metadata.mimeType = msg.media.mimetype
    
    if (messageType === 'video') {
      metadata.thumbnailUrl = msg.media.thumbnailUrl
    }
    
    if (messageType === 'audio') {
      metadata.duration = msg.media.duration
    }
  }
  
  return Object.keys(metadata).length > 0 ? metadata : undefined
}
