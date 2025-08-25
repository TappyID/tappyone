'use client'

import { useState, useCallback } from 'react'

interface TranslationCache {
  [key: string]: string
}

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR')
  const [translationCache, setTranslationCache] = useState<TranslationCache>({})

  const translateText = useCallback(async (text: string, targetLanguage: string): Promise<string> => {
    if (!text || targetLanguage === 'pt-BR') return text
    
    // Verificar cache
    const cacheKey = `${text}_${targetLanguage}`
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey]
    }

    try {
      setIsTranslating(true)
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
          sourceLanguage: 'pt'
        })
      })

      if (!response.ok) {
        throw new Error(`Erro na tradução: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.translatedText) {
        // Salvar no cache
        setTranslationCache(prev => ({
          ...prev,
          [cacheKey]: result.translatedText
        }))
        
        return result.translatedText
      }
      
      return text // Retorna original se houver erro
      
    } catch (error) {
      console.error('Erro na tradução:', error)
      return text // Retorna texto original em caso de erro
    } finally {
      setIsTranslating(false)
    }
  }, [translationCache])

  const translateMessage = useCallback(async (message: any, targetLanguage: string) => {
    if (!message.body || targetLanguage === 'pt-BR') return message

    const translatedBody = await translateText(message.body, targetLanguage)
    const translatedCaption = message.caption 
      ? await translateText(message.caption, targetLanguage)
      : undefined

    return {
      ...message,
      body: translatedBody,
      caption: translatedCaption,
      _isTranslated: true,
      _originalBody: message.body,
      _originalCaption: message.caption
    }
  }, [translateText])

  const translateMessages = useCallback(async (messages: any[], targetLanguage: string) => {
    if (targetLanguage === 'pt-BR') return messages

    const translatedMessages = await Promise.all(
      messages.map(message => translateMessage(message, targetLanguage))
    )

    return translatedMessages
  }, [translateMessage])

  return {
    isTranslating,
    selectedLanguage,
    setSelectedLanguage,
    translateText,
    translateMessage,
    translateMessages,
    translationCache
  }
}
