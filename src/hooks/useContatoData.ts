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
    try {
      const response = await fetch(`/api/contatos/${chatId}/dados-completos`)
      if (!response.ok) {
        throw new Error(`Erro ao buscar dados do contato: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (err) {
      console.error('Erro ao buscar dados do contato:', err)
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
          newContatos[chatId] = data
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
