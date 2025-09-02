'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { 
  X, 
  Bot, 
  Search, 
  Filter,
  Brain,
  Zap,
  ZapOff,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { useAgentesAtivos } from '@/hooks/useAgentes'
import { useChatAgente } from '@/hooks/useChatAgente'

interface AgenteSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  chatId: string | null
  onAgentActivated?: () => void
}

export default function AgenteSelectionModal({ 
  isOpen, 
  onClose, 
  chatId,
  onAgentActivated 
}: AgenteSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('')
  const [isActivating, setIsActivating] = useState(false)
  
  const { agentes, loading: loadingAgentes } = useAgentesAtivos()
  const { 
    ativo: agenteAtivo, 
    agente: agenteAtual, 
    activateAgent, 
    deactivateAgent,
    loading: loadingChatAgente 
  } = useChatAgente(chatId)

  const filteredAgentes = agentes.filter(agente => {
    const matchesSearch = agente.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (agente.categoria && agente.categoria.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategoria = !selectedCategoria || agente.categoria === selectedCategoria
    return matchesSearch && matchesCategoria
  })

  const categorias = Array.from(new Set(agentes.map(a => a.categoria).filter(Boolean)))

  const handleActivateAgent = async (agenteId: string) => {
    if (!chatId) return
    
    try {
      setIsActivating(true)
      await activateAgent(agenteId)
      onAgentActivated?.()
      onClose()
    } catch (error) {
      console.error('Erro ao ativar agente:', error)
      alert('Erro ao ativar agente')
    } finally {
      setIsActivating(false)
    }
  }

  const handleDeactivateAgent = async () => {
    if (!chatId) return
    
    try {
      setIsActivating(true)
      await deactivateAgent()
      onAgentActivated?.()
      onClose()
    } catch (error) {
      console.error('Erro ao desativar agente:', error)
      alert('Erro ao desativar agente')
    } finally {
      setIsActivating(false)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSelectedCategoria('')
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Seleção de Agente IA
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Ative um assistente inteligente para este chat
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Current Agent Status */}
            {loadingChatAgente ? (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <span className="text-gray-600">Verificando agente ativo...</span>
              </div>
            ) : agenteAtivo && agenteAtual ? (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">{agenteAtual.nome}</p>
                      <p className="text-sm text-green-700">Agente ativo neste chat</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeactivateAgent}
                    disabled={isActivating}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isActivating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ZapOff className="w-4 h-4" />
                    )}
                    Desativar
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Nenhum agente ativo</p>
                    <p className="text-sm text-gray-600">Selecione um agente abaixo para ativar</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar agentes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="min-w-[180px]">
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none bg-white"
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Agents List */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {loadingAgentes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-600">Carregando agentes...</span>
              </div>
            ) : filteredAgentes.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhum agente encontrado</p>
                <p className="text-gray-400 text-sm">
                  {searchQuery || selectedCategoria ? 'Tente ajustar os filtros' : 'Crie seu primeiro agente IA'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAgentes.map((agente) => {
                  const isCurrentAgent = agenteAtual?.id === agente.id
                  
                  return (
                    <motion.div
                      key={agente.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isCurrentAgent
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-[#305e73] hover:shadow-md'
                      }`}
                      onClick={() => !isCurrentAgent && handleActivateAgent(agente.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isCurrentAgent ? 'bg-green-100' : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
                          }`}>
                            <Bot className={`w-6 h-6 ${
                              isCurrentAgent ? 'text-green-600' : 'text-white'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{agente.nome}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {agente.categoria && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  {agente.categoria}
                                </span>
                              )}
                              <span className="text-sm text-gray-500">{agente.modelo}</span>
                            </div>
                            {agente.descricao && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {agente.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isCurrentAgent ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="text-sm font-medium">Ativo</span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleActivateAgent(agente.id)
                              }}
                              disabled={isActivating}
                              className="px-4 py-2 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {isActivating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Zap className="w-4 h-4" />
                              )}
                              Ativar
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

