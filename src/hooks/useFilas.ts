import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface Fila {
  id: string
  nome: string
  descricao?: string
  cor?: string
  icone?: string
  ativa: boolean
  ordem: number
  maxContatos?: number
  atribuicaoAutomatica: boolean
  criadoEm: string
  atualizadoEm: string
  // Campos relacionados ao kanban/atendimento
  totalContatos?: number
  contatosAtivos?: number
  tempoMedioAtendimento?: number
}

interface FilaContato {
  id: string
  filaId: string
  contatoId: string
  posicao: number
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  atribuidoEm: string
  status: 'aguardando' | 'em_atendimento' | 'pausado' | 'finalizado'
}

export function useFilas() {
  const { token } = useAuth()
  const [filas, setFilas] = useState<Fila[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Usar variáveis de ambiente seguindo padrão do projeto
  const getBaseURL = () => {
    if (typeof window === 'undefined') {
      return process.env.BACKEND_URL || 'http://localhost:8081'
    }
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
  }

  const baseURL = `${getBaseURL()}/api/filas`

  const fetchFilas = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(baseURL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar filas: ${response.statusText}`)
      }

      const result = await response.json()
      const data = result.success ? result.data : result
      setFilas(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erro ao buscar filas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setFilas([])
    } finally {
      setLoading(false)
    }
  }, [token, baseURL])

  const createFila = useCallback(async (fila: Omit<Fila, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    if (!token) return null

    try {
      const response = await fetch(baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fila)
      })

      if (!response.ok) {
        throw new Error(`Erro ao criar fila: ${response.statusText}`)
      }

      const result = await response.json()
      const novaFila = result.success ? result.data : result
      setFilas(prev => [...prev, novaFila])
      return novaFila
    } catch (err) {
      console.error('Erro ao criar fila:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar fila')
      return null
    }
  }, [token, baseURL])

  const updateFila = useCallback(async (id: string, updates: Partial<Fila>) => {
    if (!token) return null

    try {
      const response = await fetch(`${baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar fila: ${response.statusText}`)
      }

      const result = await response.json()
      const filaAtualizada = result.success ? result.data : result
      setFilas(prev => prev.map(f => f.id === id ? filaAtualizada : f))
      return filaAtualizada
    } catch (err) {
      console.error('Erro ao atualizar fila:', err)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar fila')
      return null
    }
  }, [token, baseURL])

  const deleteFila = useCallback(async (id: string) => {
    if (!token) return false

    try {
      const response = await fetch(`${baseURL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao deletar fila: ${response.statusText}`)
      }

      setFilas(prev => prev.filter(f => f.id !== id))
      return true
    } catch (err) {
      console.error('Erro ao deletar fila:', err)
      setError(err instanceof Error ? err.message : 'Erro ao deletar fila')
      return false
    }
  }, [token, baseURL])

  const moverContatoParaFila = useCallback(async (contatoId: string, filaId: string, prioridade: FilaContato['prioridade'] = 'media') => {
    if (!token) return false

    try {
      const response = await fetch(`${baseURL}/${filaId}/contatos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contatoId, prioridade })
      })

      if (!response.ok) {
        throw new Error(`Erro ao mover contato para fila: ${response.statusText}`)
      }

      // Recarregar filas para atualizar contadores
      fetchFilas()
      return true
    } catch (err) {
      console.error('Erro ao mover contato para fila:', err)
      setError(err instanceof Error ? err.message : 'Erro ao mover contato')
      return false
    }
  }, [token, baseURL, fetchFilas])

  const removerContatoDaFila = useCallback(async (contatoId: string, filaId: string) => {
    if (!token) return false

    try {
      const response = await fetch(`${baseURL}/${filaId}/contatos/${contatoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao remover contato da fila: ${response.statusText}`)
      }

      // Recarregar filas para atualizar contadores
      fetchFilas()
      return true
    } catch (err) {
      console.error('Erro ao remover contato da fila:', err)
      setError(err instanceof Error ? err.message : 'Erro ao remover contato')
      return false
    }
  }, [token, baseURL, fetchFilas])

  useEffect(() => {
    fetchFilas()
  }, [fetchFilas])

  return { 
    filas: filas.sort((a, b) => a.ordem - b.ordem), 
    loading, 
    error, 
    refresh: fetchFilas,
    createFila,
    updateFila,
    deleteFila,
    moverContatoParaFila,
    removerContatoDaFila
  }
}
