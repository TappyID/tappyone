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
  console.log('🏷️ [useFilas] Hook inicializado')
  
  const { token } = useAuth()
  const [filas, setFilas] = useState<Fila[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  console.log('🏷️ [useFilas] Token do useAuth:', token ? 'Presente' : 'Ausente')

  // Usar sempre as rotas proxy do Next.js para evitar CORS
  const baseURL = '/api/filas'

  const fetchFilas = useCallback(async () => {
    if (!token) {
      console.log('❌ [useFilas] Token não encontrado')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log(`🏷️ [useFilas] Buscando filas...`)
      console.log(`🏷️ [useFilas] URL: ${baseURL}`)
      console.log(`🏷️ [useFilas] Token: ${token ? 'Presente' : 'Ausente'}`)
      
      const response = await fetch(baseURL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log(`🏷️ [useFilas] Response status: ${response.status}`)
      console.log(`🏷️ [useFilas] Response ok: ${response.ok}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`🏷️ [useFilas] Error response: ${errorText}`)
        throw new Error(`Erro ao buscar filas: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log(`🏷️ [useFilas] Response completa:`, result)
      
      const data = result.success ? result.data : result
      console.log(`🏷️ [useFilas] Data extraída:`, data)
      
      const filasArray = Array.isArray(data) ? data : []
      console.log(`🏷️ [useFilas] Filas processadas:`, filasArray)
      
      setFilas(filasArray)
    } catch (err) {
      console.error('❌ [useFilas] Erro ao buscar filas:', err)
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
    console.log('🏷️ [useFilas] useEffect executando...')
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
