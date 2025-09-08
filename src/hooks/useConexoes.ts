import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ConnectionModulation {
  selectedChats: string[]
  selectedContacts: string[]
  selectedGroups: string[]
  selectedFilas: string[]
}

interface Conexao {
  id: string
  platform: string
  status: string
  session_name?: string
  modulation: ConnectionModulation
  connected_at?: string
  created_at: string
  updated_at: string
}

export function useConexoes() {
  console.log('🔗 [useConexoes] Hook inicializado')
  
  const { token } = useAuth()
  const [conexoes, setConexoes] = useState<Conexao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  console.log('🔗 [useConexoes] Token do useAuth:', token ? 'Presente' : 'Ausente')

  // Usar sempre as rotas proxy do Next.js para evitar CORS
  const baseURL = '/api/connections'

  const fetchConexoes = useCallback(async () => {
    if (!token) {
      console.log('❌ [useConexoes] Token não encontrado')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log(`🔗 [useConexoes] Buscando conexões ativas...`)
      console.log(`🔗 [useConexoes] URL: ${baseURL}`)
      console.log(`🔗 [useConexoes] Token: ${token ? 'Presente' : 'Ausente'}`)
      
      const response = await fetch(baseURL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log(`🔗 [useConexoes] Response status: ${response.status}`)
      console.log(`🔗 [useConexoes] Response ok: ${response.ok}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`🔗 [useConexoes] Error response: ${errorText}`)
        throw new Error(`Erro ao buscar conexões: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log(`🔗 [useConexoes] Response completa:`, result)
      
      const data = result.success ? result.data : result
      console.log(`🔗 [useConexoes] Data extraída:`, data)
      
      const conexoesAtivas = Array.isArray(data) ? data.filter(c => c.status === 'connected') : []
      console.log(`🔗 [useConexoes] Conexões ativas filtradas:`, conexoesAtivas)
      
      setConexoes(conexoesAtivas)
    } catch (err) {
      console.error('❌ [useConexoes] Erro ao buscar conexões:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setConexoes([])
    } finally {
      setLoading(false)
    }
  }, [token, baseURL])

  // Buscar filas de uma conexão específica
  const getFilasDaConexao = useCallback((conexaoId: string): string[] => {
    const conexao = conexoes.find(c => c.id === conexaoId)
    if (!conexao || !conexao.modulation) {
      return []
    }
    return conexao.modulation.selectedFilas || []
  }, [conexoes])

  useEffect(() => {
    console.log('🔗 [useConexoes] useEffect executando...')
    fetchConexoes()
  }, [fetchConexoes])

  return { 
    conexoes: conexoes.sort((a, b) => a.session_name?.localeCompare(b.session_name || '') || 0), 
    loading, 
    error, 
    refresh: fetchConexoes,
    getFilasDaConexao
  }
}
