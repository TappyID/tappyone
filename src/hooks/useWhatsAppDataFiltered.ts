'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useWhatsAppData, WhatsAppChat } from '@/hooks/useWhatsAppData'
import { useAtendenteFilas, Fila } from '@/hooks/useAtendenteFilas'

// Interface para fila-contato mapping
interface FilaContato {
  id: string
  filaId: string
  contatoId: string
  criadoEm: string
}

interface UseWhatsAppDataFilteredProps {
  filasIds?: string[] // IDs das filas do atendente
}

export function useWhatsAppDataFiltered(props?: UseWhatsAppDataFilteredProps) {
  const [filaContatos, setFilaContatos] = useState<FilaContato[]>([])
  const [loadingFilaContatos, setLoadingFilaContatos] = useState(true)
  
  // Hook original do WhatsApp
  const whatsAppData = useWhatsAppData()
  
  console.log('🔍 [useWhatsAppDataFiltered] whatsAppData.chats:', whatsAppData.chats?.length || 0)
  console.log('🔍 [useWhatsAppDataFiltered] whatsAppData.loading:', whatsAppData.loading)
  console.log('🔍 [useWhatsAppDataFiltered] filasIds recebidas:', props?.filasIds?.length || 0)
  
  // Usar filas passadas como prop (não buscar novamente)
  const filasIds = props?.filasIds || []
  const loadingFilas = false // Não estamos carregando, já recebemos as filas

  // Buscar mapeamento de contatos para filas
  const fetchFilaContatos = useCallback(async () => {
    if (!filasIds.length) {
      console.log('⚠️ [useWhatsAppDataFiltered] Sem filas para buscar contatos')
      setLoadingFilaContatos(false)
      return
    }
    
    console.log('🔍 [useWhatsAppDataFiltered] Buscando contatos para', filasIds.length, 'filas')
    
    try {
      setLoadingFilaContatos(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('Token não encontrado')
        return
      }

      // Buscar contatos de todas as filas do atendente
      const promises = filasIds.map(async (filaId) => {
        try {
          const response = await fetch(`/api/filas/${filaId}/contatos`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          
          if (response.ok) {
            const contatos: any[] = await response.json()
            return contatos.map((c: any) => ({
              id: c.id,
              filaId: c.filaId,
              contatoId: c.numeroTelefone || c.contatoId, // Usar número do telefone se disponível
              criadoEm: c.criadoEm || new Date().toISOString()
            }))
          }
          return []
        } catch (error) {
          console.error(`Erro ao buscar contatos da fila ${filaId}:`, error)
          return []
        }
      })

      const results = await Promise.all(promises)
      const allFilaContatos = results.flat()
      
      setFilaContatos(allFilaContatos)
      
      console.log(`🎯 Encontrados ${allFilaContatos.length} contatos nas filas do atendente`)
      
    } catch (error) {
      console.error('Erro ao buscar fila-contatos:', error)
      setFilaContatos([])
    } finally {
      setLoadingFilaContatos(false)
    }
  }, [filasIds])

  // Executar busca quando filas carregarem
  useEffect(() => {
    if (filasIds.length > 0) {
      fetchFilaContatos()
    } else {
      setLoadingFilaContatos(false)
      setFilaContatos([])
    }
  }, [filasIds, fetchFilaContatos])

  // 🔥 NOVA LÓGICA: Não filtrar por contatos, retornar TODOS os chats
  // O filtro por fila será feito no page.tsx usando chat_leads.fila_id
  const filteredChats = useMemo(() => {
    console.log('🔍 [filteredChats] whatsAppData.chats:', whatsAppData.chats?.length || 0)
    console.log('🔍 [filteredChats] filasIds:', filasIds.length)
    console.log('✅ [filteredChats] Retornando TODOS os chats (filtro será feito via chat_leads)')
    
    // Retornar todos os chats - o filtro por fila será feito no componente
    return whatsAppData.chats || []
  }, [whatsAppData.chats, filasIds])

  // 🔥 FORÇAR loading = false se já temos chats
  const hasChats = filteredChats.length > 0
  const forceLoading = hasChats ? false : (whatsAppData.loading || loadingFilaContatos)
  
  console.log('🔍 [useWhatsAppDataFiltered] hasChats:', hasChats)
  console.log('🔍 [useWhatsAppDataFiltered] forceLoading:', forceLoading)
  
  // Retornar dados filtrados
  return {
    ...whatsAppData,
    chats: filteredChats,
    loading: forceLoading,
    filasIds,
    filaContatos,
    refetchFilaContatos: fetchFilaContatos,
    // Wrapper para loadChatMessages com debug
    loadChatMessages: (chatId: string) => {
      console.log('🔄 [useWhatsAppDataFiltered] Carregando mensagens para chatId:', chatId)
      const result = whatsAppData.loadChatMessages(chatId)
      console.log('📥 [useWhatsAppDataFiltered] Resultado do loadChatMessages:', result)
      return result
    }
  }
}
