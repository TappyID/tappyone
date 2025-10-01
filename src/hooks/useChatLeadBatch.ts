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

        // Fazer requisições em paralelo para leads e agentes
        const [leadsResponse, agentesResponse] = await Promise.all([
          // Buscar leads (batch ou individual)
          Promise.all(
            chatIds.slice(0, 20).map(async (chatId) => {
              try {
                const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}/leads`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                })
                const data = await res.json()
                return { chatId, lead: data.data }
              } catch {
                return { chatId, lead: null }
              }
            })
          ),
          // Buscar agentes ativos (batch ou individual)
          Promise.all(
            chatIds.slice(0, 20).map(async (chatId) => {
              try {
                const res = await fetch(`/api/chat-agentes/${encodeURIComponent(chatId)}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                })
                const data = await res.json()
                return { chatId, hasActiveAgent: data.ativo === true }
              } catch {
                return { chatId, hasActiveAgent: false }
              }
            })
          ),
        ])

        // Mapear resultados
        const result: Record<string, ChatLeadStatus | null> = {}
        
        chatIds.forEach((chatId) => {
          const leadData = leadsResponse.find(r => r.chatId === chatId)
          const agentData = agentesResponse.find(r => r.chatId === chatId)
          
          if (leadData?.lead) {
            result[chatId] = {
              status: leadData.lead.status || 'aguardando',
              responsavel: leadData.lead.responsavel || '',
              fila_id: leadData.lead.fila_id || '',
              hasActiveAgent: agentData?.hasActiveAgent || false,
            }
          } else {
            result[chatId] = null
          }
        })

        setChatLeads(result)
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
