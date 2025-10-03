import { useState, useEffect } from 'react'

interface Tag {
  id: string
  nome: string
  descricao?: string
  cor: string
  categoria: string
  uso_count: number
  criado_em: string
  criado_por: string
  ativo: boolean
  favorito: boolean
}

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token')
    console.log('🔑 [useTags] Token encontrado?', !!token)
    console.log('🔑 [useTags] Token (primeiros 50 chars):', token?.substring(0, 50))
    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }

    const response = await fetch(`/api${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  const fetchTags = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🏷️ [HOOK] Buscando tags...')
      const data = await makeAuthenticatedRequest('/tags')
      console.log('🏷️ [HOOK] Resposta completa da API:', data)
      console.log('🏷️ [HOOK] data.data existe?', !!data?.data)
      console.log('🏷️ [HOOK] data é array?', Array.isArray(data))
      console.log('🏷️ [HOOK] data.data é array?', Array.isArray(data?.data))
      
      // Tentar múltiplas estruturas de resposta
      let tagsArray = []
      if (Array.isArray(data?.data)) {
        tagsArray = data.data
      } else if (Array.isArray(data)) {
        tagsArray = data
      } else if (data?.tags && Array.isArray(data.tags)) {
        tagsArray = data.tags
      }
      
      console.log('🏷️ [HOOK] Tags processadas:', tagsArray.length)
      setTags(tagsArray)
    } catch (err) {
      console.error('❌ [HOOK] Erro ao buscar tags:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar tags')
      setTags([])
    } finally {
      setLoading(false)
    }
  }

  const createTag = async (tagData: {
    nome: string
    descricao?: string
    cor: string
    categoria: string
  }) => {
    try {
      console.log('🏷️ [HOOK] Criando nova tag:', tagData)
      const data = await makeAuthenticatedRequest('/tags', {
        method: 'POST',
        body: JSON.stringify(tagData),
      })
      console.log('🏷️ [HOOK] Tag criada:', data)
      await fetchTags() // Recarrega a lista
      return data
    } catch (err) {
      console.error('❌ [HOOK] Erro ao criar tag:', err)
      throw err
    }
  }

  const updateTag = async (id: string, tagData: Partial<Tag>) => {
    try {
      console.log('🏷️ [HOOK] Atualizando tag:', { id, ...tagData })
      const data = await makeAuthenticatedRequest(`/tags/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tagData),
      })
      console.log('🏷️ [HOOK] Tag atualizada:', data)
      await fetchTags() // Recarrega a lista
      return data
    } catch (err) {
      console.error('❌ [HOOK] Erro ao atualizar tag:', err)
      throw err
    }
  }

  const deleteTag = async (id: string) => {
    try {
      console.log('🏷️ [HOOK] Deletando tag:', id)
      await makeAuthenticatedRequest(`/tags/${id}`, {
        method: 'DELETE',
      })
      console.log('🏷️ [HOOK] Tag deletada com sucesso')
      await fetchTags() // Recarrega a lista
    } catch (err) {
      console.error('❌ [HOOK] Erro ao deletar tag:', err)
      throw err
    }
  }

  // Função utilitária para obter tags por categoria
  const getTagsByCategory = (categoria: string) => {
    return tags.filter(tag => tag.categoria.toLowerCase() === categoria.toLowerCase() && tag.ativo)
  }

  // Função utilitária para obter tags favoritas
  const getFavoriteTags = () => {
    return tags.filter(tag => tag.favorito && tag.ativo)
  }

  // Função utilitária para obter cor da tag por nome
  const getTagColor = (tagName: string) => {
    const tag = tags.find(t => t.nome.toLowerCase() === tagName.toLowerCase())
    return tag?.cor || '#6b7280'
  }

  useEffect(() => {
    fetchTags()
  }, [])

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    getTagsByCategory,
    getFavoriteTags,
    getTagColor
  }
}
