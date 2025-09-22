import { useCallback } from 'react'

export const usePresence = () => {
  const WAHA_BASE_URL = 'http://159.65.34.199:3001'
  const SESSION = 'user_fb8da1d7_1758158816675'
  const API_KEY = 'tappyone-waha-2024-secretkey'

  const startTyping = useCallback(async (chatId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${WAHA_BASE_URL}/api/startTyping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': API_KEY
        },
        body: JSON.stringify({
          session: SESSION,
          chatId: chatId
        })
      })
      
      const result = await response.json()
      console.log('⌨️ Start Typing:', result)
      return result.result === true
    } catch (error) {
      console.error('❌ Start Typing Error:', error)
      return false
    }
  }, [])

  const stopTyping = useCallback(async (chatId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${WAHA_BASE_URL}/api/stopTyping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': API_KEY
        },
        body: JSON.stringify({
          session: SESSION,
          chatId: chatId
        })
      })
      
      const result = await response.json()
      console.log('⏹️ Stop Typing:', result)
      return result.result === true
    } catch (error) {
      console.error('❌ Stop Typing Error:', error)
      return false
    }
  }, [])

  const markAsSeen = useCallback(async (chatId: string, messageId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${WAHA_BASE_URL}/api/sendSeen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': API_KEY
        },
        body: JSON.stringify({
          session: SESSION,
          chatId: chatId,
          messageId: messageId
        })
      })
      
      const result = await response.json()
      console.log('👁️ Mark as Seen:', result)
      return response.ok
    } catch (error) {
      console.error('❌ Mark as Seen Error:', error)
      return false
    }
  }, [])

  const getChatPresence = useCallback(async (chatId: string) => {
    try {
      // Verificar presença do contato
      const response = await fetch(`${WAHA_BASE_URL}/api/${SESSION}/presence/${chatId}`, {
        headers: { 'X-Api-Key': API_KEY }
      })
      
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.log('Presence info not available')
    }
    return null
  }, [])

  return {
    startTyping,
    stopTyping,
    markAsSeen,
    getChatPresence
  }
}
