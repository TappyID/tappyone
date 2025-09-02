'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Plus, Search, Hash } from 'lucide-react'
import { useTags } from '@/hooks/useTags'

interface TagsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tags: any[]) => void
  contactData?: {
    id?: string
    nome?: string
    telefone?: string
  }
  currentTags?: any[]
}

interface TagOption {
  id: string
  name: string
  color: string
  count: number
}

export default function TagsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  contactData,
  currentTags = []
}: TagsModalProps) {
  const [selectedTags, setSelectedTags] = useState<any[]>(currentTags)
  const [searchTerm, setSearchTerm] = useState('')
  const [newTag, setNewTag] = useState('')
  const [showCreateTag, setShowCreateTag] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Buscar tags reais do backend
  const { tags, createTag, loading } = useTags()

  useEffect(() => {
    setSelectedTags(currentTags)
  }, [currentTags])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(selectedTags)
    onClose()
  }

  const toggleTag = (tag: any) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id)
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id)
      } else {
        return [...prev, tag]
      }
    })
  }

  const handleCreateNewTag = async () => {
    if (newTag.trim() && !tags.find(tag => tag.nome.toLowerCase() === newTag.toLowerCase())) {
      setIsLoading(true)
      try {
        const newTagData = await createTag({
          nome: newTag.trim(),
          cor: '#6366F1',
          descricao: '',
          categoria: 'geral'
        })
        setSelectedTags(prev => [...prev, newTagData])
        setNewTag('')
        setShowCreateTag(false)
      } catch (error) {
        console.error('Erro ao criar tag:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const filteredTags = tags.filter(tag =>
    tag.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTagColor = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId) || selectedTags.find(t => t.id === tagId)
    return tag?.cor || '#6366F1'
  }

  const isTagSelected = (tagId: string) => {
    return selectedTags.some(t => t.id === tagId)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#273155] to-[#2a3660] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Gerenciar Tags</h2>
                      <p className="text-blue-100 text-sm">
                        {contactData?.nome ? `Organizando: ${contactData.nome}` : 'Organize e categorize o contato'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                      placeholder="Buscar tags existentes..."
                    />
                  </div>

                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Tags Selecionadas ({selectedTags.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <motion.button
                            key={tag.id}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleTag(tag)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg"
                            style={{ backgroundColor: tag.cor }}
                          >
                            <Hash className="w-3 h-3" />
                            {tag.nome}
                            <X className="w-3 h-3 hover:bg-white/20 rounded" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Tags Disponíveis
                      </h3>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateTag(!showCreateTag)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#273155] text-white rounded-lg hover:bg-[#2a3660] transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Nova Tag
                      </motion.button>
                    </div>

                    {/* Create New Tag */}
                    <AnimatePresence>
                      {showCreateTag && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                              placeholder="Nome da nova tag..."
                              onKeyPress={(e) => e.key === 'Enter' && handleCreateNewTag()}
                            />
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleCreateNewTag}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Criar
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tags Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                      {filteredTags.map((tag) => (
                        <motion.button
                          key={tag.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleTag(tag)}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            isTagSelected(tag.id)
                              ? 'border-[#273155] shadow-lg transform scale-105'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            backgroundColor: isTagSelected(tag.id) 
                              ? tag.cor 
                              : 'white',
                            color: isTagSelected(tag.id) ? 'white' : '#374151'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Hash className="w-4 h-4" />
                            <span className="font-medium text-sm">{tag.nome}</span>
                          </div>
                          <div className={`text-xs ${
                            isTagSelected(tag.id) ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            Tag ativa
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {filteredTags.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma tag encontrada</p>
                        <p className="text-sm">Tente buscar por outro termo ou crie uma nova tag</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#273155] to-[#2a3660] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                    >
                      Salvar Tags ({selectedTags.length})
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
