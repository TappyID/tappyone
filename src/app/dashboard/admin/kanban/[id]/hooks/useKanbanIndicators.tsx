'use client'

import { useState, useEffect, useCallback } from 'react'

interface IndicatorCounts {
  orcamentos: number
  agendamentos: number
  anotacoes: number
  tickets: number
  tags: number
}

export function useKanbanIndicators(contatoId: string | null) {
  const [counts, setCounts] = useState<IndicatorCounts>({
    orcamentos: 0,
    agendamentos: 0,
    anotacoes: 0,
    tickets: 0,
    tags: 0
  })
  const [loading, setLoading] = useState(false)

  console.log('📊 [useKanbanIndicators] Hook chamado para contatoId:', contatoId)

  const fetchAllCounts = useCallback(async () => {
    if (!contatoId) {
      setCounts({
        orcamentos: 0,
        agendamentos: 0,
        anotacoes: 0,
        tickets: 0,
        tags: 0
      })
      return
    }
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return
      
      console.log('📊 [useKanbanIndicators] Buscando dados para telefone:', contatoId)
      
      // Limpar telefone para busca - remover @c.us se existir
      const cleanPhone = contatoId.replace('@c.us', '')
      console.log('📊 [useKanbanIndicators] Telefone limpo:', cleanPhone)
      
      // 1. PRIMEIRO: Buscar o UUID do contato pelo telefone
      const contactResponse = await fetch(`/api/contatos?telefone=${cleanPhone}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      if (!contactResponse.ok) {
        console.log('📊 [useKanbanIndicators] Erro ao buscar contato:', contactResponse.status)
        return
      }
      
      const contactData = await contactResponse.json()
      console.log('📊 [useKanbanIndicators] Resposta da API contatos:', contactData)
      let contatoUUID = null
      
      if (Array.isArray(contactData) && contactData.length > 0) {
        console.log('📊 [useKanbanIndicators] Buscando contato em array direto...')
        const specificContact = contactData.find(contact => contact.numeroTelefone === cleanPhone)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('📊 [useKanbanIndicators] UUID do contato encontrado:', contatoUUID)
        }
      } else if (contactData && contactData.data && Array.isArray(contactData.data)) {
        console.log('📊 [useKanbanIndicators] Buscando contato em contactData.data...')
        const specificContact = contactData.data.find(contact => contact.numeroTelefone === cleanPhone)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('📊 [useKanbanIndicators] UUID do contato encontrado:', contatoUUID)
        }
      }
      
      if (!contatoUUID) {
        console.log('📊 [useKanbanIndicators] UUID do contato não encontrado')
        return
      }
      
      // 2. SEGUNDO: Buscar todos os dados em paralelo
      const promises = [
        // Orçamentos
        fetch(`/api/orcamentos?contato_id=${contatoUUID}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : { data: [] }),
        
        // Agendamentos  
        fetch(`/api/agendamentos?contato_id=${contatoUUID}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : { data: [] }),
        
        // Anotações
        fetch(`/api/anotacoes?contato_id=${contatoUUID}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : { data: [] }),
        
        // Tickets  
        fetch(`/api/tickets?contato_id=${contatoUUID}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : { data: [] }),
        
        // Tags
        fetch(`/api/tags?contato_id=${contatoUUID}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : { data: [] })
      ]
      
      const [
        orcamentosData,
        agendamentosData, 
        anotacoesData,
        ticketsData,
        tagsData
      ] = await Promise.all(promises)
      
      const newCounts = {
        orcamentos: Array.isArray(orcamentosData?.data) ? orcamentosData.data.length : 
                   Array.isArray(orcamentosData) ? orcamentosData.length : 0,
        agendamentos: Array.isArray(agendamentosData?.data) ? agendamentosData.data.length :
                     Array.isArray(agendamentosData) ? agendamentosData.length : 0,
        anotacoes: Array.isArray(anotacoesData?.data) ? anotacoesData.data.length :
                  Array.isArray(anotacoesData) ? anotacoesData.length : 0,
        tickets: Array.isArray(ticketsData?.data) ? ticketsData.data.length :
                Array.isArray(ticketsData) ? ticketsData.length : 0,
        tags: Array.isArray(tagsData?.data) ? tagsData.data.length :
             Array.isArray(tagsData) ? tagsData.length : 0
      }
      
      console.log('📊 [useKanbanIndicators] Contadores atualizados:', newCounts)
      setCounts(newCounts)
      
    } catch (error) {
      console.error('❌ [useKanbanIndicators] Erro ao buscar contadores:', error)
    } finally {
      setLoading(false)
    }
  }, [contatoId])

  // Carregar contadores quando contatoId mudar
  useEffect(() => {
    fetchAllCounts()
  }, [fetchAllCounts])

  // Escutar eventos de criação para atualizar automaticamente
  useEffect(() => {
    const handleCreated = (event: any) => {
      const { contatoId: eventContatoId } = event.detail
      
      if (eventContatoId === contatoId) {
        console.log('📊 [useKanbanIndicators] Evento recebido, recarregando contadores...')
        fetchAllCounts()
      }
    }

    // Registrar todos os eventos
    const eventos = [
      'orcamentoCreated',
      'agendamentoCreated', 
      'anotacaoCreated',
      'ticketCreated',
      'tagCreated'
    ]
    
    eventos.forEach(evento => {
      window.addEventListener(evento, handleCreated)
    })
    
    return () => {
      eventos.forEach(evento => {
        window.removeEventListener(evento, handleCreated)
      })
    }
  }, [contatoId, fetchAllCounts])

  return {
    counts,
    loading,
    refresh: fetchAllCounts
  }
}
