import { useEffect, useState } from 'react'
import { useContactData } from '@/contexts/ContactDataContext'

interface UseContactSyncOptions {
  autoFetch?: boolean
  refetchInterval?: number
}

export function useContactSync(contatoId: string | null, options: UseContactSyncOptions = {}) {
  const { autoFetch = true, refetchInterval = 0 } = options
  const { getContactData, batchFetchContactData, invalidateContactData } = useContactData()
  const [isLoading, setIsLoading] = useState(false)
  
  // Dados do contato
  const contactData = contatoId ? getContactData(contatoId) : null
  
  // Buscar dados automaticamente
  useEffect(() => {
    if (!contatoId || !autoFetch) return
    
    setIsLoading(true)
    batchFetchContactData([contatoId]).finally(() => {
      setIsLoading(false)
    })
  }, [contatoId, autoFetch])
  
  // Refetch periódico se configurado
  useEffect(() => {
    if (!contatoId || !refetchInterval || refetchInterval <= 0) return
    
    const interval = setInterval(() => {
      invalidateContactData(contatoId)
      batchFetchContactData([contatoId])
    }, refetchInterval)
    
    return () => clearInterval(interval)
  }, [contatoId, refetchInterval])
  
  // Função para forçar refresh
  const refresh = () => {
    if (!contatoId) return
    invalidateContactData(contatoId)
    setIsLoading(true)
    batchFetchContactData([contatoId]).finally(() => {
      setIsLoading(false)
    })
  }
  
  return {
    tags: contactData?.tags || [],
    tickets: contactData?.tickets || [],
    orcamentos: contactData?.orcamentos || [],
    agendamentos: contactData?.agendamentos || [],
    anotacoes: contactData?.anotacoes || [],
    assinaturas: contactData?.assinaturas || [],
    kanbanStatus: contactData?.kanbanStatus,
    isLoading,
    refresh
  }
}
