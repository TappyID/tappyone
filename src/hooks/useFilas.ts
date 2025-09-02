import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface Fila {
  id: string
  nome: string
  cor?: string
  ativa: boolean
  criadoEm: string
}

export function useFilas() {
  const { token } = useAuth()
  const [filas, setFilas] = useState<Fila[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://api.tappy.id/api/filas' 
    : 'http://localhost:8080/api/filas'

  const fetchFilas = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(baseURL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar filas: ${response.statusText}`)
      }

      const data = await response.json()
      setFilas(data || [])
    } catch (err) {
      console.error('Erro ao buscar filas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      // Usar dados mock em caso de erro
      setFilas([
        { id: '1', nome: 'vendas', cor: '#3b82f6', ativa: true, criadoEm: new Date().toISOString() },
        { id: '2', nome: 'suporte', cor: '#10b981', ativa: true, criadoEm: new Date().toISOString() },
        { id: '3', nome: 'financeiro', cor: '#f59e0b', ativa: true, criadoEm: new Date().toISOString() },
        { id: '4', nome: 'marketing', cor: '#ef4444', ativa: true, criadoEm: new Date().toISOString() }
      ])
    } finally {
      setLoading(false)
    }
  }, [token, baseURL])

  useEffect(() => {
    fetchFilas()
  }, [fetchFilas])

  return { filas, loading, error, refresh: fetchFilas }
}
