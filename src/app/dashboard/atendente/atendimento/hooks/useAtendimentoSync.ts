import { useEffect } from 'react'
import { useContactData } from '@/contexts/ContactDataContext'

// Hook para sincronizar dados no atendimento
export function useAtendimentoSync(activeChats: any[]) {
  const { batchFetchContactData } = useContactData()

  useEffect(() => {
    if (!activeChats || activeChats.length === 0) return

    // Extrair contatoIds dos chats ativos
    const contatoIds = activeChats
      .slice(0, 20) // Limitar para não sobrecarregar
      .map(chat => chat.id?.replace('@c.us', '').replace('@s.whatsapp.net', ''))
      .filter(Boolean)

    // Buscar dados em batch
    if (contatoIds.length > 0) {
      console.log(`🔄 Sincronizando dados de ${contatoIds.length} contatos`)
      batchFetchContactData(contatoIds)
    }
  }, [activeChats, batchFetchContactData])
}
