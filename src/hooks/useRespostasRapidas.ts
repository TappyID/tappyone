import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'

export interface CategoriaResposta {
  id: string
  nome: string
  descricao?: string
  cor: string
  ordem: number
  ativo: boolean
  usuario_id: string
  created_at: string
  updated_at: string
}

export interface AcaoResposta {
  id: string
  resposta_rapida_id: string
  tipo: 'texto' | 'imagem' | 'audio' | 'video' | 'arquivo' | 'pix' | 'delay'
  conteudo: any // JSON content
  ordem: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface RespostaRapida {
  id: string
  titulo: string
  descricao?: string
  categoria_id?: string
  categoria?: CategoriaResposta
  triggers: string[] // palavras-chave que ativam a resposta
  agendamento_ativo: boolean
  agendamento_config?: any // JSON config
  pausado: boolean
  ordem: number
  ativo: boolean
  usuario_id: string
  acoes: AcaoResposta[]
  created_at: string
  updated_at: string
}

export interface EstatisticasResposta {
  total_categorias: number
  total_respostas: number
  respostas_ativas: number
  total_execucoes: number
  execucoes_hoje: number
}

export interface CreateRespostaRequest {
  titulo: string
  descricao?: string
  categoria_id?: string
  triggers: string[]
  agendamento_ativo: boolean
  agendamento_config?: any
  acoes: Omit<AcaoResposta, 'id' | 'resposta_rapida_id' | 'created_at' | 'updated_at'>[]
}

export interface CreateCategoriaRequest {
  nome: string
  descricao?: string
  cor: string
  ordem?: number
}

export function useRespostasRapidas() {
  const { token } = useAuth()
  const [respostas, setRespostas] = useState<RespostaRapida[]>([])
  const [categorias, setCategorias] = useState<CategoriaResposta[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasResposta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/respostas-rapidas${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }, [token])

  const fetchRespostas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiCall('/')
      setRespostas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar respostas')
      console.error('Erro ao buscar respostas:', err)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiCall('/categorias')
      setCategorias(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar categorias')
      console.error('Erro ao buscar categorias:', err)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const fetchEstatisticas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiCall('/estatisticas')
      setEstatisticas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar estatísticas')
      console.error('Erro ao buscar estatísticas:', err)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const createResposta = useCallback(async (data: CreateRespostaRequest) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall('/', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar resposta')
      console.error('Erro ao criar resposta:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const updateResposta = useCallback(async (id: string, data: Partial<CreateRespostaRequest>) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar resposta')
      console.error('Erro ao atualizar resposta:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const deleteResposta = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await apiCall(`/${id}`, {
        method: 'DELETE',
      })
      // Remove da lista local
      setRespostas(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir resposta')
      console.error('Erro ao excluir resposta:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const togglePausarResposta = useCallback(async (id: string, pausado: boolean) => {
    try {
      setLoading(true)
      setError(null)
      await apiCall(`/${id}/pausar`, {
        method: 'PUT',
        body: JSON.stringify({ pausado }),
      })
      // Atualiza na lista local
      setRespostas(prev => prev.map(r => 
        r.id === id ? { ...r, pausado } : r
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao pausar/despausar resposta')
      console.error('Erro ao pausar/despausar resposta:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const executarResposta = useCallback(async (id: string, chatId: string) => {
    try {
      setLoading(true)
      setError(null)
      await apiCall(`/${id}/executar`, {
        method: 'POST',
        body: JSON.stringify({ chat_id: chatId }),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao executar resposta')
      console.error('Erro ao executar resposta:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const createCategoria = useCallback(async (data: CreateCategoriaRequest) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall('/categorias', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar categoria')
      console.error('Erro ao criar categoria:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  return {
    respostas,
    categorias,
    estatisticas,
    loading,
    error,
    fetchRespostas,
    fetchCategorias,
    fetchEstatisticas,
    createResposta,
    updateResposta,
    deleteResposta,
    togglePausarResposta,
    executarResposta,
    createCategoria,
  }
}
