import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

// Tipos do sistema de atendimento
export interface ChatLead {
  id: string
  chatId: string
  status: 'aguardando' | 'atendimento' | 'em_atendimento' | 'finalizado'
  responsavel?: string
  filaId?: string
  conexaoSession?: string
  dataAceite?: string
  dataFinalizacao?: string
  createdAt: string
  updatedAt: string
  
  // Relacionamentos
  fila?: {
    id: string
    nome: string
    cor: string
  }
  responsavelUser?: {
    id: string
    nome: string
    email: string
  }
}

export interface AtendimentoStats {
  aguardando: number
  atendimento: number
  finalizado: number
  total: number
}

export const useAtendimentoStates = () => {
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<AtendimentoStats | null>(null)

  // 🆕 ACEITAR ATENDIMENTO
  const aceitarAtendimento = useCallback(async (chatId: string, filaId?: string) => {
    if (!user?.id || !token) throw new Error('Usuário não autenticado')
    const encodedChatId = encodeURIComponent(chatId)
    const response = await fetch(`/api/chats/${encodedChatId}/aceitar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        responsavelId: user.id,
        filaId: filaId || ''
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao aceitar atendimento')
    }

    const data = await response.json()
    console.log('✅ [ACEITAR] Atendimento aceito:', data)
    return data.data as ChatLead
  }, [user?.id, token])

  // 🏁 FINALIZAR ATENDIMENTO
  const finalizarAtendimento = useCallback(async (chatId: string) => {
    if (!token) throw new Error('Token não disponível')
    const encodedChatId = encodeURIComponent(chatId)
    const response = await fetch(`/api/chats/${encodedChatId}/finalizar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao finalizar atendimento')
    }

    const data = await response.json()
    console.log('✅ [FINALIZAR] Atendimento finalizado:', data)
    return data.data as ChatLead
  }, [token])

  // 🔄 TRANSFERIR ATENDIMENTO
  const transferirAtendimento = useCallback(async (
    chatId: string, 
    novoResponsavelId: string,
    novaFilaId?: string,
    motivo?: string
  ) => {
    if (!token) throw new Error('Token não disponível')
    const encodedChatId = encodeURIComponent(chatId)
    const response = await fetch(`/api/chats/${encodedChatId}/transferir`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        novoResponsavelId,
        novaFilaId: novaFilaId || '',
        motivo: motivo || ''
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao transferir atendimento')
    }

    const data = await response.json()
    console.log('✅ [TRANSFERIR] Atendimento transferido:', data)
    return data.data as ChatLead
  }, [token])

  // 📋 LISTAR CHATS POR STATUS
  const listarChatsPorStatus = useCallback(async (
    status: 'aguardando' | 'atendimento' | 'finalizado',
    filaId?: string,
    responsavelId?: string
  ) => {
    if (!token) throw new Error('Token não disponível')
    const params = new URLSearchParams()
    if (filaId) params.append('fila_id', filaId)
    if (responsavelId) params.append('responsavel_id', responsavelId)
    
    const url = `/api/chats/status/${status}${params.toString() ? '?' + params.toString() : ''}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao buscar chats')
    }

    const data = await response.json()
    console.log(`✅ [LISTAR] Chats ${status}:`, data.data.length)
    return data.data as ChatLead[]
  }, [token])

  // 📊 BUSCAR ESTATÍSTICAS
  const buscarEstatisticas = useCallback(async (
    filaId?: string,
    responsavelId?: string
  ) => {
    setLoading(true)
    try {
      if (!token) throw new Error('Token não disponível')
      const params = new URLSearchParams()
      if (filaId) params.append('fila_id', filaId)
      if (responsavelId) params.append('responsavel_id', responsavelId)
      
      const url = `/api/chats/stats${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar estatísticas')
      }

      const data = await response.json()
      setStats(data.data)
      return data.data as AtendimentoStats
    } finally {
      setLoading(false)
    }
  }, [token])

  // 🔍 BUSCAR STATUS DE UM CHAT ESPECÍFICO
  const buscarStatusChat = useCallback(async (chatId: string) => {
    try {
      if (!token) throw new Error('Token não disponível')
      const encodedChatId = encodeURIComponent(chatId)
      const response = await fetch(`/api/chats/${encodedChatId}/leads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.log(`ℹ️ [STATUS] Chat ${chatId} não tem lead`)
        return null
      }

      const data = await response.json()
      if (!data.data) return null
      
      console.log(`✅ [STATUS] Chat ${chatId}:`, data.data.status)
      return data.data as ChatLead
    } catch (error) {
      console.error(`❌ [STATUS] Erro ao buscar status do chat ${chatId}:`, error)
      return null
    }
  }, [token])

  // Auto-refresh das estatísticas a cada 30 segundos
  useEffect(() => {
    if (user?.id) {
      buscarEstatisticas()
      const interval = setInterval(() => {
        buscarEstatisticas()
      }, 30000) // 30 segundos

      return () => clearInterval(interval)
    }
  }, [user?.id, buscarEstatisticas])

  return {
    // Estados
    loading,
    stats,
    
    // Ações
    aceitarAtendimento,
    finalizarAtendimento,
    transferirAtendimento,
    listarChatsPorStatus,
    buscarEstatisticas,
    buscarStatusChat,
    
    // Utils
    isAdmin: user?.tipo === 'admin',
    currentUserId: user?.id
  }
}
