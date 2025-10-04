'use client'

import { useState, useCallback } from 'react'

export interface AutomacaoKanban {
  id: string
  colunaId: string
  quadroId: string
  nome: string
  descricao?: string
  ativa: boolean
  tipoGatilho: 'card_movido' | 'card_criado' | 'tempo_excedido' | 'meta_atingida' | 'coluna_atualizada'
  configGatilho: any
  condicoes: any[]
  acoes: any[]
  totalExecucoes: number
  ultimaExecucao?: string
  createdAt: string
  updatedAt: string
}

export function useAutomacoesKanban(colunaId: string) {
  const [automacoes, setAutomacoes] = useState<AutomacaoKanban[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscarAutomacoes = useCallback(async (ativa?: boolean) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const url = ativa !== undefined 
        ? `/api/kanban/colunas/${colunaId}/automacoes?ativa=${ativa}`
        : `/api/kanban/colunas/${colunaId}/automacoes`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Erro ao buscar automações')
      
      const data = await response.json()
      setAutomacoes(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return []
    } finally {
      setLoading(false)
    }
  }, [colunaId])

  const criarAutomacao = useCallback(async (automacao: Partial<AutomacaoKanban>) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/colunas/${colunaId}/automacoes`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(automacao)
      })

      if (!response.ok) throw new Error('Erro ao criar automação')
      
      const data = await response.json()
      setAutomacoes(prev => [...prev, data])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [colunaId])

  const atualizarAutomacao = useCallback(async (id: string, updates: Partial<AutomacaoKanban>) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/automacoes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Erro ao atualizar automação')
      
      const data = await response.json()
      setAutomacoes(prev => prev.map(a => a.id === id ? data : a))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deletarAutomacao = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/automacoes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Erro ao deletar automação')
      
      setAutomacoes(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleAutomacao = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/automacoes/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Erro ao alternar automação')
      
      const data = await response.json()
      setAutomacoes(prev => prev.map(a => a.id === id ? data : a))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const executarAutomacao = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/kanban/automacoes/${id}/executar`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) throw new Error('Erro ao executar automação')
      
      const data = await response.json()
      setAutomacoes(prev => prev.map(a => a.id === id ? data.automacao : a))
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
      const response = await fetch(`/api/kanban/colunas/${colunaId}/automacoes/stats`, {
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
    automacoes,
    loading,
    error,
    buscarAutomacoes,
    criarAutomacao,
    atualizarAutomacao,
    deletarAutomacao,
    toggleAutomacao,
    executarAutomacao,
    buscarEstatisticas
  }
}
