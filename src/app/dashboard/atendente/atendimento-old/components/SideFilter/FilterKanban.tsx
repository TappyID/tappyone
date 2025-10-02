'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Kanban, ChevronDown } from 'lucide-react'

interface FilterKanbanProps {
  selectedQuadro: string
  onQuadroChange: (quadroId: string) => void
  quadros: Array<{
    id: string
    nome: string
    cor?: string
    colunas?: number
  }>
  isLoading?: boolean
}

export default function FilterKanban({ 
  selectedQuadro, 
  onQuadroChange, 
  quadros, 
  isLoading = false 
}: FilterKanbanProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Garantir que quadros seja um array
  const quadrosArray = Array.isArray(quadros) ? quadros : []
  const selectedQuadroData = quadrosArray.find(quadro => quadro.id === selectedQuadro)

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
          <Kanban className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">
            {isLoading ? 'Carregando...' : 
              selectedQuadro === 'todos' ? 'Todos os Quadros' : 
              selectedQuadroData?.nome || 'Selecionar Quadro'
            }
          </span>
          {selectedQuadroData?.cor && (
            <div 
              className="w-3 h-3 rounded-sm border"
              style={{ backgroundColor: selectedQuadroData.cor }}
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
            {/* Opção "Todos" */}
            <button
              onClick={() => {
                onQuadroChange('todos')
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-colors flex items-center gap-2 ${
                selectedQuadro === 'todos' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <Kanban className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Todos os Quadros</span>
            </button>

            {/* Lista de Quadros */}
            {quadrosArray.map(quadro => (
              <button
                key={quadro.id}
                onClick={() => {
                  onQuadroChange(quadro.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                           transition-colors ${
                  selectedQuadro === quadro.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                style={{ 
                  borderLeft: `4px solid ${quadro.cor || '#6b7280'}`,
                  marginLeft: '8px',
                  paddingLeft: '12px'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{quadro.nome}</span>
                  {quadro.colunas && (
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 
                                     px-2 py-1 rounded-full">
                      {quadro.colunas} colunas
                    </span>
                  )}
                </div>
              </button>
            ))}

            {/* Estado vazio */}
            {quadros.length === 0 && !isLoading && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Nenhum quadro encontrado
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
