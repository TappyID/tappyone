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
  assinatura?: {
    id: string
    valor: number
    status: string
    descricao: string
  }
  tickets?: {
    id: string
    titulo: string
    status: string
    prioridade: string
  }[]
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
  
  // Cache global com TTL de 2 minutos
  const CACHE_TTL = 2 * 60 * 1000
  const [cache, setCache] = useState<{ [key: string]: { data: ContatoData | null, timestamp: number } }>({})

  const fetchContatoData = async (chatId: string) => {
    if (!chatId || chatId.trim() === '') {
      console.log(`⚠️ [useContatoData] ChatId vazio ou inválido: "${chatId}"`)
      return null
    }

    // Verificar cache primeiro
    const cached = cache[chatId]
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`💾 [useContatoData] Cache hit para ${chatId}`)
      return cached.data
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
      const [tagsResponse, orcamentosResponse, agendamentosResponse, assinaturasResponse, ticketsResponse] = await Promise.all([
        fetch(`/api/contatos/${contatoData.id}/tags`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null),
        
        fetch(`/api/orcamentos?contato_id=${numeroTelefone}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null),
        
        fetch(`/api/agendamentos?contato_id=${numeroTelefone}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null),
        
        fetch(`/api/assinaturas?contato_id=${numeroTelefone}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null),
        
        fetch(`/api/tickets?contato_id=${numeroTelefone}`, {
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

      // Processar assinaturas
      let assinatura = null
      if (assinaturasResponse?.ok) {
        const assinaturasData = await assinaturasResponse.json()
        if (Array.isArray(assinaturasData) && assinaturasData.length > 0) {
          const assinaturasAtivas = assinaturasData.filter(a => a.status === 'ATIVA' || a.status === 'ATIVO')
          if (assinaturasAtivas.length > 0) {
            assinatura = {
              id: assinaturasAtivas[0].id,
              valor: assinaturasAtivas[0].valor || 0,
              status: assinaturasAtivas[0].status,
              descricao: assinaturasAtivas[0].descricao || assinaturasAtivas[0].nome || 'Assinatura'
            }
            console.log(`📝 [useContatoData] ${chatId} - Assinatura encontrada:`, assinatura.descricao)
          }
        }
      }

      // Processar tickets
      let tickets = null
      if (ticketsResponse?.ok) {
        const ticketsData = await ticketsResponse.json()
        if (Array.isArray(ticketsData) && ticketsData.length > 0) {
          tickets = ticketsData.map(ticket => ({
            id: ticket.id,
            titulo: ticket.titulo,
            status: ticket.status,
            prioridade: ticket.prioridade
          }))
          console.log(`🎫 [useContatoData] ${chatId} - Tickets encontrados:`, tickets.length)
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
        agendamento,
        assinatura,
        tickets
      }

      console.log(`✅ [useContatoData] ${chatId} - Dados completos:`, {
        id: result.id,
        tagsCount: result.tags?.length || 0,
        hasOrcamento: !!result.orcamento,
        hasAgendamento: !!result.agendamento,
        hasAssinatura: !!result.assinatura,
        ticketsCount: result.tickets?.length || 0
      })

      // Salvar no cache
      setCache(prev => ({
        ...prev,
        [chatId]: { data: result, timestamp: Date.now() }
      }))

      return result
    } catch (err) {
      console.error('❌ [useContatoData] Erro ao buscar dados do contato:', err)
      return null
    }
  }

  const loadContatosData = async () => {
    // Filtrar apenas chatIds que ainda não foram carregados e não estão em cache válido
    const pendingChatIds = chatIds.filter(id => {
      if (!id || id.trim() === '') return false
      if (contatos[id]) return false
      
      const cached = cache[id]
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        // Se está em cache válido, usar direto
        setContatos(prev => ({ ...prev, [id]: cached.data }))
        return false
      }
      return true
    })
    
    if (pendingChatIds.length === 0) return

    setLoading(true)
    setError(null)

    try {
      // OTIMIZAÇÃO: Processar em lotes menores para evitar sobrecarga
      const BATCH_SIZE = 5
      const batches = []
      for (let i = 0; i < pendingChatIds.length; i += BATCH_SIZE) {
        batches.push(pendingChatIds.slice(i, i + BATCH_SIZE))
      }

      // Processar lotes sequencialmente para evitar muitas requests simultâneas
      for (const batch of batches) {
        const promises = batch.map(chatId => fetchContatoData(chatId))
        const results = await Promise.all(promises)

        // Salvar resultados do lote
        const newContatos: { [chatId: string]: ContatoData | null } = {}
        batch.forEach((chatId, index) => {
          const result = results[index]
          newContatos[chatId] = result
        })

        setContatos(prev => ({
          ...prev,
          ...newContatos
        }))

        // Pequena pausa entre lotes para não sobrecarregar o servidor
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
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
