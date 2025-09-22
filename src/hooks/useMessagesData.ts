import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'call' | 'poll' | 'menu' | 'event' | 'link-preview'
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
    // Para evento
    eventType?: 'calendar' | 'group' | 'info' | 'success' | 'warning' | 'star'
    eventTitle?: string
    eventDescription?: string
    eventMetadata?: {
      participants?: string[]
      location?: string
      date?: string
      url?: string
    }
    // Para link preview
    linkPreview?: {
      url: string
      title?: string
      description?: string
      image?: string
      siteName?: string
      favicon?: string
    }
  }
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

export function useMessagesData(chatId?: string): UseMessagesDataReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [totalMessages, setTotalMessages] = useState(0)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  
  // Carregar apenas 5 mensagens inicialmente para economia
  const INITIAL_LIMIT = 5
  const LOAD_MORE_LIMIT = 20
  
  // Função para forçar atualização das mensagens
  const refreshMessages = () => {
    if (chatId) {
      fetchMessages(chatId, 0, false)
    }
  }

  const fetchMessages = async (chatId: string, offset: number = 0, append: boolean = false) => {
    try {
      if (!append) setLoading(true)
      setError(null)

      // Buscar mensagens com paginação otimizada (5 iniciais, depois 20)
      const limit = offset === 0 ? INITIAL_LIMIT : LOAD_MORE_LIMIT
      
      console.log(`🔄 Buscando ${limit} mensagens (offset: ${offset})`)
      
      // Usar WAHA API diretamente com limit
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
      
      console.log(`📊 Retornado: ${data.length} mensagens de ${limit} solicitadas`)
      
      // Se retornou menos que solicitado, não há mais mensagens
      if (data.length < limit) {
        setHasMore(false)
        setTotalMessages(offset + data.length)
        console.log(`🏁 Fim das mensagens: total estimado ${offset + data.length}`)
      } else {
        // Retornou a quantidade completa - provavelmente há mais mensagens
        setHasMore(true)
        // Para o carregamento inicial (offset 0), assumir pelo menos mais algumas
        if (offset === 0) {
          setTotalMessages(data.length + 10) // Estimativa inicial
        } else {
          setTotalMessages((offset + data.length) + 5)
        }
        console.log(`🔄 Há mais mensagens: total estimado ${offset === 0 ? data.length + 10 : (offset + data.length) + 5}`)
      }
      
      if (data.length === 0) {
        setHasMore(false)
        if (!append) setLoading(false)
        return
      }
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
    console.log('🔄 LoadMore chamado:', { chatId, loading, hasMore, offset, currentMessages: messages.length })
    
    if (!chatId) {
      console.log('❌ LoadMore: Sem chatId')
      return
    }
    if (loading) {
      console.log('❌ LoadMore: Já carregando')
      return  
    }
    if (!hasMore) {
      console.log('❌ LoadMore: Não há mais mensagens')
      return
    }
    
    const newOffset = offset + (offset === 0 ? INITIAL_LIMIT : LOAD_MORE_LIMIT)
    console.log('✅ LoadMore: Carregando com offset', newOffset)
    setOffset(newOffset)
    fetchMessages(chatId, newOffset, true)
  }

  useEffect(() => {
    if (!chatId) return

    // Reset messages when chat changes
    setMessages([])
    setError(null)
    setOffset(0)
    setHasMore(true)
    setTotalMessages(0)

    // Fetch initial messages
    fetchMessages(chatId, 0, false)

    // Webhook desabilitado temporariamente (404 error)
    // TODO: Implementar webhook corretamente quando endpoint estiver disponível

    // Setup polling para atualizar status das mensagens a cada 5 segundos
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    pollingRef.current = setInterval(() => {
      // Buscar apenas as 5 mensagens mais recentes para verificar mudanças de status
      fetch(`http://159.65.34.199:3001/api/user_fb8da1d7_1758158816675/chats/${chatId}/messages?limit=5&offset=0`, {
        headers: { 'X-Api-Key': 'tappyone-waha-2024-secretkey' }
      })
      .then(response => response.json())
      .then(data => {
        // Atualizar apenas o status das mensagens existentes
        setMessages(prev => prev.map(msg => {
          const updated = data.find((newMsg: any) => newMsg.id === msg.id)
          if (updated) {
            return {
              ...msg,
              status: getMessageStatus(updated)
            }
          }
          return msg
        }))
      })
      .catch(error => console.log('Status polling error:', error))
    }, 5000)

    // Cleanup
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
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

// Export default também para garantir compatibilidade
export default useMessagesData

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
    // Verificar se é texto com preview de link
    if (msg._data.Message.extendedTextMessage?.contextInfo?.externalAdReply) return 'link-preview'
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
    case 'event': return '📅 Evento'
    case 'link-preview': return '🔗 Link'
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
  
  // Metadados de evento
  if (messageType === 'event') {
    const eventMessage = msg._data?.Message?.eventMessage
    if (eventMessage) {
      metadata.eventType = 'calendar' // Padrão
      metadata.eventTitle = eventMessage.name || 'Evento'
      metadata.eventDescription = eventMessage.description
      metadata.eventMetadata = {
        date: eventMessage.startTime ? new Date(eventMessage.startTime * 1000).toISOString() : undefined
      }
    }
  }
  
  // Metadados de link preview
  if (messageType === 'link-preview') {
    const extendedText = msg._data?.Message?.extendedTextMessage
    const adReply = extendedText?.contextInfo?.externalAdReply
    if (adReply) {
      metadata.linkPreview = {
        url: adReply.sourceUrl || msg.body || '',
        title: adReply.title,
        description: adReply.body,
        image: adReply.thumbnailUrl,
        siteName: adReply.sourceType
      }
    }
  }
  
  return Object.keys(metadata).length > 0 ? metadata : undefined
}
