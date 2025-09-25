'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Plus, Trash2 } from 'lucide-react'
import { fetchApi } from '@/utils/api'

interface TagsBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

export default function TagsBottomSheet({ isOpen, onClose, chatId }: TagsBottomSheetProps) {
  const [tags, setTags] = useState<any[]>([])
  const [novaTag, setNovaTag] = useState('')
  const [corSelecionada, setCorSelecionada] = useState('#3b82f6')
  const [loading, setLoading] = useState(false)

  console.log('🏷️ [TagsBottomSheet] Renderizado com chatId:', chatId)

  // Buscar tags do chat
  const fetchTags = useCallback(async () => {
    if (!chatId) return
    
    try {
      setLoading(true)
      console.log('🏷️ [TagsBottomSheet] Buscando tags para chatId:', chatId)
      
      // 🚀 NOVA URL ESPECÍFICA POR CHAT - USANDO BACKEND CORRETO
      const path = `/api/chats/${encodeURIComponent(chatId)}/tags`
      console.log('🌐 [TagsBottomSheet] Path backend:', path)
      
      const response = await fetchApi('backend', path)
      
      if (!response.ok) {
        console.log('🏷️ [TagsBottomSheet] Erro ao buscar tags:', response.status)
        setTags([])
        return
      }
      
      const data = await response.json()
      const allTags = Array.isArray(data) ? data : (data.data || [])
      
      console.log('🏷️ [FRONTEND] Resposta completa da API:', data)
      console.log('🏷️ [FRONTEND] Total de tags retornadas:', allTags.length)
      
      // ⚠️ FILTRO TEMPORÁRIO NO FRONTEND (até API ser corrigida)
      const telefone = chatId.replace('@c.us', '')
      
      // Debug: Ver estrutura das tags
      console.log('🔍 [DEBUG] Primeira tag da API:', allTags[0])
      console.log('🔍 [DEBUG] Última tag da API:', allTags[allTags.length - 1])
      
      const tagsDoChat = allTags.filter(tag => {
        // Buscar tags que podem estar associadas ao chat/telefone
        const match = (
          tag.chatId === chatId || 
          tag.telefone === telefone ||
          tag.contato_telefone === telefone ||
          tag.contato_id === chatId ||
          // Para tags antigas que podem ter outros campos
          tag.associacoes?.some((assoc: any) => 
            assoc.chatId === chatId || assoc.telefone === telefone
          )
        )
        
        if (match) {
          console.log('🎯 [DEBUG] Tag encontrada para chat:', tag)
        }
        
        return match
      })
      
      console.log('🔍 [FRONTEND] Filtro aplicado para chatId:', chatId)
      console.log('🔍 [FRONTEND] Telefone extraído:', telefone)
      console.log('🔍 [FRONTEND] Tags filtradas do chat:', tagsDoChat.length)
      console.log('🔍 [FRONTEND] Tags do chat:', tagsDoChat)
      
      setTags(tagsDoChat)
      
    } catch (error) {
      console.error('❌ Erro ao buscar tags:', error)
      setTags([])
    } finally {
      setLoading(false)
    }
  }, [chatId])

  // Cores disponíveis para tags
  const coresDisponiveis = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#6b7280', '#059669'
  ]

  const handleCriarTag = async () => {
    if (!novaTag.trim()) return
    
    console.log('🏷️ Nova tag:', { nome: novaTag, cor: corSelecionada, chatId })
    
    try {
      // Extrair telefone do chatId para compatibilidade
      const telefone = chatId.replace('@c.us', '')
      
      const tagData = {
        nome: novaTag.trim(),
        cor: corSelecionada,
        chatId: chatId, // Para nova API
        telefone: telefone, // Para compatibilidade
        contato_telefone: telefone, // Alternativa
        ativo: true
      }
      
      console.log('📡 [FRONTEND] Criando tag com dados:', tagData)
      console.log('📡 [FRONTEND] ChatId original:', chatId)
      console.log('📡 [FRONTEND] Telefone extraído:', telefone)
      
      // 🚀 NOVA URL ESPECÍFICA POR CHAT - USANDO BACKEND CORRETO
      const path = `/api/chats/${encodeURIComponent(chatId)}/tags`
      const response = await fetchApi('backend', path, {
        method: 'POST',
        body: JSON.stringify({
          nome: novaTag.trim(),
          cor: corSelecionada,
          ativo: true
        })
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => null)
        console.error('❌ Erro ao criar tag:', response.status, error)
        alert('❌ Erro ao criar tag. Tente novamente.')
        return
      }
      
      const result = await response.json()
      console.log('✅ Tag criada com sucesso:', result)
      
      console.log('🚨 [PROBLEMA] API não salvou associação da tag com o chat!')
      console.log('🚨 [PROBLEMA] Tag criada:', result.data)
      console.log('🚨 [PROBLEMA] Campos enviados mas ignorados:', { chatId, telefone })
      
      alert(`✅ Tag "${novaTag}" criada com sucesso!`)
      
      setNovaTag('')
      fetchTags() // Recarregar tags
      
      // Disparar evento para atualizar indicadores
      window.dispatchEvent(new CustomEvent('tagCreated', { 
        detail: { chatId, tag: result } 
      }))
      
    } catch (error) {
      console.error('❌ Erro de rede ao criar tag:', error)
      alert('❌ Erro de conexão. Tente novamente.')
    }
  }

  const handleRemoverTag = async (tagId: string) => {
    console.log('🏷️ Remover tag:', { tagId, chatId })
    
    try {
      // 🚀 NOVA URL ESPECÍFICA POR CHAT - USANDO BACKEND CORRETO
      const path = `/api/chats/${encodeURIComponent(chatId || '')}/tags/${tagId}`
      const response = await fetchApi('backend', path, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        console.log('✅ Tag removida com sucesso!')
        fetchTags() // Recarregar tags
        
        // Disparar evento para atualizar indicadores
        window.dispatchEvent(new CustomEvent('tagRemoved', { 
          detail: { chatId, tagId } 
        }))
      } else {
        console.error('❌ Erro ao remover tag:', response.status)
        alert('❌ Erro ao remover tag. Tente novamente.')
      }
    } catch (error) {
      console.error('❌ Erro de rede ao remover tag:', error)
      alert('❌ Erro de conexão. Tente novamente.')
    }
  }

  // Carregar tags quando abrir
  useEffect(() => {
    if (isOpen && chatId) {
      fetchTags()
    }
  }, [isOpen, fetchTags, chatId])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Gerenciar Tags
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Organize suas conversas
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Nova Tag */}
          <div className="mb-6">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={novaTag}
                onChange={(e) => setNovaTag(e.target.value)}
                placeholder="Nome da tag..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleCriarTag()}
              />
              <button
                onClick={handleCriarTag}
                disabled={!novaTag.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar
              </button>
            </div>
            
            {/* Seletor de Cores */}
            <div className="flex gap-2 flex-wrap">
              {coresDisponiveis.map((cor) => (
                <button
                  key={cor}
                  onClick={() => setCorSelecionada(cor)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    corSelecionada === cor ? 'border-gray-400 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: cor }}
                />
              ))}
            </div>
          </div>

          {/* Lista de Tags */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tags Aplicadas ({tags.length})
            </h4>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando tags...</p>
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Nenhuma tag aplicada</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Crie uma tag para organizar esta conversa</p>
              </div>
            ) : (
              tags.map((tag) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: tag.cor }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {tag.nome}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoverTag(tag.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
  