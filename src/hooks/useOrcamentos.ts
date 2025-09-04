import { useState, useEffect } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:8081/'

export interface Orcamento {
  id: string
  titulo: string
  data: string // Backend retorna "data" 
  tipo: 'venda' | 'assinatura' | 'orcamento' | 'cobranca'
  observacao?: string // Backend retorna "observacao"
  valorTotal: number // Backend retorna "valorTotal" (camelCase)
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'CANCELADO' // Backend usa UPPER_CASE
  usuarioId: string // Backend retorna "usuarioId"
  contatoId: string // Backend retorna "contatoId"
  itens?: OrcamentoItem[]
  
  // Campos derivados do relacionamento com Contato
  contato?: {
    nome: string
    telefone?: string
  }
}

export interface OrcamentoItem {
  id?: string
  nome: string
  descricao?: string
  valor: number
  quantidade: number
  total?: number
}

export interface CreateOrcamentoRequest {
  titulo: string
  contato_id: string
  valorTotal: number
  observacao?: string
  tipo: Orcamento['tipo']
  itens?: OrcamentoItem[]
}

export interface UpdateOrcamentoRequest {
  id: string
  titulo?: string
  contato_id?: string
  valorTotal?: number
  observacao?: string
  tipo?: Orcamento['tipo']
  itens?: OrcamentoItem[]
}

export function useOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  // Buscar todos os orçamentos
  const fetchOrcamentos = async (filters?: { status?: string; contato_id?: string }) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters?.contato_id) {
        params.append('contato_id', filters.contato_id)
      }

      const url = `/api/orcamentos${params.toString() ? `?${params.toString()}` : ''}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar orçamentos: ${response.status}`)
      }

      const data = await response.json()
      console.log('📦 HOOK DEBUG - Dados recebidos da API:', data)
      setOrcamentos(data || [])
      return data
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido ao buscar orçamentos'
      setError(errorMsg)
      console.error('Erro ao buscar orçamentos:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Criar novo orçamento
  const createOrcamento = async (data: CreateOrcamentoRequest): Promise<Orcamento> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/orcamentos', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ao criar orçamento: ${response.status} - ${errorText}`)
      }

      const newOrcamento = await response.json()
      setOrcamentos(prev => [newOrcamento, ...prev])
      return newOrcamento
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido ao criar orçamento'
      setError(errorMsg)
      console.error('Erro ao criar orçamento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Atualizar orçamento
  const updateOrcamento = async (data: UpdateOrcamentoRequest): Promise<Orcamento> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/orcamentos/${data.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ao atualizar orçamento: ${response.status} - ${errorText}`)
      }

      const updatedOrcamento = await response.json()
      setOrcamentos(prev => 
        prev.map(orcamento => 
          orcamento.id === data.id ? updatedOrcamento : orcamento
        )
      )
      return updatedOrcamento
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar orçamento'
      setError(errorMsg)
      console.error('Erro ao atualizar orçamento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Deletar orçamento
  const deleteOrcamento = async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/orcamentos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ao deletar orçamento: ${response.status} - ${errorText}`)
      }

      setOrcamentos(prev => prev.filter(orcamento => orcamento.id !== id))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido ao deletar orçamento'
      setError(errorMsg)
      console.error('Erro ao deletar orçamento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Buscar orçamento por ID
  const getOrcamentoById = async (id: string): Promise<Orcamento> => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/orcamentos/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ao buscar orçamento: ${response.status} - ${errorText}`)
      }

      const orcamento = await response.json()
      return orcamento
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido ao buscar orçamento'
      setError(errorMsg)
      console.error('Erro ao buscar orçamento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Alterar status do orçamento
  const updateOrcamentoStatus = async (id: string, status: Orcamento['status']): Promise<void> => {
    try {
      await updateOrcamento({ id, status })
    } catch (err) {
      console.error('Erro ao alterar status do orçamento:', err)
      throw err
    }
  }

  // Buscar orçamentos ao inicializar
  useEffect(() => {
    fetchOrcamentos()
  }, [])

  return {
    orcamentos,
    loading,
    error,
    fetchOrcamentos,
    createOrcamento,
    updateOrcamento,
    deleteOrcamento,
    getOrcamentoById,
    updateOrcamentoStatus,
    setError,
  }
}
