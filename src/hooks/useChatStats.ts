import { useState, useEffect } from 'react'

interface ChatStats {
  aguardando: number
  atendimento: number
  finalizado: number
  total: number
}

export function useChatStats(filaId?: string, responsavelId?: string) {
  const [stats, setStats] = useState<ChatStats>({
    aguardando: 0,
    atendimento: 0,
    finalizado: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token não encontrado')
        }

        const params = new URLSearchParams()
        if (filaId) params.append('fila_id', filaId)
        if (responsavelId) params.append('responsavel_id', responsavelId)

        const response = await fetch(`/api/chats/stats?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (data.success && data.data) {
          setStats(data.data)
        }
      } catch (err) {
        console.error('❌ [useChatStats] Erro:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [filaId, responsavelId])

  return { stats, loading, error, refetch: () => {} }
}
