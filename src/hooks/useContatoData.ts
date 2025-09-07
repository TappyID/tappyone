import { useState, useEffect } from 'react'

interface ContatoData {
  id: string
  fila?: {
    id: string
    nome: string
    cor: string
  }
  tags: {
    id: string
    nome: string
    cor: string
  }[]
  atendente?: {
    id: string
    nome: string
    email: string
  }
  kanbanBoard?: string
  orcamento?: {
    valor: number
    status: string
  }
  agendamento?: {
    data: string
    status: string
  }
}

interface UseContatoDataReturn {
  contatos: { [chatId: string]: ContatoData }
  loading: boolean
  error: string | null
  refreshContato: (chatId: string) => void
}

export function useContatoData(chatIds: string[]): UseContatoDataReturn {
  const [contatos, setContatos] = useState<{ [chatId: string]: ContatoData }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContatoData = async (chatId: string) => {
    if (!chatId || chatId.trim() === '') {
      console.log(`⚠️ [useContatoData] ChatId vazio ou inválido: "${chatId}"`)
      return null
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      // Encode chatId to prevent URL issues
      const encodedChatId = encodeURIComponent(chatId)
      console.log(`🔍 [useContatoData] Buscando contato para chatId: ${chatId}`)
      
      const response = await fetch(`/api/contatos/${encodedChatId}/dados-completos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        console.log(`❌ [useContatoData] Erro ${response.status} para chatId: ${chatId}`)
        throw new Error(`Erro ao buscar dados do contato: ${response.status}`)
      }
      const data = await response.json()
      
      if (data.isWhatsAppChat) {
        console.log(`ℹ️ [useContatoData] Chat WAHA sem contato CRM: ${chatId}`)
        return null
      }
      
      console.log(`🏷️ [useContatoData] ${chatId} - Dados completos:`, data)
      console.log(`🏷️ [useContatoData] ${chatId} - Tags específicas:`, data.tags)
      console.log(`🏷️ [useContatoData] ${chatId} - Resposta completa:`, data)
      return data
    } catch (err) {
      console.error('❌ [useContatoData] Erro ao buscar dados do contato:', err)
      return null
    }
  }

  const loadContatosData = async () => {
    if (chatIds.length === 0) return
    
    setLoading(true)
    setError(null)
    
    try {
      const promises = chatIds.map(async (chatId) => {
        const data = await fetchContatoData(chatId)
        return { chatId, data }
      })
      
      const results = await Promise.all(promises)
      const newContatos: { [chatId: string]: ContatoData } = {}
      
      results.forEach(({ chatId, data }) => {
        if (data) {
          console.log(`✅ [useContatoData] Salvando dados para ${chatId}:`, { 
            id: data.id, 
            tagsCount: data.tags?.length || 0,
            tags: data.tags 
          })
          newContatos[chatId] = data
        } else {
          console.log(`⚠️ [useContatoData] Sem dados para ${chatId}`)
        }
      })
      
      setContatos(newContatos)
    } catch (err) {
      setError('Erro ao carregar dados dos contatos')
      console.error('Erro ao carregar dados dos contatos:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshContato = async (chatId: string) => {
    const data = await fetchContatoData(chatId)
    if (data) {
      setContatos(prev => ({
        ...prev,
        [chatId]: data
      }))
    }
  }

  useEffect(() => {
    loadContatosData()
  }, [chatIds.join(',')])

  return {
    contatos,
    loading,
    error,
    refreshContato
  }
}
