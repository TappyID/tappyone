'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from './useDebounce'

interface SearchOptions {
  searchInChats: boolean
  searchInMessages: boolean
  searchInContacts: boolean
}

interface SearchResults {
  chats: any[]
  messages: any[]
  contacts: any[]
  loading: boolean
  error: string | null
}

export function useSearchData(query: string, options: SearchOptions) {
  const [results, setResults] = useState<SearchResults>({
    chats: [],
    messages: [],
    contacts: [],
    loading: false,
    error: null
  })

  // Debounce da query para evitar muitas requisições
  const debouncedQuery = useDebounce(query, 300)

  const searchChats = useCallback(async (searchQuery: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/whatsapp/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const chats = await response.json()
        
        // Filtrar chats por nome no frontend
        const filteredChats = chats.filter((chat: any) => 
          chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.id?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        
        return filteredChats
      }
      return []
    } catch (error) {
      console.error('Erro ao buscar chats:', error)
      return []
    }
  }, [])

  const searchMessages = useCallback(async (searchQuery: string) => {
    try {
      const token = localStorage.getItem('token')
      
      // Primeiro buscar todos os chats para depois buscar mensagens
      const chatsResponse = await fetch('/api/whatsapp/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!chatsResponse.ok) return []
      
      const chats = await chatsResponse.json()
      const messagesResults = []

      // Buscar mensagens em cada chat (limitado aos primeiros 10 chats para performance)
      const limitedChats = chats.slice(0, 10)
      
      for (const chat of limitedChats) {
        try {
          const messagesResponse = await fetch(`/api/whatsapp/chats/${chat.id}/messages?limit=20`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (messagesResponse.ok) {
            const messages = await messagesResponse.json()
            
            // Filtrar mensagens por conteúdo
            const filteredMessages = messages.filter((msg: any) => 
              msg.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((msg: any) => ({
              ...msg,
              chatId: chat.id,
              chatName: chat.name
            }))
            
            messagesResults.push(...filteredMessages)
          }
        } catch (error) {
          console.warn(`Erro ao buscar mensagens do chat ${chat.id}:`, error)
        }
      }
      
      return messagesResults
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error)
      return []
    }
  }, [])

  const searchContacts = useCallback(async (searchQuery: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/whatsapp/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const contacts = await response.json()
        
        // Filtrar contatos por nome ou número
        const filteredContacts = contacts.filter((contact: any) => 
          contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.pushName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.id?.includes(searchQuery) ||
          contact.number?.includes(searchQuery)
        )
        
        return filteredContacts
      }
      return []
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
      return []
    }
  }, [])

  const performSearch = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults({
        chats: [],
        messages: [],
        contacts: [],
        loading: false,
        error: null
      })
      return
    }

    console.log('🔍 [SEARCH] Iniciando busca:', {
      query: debouncedQuery,
      options
    })

    setResults(prev => ({ ...prev, loading: true, error: null }))

    try {
      const searchPromises = []
      
      if (options.searchInChats) {
        console.log('🔍 [SEARCH] Buscando em chats...')
        searchPromises.push(searchChats(debouncedQuery))
      } else {
        searchPromises.push(Promise.resolve([]))
      }
      
      if (options.searchInMessages) {
        console.log('🔍 [SEARCH] Buscando em mensagens...')
        searchPromises.push(searchMessages(debouncedQuery))
      } else {
        searchPromises.push(Promise.resolve([]))
      }
      
      if (options.searchInContacts) {
        console.log('🔍 [SEARCH] Buscando em contatos...')
        searchPromises.push(searchContacts(debouncedQuery))
      } else {
        searchPromises.push(Promise.resolve([]))
      }

      const [chats, messages, contacts] = await Promise.all(searchPromises)

      console.log('✅ [SEARCH] Resultados:', {
        chats: chats.length,
        messages: messages.length,
        contacts: contacts.length
      })

      setResults({
        chats,
        messages,
        contacts,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Erro na busca:', error)
      setResults(prev => ({
        ...prev,
        loading: false,
        error: 'Erro ao realizar busca'
      }))
    }
  }, [debouncedQuery, options, searchChats, searchMessages, searchContacts])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  return results
}
