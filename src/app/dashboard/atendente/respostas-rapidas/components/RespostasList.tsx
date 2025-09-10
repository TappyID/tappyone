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
import { useTheme } from '@/contexts/ThemeContext'

interface RespostasListProps {
  respostas: RespostaRapida[]
  categorias: CategoriaResposta[]
  loading: boolean
  onEdit: (resposta: RespostaRapida) => void
  onDelete: (id: string) => void
  onTogglePause: (id: string, pausado: boolean) => void
  onExecute: (id: string, chatId: string) => void
  onDuplicate: (resposta: RespostaRapida) => void
  onCreateFirst?: () => void
}

export default function RespostasList({
  respostas,
  categorias,
  loading,
  onEdit,
  onDelete,
  onTogglePause,
  onExecute,
  onDuplicate,
  onCreateFirst
}: RespostasListProps) {
  const [selectedResposta, setSelectedResposta] = useState<string | null>(null)
  const { actualTheme } = useTheme()

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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`text-center py-16 rounded-2xl backdrop-blur-sm border flex flex-col items-center ${
              actualTheme === 'dark'
                ? 'bg-slate-800/20 border-slate-700/50'
                : 'bg-white/50 border-gray-200/50'
            }`}
          >
            <div className="animate-pulse">
              <div className={`h-4 rounded mb-3 ${
                actualTheme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
              }`}></div>
              <div className={`h-3 rounded mb-2 ${
                actualTheme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
              }`}></div>
              <div className={`h-3 rounded w-2/3 ${
                actualTheme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
              }`}></div>
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
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm ${
          actualTheme === 'dark'
            ? 'bg-slate-800/60 border border-slate-700/50'
            : 'bg-gray-100'
        }`}>
          <MessageCircle className={`w-12 h-12 ${
            actualTheme === 'dark' ? 'text-slate-400' : 'text-gray-400'
          }`} />
        </div>
        <h3 className={`text-xl font-semibold mb-2 ${
          actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Nenhuma resposta rápida encontrada
        </h3>
        <p className={`mb-6 ${
          actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
        }`}>
          Crie sua primeira resposta rápida para automatizar suas conversas
        </p>
        <motion.button
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateFirst}
          className={`relative flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-500 group overflow-hidden mx-auto ${
            actualTheme === 'dark'
              ? 'text-white'
              : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl'
          }`}
          style={actualTheme === 'dark' ? {
            background: 'linear-gradient(135deg, rgba(48, 94, 115, 0.8) 0%, rgba(58, 109, 132, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -12px rgba(48, 94, 115, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          } : {}}
        >
          {/* Glass effect layers for dark mode */}
          {actualTheme === 'dark' && (
            <>
              {/* Base glass layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-2xl" />
              
              {/* Blue accent layer */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 rounded-2xl" />
              
              {/* Light reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
              
              {/* Animated border glow */}
              <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
            </>
          )}
          
          <Zap className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Criar Primeira Resposta</span>
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
            className={`rounded-xl p-4 shadow-md border transition-all duration-300 group hover:-translate-y-1 backdrop-blur-xl ${
              actualTheme === 'dark'
                ? 'bg-slate-900/60 border-slate-700/50 shadow-2xl shadow-black/50 hover:shadow-2xl hover:border-slate-600/60 hover:bg-slate-900/80'
                : 'bg-white/80 border-gray-100 hover:shadow-lg hover:border-[#305e73]/20'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  <h3 className={`font-semibold text-sm truncate ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {resposta.titulo}
                  </h3>
                  {resposta.pausado ? (
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                        actualTheme === 'dark'
                          ? 'bg-red-900/30 text-red-400'
                          : 'bg-red-100 text-red-600'
                      }`}>Pausada</span>
                  ) : (
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                      actualTheme === 'dark'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-green-100 text-green-600'
                    }`}>Ativa</span>
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
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    actualTheme === 'dark'
                      ? 'bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>

                {/* Dropdown Menu */}
                {selectedResposta === resposta.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className={`absolute right-0 top-10 rounded-xl shadow-lg border py-2 z-10 min-w-[160px] backdrop-blur-xl ${
                      actualTheme === 'dark'
                        ? 'bg-slate-900/90 border-slate-700/50 shadow-2xl shadow-black/50'
                        : 'bg-white/95 border-gray-200'
                    }`}
                  >
                    <button
                      onClick={() => {
                        onEdit(resposta)
                        setSelectedResposta(null)
                      }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-2 transition-colors ${
                        actualTheme === 'dark'
                          ? 'hover:bg-slate-800/60 text-white'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => {
                        onDuplicate(resposta)
                        setSelectedResposta(null)
                      }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-2 transition-colors ${
                        actualTheme === 'dark'
                          ? 'hover:bg-slate-800/60 text-white'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                      Duplicar
                    </button>

                    <button
                      onClick={() => {
                        onTogglePause(resposta.id, !resposta.pausado)
                        setSelectedResposta(null)
                      }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-2 transition-colors ${
                        actualTheme === 'dark'
                          ? 'hover:bg-slate-800/60 text-white'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
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

                    <hr className={`my-2 ${
                      actualTheme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
                    }`} />
                    
                    <button
                      onClick={() => {
                        onDelete(resposta.id)
                        setSelectedResposta(null)
                      }}
                      className={`w-full px-4 py-2 text-left flex items-center gap-2 text-red-600 transition-colors ${
                        actualTheme === 'dark'
                          ? 'hover:bg-red-900/30'
                          : 'hover:bg-red-50'
                      }`}
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
              <p className={`text-sm mb-4 line-clamp-2 ${
                actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
              }`}>
                {resposta.descricao}
              </p>
            )}

            {/* Triggers */}
            <div className="mb-3">
              <p className={`text-xs mb-1 ${
                actualTheme === 'dark' ? 'text-white/60' : 'text-gray-500'
              }`}>Triggers:</p>
              <p className={`text-xs rounded px-2 py-1 truncate ${
                actualTheme === 'dark'
                  ? 'text-white/80 bg-slate-800/60'
                  : 'text-gray-700 bg-gray-50'
              }`}>
                {formatTriggers(resposta.triggers)}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className={`flex items-center gap-1 text-xs rounded px-2 py-1 ${
                actualTheme === 'dark'
                  ? 'text-white/70 bg-slate-800/60'
                  : 'text-gray-600 bg-gray-50'
              }`}>
                <Zap className="w-3 h-3 text-blue-500" />
                <span>{resposta.acoes?.length || 0}</span>
              </div>
              
              <div className={`flex items-center gap-1 text-xs rounded px-2 py-1 ${
                actualTheme === 'dark'
                  ? 'text-white/70 bg-slate-800/60'
                  : 'text-gray-600 bg-gray-50'
              }`}>
                <Clock className={`w-3 h-3 ${
                  actualTheme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`} />
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
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center ${
                  actualTheme === 'dark'
                    ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
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
