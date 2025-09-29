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
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')
      
      const response = await fetch('/api/tags', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Ajustar estrutura para ser consistente
        const tagsFormatted = (data.data || data.tags || data || []).map((tag: any) => ({
          id: tag.id,
          nome: tag.nome,
          cor: tag.cor || '#3B82F6',
          count: tag.count || 0
        }))
        setTags(tagsFormatted)
      } else {
        throw new Error('API não disponível')
      }
    } catch (error) {
      console.log('Usando dados mock para tags:', error)
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

  // Buscar filas reais (igual à página /admin/filas)
  const fetchFilas = async () => {
    setIsLoadingFilas(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')

      const response = await fetch('/api/filas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Usar mesma estrutura da página de filas
        const filasFormatted = (data.data || data.filas || data || [])
          .filter((fila: any) => fila && fila.status !== 'inactive' && fila.status !== 'deleted' && fila.ativo !== false && !fila.deletedAt)
          .map((fila: any) => ({
          id: fila.id,
          nome: fila.nome,
          cor: fila.cor || '#3B82F6',
          descricao: fila.descricao || '',
          atendentes: fila.atendentes?.map((a: any) => a.usuarioId || a.id) || [],
          count: fila.estatisticas?.conversasAtivas || 0
        }))
        setFilas(filasFormatted)
      } else {
        throw new Error('API não disponível')
      }
    } catch (error) {
      console.error('Erro ao buscar filas:', error)
      setFilas([])
    } finally {
      setIsLoadingFilas(false)
    }
  }

  // Buscar quadros do Kanban (igual à página /admin/kanban)
  const fetchKanbanStatuses = async () => {
    setIsLoadingKanban(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')

      const response = await fetch('/api/kanban/quadros', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Usar estrutura de quadros (não colunas)
        const quadrosFormatted = (data.data || data.quadros || data || []).map((quadro: any) => ({
          id: quadro.id,
          nome: quadro.nome,
          cor: quadro.cor || '#3B82F6',
          quadro: quadro.id,
          count: quadro.totalCards || 0
        }))
        setKanbanStatuses(quadrosFormatted)
      } else {
        throw new Error('API não disponível')
      }
    } catch (error) {
      console.log('Usando dados mock para kanban:', error)
      setKanbanStatuses([
        { id: '1', nome: 'Pipeline Vendas', cor: '#3B82F6', count: 18 },
        { id: '2', nome: 'Suporte Cliente', cor: '#F59E0B', count: 12 },
        { id: '3', nome: 'Projetos', cor: '#8B5CF6', count: 8 },
        { id: '4', nome: 'Lead Qualification', cor: '#06B6D4', count: 5 },
        { id: '5', nome: 'Pós-Venda', cor: '#10B981', count: 23 }
      ])
    } finally {
      setIsLoadingKanban(false)
    }
  }

  // Buscar status de tickets (igual à página /admin/tickets)
  const fetchTicketStatuses = async () => {
    setIsLoadingTickets(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')

      // Buscar tickets para calcular status
      const response = await fetch('/api/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const tickets = data.data || data.tickets || data || []
        
        // Calcular contadores por status
        const statusCount: Record<string, number> = {}
        tickets.forEach((ticket: any) => {
          const status = ticket.status || 'ABERTO'
          statusCount[status] = (statusCount[status] || 0) + 1
        })

        // Status padrão do sistema de tickets
        const statusList = [
          { id: 'ABERTO', nome: 'Aberto', cor: '#F59E0B', count: statusCount['ABERTO'] || 0 },
          { id: 'ANDAMENTO', nome: 'Em Andamento', cor: '#3B82F6', count: statusCount['ANDAMENTO'] || 0 },
          { id: 'ENCERRADO', nome: 'Encerrado', cor: '#10B981', count: statusCount['ENCERRADO'] || 0 }
        ]
        
        setTicketStatuses(statusList)
      } else {
        throw new Error('API não disponível')
      }
    } catch (error) {
      console.log('Usando dados mock para tickets:', error)
      setTicketStatuses([
        { id: 'ABERTO', nome: 'Aberto', cor: '#F59E0B', count: 12 },
        { id: 'ANDAMENTO', nome: 'Em Andamento', cor: '#3B82F6', count: 8 },
        { id: 'ENCERRADO', nome: 'Encerrado', cor: '#10B981', count: 23 }
      ])
    } finally {
      setIsLoadingTickets(false)
    }
  }

  // Buscar atendentes reais (igual à página /admin/atendentes)
  const fetchAtendentes = async () => {
    setIsLoadingAtendentes(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Token não encontrado')

      // Buscar atendentes E admins (para quando admin assumir atendimento)
      const [atendentesResponse, adminsResponse] = await Promise.all([
        fetch('/api/users?tipo=atendente', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/users?tipo=admin', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ])
      
      const allUsers = []
      
      // Processar atendentes
      if (atendentesResponse.ok) {
        const atendentesData = await atendentesResponse.json()
        const atendentesFormatted = (atendentesData.data || atendentesData.users || atendentesData || []).map((atendente: any) => ({
          id: atendente.id,
          nome: atendente.nome,
          email: atendente.email,
          status: atendente.status || 'offline',
          atendimentosAtivos: atendente.atendimentosAtivos || 0,
          filas: atendente.filas?.map((f: any) => f.filaId || f.id) || [],
          rating: atendente.rating || 0,
          tipo: 'atendente'
        }))
        allUsers.push(...atendentesFormatted)
      }
      
      // Processar admins
      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json()
        const adminsFormatted = (adminsData.data || adminsData.users || adminsData || []).map((admin: any) => ({
          id: admin.id,
          nome: admin.nome,
          email: admin.email,
          status: admin.status || 'online',
          atendimentosAtivos: 0,
          filas: [], // Admins têm acesso a todas as filas
          rating: 5,
          tipo: 'admin'
        }))
        allUsers.push(...adminsFormatted)
      }
      
      console.log('👥 [useFiltersData] Atendentes + Admins carregados:', allUsers.length)
      setAtendentes(allUsers)
    } catch (error) {
      console.error('Erro ao buscar atendentes:', error)
      setAtendentes([])
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
