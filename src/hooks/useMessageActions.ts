import { useState, useCallback } from 'react'
import { WhatsAppMessage } from './useInfiniteMessages'

interface UseMessageActionsProps {
  chatId: string | null
  onMessageUpdate?: () => void
}

export function useMessageActions({ chatId, onMessageUpdate }: UseMessageActionsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const makeRequest = useCallback(async (endpoint: string, method: string, body?: any) => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://159.65.34.199:3001/'
    const response = await fetch(`${backendUrl}/api/whatsapp${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Erro ${response.status}`)
    }

    // Verificar se há conteúdo para fazer parse do JSON
    const text = await response.text()
    if (!text) {
      return {} // Retorna objeto vazio se não há conteúdo
    }
    
    try {
      return JSON.parse(text)
    } catch (error) {
      console.warn('Resposta não é JSON válido:', text)
      return {}
    }
  }, [])

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!chatId) return

    setLoading(true)
    setError(null)

    try {
      await makeRequest(`/chats/${encodeURIComponent(chatId)}/messages/${messageId}`, 'PUT', {
        text: newText
      })
      onMessageUpdate?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao editar mensagem'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [chatId, makeRequest, onMessageUpdate])

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!chatId) return

    setLoading(true)
    setError(null)

    try {
      await makeRequest(`/chats/${encodeURIComponent(chatId)}/messages/${messageId}`, 'DELETE')
      onMessageUpdate?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar mensagem'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [chatId, makeRequest, onMessageUpdate])

  const starMessage = useCallback(async (messageId: string, star: boolean = true) => {
    setLoading(true)
    setError(null)

    try {
      await makeRequest('/star', 'PUT', {
        messageId,
        star
      })
      
      // Atualizar estado local da mensagem
      onMessageUpdate?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao favoritar mensagem'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [makeRequest, onMessageUpdate])

  const forwardMessage = useCallback(async (messageId: string, toChatIds: string[]) => {
    setLoading(true)
    setError(null)

    try {
      // Encaminhar para múltiplos contatos
      const promises = toChatIds.map(toChatId => 
        makeRequest(`/messages/${messageId}/forward`, 'POST', {
          toChatId
        })
      )
      
      await Promise.all(promises)
      onMessageUpdate?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao encaminhar mensagem'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [makeRequest, onMessageUpdate])

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    setLoading(true)
    setError(null)

    try {
      await makeRequest(`/reaction`, 'PUT', {
        messageId,
        reaction
      })
      onMessageUpdate?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar reação'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [makeRequest, onMessageUpdate])

  const removeReaction = useCallback(async (messageId: string) => {
    setLoading(true)
    setError(null)

    try {
      await makeRequest(`/reaction`, 'PUT', {
        messageId,
        reaction: ''
      })
      onMessageUpdate?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover reação'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [makeRequest, onMessageUpdate])

  const sendContact = useCallback(async (contactId: string, name: string) => {
    if (!chatId) return

    setLoading(true)
    setError(null)

    try {
      await makeRequest('/sendContactVcard', 'POST', {
        chatId,
        contactId,
        name
      })
      onMessageUpdate?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar contato'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [chatId, makeRequest, onMessageUpdate])

  const sendLocation = useCallback(async (latitude: number, longitude: number, title?: string, address?: string) => {
    if (!chatId) return

    setLoading(true)
    setError(null)

    try {
      await makeRequest('/sendLocation', 'POST', {
        chatId,
        latitude,
        longitude,
        title,
        address
      })
      onMessageUpdate?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar localização'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [chatId, makeRequest, onMessageUpdate])

  const sendPoll = useCallback(async (name: string, options: string[], multipleAnswers: boolean = false) => {
    if (!chatId) return

    setLoading(true)
    setError(null)

    try {
      await makeRequest('/sendPoll', 'POST', {
        chatId,
        name,
        options,
        multipleAnswers
      })
      onMessageUpdate?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar enquete'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [chatId, makeRequest, onMessageUpdate])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }, [])

  return {
    loading,
    error,
    editMessage,
    deleteMessage,
    starMessage,
    forwardMessage,
    addReaction,
    removeReaction,
    sendContact,
    sendLocation,
    sendPoll,
    copyToClipboard
  }
}
