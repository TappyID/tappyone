'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { DollarSign } from 'lucide-react'

interface OrcamentosIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function OrcamentosIndicator({ contatoId, onClick }: OrcamentosIndicatorProps) {
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  console.log('💰 [OrcamentosIndicator] Renderizado com contatoId:', contatoId)

  // Função para buscar orçamentos (usando UUID como tags)
  const fetchOrcamentos = useCallback(async () => {
    if (!contatoId) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return
      
      console.log('💰 [OrcamentosIndicator] Buscando orçamentos para telefone:', contatoId)
      
      // 1. PRIMEIRO: Buscar o UUID do contato pelo telefone
      const contactResponse = await fetch(`/api/contatos?telefone=${contatoId}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      if (!contactResponse.ok) {
        console.log('💰 [OrcamentosIndicator] Erro ao buscar contato:', contactResponse.status)
        setOrcamentos([])
        return
      }
      
      const contactData = await contactResponse.json()
      let contatoUUID = null
      
      if (Array.isArray(contactData) && contactData.length > 0) {
        const specificContact = contactData.find(contact => contact.numeroTelefone === contatoId)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('💰 [OrcamentosIndicator] UUID do contato encontrado:', contatoUUID)
        }
      } else if (contactData && contactData.data && Array.isArray(contactData.data)) {
        const specificContact = contactData.data.find(contact => contact.numeroTelefone === contatoId)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('💰 [OrcamentosIndicator] UUID do contato encontrado:', contatoUUID)
        }
      }
      
      if (!contatoUUID) {
        console.log('💰 [OrcamentosIndicator] UUID do contato não encontrado')
        setOrcamentos([])
        return
      }
      
      // 2. SEGUNDO: Buscar orçamentos usando o UUID do contato
      console.log('💰 [OrcamentosIndicator] Buscando orçamentos com UUID:', contatoUUID)
      
      const response = await fetch(`/api/orcamentos?contato_id=${contatoUUID}`, {
        headers: { 
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      console.log('💰 [OrcamentosIndicator] Status da resposta:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        const orcamentosData = data.data || data || []
        console.log('💰 [OrcamentosIndicator] Orçamentos encontrados:', orcamentosData)
        setOrcamentos(Array.isArray(orcamentosData) ? orcamentosData : [])
      } else {
        console.log('💰 [OrcamentosIndicator] Nenhum orçamento encontrado para UUID:', contatoUUID)
        setOrcamentos([])
      }
    } catch (error) {
      console.error('❌ [OrcamentosIndicator] Erro ao buscar orçamentos:', error)
      setOrcamentos([])
    } finally {
      setLoading(false)
    }
  }, [contatoId])

  // Carregar orçamentos quando contatoId mudar
  useEffect(() => {
    fetchOrcamentos()
  }, [fetchOrcamentos])

  // Escutar evento de orçamento criado para atualizar automaticamente
  useEffect(() => {
    const handleOrcamentoCreated = (event: any) => {
      const { contatoId: eventContatoId } = event.detail
      console.log('💰 [OrcamentosIndicator] Evento orcamentoCreated recebido:', event.detail)
      
      if (eventContatoId === contatoId) {
        console.log('💰 [OrcamentosIndicator] Recarregando orçamentos após criação...')
        fetchOrcamentos()
      }
    }

    window.addEventListener('orcamentoCreated', handleOrcamentoCreated)
    
    return () => {
      window.removeEventListener('orcamentoCreated', handleOrcamentoCreated)
    }
  }, [contatoId, fetchOrcamentos])

  if (!contatoId) return null

  const orcamentosCount = orcamentos.length
  
  // Criar tooltip com detalhes dos orçamentos
  const orcamentosTooltip = orcamentosCount > 0 
    ? `Orçamentos (${orcamentosCount}): ${orcamentos.map(orc => orc.titulo || orc.descricao || 'Sem título').join(', ')}`
    : `Nenhum orçamento (${orcamentosCount})`

  return (
    <button
      onClick={onClick}
      className="relative p-1 rounded-sm border transition-colors bg-green-500/20 hover:bg-green-500/30 border-green-400/30"
      title={orcamentosTooltip}
    >
      <DollarSign className="w-4 h-4 text-green-600" />
      
      {/* Badge com contador real */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center bg-green-500">
        <span className="text-xs font-bold text-white">{orcamentosCount}</span>
      </div>
    </button>
  )
}
