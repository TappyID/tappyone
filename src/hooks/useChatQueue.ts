'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export interface ChatRequest {
  id: string
  adminId: string
  adminNome: string
  adminAvatar: string
  assunto: string
  preview: string
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  timestamp: Date
  tempoLimite: number
  tentativas: number
  atendenteAtual?: string
}

export interface UseChatQueueReturn {
  pendingChat: ChatRequest | null
  isModalOpen: boolean
  acceptChat: () => Promise<void>
  rejectChat: () => Promise<void>
  loading: boolean
}

export function useChatQueue(): UseChatQueueReturn {
  const { user, token } = useAuth()
  const [pendingChat, setPendingChat] = useState<ChatRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Simular recebimento de chat pendente
  const simulateIncomingChat = useCallback(() => {
    // Mock data para teste - em produção viria do WebSocket/API
    const mockChat: ChatRequest = {
      id: `chat_${Date.now()}`,
      adminId: '1',
      adminNome: 'João Silva',
      adminAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      assunto: 'Dúvida sobre processo de vendas',
      preview: 'Olá! Preciso de ajuda com um cliente que está interessado no plano premium mas tem algumas dúvidas sobre os benefícios. Você pode me orientar sobre como proceder com a apresentação?',
      prioridade: 'alta',
      timestamp: new Date(),
      tempoLimite: 30,
      tentativas: 1,
      atendenteAtual: user?.id
    }
    
    setPendingChat(mockChat)
    setIsModalOpen(true)
    
    console.log('📨 [ChatQueue] Novo chat recebido:', mockChat)
  }, [user?.id])

  // Aceitar chat
  const acceptChat = useCallback(async () => {
    if (!pendingChat || !token) return

    try {
      setLoading(true)
      console.log('✅ [ChatQueue] Aceitando chat:', pendingChat.id)

      // Chamar API para aceitar o chat
      const response = await fetch('/api/chat-interno/accept', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: pendingChat.id,
          atendenteId: user?.id
        })
      })

      if (response.ok) {
        console.log('✅ [ChatQueue] Chat aceito com sucesso')
        // Chat aceito - fecha modal e limpa pendência
        setIsModalOpen(false)
        setPendingChat(null)
        
        // Aqui você pode redirecionar para a área de chat ou abrir o chat
        // Exemplo: router.push(`/dashboard/atendente/chat-interno?chat=${pendingChat.adminId}`)
      } else {
        console.error('❌ [ChatQueue] Erro ao aceitar chat:', response.status)
      }
    } catch (error) {
      console.error('❌ [ChatQueue] Erro ao aceitar chat:', error)
    } finally {
      setLoading(false)
    }
  }, [pendingChat, token, user?.id])

  // Rejeitar chat
  const rejectChat = useCallback(async () => {
    if (!pendingChat || !token) return

    try {
      setLoading(true)
      console.log('❌ [ChatQueue] Rejeitando chat:', pendingChat.id)

      // Chamar API para rejeitar o chat
      const response = await fetch('/api/chat-interno/reject', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: pendingChat.id,
          atendenteId: user?.id,
          motivo: 'manual_reject'
        })
      })

      if (response.ok) {
        console.log('✅ [ChatQueue] Chat rejeitado - será redistribuído')
        // Chat rejeitado - fecha modal e limpa pendência
        setIsModalOpen(false)
        setPendingChat(null)
      } else {
        console.error('❌ [ChatQueue] Erro ao rejeitar chat:', response.status)
      }
    } catch (error) {
      console.error('❌ [ChatQueue] Erro ao rejeitar chat:', error)
    } finally {
      setLoading(false)
    }
  }, [pendingChat, token, user?.id])

  // Escutar por novos chats via WebSocket (simulado por agora)
  useEffect(() => {
    if (!user || user.tipo !== 'ATENDENTE') return

    // Simular recebimento de chat após 5 segundos (para teste)
    const timer = setTimeout(() => {
      simulateIncomingChat()
    }, 5000)

    return () => clearTimeout(timer)
  }, [user, simulateIncomingChat])

  // Auto-rejeitar se não responder em tempo
  useEffect(() => {
    if (!pendingChat || !isModalOpen) return

    const timer = setTimeout(() => {
      console.log('⏰ [ChatQueue] Tempo esgotado - auto-rejeitando chat')
      rejectChat()
    }, pendingChat.tempoLimite * 1000)

    return () => clearTimeout(timer)
  }, [pendingChat, isModalOpen, rejectChat])

  return {
    pendingChat,
    isModalOpen,
    acceptChat,
    rejectChat,
    loading
  }
}
