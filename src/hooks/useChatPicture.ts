'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface UseChatPictureOptions {
  session?: string
  enabled?: boolean
}

export function useChatPicture(chatId: string, options: UseChatPictureOptions = {}) {
  const { session = 'default', enabled = true } = options
  const [pictureUrl, setPictureUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chatId || !enabled) {
      setPictureUrl(null)
      return
    }

    const fetchPicture = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Limpar o chatId removendo @c.us ou @g.us se existir
        const cleanChatId = chatId.replace(/@c\.us|@g\.us/g, '')
        
        // Buscar a foto do perfil via WAHA
        const response = await axios.get(
          `http://159.65.34.199:3001/api/${session}/chats/${cleanChatId}/picture`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            responseType: 'blob' // Importante para receber a imagem como blob
          }
        )

        // Criar URL da imagem a partir do blob
        if (response.data) {
          const imageUrl = URL.createObjectURL(response.data)
          setPictureUrl(imageUrl)
        }
      } catch (err: any) {
        console.error(`❌ Erro ao buscar foto do chat ${chatId}:`, err)
        setError(err.message || 'Erro ao buscar foto')
        setPictureUrl(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPicture()

    // Cleanup: revogar URL quando componente desmontar
    return () => {
      if (pictureUrl && pictureUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pictureUrl)
      }
    }
  }, [chatId, session, enabled])

  return {
    pictureUrl,
    isLoading,
    error,
    refetch: () => {
      // Forçar nova busca
      setPictureUrl(null)
      setError(null)
    }
  }
}

// Hook para buscar múltiplas fotos de uma vez (otimizado para listas)
export function useChatPictures(chatIds: string[], options: UseChatPictureOptions = {}) {
  const { session = 'default', enabled = true } = options
  const [pictures, setPictures] = useState<Record<string, string | null>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!chatIds.length || !enabled) {
      setPictures({})
      return
    }

    const fetchPictures = async () => {
      setIsLoading(true)
      const newPictures: Record<string, string | null> = {}

      // Buscar fotos em paralelo (limitando a 5 por vez para não sobrecarregar)
      const chunks = []
      for (let i = 0; i < chatIds.length; i += 5) {
        chunks.push(chatIds.slice(i, i + 5))
      }

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (chatId) => {
            try {
              const cleanChatId = chatId.replace(/@c\.us|@g\.us/g, '')
              const response = await axios.get(
                `http://159.65.34.199:3001/api/${session}/chats/${cleanChatId}/picture`,
                {
                  headers: { 'Content-Type': 'application/json' },
                  responseType: 'blob'
                }
              )

              if (response.data) {
                newPictures[chatId] = URL.createObjectURL(response.data)
              }
            } catch (err) {
              console.error(`❌ Erro ao buscar foto do chat ${chatId}:`, err)
              newPictures[chatId] = null
            }
          })
        )
      }

      setPictures(newPictures)
      setIsLoading(false)
    }

    fetchPictures()

    // Cleanup
    return () => {
      Object.values(pictures).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [JSON.stringify(chatIds), session, enabled])

  return {
    pictures,
    isLoading,
    getPicture: (chatId: string) => pictures[chatId] || null
  }
}
