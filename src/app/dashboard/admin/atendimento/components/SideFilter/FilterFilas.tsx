'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, ChevronDown } from 'lucide-react'

interface FilterFilasProps {
  selectedFila: string
  onFilaChange: (filaId: string) => void
  filas: Array<{
    id: string
    nome: string
    cor?: string
    atendentes?: any[]
  }>
  isLoading?: boolean
}

export default function FilterFilas({ 
  selectedFila, 
  onFilaChange, 
  filas, 
  isLoading = false 
}: FilterFilasProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedFilaData = filas.find(fila => fila.id === selectedFila)

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
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">
            {isLoading ? 'Carregando...' : 
              selectedFila === 'todas' ? 'Todas as Filas' : 
              selectedFilaData?.nome || 'Selecionar Fila'
            }
          </span>
          {selectedFilaData?.cor && (
            <div 
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: selectedFilaData.cor }}
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
                onFilaChange('todas')
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-colors flex items-center gap-2 ${
                selectedFila === 'todas' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Todas as Filas</span>
            </button>

            {/* Lista de Filas */}
            {filas.map(fila => (
              <button
                key={fila.id}
                onClick={() => {
                  onFilaChange(fila.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                           transition-colors ${
                  selectedFila === fila.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                style={{ 
                  borderLeft: `4px solid ${fila.cor || '#6b7280'}`,
                  marginLeft: '8px',
                  paddingLeft: '12px'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{fila.nome}</span>
                  {fila.atendentes && (
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 
                                     px-2 py-1 rounded-full">
                      {fila.atendentes.length} atendentes
                    </span>
                  )}
                </div>
              </button>
            ))}

            {/* Estado vazio */}
            {filas.length === 0 && !isLoading && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Nenhuma fila encontrada
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
