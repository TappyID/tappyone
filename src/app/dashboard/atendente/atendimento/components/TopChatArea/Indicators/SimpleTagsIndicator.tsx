'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Tag } from 'lucide-react'

interface SimpleTagsIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function SimpleTagsIndicator({ contatoId, onClick }: SimpleTagsIndicatorProps) {
  const [contatoTags, setContatoTags] = useState<any[]>([])
  const [tagsLoading, setTagsLoading] = useState(false)

  console.log('🏷️ [SimpleTagsIndicator] Renderizado com contatoId:', contatoId)

  // Função para buscar tags (usando UUID como TagsBottomSheet)
  const fetchContatoTags = useCallback(async () => {
    if (!contatoId) return
    
    try {
      setTagsLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return
      
      console.log('🏷️ [SimpleTagsIndicator] Buscando tags para telefone:', contatoId)
      
      // 1. PRIMEIRO: Buscar o UUID do contato pelo telefone (igual ao TagsBottomSheet)
      const contactResponse = await fetch(`/api/contatos?telefone=${contatoId}`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      if (!contactResponse.ok) {
        console.log('🏷️ [SimpleTagsIndicator] Erro ao buscar contato:', contactResponse.status)
        setContatoTags([])
        return
      }
      
      const contactData = await contactResponse.json()
      let contatoUUID = null
      
      if (Array.isArray(contactData) && contactData.length > 0) {
        const specificContact = contactData.find(contact => contact.numeroTelefone === contatoId)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('🏷️ [SimpleTagsIndicator] UUID do contato encontrado:', contatoUUID)
        }
      } else if (contactData && contactData.data && Array.isArray(contactData.data)) {
        const specificContact = contactData.data.find(contact => contact.numeroTelefone === contatoId)
        if (specificContact) {
          contatoUUID = specificContact.id
          console.log('🏷️ [SimpleTagsIndicator] UUID do contato encontrado:', contatoUUID)
        }
      }
      
      if (!contatoUUID) {
        console.log('🏷️ [SimpleTagsIndicator] UUID do contato não encontrado')
        setContatoTags([])
        return
      }
      
      // 2. SEGUNDO: Buscar tags usando o UUID do contato
      console.log('🏷️ [SimpleTagsIndicator] Buscando tags com UUID:', contatoUUID)
      
      const response = await fetch(`/api/contatos/${contatoUUID}/tags`, {
        headers: { 
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
        }
      })
      
      console.log('🏷️ [SimpleTagsIndicator] Status da resposta:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        const tags = data.data || data || []
        console.log('🏷️ [SimpleTagsIndicator] Tags encontradas:', tags)
        setContatoTags(Array.isArray(tags) ? tags : [])
      } else {
        // Se não encontrar, não é erro - apenas não tem tags ainda
        console.log('🏷️ [SimpleTagsIndicator] Nenhuma tag encontrada para UUID:', contatoUUID)
        setContatoTags([])
      }
    } catch (error) {
      console.error('❌ [SimpleTagsIndicator] Erro ao buscar tags:', error)
      setContatoTags([])
    } finally {
      setTagsLoading(false)
    }
  }, [contatoId])

  // Carregar tags quando contatoId mudar
  useEffect(() => {
    fetchContatoTags()
  }, [fetchContatoTags])

  // Escutar evento de tag criada para atualizar automaticamente
  useEffect(() => {
    const handleTagCreated = (event: any) => {
      const { contatoId: eventContatoId } = event.detail
      console.log('🏷️ [SimpleTagsIndicator] Evento tagCreated recebido:', event.detail)
      
      // Se o evento é para este contato, recarregar as tags
      if (eventContatoId === contatoId) {
        console.log('🏷️ [SimpleTagsIndicator] Recarregando tags após criação...')
        fetchContatoTags()
      }
    }

    window.addEventListener('tagCreated', handleTagCreated)
    
    return () => {
      window.removeEventListener('tagCreated', handleTagCreated)
    }
  }, [contatoId, fetchContatoTags])

  if (!contatoId) return null

  const tagsCount = contatoTags.length
  
  // Criar tooltip com nomes das tags
  const tagsTooltip = tagsCount > 0 
    ? `Tags (${tagsCount}): ${contatoTags.map(tag => tag.nome).join(', ')}`
    : `Nenhuma tag (${tagsCount})`

  return (
    <button
      onClick={onClick}
      className="relative p-1 rounded-sm border transition-colors bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/30"
      title={tagsTooltip}
    >
      <Tag className="w-4 h-4 text-emerald-600" />
      
      {/* Badge com contador real */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center bg-emerald-500">
        <span className="text-xs font-bold text-white">{tagsCount}</span>
      </div>
    </button>
  )
}
