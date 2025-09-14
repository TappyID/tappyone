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

export function useKanbanOptimized(quadroId: string) {
  const [data, setData] = useState<OptimizedKanbanData>({
    cards: {},
    columnStats: {},
    loading: true,
    error: null
  })

  const [prefetching, setPrefetching] = useState(false)

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
      // Verificar cache primeiro
      const cacheKey = `kanban-${quadroId}`
      const cachedData = getCachedData(cacheKey)
      if (cachedData && !background) {
        return cachedData
      }

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
      
      // Cards fixos para teste
      const knownCardIds = [
        "2349162389789@c.us",
        "5518981248008@c.us", 
        "5518991222983@c.us",
        "558004940140@c.us",
        "593993695740@c.us",
        "0@c.us",
        "5518997974883@c.us",
        "5518997200106@c.us"
      ]
      
      const cardsData: any[] = []
      knownCardIds.forEach(chatId => {
        cardsData.push({
          conversa_id: chatId,
          contato_id: chatId.replace('@c.us', ''),
          nome: `Chat ${chatId.slice(0, 10)}`,
          ultima_mensagem: 'Mensagem de teste'
        })
      })
      
      // Preparar IDs para batch requests
      const allCardIds: string[] = []
      const cardContactMapping: { [cardId: string]: string } = {}
      
      cardsData.forEach((card: any) => {
        allCardIds.push(card.conversa_id)
        if (card.contato_id) {
          cardContactMapping[card.conversa_id] = card.contato_id
        } else {
          const phoneNumber = card.conversa_id.replace('@c.us', '')
          cardContactMapping[card.conversa_id] = phoneNumber
        }
      })
      
      // Adicionar cards às colunas
      if (quadroData.colunas) {
        quadroData.colunas.forEach((col: any) => {
          col.cards = cardsData.filter((card: any) => card.coluna_id === col.id)
            .map((card: any) => ({
              id: card.conversa_id,
              nome: card.nome,
              conversa_id: card.conversa_id,
              contato_id: card.contato_id || null
            }))
        })
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

      // Batch request para orçamentos, agendamentos, assinaturas, anotações e contatos
      const [orcamentosResponse, agendamentosResponse, assinaturasResponse, anotacoesResponse, contatosResponse] = await Promise.all([
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
        })
      ])
      
      // Processar orçamentos
      let orcamentosData: { [cardId: string]: any[] } = {}
      console.log('🚨 DEBUG orcamentosResponse status:', orcamentosResponse.status)
      if (orcamentosResponse.ok) {
        try {
          orcamentosData = await orcamentosResponse.json()
          console.log('💰 ORCAMENTOS OBTIDOS:', Object.keys(orcamentosData).length, 'cards')
          console.log('💰 ORCAMENTOS DATA:', orcamentosData)
        } catch (error) {
          console.error('💥 ERRO parsing orçamentos:', error)
        }
      } else {
        console.error('❌ ORCAMENTOS ERROR:', orcamentosResponse.status, await orcamentosResponse.text())
      }

      // Processar agendamentos  
      let agendamentosData: { [cardId: string]: any[] } = {}
      console.log('🚨 DEBUG agendamentosResponse status:', agendamentosResponse.status)
      if (agendamentosResponse.ok) {
        try {
          agendamentosData = await agendamentosResponse.json()
          console.log('📅 AGENDAMENTOS OBTIDOS:', Object.keys(agendamentosData).length, 'cards')
        } catch (error) {
          console.error('💥 ERRO parsing agendamentos:', error)
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

      // Processar contatos
      let contatosData: { [cardId: string]: any } = {}
      console.log('🚨🚨🚨 DEBUG CONTATOS - Status:', contatosResponse.status)
      if (contatosResponse.ok) {
        try {
          contatosData = await contatosResponse.json()
          console.log('👤👤👤 CONTATOS OBTIDOS:', Object.keys(contatosData).length, 'cards')
          console.log('👤👤👤 CONTATOS DATA COMPLETA:', JSON.stringify(contatosData, null, 2))
          
          // Debug específico das tags
          Object.keys(contatosData).forEach(cardId => {
            const contato = contatosData[cardId]
            console.log(`🔍🔍🔍 CARD ${cardId}:`, contato?.nome || 'sem nome')
            console.log(`🏷️🏷️🏷️ TAGS para ${cardId}:`, contato?.tags || 'sem tags')
          })
        } catch (error) {
          console.error('💥💥💥 ERRO parsing contatos:', error)
        }
      } else {
        console.error('❌❌❌ CONTATOS ERROR:', contatosResponse.status, await contatosResponse.text())
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
          console.log('🎫 TICKETS OBTIDOS:', Object.keys(ticketsData).length, 'cards')
          console.log('🎫 TICKETS DATA:', ticketsData)
        } catch (error) {
          console.error('💥 ERRO parsing tickets:', error)
        }
      } else {
        console.error('❌ TICKETS ERROR:', ticketsResponse.status, await ticketsResponse.text())
      }

      // Buscar agentes
      let agentesData: { [cardId: string]: any[] } = {}
      const agentesResponse = await fetch(`/api/agentes/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ card_ids: allCardIds })
      })

      console.log('🤖 AGENTES - Status:', agentesResponse.status)
      if (agentesResponse.ok) {
        try {
          agentesData = await agentesResponse.json()
          console.log('🤖 AGENTES OBTIDOS:', Object.keys(agentesData).length, 'cards')
          console.log('🤖 AGENTES DATA:', agentesData)
        } catch (error) {
          console.error('💥 ERRO parsing agentes:', error)
        }
      } else {
        console.error('❌ AGENTES ERROR:', agentesResponse.status, await agentesResponse.text())
      }

      // Dados não implementados ainda
      let atendentesData: { [cardId: string]: any[] } = {}
      let filasData: { [cardId: string]: any[] } = {}

      // Construir dados otimizados
      const cards: { [cardId: string]: CardData } = {}
      const columnStats: ColumnStats = {}

      // Processar dados por card
      console.log(`🏷️ [HOOK DEBUG] Processando ${allCardIds.length} cards`, allCardIds)
      console.log(`🏷️ [HOOK DEBUG] contatosData completo:`, contatosData)
      
      allCardIds.forEach(cardId => {
        const contatoInfo = contatosData[cardId] || {}
        console.log(`🏷️ [HOOK DEBUG] Card ${cardId}:`, {
          contatoInfo,
          tags: contatoInfo.tags,
          hasContato: !!contatoInfo.id
        })
        
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
          contato: contatoInfo
        }
      })
      
      console.log(`🏷️ [HOOK DEBUG] Cards processados:`, cards)

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

  // Carregar dados iniciais
  useEffect(() => {
    if (quadroId) {
      fetchOptimizedData()
        .then((result) => {
          setData(result)
        })
        .catch((error) => {
          setData(prev => ({ ...prev, loading: false, error: error.message }))
        })
    }
  }, [quadroId, fetchOptimizedData])

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
