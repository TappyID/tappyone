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

        // Buscar status do Kanban pelo chatId
        const response = await fetch(`/api/chats/${chatId}/kanban-status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          // Chat não está em nenhum Kanban
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
        
        setKanbanInfo({
          board: data.quadro || null,
          boardId: data.quadroId || null,
          column: data.coluna || null,
          columnId: data.id || null,
          columnColor: data.cor || null
        })
      } catch (error) {
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
