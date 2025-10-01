'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, FileText, Plus, Trash2, Edit2, Save, Calendar } from 'lucide-react'
import { fetchApi } from '@/utils/api'

interface AnotacoesBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  chatId?: string
}

interface Anotacao {
  id: string
  titulo: string
  conteudo: string
  criadoEm: string
  atualizadoEm: string
}

export default function AnotacoesBottomSheet({ isOpen, onClose, chatId }: AnotacoesBottomSheetProps) {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([])
  const [novaAnotacao, setNovaAnotacao] = useState({ titulo: '', conteudo: '' })
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 🚀 BUSCAR ANOTAÇÕES ESPECÍFICAS DO CHAT
  const fetchAnotacoes = useCallback(async () => {
    if (!chatId) return

    try {
      setLoading(true)

      // 🚀 NOVA URL ESPECÍFICA POR CHAT
      const path = `/api/chats/${encodeURIComponent(chatId)}/anotacoes`

      const response = await fetchApi('backend', path)

      if (!response.ok) {
        setAnotacoes([])
        return
      }

      const data = await response.json()
      const anotacoesData = Array.isArray(data) ? data : (data.data || [])

      setAnotacoes(anotacoesData)

    } catch {
      setAnotacoes([])
    } finally {
      setLoading(false)
    }
  }, [chatId])

  // Carregar anotações quando abrir
  useEffect(() => {
    if (isOpen) {
      fetchAnotacoes()
    }
  }, [isOpen, fetchAnotacoes])

  // Criar nova anotação
  const handleCriarAnotacao = async () => {
    if (!novaAnotacao.titulo || !novaAnotacao.conteudo || !chatId) return

    try {
      setLoading(true)

      // 🚀 NOVA URL ESPECÍFICA POR CHAT
      const path = `/api/chats/${encodeURIComponent(chatId)}/anotacoes`
      const response = await fetchApi('backend', path, {
        method: 'POST',
        body: JSON.stringify({
          titulo: novaAnotacao.titulo.trim(),
          conteudo: novaAnotacao.conteudo.trim(),
          categoria: 'geral',
          prioridade: 'media',
          status: 'ativa'
        })
      })

      if (response.ok) {
        alert(`✅ Anotação "${novaAnotacao.titulo}" criada com sucesso!`)

        // Limpar formulário
        setNovaAnotacao({ titulo: '', conteudo: '' })

        // Recarregar anotações
        fetchAnotacoes()

        // Disparar evento para atualizar indicadores
        window.dispatchEvent(new CustomEvent('anotacaoCreated', {
          detail: { chatId }
        }))
      } else {
        alert('❌ Erro ao criar anotação')
      }
    } catch {
      alert('❌ Erro ao criar anotação')
    } finally {
      setLoading(false)
    }
  }

  // Deletar anotação
  const handleDeletarAnotacao = async (anotacaoId: string) => {
    if (!confirm('Deseja realmente deletar esta anotação?')) return

    try {
      // 🚀 NOVA URL ESPECÍFICA POR CHAT
      const path = `/api/chats/${encodeURIComponent(chatId || '')}/anotacoes/${anotacaoId}`
      const response = await fetchApi('backend', path, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchAnotacoes()
      }
    } catch {}
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 w-full max-h-[85vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📝 Anotações</h2>
              <p className="text-sm text-gray-500">Adicione observações sobre o contato</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 pb-24">
            {/* Criar Nova Anotação */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Nova Anotação</h3>

              <input
                type="text"
                value={novaAnotacao.titulo}
                onChange={(e) => setNovaAnotacao(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Título da anotação..."
                className="w-full px-3 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />

              <textarea
                value={novaAnotacao.conteudo}
                onChange={(e) => setNovaAnotacao(prev => ({ ...prev, conteudo: e.target.value }))}
                placeholder="Conteúdo da anotação..."
                rows={3}
                className="w-full px-3 py-2 mb-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />

              <button
                onClick={handleCriarAnotacao}
                disabled={!novaAnotacao.titulo || !novaAnotacao.conteudo || loading}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400
                         text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {loading ? 'Salvando...' : 'Adicionar Anotação'}
              </button>
            </div>

            {/* Lista de Anotações */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Anotações Existentes ({anotacoes.length})
              </h3>

              {loading && anotacoes.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Carregando anotações...</p>
                </div>
              ) : anotacoes.length > 0 ? (
                anotacoes.map((anotacao) => (
                  <motion.div
                    key={anotacao.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {anotacao.titulo}
                      </h4>
                      <button
                        onClick={() => handleDeletarAnotacao(anotacao.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {anotacao.conteudo}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(anotacao.criadoEm).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(anotacao.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma anotação encontrada</p>
                  <p className="text-xs mt-1">Adicione a primeira anotação acima</p>
                </div>
              )}
            </div>

            {/* Dica */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                💡 Dica:
              </p>
              <p className="text-xs text-orange-500 dark:text-orange-300 mt-1">
                • Anotações são privadas e não são enviadas ao cliente<br/>
                • Use para registrar informações importantes<br/>
                • Histórico completo fica salvo no sistema
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
