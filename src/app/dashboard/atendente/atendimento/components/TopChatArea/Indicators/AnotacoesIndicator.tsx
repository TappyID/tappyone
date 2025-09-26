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

  // NOVA FUNÇÃO: Buscar anotações direto por chatId (igual aos BottomSheets)
  const fetchAnotacoes = useCallback(async () => {
    if (!contatoId) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) return
      
      console.log('📝 [AnotacoesIndicator] Buscando anotações para chatId:', contatoId)
      
      // Garantir que o chatId tem @c.us
      const chatId = contatoId.includes('@c.us') ? contatoId : `${contatoId}@c.us`
      
      // Buscar diretamente via endpoint de chat (igual BottomSheet)
      const response = await fetch(`/api/chats/${encodeURIComponent(chatId)}/anotacoes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        console.log('📝 [AnotacoesIndicator] Erro ao buscar anotações:', response.status)
        setAnotacoes([])
        return
      }
      
      const anotacoesData = await response.json()
      console.log('📝 [AnotacoesIndicator] Dados recebidos:', anotacoesData)
      
      // Processar dados do endpoint direto (igual BottomSheet)
      const anotacoesArray = Array.isArray(anotacoesData) ? anotacoesData : 
                           Array.isArray(anotacoesData?.data) ? anotacoesData.data : []
      
      console.log('📝 [AnotacoesIndicator] Total anotações encontradas:', anotacoesArray.length)
      setAnotacoes(anotacoesArray)
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
      const { chatId: eventChatId } = event.detail
      const currentChatId = contatoId?.includes('@c.us') ? contatoId : `${contatoId}@c.us`
      console.log('📝 [AnotacoesIndicator] Evento anotacaoCreated recebido:', event.detail)
      
      if (eventChatId === currentChatId) {
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
