'use client'

import { useState, useCallback } from 'react'

export interface MetaKanban {
  id: string
  colunaId: string
  quadroId: string
  nome: string
  descricao?: string
  tipoMeta: 'vendas' | 'orcamentos' | 'agendamentos' | 'atendimentos' | 'conversao'
  valorObjetivo: number
  valorAtual: number
  unidade: string // R$, unidades, %, atendimentos
  dataInicio: string
  dataFim: string
  status: 'em_andamento' | 'concluida' | 'pausada' | 'cancelada'
  progresso: number // 0-100
  alertarEm?: number
  alertaEnviado: boolean
  acoesAoAtingir?: string[]
  createdAt: string
  updatedAt: string
}

export function useMetasKanban(colunaId: string) {
  const [metas, setMetas] = useState<MetaKanban[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarMetas = useCallback(async (filters?: { status?: string, tipoMeta?: string, ativas?: boolean }) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      
      if (filters?.status) params.append('status', filters.status)
      if (filters?.tipoMeta) params.append('tipo_meta', filters.tipoMeta)
      if (filters?.ativas) params.append('ativas', 'true')
      
      const url = `/api/kanban/colunas/${colunaId}/metas${params.toString() ? `?${params.toString()}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Erro ao buscar metas')
      
      const data = await response.json()
      setMetas(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return []
    } finally {
      setLoading(false)
    }
  }, [colunaId])

  const criarMeta = useCallback(async (meta: Partial<MetaKanban>) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/colunas/${colunaId}/metas`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meta)
      })

      if (!response.ok) throw new Error('Erro ao criar meta')
      
      const data = await response.json()
      setMetas(prev => [...prev, data])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [colunaId])

  const atualizarMeta = useCallback(async (id: string, updates: Partial<MetaKanban>) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/metas/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Erro ao atualizar meta')
      
      const data = await response.json()
      setMetas(prev => prev.map(m => m.id === id ? data : m))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deletarMeta = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/metas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Erro ao deletar meta')
      
      setMetas(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const atualizarProgresso = useCallback(async (id: string, valorAtual: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/metas/${id}/progresso`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ valorAtual })
      })

      if (!response.ok) throw new Error('Erro ao atualizar progresso')
      
      const data = await response.json()
      setMetas(prev => prev.map(m => m.id === id ? data : m))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const calcularProgressoAutomatico = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/metas/${id}/calcular`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Erro ao calcular progresso')
      
      const data = await response.json()
      setMetas(prev => prev.map(m => m.id === id ? data : m))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleStatusMeta = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/metas/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Erro ao alternar status')
      
      const data = await response.json()
      setMetas(prev => prev.map(m => m.id === id ? data : m))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const buscarEstatisticas = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/colunas/${colunaId}/metas/stats`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Erro ao buscar estatísticas')
      
      return await response.json()
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err)
      return null
    }
  }, [colunaId])

  return {
    metas,
    loading,
    error,
    buscarMetas,
    criarMeta,
    atualizarMeta,
    deletarMeta,
    atualizarProgresso,
    calcularProgressoAutomatico,
    toggleStatusMeta,
    buscarEstatisticas
  }
}
