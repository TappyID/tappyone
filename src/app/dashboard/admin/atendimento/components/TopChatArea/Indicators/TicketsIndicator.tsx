'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Ticket } from 'lucide-react'

interface TicketsIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function TicketsIndicator({ contatoId, onClick }: TicketsIndicatorProps) {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  console.log('🎫 [TicketsIndicator] Renderizado com contatoId:', contatoId)

  // Função para buscar tickets (usando telefone como TicketModal)
  const fetchTickets = useCallback(async () => {
    if (!contatoId) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return
      
      console.log('🎫 [TicketsIndicator] Buscando tickets para telefone:', contatoId)
      
      // Usar mesmo formato do TicketModal que funciona
      const response = await fetch(`/api/tickets?contato_id=${contatoId}`, {
        headers: { 
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      console.log('🎫 [TicketsIndicator] Status da resposta:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        const ticketsData = data.data || data || []
        console.log('🎫 [TicketsIndicator] Tickets encontrados:', ticketsData)
        setTickets(Array.isArray(ticketsData) ? ticketsData : [])
      } else {
        console.log('🎫 [TicketsIndicator] Nenhum ticket encontrado para telefone:', contatoId)
        setTickets([])
      }
    } catch (error) {
      console.error('❌ [TicketsIndicator] Erro ao buscar tickets:', error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [contatoId])

  // Carregar tickets quando contatoId mudar
  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Escutar evento de ticket criado para atualizar automaticamente
  useEffect(() => {
    const handleTicketCreated = (event: any) => {
      const { contatoId: eventContatoId } = event.detail
      console.log('🎫 [TicketsIndicator] Evento ticketCreated recebido:', event.detail)
      
      if (eventContatoId === contatoId) {
        console.log('🎫 [TicketsIndicator] Recarregando tickets após criação...')
        fetchTickets()
      }
    }

    window.addEventListener('ticketCreated', handleTicketCreated)
    
    return () => {
      window.removeEventListener('ticketCreated', handleTicketCreated)
    }
  }, [contatoId, fetchTickets])

  if (!contatoId) return null

  const ticketsCount = tickets.length
  
  // Criar tooltip com detalhes dos tickets
  const ticketsTooltip = ticketsCount > 0 
    ? `Tickets (${ticketsCount}): ${tickets.map(ticket => ticket.titulo || 'Sem título').join(', ')}`
    : `Nenhum ticket (${ticketsCount})`

  return (
    <button
      onClick={onClick}
      className="relative p-1 rounded-sm border transition-colors bg-red-500/20 hover:bg-red-500/30 border-red-400/30"
      title={ticketsTooltip}
    >
      <Ticket className="w-4 h-4 text-red-600" />
      
      {/* Badge com contador real */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center bg-red-500">
        <span className="text-xs font-bold text-white">{ticketsCount}</span>
      </div>
    </button>
  )
}
