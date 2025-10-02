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
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('Token não encontrado')
        }

        // Usar nossa API proxy que busca a sessão dinâmica
        const response = await axios.get(
          `/api/whatsapp/chats/${chatId}/picture`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        // WAHA retorna JSON com URL da imagem
        if (response.data && response.data.url) {
          setPictureUrl(response.data.url)
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

      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ Token não encontrado')
        setIsLoading(false)
        return
      }

      // Buscar fotos em paralelo (limitando a 5 por vez para não sobrecarregar)
      const chunks = []
      for (let i = 0; i < chatIds.length; i += 5) {
        chunks.push(chatIds.slice(i, i + 5))
      }

      for (const chunk of chunks) {
        await Promise.all(
          chunk.map(async (chatId) => {
            try {
              const response = await axios.get(
                `/api/whatsapp/chats/${chatId}/picture`,
                {
                  headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                  }
                }
              )

              if (response.data && response.data.url) {
                newPictures[chatId] = response.data.url
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
  }, [JSON.stringify(chatIds), session, enabled])

  return {
    pictures,
    isLoading,
    getPicture: (chatId: string) => pictures[chatId] || null
  }
}
