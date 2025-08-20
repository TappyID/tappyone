'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { WhatsAppMessage } from '@/hooks/useInfiniteMessages'

interface MessageSearchProps {
  chatId: string | null
  onClose: () => void
  onMessageSelect: (messageId: string) => void
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  chatId,
  onClose,
  onMessageSelect
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchMessages = useCallback(async (searchQuery: string) => {
    if (!chatId || !searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token não encontrado')
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081'
      const response = await fetch(
        `${backendUrl}/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages/search?q=${encodeURIComponent(searchQuery)}&limit=50`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const messagesData = await response.json()
      
      // Processar mensagens para converter formato WAHA para nosso formato
      const processedMessages: WhatsAppMessage[] = messagesData.map((msg: any) => ({
        id: msg.id?._serialized || msg.id || `msg_${Date.now()}_${Math.random()}`,
        chatId: chatId,
        fromMe: msg.fromMe || false,
        author: msg.author || msg.from,
        body: msg.body || msg.text || '',
        type: msg.processedType || msg.type || 'text',
        timestamp: new Date(msg.timestamp * 1000 || Date.now()).toISOString(),
        status: msg.ack === 3 ? 'read' : msg.ack === 2 ? 'delivered' : msg.ack === 1 ? 'sent' : 'pending',
        mediaUrl: msg.mediaUrl,
        fileName: msg.filename || msg.fileName,
        caption: msg.caption
      }))

      setResults(processedMessages)
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [chatId])

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchMessages(query)
      } else {
        setResults([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query, searchMessages])

  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text
    
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Ontem'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'long' })
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Buscar mensagens</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Digite sua busca..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-4 text-center text-red-500">
              <p>Erro: {error}</p>
            </div>
          )}

          {!query.trim() && !loading && (
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Digite algo para buscar mensagens</p>
            </div>
          )}

          {query.trim() && !loading && results.length === 0 && !error && (
            <div className="p-8 text-center text-gray-500">
              <p>Nenhuma mensagem encontrada</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="divide-y">
              {results.map((message) => (
                <div
                  key={message.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onMessageSelect(message.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {message.fromMe ? 'Você' : message.author}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 capitalize">
                      {message.type}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    {message.type === 'text' ? (
                      <p className="line-clamp-3">
                        {highlightText(message.body, query)}
                      </p>
                    ) : message.caption ? (
                      <p className="line-clamp-2">
                        <span className="text-gray-500 italic">
                          {message.type === 'image' && '📷 '}
                          {message.type === 'video' && '🎥 '}
                          {message.type === 'audio' && '🎵 '}
                          {message.type === 'document' && '📄 '}
                        </span>
                        {highlightText(message.caption, query)}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">
                        {message.type === 'image' && '📷 Imagem'}
                        {message.type === 'video' && '🎥 Vídeo'}
                        {message.type === 'audio' && '🎵 Áudio'}
                        {message.type === 'document' && '📄 Documento'}
                        {message.type === 'location' && '📍 Localização'}
                        {message.type === 'poll' && '📊 Enquete'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center text-xs text-gray-500">
          {results.length > 0 && `${results.length} resultado(s) encontrado(s)`}
        </div>
      </div>
    </div>
  )
}
