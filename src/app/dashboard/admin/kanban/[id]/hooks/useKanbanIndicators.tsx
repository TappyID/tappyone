'use client'

import { useState, useEffect, useCallback } from 'react'

interface IndicatorCounts {
  orcamentos: number
  agendamentos: number
  anotacoes: number
  tickets: number
  tags: number
  tagNames?: string[]
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
      let token = localStorage.getItem('token')
      
      if (!token) {
        token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
      }
      
      const chatId = contatoId.includes('@c.us') ? contatoId : `${contatoId}@c.us`
      
      // ✅ USAR ROTAS PROXY PARA FUNCIONAR EM PRODUÇÃO
      const promises = [
        fetch(`/api/chats/${encodeURIComponent(chatId)}/orcamentos`, {
          headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : []),
        
        fetch(`/api/chats/${encodeURIComponent(chatId)}/agendamentos`, {
          headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : []),
        
        fetch(`/api/chats/${encodeURIComponent(chatId)}/anotacoes`, {
          headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : []).catch(() => []),
        
        fetch(`/api/chats/${encodeURIComponent(chatId)}/tickets`, {
          headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : []),
        
        fetch(`/api/chats/${encodeURIComponent(chatId)}/tags`, {
          headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
        }).then(res => res.ok ? res.json() : [])
      ]
      
      const [
        orcamentosData,
        agendamentosData, 
        anotacoesData,
        ticketsData,
        tagsData
      ] = await Promise.all(promises)

      const tagsList = Array.isArray(tagsData) ? tagsData : 
                      Array.isArray(tagsData?.data) ? tagsData.data : []
      const tagNames = tagsList.map((tag: any) => tag.nome || tag.name || 'Tag')
      
      const newCounts = {
        orcamentos: Array.isArray(orcamentosData) ? orcamentosData.length : 
                   Array.isArray(orcamentosData?.data) ? orcamentosData.data.length : 0,
        agendamentos: Array.isArray(agendamentosData) ? agendamentosData.length :
                     Array.isArray(agendamentosData?.data) ? agendamentosData.data.length : 0,
        anotacoes: Array.isArray(anotacoesData) ? anotacoesData.length :
                  Array.isArray(anotacoesData?.data) ? anotacoesData.data.length : 0,
        tickets: Array.isArray(ticketsData) ? ticketsData.length :
                Array.isArray(ticketsData?.data) ? ticketsData.data.length : 0,
        tags: Array.isArray(tagsData) ? tagsData.length :
             Array.isArray(tagsData?.data) ? tagsData.data.length : 0,
        tagNames: tagNames
      }
      
      setCounts(newCounts)
      
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }, [contatoId])

  useEffect(() => {
    fetchAllCounts()
  }, [fetchAllCounts])

  // Escutar eventos de criação para atualizar automaticamente
  useEffect(() => {
    const handleCreated = (event: any) => {
      // Os BottomSheets enviam chatId (com @c.us), não contatoId
      const { chatId: eventChatId, contatoId: eventContatoId } = event.detail
      
      // Converter contatoId para chatId para comparação
      const currentChatId = contatoId?.includes('@c.us') ? contatoId : `${contatoId}@c.us`
      
      // Verificar se o evento é para este card (comparar ambos formatos)
      if (eventChatId === currentChatId || eventContatoId === contatoId) {
        console.log('📊 [useKanbanIndicators] Evento recebido, recarregando contadores...')
        console.log('  📨 Event chatId:', eventChatId)
        console.log('  📱 Current chatId:', currentChatId)
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
