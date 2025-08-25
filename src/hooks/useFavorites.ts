import { useState, useCallback, useEffect } from 'react'

interface FavoriteMessage {
  messageId: string
  chatId: string
  timestamp: number
  starred: boolean
}

interface UseFavoritesReturn {
  favorites: Set<string>
  isStarred: (messageId: string) => boolean
  toggleStar: (messageId: string, chatId: string) => Promise<boolean>
  loading: Set<string>
  refreshFavorites: () => Promise<void>
}

export function useFavorites(chatId?: string): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<Set<string>>(new Set())

  // Carregar favoritos do localStorage (fallback)
  useEffect(() => {
    if (chatId) {
      const stored = localStorage.getItem(`favorites_${chatId}`)
      if (stored) {
        try {
          const favoriteIds = JSON.parse(stored) as string[]
          setFavorites(new Set(favoriteIds))
        } catch (error) {
          console.error('Erro ao carregar favoritos:', error)
        }
      }
    }
  }, [chatId])

  // Salvar no localStorage como backup
  const saveFavoritesToStorage = useCallback((updatedFavorites: Set<string>) => {
    if (chatId) {
      localStorage.setItem(`favorites_${chatId}`, JSON.stringify(Array.from(updatedFavorites)))
    }
  }, [chatId])

  const isStarred = useCallback((messageId: string) => {
    return favorites.has(messageId)
  }, [favorites])

  const toggleStar = useCallback(async (messageId: string, targetChatId: string): Promise<boolean> => {
    const currentlyStarred = favorites.has(messageId)
    const newStarredState = !currentlyStarred

    // Adicionar ao loading
    setLoading(prev => {
      const updated = new Set(Array.from(prev))
      updated.add(messageId)
      return updated
    })

    try {
      console.log(`${newStarredState ? '⭐ Favoritando' : '⭐ Removendo favorito'} mensagem:`, { messageId, targetChatId })

      const endpoint = '/api/whatsapp/messages/star'
      const method = newStarredState ? 'POST' : 'DELETE'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          messageId,
          chatId: targetChatId,
          session: `user_${localStorage.getItem('userId') || 'default'}`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na requisição')
      }

      // Atualizar estado local
      setFavorites(prev => {
        const updated = new Set(Array.from(prev))
        if (newStarredState) {
          updated.add(messageId)
        } else {
          updated.delete(messageId)
        }
        
        // Salvar no localStorage
        saveFavoritesToStorage(updated)
        
        return updated
      })

      console.log(`✅ ${newStarredState ? 'Favoritado' : 'Favorito removido'} com sucesso`)
      return newStarredState

    } catch (error) {
      console.error('💥 Erro ao alterar favorito:', error)
      
      // Em caso de erro, não alterar o estado
      alert(`Erro ao ${newStarredState ? 'favoritar' : 'remover favorito'}. Tente novamente.`)
      return currentlyStarred

    } finally {
      // Remover do loading
      setLoading(prev => {
        const updated = new Set(Array.from(prev))
        updated.delete(messageId)
        return updated
      })
    }
  }, [favorites, saveFavoritesToStorage])

  const refreshFavorites = useCallback(async () => {
    if (!chatId) return

    try {
      console.log('🔄 Sincronizando favoritos do servidor...')
      
      // TODO: Implementar endpoint para buscar favoritos do WAHA
      // Por enquanto, mantemos o localStorage como fonte
      
    } catch (error) {
      console.error('💥 Erro ao sincronizar favoritos:', error)
    }
  }, [chatId])

  return {
    favorites,
    isStarred,
    toggleStar,
    loading,
    refreshFavorites
  }
}
