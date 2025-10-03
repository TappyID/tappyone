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
        console.log('📱 [useChatsKanban] Todas as sessões:', sessions)
        sessions.forEach((s: any, i: number) => {
          console.log(`  [${i}] ${s.name} | status: ${s.status} | me: ${s.me?.id || 'N/A'}`)
        })
        
        // 🔥 BUSCAR CHATS DE TODAS AS SESSÕES WORKING
        const activeSessions = sessions.filter((s: any) => s.status === 'WORKING')

        if (activeSessions.length === 0) {
          throw new Error('Nenhuma sessão ativa encontrada')
        }

        console.log(`🔄 [useChatsKanban] ${activeSessions.length} sessões ativas encontradas`)

        // 2. Paginar TODAS as sessões
        let allChats: any[] = []
        
        for (const session of activeSessions) {
          console.log(`\n📞 [useChatsKanban] Buscando chats de: ${session.name} (${session.me?.id})`)
          
          let offset = 0
          const limit = 100
          let sessionChats = 0

          while (true) {
            const url = `${baseUrl}/api/${session.name}/chats/overview?limit=${limit}&offset=${offset}`
            
            const response = await fetch(url, {
              headers: { 'X-Api-Key': 'tappyone-waha-2024-secretkey' }
            })

            if (!response.ok) {
              console.error(`❌ [useChatsKanban] Erro HTTP ${response.status} em ${session.name} offset=${offset}`)
              break
            }

            const data = await response.json()
            const newChats = (data.chats || data || []).map((chat: any) => ({
              ...chat,
              sessionName: session.name
            }))

            sessionChats += newChats.length
            console.log(`   📥 offset=${offset}: +${newChats.length} chats`)

            if (newChats.length === 0) break

            allChats = [...allChats, ...newChats]

            // Para quando retornar menos que o limite
            if (newChats.length < limit) {
              console.log(`   ✅ ${session.name}: ${sessionChats} chats (última página)`)
              break
            }
            
            if (allChats.length >= 5000) {
              console.warn('⚠️ [useChatsKanban] Limite de segurança: 5000 chats')
              break
            }

            offset += limit
          }
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
