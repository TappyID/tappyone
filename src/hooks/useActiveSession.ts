import { useState, useEffect } from 'react'

/**
 * Hook para buscar a sessão ativa do usuário
 * Retorna a primeira conexão WORKING encontrada
 */
export function useActiveSession() {
  const [sessionName, setSessionName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchActiveSession() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token não encontrado')
        }

        const response = await fetch('/api/connections', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`Erro ao buscar conexões: ${response.status}`)
        }

        const data = await response.json()
        const connections = data.connections || []

        // Buscar primeira conexão WORKING
        const activeConnection = connections.find((conn: any) => 
          conn.status === 'WORKING' || conn.status === 'connected'
        )

        if (activeConnection) {
          console.log('✅ [useActiveSession] Sessão ativa encontrada:', activeConnection.sessionName)
          setSessionName(activeConnection.sessionName)
        } else {
          console.warn('⚠️ [useActiveSession] Nenhuma sessão ativa encontrada')
          setSessionName(null)
        }
      } catch (err) {
        console.error('❌ [useActiveSession] Erro:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchActiveSession()
  }, [])

  return { sessionName, loading, error }
}
