import { useState, useEffect } from 'react'

interface ChatLeadStatus {
  status: string
  responsavel: string
  fila_id: string
  hasActiveAgent?: boolean
}

export function useChatLeadBatch(chatIds: string[]) {
  const [chatLeads, setChatLeads] = useState<Record<string, ChatLeadStatus | null>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetchedIds, setLastFetchedIds] = useState<string>('')

  useEffect(() => {
    if (chatIds.length === 0) {
      setChatLeads({})
      return
    }

    // Evitar loop: só buscar se os IDs mudaram
    const idsKey = chatIds.sort().join(',')
    if (idsKey === lastFetchedIds) {
      return
    }

    const fetchBatchData = async () => {
      setLoading(true)
      setError(null)
      setLastFetchedIds(idsKey)

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token não encontrado')
        }

        console.log('🔄 [useChatLeadBatch] Buscando dados para', chatIds.length, 'chats')

        // Buscar leads e agentes em paralelo
        const [leadsResponse, agentesResults] = await Promise.all([
          // Buscar TODOS os leads de uma vez
          fetch('/api/chats/batch/leads', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cardIds: chatIds
            })
          }),
          // Buscar agentes ativos (primeiros 50 chats)
          Promise.all(
            chatIds.slice(0, 50).map(async (chatId) => {
              try {
                const res = await fetch(`/api/chat-agentes/${encodeURIComponent(chatId)}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                })
                if (!res.ok) return { chatId, hasActiveAgent: false }
                const data = await res.json()
                return { chatId, hasActiveAgent: data.ativo === true }
              } catch {
                return { chatId, hasActiveAgent: false }
              }
            })
          )
        ])

        const leadsData = await leadsResponse.json()
        console.log('📦 [useChatLeadBatch] Leads recebidos:', Object.keys(leadsData).length)
        console.log('🤖 [useChatLeadBatch] Agentes verificados:', agentesResults.length)

        // Mapear resultados do batch
        const result: Record<string, ChatLeadStatus | null> = {}
        
        chatIds.forEach((chatId) => {
          const leadData = leadsData[chatId]
          const agenteData = agentesResults.find(a => a.chatId === chatId)
          
          if (leadData) {
            result[chatId] = {
              status: leadData.status || 'aguardando',
              responsavel: leadData.responsavel || '',
              fila_id: leadData.fila_id || leadData.FilaID || '',
              hasActiveAgent: agenteData?.hasActiveAgent || false,
            }
          } else {
            result[chatId] = null
          }
        })

        console.log('✅ [useChatLeadBatch] Resultado final:', {
          totalChats: chatIds.length,
          totalLeadsEncontrados: Object.keys(result).filter(k => result[k] !== null).length,
          leadsComStatus: Object.entries(result).filter(([_, lead]) => lead?.status).length,
          primeiros3: Object.entries(result).slice(0, 3).map(([id, lead]) => ({
            id: id.substring(0, 15) + '...',
            status: lead?.status,
            responsavel: lead?.responsavel
          }))
        })
        
        setChatLeads(result)
        console.log('🔄 [useChatLeadBatch] setChatLeads chamado! Dados devem atualizar agora.')
      } catch (err) {
        console.error('❌ [useChatLeadBatch] Erro:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchBatchData()
  }, [chatIds.join(',')])

  return { chatLeads, loading, error }
}
