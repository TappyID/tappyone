'use client'

import { useState, useEffect } from 'react'

// Interfaces para os dados
export interface Tag {
  id: string
  nome: string
  cor: string
  count?: number
}

export interface Fila {
  id: string
  nome: string
  cor: string
  descricao?: string
  atendentes?: string[]
  count?: number
}

export interface KanbanStatus {
  id: string
  nome: string
  cor: string
  quadro?: string
  count?: number
}

export interface TicketStatus {
  id: string
  nome: string
  cor: string
  count?: number
}

export interface PriceRange {
  id: string
  label: string
  min: number
  max: number | null
  count?: number
}

export interface Atendente {
  id: string
  nome: string
  email: string
  avatar?: string
  status: 'online' | 'offline' | 'busy' | 'away'
  atendimentosAtivos?: number
  filas?: string[]
  rating?: number
}

// Hook principal para dados dos filtros
export function useFiltersData() {
  const [tags, setTags] = useState<Tag[]>([])
  const [filas, setFilas] = useState<Fila[]>([])
  const [kanbanStatuses, setKanbanStatuses] = useState<KanbanStatus[]>([])
  const [ticketStatuses, setTicketStatuses] = useState<TicketStatus[]>([])
  const [priceRanges, setPriceRanges] = useState<PriceRange[]>([])
  const [atendentes, setAtendentes] = useState<Atendente[]>([])
  
  const [isLoadingTags, setIsLoadingTags] = useState(false)
  const [isLoadingFilas, setIsLoadingFilas] = useState(false)
  const [isLoadingKanban, setIsLoadingKanban] = useState(false)
  const [isLoadingTickets, setIsLoadingTickets] = useState(false)
  const [isLoadingAtendentes, setIsLoadingAtendentes] = useState(false)

  // Buscar tags reais
  const fetchTags = async () => {
    setIsLoadingTags(true)
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data.tags || data)
      } else {
        throw new Error('API não disponível')
      }
    } catch (error) {
      console.log('Usando dados mock para tags')
      // Dados mock enquanto não há API
      setTags([
        { id: '1', nome: 'Vendas', cor: '#10B981', count: 25 },
        { id: '2', nome: 'Suporte', cor: '#3B82F6', count: 18 },
        { id: '3', nome: 'Financeiro', cor: '#F59E0B', count: 12 },
        { id: '4', nome: 'Urgente', cor: '#EF4444', count: 7 },
        { id: '5', nome: 'VIP', cor: '#8B5CF6', count: 5 },
        { id: '6', nome: 'Follow-up', cor: '#06B6D4', count: 15 }
      ])
    } finally {
      setIsLoadingTags(false)
    }
  }

  // Buscar filas reais
  const fetchFilas = async () => {
    setIsLoadingFilas(true)
    try {
      const response = await fetch('/api/filas')
      if (response.ok) {
        const data = await response.json()
        setFilas(data.filas || data)
      } else {
        throw new Error('API não disponível')
      }
    } catch (error) {
      console.log('Usando dados mock para filas')
      setFilas([
        { 
          id: '1', 
          nome: 'Atendimento Geral', 
          cor: '#3B82F6', 
          descricao: 'Fila principal de atendimento',
          atendentes: ['1', '2', '3'],
          count: 45 
        },
        { 
          id: '2', 
          nome: 'Vendas', 
          cor: '#10B981',
          descricao: 'Atendimento comercial',
          atendentes: ['2', '4'],
          count: 32 
        },
        { 
          id: '3', 
          nome: 'Suporte Técnico', 
          cor: '#F59E0B',
          descricao: 'Suporte e resolução de problemas',
          atendentes: ['1', '3'],
          count: 28 
        },
        { 
          id: '4', 
          nome: 'Financeiro', 
          cor: '#8B5CF6',
          descricao: 'Questões financeiras e cobranças',
          atendentes: ['4'],
          count: 15 
        },
        { 
          id: '5', 
          nome: 'Pós-Venda', 
          cor: '#06B6D4',
          descricao: 'Acompanhamento pós-venda',
          atendentes: ['2', '3'],
          count: 22 
        }
      ])
    } finally {
      setIsLoadingFilas(false)
    }
  }

  // Buscar status do Kanban
  const fetchKanbanStatuses = async () => {
    setIsLoadingKanban(true)
    try {
      const response = await fetch('/api/kanban/colunas')
      if (response.ok) {
        const data = await response.json()
        // Transformar colunas em status
        const statuses = data.colunas?.map((col: any) => ({
          id: col.id,
          nome: col.nome,
          cor: col.cor || '#3B82F6',
          quadro: col.quadro_id,
          count: col.cards?.length || 0
        })) || []
        setKanbanStatuses(statuses)
      } else {
        throw new Error('API não disponível')
      }
    } catch (error) {
      console.log('Usando dados mock para kanban')
      setKanbanStatuses([
        { id: '1', nome: 'Novo Lead', cor: '#3B82F6', count: 18 },
        { id: '2', nome: 'Qualificado', cor: '#F59E0B', count: 12 },
        { id: '3', nome: 'Proposta', cor: '#8B5CF6', count: 8 },
        { id: '4', nome: 'Negociação', cor: '#06B6D4', count: 5 },
        { id: '5', nome: 'Fechado', cor: '#10B981', count: 23 },
        { id: '6', nome: 'Perdido', cor: '#EF4444', count: 7 }
      ])
    } finally {
      setIsLoadingKanban(false)
    }
  }

  // Buscar status de tickets
  const fetchTicketStatuses = async () => {
    setIsLoadingTickets(true)
    try {
      const response = await fetch('/api/tickets/status')
      if (response.ok) {
        const data = await response.json()
        setTicketStatuses(data.statuses || data)
      } else {
        throw new Error('API não disponível')
      }
    } catch (error) {
      console.log('Usando dados mock para tickets')
      setTicketStatuses([
        { id: '1', nome: 'Aberto', cor: '#F59E0B', count: 12 },
        { id: '2', nome: 'Em Andamento', cor: '#3B82F6', count: 8 },
        { id: '3', nome: 'Aguardando Cliente', cor: '#8B5CF6', count: 5 },
        { id: '4', nome: 'Resolvido', cor: '#10B981', count: 23 },
        { id: '5', nome: 'Fechado', cor: '#6B7280', count: 45 }
      ])
    } finally {
      setIsLoadingTickets(false)
    }
  }

  // Buscar atendentes reais
  const fetchAtendentes = async () => {
    setIsLoadingAtendentes(true)
    try {
      const response = await fetch('/api/atendentes')
      if (response.ok) {
        const data = await response.json()
        setAtendentes(data.atendentes || data)
      } else {
        throw new Error('API não disponível')
      }
    } catch (error) {
      console.log('Usando dados mock para atendentes')
      setAtendentes([
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@example.com',
          status: 'online',
          atendimentosAtivos: 3,
          filas: ['1', '3'],
          rating: 4.8
        },
        {
          id: '2',
          nome: 'Maria Santos',
          email: 'maria@example.com',
          status: 'busy',
          atendimentosAtivos: 5,
          filas: ['1', '2', '5'],
          rating: 4.9
        },
        {
          id: '3',
          nome: 'Pedro Oliveira',
          email: 'pedro@example.com',
          status: 'online',
          atendimentosAtivos: 2,
          filas: ['3', '5'],
          rating: 4.7
        },
        {
          id: '4',
          nome: 'Ana Costa',
          email: 'ana@example.com',
          status: 'away',
          atendimentosAtivos: 0,
          filas: ['2', '4'],
          rating: 4.6
        }
      ])
    } finally {
      setIsLoadingAtendentes(false)
    }
  }

  // Gerar faixas de preço para orçamentos
  const generatePriceRanges = () => {
    setPriceRanges([
      { id: '1', label: 'Até R$ 100', min: 0, max: 100, count: 15 },
      { id: '2', label: 'R$ 101 - R$ 500', min: 101, max: 500, count: 28 },
      { id: '3', label: 'R$ 501 - R$ 1.000', min: 501, max: 1000, count: 22 },
      { id: '4', label: 'R$ 1.001 - R$ 5.000', min: 1001, max: 5000, count: 18 },
      { id: '5', label: 'R$ 5.001 - R$ 10.000', min: 5001, max: 10000, count: 8 },
      { id: '6', label: 'Acima de R$ 10.000', min: 10001, max: null, count: 5 }
    ])
  }

  // Carregar todos os dados ao montar
  useEffect(() => {
    fetchTags()
    fetchFilas()
    fetchKanbanStatuses()
    fetchTicketStatuses()
    fetchAtendentes()
    generatePriceRanges()
  }, [])

  // Função para recarregar dados específicos
  const refetch = {
    tags: fetchTags,
    filas: fetchFilas,
    kanban: fetchKanbanStatuses,
    tickets: fetchTicketStatuses,
    atendentes: fetchAtendentes,
    all: () => {
      fetchTags()
      fetchFilas()
      fetchKanbanStatuses()
      fetchTicketStatuses()
      fetchAtendentes()
    }
  }

  return {
    // Dados
    tags,
    filas,
    kanbanStatuses,
    ticketStatuses,
    priceRanges,
    atendentes,
    
    // Estados de carregamento
    isLoadingTags,
    isLoadingFilas,
    isLoadingKanban,
    isLoadingTickets,
    isLoadingAtendentes,
    
    // Funções de atualização
    refetch
  }
}
