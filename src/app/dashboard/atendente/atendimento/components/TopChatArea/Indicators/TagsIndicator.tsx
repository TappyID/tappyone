'use client'

import React, { useState, useEffect } from 'react'
import { Tag, Plus } from 'lucide-react'

interface TagsIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function TagsIndicator({ contatoId, onClick }: TagsIndicatorProps) {
  const [count, setCount] = useState(0)
  const [hasData, setHasData] = useState(false)
  const [loading, setLoading] = useState(false)
  
  console.log('🏷️ [TagsIndicator] Componente renderizado com contatoId:', contatoId)
  console.log('🏷️ [TagsIndicator] Estado atual - count:', count, 'hasData:', hasData, 'loading:', loading)

  // Buscar tags do contato
  useEffect(() => {
    console.log('🏷️ [TagsIndicator] useEffect disparado com contatoId:', contatoId)
    
    if (!contatoId) {
      console.log('🏷️ [TagsIndicator] ContatoId vazio, resetando estado')
      setCount(0)
      setHasData(false)
      return
    }

    const fetchTags = async () => {
      setLoading(true)
      console.log('🔍 [TagsIndicator] Buscando tags para contato:', contatoId)
      
      try {
        const response = await fetch(`/api/contatos/${contatoId}/tags`, {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
          }
        })
        console.log('🔍 [TagsIndicator] Status da resposta:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('🔍 [TagsIndicator] Tags encontradas:', result)
          
          // A API retorna {data: Array, success: true}
          const tags = result.data || result || []
          console.log('🔍 [TagsIndicator] Array de tags extraído:', tags)
          console.log('🔍 [TagsIndicator] Quantidade de tags:', tags.length)
          
          setCount(tags.length)
          setHasData(tags.length > 0)
          
          console.log('🔍 [TagsIndicator] Estado atualizado - count:', tags.length, 'hasData:', tags.length > 0)
        } else {
          const errorText = await response.text()
          console.error('❌ [TagsIndicator] Erro na resposta:', response.status, errorText)
          setCount(0)
          setHasData(false)
        }
      } catch (error) {
        console.error('❌ [TagsIndicator] Erro ao buscar tags:', error)
        setCount(0)
        setHasData(false)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [contatoId])

  // Escutar evento de tag criada para atualizar automaticamente
  useEffect(() => {
    const handleTagCreated = (event: CustomEvent) => {
      const { contatoId: eventContatoId } = event.detail
      console.log('🔄 [TagsIndicator] Evento tagCreated recebido para contato:', eventContatoId)
      
      // Se a tag foi criada para este contato, atualizar
      if (eventContatoId === contatoId) {
        console.log('🔄 [TagsIndicator] Atualizando tags após criação')
        // Refetch tags
        if (contatoId) {
          const fetchTags = async () => {
            try {
              const response = await fetch(`/api/contatos/${contatoId}/tags`, {
                headers: {
                  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
                }
              })
              if (response.ok) {
                const result = await response.json()
                const tags = result.data || result || []
                console.log('🔄 [TagsIndicator] Tags atualizadas:', tags)
                setCount(tags.length)
                setHasData(tags.length > 0)
              }
            } catch (error) {
              console.error('❌ [TagsIndicator] Erro ao atualizar tags:', error)
            }
          }
          fetchTags()
        }
      }
    }

    window.addEventListener('tagCreated', handleTagCreated as EventListener)
    return () => window.removeEventListener('tagCreated', handleTagCreated as EventListener)
  }, [contatoId])

  if (!contatoId) return null

  return (
    <button
      onClick={onClick}
      className={`relative p-1 rounded-sm border transition-colors ${
        hasData 
          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/30' 
          : 'bg-red-500/20 hover:bg-red-500/30 border-red-400/30'
      }`}
      title={hasData ? `${count} Tag${count > 1 ? 's' : ''}` : 'Nenhuma tag - Clique para criar'}
    >
      {hasData ? (
        <Tag className="w-4 h-4 text-emerald-600" />
      ) : (
        <Plus className="w-4 h-4 text-red-600" />
      )}
      
      {/* Badge com contador ou indicador */}
      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center ${
        hasData ? 'bg-emerald-500' : 'bg-red-500'
      }`}>
        {hasData ? (
          <span className="text-xs font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        ) : (
          <Plus className="w-2 h-2 text-white" />
        )}
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-gray-500/20 rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </button>
  )
}
