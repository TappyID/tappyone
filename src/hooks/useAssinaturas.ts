import { useState, useEffect } from 'react'

export interface Assinatura {
  id: string
  nome: string
  plano?: string
  forma_pagamento: string
  link_pagamento?: string
  valor: number
  renovacao: string
  data_inicio: string
  data_fim?: string
  status: string
  contato_id: string
  plano_id?: string
  usuario_id: string
  criado_em: string
  atualizado_em: string
}

export interface CreateAssinaturaData {
  nome: string
  plano: string
  forma_pagamento: string
  link_pagamento?: string
  valor: number
  renovacao: string
  data_inicio?: string
  data_fim?: string
  contato_id: string
}

export interface UpdateAssinaturaData {
  nome?: string
  forma_pagamento?: string
  link_pagamento?: string
  valor?: number
  renovacao?: string
  data_inicio?: string
  data_fim?: string
  status?: string
}

export function useAssinaturas() {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar todas as assinaturas
  const fetchAssinaturas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/assinaturas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAssinaturas(Array.isArray(data) ? data : [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao carregar assinaturas')
      }
    } catch (err) {
      setError('Erro de conexão ao carregar assinaturas')
      console.error('Erro ao buscar assinaturas:', err)
    } finally {
      setLoading(false)
    }
  }

  // Criar nova assinatura
  const createAssinatura = async (data: CreateAssinaturaData): Promise<void> => {
    try {
      const response = await fetch('/api/assinaturas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const novaAssinatura = await response.json()
        setAssinaturas(prev => [...prev, novaAssinatura])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar assinatura')
      }
    } catch (err) {
      console.error('Erro ao criar assinatura:', err)
      throw err
    }
  }

  // Atualizar assinatura
  const updateAssinatura = async (id: string, data: UpdateAssinaturaData): Promise<void> => {
    try {
      const response = await fetch(`/api/assinaturas/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const assinaturaAtualizada = await response.json()
        setAssinaturas(prev => prev.map(a => a.id === id ? assinaturaAtualizada : a))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar assinatura')
      }
    } catch (err) {
      console.error('Erro ao atualizar assinatura:', err)
      throw err
    }
  }

  // Deletar assinatura
  const deleteAssinatura = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/assinaturas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setAssinaturas(prev => prev.filter(a => a.id !== id))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir assinatura')
      }
    } catch (err) {
      console.error('Erro ao excluir assinatura:', err)
      throw err
    }
  }

  // Atualizar status da assinatura
  const updateAssinaturaStatus = async (id: string, status: string): Promise<void> => {
    try {
      const response = await fetch(`/api/assinaturas/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setAssinaturas(prev => prev.map(a => 
          a.id === id ? { ...a, status } : a
        ))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar status')
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      throw err
    }
  }

  // Buscar assinaturas vencendo
  const getAssinaturasVencendo = async (): Promise<Assinatura[]> => {
    try {
      const response = await fetch('/api/assinaturas/vencendo', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar assinaturas vencendo')
      }
    } catch (err) {
      console.error('Erro ao buscar assinaturas vencendo:', err)
      throw err
    }
  }

  // Buscar assinaturas por contato
  const getAssinaturasByContato = async (contatoId: string): Promise<Assinatura[]> => {
    try {
      const response = await fetch(`/api/assinaturas/contato/${contatoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        return await response.json()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar assinaturas do contato')
      }
    } catch (err) {
      console.error('Erro ao buscar assinaturas do contato:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchAssinaturas()
  }, [])

  return {
    assinaturas,
    loading,
    error,
    refetch: fetchAssinaturas,
    createAssinatura,
    updateAssinatura,
    deleteAssinatura,
    updateAssinaturaStatus,
    getAssinaturasVencendo,
    getAssinaturasByContato,
  }
}
