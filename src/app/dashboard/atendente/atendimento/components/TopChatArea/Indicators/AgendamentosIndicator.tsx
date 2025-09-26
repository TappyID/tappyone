'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Calendar } from 'lucide-react'

interface AgendamentosIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function AgendamentosIndicator({ contatoId, onClick }: AgendamentosIndicatorProps) {
  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  console.log('📅 [AgendamentosIndicator] Renderizado com contatoId:', contatoId)

  // Função para buscar agendamentos (usando UUID como tags)
  const fetchAgendamentos = useCallback(async () => {
    if (!contatoId) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return
      
      console.log('📅 [AgendamentosIndicator] Buscando agendamentos para telefone:', contatoId)
      
      // 1. PRIMEIRO: Buscar o UUID do contato pelo telefone
      const contactResponse = await fetch(`/api/contatos?telefone=${contatoId}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      if (!contactResponse.ok) {
        console.log('📅 [AgendamentosIndicator] Erro ao buscar contato:', contactResponse.status)
        setAgendamentos([])
        return
      }
      
      const contactData = await contactResponse.json()
      let contatoUUID = null
      
      if (Array.isArray(contactData) && contactData.length > 0) {
        const specificContact = contactData.find(contact => contact.numeroTelefone === contatoId)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('📅 [AgendamentosIndicator] UUID do contato encontrado:', contatoUUID)
        }
      } else if (contactData && contactData.data && Array.isArray(contactData.data)) {
        const specificContact = contactData.data.find(contact => contact.numeroTelefone === contatoId)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('📅 [AgendamentosIndicator] UUID do contato encontrado:', contatoUUID)
        }
      }
      
      if (!contatoUUID) {
        console.log('📅 [AgendamentosIndicator] UUID do contato não encontrado')
        setAgendamentos([])
        return
      }
      
      // 2. SEGUNDO: Buscar agendamentos usando o UUID do contato
      console.log('📅 [AgendamentosIndicator] Buscando agendamentos com UUID:', contatoUUID)
      
      const response = await fetch(`/api/agendamentos?contato_id=${contatoUUID}`, {
        headers: { 
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      console.log('📅 [AgendamentosIndicator] Status da resposta:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        const agendamentosData = data.data || data || []
        console.log('📅 [AgendamentosIndicator] Agendamentos encontrados:', agendamentosData)
        setAgendamentos(Array.isArray(agendamentosData) ? agendamentosData : [])
      } else {
        console.log('📅 [AgendamentosIndicator] Nenhum agendamento encontrado para UUID:', contatoUUID)
        setAgendamentos([])
      }
    } catch (error) {
      console.error('❌ [AgendamentosIndicator] Erro ao buscar agendamentos:', error)
      setAgendamentos([])
    } finally {
      setLoading(false)
    }
  }, [contatoId])

  // Carregar agendamentos quando contatoId mudar
  useEffect(() => {
    fetchAgendamentos()
  }, [fetchAgendamentos])

  // Escutar evento de agendamento criado para atualizar automaticamente
  useEffect(() => {
    const handleAgendamentoCreated = (event: any) => {
      const { contatoId: eventContatoId } = event.detail
      console.log('📅 [AgendamentosIndicator] Evento agendamentoCreated recebido:', event.detail)
      
      if (eventContatoId === contatoId) {
        console.log('📅 [AgendamentosIndicator] Recarregando agendamentos após criação...')
        fetchAgendamentos()
      }
    }

    window.addEventListener('agendamentoCreated', handleAgendamentoCreated)
    
    return () => {
      window.removeEventListener('agendamentoCreated', handleAgendamentoCreated)
    }
  }, [contatoId, fetchAgendamentos])

  if (!contatoId) return null

  const agendamentosCount = agendamentos.length
  
  // Criar tooltip com detalhes dos agendamentos
  const agendamentosTooltip = agendamentosCount > 0 
    ? `Agendamentos (${agendamentosCount}): ${agendamentos.map(ag => ag.titulo || ag.descricao || 'Sem título').join(', ')}`
    : `Nenhum agendamento (${agendamentosCount})`

  return (
    <button
      onClick={onClick}
      className="relative p-1 rounded-sm border transition-colors bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/30"
      title={agendamentosTooltip}
    >
      <Calendar className="w-4 h-4 text-blue-600" />
      
      {/* Badge com contador real */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center bg-blue-500">
        <span className="text-xs font-bold text-white">{agendamentosCount}</span>
      </div>
    </button>
  )
}
