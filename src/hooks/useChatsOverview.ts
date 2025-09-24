'use client'

import { useState, useEffect } from 'react'

interface ChatOverview {
  id: string
  name: string
  image?: string
  lastMessage?: {
    id: string
    body: string
    timestamp: number
    fromMe: boolean
    type: string
    hasMedia: boolean
  }
  unreadCount?: number
  contact?: {
    id: string
    name: string
    pushname?: string
    profilePicUrl?: string
  }
}

interface UseChatsOverviewReturn {
  chats: ChatOverview[]
  loading: boolean
  error: string | null
  refreshChats: () => void
  loadMoreChats: () => Promise<void>
  hasMore: boolean
  isLoadingMore: boolean
  markChatAsRead: (chatId: string) => Promise<void>
  markChatAsUnread: (chatId: string) => Promise<boolean>
  totalChatsCount: number // Total real de chats do WhatsApp
  unreadChatsCount: number // Total real de chats não lidos
  readNoReplyCount: number // Total de chats lidos mas não respondidos
  groupChatsCount: number // Total real de grupos
}

export default function useChatsOverview(): UseChatsOverviewReturn {
  const [chats, setChats] = useState<ChatOverview[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [totalChatsCount, setTotalChatsCount] = useState(0)
  const [unreadChatsCount, setUnreadChatsCount] = useState(0)
  const [readNoReplyCount, setReadNoReplyCount] = useState(0)
  const [groupChatsCount, setGroupChatsCount] = useState(0)

  const fetchChatsOverview = async (limit = 12, offset = 0, append = false) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Buscando chats overview da WAHA...')
      
      // Detectar se estamos em produção HTTPS
      const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:'
      
      // Usar proxy em produção, direto em desenvolvimento
      const baseUrl = isProduction 
        ? '/api/waha-proxy' 
        : 'http://159.65.34.199:3001'
      
      console.log('📋 Buscando chats com paginação:', { limit, offset, append })
      
      const response = await fetch(`${baseUrl}/api/user_fb8da1d7_1758158816675/chats/overview?limit=${limit}&offset=${offset}`, {
        headers: {
          'X-Api-Key': 'tappyone-waha-2024-secretkey'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      console.log('📊 WAHA retornou', data.length, 'chats nesta página (limit:', limit, 'offset:', offset, ')')
      console.log('🔍 Primeiros 3 chats desta página:', data.slice(0, 3).map(c => ({ id: c.id, name: c.name })))
      
      // Se retornou menos que o limit, não há mais páginas
      const noMorePages = data.length < limit
      setHasMore(!noMorePages)

      // Debug para verificar unreadCount da WAHA
      console.log('🔍 DEBUG WAHA - Dados brutos recebidos:', data.slice(0, 2))
      
      // Debug específico para estrutura de unreadCount
      data.slice(0, 5).forEach((chat: any, index: number) => {
        console.log(`🔍 DEBUG WAHA - Chat ${index + 1} estrutura COMPLETA:`, {
          id: chat.id,
          name: chat.name,
          unreadCount: chat.unreadCount,
          '_chat existe': !!chat._chat,
          '_chat completo': chat._chat,
          'lastMessage.fromMe': chat.lastMessage?.fromMe,
          'TODAS AS PROPRIEDADES': Object.keys(chat),
          'CHAT COMPLETO': chat
        })
      })
      
      // Procurar qualquer propriedade que possa indicar mensagens não lidas
      const chatComMensagens = data.find((chat: any) => 
        chat.lastMessage && !chat.lastMessage.fromMe
      )
      if (chatComMensagens) {
        console.log('🔍 DEBUG - Chat que RECEBEU mensagem (pode ter unread):', {
          id: chatComMensagens.id,
          name: chatComMensagens.name,
          'OBJETO COMPLETO': chatComMensagens,
          'Propriedades disponíveis': Object.keys(chatComMensagens)
        })
      }
      
      // Transformar dados da WAHA para formato interno
      const transformedChats: ChatOverview[] = data.map((chat: any) => {
        // Debug específico do unreadCount
        if (chat.unreadCount > 0) {
          console.log('🔍 DEBUG WAHA - Chat com unreadCount > 0:', {
            id: chat.id,
            name: chat.name,
            unreadCount: chat.unreadCount,
            _chat: chat._chat
          })
        }
        // Debug da foto de perfil
        if (chat.contact?.profilePicUrl) {
          console.log('🖼️ Avatar encontrado para', chat.name, ':', chat.contact.profilePicUrl)
        }
        
        return {
          id: chat.id,
          name: chat.name || chat.contact?.name || chat.contact?.pushname || 'Usuário',
          image: chat.contact?.profilePicUrl || chat.profilePicUrl || null,
        lastMessage: chat.lastMessage ? {
          id: chat.lastMessage.id,
          body: (() => {
            const body = chat.lastMessage.body || getMessageTypeDescription(chat.lastMessage)
            console.log('🔍 DEBUG LastMessage para', chat.name, ':', {
              originalBody: chat.lastMessage.body,
              processedBody: body,
              type: chat.lastMessage.type,
              hasMedia: chat.lastMessage.hasMedia
            })
            return body
          })(),
          timestamp: chat.lastMessage.timestamp * 1000, // Converter para ms
          fromMe: chat.lastMessage.fromMe,
          type: chat.lastMessage.type || 'text',
          hasMedia: chat.lastMessage.hasMedia || false
        } : undefined,
        unreadCount: (() => {
          // Usar lógica ultra restritiva: APENAS ack=2 (entregue)
          if (!chat.lastMessage || chat.lastMessage.fromMe) return undefined
          const isUnread = chat.lastMessage.ack === 2
          return isUnread ? 1 : undefined // Retorna 1 se não lida, undefined se lida
        })(),
        contact: chat.contact ? {
          id: chat.contact.id,
          name: chat.contact.name,
          pushname: chat.contact.pushname,
          profilePicUrl: chat.contact.profilePicUrl
        } : undefined
        }
      })

      // Ordenar por timestamp da última mensagem (mais recente primeiro)
      transformedChats.sort((a, b) => {
        const timestampA = a.lastMessage?.timestamp || 0
        const timestampB = b.lastMessage?.timestamp || 0
        return timestampB - timestampA
      })

      // Se append = true, adicionar aos chats existentes, senão substituir
      setChats(prevChats => {
        if (append) {
          const newChats = [...prevChats, ...transformedChats]
          console.log('✅ Chats adicionados! Total agora:', newChats.length, '(+' + transformedChats.length + ')')
          return newChats
        } else {
          console.log('✅ Chats iniciais carregados:', transformedChats.length)
          return transformedChats
        }
      })

    } catch (err) {
      console.error('❌ Erro ao buscar chats overview:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setChats([])
    } finally {
      setLoading(false)
    }
  }

  // Função para carregar mais chats (próxima página)
  const loadMoreChats = async () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    console.log('🔄 Carregando mais chats..., offset:', chats.length)
    
    try {
      await fetchChatsOverview(12, chats.length, true) // append = true
    } finally {
      setIsLoadingMore(false)
    }
  }

  const refreshChats = () => {
    fetchChatsOverview()
  }

  // Função para buscar totais de chats (total e não lidos)
  const fetchTotalChatsCount = async () => {
    try {
      const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:'
      const baseUrl = isProduction ? '/api/waha-proxy' : 'http://159.65.34.199:3001'
      
      console.log('📊 Buscando totais de chats da WAHA...')
      
      // Buscar com limit muito alto para pegar o total real
      const response = await fetch(`${baseUrl}/api/user_fb8da1d7_1758158816675/chats/overview?limit=9999&offset=0`, {
        headers: {
          'X-Api-Key': 'tappyone-waha-2024-secretkey'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const totalCount = data.length
      
      // Debug: contar distribuição de ACK para entender melhor
      const ackDistribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, undefined: 0, fromMe: 0 }
      data.forEach((chat: any) => {
        if (!chat.lastMessage) return
        if (chat.lastMessage.fromMe) {
          ackDistribution.fromMe++
        } else {
          const ack = chat.lastMessage.ack
          if (ack === undefined) ackDistribution.undefined++
          else ackDistribution[ack as keyof typeof ackDistribution]++
        }
      })
      console.log(' Distribuição de ACK (últimas mensagens recebidas):', ackDistribution)
      
      // Contar chats não lidos - LÓGICA ULTRA RESTRITIVA (EXCLUINDO GRUPOS)
      // Vamos ser MUITO mais rigorosos: só conta como não lida se:
      // 1. Última mensagem não é nossa (fromMe: false)
      // 2. E tem ack = 2 (entregue) APENAS (sem ack pode ser antigo)
      // 3. NÃO é grupo (@g.us)
      const unreadCount = data.filter((chat: any) => {
        if (!chat.lastMessage) return false
        
        // Se a última mensagem é nossa, não conta como não lida
        if (chat.lastMessage.fromMe) return false
        
        // Excluir grupos da contagem de não lidas
        if (chat.id?.includes('@g.us')) return false
        
        // Só conta como não lida se ack = 2 EXATAMENTE (entregue mas não lida)
        // ack: 1 = enviada, 2 = entregue, 3 = lida, 4 = visualizada
        const isUnread = chat.lastMessage.ack === 2
        
        return isUnread
      }).length
      
      // Contar grupos (contém @g.us)
      const groupsCount = data.filter((chat: any) => chat.id?.includes('@g.us')).length
      
      // Contar "lidas mas não respondidas" (última mensagem deles com ack=3 ou 4)
      const readNoReply = data.filter((chat: any) => {
        if (!chat.lastMessage) return false
        if (chat.lastMessage.fromMe) return false // Se última mensagem é nossa, respondemos
        
        // Se última mensagem é deles e foi lida (ack=3 ou 4), mas não respondemos
        const wasRead = chat.lastMessage.ack === 3 || chat.lastMessage.ack === 4
        return wasRead
      }).length
      
      
      setTotalChatsCount(totalCount)
      setUnreadChatsCount(unreadCount)
      setReadNoReplyCount(readNoReply)
      setGroupChatsCount(groupsCount)
      
      return { totalCount, unreadCount }
    } catch (error) {
      console.error('❌ Erro ao buscar totais de chats:', error)
      return { totalCount: 0, unreadCount: 0 }
    }
  }

  // Função para marcar mensagens como lidas via WAHA
  const markChatAsRead = async (chatId: string) => {
    try {
      const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:'
      const baseUrl = isProduction ? '/api/waha-proxy' : 'http://159.65.34.199:3001'
      
      console.log(' Marcando mensagens como lidas via WAHA:', chatId)
      
      const response = await fetch(`${baseUrl}/api/user_fb8da1d7_1758158816675/chats/${chatId}/messages/read`, {
        method: 'POST',
        headers: {
          'X-Api-Key': 'tappyone-waha-2024-secretkey',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Corpo vazio marca todas as mensagens como lidas
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log(' Mensagens marcadas como lidas via WAHA:', result)
      
      // Recarregar chats para ver a mudança
      setTimeout(() => refreshChats(), 1000)
      
    } catch (error) {
      console.error(' Erro ao marcar mensagens como lidas via WAHA:', error)
    }
  }

  // Função para marcar chat como não lido (teste - pode não funcionar)
  const markChatAsUnread = async (chatId: string) => {
    try {
      const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:'
      const baseUrl = isProduction ? '/api/waha-proxy' : 'http://159.65.34.199:3001'
      
      console.log(' Tentando marcar chat como não lido via WAHA:', chatId)
      
      const response = await fetch(`${baseUrl}/api/user_fb8da1d7_1758158816675/chats/${chatId}/unread`, {
        method: 'POST',
        headers: {
          'X-Api-Key': 'tappyone-waha-2024-secretkey',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.log(' Endpoint /unread não implementado, isso é normal')
        return false
      }

      console.log(' Chat marcado como não lido via WAHA')
      setTimeout(() => refreshChats(), 1000)
      return true
      
    } catch (error) {
      console.error(' Erro ao marcar chat como não lido via WAHA:', error)
      return false
    }
  }

  // Função para atualizar apenas as mensagens mais recentes (sem recarregar lista)
  const softRefresh = async () => {
    try {
      console.log(' Soft refresh - atualizando últimas mensagens...')
      console.log('🔄 Soft refresh - atualizando últimas mensagens...')
      
      // Detectar se estamos em produção HTTPS
      const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:'
      const baseUrl = isProduction ? '/api/waha-proxy' : 'http://159.65.34.199:3001'
      
      const response = await fetch(`${baseUrl}/api/user_fb8da1d7_1758158816675/chats/overview?limit=12&offset=0`, {
        headers: { 'X-Api-Key': 'tappyone-waha-2024-secretkey' }
      })
      
      if (response.ok) {
        const newData = await response.json()
        
        // Atualizar apenas os chats que já existem na lista
        setChats(prevChats => {
          let hasChanges = false
          const updatedChats = prevChats.map(chat => {
            const updated = newData.find((newChat: any) => newChat.id === chat.id)
            if (updated && updated.lastMessage && 
                (!chat.lastMessage || chat.lastMessage.id !== updated.lastMessage.id)) {
              hasChanges = true
              return {
                ...chat,
                lastMessage: {
                  ...updated.lastMessage,
                  timestamp: updated.lastMessage.timestamp * 1000
                }
              }
            }
            return chat
          })
          
          // Só atualizar se realmente houve mudanças para evitar re-renders
          return hasChanges ? updatedChats : prevChats
        })
        
        console.log('✅ Soft refresh concluído - mensagens atualizadas silenciosamente')
      }
    } catch (error) {
      console.log('⚠️ Soft refresh falhou silenciosamente:', error)
    }
  }

  useEffect(() => {
    fetchChatsOverview(12, 0, false) // Carregar primeira página (12 chats)
    fetchTotalChatsCount() // Buscar total real de chats
    
    // Soft refresh a cada 60 segundos (DESABILITADO temporariamente para debug)
    // const interval = setInterval(softRefresh, 60000)
    
    // return () => clearInterval(interval)
  }, [])

  return {
    chats,
    loading,
    error,
    refreshChats,
    loadMoreChats,
    hasMore,
    isLoadingMore,
    markChatAsRead, // Marcar como lida via WAHA
    markChatAsUnread, // Marcar como não lida via WAHA (teste)
    totalChatsCount, // Total real de chats do WhatsApp
    unreadChatsCount, // Total real de chats não lidos
    readNoReplyCount, // Total de chats lidos mas não respondidos
    groupChatsCount // Total real de grupos
  }
}

// Helper para descrever tipos de mensagem
function getMessageTypeDescription(message: any): string {
  console.log('🔍 getMessageTypeDescription chamado para mensagem:', {
    type: message.type,
    hasMedia: message.hasMedia,
    body: message.body,
    fullMessage: message
  })
  
  if (message.hasMedia) {
    if (message.type?.includes('image')) return '📷 Imagem'
    if (message.type?.includes('video')) return '🎥 Vídeo'
    if (message.type?.includes('audio')) return '🎵 Áudio'
    if (message.type?.includes('document')) return '📄 Documento'
    return '📎 Mídia'
  }
  
  // Tipos específicos do WhatsApp
  if (message.type === 'poll') return '📊 Enquete'
  if (message.type === 'location') return '📍 Localização'
  if (message.type === 'contact') return '👤 Contato'
  if (message.type === 'call') return '📞 Chamada'
  if (message.type === 'system') return '📢 Mensagem do sistema'
  if (message.type === 'notification') return '🔔 Notificação'
  if (message.type === 'revoked') return '🚫 Mensagem apagada'
  if (message.type === 'group_notification') return '👥 Notificação do grupo'
  if (message.type === 'e2e_notification') return '🔒 Notificação de criptografia'
  
  // Se tem body, usar o body
  if (message.body && message.body.trim()) {
    return message.body
  }
  
  // Fallback final
  return 'Mensagem'
}
