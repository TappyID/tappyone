import { useEffect, useRef, useCallback } from 'react'
import { usePresence } from './usePresence'

interface UsePresencePollingProps {
  chatIds: string[]
  enabled: boolean
  interval?: number
}

export const usePresencePolling = ({ 
  chatIds, 
  enabled = true, 
  interval = 30000 // 30 segundos
}: UsePresencePollingProps) => {
  const { getChatPresence } = usePresence()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingRef = useRef(false)

  const pollPresence = useCallback(async () => {
    if (!enabled || chatIds.length === 0 || isPollingRef.current) return
    
    isPollingRef.current = true
    
    try {
      // Polling em lotes para não sobrecarregar a API
      const batchSize = 5
      for (let i = 0; i < chatIds.length; i += batchSize) {
        const batch = chatIds.slice(i, i + batchSize)
        
        // Processar lote em paralelo
        await Promise.allSettled(
          batch.map(chatId => getChatPresence(chatId))
        )
        
        // Pequeno delay entre lotes
        if (i + batchSize < chatIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    } catch (error) {
      console.error('Error polling presence:', error)
    } finally {
      isPollingRef.current = false
    }
  }, [chatIds, enabled, getChatPresence])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return
    
    // Poll imediatamente
    pollPresence()
    
    // Configurar polling periódico
    intervalRef.current = setInterval(pollPresence, interval)
  }, [pollPresence, interval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isPollingRef.current = false
  }, [])

  useEffect(() => {
    if (enabled && chatIds.length > 0) {
      startPolling()
    } else {
      stopPolling()
    }

    return stopPolling
  }, [enabled, chatIds, startPolling, stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  return {
    startPolling,
    stopPolling,
    isPolling: isPollingRef.current
  }
}
