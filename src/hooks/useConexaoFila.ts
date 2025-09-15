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
  chatId?: string   // chat ID completo (ex: "5519999999999@c.us") 
  enabled?: boolean
}

export function useConexaoFila({ contatoId, chatId, enabled = true }: UseConexaoFilaProps) {
  const [data, setData] = useState<ConexaoFilaData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConexaoFila = async () => {
    if ((!contatoId && !chatId) || !enabled) return

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      // 🎯 ESTRATÉGIA CORRIGIDA: Usar chatId completo como primária
      const searchId = chatId || `${contatoId}@c.us`
      
      console.log('🔍 [useConexaoFila] Buscando conexão para:', {
        chatId,
        contatoId,
        searchId,
        url: `/api/conexoes/contato/${searchId.replace('@c.us', '')}`
      })

      // Primeira tentativa: buscar por ID (ainda usa número limpo na URL)
      const response = await fetch(`/api/conexoes/contato/${searchId.replace('@c.us', '')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // 2. Fallback: buscar por chat ID completo se busca por contato falhou
          console.log(`🔍 Contato ${contatoId} não encontrado, tentando buscar por chat ID...`)
          
          const chatResponse = await fetch(`/api/conexoes/chat/${contatoId}@c.us`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          })
          
          if (chatResponse.ok) {
            const chatResult = await chatResponse.json()
            setData({
              conexaoId: chatResult.conexao?.id || '',
              sessionName: chatResult.conexao?.session_name || '',
              status: chatResult.conexao?.status || 'disconnected',
              filaId: chatResult.fila?.id || null,
              filaNome: chatResult.fila?.nome || null,
              filaCor: chatResult.fila?.cor || null,
              atendentes: chatResult.atendentes || [],
              hasConnection: !!chatResult.conexao
            })
            return
          }
          
          // 3. Último fallback: sem conexão
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
  }, [contatoId, chatId, enabled])

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
