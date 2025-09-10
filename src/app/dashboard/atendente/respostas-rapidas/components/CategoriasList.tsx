'use client'

import { motion } from 'framer-motion'
import { 
  Settings, 
  Edit, 
  Trash2, 
  Tag,
  MoreVertical,
  Plus,
  Palette
} from 'lucide-react'
import { useState } from 'react'
import { CategoriaResposta } from '@/hooks/useRespostasRapidas'
import { useTheme } from '@/contexts/ThemeContext'

interface CategoriasListProps {
  categorias: CategoriaResposta[]
  loading: boolean
  onEdit: (categoria: CategoriaResposta) => void
  onDelete: (id: string) => void
  onCreateFirst?: () => void
}

export default function CategoriasList({ categorias, loading, onEdit, onDelete, onCreateFirst }: CategoriasListProps) {
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null)
  const { actualTheme } = useTheme()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-6 shadow-lg border backdrop-blur-xl transition-all duration-300 ${
              actualTheme === 'dark'
                ? 'bg-slate-900/60 border-slate-700/50 shadow-2xl shadow-black/50'
                : 'bg-white/80 border-gray-100'
            }`}
          >
            <div className="animate-pulse">
              <div className={`w-12 h-12 rounded-xl mb-4 ${
                actualTheme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
              }`}></div>
              <div className={`h-4 rounded mb-2 ${
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

  if (categorias.length === 0) {
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
          <Settings className={`w-12 h-12 ${
            actualTheme === 'dark' ? 'text-slate-400' : 'text-gray-400'
          }`} />
        </div>
        <h3 className={`text-xl font-semibold mb-2 ${
          actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Nenhuma categoria encontrada
        </h3>
        <p className={`mb-6 ${
          actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
        }`}>
          Organize suas respostas rápidas criando categorias personalizadas
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
          
          <Plus className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Criar Primeira Categoria</span>
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {categorias.map((categoria, index) => (
        <motion.div
          key={categoria.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 group relative overflow-hidden backdrop-blur-xl ${
            actualTheme === 'dark'
              ? 'bg-slate-900/60 border-slate-700/50 shadow-2xl shadow-black/50 hover:bg-slate-900/80 hover:border-slate-600/60'
              : 'bg-white/80 border-gray-100 hover:bg-white'
          }`}
        >
          {/* Background Color Accent */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: categoria.cor }}
          ></div>

          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: categoria.cor }}
              >
                <Tag className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <h3 className={`font-semibold truncate ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {categoria.nome}
                </h3>
                <p className={`text-xs ${
                  actualTheme === 'dark' ? 'text-white/60' : 'text-gray-500'
                }`}>
                  Ordem: {categoria.ordem}
                </p>
              </div>
            </div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedCategoria(
                  selectedCategoria === categoria.id ? null : categoria.id
                )}
                className={`p-2 rounded-lg transition-colors ${
                  actualTheme === 'dark'
                    ? 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                }`}
              >
                <MoreVertical className={`w-4 h-4 ${
                  actualTheme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                }`} />
              </motion.button>

              {/* Dropdown Menu */}
              {selectedCategoria === categoria.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className={`absolute right-0 top-10 rounded-xl shadow-lg border py-2 z-10 min-w-[140px] backdrop-blur-xl ${
                    actualTheme === 'dark'
                      ? 'bg-slate-900/90 border-slate-700/50 shadow-2xl shadow-black/50'
                      : 'bg-white/95 border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => {
                      onEdit(categoria)
                      setSelectedCategoria(null)
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
                  
                  <hr className={`my-2 ${
                    actualTheme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
                  }`} />
                  
                  <button
                    onClick={() => {
                      onDelete(categoria.id)
                      setSelectedCategoria(null)
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
          {categoria.descricao && (
            <p className={`text-sm mb-4 line-clamp-2 ${
              actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
            }`}>
              {categoria.descricao}
            </p>
          )}

          {/* Color Preview */}
          <div className="flex items-center gap-2 mb-4">
            <Palette className={`w-4 h-4 ${
              actualTheme === 'dark' ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <div className="flex items-center gap-2">
              <div 
                className={`w-4 h-4 rounded-full border-2 shadow-sm ${
                  actualTheme === 'dark' ? 'border-slate-600' : 'border-white'
                }`}
                style={{ backgroundColor: categoria.cor }}
              ></div>
              <span className={`text-xs font-mono ${
                actualTheme === 'dark' ? 'text-white/60' : 'text-gray-500'
              }`}>
                {categoria.cor}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className={`flex items-center justify-between text-xs mb-4 ${
            actualTheme === 'dark' ? 'text-white/50' : 'text-gray-500'
          }`}>
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              ID: {categoria.id.slice(0, 8)}...
            </div>
            
            <div>
              {new Date(categoria.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(categoria)}
              className="flex-1 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200"
            >
              <Edit className="w-4 h-4" />
              Editar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(categoria.id)}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                actualTheme === 'dark'
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Status Indicator */}
          <div className="absolute top-4 right-4">
            {categoria.ativo ? (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            ) : (
              <div className={`w-2 h-2 rounded-full ${
                actualTheme === 'dark' ? 'bg-slate-600' : 'bg-gray-400'
              }`}></div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
