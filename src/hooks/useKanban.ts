'use client'

import { useState, useEffect } from 'react'

export interface Quadro {
  id: string
  nome: string
  cor: string
  descricao?: string
  posicao: number
  ativo: boolean
  usuarioId: string
  createdAt: string
  updatedAt: string
  // Campos calculados para o frontend
  totalCards?: number
  totalColunas?: number
  membros?: number
  ultimaAtualizacao?: string
  progresso?: number
  status?: string
  favorito?: boolean
}

export interface CreateQuadroRequest {
  nome: string
  cor: string
  descricao?: string
  posicao: number
}

export interface UpdateQuadroRequest {
  nome?: string
  cor?: string
  descricao?: string
  posicao?: number
  ativo?: boolean
}

export function useKanban() {
  const [quadros, setQuadros] = useState<Quadro[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Aguardar hidratação do cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Função para buscar token do localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      console.log('🔑 Token encontrado:', token ? 'presente' : 'ausente')
      return token
    }
    console.log('🔑 Window undefined - SSR')
    return null
  }

  // Função para fazer requisições autenticadas
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    if (!isClient) {
      throw new Error('Cliente ainda não hidratado')
    }
    
    const token = getAuthToken()
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
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Buscar todos os quadros do usuário
  const fetchQuadros = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await makeAuthenticatedRequest('/kanban/quadros')
      
      // Transformar dados do backend para o formato do frontend
      const transformedQuadros = data.map((quadro: any, index: number) => {
        // Debug: Verificar dados brutos do backend
        console.log('🔍 Dados do quadro:', quadro.nome, {
          colunas: quadro.colunas?.length || 0,
          colunasData: quadro.colunas,
          totalCards: quadro.colunas?.reduce((acc: number, col: any) => acc + (col.cards?.length || 0), 0) || 0,
          cardsDetalhados: quadro.colunas?.map((col: any) => ({ nome: col.nome, cards: col.cards?.length || 0 }))
        })
        
        // Calcular estatísticas baseadas APENAS nos dados reais
        const totalColunas = quadro.colunas?.length || 0
        const totalCards = quadro.colunas?.reduce((acc: number, col: any) => acc + (col.cards?.length || 0), 0) || 0
        const membros = 1 // Usuário principal (TODO: implementar sistema de membros)
        
        // Calcular progresso baseado em cards concluídos
        const cardsCompletos = quadro.colunas?.reduce((acc: number, col: any) => {
          if (col.nome?.toLowerCase().includes('concluído') || col.nome?.toLowerCase().includes('finalizado')) {
            return acc + (col.cards?.length || 0)
          }
          return acc
        }, 0) || 0
        
        const progresso = totalCards > 0 ? Math.round((cardsCompletos / totalCards) * 100) : 0
        
        // Data de atualização formatada
        const ultimaAtualizacao = quadro.updatedAt 
          ? new Date(quadro.updatedAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit', 
              year: 'numeric'
            })
          : 'Hoje'
        
        return {
          ...quadro,
          totalCards,
          totalColunas,
          membros,
          ultimaAtualizacao,
          progresso,
          status: quadro.ativo ? 'Ativo' : 'Inativo',
          favorito: false, // TODO: Implementar sistema de favoritos
          // Cor com fallback
          cor: quadro.cor || ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6]
        }
      })
      
      setQuadros(transformedQuadros)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar quadros')
      console.error('Erro ao buscar quadros:', err)
    } finally {
      setLoading(false)
    }
  }

  // Criar novo quadro
  const createQuadro = async (quadroData: CreateQuadroRequest): Promise<Quadro> => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await makeAuthenticatedRequest('/kanban/quadros', {
        method: 'POST',
        body: JSON.stringify(quadroData),
      })
      
      // Transformar dados do backend
      const newQuadro = {
        ...data,
        totalCards: 0,
        totalColunas: 3, // Padrão: A Fazer, Em Andamento, Concluído
        membros: 1,
        ultimaAtualizacao: new Date().toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        progresso: 0,
        status: 'Ativo',
        favorito: false,
        leads: 0,
        conversoes: 0,
        taxa: 0,
      }
      
      setQuadros(prev => [...prev, newQuadro])
      return newQuadro
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar quadro')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Atualizar quadro
  const updateQuadro = async (quadroId: string, updateData: UpdateQuadroRequest): Promise<Quadro> => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await makeAuthenticatedRequest(`/kanban/quadros/${quadroId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })
      
      const updatedQuadro = {
        ...data,
        ultimaAtualizacao: new Date().toLocaleDateString('pt-BR'),
      }
      
      setQuadros(prev => prev.map(q => q.id === quadroId ? { ...q, ...updatedQuadro } : q))
      return updatedQuadro
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar quadro')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Deletar quadro
  const deleteQuadro = async (quadroId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      await makeAuthenticatedRequest(`/kanban/quadros/${quadroId}`, {
        method: 'DELETE',
      })
      
      setQuadros(prev => prev.filter(q => q.id !== quadroId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar quadro')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Buscar quadro específico
  const getQuadro = async (quadroId: string): Promise<Quadro> => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await makeAuthenticatedRequest(`/kanban/quadros/${quadroId}`)
      
      return {
        ...data,
        ultimaAtualizacao: new Date(data.updatedAt).toLocaleDateString('pt-BR'),
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar quadro')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Carregar quadros automaticamente quando cliente estiver hidratado
  useEffect(() => {
    if (isClient) {
      fetchQuadros()
    }
  }, [isClient])

  // Criar nova coluna
  const createColuna = async (colunaData: {
    nome: string
    cor: string
    posicao: number
    quadroId: string
  }): Promise<any> => {
    try {
      const data = await makeAuthenticatedRequest('/kanban/column-create', {
        method: 'POST',
        body: JSON.stringify(colunaData),
      })
      
      return data
    } catch (err) {
      throw err
    }
  }

  return {
    quadros,
    loading,
    error,
    fetchQuadros,
    createQuadro,
    createColuna,
    updateQuadro,
    deleteQuadro,
    getQuadro,
  }
}
