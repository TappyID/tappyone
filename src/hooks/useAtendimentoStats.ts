import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export interface AtendimentoStats {
  chats_ativos: number
  atendentes_online: number
  mensagens_pendentes: number
  tempo_resposta_medio: number
}

export function useAtendimentoStats() {
  const { token } = useAuth()
  const [stats, setStats] = useState<AtendimentoStats>({
    chats_ativos: 0,
    atendentes_online: 0,
    mensagens_pendentes: 0,
    tempo_resposta_medio: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const baseURL = '/api/atendimentos'

  const fetchStats = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${baseURL}/stats`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas de atendimento:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token, baseURL])

  // Buscar estatísticas automaticamente
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Atualizar a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}
