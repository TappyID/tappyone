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
    console.log('📨 [searchMessages] Iniciando busca em mensagens:', { searchQuery })
    
    try {
      const token = localStorage.getItem('token')
      
      // Primeiro buscar todos os chats para depois buscar mensagens
      const chatsResponse = await fetch('/api/whatsapp/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!chatsResponse.ok) {
        console.log('📨 [searchMessages] Erro ao buscar chats:', chatsResponse.status)
        return []
      }
      
      const chats = await chatsResponse.json()
      console.log('📨 [searchMessages] Chats obtidos:', chats.length)
      
      const messagesResults = []

      // Buscar mensagens em cada chat (limitado aos primeiros 10 chats para performance)
      const limitedChats = chats.slice(0, 10)
      console.log('📨 [searchMessages] Buscando mensagens em', limitedChats.length, 'chats')
      
      for (const chat of limitedChats) {
        try {
          console.log('📨 [searchMessages] Buscando mensagens do chat:', chat.id)
          
          const messagesResponse = await fetch(`/api/whatsapp/chats/${chat.id}/messages?limit=20`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (messagesResponse.ok) {
            const messages = await messagesResponse.json()
            console.log('📨 [searchMessages] Mensagens obtidas do chat', chat.id, ':', messages.length)
            
            // Filtrar mensagens por conteúdo
            const filteredMessages = messages.filter((msg: any) => {
              const hasMatch = msg.body?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              msg.text?.toLowerCase().includes(searchQuery.toLowerCase())
              
              if (hasMatch) {
                console.log('📨 [searchMessages] Mensagem encontrada:', {
                  chatId: chat.id,
                  body: msg.body?.substring(0, 50) + '...',
                  text: msg.text?.substring(0, 50) + '...'
                })
              }
              
              return hasMatch
            }).map((msg: any) => ({
              ...msg,
              chatId: chat.id,
              chatName: chat.name
            }))
            
            console.log('📨 [searchMessages] Mensagens filtradas do chat', chat.id, ':', filteredMessages.length)
            messagesResults.push(...filteredMessages)
          }
        } catch (error) {
          console.warn(`📨 [searchMessages] Erro ao buscar mensagens do chat ${chat.id}:`, error)
        }
      }
      
      console.log('📨 [searchMessages] Total de mensagens encontradas:', messagesResults.length)
      return messagesResults
    } catch (error) {
      console.error('📨 [searchMessages] Erro ao buscar mensagens:', error)
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
    console.log('🔍 [useSearchData] performSearch chamado:', {
      debouncedQuery,
      options,
      hasQuery: !!debouncedQuery.trim()
    })

    if (!debouncedQuery.trim()) {
      console.log('🔍 [useSearchData] Query vazia - limpando resultados')
      setResults({
        chats: [],
        messages: [],
        contacts: [],
        loading: false,
        error: null
      })
      return
    }

    console.log('🔍 [useSearchData] Iniciando busca com loading=true')
    setResults(prev => ({ ...prev, loading: true, error: null }))

    try {
      const searchPromises = []
      
      if (options.searchInChats) {
        console.log('🔍 [useSearchData] Adicionando busca em CHATS')
        searchPromises.push(searchChats(debouncedQuery))
      } else {
        searchPromises.push(Promise.resolve([]))
      }
      
      if (options.searchInMessages) {
        console.log('🔍 [useSearchData] Adicionando busca em MENSAGENS')
        searchPromises.push(searchMessages(debouncedQuery))
      } else {
        searchPromises.push(Promise.resolve([]))
      }
      
      if (options.searchInContacts) {
        console.log('🔍 [useSearchData] Adicionando busca em CONTATOS')
        searchPromises.push(searchContacts(debouncedQuery))
      } else {
        searchPromises.push(Promise.resolve([]))
      }

      console.log('🔍 [useSearchData] Executando', searchPromises.length, 'promises de busca')
      const [chats, messages, contacts] = await Promise.all(searchPromises)

      console.log('🔍 [useSearchData] Resultados obtidos:', {
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
      console.error('🔍 [useSearchData] Erro na busca:', error)
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
