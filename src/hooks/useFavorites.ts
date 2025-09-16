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

  // Salvar no localStorage como backup
  const saveFavoritesToStorage = useCallback((updatedFavorites: Set<string>) => {
    if (chatId) {
      localStorage.setItem(`favorites_${chatId}`, JSON.stringify(Array.from(updatedFavorites)))
    }
  }, [chatId])

  const refreshFavorites = useCallback(async () => {
    if (!chatId) return

    try {
      console.log('🔄 Sincronizando favoritos do servidor...')
      
      const response = await fetch(`/api/favorites?chatId=${chatId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const serverFavorites = new Set<string>(
          data.favorites?.map((fav: any) => fav.message_id as string) || []
        )
        
        console.log(`📥 Carregados ${serverFavorites.size} favoritos do servidor`)
        setFavorites(serverFavorites)
        saveFavoritesToStorage(serverFavorites)
      } else {
        console.log('⚠️ Erro ao carregar favoritos do servidor, usando localStorage')
      }
      
    } catch (error) {
      console.error('💥 Erro ao sincronizar favoritos:', error)
      console.log('📱 Usando favoritos do localStorage como fallback')
    }
  }, [chatId, saveFavoritesToStorage])

  // Carregar favoritos do servidor e localStorage como fallback
  useEffect(() => {
    if (chatId) {
      // Primeiro carregar do localStorage para UI responsiva
      const stored = localStorage.getItem(`favorites_${chatId}`)
      if (stored) {
        try {
          const favoriteIds = JSON.parse(stored) as string[]
          setFavorites(new Set(favoriteIds))
        } catch (error) {
          console.error('Erro ao carregar favoritos do localStorage:', error)
        }
      }
      
      // Depois sincronizar com servidor
      setTimeout(() => refreshFavorites(), 100)
    }
  }, [chatId, refreshFavorites])

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

      const endpoint = '/api/favorites'
      const method = 'POST' // Backend usa POST para criar/atualizar

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          messageId,
          chatId: targetChatId,
          starred: newStarredState
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

  return {
    favorites,
    isStarred,
    toggleStar,
    loading,
    refreshFavorites
  }
}
