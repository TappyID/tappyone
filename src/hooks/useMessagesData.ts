import { useState, useEffect } from 'react'

interface Message {
  id: string
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call' | 'poll' | 'menu'
  sender: 'user' | 'agent'
  timestamp: number
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  mediaUrl?: string
  metadata?: {
    // Para áudio
    duration?: number
    // Para documento
    fileName?: string
    fileSize?: number
    mimeType?: string
    // Para video
    thumbnailUrl?: string
    // Para localização
    latitude?: number
    longitude?: number
    address?: string
    locationName?: string
    // Para contato
    contactName?: string
    phoneNumber?: string
    email?: string
    organization?: string
    // Para enquete
    question?: string
    pollOptions?: Array<{id: string, text: string, votes: number}>
    totalVotes?: number
    allowMultipleAnswers?: boolean
    hasVoted?: boolean
    userVote?: string[]
    // Para menu
    menuTitle?: string
    menuDescription?: string
    menuItems?: Array<{
      id: string
      title: string
      description?: string
      icon?: string
      submenu?: any[]
    }>
  }
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
      console.log('📝 Dados brutos da WAHA:', data.slice(0, 5)) // Mostrar primeiras 5 mensagens para debug
      
      // Log detalhado para debug de tipos específicos
      data.forEach((msg: any, index: number) => {
        if (index < 5) { // Só primeiras 5 para não spam
          console.log(`🔍 Mensagem ${index}:`, {
            hasMedia: msg.hasMedia,
            body: msg.body,
            processedType: msg.processedType,
            _dataType: msg._data?.type,
            mimetype: msg.media?.mimetype,
            hasLocation: !!msg.location,
            hasVcard: !!msg.vcard,
            hasPoll: !!msg.poll,
            hasButtons: !!msg.buttons,
            hasList: !!msg.list
          })
        }
      })

      // Transformar dados da WAHA para nosso formato
      const transformedMessages: Message[] = data.map((msg: any) => {
        const detectedType = getMessageType(msg)
        const extractedMetadata = extractMetadata(msg)
        
        // Debug do tipo detectado
        if (detectedType !== 'text') {
          console.log(`🎯 Tipo detectado: ${detectedType} para mensagem:`, {
            id: msg.id,
            body: msg.body,
            hasMedia: msg.hasMedia,
            mimetype: msg.media?.mimetype,
            metadata: extractedMetadata
          })
        }
        
        return {
          id: msg.id || `msg_${msg.timestamp}`,
          content: msg.body || msg.caption || getDefaultContent(msg),
          type: detectedType,
          sender: msg.fromMe ? 'agent' : 'user',
          timestamp: msg.timestamp * 1000, // WAHA usa segundos, precisamos milissegundos
          status: msg.fromMe ? getMessageStatus(msg) : undefined,
          mediaUrl: msg.mediaUrl || msg.media?.url,
          metadata: extractedMetadata
        }
      })
      
      console.log('🔄 Mensagens transformadas:', transformedMessages.slice(0, 2)) // Debug das mensagens processadas

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
  // Verificar pela estrutura interna da WAHA (_data.Info.MediaType)
  if (msg._data?.Info?.MediaType) {
    switch (msg._data.Info.MediaType) {
      case 'poll': return 'poll'
      case 'vcard': return 'contact'
      case 'document': return 'document'
      case 'location': return 'location'
      case 'image': return 'image'
      case 'video': return 'video'
      case 'audio': return 'audio'
    }
  }
  
  // Verificar por tipo de mensagem específica no _data.Message
  if (msg._data?.Message) {
    if (msg._data.Message.pollCreationMessage || msg._data.Message.pollCreationMessageV3) return 'poll'
    if (msg._data.Message.contactMessage) return 'contact'
    if (msg._data.Message.documentMessage) return 'document'
    if (msg._data.Message.locationMessage) return 'location'
    if (msg._data.Message.imageMessage) return 'image'
    if (msg._data.Message.videoMessage) return 'video'
    if (msg._data.Message.audioMessage) return 'audio'
    if (msg._data.Message.listMessage) return 'menu'
    if (msg._data.Message.buttonsMessage) return 'menu'
  }
  
  // Verificar mídia por mimetype (fallback)
  if (msg.hasMedia && msg.media?.mimetype) {
    const mimetype = msg.media.mimetype
    if (mimetype.startsWith('image/')) return 'image'
    if (mimetype.startsWith('video/')) return 'video' 
    if (mimetype.startsWith('audio/')) return 'audio'
    if (mimetype.startsWith('application/')) return 'document'
  }
  
  // Verificar tipos legados
  if (msg._data?.type === 'call_log') return 'call'
  
  // Se tem corpo de texto, é texto
  if (msg.body) return 'text'
  
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

// Helper para conteúdo padrão baseado no tipo
function getDefaultContent(msg: any): string {
  const type = getMessageType(msg)
  switch (type) {
    case 'image': return '📷 Imagem'
    case 'video': return '🎥 Vídeo'
    case 'audio': return '🎵 Áudio'
    case 'document': return '📄 Documento'
    case 'location': return '📍 Localização'
    case 'contact': return '👤 Contato'
    case 'call': return '📞 Chamada'
    case 'poll': return '📊 Enquete'
    case 'menu': return '🔗 Menu'
    default: return 'Mensagem'
  }
}

// Helper para extrair metadata das mensagens da WAHA
function extractMetadata(msg: any): Message['metadata'] | undefined {
  const metadata: any = {}
  const messageType = getMessageType(msg)
  
  // Metadados gerais de mídia
  if (msg.hasMedia && msg.media) {
    if (msg.media.filename) metadata.fileName = msg.media.filename
    if (msg.media.filesize) metadata.fileSize = msg.media.filesize
    if (msg.media.mimetype) metadata.mimeType = msg.media.mimetype
  }
  
  // Metadados específicos por tipo
  if (messageType === 'audio') {
    if (msg._data?.duration) metadata.duration = msg._data.duration
  }
  
  if (messageType === 'video') {
    if (msg._data?.duration) metadata.duration = msg._data.duration
    if (msg.media?.thumbnail) metadata.thumbnailUrl = msg.media.thumbnail
  }
  
  // Metadados de localização
  if (messageType === 'location') {
    const loc = msg.location || msg._data?.location
    if (loc) {
      if (loc.latitude) metadata.latitude = loc.latitude
      if (loc.longitude) metadata.longitude = loc.longitude
      if (loc.address) metadata.address = loc.address
      if (loc.name) metadata.locationName = loc.name
    }
    // Fallback para campos diretos
    if (msg.latitude) metadata.latitude = msg.latitude
    if (msg.longitude) metadata.longitude = msg.longitude
  }
  
  // Metadados de contato (vCard)
  if (messageType === 'contact') {
    // Extrair da estrutura real da WAHA
    const contactMessage = msg._data?.Message?.contactMessage
    if (contactMessage) {
      metadata.contactName = contactMessage.displayName
      
      // Parse do vCard para extrair dados
      if (contactMessage.vcard) {
        const vcardLines = contactMessage.vcard.split('\n')
        vcardLines.forEach((line: string) => {
          if (line.startsWith('TEL') && line.includes('waid=')) {
            // Extrair telefone do vCard: TEL;type=CELL;type=VOICE;waid=5518996064455:+5518996064455
            const phone = line.split(':')[1]
            if (phone) metadata.phoneNumber = phone
          }
          if (line.startsWith('EMAIL:')) {
            metadata.email = line.split(':')[1]
          }
          if (line.startsWith('ORG:')) {
            metadata.organization = line.split(':')[1]
          }
        })
      }
    }
  }
  
  // Metadados de enquete
  if (messageType === 'poll') {
    // Extrair da estrutura real da WAHA (V3 ou versão anterior)
    const pollMessage = msg._data?.Message?.pollCreationMessageV3 || msg._data?.Message?.pollCreationMessage
    if (pollMessage) {
      metadata.question = pollMessage.name
      metadata.pollOptions = pollMessage.options?.map((opt: any, index: number) => ({
        id: index.toString(),
        text: opt.optionName,
        votes: 0 // WAHA não fornece contagem de votos em tempo real
      }))
      metadata.totalVotes = 0
      metadata.allowMultipleAnswers = pollMessage.selectableOptionsCount > 1
      metadata.hasVoted = false
    }
  }
  
  // Metadados de menu/lista
  if (messageType === 'menu') {
    // Extrair da estrutura real da WAHA
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
  
  return Object.keys(metadata).length > 0 ? metadata : undefined
}
