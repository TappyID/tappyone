import { useState, useEffect } from 'react'

export interface Atendente {
  id: string
  nome: string
  email: string
  telefone?: string
  tipo: 'admin' | 'atendente' | 'comercial' | 'suporte'
  ativo: boolean
  fila?: {
    id: string
    nome: string
    cor: string
  }
  criadoEm: string
  atualizadoEm: string
}

export interface AtendenteComStats extends Atendente {
  estatisticas?: {
    conversasAtivas: number
    totalConversas: number
    emAndamento: number
    concluidas: number
    ticketsResolvidos: number
    ticketsPendentes: number
  }
}

export interface UseAtendentesReturn {
  atendentes: AtendenteComStats[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createAtendente: (data: CreateAtendenteData) => Promise<void>
  updateAtendente: (id: string, data: Partial<Atendente>) => Promise<void>
  deleteAtendente: (id: string) => Promise<void>
}

export interface CreateAtendenteData {
  nome: string
  email: string
  telefone?: string
  tipo: Atendente['tipo']
  senha: string
}

export function useAtendentes(filters?: {
  tipo?: string
  status?: string
  search?: string
}): UseAtendentesReturn {
  const [atendentes, setAtendentes] = useState<AtendenteComStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAtendentes = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const params = new URLSearchParams()
      if (filters?.tipo && filters.tipo !== 'todos') {
        params.append('tipo', filters.tipo)
      }
      if (filters?.status && filters.status !== 'todos') {
        params.append('status', filters.status)
      }
      if (filters?.search) {
        params.append('search', filters.search)
      }

      const response = await fetch(`/api/atendentes?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao carregar atendentes')
      }

      const data = await response.json()
      
      // Transformar dados do backend para incluir estatísticas mock
      const atendentesComStats: AtendenteComStats[] = data.map((atendente: Atendente) => {
        const atendenteComStats: AtendenteComStats = {
          ...atendente,
          // Adicionar fila mock se não existir
          fila: atendente.fila || {
            id: ['1', '2', '3', '4', '5'][Math.floor(Math.random() * 5)],
            nome: ['Suporte Técnico', 'Vendas', 'Financeiro', 'Jurídico', 'Geral'][Math.floor(Math.random() * 5)],
            cor: ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-gray-500'][Math.floor(Math.random() * 5)]
          },
          estatisticas: {
            conversasAtivas: Math.floor(Math.random() * 15) + 1,
            totalConversas: Math.floor(Math.random() * 200) + 50,
            emAndamento: Math.floor(Math.random() * 8) + 1,
            concluidas: Math.floor(Math.random() * 150) + 25,
            ticketsResolvidos: Math.floor(Math.random() * 100) + 10,
            ticketsPendentes: Math.floor(Math.random() * 20) + 1
          }
        }
        return atendenteComStats
      })

      setAtendentes(atendentesComStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro ao carregar atendentes:', err)
    } finally {
      setLoading(false)
    }
  }

  const createAtendente = async (data: CreateAtendenteData) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch('/api/atendentes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar atendente')
      }

      await fetchAtendentes() // Recarregar lista
    } catch (err) {
      throw err
    }
  }

  const updateAtendente = async (id: string, data: Partial<Atendente>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch(`/api/atendentes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar atendente')
      }

      await fetchAtendentes() // Recarregar lista
    } catch (err) {
      throw err
    }
  }

  const deleteAtendente = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch(`/api/atendentes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao deletar atendente')
      }

      await fetchAtendentes() // Recarregar lista
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchAtendentes()
  }, [filters?.tipo, filters?.status, filters?.search])

  return {
    atendentes,
    loading,
    error,
    refetch: fetchAtendentes,
    createAtendente,
    updateAtendente,
    deleteAtendente,
  }
}
