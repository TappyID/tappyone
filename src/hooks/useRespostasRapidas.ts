import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './useAuth'

export interface CategoriaResposta {
  id: string
  nome: string
  descricao?: string
  cor: string
  ordem: number
  ativo: boolean
  usuario_id: string
  created_at: string
  updated_at: string
}

export interface AcaoResposta {
  id: string
  resposta_rapida_id: string
  tipo: 'texto' | 'imagem' | 'audio' | 'video' | 'arquivo' | 'pix' | 'delay'
  conteudo: any // JSON content
  ordem: number
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface RespostaRapida {
  id: string
  titulo: string
  descricao?: string
  categoria_id?: string
  categoria?: CategoriaResposta
  triggers: string[] // palavras-chave que ativam a resposta
  ativo: boolean
  trigger_tipo: 'manual' | 'primeira_mensagem' | 'palavra_chave' | 'horario' | 'intervalo'
  agendamento_ativo: boolean
  agendamento_config?: any // JSON config
  pausado: boolean
  ordem: number
  usuario_id: string
  acoes: AcaoResposta[]
  created_at: string
  updated_at: string
}

export interface EstatisticasResposta {
  total_categorias: number
  total_respostas: number
  respostas_ativas: number
  total_execucoes: number
  execucoes_hoje: number
}

export interface CreateRespostaRequest {
  titulo: string
  descricao?: string
  categoria_id?: string
  triggers: string[]
  ativo: boolean
  automatico: boolean
  fallback: boolean
  agendamento_ativo: boolean
  agendamento_config?: any
  acoes: Omit<AcaoResposta, 'id' | 'resposta_rapida_id' | 'created_at' | 'updated_at'>[]
}

export interface CreateCategoriaRequest {
  nome: string
  descricao?: string
  cor: string
  icone: string // Campo obrigatório no backend Go
  ordem?: number
}

export function useRespostasRapidas() {
  const { token } = useAuth()
  
  // Mock token temporário para desenvolvimento
  const effectiveToken = token || 'mock-token-dev'
  const [respostas, setRespostas] = useState<RespostaRapida[]>([])
  const [categorias, setCategorias] = useState<CategoriaResposta[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasResposta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const baseURL = '/api/respostas-rapidas' // Usar endpoint Next.js local

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    console.log(`API Call: ${options.method || 'GET'} ${baseURL}${endpoint}`)
    if (options.body) {
      console.log('Request body:', options.body)
    }
    
    const response = await fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveToken}`,
        ...options.headers,
      },
    })

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText || `HTTP ${response.status}` }
      }
      throw new Error(errorData.error || `HTTP ${response.status}: ${errorText}`)
    }

    return response.json()
  }, [effectiveToken, baseURL])

  const fetchRespostas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiCall('/')
      setRespostas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar respostas')
      console.error('Erro ao buscar respostas:', err)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const fetchCategorias = useCallback(async () => {
    console.log('[useRespostasRapidas] Iniciando fetchCategorias...')
    setLoading(true)
    try {
      // Backend Go usa endpoint /respostas-rapidas/categorias
      const categoriasURL = process.env.NODE_ENV === 'development' 
        ? 'http://159.65.34.199:8081/api/respostas-rapidas/categorias'
        : 'http://159.65.34.199:8081/api/respostas-rapidas/categorias'
      
      const response = await fetch(categoriasURL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      
      console.log('[fetchCategorias] Resposta da API:', response.status)
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('[fetchCategorias] Dados recebidos:', data)
      
      setCategorias(data || [])
      console.log('[fetchCategorias] Categorias definidas no estado')
      return data || []
    } catch (err: any) {
      console.error('[fetchCategorias] Erro:', err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [token])

  const fetchEstatisticas = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiCall('/estatisticas')
      setEstatisticas(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar estatísticas')
      console.error('Erro ao buscar estatísticas:', err)
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const createResposta = useCallback(async (data: CreateRespostaRequest) => {
    try {
      setLoading(true)
      setError(null)
      console.log('Hook createResposta - dados recebidos:', data)
      console.log('Hook createResposta - categoria_id original:', data.categoria_id)
      
      // Transformar dados para formato esperado pelo backend Go
      const backendData = {
        titulo: data.titulo,
        descricao: data.descricao || null,
        // REMOVER categoria_id - backend vai criar/usar categoria "Geral"
        agendamento_ativo: data.agendamento_ativo || false,
        trigger_tipo: data.automatico ? 'palavra_chave' : 'manual',
        trigger_condicao: {
          palavras_chave: data.triggers.filter(t => t.trim())
        },
        delay_segundos: 0,
        repetir: false,
        max_repeticoes: 1,
        aplicar_novos_contatos: true,
        aplicar_contatos_existentes: false,
        acoes: data.acoes.map((acao, index) => ({
          tipo: acao.tipo,
          conteudo: typeof acao.conteudo === 'string' 
            ? { texto: acao.conteudo } 
            : acao.conteudo,
          ordem: acao.ordem || index,
          ativo: acao.ativo !== false,
          delay_segundos: 0,
          obrigatorio: true,
          condicional: false
        }))
      }
      
      console.log('Hook createResposta - dados transformados para backend:', backendData)
      
      const response = await apiCall('/', {
        method: 'POST',
        body: JSON.stringify(backendData),
      })
      console.log('Hook createResposta - resposta da API:', response)
      // Recarregar lista após criar
      await fetchRespostas()
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar resposta')
      console.error('Erro ao criar resposta:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall, fetchRespostas])

  const updateResposta = useCallback(async (id: string, data: Partial<CreateRespostaRequest>) => {
    try {
      setLoading(true)
      setError(null)
      console.log('Hook updateResposta - ID:', id, 'Dados:', data)
      const response = await apiCall(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      console.log('Hook updateResposta - resposta da API:', response)
      // Recarregar lista após atualizar
      await fetchRespostas()
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar resposta')
      console.error('Erro ao atualizar resposta:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall, fetchRespostas])

  const deleteResposta = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      await apiCall(`/${id}`, {
        method: 'DELETE',
      })
      // Remove da lista local
      setRespostas(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir resposta')
      console.error('Erro ao excluir resposta:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const togglePauseResposta = useCallback(async (id: string, pausado: boolean) => {
    try {
      setLoading(true)
      setError(null)
      await apiCall(`/${id}/pausar`, {
        method: 'PUT',
        body: JSON.stringify({ pausado }),
      })
      // Atualiza na lista local
      setRespostas(prev => prev.map(r => 
        r.id === id ? { ...r, pausado } : r
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao pausar/despausar resposta')
      console.error('Erro ao pausar/despausar resposta:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  const executeResposta = useCallback(async (id: string, chatId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`[executeResposta] Executando via Next.js handler para ID: ${id}`)
      console.log(`[executeResposta] Chat ID: ${chatId}`)
      
      // Usar o handler Next.js que faz proxy para o backend
      const response = await fetch(`${baseURL}/${id}/executar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ chat_id: chatId }),
      })
      
      console.log(`[executeResposta] Status da resposta: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[executeResposta] Erro do servidor:', errorText)
        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`)
      }
      
      const result = await response.json()
      console.log('[executeResposta] Resposta executada com sucesso:', result)
      
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao executar resposta')
      console.error('Erro ao executar resposta:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [token, baseURL])

  const createCategoria = useCallback(async (data: CreateCategoriaRequest) => {
    console.log('[createCategoria] Dados originais recebidos:', data)
    
    try {
      setLoading(true)
      setError(null)
      
      // Garantir que icone esteja presente (obrigatório no backend Go)
      const categoriaData = {
        nome: data.nome,
        descricao: data.descricao || `Categoria ${data.nome}`,
        cor: data.cor,
        icone: data.icone || 'MessageCircle'
      }
      
      const categoriasURL = process.env.NODE_ENV === 'development' 
        ? 'http://159.65.34.199:8081/api/respostas-rapidas/categorias'
        : 'http://159.65.34.199:8081/api/respostas-rapidas/categorias'
      
      const bodyData = JSON.stringify(categoriaData)
      console.log('[createCategoria] Body JSON enviado:', bodyData)
      console.log('[createCategoria] URL de destino:', categoriasURL)
      console.log('[createCategoria] Token presente:', !!token)
      
      const response = await fetch(categoriasURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: bodyData,
      })
      
      console.log('[createCategoria] Status da resposta:', response.status)
      console.log('[createCategoria] Headers da resposta:', Object.fromEntries(response.headers))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[createCategoria] Erro do servidor:', errorText)
        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`)
      }
      
      const result = await response.json()
      console.log('[createCategoria] Categoria criada:', result)
      
      // Atualizar lista de categorias
      await fetchCategorias()
      
      return result
    } catch (err: any) {
      console.error('[createCategoria] Erro:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [token, fetchCategorias])

  const deleteCategoria = useCallback(async (id: string) => {
    console.log('[deleteCategoria] Iniciando exclusão da categoria:', id)
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`http://159.65.34.199:8081/api/respostas-rapidas/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log(' Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(' Erro na resposta:', errorText)
        throw new Error(`Erro ao excluir categoria: ${response.status} - ${errorText}`)
      }

      console.log(' Categoria excluída com sucesso')
      
      // Atualizar lista de categorias
      await fetchCategorias()
      
    } catch (error) {
      console.error(' Erro ao excluir categoria:', error)
      throw error
    }
  }, [token, fetchCategorias])

  const updateCategoria = useCallback(async (id: string, data: CreateCategoriaRequest) => {
    try {
      console.log(' Iniciando atualização da categoria:', id, data)
      
      const response = await fetch(`http://159.65.34.199:8081/api/respostas-rapidas/categorias/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log(' Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(' Erro na resposta:', errorText)
        throw new Error(`Erro ao atualizar categoria: ${response.status} - ${errorText}`)
      }

      console.log(' Categoria atualizada com sucesso')
      
      // Atualizar lista de categorias
      await fetchCategorias()
      
    } catch (error) {
      console.error(' Erro ao atualizar categoria:', error)
      throw error
    }
  }, [token, fetchCategorias])

  // Carregar dados automaticamente quando o hook for montado
  useEffect(() => {
    if (token) {
      fetchRespostas()
      fetchCategorias()
      fetchEstatisticas()
    }
  }, [token, fetchRespostas, fetchCategorias, fetchEstatisticas])

  return {
    respostas,
    categorias,
    estatisticas,
    loading,
    error,
    fetchRespostas,
    fetchCategorias,
    fetchEstatisticas,
    createResposta,
    updateResposta,
    deleteResposta,
    togglePauseResposta,
    executeResposta,
    createCategoria,
    deleteCategoria,
    updateCategoria,
  }
}
