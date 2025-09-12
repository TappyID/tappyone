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

export function useWhatsAppDataFiltered() {
  const [filaContatos, setFilaContatos] = useState<FilaContato[]>([])
  const [loadingFilaContatos, setLoadingFilaContatos] = useState(true)
  
  // Hook original do WhatsApp
  const whatsAppData = useWhatsAppData()
  
  // Hook das filas do atendente
  const { filas, loading: loadingFilas } = useAtendenteFilas()

  // Buscar mapeamento de contatos para filas
  const fetchFilaContatos = useCallback(async () => {
    if (!filas.length) return
    
    try {
      setLoadingFilaContatos(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('Token não encontrado')
        return
      }

      // Buscar contatos de todas as filas do atendente
      const promises = filas.map(async (fila) => {
        try {
          const response = await fetch(`/api/filas/${fila.id}/contatos`, {
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
          console.error(`Erro ao buscar contatos da fila ${fila.nome}:`, error)
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
  }, [filas])

  // Executar busca quando filas carregarem
  useEffect(() => {
    if (!loadingFilas && filas.length > 0) {
      fetchFilaContatos()
    } else if (!loadingFilas && filas.length === 0) {
      setLoadingFilaContatos(false)
      setFilaContatos([])
    }
  }, [filas, loadingFilas, fetchFilaContatos])

  // Filtrar chats baseado nas filas do atendente
  const filteredChats = useMemo(() => {
    if (!whatsAppData.chats || !filaContatos.length) {
      return []
    }

    // Criar set dos contatos permitidos para o atendente
    const allowedContactIds = new Set(filaContatos.map(fc => fc.contatoId))
    
    // Filtrar chats onde o contato ID está nas filas do atendente
    const filtered = whatsAppData.chats.filter(chat => {
      // Extrair número do telefone do chat ID
      let contactNumber = ''
      
      if (typeof chat.id === 'string') {
        contactNumber = chat.id.replace('@c.us', '')
      } else if (chat.id && (chat.id as any)._serialized) {
        contactNumber = (chat.id as any)._serialized.replace('@c.us', '')
      }
      
      // Verificar se o contato está em alguma fila do atendente
      const isAllowed = allowedContactIds.has(contactNumber)
      
      if (isAllowed) {
        console.log(`✅ Chat permitido: ${chat.name || contactNumber} (fila: ${filaContatos.find(fc => fc.contatoId === contactNumber)?.filaId})`)
      }
      
      return isAllowed
    })

    console.log(`🔍 Filtrados ${filtered.length} de ${whatsAppData.chats.length} chats para o atendente`)
    
    return filtered
  }, [whatsAppData.chats, filaContatos])

  // Retornar dados filtrados
  return {
    ...whatsAppData,
    chats: filteredChats,
    loading: whatsAppData.loading || loadingFilas || loadingFilaContatos,
    filas,
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
