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
}

export default function useChatsOverview(): UseChatsOverviewReturn {
  const [chats, setChats] = useState<ChatOverview[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChatsOverview = async () => {
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
      
      const response = await fetch(`${baseUrl}/api/user_fb8da1d7_1758158816675/chats/overview`, {
        headers: {
          'X-Api-Key': 'tappyone-waha-2024-secretkey'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📊 Overview recebido:', data.length, 'chats')

      // Transformar dados da WAHA para formato interno
      const transformedChats: ChatOverview[] = data.map((chat: any) => ({
        id: chat.id,
        name: chat.name || chat.contact?.name || chat.contact?.pushname || 'Usuário',
        image: chat.contact?.profilePicUrl,
        lastMessage: chat.lastMessage ? {
          id: chat.lastMessage.id,
          body: chat.lastMessage.body || getMessageTypeDescription(chat.lastMessage),
          timestamp: chat.lastMessage.timestamp * 1000, // Converter para ms
          fromMe: chat.lastMessage.fromMe,
          type: chat.lastMessage.type || 'text',
          hasMedia: chat.lastMessage.hasMedia || false
        } : undefined,
        unreadCount: chat.unreadCount || 0,
        contact: chat.contact ? {
          id: chat.contact.id,
          name: chat.contact.name,
          pushname: chat.contact.pushname,
          profilePicUrl: chat.contact.profilePicUrl
        } : undefined
      }))

      // Ordenar por timestamp da última mensagem (mais recente primeiro)
      transformedChats.sort((a, b) => {
        const timestampA = a.lastMessage?.timestamp || 0
        const timestampB = b.lastMessage?.timestamp || 0
        return timestampB - timestampA
      })

      setChats(transformedChats)
      console.log('✅ Chats overview transformados:', transformedChats.length)

    } catch (err) {
      console.error('❌ Erro ao buscar chats overview:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setChats([])
    } finally {
      setLoading(false)
    }
  }

  const refreshChats = () => {
    fetchChatsOverview()
  }

  useEffect(() => {
    fetchChatsOverview()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchChatsOverview, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    chats,
    loading,
    error,
    refreshChats
  }
}

// Helper para descrever tipos de mensagem
function getMessageTypeDescription(message: any): string {
  if (message.hasMedia) {
    if (message.type?.includes('image')) return '📷 Imagem'
    if (message.type?.includes('video')) return '🎥 Vídeo'
    if (message.type?.includes('audio')) return '🎵 Áudio'
    if (message.type?.includes('document')) return '📄 Documento'
    return '📎 Mídia'
  }
  
  if (message.type === 'poll') return '📊 Enquete'
  if (message.type === 'location') return '📍 Localização'
  if (message.type === 'contact') return '👤 Contato'
  if (message.type === 'call') return '📞 Chamada'
  
  return message.body || 'Mensagem'
}
