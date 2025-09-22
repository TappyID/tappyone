'use client'

import React, { useState, useEffect } from 'react'
import { X, Ticket } from 'lucide-react'

interface TicketsSidebarProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function TicketsSidebar({ isOpen, onClose, chatId }: TicketsSidebarProps) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && chatId) {
      fetchTickets()
    }
  }, [isOpen, chatId])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTickets(data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-xl border-l">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold">Tickets</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : tickets.length > 0 ? (
            tickets.map((ticket: any) => (
              <div key={ticket.id} className="bg-gray-50 border rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{ticket.titulo}</h4>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {ticket.status}
                  </span>
                </div>
                
                {ticket.descricao && (
                  <p className="text-sm text-gray-600 mb-3">{ticket.descricao}</p>
                )}
                
                <div className="flex flex-wrap gap-2">
                  <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                    Prioridade: {ticket.prioridade}
                  </div>
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {new Date(ticket.criadoEm).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum ticket encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
