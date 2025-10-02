'use client'

import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Plus } from 'lucide-react'

interface KanbanIndicatorProps {
  contatoId?: string | null // telefone (5518996064455)
  onClick: () => void
}

export default function KanbanIndicator({ contatoId, onClick }: KanbanIndicatorProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [columnName, setColumnName] = useState<string | null>(null)
  const [hasData, setHasData] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isContact, setIsContact] = useState(false)

  // Função para buscar informações do quadro e coluna (copiada do ChatArea)
  const getKanbanInfo = async (chatId: string) => {
    try {
      const token = localStorage.getItem('token')

      // Buscar todos os quadros do usuário
      const quadrosResponse = await fetch(`/api/kanban/quadros`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!quadrosResponse.ok) {
        return { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
      }

      const quadros = await quadrosResponse.json()

      // Para cada quadro, buscar os metadados para encontrar o chat
      for (const quadro of quadros) {
        try {
          const metadataResponse = await fetch(`/api/kanban/${quadro.id}/metadata`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (metadataResponse.ok) {
            const metadata = await metadataResponse.json()
            const cardMetadata = metadata.cards || {}

            // Verificar se o chat está neste quadro
            if (cardMetadata[chatId]) {
              const cardInfo = cardMetadata[chatId]

              // Buscar informações completas do quadro (incluindo colunas)
              const quadroResponse = await fetch(`/api/kanban/quadros/${quadro.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })

              if (quadroResponse.ok) {
                const quadroCompleto = await quadroResponse.json()
                const coluna = quadroCompleto.colunas?.find((col: any) => col.id === cardInfo.colunaId)

                return {
                  quadro: quadro.nome,
                  coluna: coluna?.nome || 'Coluna desconhecida',
                  color: coluna?.cor || '#d1d5db' // Usar a cor exata da coluna
                }
              }
            }
          }
        } catch {
          // Continua para o próximo quadro
        }
      }

      return { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
    } catch {

      return { quadro: 'Sem quadro', coluna: 'Sem coluna', color: '#d1d5db' }
    }
  }

  // Buscar status do kanban do contato
  useEffect(() => {
    if (!contatoId) {
      setStatus(null)
      setHasData(false)
      return
    }

    const fetchKanbanStatus = async () => {
      setLoading(true)

      try {
        // 1. Primeiro verificar se é um contato válido

        const contactResponse = await fetch(`/api/contatos?telefone=${contatoId}`, {
          headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
          }
        })

        let contactExists = false
        let contactId = null

        if (contactResponse.ok) {
          const contactData = await contactResponse.json()
          if (Array.isArray(contactData) && contactData.length > 0) {
            const specificContact = contactData.find(contact => contact.numeroTelefone === contatoId)
            if (specificContact) {
              contactExists = true
              contactId = specificContact.id

            }
          }
        }

        setIsContact(contactExists)

        // 2. Se não é contato, não buscar no kanban
        if (!contactExists) {

          setStatus(null)
          setColumnName(null)
          setHasData(false)
          setLoading(false)
          return
        }

        // 3. Se é contato, buscar no kanban usando a lógica real do ChatArea

        const kanbanInfo = await getKanbanInfo(contatoId + '@c.us') // Usar formato completo do chatId

        if (kanbanInfo && kanbanInfo.quadro !== 'Sem quadro') {
          // Encontrou no kanban real
          setStatus(kanbanInfo.coluna)
          setColumnName(kanbanInfo.coluna)
          setHasData(true)

          setLoading(false)
          return
        } else {
          // Não encontrou no kanban, mas é contato válido
          setStatus('Novo')
          setColumnName('Novo')
          setHasData(true)

          setLoading(false)
          return
        }

      } catch {

        setStatus(null)
        setColumnName(null)
        setHasData(false)
      } finally {
        setLoading(false)
      }
    }

    fetchKanbanStatus()
  }, [contatoId])

  // Escutar mudanças do kanban
  useEffect(() => {
    const handleKanbanUpdate = (event: any) => {

      if (event.detail.contatoId === contatoId) {
        // Recarregar dados
        const fetchKanbanStatus = async () => {
          // Código simplificado - apenas atualiza o status
          setStatus('Atualizando...')
          setTimeout(() => {
            setStatus('Atualizado')
          }, 1000)
        }
        fetchKanbanStatus()
      }
    }

    window.addEventListener('kanbanUpdated', handleKanbanUpdate)
    return () => {
      window.removeEventListener('kanbanUpdated', handleKanbanUpdate)
    }
  }, [contatoId])

  const getStatusColor = () => {
    if (!status) return 'bg-red-500'

    switch (status.toLowerCase()) {
      case 'pendente': return 'bg-yellow-500'
      case 'em andamento': return 'bg-blue-500'
      case 'finalizado': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (!contatoId) return null

  return (
    <button
      onClick={onClick}
      className={`relative p-1 rounded-sm border transition-colors ${
        hasData
          ? `${getStatusColor()}/20 hover:${getStatusColor()}/30 border-current/30`
          : 'bg-red-500/20 hover:bg-red-500/30 border-red-400/30'
      }`}
      title={hasData ? `Kanban: ${columnName || status}` : 'Não está no kanban - Clique para adicionar'}
    >
      {hasData ? (
        <LayoutDashboard className={`w-4 h-4 ${getStatusColor().replace('bg-', 'text-')}`} />
      ) : (
        <Plus className="w-4 h-4 text-red-600" />
      )}

      {/* Badge com nome da coluna ou indicador */}
      {hasData && columnName ? (
        <div className={`absolute -top-2 -right-2 px-1 py-0.5 rounded text-xs font-bold text-white ${getStatusColor()} border border-white`}>
          {columnName.slice(0, 3).toUpperCase()}
        </div>
      ) : (
        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center ${
          hasData ? getStatusColor() : 'bg-red-500'
        }`}>
          {hasData ? (
            <div className="w-2 h-2 bg-white rounded-full"></div>
          ) : (
            <Plus className="w-2 h-2 text-white" />
          )}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-gray-500/20 rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </button>
  )
}
