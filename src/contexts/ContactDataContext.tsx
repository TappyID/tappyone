'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface ContactData {
  tags: any[]
  tickets: any[]
  orcamentos: any[]
  agendamentos: any[]
  anotacoes: any[]
  assinaturas: any[]
  kanbanStatus?: string
  lastFetch?: number
}

interface ContactDataContextType {
  contactsData: Record<string, ContactData>
  getContactData: (contatoId: string) => ContactData | null
  updateContactData: (contatoId: string, data: Partial<ContactData>) => void
  batchFetchContactData: (contatoIds: string[]) => Promise<void>
  invalidateContactData: (contatoId: string) => void
}

const ContactDataContext = createContext<ContactDataContextType | undefined>(undefined)

const CACHE_DURATION = 2 * 60 * 1000 // 2 minutos

export function ContactDataProvider({ children }: { children: React.ReactNode }) {
  const [contactsData, setContactsData] = useState<Record<string, ContactData>>({})

  // Buscar dados de um contato
  const fetchContactData = async (contatoId: string): Promise<ContactData> => {
    try {
      const token = localStorage.getItem('token')
      
      // Fazer todas as requisições em paralelo
      const [tags, tickets, orcamentos, agendamentos, anotacoes, assinaturas] = await Promise.all([
        fetch(`/api/tag/contato/${contatoId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : []),
        
        fetch(`/api/ticket/contato/${contatoId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : []),
        
        fetch(`/api/orcamento/contato/${contatoId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : []),
        
        fetch(`/api/agendamento/contato/${contatoId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : []),
        
        fetch(`/api/anotacoes/contato/${contatoId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : []),
        
        fetch(`/api/assinatura/contato/${contatoId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : [])
      ])

      return {
        tags,
        tickets,
        orcamentos,
        agendamentos,
        anotacoes,
        assinaturas,
        lastFetch: Date.now()
      }
    } catch (error) {
      console.error(`Erro ao buscar dados do contato ${contatoId}:`, error)
      return {
        tags: [],
        tickets: [],
        orcamentos: [],
        agendamentos: [],
        anotacoes: [],
        assinaturas: [],
        lastFetch: Date.now()
      }
    }
  }

  // Buscar dados em batch (otimizado)
  const batchFetchContactData = useCallback(async (contatoIds: string[]) => {
    // Filtrar apenas contatos que precisam ser atualizados
    const idsToFetch = contatoIds.filter(id => {
      const existing = contactsData[id]
      if (!existing) return true
      if (!existing.lastFetch) return true
      return Date.now() - existing.lastFetch > CACHE_DURATION
    })

    if (idsToFetch.length === 0) return

    console.log(`📊 Buscando dados em batch para ${idsToFetch.length} contatos`)

    // Buscar em paralelo mas com limite de 5 por vez para não sobrecarregar
    const batchSize = 5
    for (let i = 0; i < idsToFetch.length; i += batchSize) {
      const batch = idsToFetch.slice(i, i + batchSize)
      const results = await Promise.all(batch.map(fetchContactData))
      
      const newData: Record<string, ContactData> = {}
      batch.forEach((id, index) => {
        newData[id] = results[index]
      })
      
      setContactsData(prev => ({ ...prev, ...newData }))
    }
  }, [contactsData])

  // Obter dados de um contato
  const getContactData = useCallback((contatoId: string): ContactData | null => {
    const data = contactsData[contatoId]
    if (!data) return null
    
    // Verificar se precisa atualizar
    if (data.lastFetch && Date.now() - data.lastFetch > CACHE_DURATION) {
      // Buscar em background sem bloquear
      fetchContactData(contatoId).then(newData => {
        setContactsData(prev => ({ ...prev, [contatoId]: newData }))
      })
    }
    
    return data
  }, [contactsData])

  // Atualizar dados de um contato
  const updateContactData = useCallback((contatoId: string, data: Partial<ContactData>) => {
    setContactsData(prev => ({
      ...prev,
      [contatoId]: {
        ...prev[contatoId],
        ...data,
        lastFetch: Date.now()
      }
    }))
  }, [])

  // Invalidar cache de um contato
  const invalidateContactData = useCallback((contatoId: string) => {
    setContactsData(prev => {
      const newData = { ...prev }
      if (newData[contatoId]) {
        newData[contatoId].lastFetch = 0 // Forçar refetch na próxima vez
      }
      return newData
    })
  }, [])

  return (
    <ContactDataContext.Provider value={{
      contactsData,
      getContactData,
      updateContactData,
      batchFetchContactData,
      invalidateContactData
    }}>
      {children}
    </ContactDataContext.Provider>
  )
}

export function useContactData() {
  const context = useContext(ContactDataContext)
  if (!context) {
    throw new Error('useContactData deve ser usado dentro de ContactDataProvider')
  }
  return context
}
