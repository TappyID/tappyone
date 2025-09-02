'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Search, X, Loader2, MessageCircle, Clock, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

      const response = await fetch(
        `/api/whatsapp/chats/${encodeURIComponent(chatId)}/messages/search?q=${encodeURIComponent(searchQuery)}&limit=50`,
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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Header */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Buscar mensagens</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.button>
          </motion.div>

          {/* Search Input */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50"
          >
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              >
                <Search className="w-5 h-5" />
              </motion.div>
              <input
                type="text"
                placeholder="Digite sua busca..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                autoFocus
              />
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto scrollbar-custom">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-8 text-center"
                >
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                    <p className="text-red-600 dark:text-red-400">Erro: {error}</p>
                  </div>
                </motion.div>
              )}

              {!query.trim() && !loading && !error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 text-center"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-4">
                      <MessageCircle className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Busque suas mensagens</h3>
                    <p className="text-gray-600 dark:text-gray-400">Digite algo para encontrar mensagens nesta conversa</p>
                  </div>
                </motion.div>
              )}

              {query.trim() && !loading && results.length === 0 && !error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-12 text-center"
                >
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-8">
                    <div className="p-4 bg-gray-200 dark:bg-slate-700 rounded-full w-fit mx-auto mb-4">
                      <Search className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhum resultado</h3>
                    <p className="text-gray-600 dark:text-gray-400">Nenhuma mensagem encontrada para "{query}"</p>
                  </div>
                </motion.div>
              )}

              {results.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="divide-y divide-gray-200 dark:divide-slate-700"
                >
                  {results.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all duration-200"
                      onClick={() => onMessageSelect(message.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${message.fromMe ? 'bg-blue-500' : 'bg-green-500'}`} />
                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                              {message.fromMe ? 'Você' : message.author}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                        <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full capitalize font-medium">
                          {message.type}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {message.type === 'text' ? (
                          <p className="line-clamp-3 leading-relaxed">
                            {highlightText(message.body, query)}
                          </p>
                        ) : message.caption ? (
                          <div className="space-y-1">
                            <p className="text-gray-500 dark:text-gray-400 italic text-xs">
                              {message.type === 'image' && '📷 Imagem'}
                              {message.type === 'video' && '🎥 Vídeo'}
                              {message.type === 'audio' && '🎵 Áudio'}
                              {message.type === 'document' && '📄 Documento'}
                            </p>
                            <p className="line-clamp-2 leading-relaxed">
                              {highlightText(message.caption, query)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 italic">
                            {message.type === 'image' && '📷 Imagem'}
                            {message.type === 'video' && '🎥 Vídeo'}
                            {message.type === 'audio' && '🎵 Áudio'}
                            {message.type === 'document' && '📄 Documento'}
                            {message.type === 'location' && '📍 Localização'}
                            {message.type === 'poll' && '📊 Enquete'}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700"
          >
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {results.length > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="font-medium">{results.length} resultado(s) encontrado(s)</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
