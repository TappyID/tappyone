import { useCallback } from 'react'

export const usePresence = () => {
  // Funções mock que não fazem chamadas de API
  const startTyping = useCallback(async (chatId: string): Promise<boolean> => {
    return true
  }, [])

  const stopTyping = useCallback(async (chatId: string): Promise<boolean> => {
    return true
  }, [])

  const isOnline = useCallback((chatId: string): boolean => {
    // Sempre retorna true para simplificar
    return true
  }, [])

  const isTyping = useCallback((chatId: string): boolean => {
    // Sempre retorna false para simplificar
    return false
  }, [])

  const getChatPresence = useCallback(async (chatId: string) => {
    return null
  }, [])

  return {
    startTyping,
    stopTyping,
    isOnline,
    isTyping,
    getChatPresence
  }
}
