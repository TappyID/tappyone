'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

export interface KanbanStats {
  totalOrcamentos: number
  totalAgendamentos: number
  totalValor: number
  totalAssinaturas: number
  totalAnotacoes: number
}

export interface ColumnStats {
  [columnId: string]: KanbanStats
}

export interface CardData {
  id: string
  orcamentos: any[]
  agendamentos: any[]
  tags: any[]
  tickets: any[]
  atendentes: any[]
  filas: any[]
  agentes: any[]
  assinaturas: any[]
  anotacoes: any[]
  contato: any
  fila?: {
    id: string
    nome: string
    cor?: string
  } | null
  filaNome?: string | null
  // Dados do chatLead para badges
  chatLead?: any | null
  status?: string | null
  responsavel?: string | null
  responsavelNome?: string | null
}

export interface OptimizedKanbanData {
  cards: { [cardId: string]: CardData }
  columnStats: ColumnStats
  loading: boolean
  error: string | null
}

// Cache global para dados do Kanban
const kanbanCache = new Map<string, {
  data: OptimizedKanbanData
  timestamp: number
  ttl: number
}>()

const CACHE_TTL = 2 * 60 * 1000 // 2 minutos

export function useKanbanOptimized(quadroId: string, whatsappChats: any[] = []) {
  const [data, setData] = useState<OptimizedKanbanData>({
    cards: {},
    columnStats: {},
    loading: true,
    error: null
  })

  const [prefetching, setPrefetching] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Função para buscar token
  const getAuthToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }, [])

  // Verificar cache antes de fazer request
  const getCachedData = useCallback((key: string): OptimizedKanbanData | null => {
    const cached = kanbanCache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    if (cached) {
      kanbanCache.delete(key)
    }
    return null
  }, [])

  // Salvar no cache
  const setCachedData = useCallback((key: string, data: OptimizedKanbanData) => {
    kanbanCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    })
  }, [])

  // Buscar dados otimizados com batch API
  const fetchOptimizedData = useCallback(async (background = false) => {
    let token = localStorage.getItem('token')
    if (!token) {
      token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]
    }
    
    if (!token) {
      const emptyData: OptimizedKanbanData = {
        cards: {},
        columnStats: {},
        loading: false,
        error: 'Token de autenticação não encontrado'
      }
      return emptyData
    }

    if (!background) {
      setData(prev => ({ ...prev, loading: true }))
    }

    try {
      // Limpar cache para forçar reload dos dados reais
      const cacheKey = `kanban-${quadroId}`
      kanbanCache.delete(cacheKey) // Força reload

      if (!background) {
        setData(prev => ({ ...prev, loading: true, error: null }))
      } else {
        setPrefetching(true)
      }
      
      // Buscar dados do quadro
      const quadroResponse = await fetch(`/api/kanban/quadros/${quadroId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!quadroResponse.ok) {
        const errorText = await quadroResponse.text()
        throw new Error(`Erro ao buscar quadro: ${quadroResponse.status} - ${errorText}`)
      }

      const quadroData = await quadroResponse.json()
      
      // 🔥 SINCRONIZAÇÃO AUTOMÁTICA: Buscar cards do banco + chats do WhatsApp
      const cardsNoBanco = new Map<string, any>()
      quadroData.colunas?.forEach((coluna: any, colunaIndex: number) => {
        coluna.cards?.forEach((card: any) => {
          if (card.conversaId) {
            cardsNoBanco.set(card.conversaId, {
              ...card,
              colunaId: coluna.id,
              colunaIndex
            })
          }
        })
      })
      
      console.log('📋 [useKanbanOptimized] Cards no banco:', cardsNoBanco.size)
      console.log('📱 [useKanbanOptimized] Chats do WhatsApp:', whatsappChats.length)
      
      // ✅ Identificar novos chats (que estão no WhatsApp mas não no banco)
      const novosChats: any[] = []
      whatsappChats.forEach((chat: any) => {
        if (!cardsNoBanco.has(chat.id)) {
          novosChats.push(chat)
        }
      })
      
      console.log('🆕 [useKanbanOptimized] Novos chats para salvar:', novosChats.length)
      
      // 💾 Salvar automaticamente os novos chats no banco (na primeira coluna)
      if (novosChats.length > 0 && quadroData.colunas && quadroData.colunas.length > 0) {
        const primeiraColuna = quadroData.colunas[0]
        
        // Criar cards em batch para os novos chats
        const cardsParaCriar = novosChats.map((chat: any) => ({
          conversaId: chat.id,
          colunaId: primeiraColuna.id,
          posicao: (primeiraColuna.cards?.length || 0) + novosChats.indexOf(chat)
        }))
        
        try {
          setSyncing(true)
          const createResponse = await fetch(`/api/kanban/quadros/${quadroId}/cards/batch`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cards: cardsParaCriar })
          })
          
          if (createResponse.ok) {
            const novosCardsData = await createResponse.json()
            console.log('✅ [useKanbanOptimized] Novos cards criados:', novosCardsData.cards?.length || 0)
            
            // Adicionar ao mapa de cards no banco
            novosCardsData.cards?.forEach((card: any) => {
              cardsNoBanco.set(card.conversaId, {
                ...card,
                colunaId: primeiraColuna.id,
                colunaIndex: 0
              })
            })
          } else {
            console.error('❌ Erro ao criar cards em batch:', createResponse.status)
          }
        } catch (error) {
          console.error('❌ Erro ao sincronizar novos chats:', error)
        } finally {
          setSyncing(false)
        }
      }
      
      // 🔄 Usar TODOS os chats (do banco + novos sincronizados)
      const cardIds: string[] = Array.from(cardsNoBanco.keys())
      console.log('📋 [useKanbanOptimized] Total de cards após sincronização:', cardIds.length)
      
      // 🔥 Enriquecer com dados do WhatsApp
      const whatsappChatsMap = new Map(whatsappChats.map((chat: any) => [chat.id, chat]))
      
      // Converter IDs em formato de cards, usando dados do WhatsApp quando disponível
      const cardsData: any[] = cardIds.map(chatId => {
        const whatsappChat = whatsappChatsMap.get(chatId)
        const cardDoBanco = cardsNoBanco.get(chatId)
        
        return {
          id: chatId,
          numeroTelefone: chatId.replace('@c.us', '').replace('@g.us', ''),
          nome: whatsappChat?.name || cardDoBanco?.nome || chatId,
          profilePicUrl: whatsappChat?.image,
          lastMessage: whatsappChat?.lastMessage,
          unreadCount: whatsappChat?.unreadCount,
          colunaId: cardDoBanco?.colunaId,
          colunaIndex: cardDoBanco?.colunaIndex
        }
      })
      
      // Filtrar cards inválidos
      const validCards = cardsData.filter((card: any) => {
          const numero = card.numeroTelefone
          const isValid = numero && 
                         numero !== 'undefined' && 
                         numero !== '0' && 
                         numero.length >= 10 && 
                         /^\d+$/.test(numero)
          
          if (!isValid) {
            console.log('❌ CARD INVÁLIDO FILTRADO:', {
              id: card.id,
              numeroTelefone: numero
            })
          }
          
          return isValid
        })
        .map((contato: any) => {
          const numeroTelefone = contato.numeroTelefone
          const chatId = contato.id // Manter o ID original
          
          return {
            id: chatId, // ✅ ADICIONAR O ID!
            conversa_id: chatId,
            contato_id: numeroTelefone,
            nome: contato.nome || `Contato ${numeroTelefone}`,
            ultima_mensagem: 'Conversa WhatsApp',
            contato: contato
          }
        })
      
      // Preparar IDs para batch requests
      const allCardIds: string[] = []
      const cardContactMapping: { [cardId: string]: string } = {}
      
      validCards.forEach((card: any) => {
        const chatId = card.id
        allCardIds.push(chatId)
        if (card.contato_id) {
          cardContactMapping[chatId] = card.contato_id
        } else {
          const phoneNumber = card.numeroTelefone
          cardContactMapping[chatId] = phoneNumber
        }
      })
      
      // Adicionar cards às colunas - distribuir contatos na primeira coluna
      if (quadroData.colunas && quadroData.colunas.length > 0) {
        // Colocar todos os contatos na primeira coluna por padrão
        quadroData.colunas[0].cards = validCards.map((card: any) => ({
          id: card.id,
          nome: card.nome,
          conversa_id: card.id,
          contato_id: card.contato_id || null
        }))
        
        // Limpar outras colunas (podem ter cards antigos)
        for (let i = 1; i < quadroData.colunas.length; i++) {
          quadroData.colunas[i].cards = []
        }
      }

      // Se não há cards, retornar dados vazios
      if (allCardIds.length === 0) {
        const emptyData: OptimizedKanbanData = {
          cards: {},
          columnStats: {},
          loading: false,
          error: null
        }
        setCachedData(cacheKey, emptyData)
        return emptyData
      }

      // Batch request para orçamentos, agendamentos, assinaturas, anotações, contatos e agentes
      console.log('🚀 [DEBUG] Iniciando Promise.all com 6 requests incluindo agentes')
      const [orcamentosResponse, agendamentosResponse, assinaturasResponse, anotacoesResponse, contatosBatchResponse, agentesResponse] = await Promise.all([
        fetch('/api/orcamentos/batch', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            cardIds: allCardIds,
            cardContactMapping: cardContactMapping 
          })
        }),
        
        fetch('/api/agendamentos/batch', {
          method: 'POST', 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            cardIds: allCardIds,
            cardContactMapping: cardContactMapping 
          })
        }),
        
        fetch('/api/assinaturas/batch', {
          method: 'POST', 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            cardIds: allCardIds,
            cardContactMapping: cardContactMapping 
          })
        }),
        
        fetch('/api/anotacoes/batch', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            cardIds: allCardIds,
            cardContactMapping: cardContactMapping 
          })
        }),
        
        fetch('/api/contatos/batch', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            cardIds: allCardIds,
            cardContactMapping: cardContactMapping 
          })
        }),

        fetch('/api/agentes/batch', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            cardIds: allCardIds,
            cardContactMapping: cardContactMapping 
          })
        })
      ])
      
      // Processar orçamentos
      let orcamentosData: { [cardId: string]: any[] } = {}
      if (orcamentosResponse.ok) {
        try {
          orcamentosData = await orcamentosResponse.json()
        } catch (error) {
        }
      }

      // Processar agendamentos  
      let agendamentosData: { [cardId: string]: any[] } = {}
      if (agendamentosResponse.ok) {
        try {
          agendamentosData = await agendamentosResponse.json()
        } catch (error) {
        }
      } else {
        console.error('❌ AGENDAMENTOS ERROR:', agendamentosResponse.status, await agendamentosResponse.text())
      }

      // Processar assinaturas
      let assinaturasData: { [cardId: string]: any[] } = {}
      console.log('🚨 DEBUG assinaturasResponse status:', assinaturasResponse.status)
      if (assinaturasResponse.ok) {
        try {
          assinaturasData = await assinaturasResponse.json()
          console.log('📝 ASSINATURAS OBTIDAS:', Object.keys(assinaturasData).length, 'cards')
        } catch (error) {
          console.error('💥 ERRO parsing assinaturas:', error)
        }
      } else {
        console.error('❌ ASSINATURAS ERROR:', assinaturasResponse.status, await assinaturasResponse.text())
      }

      // Processar anotações
      let anotacoesData: { [cardId: string]: any[] } = {}
      console.log('🚨 DEBUG anotacoesResponse status:', anotacoesResponse.status)
      if (anotacoesResponse.ok) {
        try {
          anotacoesData = await anotacoesResponse.json()
          console.log('📝 ANOTAÇÕES OBTIDAS:', Object.keys(anotacoesData).length, 'cards')
        } catch (error) {
          console.error('💥 ERRO parsing anotações:', error)
        }
      } else {
        console.error('❌ ANOTAÇÕES ERROR:', anotacoesResponse.status, await anotacoesResponse.text())
      }

      // Processar contatos batch
      let contatosBatchData: { [cardId: string]: any } = {}
      console.log('🚨🚨🚨 DEBUG CONTATOS BATCH - Status:', contatosBatchResponse.status)
      if (contatosBatchResponse.ok) {
        try {
          contatosBatchData = await contatosBatchResponse.json()
        
          
          // Debug específico das tags
          Object.keys(contatosBatchData).forEach(cardId => {
            const contato = contatosBatchData[cardId]
            console.log(`🔍🔍🔍 CARD ${cardId}:`, contato?.nome || 'sem nome')
            console.log(`🏷️🏷️🏷️ TAGS para ${cardId}:`, contato?.tags || 'sem tags')
          })
        } catch (error) {
          console.error('💥💥💥 ERRO parsing contatos batch:', error)
        }
      } else {
        console.error('❌❌❌ CONTATOS BATCH ERROR:', contatosBatchResponse.status, await contatosBatchResponse.text())
      }

      // Buscar tickets
      let ticketsData: { [cardId: string]: any[] } = {}
      const ticketsResponse = await fetch(`/api/tickets/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ card_ids: allCardIds })
      })

      console.log('🎫 TICKETS - Status:', ticketsResponse.status)
      if (ticketsResponse.ok) {
        try {
          ticketsData = await ticketsResponse.json()
        
        } catch (error) {
        
        }
      } else {
       
      }

      // Processar agentes
      let agentesData: { [cardId: string]: any[] } = {}
     
      
      if (agentesResponse.ok) {
        try {
          agentesData = await agentesResponse.json()
         
        } catch (error) {
          console.error('💥 ERRO parsing agentes:', error)
        }
      } else {
        const errorText = await agentesResponse.text()
     
      }

      // Dados não implementados ainda
      let atendentesData: { [cardId: string]: any[] } = {}
      let filasData: { [cardId: string]: any[] } = {}

      // Construir dados otimizados
      const cards: { [cardId: string]: CardData } = {}
      const columnStats: ColumnStats = {}

  
      // Buscar chat_leads em BATCH (endpoint /api/chats/batch/leads - linha 482 router)
      let chatLeadsMap: { [cardId: string]: any } = {}
      try {
        const chatLeadsResponse = await fetch('/api/chats/batch/leads', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ cardIds: allCardIds })
        })
        
        if (chatLeadsResponse.ok) {
          const data = await chatLeadsResponse.json()
          chatLeadsMap = data.data || data || {}
          console.log('📊 [KANBAN-FILA] Chat leads batch:', Object.keys(chatLeadsMap).length, 'encontrados')
          console.log('🔍 [KANBAN-FILA] Dados dos leads:', chatLeadsMap)
          // Mostrar fila_id de cada lead
          Object.entries(chatLeadsMap).forEach(([chatId, lead]: [string, any]) => {
            console.log(`  - ${chatId.slice(0, 15)}: fila_id=${lead?.fila_id || lead?.FilaID || 'NULL'}`)
          })
        }
      } catch (error) {
        console.log('❌ [KANBAN-FILA] Erro ao buscar leads batch:', error)
      }
      
      // Buscar todas as filas
      let todasFilas: any[] = []
      try {
        const filasResponse = await fetch('/api/filas', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (filasResponse.ok) {
          const filasData = await filasResponse.json()
          todasFilas = filasData.data || filasData || []
          console.log('📋 [KANBAN-FILA] Filas disponíveis:', todasFilas.map(f => ({ id: f.id, nome: f.nome })))
          
          // Verificar qual fila tem o ID que está nos leads
          const filaComum = todasFilas.find(f => f.id === '0ea98670-9844-4803-847b-d9238497aad3')
          if (filaComum) {
            console.log('🎯 [KANBAN-FILA] Fila comum encontrada:', filaComum.nome)
          }
        }
      } catch {}
      
      console.log('🎯 [KANBAN] allCardIds para montar cards:', allCardIds)
      console.log('🎯 [KANBAN] chatLeadsMap:', chatLeadsMap)
      
      allCardIds.forEach(cardId => {
        // Pular se cardId for undefined
        if (!cardId) {
          console.log('⚠️ [KANBAN] cardId undefined, pulando...')
          return
        }
        
        const contatoInfo = contatosBatchData[cardId] || {}
        const chatLead = chatLeadsMap[cardId]
        
        console.log(`🔍 [CARD ${cardId.slice(0,15)}] chatLead:`, chatLead)
        
        // Buscar fila do chatLead.fila_id (backend retorna snake_case)
        let filaInfo = null
        const filaId = chatLead?.fila_id || chatLead?.FilaID
        if (filaId) {
          const fila = todasFilas.find(f => f.id === filaId)
          if (fila) {
            filaInfo = { id: fila.id, nome: fila.nome, cor: fila.cor }
            console.log(`✅ [KANBAN-FILA] Card ${cardId.slice(0, 15)} -> Fila: ${fila.nome}`)
          }
        }
        
        cards[cardId] = {
          id: cardId,
          orcamentos: orcamentosData[cardId] || [],
          agendamentos: agendamentosData[cardId] || [],
          tags: contatoInfo.tags || [],
          tickets: ticketsData[cardId] || [],
          atendentes: atendentesData[cardId] || [],
          filas: filasData[cardId] || [],
          agentes: agentesData[cardId] || [],
          assinaturas: assinaturasData[cardId] || [],
          anotacoes: anotacoesData[cardId] || [],
          contato: contatoInfo,
          // Fila do chat_lead (batch)
          fila: filaInfo,
          filaNome: filaInfo?.nome || null,
          // Dados do chatLead para badges
          chatLead: chatLead || null,
          status: chatLead?.status || null,
          responsavel: chatLead?.responsavel || null,
          responsavelNome: chatLead?.responsavelUser?.nome || null
        }
      })
      

      // Calcular estatísticas por coluna
      quadroData.colunas?.forEach((col: any) => {
        let totalOrcamentos = 0
        let totalAgendamentos = 0
        let totalValor = 0
        let totalAssinaturas = 0
        let totalAnotacoes = 0

        col.cards?.forEach((card: any) => {
          const cardData = cards[card.id]
          if (cardData) {
            totalOrcamentos += cardData.orcamentos.length
            totalAgendamentos += cardData.agendamentos.length
            totalAssinaturas += cardData.assinaturas.length
            totalAnotacoes += cardData.anotacoes.length
            
            // Somar valores dos orçamentos
            cardData.orcamentos.forEach((orc: any) => {
              totalValor += parseFloat(orc.valorTotal) || 0
            })
            
            // Somar valores das assinaturas
            cardData.assinaturas.forEach((ass: any) => {
              totalValor += parseFloat(ass.valor) || 0
            })
          }
        })

        columnStats[col.id] = {
          totalOrcamentos,
          totalAgendamentos, 
          totalValor,
          totalAssinaturas,
          totalAnotacoes
        }
      })

      const optimizedData: OptimizedKanbanData = {
        cards,
        columnStats,
        loading: false,
        error: null
      }

      // Salvar no cache
      setCachedData(cacheKey, optimizedData)
      

      return optimizedData

    } catch (error) {
      console.error('❌ Erro ao buscar dados otimizados:', error)
      const errorData: OptimizedKanbanData = {
        cards: {},
        columnStats: {},
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
      return errorData
    } finally {
      if (background) {
        setPrefetching(false)
      }
    }
  }, [quadroId]) // FIXME: Removendo dependências que causam loop

  // useEffect para carregar dados na montagem
  useEffect(() => {
    fetchOptimizedData().then(result => {
      setData(result)
    })
  }, [quadroId])

  // Função para refresh forçado (limpa cache)
  const forceRefresh = useCallback(async () => {
    const cacheKey = `kanban-${quadroId}`
    kanbanCache.delete(cacheKey)
    console.log('🗑️ [FORCE REFRESH] CACHE LIMPO para:', cacheKey)
    console.log('🔄 [FORCE REFRESH] Iniciando busca de dados frescos...')
    
    const freshData = await fetchOptimizedData()
    console.log('✅ [FORCE REFRESH] Dados frescos obtidos:', {
      cardsCount: Object.keys(freshData.cards).length,
      hasError: !!freshData.error,
      loading: freshData.loading
    })
    setData(freshData)
  }, [quadroId, fetchOptimizedData])

  // Limpar cache automaticamente ao inicializar
  useEffect(() => {
    const cacheKey = `kanban-${quadroId}`
    kanbanCache.delete(cacheKey)
    console.log('🔄 CACHE AUTO-LIMPO para:', cacheKey)
  }, [])

  // Carregar dados iniciais E recarregar quando whatsappChats mudar
  useEffect(() => {
    if (quadroId) {
      console.log('🔄 [useKanbanOptimized] Carregando com', whatsappChats.length, 'chats do WhatsApp')
      fetchOptimizedData()
        .then((result) => {
          setData(result)
        })
        .catch((error) => {
          setData(prev => ({ ...prev, loading: false, error: error.message }))
        })
    }
  }, [quadroId, whatsappChats.length, fetchOptimizedData]) // ✅ Reagir quando whatsappChats mudar

  // Memoizar estatísticas computadas para evitar recálculo
  const memoizedStats = useMemo(() => {
    return data.columnStats
  }, [data.columnStats])

  return {
    ...data,
    columnStats: memoizedStats,
    prefetching,
    forceRefresh,
    // Função helper para buscar dados de um card específico
    getCardData: useCallback((cardId: string) => data.cards[cardId] || null, [data.cards]),
    // Função helper para buscar stats de uma coluna específica  
    getColumnStats: useCallback((columnId: string) => memoizedStats[columnId] || {
      totalOrcamentos: 0,
      totalAgendamentos: 0,
      totalValor: 0,
      totalAssinaturas: 0,
      totalAnotacoes: 0
    }, [memoizedStats])
  }
}
