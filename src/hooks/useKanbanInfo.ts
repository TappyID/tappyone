import { useState, useEffect } from 'react'

interface KanbanInfo {
  board: string | null
  boardId: string | null
  column: string | null
  columnId: string | null
  columnColor: string | null
}

export function useKanbanInfo(chatId: string | null) {
  const [kanbanInfo, setKanbanInfo] = useState<KanbanInfo>({
    board: null,
    boardId: null,
    column: null,
    columnId: null,
    columnColor: null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!chatId) {
      setKanbanInfo({
        board: null,
        boardId: null,
        column: null,
        columnId: null,
        columnColor: null
      })
      return
    }

    const fetchKanbanInfo = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        console.log('🔍 [useKanbanInfo] Buscando para chatId:', chatId)

        // Buscar status do Kanban pelo chatId
        const response = await fetch(`/api/chats/${chatId}/kanban-status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('📡 [useKanbanInfo] Response status:', response.status)

        if (!response.ok) {
          // Chat não está em nenhum Kanban
          console.log('❌ [useKanbanInfo] Chat não está no Kanban')
          setKanbanInfo({
            board: null,
            boardId: null,
            column: null,
            columnId: null,
            columnColor: null
          })
          return
        }

        const data = await response.json()
        console.log('✅ [useKanbanInfo] Dados recebidos:', data)
        
        setKanbanInfo({
          board: data.quadro || null,
          boardId: data.quadroId || null,
          column: data.coluna || null,
          columnId: data.id || null,
          columnColor: data.cor || null
        })
      } catch (error) {
        console.error('💥 [useKanbanInfo] Erro ao buscar info do Kanban:', error)
        setKanbanInfo({
          board: null,
          boardId: null,
          column: null,
          columnId: null,
          columnColor: null
        })
      } finally {
        setLoading(false)
      }
    }

    fetchKanbanInfo()
  }, [chatId])

  return { kanbanInfo, loading }
}
