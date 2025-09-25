'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { StickyNote } from 'lucide-react'

interface AnotacoesIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function AnotacoesIndicator({ contatoId, onClick }: AnotacoesIndicatorProps) {
  const [anotacoes, setAnotacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  console.log('📝 [AnotacoesIndicator] Renderizado com contatoId:', contatoId)

  // Função para buscar anotações (usando UUID como outros indicadores)
  const fetchAnotacoes = useCallback(async () => {
    if (!contatoId) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return
      
      console.log('📝 [AnotacoesIndicator] Buscando anotações para telefone:', contatoId)
      
      // 1. PRIMEIRO: Buscar o UUID do contato pelo telefone
      const contactResponse = await fetch(`/api/contatos?telefone=${contatoId}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      if (!contactResponse.ok) {
        console.log('📝 [AnotacoesIndicator] Erro ao buscar contato:', contactResponse.status)
        setAnotacoes([])
        return
      }
      
      const contactData = await contactResponse.json()
      let contatoUUID = null
      
      if (Array.isArray(contactData) && contactData.length > 0) {
        const specificContact = contactData.find(contact => contact.numeroTelefone === contatoId)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('📝 [AnotacoesIndicator] UUID do contato encontrado:', contatoUUID)
        }
      } else if (contactData && contactData.data && Array.isArray(contactData.data)) {
        const specificContact = contactData.data.find(contact => contact.numeroTelefone === contatoId)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('📝 [AnotacoesIndicator] UUID do contato encontrado:', contatoUUID)
        }
      }
      
      if (!contatoUUID) {
        console.log('📝 [AnotacoesIndicator] UUID do contato não encontrado')
        setAnotacoes([])
        return
      }
      
      // 2. SEGUNDO: Buscar anotações usando o UUID do contato
      console.log('📝 [AnotacoesIndicator] Buscando anotações com UUID:', contatoUUID)
      
      const response = await fetch(`/api/anotacoes?contato_id=${contatoUUID}`, {
        headers: { 
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      console.log('📝 [AnotacoesIndicator] Status da resposta:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        const anotacoesData = data.data || data || []
        console.log('📝 [AnotacoesIndicator] Anotações encontradas:', anotacoesData)
        setAnotacoes(Array.isArray(anotacoesData) ? anotacoesData : [])
      } else {
        console.log('📝 [AnotacoesIndicator] Nenhuma anotação encontrada para UUID:', contatoUUID)
        setAnotacoes([])
      }
    } catch (error) {
      console.error('❌ [AnotacoesIndicator] Erro ao buscar anotações:', error)
      setAnotacoes([])
    } finally {
      setLoading(false)
    }
  }, [contatoId])

  // Carregar anotações quando contatoId mudar
  useEffect(() => {
    fetchAnotacoes()
  }, [fetchAnotacoes])

  // Escutar evento de anotação criada para atualizar automaticamente
  useEffect(() => {
    const handleAnotacaoCreated = (event: any) => {
      const { contatoId: eventContatoId } = event.detail
      console.log('📝 [AnotacoesIndicator] Evento anotacaoCreated recebido:', event.detail)
      
      if (eventContatoId === contatoId) {
        console.log('📝 [AnotacoesIndicator] Recarregando anotações após criação...')
        fetchAnotacoes()
      }
    }

    window.addEventListener('anotacaoCreated', handleAnotacaoCreated)
    
    return () => {
      window.removeEventListener('anotacaoCreated', handleAnotacaoCreated)
    }
  }, [contatoId, fetchAnotacoes])

  if (!contatoId) return null

  const anotacoesCount = anotacoes.length
  
  // Criar tooltip com detalhes das anotações
  const anotacoesTooltip = anotacoesCount > 0 
    ? `Anotações (${anotacoesCount}): ${anotacoes.map(anotacao => anotacao.titulo || anotacao.conteudo || 'Sem título').slice(0, 3).join(', ')}${anotacoesCount > 3 ? '...' : ''}`
    : `Nenhuma anotação (${anotacoesCount})`

  return (
    <button
      onClick={onClick}
      className="relative p-1 rounded-sm border transition-colors bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-400/30"
      title={anotacoesTooltip}
    >
      <StickyNote className="w-4 h-4 text-yellow-600" />
      
      {/* Badge com contador real */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center bg-yellow-500">
        <span className="text-xs font-bold text-white">{anotacoesCount}</span>
      </div>
    </button>
  )
}
