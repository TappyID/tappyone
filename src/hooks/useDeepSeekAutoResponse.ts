import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

interface AutoResponseHookProps {
  agenteAtivo: boolean
  agenteAtual: any
  chatId: string | null
  onSendMessage: (message: string) => void
}

export function useDeepSeekAutoResponse({
  agenteAtivo,
  agenteAtual,
  chatId,
  onSendMessage
}: AutoResponseHookProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastProcessedMessage, setLastProcessedMessage] = useState<string>('')
  const { token } = useAuth()

  const generateAutoResponse = useCallback(async (userMessage: string, messageHistory: any[] = []) => {
    if (!agenteAtivo || !agenteAtual || !chatId || !token) {
      console.log('🤖 [AUTO-RESPONSE] Condições não atendidas:', {
        agenteAtivo,
        agenteAtual: !!agenteAtual,
        chatId: !!chatId,
        token: !!token
      })
      return
    }

    // Evitar processar a mesma mensagem duas vezes
    const messageKey = `${chatId}-${userMessage}-${Date.now()}`
    if (lastProcessedMessage === messageKey) {
      return
    }

    try {
      setIsGenerating(true)
      setLastProcessedMessage(messageKey)

      console.log('🤖 [AUTO-RESPONSE] Gerando resposta automática...', {
        agente: agenteAtual.nome,
        modelo: agenteAtual.modelo,
        userMessage: userMessage.substring(0, 100)
      })

      // Buscar prompt personalizado do agente
      let systemPrompt = agenteAtual.prompt || agenteAtual.instrucoes || 'Você é um assistente IA útil.'
      
      // Se o agente tem categoria, incluir no contexto
      if (agenteAtual.categoria) {
        systemPrompt = `Você é um especialista em ${agenteAtual.categoria}. ${systemPrompt}`
      }

      // Preparar histórico de mensagens (últimas 10 para contexto)
      const recentMessages = messageHistory
        .slice(-10)
        .map(msg => ({
          role: msg.fromMe ? 'user' : 'assistant',
          content: msg.body || msg.text || ''
        }))
        .filter(msg => msg.content.trim().length > 0)

      // Fazer requisição para DeepSeek
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          systemPrompt,
          messages: recentMessages,
          userMessage,
          temperature: parseFloat(agenteAtual.temperatura || '0.7'),
          max_tokens: parseInt(agenteAtual.max_tokens || '1000')
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na API DeepSeek')
      }

      const data = await response.json()
      const aiResponse = data.response

      if (aiResponse && aiResponse.trim().length > 0) {
        console.log('✅ [AUTO-RESPONSE] Enviando resposta:', aiResponse.substring(0, 100))
        
        // Aguardar 1-3 segundos para parecer mais natural
        const delay = Math.random() * 2000 + 1000
        setTimeout(() => {
          onSendMessage(aiResponse)
        }, delay)
      }

    } catch (error) {
      console.error('🚨 [AUTO-RESPONSE] Erro:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [agenteAtivo, agenteAtual, chatId, token, onSendMessage, lastProcessedMessage])

  // Função para processar nova mensagem recebida
  const processNewMessage = useCallback((message: any, messageHistory: any[] = []) => {
    // Só processar mensagens que NÃO são nossas (fromMe = false)
    if (!message.fromMe && message.body && message.body.trim().length > 0) {
      console.log('📨 [AUTO-RESPONSE] Nova mensagem recebida para processamento:', message.body.substring(0, 100))
      generateAutoResponse(message.body, messageHistory)
    }
  }, [generateAutoResponse])

  return {
    isGenerating,
    processNewMessage,
    generateAutoResponse
  }
}
