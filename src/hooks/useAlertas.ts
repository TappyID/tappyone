import { useState, useEffect } from 'react'

export interface Alerta {
  id: string
  titulo: string
  descricao: string
  tipo: 'sistema' | 'usuario' | 'seguranca' | 'performance' | 'integracao'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  status: 'ativo' | 'pausado' | 'resolvido'
  cor: string
  icone: string
  criadoEm: string
  atualizadoEm: string
  configuracoes: {
    emailNotificacao: boolean
    whatsappNotificacao: boolean
    dashboardNotificacao: boolean
    frequencia: 'imediata' | 'horaria' | 'diaria' | 'semanal'
    destinatarios: string[]
    condicoes: {
      metrica: string
      operador: '>' | '<' | '=' | '>=' | '<=' | '!='
      valor: number | string
    }[]
  }
  estatisticas: {
    totalDisparos: number
    disparosHoje: number
    ultimoDisparo: string | null
    taxaResolucao: number
  }
}

export const useAlertas = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Token de autenticação não encontrado')
    }

    const response = await fetch(`/api${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  const fetchAlertas = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🚨 [HOOK] Buscando alertas...')
      const data = await makeAuthenticatedRequest('/alertas')
      console.log('🚨 [HOOK] Alertas carregados:', data?.data?.length || 0)
      setAlertas(Array.isArray(data?.data) ? data.data : [])
    } catch (err) {
      console.error('❌ [HOOK] Erro ao buscar alertas:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar alertas')
      setAlertas([])
    } finally {
      setLoading(false)
    }
  }

  const createAlerta = async (alertaData: Omit<Alerta, 'id' | 'criadoEm' | 'atualizadoEm' | 'estatisticas'>) => {
    try {
      console.log('🚨 [HOOK] Criando novo alerta:', alertaData)
      const data = await makeAuthenticatedRequest('/alertas', {
        method: 'POST',
        body: JSON.stringify(alertaData),
      })
      console.log('🚨 [HOOK] Alerta criado:', data)
      await fetchAlertas() // Recarrega a lista
      return data
    } catch (err) {
      console.error('❌ [HOOK] Erro ao criar alerta:', err)
      throw err
    }
  }

  const updateAlerta = async (id: string, alertaData: Partial<Alerta>) => {
    try {
      console.log('🚨 [HOOK] Atualizando alerta:', { id, ...alertaData })
      const data = await makeAuthenticatedRequest(`/alertas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(alertaData),
      })
      console.log('🚨 [HOOK] Alerta atualizado:', data)
      await fetchAlertas() // Recarrega a lista
      return data
    } catch (err) {
      console.error('❌ [HOOK] Erro ao atualizar alerta:', err)
      throw err
    }
  }

  const deleteAlerta = async (id: string) => {
    try {
      console.log('🚨 [HOOK] Deletando alerta:', id)
      await makeAuthenticatedRequest(`/alertas/${id}`, {
        method: 'DELETE',
      })
      console.log('🚨 [HOOK] Alerta deletado com sucesso')
      await fetchAlertas() // Recarrega a lista
    } catch (err) {
      console.error('❌ [HOOK] Erro ao deletar alerta:', err)
      throw err
    }
  }

  const toggleStatus = async (id: string, status: Alerta['status']) => {
    try {
      console.log('🚨 [HOOK] Alterando status do alerta:', { id, status })
      const data = await makeAuthenticatedRequest(`/alertas/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      console.log('🚨 [HOOK] Status alterado:', data)
      await fetchAlertas() // Recarrega a lista
      return data
    } catch (err) {
      console.error('❌ [HOOK] Erro ao alterar status:', err)
      throw err
    }
  }

  const getAlertaById = async (id: string): Promise<Alerta> => {
    try {
      console.log('🚨 [HOOK] Buscando alerta por ID:', id)
      const data = await makeAuthenticatedRequest(`/alertas/${id}`)
      console.log('🚨 [HOOK] Alerta encontrado:', data)
      return data.data
    } catch (err) {
      console.error('❌ [HOOK] Erro ao buscar alerta por ID:', err)
      throw err
    }
  }

  const getHistoricoAlerta = async (id: string, limit = 50) => {
    try {
      console.log('🚨 [HOOK] Buscando histórico do alerta:', id)
      const data = await makeAuthenticatedRequest(`/alertas/${id}/historico?limit=${limit}`)
      console.log('🚨 [HOOK] Histórico carregado:', data)
      return data.data
    } catch (err) {
      console.error('❌ [HOOK] Erro ao buscar histórico:', err)
      throw err
    }
  }

  const getEstatisticas = async () => {
    try {
      console.log('🚨 [HOOK] Buscando estatísticas dos alertas...')
      const data = await makeAuthenticatedRequest('/alertas/stats')
      console.log('🚨 [HOOK] Estatísticas carregadas:', data)
      return data.data
    } catch (err) {
      console.error('❌ [HOOK] Erro ao buscar estatísticas:', err)
      throw err
    }
  }

  // Função utilitária para filtrar alertas por tipo
  const getAlertasByTipo = (tipo: Alerta['tipo']) => {
    return alertas.filter(alerta => alerta.tipo === tipo && alerta.status === 'ativo')
  }

  // Função utilitária para alertas críticos ativos
  const getAlertasCriticos = () => {
    return alertas.filter(alerta => alerta.prioridade === 'critica' && alerta.status === 'ativo')
  }

  // Função utilitária para obter cor do alerta por prioridade
  const getCorPorPrioridade = (prioridade: Alerta['prioridade']) => {
    const cores = {
      'baixa': '#10B981',
      'media': '#F59E0B', 
      'alta': '#EF4444',
      'critica': '#DC2626'
    }
    return cores[prioridade] || '#6B7280'
  }

  useEffect(() => {
    fetchAlertas()
  }, [])

  return {
    alertas,
    loading,
    error,
    fetchAlertas,
    createAlerta,
    updateAlerta,
    deleteAlerta,
    toggleStatus,
    getAlertaById,
    getHistoricoAlerta,
    getEstatisticas,
    getAlertasByTipo,
    getAlertasCriticos,
    getCorPorPrioridade
  }
}
