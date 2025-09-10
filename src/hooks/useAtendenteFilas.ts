'use client'

import { useState, useEffect } from 'react'

export interface Fila {
  id: string
  nome: string
  descricao: string
  cor: string
  ordenacao: number
  ativa: boolean
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
  chatBot: boolean
  kanban: boolean
  whatsappChats: boolean
}

export interface FilaAtendente {
  id: string
  filaId: string
  usuarioId: string
  criadoEm: string
  fila: Fila
}

export function useAtendenteFilas() {
  const [filas, setFilas] = useState<Fila[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAtendenteFilas = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      // Primeiro pegar o usuário logado
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!userResponse.ok) {
        throw new Error('Erro ao buscar dados do usuário')
      }

      const userData = await userResponse.json()
      const userId = userData.id

      // Buscar filas do atendente
      const filasResponse = await fetch(`/api/usuarios/${userId}/filas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!filasResponse.ok) {
        throw new Error('Erro ao buscar filas do atendente')
      }

      const filasData: FilaAtendente[] = await filasResponse.json()
      
      // Extrair apenas as filas que têm whatsappChats habilitado
      const filasWhatsApp = filasData
        .map(fa => fa.fila)
        .filter(fila => fila.ativa && fila.whatsappChats)

      console.log(`🎯 Atendente tem ${filasWhatsApp.length} filas do WhatsApp:`, filasWhatsApp.map(f => f.nome))
      
      setFilas(filasWhatsApp)
    } catch (err) {
      console.error('Erro ao buscar filas do atendente:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setFilas([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAtendenteFilas()
  }, [])

  return {
    filas,
    loading,
    error,
    refetch: fetchAtendenteFilas,
  }
}
