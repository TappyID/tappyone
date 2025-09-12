'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
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
  Share2,
  Users
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

interface Contato {
  id: string
  nome: string
  numeroTelefone: string
  tags?: Array<{
    id: string
    contatoId: string
    tagId: string
    tag_id?: string  // Para compatibilidade backend
    Tag?: {          // Dados da tag preloadada
      id: string
      nome: string
    }
  }>
}

interface TagsListProps {
  tags: TagData[]
  viewMode: 'grid' | 'list'
  selectedTags: string[]
  contatos?: Contato[]
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
  contatos = [],
  onSelectedTagsChange,
  onEditTag,
  onDeleteTag,
  onToggleFavorito,
  onToggleStatus
}: TagsListProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [hoveredTag, setHoveredTag] = useState<string | null>(null)
  
  // Função para contar contatos associados a uma tag
  const getContatosCount = (tagId: string) => {
    const count = contatos.filter(contato => {
      if (!contato.tags || contato.tags.length === 0) return false
      
      // Verificar se há tags com este tagId (suportar diferentes formatos)
      const hasTag = contato.tags.some(tag => 
        tag.tagId === tagId || tag.tag_id === tagId || tag.Tag?.id === tagId
      )
      
      if (hasTag) {
      }
      
      return hasTag
    }).length
    
    console.log(`📊 Tag ${tagId} tem ${count} contatos associados`)
    return count
  }

  const handleSelectTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onSelectedTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onSelectedTagsChange([...selectedTags, tagId])
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não informada'
    
    try {
      // Tentar diferentes formatos de data
      let date = new Date(dateString)
      
      // Se a data é inválida, tentar parseamento manual
      if (isNaN(date.getTime())) {
        // Tentar formato ISO sem timezone
        date = new Date(dateString.replace('Z', ''))
      }
      
      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return 'Data inválida'
    }
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
        className={`rounded-2xl p-12 text-center shadow-sm border ${
          isDark 
            ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 border-slate-600' 
            : 'bg-white border-gray-200'
        }`}
      >
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          isDark ? 'bg-slate-700' : 'bg-gray-100'
        }`}>
          <Tag className={`w-10 h-10 ${
            isDark ? 'text-gray-400' : 'text-gray-400'
          }`} />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Nenhuma tag encontrada</h3>
        <p className={`mb-6 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Não há tags que correspondam aos filtros selecionados.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-xl font-semibold ${
            isDark 
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white' 
              : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white'
          }`}
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
            className={`rounded-2xl p-6 shadow-sm border-2 transition-all duration-300 cursor-pointer ${
              selectedTags.includes(tag.id)
                ? (isDark 
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-[#305e73] bg-[#305e73]/5')
                : (isDark 
                    ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 border-slate-600 hover:border-slate-500 hover:shadow-2xl hover:shadow-slate-900/20'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg')
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
                    <h3 className={`font-bold truncate ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{tag.nome}</h3>
                    {tag.favorito && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                    )}
                  </div>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-500'
                  }`}>{tag.categoria}</p>
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
                      : (isDark 
                          ? 'text-gray-400 hover:bg-slate-700' 
                          : 'text-gray-400 hover:bg-gray-100')
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
                      : (isDark 
                          ? 'text-gray-400 hover:bg-slate-700' 
                          : 'text-gray-400 hover:bg-gray-100')
                  }`}
                >
                  {tag.ativo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>

            {/* Description */}
            {tag.descricao && (
              <p className={`text-sm mb-4 line-clamp-2 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {tag.descricao}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {tag.uso_count} usos
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {getContatosCount(tag.id)} contatos
                  </span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                tag.ativo 
                  ? (isDark ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-green-100 text-green-700') 
                  : (isDark ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-gray-100 text-gray-600')
              }`}>
                {tag.ativo ? 'Ativa' : 'Inativa'}
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-between pt-4 border-t ${
              isDark ? 'border-slate-600' : 'border-gray-100'
            }`}>
              <div className={`flex items-center gap-2 text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
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
                      className={`p-1 rounded transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:text-blue-400 hover:bg-slate-700' 
                          : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
                      }`}
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
                      className={`p-1 rounded transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:text-green-400 hover:bg-slate-700' 
                          : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                      }`}
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
                      className={`p-1 rounded transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:text-red-400 hover:bg-slate-700' 
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
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
                className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-emerald-500' : 'bg-[#305e73]'
                }`}
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
    <div className={`rounded-2xl shadow-sm border overflow-hidden ${
      isDark 
        ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 border-slate-600' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDark 
          ? 'bg-slate-700/50 border-slate-600' 
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className={`grid grid-cols-12 gap-4 text-sm font-semibold ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}>
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
      <div className={`divide-y ${
        isDark ? 'divide-slate-600' : 'divide-gray-100'
      }`}>
        {tags.map((tag, index) => (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`px-6 py-4 transition-colors ${
              selectedTags.includes(tag.id) 
                ? (isDark ? 'bg-emerald-900/20' : 'bg-[#305e73]/5') 
                : (isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50')
            }`}
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Checkbox */}
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => handleSelectTag(tag.id)}
                  className={`rounded focus:ring-2 ${
                    isDark 
                      ? 'border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500' 
                      : 'border-gray-300 text-[#305e73] focus:ring-[#305e73]'
                  }`}
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
                      <span className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{tag.nome}</span>
                      {tag.favorito && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    {tag.descricao && (
                      <p className={`text-sm truncate max-w-[200px] ${
                        isDark ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {tag.descricao}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Categoria */}
              <div className="col-span-2">
                <span className={`px-2 py-1 rounded-lg text-sm ${
                  isDark ? 'bg-slate-600 text-gray-200' : 'bg-gray-100 text-gray-700'
                }`}>
                  {tag.categoria}
                </span>
              </div>

              {/* Usos */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{tag.uso_count}</span>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    tag.ativo ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                  <span className={`text-sm ${
                    tag.ativo 
                      ? (isDark ? 'text-green-400' : 'text-green-700') 
                      : (isDark ? 'text-gray-400' : 'text-gray-500')
                  }`}>
                    {tag.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>

              {/* Criado */}
              <div className="col-span-1">
                <span className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
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
                        : (isDark 
                            ? 'text-gray-400 hover:bg-slate-600' 
                            : 'text-gray-400 hover:bg-gray-100')
                    }`}
                  >
                    <Star className={`w-4 h-4 ${tag.favorito ? 'fill-current' : ''}`} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEditTag(tag)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-gray-400 hover:text-green-400 hover:bg-slate-600' 
                        : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDeleteTag(tag.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark 
                        ? 'text-gray-400 hover:text-red-400 hover:bg-slate-600' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
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
