import { useState, useEffect } from 'react'

/**
 * Hook especializado para Kanban - busca TODOS os chats com paginação
 * Não usar em outras telas para não impactar performance
 */
export function useChatsKanban() {
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (isMounted) return
    setIsMounted(true)

    const loadAllChats = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('Token não encontrado')
          setLoading(false)
          return
        }

        const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:'
        const baseUrl = isProduction ? '/api/waha-proxy' : 'http://159.65.34.199:3001'

        // 1. Buscar sessão ativa
        const sessionsResponse = await fetch(`${baseUrl}/api/sessions`, {
          headers: { 'X-Api-Key': 'tappyone-waha-2024-secretkey' }
        })

        if (!sessionsResponse.ok) {
          throw new Error('Erro ao buscar sessões')
        }

        const sessions = await sessionsResponse.json()
        const activeSession = sessions.find((s: any) => s.status === 'WORKING')

        if (!activeSession) {
          throw new Error('Nenhuma sessão ativa encontrada')
        }

        console.log('🔄 [useChatsKanban] Sessão ativa:', activeSession.name)

        // 2. Paginar até pegar TODOS os chats
        let allChats: any[] = []
        let offset = 0
        const limit = 100

        while (true) {
          const response = await fetch(
            `${baseUrl}/api/${activeSession.name}/chats/overview?limit=${limit}&offset=${offset}`,
            { headers: { 'X-Api-Key': 'tappyone-waha-2024-secretkey' } }
          )

          if (!response.ok) break

          const data = await response.json()
          const newChats = (data.chats || data || []).map((chat: any) => ({
            ...chat,
            sessionName: activeSession.name
          }))

          console.log(`📥 [useChatsKanban] offset=${offset}: ${newChats.length} chats`)

          if (newChats.length === 0) break

          allChats = [...allChats, ...newChats]

          // Para quando retornar menos que o limite ou atingir 2000 (segurança)
          if (newChats.length < limit || allChats.length >= 2000) {
            if (allChats.length >= 2000) {
              console.warn('⚠️ [useChatsKanban] Limite de segurança: 2000 chats')
            }
            break
          }

          offset += limit
        }

        console.log(`✅ [useChatsKanban] Total carregado: ${allChats.length} chats`)
        setChats(allChats)
        setLoading(false)
      } catch (err: any) {
        console.error('❌ [useChatsKanban] Erro:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    loadAllChats()
  }, [isMounted])

  return {
    chats,
    loading,
    error
  }
}
