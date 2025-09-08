import { useState, useEffect } from 'react'

interface ContatoData {
  id: string
  fila?: {
    id: string
    nome: string
    cor: string
  }
  tags: {
    id: string
    nome: string
    cor: string
  }[]
  atendente?: {
    id: string
    nome: string
    email: string
  }
  kanbanBoard?: string
  orcamento?: {
    valor: number
    status: string
  }
  agendamento?: {
    data: string
    status: string
  }
}

interface UseContatoDataReturn {
  contatos: { [chatId: string]: ContatoData | null }
  loading: boolean
  error: string | null
  refreshContato: (chatId: string) => void
}

export function useContatoData(chatIds: string[]) {
  const [contatos, setContatos] = useState<{ [chatId: string]: ContatoData | null }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContatoData = async (chatId: string) => {
    if (!chatId || chatId.trim() === '') {
      console.log(`⚠️ [useContatoData] ChatId vazio ou inválido: "${chatId}"`)
      return null
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ [useContatoData] Token não encontrado no localStorage')
        throw new Error('Token não encontrado')
      }
      
      console.log(`🔑 [useContatoData] Token encontrado para ${chatId}`)

      // Extrair número do telefone do chatId (mesmo formato do Kanban)
      const numeroTelefone = chatId.replace('@c.us', '').replace('@g.us', '')
      console.log(`🔍 [useContatoData] Buscando dados para número: ${numeroTelefone}`)

      // Buscar contato base pelo número do telefone
      const contatoResponse = await fetch(`/api/contatos?numero_telefone=${numeroTelefone}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      let contatoData = null
      if (contatoResponse.ok) {
        const contatos = await contatoResponse.json()
        contatoData = contatos.length > 0 ? contatos[0] : null
        console.log(`📱 [useContatoData] Contato encontrado:`, contatoData?.id || 'Não encontrado')
      }

      if (!contatoData) {
        console.log(`ℹ️ [useContatoData] Chat sem contato CRM: ${chatId}`)
        return null
      }

      // Buscar dados relacionados usando contato_id (mesmo método do Kanban)
      const [tagsResponse, orcamentosResponse, agendamentosResponse] = await Promise.all([
        fetch(`/api/contatos/${contatoData.id}/tags`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null),
        
        fetch(`/api/orcamentos?contato_id=${numeroTelefone}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null),
        
        fetch(`/api/agendamentos?contato_id=${numeroTelefone}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null)
      ])

      // Processar tags
      let tags = []
      if (tagsResponse?.ok) {
        const tagsData = await tagsResponse.json()
        tags = tagsData.data || tagsData || []
        console.log(`🏷️ [useContatoData] ${chatId} - Tags encontradas:`, tags.length)
        console.log(`🏷️ [useContatoData] ${chatId} - Tags raw:`, tagsData)
        console.log(`🏷️ [useContatoData] ${chatId} - Tags processadas:`, tags)
        
        // Verificar se há tags "padrão" sendo retornadas incorretamente
        if (tags.length > 0) {
          tags.forEach((tag, index) => {
            console.log(`🏷️ [useContatoData] ${chatId} - Tag ${index}:`, {
              id: tag.id,
              nome: tag.nome,
              cor: tag.cor
            })
          })
        }
      } else {
        console.log(`🏷️ [useContatoData] ${chatId} - Sem tags - Response OK: ${tagsResponse?.ok}`)
        console.log(`🏷️ [useContatoData] ${chatId} - Response status:`, tagsResponse?.status)
        console.log(`🏷️ [useContatoData] ${chatId} - Response statusText:`, tagsResponse?.statusText)
      }

      // Processar orçamentos
      let orcamento = null
      if (orcamentosResponse?.ok) {
        const orcamentos = await orcamentosResponse.json()
        if (orcamentos.length > 0) {
          orcamento = {
            valor: orcamentos[0].valor || orcamentos[0].valorTotal || 0,
            status: orcamentos[0].status
          }
          console.log(`💰 [useContatoData] ${chatId} - Orçamento encontrado:`, orcamento.valor)
        }
      }

      // Processar agendamentos
      let agendamento = null
      if (agendamentosResponse?.ok) {
        const agendamentos = await agendamentosResponse.json()
        if (agendamentos.length > 0) {
          agendamento = {
            data: agendamentos[0].data_agendamento || agendamentos[0].data,
            status: agendamentos[0].status
          }
          console.log(`📅 [useContatoData] ${chatId} - Agendamento encontrado:`, agendamento.data)
        }
      }

      const result = {
        id: contatoData.id,
        fila: contatoData.fila ? {
          id: contatoData.fila.id,
          nome: contatoData.fila.nome,
          cor: contatoData.fila.cor
        } : undefined,
        tags,
        atendente: contatoData.atendente,
        kanbanBoard: contatoData.kanbanBoard,
        orcamento,
        agendamento
      }

      console.log(`✅ [useContatoData] ${chatId} - Dados completos:`, {
        id: result.id,
        tagsCount: result.tags?.length || 0,
        hasOrcamento: !!result.orcamento,
        hasAgendamento: !!result.agendamento
      })

      return result
    } catch (err) {
      console.error('❌ [useContatoData] Erro ao buscar dados do contato:', err)
      return null
    }
  }

  const loadContatosData = async () => {
    // Filtrar apenas chatIds que ainda não foram carregados
    const pendingChatIds = chatIds.filter(id => !contatos[id] && !loading && id.trim() !== '')
    
    console.log(`🔍 [useContatoData] loadContatosData - Total: ${chatIds.length}, Pendentes: ${pendingChatIds.length}`)
    
    if (pendingChatIds.length === 0) {
      console.log(`⚠️ [useContatoData] Nenhum chatId pendente, saindo...`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Processar apenas os chatIds pendentes em paralelo
      const promises = pendingChatIds.map(chatId => fetchContatoData(chatId))
      const results = await Promise.all(promises)

      // Salvar resultados no estado
      const newContatos: { [chatId: string]: ContatoData | null } = {}
      pendingChatIds.forEach((chatId, index) => {
        const result = results[index]
        if (result) {
          console.log(`✅ [useContatoData] Salvando dados para ${chatId}:`, result)
          newContatos[chatId] = result
        } else {
          console.log(`❌ [useContatoData] Sem dados para ${chatId}`)
          newContatos[chatId] = null
        }
      })

      setContatos(prev => ({
        ...prev,
        ...newContatos
      }))
    } catch (err) {
      console.error('❌ [useContatoData] Erro geral:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const refreshContato = async (chatId: string) => {
    const data = await fetchContatoData(chatId)
    if (data) {
      setContatos(prev => ({
        ...prev,
        [chatId]: data
      }))
    }
  }

  useEffect(() => {
    console.log(`🔄 [useContatoData] useEffect disparado, chatIds:`, chatIds)
    
    // Evitar requests duplicados - só carregar se há chatIds novos
    const newChatIds = chatIds.filter(id => !contatos[id] && id.trim() !== '')
    if (newChatIds.length === 0) {
      console.log(`⏭️ [useContatoData] Nenhum chatId novo para carregar`)
      return
    }
    
    // Debounce para evitar requests múltiplos rápidos
    const timeoutId = setTimeout(() => {
      loadContatosData()
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [chatIds.join(',')])

  return {
    contatos,
    loading,
    error,
    refreshContato
  }
}
