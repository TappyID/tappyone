'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock } from 'lucide-react'

interface AgendamentosSidebarProps {
  isOpen: boolean
  onClose: () => void
  contatoId?: string
}

export default function AgendamentosSidebar({ isOpen, onClose, contatoId }: AgendamentosSidebarProps) {
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && contatoId) {
      fetchAgendamentos()
    }
  }, [isOpen, contatoId])

  const fetchAgendamentos = async () => {
    setLoading(true)
    console.log('📅 [AgendamentosSidebar] Buscando agendamentos do contato:', contatoId)
    try {
      const token = localStorage.getItem('token')
      
      // 1. PRIMEIRO: Buscar o UUID do contato pelo telefone
      const contactResponse = await fetch(`http://159.65.34.199:8081/api/contatos?telefone=${contatoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!contactResponse.ok) {
        console.log('📅 [AgendamentosSidebar] Erro ao buscar contato:', contactResponse.status)
        setAgendamentos([])
        return
      }
      
      const contactData = await contactResponse.json()
      let contatoUUID = null
      
      if (Array.isArray(contactData) && contactData.length > 0) {
        const specificContact = contactData.find(contact => contact.numeroTelefone === contatoId)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('📅 [AgendamentosSidebar] UUID do contato encontrado:', contatoUUID)
        }
      } else if (contactData && contactData.data && Array.isArray(contactData.data)) {
        const specificContact = contactData.data.find(contact => contact.numeroTelefone === contatoId)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('📅 [AgendamentosSidebar] UUID do contato encontrado:', contatoUUID)
        }
      }
      
      if (!contatoUUID) {
        console.log('📅 [AgendamentosSidebar] UUID do contato não encontrado')
        setAgendamentos([])
        return
      }
      
      // 2. AGORA: Buscar agendamentos usando o UUID
      const response = await fetch(`http://159.65.34.199:8081/api/agendamentos?contato_id=${contatoUUID}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('📅 [AgendamentosSidebar] Agendamentos recebidos:', result)
        
        // A API retorna {data: Array, success: true}
        const agendamentos = result.data || result || []
        setAgendamentos(Array.isArray(agendamentos) ? agendamentos : [])
        console.log('📅 [AgendamentosSidebar] Total de agendamentos:', agendamentos.length)
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-xl border-l">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Agendamentos</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : agendamentos.length > 0 ? (
            agendamentos.map((agendamento: any) => {
              const inicio = new Date(agendamento.inicioEm)
              const fim = new Date(agendamento.fimEm)
              const dia = inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              const horaInicio = inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              const horaFim = fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              
              return (
                <div key={agendamento.id} className="bg-gray-50 border rounded-lg p-3 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{agendamento.titulo}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {agendamento.status}
                    </span>
                  </div>
                  
                  {agendamento.descricao && (
                    <p className="text-sm text-gray-600 mb-3">{agendamento.descricao}</p>
                  )}
                  
                  {/* Badges de Data e Hora */}
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      <Calendar className="w-3 h-3" />
                      <span>{dia}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      <Clock className="w-3 h-3" />
                      <span>{horaInicio}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      <Clock className="w-3 h-3" />
                      <span>{horaFim}</span>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum agendamento encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
