'use client'

import { useState, useEffect } from 'react'

export interface Ticket {
  id: string
  titulo: string
  descricao?: string
  status: 'ABERTO' | 'ANDAMENTO' | 'ENCERRADO'
  prioridade: number // 1 = Alta, 2 = Média, 3 = Baixa
  usuarioId: string
  contatoId: string
  atendenteId?: string
  filaId?: string
  criadoEm: string
  atualizadoEm: string
}

interface TicketsResponse {
  tickets: Ticket[]
  total: number
}

interface CreateTicketData {
  titulo: string
  descricao?: string
  status?: Ticket['status']
  prioridade?: number
  contato_id: string
}

interface UpdateTicketData {
  titulo?: string
  descricao?: string
  status?: Ticket['status']
  prioridade?: number
}

interface UseTicketsOptions {
  contactId?: string
  status?: Ticket['status']
  autoFetch?: boolean
}

export function useTickets(options: UseTicketsOptions = {}) {
  const { contactId, status, autoFetch = true } = options
  
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  // Função para buscar tickets
  const fetchTickets = async (filters?: { contactId?: string; status?: string }) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      // Construir query parameters
      const params = new URLSearchParams()
      
      if (filters?.contactId || contactId) {
        const phoneNumber = (filters?.contactId || contactId)?.replace('@c.us', '')
        if (phoneNumber) {
          params.append('contato_id', phoneNumber)
        }
      }
      
      if (filters?.status || status) {
        params.append('status', filters?.status || status!)
      }

      const queryString = params.toString()
      const url = `/api/tickets${queryString ? `?${queryString}` : ''}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar tickets: ${response.statusText}`)
      }

      const data = await response.json()
      setTickets(Array.isArray(data) ? data : [])
      setTotal(Array.isArray(data) ? data.length : 0)
      
      return Array.isArray(data) ? data : []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao buscar tickets:', err)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Função para buscar um ticket específico
  const getTicket = async (ticketId: string): Promise<Ticket | null> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch(`/api/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar ticket: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      console.error('Erro ao buscar ticket:', err)
      return null
    }
  }

  // Função para criar ticket
  const createTicket = async (data: CreateTicketData): Promise<Ticket | null> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: data.titulo,
          descricao: data.descricao || '',
          status: data.status || 'ABERTO',
          prioridade: data.prioridade || 2,
          contato_id: data.contato_id.replace('@c.us', '')
        })
      })

      if (!response.ok) {
        throw new Error(`Erro ao criar ticket: ${response.statusText}`)
      }

      const newTicket = await response.json()
      
      // Atualizar lista local
      setTickets(prev => [newTicket, ...prev])
      setTotal(prev => prev + 1)
      
      return newTicket
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao criar ticket:', err)
      return null
    }
  }

  // Função para atualizar ticket
  const updateTicket = async (ticketId: string, data: UpdateTicketData): Promise<Ticket | null> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar ticket: ${response.statusText}`)
      }

      const updatedTicket = await response.json()
      
      // Atualizar lista local
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId ? { ...ticket, ...updatedTicket } : ticket
        )
      )
      
      return updatedTicket
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao atualizar ticket:', err)
      return null
    }
  }

  // Função para atualizar apenas o status
  const updateTicketStatus = async (ticketId: string, status: Ticket['status']): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar status: ${response.statusText}`)
      }

      // Atualizar lista local
      setTickets(prev => 
        prev.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status } : ticket
        )
      )
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao atualizar status:', err)
      return false
    }
  }

  // Função para deletar ticket
  const deleteTicket = async (ticketId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao deletar ticket: ${response.statusText}`)
      }

      // Remover da lista local
      setTickets(prev => prev.filter(ticket => ticket.id !== ticketId))
      setTotal(prev => prev - 1)
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao deletar ticket:', err)
      return false
    }
  }

  // Função para buscar tickets abertos
  const fetchOpenTickets = async (): Promise<Ticket[]> => {
    return fetchTickets({ status: 'ABERTO' })
  }

  // Função para buscar tickets por contato
  const fetchTicketsByContact = async (contactId: string): Promise<Ticket[]> => {
    return fetchTickets({ contactId })
  }

  // Auto-fetch quando o hook é inicializado
  useEffect(() => {
    if (autoFetch) {
      fetchTickets()
    }
  }, [contactId, status, autoFetch])

  // Funções de utilidade
  const getTicketsByStatus = (status: Ticket['status']) => {
    return tickets.filter(ticket => ticket.status === status)
  }

  const getTicketsByPriority = (priority: number) => {
    return tickets.filter(ticket => ticket.prioridade === priority)
  }

  const getTicketCounts = () => {
    return {
      total: tickets.length,
      abertos: tickets.filter(t => t.status === 'ABERTO').length,
      andamento: tickets.filter(t => t.status === 'ANDAMENTO').length,
      encerrados: tickets.filter(t => t.status === 'ENCERRADO').length,
      alta: tickets.filter(t => t.prioridade === 1).length,
      media: tickets.filter(t => t.prioridade === 2).length,
      baixa: tickets.filter(t => t.prioridade === 3).length
    }
  }

  return {
    // Estado
    tickets,
    loading,
    error,
    total,
    
    // Ações
    fetchTickets,
    getTicket,
    createTicket,
    updateTicket,
    updateTicketStatus,
    deleteTicket,
    fetchOpenTickets,
    fetchTicketsByContact,
    
    // Utilidades
    getTicketsByStatus,
    getTicketsByPriority,
    getTicketCounts,
    
    // Função para limpar erro
    clearError: () => setError(null),
    
    // Função para refresh
    refresh: () => fetchTickets()
  }
}

export default useTickets
