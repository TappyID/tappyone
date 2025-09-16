import { useState } from 'react'

type AIAction = 'generate' | 'improve' | 'formal' | 'casual' | 'shorter' | 'longer'

interface UseDeepSeekAIReturn {
  generateText: (text: string, action: AIAction) => Promise<string | null>
  loading: boolean
  error: string | null
}

export const useDeepSeekAI = (): UseDeepSeekAIReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateText = async (text: string, action: AIAction): Promise<string | null> => {
    if (!text.trim()) {
      setError('Texto é obrigatório')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          action
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro na requisição')
      }

      const data = await response.json()
      
      if (!data.success || !data.text) {
        throw new Error('Nenhum texto foi gerado')
      }

      return data.text
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    generateText,
    loading,
    error
  }
}
