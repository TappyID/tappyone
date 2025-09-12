import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export interface Usuario {
  id: string
  nome: string
  email: string
  tipo: 'ADMIN' | 'ATENDENTE' | 'ATENDENTE_SENIOR'
  status: 'online' | 'ocupado' | 'ausente' | 'offline'
  avatar: string
  ultimaMsg: string
  ultimaAtividade: Date
  naoLidas: number
  cargo: string
  fila?: string
  tag?: string
  indiceNCS?: number
  prioridade?: 'alta' | 'media' | 'baixa'
}

interface UseUsuariosReturn {
  usuarios: Usuario[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useUsuarios(tipoFiltro?: 'admins' | 'atendentes'): UseUsuariosReturn {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token, user } = useAuth()

  const fetchUsuarios = async () => {
    if (!token || !user) {
      console.log('👥 [useUsuarios] Sem token ou usuário, pulando fetch')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Determinar tipo baseado nas permissões
      let tipo = tipoFiltro
      if (!tipo) {
        // Se não especificado, usar lógica de permissões
        if (user.tipo === 'ADMIN') {
          tipo = 'atendentes' // Admin vê atendentes
        } else if (user.tipo === 'ATENDENTE' || user.tipo === 'ATENDENTE_SENIOR') {
          tipo = 'admins' // Atendente vê admins
        }
      }

      const url = tipo 
        ? `/api/chat-interno/usuarios?tipo=${tipo}`
        : '/api/chat-interno/usuarios'

      console.log('👥 [useUsuarios] Buscando usuários:', { url, userTipo: user.tipo, tipo })

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('👥 [useUsuarios] Dados recebidos:', data)

      // Transformar dados para o formato esperado
      const usuariosFormatados: Usuario[] = (data || []).map((user: any) => ({
        id: String(user.id), // Converter para string
        nome: user.nome || user.name || 'Usuário',
        email: user.email || '',
        tipo: user.tipo || 'ATENDENTE',
        status: user.status || 'offline',
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome || user.name || 'Usuario')}&background=305e73&color=fff`,
        ultimaMsg: user.ultimaMsg || 'Disponível para conversa',
        ultimaAtividade: new Date(user.ultimaAtividade || new Date()),
        naoLidas: user.naoLidas || 0,
        cargo: user.cargo || getTipoCargo(user.tipo),
        fila: user.fila || '',
        tag: user.tag || '',
        indiceNCS: user.indiceNCS || 0,
        prioridade: user.prioridade || 'media'
      }))

      setUsuarios(usuariosFormatados)
      console.log('✅ [useUsuarios] Usuários carregados:', usuariosFormatados.length)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('❌ [useUsuarios] Erro ao buscar usuários:', errorMessage)
      setError(errorMessage)
      setUsuarios([]) // Limpar lista em caso de erro
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [token, user?.id, tipoFiltro])

  return {
    usuarios,
    loading,
    error,
    refetch: fetchUsuarios
  }
}

function getTipoCargo(tipo: string): string {
  switch (tipo) {
    case 'ADMIN':
      return 'Administrador'
    case 'ATENDENTE_SENIOR':
      return 'Atendente Sênior'
    case 'ATENDENTE':
      return 'Atendente'
    default:
      return 'Usuário'
  }
}

// Hook específico para chat interno com permissões automáticas
export function useUsuariosChat(): UseUsuariosReturn {
  const { user } = useAuth()
  
  // Determinar automaticamente quem o usuário pode ver
  let tipoFiltro: 'admins' | 'atendentes' | undefined
  
  if (user?.tipo === 'ADMIN') {
    tipoFiltro = 'atendentes' // Admin vê atendentes
  } else if (user?.tipo === 'ATENDENTE' || user?.tipo === 'ATENDENTE_SENIOR') {
    tipoFiltro = 'admins' // Atendente vê admins
  }

  return useUsuarios(tipoFiltro)
}
