import { useState, useEffect } from 'react'

export interface ConexaoFilaData {
  conexaoId: string
  sessionName: string
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
  filaId: string | null
  filaNome: string | null
  filaCor: string | null
  atendentes: Array<{
    id: string
    nome: string
    email: string
  }>
  hasConnection: boolean
}

interface UseConexaoFilaProps {
  contatoId: string // número do WhatsApp (ex: "5519999999999")
  enabled?: boolean
}

export function useConexaoFila({ contatoId, enabled = true }: UseConexaoFilaProps) {
  const [data, setData] = useState<ConexaoFilaData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConexaoFila = async () => {
    if (!contatoId || !enabled) return

    setLoading(true)
    setError(null)

    try {
      // Buscar conexão/fila por contato
      const response = await fetch(`/api/conexoes/contato/${contatoId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // Contato não tem conexão/fila associada
          setData({
            conexaoId: '',
            sessionName: '',
            status: 'disconnected',
            filaId: null,
            filaNome: null,
            filaCor: null,
            atendentes: [],
            hasConnection: false
          })
          return
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      setData({
        conexaoId: result.conexao?.id || '',
        sessionName: result.conexao?.session_name || '',
        status: result.conexao?.status || 'disconnected',
        filaId: result.fila?.id || null,
        filaNome: result.fila?.nome || null,
        filaCor: result.fila?.cor || null,
        atendentes: result.atendentes || [],
        hasConnection: !!result.conexao
      })

    } catch (err) {
      console.error('❌ [useConexaoFila] Erro ao buscar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchConexaoFila()
  }

  useEffect(() => {
    fetchConexaoFila()
  }, [contatoId, enabled])

  return {
    data,
    loading,
    error,
    refetch,
    hasConnection: data?.hasConnection || false,
    isConnected: data?.status === 'connected',
    fila: data ? {
      id: data.filaId,
      nome: data.filaNome,
      cor: data.filaCor
    } : null,
    atendentes: data?.atendentes || [],
    conexao: data ? {
      id: data.conexaoId,
      sessionName: data.sessionName,
      status: data.status
    } : null
  }
}
