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

export function useSearchData(query: string, options: SearchOptions, availableChats: any[] = []) {
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
    // Buscar localmente nos chats disponíveis
    console.log('🔍 [SEARCH CHATS] Buscando em', availableChats.length, 'chats')
    
    const filtered = availableChats.filter((chat: any) => 
      chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.id?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    console.log('✅ [SEARCH CHATS] Encontrados:', filtered.length)
    return filtered
  }, [availableChats])

  const searchMessages = useCallback(async (searchQuery: string) => {
    try {
      const token = localStorage.getItem('token')
      console.log('🔍 [SEARCH MESSAGES] Buscando mensagens com:', searchQuery)
      
      // Buscar mensagens usando o endpoint global
      const response = await fetch(`/api/whatsapp/messages?search=${encodeURIComponent(searchQuery)}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('🔍 [SEARCH MESSAGES] Response status:', response.status)

      if (response.ok) {
        const messages = await response.json()
        console.log('✅ [SEARCH MESSAGES] Mensagens encontradas:', messages.length)
        
        // Retornar mensagens com chatId para poder filtrar chats
        return messages.map((msg: any) => ({
          ...msg,
          chatId: msg.chatId || msg.from || msg.chat_id
        }))
      }
      
      console.warn('⚠️ [SEARCH MESSAGES] Response não OK:', response.status)
      return []
    } catch (error) {
      console.error('❌ [SEARCH MESSAGES] Erro:', error)
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
    console.log('🔍 [PERFORM SEARCH] Função chamada!', {
      debouncedQuery,
      hasQuery: !!debouncedQuery.trim()
    })

    if (!debouncedQuery.trim()) {
      console.log('⚠️ [PERFORM SEARCH] Query vazia, limpando resultados')
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
