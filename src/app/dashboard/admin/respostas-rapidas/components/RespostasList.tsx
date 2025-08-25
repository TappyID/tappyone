'use client'

import { motion } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  MessageCircle,
  Clock,
  Zap,
  Tag,
  MoreVertical,
  Calendar
} from 'lucide-react'
import { useState } from 'react'
import { RespostaRapida, CategoriaResposta } from '@/hooks/useRespostasRapidas'

interface RespostasListProps {
  respostas: RespostaRapida[]
  categorias: CategoriaResposta[]
  loading: boolean
  onEdit: (resposta: RespostaRapida) => void
  onDelete: (id: string) => void
  onTogglePause: (id: string, pausado: boolean) => void
  onExecute: (id: string, chatId: string) => void
  onDuplicate: (resposta: RespostaRapida) => void
}

export default function RespostasList({
  respostas,
  categorias,
  loading,
  onEdit,
  onDelete,
  onTogglePause,
  onExecute,
  onDuplicate
}: RespostasListProps) {
  const [selectedResposta, setSelectedResposta] = useState<string | null>(null)

  const getCategoriaById = (id?: string) => {
    return categorias.find(c => c.id === id)
  }

  const formatTriggers = (triggers: string[]) => {
    if (!triggers || triggers.length === 0) return 'Nenhum trigger'
    return triggers.slice(0, 3).join(', ') + (triggers.length > 3 ? '...' : '')
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (respostas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nenhuma resposta rápida encontrada
        </h3>
        <p className="text-gray-600 mb-6">
          Crie sua primeira resposta rápida para automatizar suas conversas
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-medium"
        >
          Criar Primeira Resposta
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {respostas.map((resposta, index) => {
        const categoria = getCategoriaById(resposta.categoria_id)
        
        return (
          <motion.div
            key={resposta.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg hover:border-[#305e73]/20 transition-all duration-300 group hover:-translate-y-1"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {resposta.titulo}
                  </h3>
                  {resposta.pausado ? (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">Pausada</span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full">Ativa</span>
                  )}
                </div>
                
                {categoria && (
                  <div 
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-white mb-1"
                    style={{ backgroundColor: categoria.cor }}
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {categoria.nome}
                  </div>
                )}
              </div>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedResposta(
                    selectedResposta === resposta.id ? null : resposta.id
                  )}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </motion.button>

                {/* Dropdown Menu */}
                {selectedResposta === resposta.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]"
                  >
                    <button
                      onClick={() => {
                        onEdit(resposta)
                        setSelectedResposta(null)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => {
                        onDuplicate(resposta)
                        setSelectedResposta(null)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicar
                    </button>

                    <button
                      onClick={() => {
                        onTogglePause(resposta.id, !resposta.pausado)
                        setSelectedResposta(null)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      {resposta.pausado ? (
                        <>
                          <Play className="w-4 h-4" />
                          Ativar
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4" />
                          Pausar
                        </>
                      )}
                    </button>

                    <hr className="my-2" />
                    
                    <button
                      onClick={() => {
                        onDelete(resposta.id)
                        setSelectedResposta(null)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Description */}
            {resposta.descricao && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {resposta.descricao}
              </p>
            )}

            {/* Triggers */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Triggers:</p>
              <p className="text-xs text-gray-700 bg-gray-50 rounded px-2 py-1 truncate">
                {formatTriggers(resposta.triggers)}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                <Zap className="w-3 h-3 text-blue-500" />
                <span>{resposta.acoes?.length || 0}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span>{new Date(resposta.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onExecute(resposta.id, 'test-chat')}
                className="flex-1 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 hover:shadow-md transition-all duration-200"
              >
                <Play className="w-3 h-3" />
                Executar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(resposta)}
                className="bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
              >
                <Eye className="w-3 h-3" />
              </motion.button>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
