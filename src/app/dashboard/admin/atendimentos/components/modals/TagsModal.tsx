'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Plus, Search, Hash } from 'lucide-react'

interface TagsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tags: string[]) => void
  contactData?: {
    nome?: string
    telefone?: string
  }
  currentTags?: string[]
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
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags)
  const [searchTerm, setSearchTerm] = useState('')
  const [newTag, setNewTag] = useState('')
  const [showCreateTag, setShowCreateTag] = useState(false)

  // Tags predefinidas (normalmente viriam do backend)
  const [availableTags] = useState<TagOption[]>([
    { id: '1', name: 'Cliente VIP', color: '#FFD700', count: 45 },
    { id: '2', name: 'Interessado', color: '#4CAF50', count: 128 },
    { id: '3', name: 'Negociação', color: '#FF9800', count: 67 },
    { id: '4', name: 'Problema Técnico', color: '#F44336', count: 23 },
    { id: '5', name: 'Suporte', color: '#2196F3', count: 89 },
    { id: '6', name: 'Vendas', color: '#9C27B0', count: 156 },
    { id: '7', name: 'Financeiro', color: '#607D8B', count: 34 },
    { id: '8', name: 'Urgente', color: '#E91E63', count: 12 },
    { id: '9', name: 'Follow-up', color: '#00BCD4', count: 78 },
    { id: '10', name: 'Cancelamento', color: '#795548', count: 19 },
    { id: '11', name: 'Renovação', color: '#8BC34A', count: 56 },
    { id: '12', name: 'Demo', color: '#FF5722', count: 41 }
  ])

  useEffect(() => {
    setSelectedTags(currentTags)
  }, [currentTags])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(selectedTags)
    onClose()
  }

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(tag => tag !== tagName)
        : [...prev, tagName]
    )
  }

  const createNewTag = () => {
    if (newTag.trim() && !availableTags.find(tag => tag.name.toLowerCase() === newTag.toLowerCase())) {
      const newTagObj: TagOption = {
        id: Date.now().toString(),
        name: newTag.trim(),
        color: '#6366F1',
        count: 1
      }
      availableTags.push(newTagObj)
      setSelectedTags(prev => [...prev, newTag.trim()])
      setNewTag('')
      setShowCreateTag(false)
    }
  }

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTagColor = (tagName: string) => {
    const tag = availableTags.find(t => t.name === tagName)
    return tag?.color || '#6366F1'
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
                        {selectedTags.map((tagName) => (
                          <motion.button
                            key={tagName}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleTag(tagName)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg"
                            style={{ backgroundColor: getTagColor(tagName) }}
                          >
                            <Hash className="w-3 h-3" />
                            {tagName}
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
                              onKeyPress={(e) => e.key === 'Enter' && createNewTag()}
                            />
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={createNewTag}
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
                          onClick={() => toggleTag(tag.name)}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            selectedTags.includes(tag.name)
                              ? 'border-[#273155] shadow-lg transform scale-105'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            backgroundColor: selectedTags.includes(tag.name) 
                              ? tag.color 
                              : 'white',
                            color: selectedTags.includes(tag.name) ? 'white' : '#374151'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Hash className="w-4 h-4" />
                            <span className="font-medium text-sm">{tag.name}</span>
                          </div>
                          <div className={`text-xs ${
                            selectedTags.includes(tag.name) ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {tag.count} contatos
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
