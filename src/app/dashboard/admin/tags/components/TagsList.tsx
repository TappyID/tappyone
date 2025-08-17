'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Tag,
  Edit,
  Trash2,
  Star,
  Eye,
  EyeOff,
  MoreVertical,
  Hash,
  TrendingUp,
  Calendar,
  User,
  Copy,
  Share2
} from 'lucide-react'

interface TagData {
  id: string
  nome: string
  descricao?: string
  cor: string
  categoria: string
  uso_count: number
  criado_em: string
  criado_por: string
  ativo: boolean
  favorito: boolean
}

interface TagsListProps {
  tags: TagData[]
  viewMode: 'grid' | 'list'
  selectedTags: string[]
  onSelectedTagsChange: (tags: string[]) => void
  onEditTag: (tag: TagData) => void
  onDeleteTag: (id: string) => void
  onToggleFavorito: (id: string) => void
  onToggleStatus: (id: string) => void
}

export default function TagsList({
  tags,
  viewMode,
  selectedTags,
  onSelectedTagsChange,
  onEditTag,
  onDeleteTag,
  onToggleFavorito,
  onToggleStatus
}: TagsListProps) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null)

  const handleSelectTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onSelectedTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onSelectedTagsChange([...selectedTags, tagId])
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const copyTagName = (nome: string) => {
    navigator.clipboard.writeText(nome)
    // Aqui você poderia adicionar um toast de confirmação
  }

  if (tags.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200"
      >
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Tag className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma tag encontrada</h3>
        <p className="text-gray-600 mb-6">
          Não há tags que correspondam aos filtros selecionados.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-semibold"
        >
          Criar primeira tag
        </motion.button>
      </motion.div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tags.map((tag, index) => (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onMouseEnter={() => setHoveredTag(tag.id)}
            onMouseLeave={() => setHoveredTag(null)}
            className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 cursor-pointer ${
              selectedTags.includes(tag.id)
                ? 'border-[#305e73] bg-[#305e73]/5'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
            }`}
            onClick={() => handleSelectTag(tag.id)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center border-4 border-white shadow-lg"
                  style={{ backgroundColor: tag.cor }}
                >
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 truncate">{tag.nome}</h3>
                    {tag.favorito && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{tag.categoria}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorito(tag.id)
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    tag.favorito 
                      ? 'text-yellow-500 hover:bg-yellow-50' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <Star className={`w-4 h-4 ${tag.favorito ? 'fill-current' : ''}`} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStatus(tag.id)
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    tag.ativo 
                      ? 'text-green-500 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  {tag.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>

            {/* Description */}
            {tag.descricao && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {tag.descricao}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {tag.uso_count} usos
                </span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                tag.ativo 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tag.ativo ? 'Ativa' : 'Inativa'}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(tag.criado_em)}</span>
              </div>

              {/* Quick Actions */}
              <AnimatePresence>
                {hoveredTag === tag.id && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-1"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        copyTagName(tag.nome)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditTag(tag)
                      }}
                      className="p-1 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded"
                    >
                      <Edit className="w-3 h-3" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteTag(tag.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selection Indicator */}
            {selectedTags.includes(tag.id) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-[#305e73] rounded-full flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-3 h-3 bg-white rounded-full"
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  // List View
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedTags.length === tags.length}
              onChange={(e) => {
                if (e.target.checked) {
                  onSelectedTagsChange(tags.map(tag => tag.id))
                } else {
                  onSelectedTagsChange([])
                }
              }}
              className="rounded border-gray-300 text-[#305e73] focus:ring-[#305e73]"
            />
          </div>
          <div className="col-span-3">Tag</div>
          <div className="col-span-2">Categoria</div>
          <div className="col-span-2">Usos</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Criado</div>
          <div className="col-span-1">Ações</div>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {tags.map((tag, index) => (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
              selectedTags.includes(tag.id) ? 'bg-[#305e73]/5' : ''
            }`}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Checkbox */}
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleSelectTag(tag.id)}
                  className="rounded border-gray-300 text-[#305e73] focus:ring-[#305e73]"
                />
              </div>

              {/* Tag Info */}
              <div className="col-span-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-white shadow-sm"
                    style={{ backgroundColor: tag.cor }}
                  >
                    <Tag className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{tag.nome}</span>
                      {tag.favorito && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    {tag.descricao && (
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">
                        {tag.descricao}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Categoria */}
              <div className="col-span-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  {tag.categoria}
                </span>
              </div>

              {/* Usos */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{tag.uso_count}</span>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    tag.ativo ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className={`text-sm ${
                    tag.ativo ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {tag.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>

              {/* Criado */}
              <div className="col-span-1">
                <span className="text-sm text-gray-500">
                  {formatDate(tag.criado_em)}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onToggleFavorito(tag.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      tag.favorito 
                        ? 'text-yellow-500 hover:bg-yellow-50' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${tag.favorito ? 'fill-current' : ''}`} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEditTag(tag)}
                    className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDeleteTag(tag.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
