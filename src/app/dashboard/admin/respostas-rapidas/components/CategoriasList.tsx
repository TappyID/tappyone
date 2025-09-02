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

interface CategoriasListProps {
  categorias: CategoriaResposta[]
  loading: boolean
  onEdit: (categoria: CategoriaResposta) => void
  onDelete: (id: string) => void
}

export default function CategoriasList({
  categorias,
  loading,
  onEdit,
  onDelete
}: CategoriasListProps) {
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Settings className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Nenhuma categoria encontrada
        </h3>
        <p className="text-gray-600 mb-6">
          Organize suas respostas rápidas criando categorias personalizadas
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          Criar Primeira Categoria
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
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
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
                <h3 className="font-semibold text-gray-900 truncate">
                  {categoria.nome}
                </h3>
                <p className="text-xs text-gray-500">
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
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </motion.button>

              {/* Dropdown Menu */}
              {selectedCategoria === categoria.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 min-w-[140px]"
                >
                  <button
                    onClick={() => {
                      onEdit(categoria)
                      setSelectedCategoria(null)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  
                  <hr className="my-2" />
                  
                  <button
                    onClick={() => {
                      onDelete(categoria.id)
                      setSelectedCategoria(null)
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
          {categoria.descricao && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {categoria.descricao}
            </p>
          )}

          {/* Color Preview */}
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: categoria.cor }}
              ></div>
              <span className="text-xs text-gray-500 font-mono">
                {categoria.cor}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
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
              className="bg-red-100 text-red-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Status Indicator */}
          <div className="absolute top-4 right-4">
            {categoria.ativo ? (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            ) : (
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
