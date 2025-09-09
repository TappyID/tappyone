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
  assinaturas: any[]
  anotacoes: any[]
}

export interface OptimizedKanbanData {
  cards: { [cardId: string]: CardData }
  columnStats: ColumnStats
  loading: boolean
  error: string | null
}

// Cache global para dados do Kanban - evita re-fetches desnecessários
const kanbanCache = new Map<string, {
  data: OptimizedKanbanData
  timestamp: number
  ttl: number
}>()

const CACHE_TTL = 2 * 60 * 1000 // 2 minutos
const PREFETCH_DELAY = 5000 // 5 segundos para prefetch

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
      console.log('🚀 Cache HIT para Kanban:', key)
      return cached.data
    }
    if (cached) {
      kanbanCache.delete(key)
      console.log('🗑️ Cache expirado removido:', key)
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
    console.log('💾 Cache SALVO para Kanban:', key)
  }, [])

  // Buscar dados otimizados com batch API
  const fetchOptimizedData = useCallback(async (background = false): Promise<OptimizedKanbanData> => {
    const token = getAuthToken()
    if (!token) {
      throw new Error('Token não encontrado')
    }

    const cacheKey = `kanban-${quadroId}`
    
    // Verificar cache primeiro
    const cachedData = getCachedData(cacheKey)
    if (cachedData && !background) {
      return cachedData
    }

    if (!background) {
      setData(prev => ({ ...prev, loading: true, error: null }))
    } else {
      setPrefetching(true)
    }

    try {
      console.log('🚀 Iniciando fetch otimizado para quadro:', quadroId)
      
      // Buscar dados do quadro com colunas e cards
      const quadroResponse = await fetch(`/api/kanban/quadros/${quadroId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!quadroResponse.ok) {
        throw new Error(`Erro ao buscar quadro: ${quadroResponse.status}`)
      }

      const quadroData = await quadroResponse.json()
      
      // Extrair todos os IDs de cards para batch request
      const allCardIds: string[] = []
      quadroData.colunas?.forEach((col: any) => {
        col.cards?.forEach((card: any) => {
          allCardIds.push(card.id)
        })
      })

      console.log('📊 Total de cards para buscar dados:', allCardIds.length)

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

      // Batch request para todos os dados dos cards
      const batchPromises = [
        // Buscar orçamentos em batch
        fetch('/api/orcamentos/batch', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ cardIds: allCardIds })
        }),
        
        // Buscar agendamentos em batch
        fetch('/api/agendamentos/batch', {
          method: 'POST', 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ cardIds: allCardIds })
        })
      ]

      const [orcamentosRes, agendamentosRes] = await Promise.all(batchPromises)
      
      // Processar orçamentos
      let orcamentosData: { [cardId: string]: any[] } = {}
      if (orcamentosRes.ok) {
        orcamentosData = await orcamentosRes.json()
      } else {
        console.warn('⚠️ Erro ao buscar orçamentos em batch:', orcamentosRes.status)
      }

      // Processar agendamentos  
      let agendamentosData: { [cardId: string]: any[] } = {}
      if (agendamentosRes.ok) {
        agendamentosData = await agendamentosRes.json()
      } else {
        console.warn('⚠️ Erro ao buscar agendamentos em batch:', agendamentosRes.status)
      }

      // Construir dados otimizados
      const cards: { [cardId: string]: CardData } = {}
      const columnStats: ColumnStats = {}

      // Processar dados por card
      allCardIds.forEach(cardId => {
        cards[cardId] = {
          id: cardId,
          orcamentos: orcamentosData[cardId] || [],
          agendamentos: agendamentosData[cardId] || [],
          assinaturas: [], // TODO: Implementar quando necessário
          anotacoes: []    // TODO: Implementar quando necessário
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
      
      console.log('✅ Dados otimizados carregados:', {
        totalCards: Object.keys(cards).length,
        totalColumns: Object.keys(columnStats).length,
        cacheKey
      })

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
  }, [quadroId, getAuthToken, getCachedData, setCachedData])

  // Função para refresh forçado (limpa cache)
  const forceRefresh = useCallback(async () => {
    const cacheKey = `kanban-${quadroId}`
    kanbanCache.delete(cacheKey)
    console.log('🔄 Cache limpo, forçando refresh...')
    
    const freshData = await fetchOptimizedData()
    setData(freshData)
  }, [quadroId, fetchOptimizedData])

  // Prefetch em background após delay
  useEffect(() => {
    if (!data.loading && Object.keys(data.cards).length > 0) {
      const prefetchTimer = setTimeout(() => {
        console.log('🔄 Iniciando prefetch em background...')
        fetchOptimizedData(true)
      }, PREFETCH_DELAY)

      return () => clearTimeout(prefetchTimer)
    }
  }, [data.loading, data.cards, fetchOptimizedData])

  // Carregar dados iniciais
  useEffect(() => {
    if (quadroId) {
      fetchOptimizedData().then(setData)
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
