import { useState, useEffect } from 'react'

interface Tag {
  id: string
  nome: string
  cor: string
  categoria: string
}

export const useContatoTags = (chatId: string | null) => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }

    const response = await fetch(`/api${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  const fetchContatoTags = async () => {
    if (!chatId) return
    
    try {
      setLoading(true)
      setError(null)
      console.log('🏷️ [HOOK] Buscando tags para chatId:', chatId)
      
      // Buscar diretamente as tags - se não existir contato CRM, retornará vazio
      const data = await makeAuthenticatedRequest(`/contatos/${chatId}/tags`)
      console.log('🏷️ [HOOK] Tags do contato carregadas:', data?.length || 0)
      setTags(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('❌ [HOOK] Erro ao buscar tags do contato:', err)
      // Se der erro 404, significa que não é um contato CRM ou não tem tags
      if (err instanceof Error && err.message.includes('404')) {
        console.log('ℹ️ [HOOK] Chat sem tags ou não é contato CRM:', chatId)
        setTags([])
        setError(null) // Não consideramos 404 como erro
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao carregar tags do contato')
        setTags([])
      }
    } finally {
      setLoading(false)
    }
  }

  const updateContatoTags = async (selectedTags: Tag[]) => {
    if (!chatId) return
    
    try {
      setLoading(true)
      setError(null)
      
      const tagIds = selectedTags.map(tag => tag.id)
      console.log('🏷️ [HOOK] Atualizando tags do contato:', { chatId, tagIds })
      
      await makeAuthenticatedRequest(`/contatos/${chatId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tagIds }),
      })
      
      console.log('🏷️ [HOOK] Tags do contato atualizadas com sucesso')
      setTags(selectedTags)
      return true
    } catch (err) {
      console.error('❌ [HOOK] Erro ao atualizar tags do contato:', err)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar tags do contato')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContatoTags()
  }, [chatId])

  return {
    tags,
    loading,
    error,
    fetchContatoTags,
    updateContatoTags
  }
}
