'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hash, ChevronDown } from 'lucide-react'

interface FilterTagsProps {
  selectedTag: string
  onTagChange: (tagId: string) => void
  tags: Array<{
    id: string
    nome: string
    cor?: string
  }>
  isLoading?: boolean
}

export default function FilterTags({ 
  selectedTag, 
  onTagChange, 
  tags, 
  isLoading = false 
}: FilterTagsProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Garantir que tags seja um array
  const tagsArray = Array.isArray(tags) ? tags : []
  const selectedTagData = tagsArray.find(tag => tag.id === selectedTag)

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border border-gray-300 
                   dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800
                   hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        disabled={isLoading}
      >
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">
            {isLoading ? 'Carregando...' : 
              selectedTag === 'todas' ? 'Todas as Tags' : 
              selectedTagData?.nome || 'Selecionar Tag'
            }
          </span>
          {selectedTagData?.cor && (
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedTagData.cor }}
            />
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transform transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 
                       border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg 
                       z-50 max-h-60 overflow-y-auto"
          >
            {/* Opção "Todas" */}
            <button
              onClick={() => {
                onTagChange('todas')
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-colors flex items-center gap-2 ${
                selectedTag === 'todas' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Todas as Tags</span>
            </button>

            {/* Lista de Tags */}
            {tagsArray.map(tag => (
              <button
                key={tag.id}
                onClick={() => {
                  onTagChange(tag.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                           transition-colors flex items-center gap-2 ${
                  selectedTag === tag.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.cor || '#6b7280' }}
                />
                <span className="text-sm">{tag.nome}</span>
              </button>
            ))}

            {/* Estado vazio */}
            {tags.length === 0 && !isLoading && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Nenhuma tag encontrada
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
