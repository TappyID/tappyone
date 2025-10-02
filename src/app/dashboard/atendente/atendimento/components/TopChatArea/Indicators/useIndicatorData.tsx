'use client'

import { useState, useEffect, useCallback } from 'react'

// Hook único para todos os indicadores - usa mesma API do useKanbanIndicators
export function useIndicatorData(chatId: string | null | undefined, endpoint: string) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!chatId) return

    try {
      setLoading(true)
      let token = localStorage.getItem('token')

      if (!token) {
        token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZmI4ZGExZDctZDI4Zi00ZWY5LWI4YjAtZTAxZjc0NjZmNTc4IiwiZW1haWwiOiJyb2RyaWdvQGNybS50YXBweS5pZCIsInJvbGUiOiJBRE1JTiIsImlzcyI6InRhcHB5b25lLWNybSIsInN1YiI6ImZiOGRhMWQ3LWQyOGYtNGVmOS1iOGIwLWUwMWY3NDY2ZjU3OCIsImV4cCI6MTc1OTE2MzcwMSwibmJmIjoxNzU4NTU4OTAxLCJpYXQiOjE3NTg1NTg5MDF9.xY9ikMSOHMcatFdierE3-bTw-knQgSmqxASRSHUZqfw'
      }

      // Garantir chatId com @c.us
      const formattedChatId = chatId.includes('@c.us') ? chatId : `${chatId}@c.us`

      // Backend GO
      const baseUrl = 'http://159.65.34.199:8081'
      const response = await fetch(`${baseUrl}/api/chats/${encodeURIComponent(formattedChatId)}/${endpoint}`, {
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        const items = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : []
        setData(items)
      } else {
        setData([])
      }
    } catch {

      setData([])
    } finally {
      setLoading(false)
    }
  }, [chatId, endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, count: data.length, refetch: fetchData }
}
