'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronDown } from 'lucide-react'

interface FilterAgendamentosProps {
  selectedPeriodo: string
  onPeriodoChange: (periodo: string) => void
  agendamentoPeriodos: Array<{
    id: string
    nome: string
    count?: number
  }>
  isLoading?: boolean
}

export default function FilterAgendamentos({ 
  selectedPeriodo, 
  onPeriodoChange, 
  agendamentoPeriodos, 
  isLoading = false 
}: FilterAgendamentosProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedPeriodoData = agendamentoPeriodos.find(p => p.id === selectedPeriodo)

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
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">
            {isLoading ? 'Carregando...' : 
              selectedPeriodo === 'todos' ? 'Todos os Períodos' : 
              selectedPeriodoData?.nome || 'Selecionar Período'
            }
          </span>
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
                onPeriodoChange('todos')
                setIsOpen(false)
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                         transition-colors flex items-center gap-2 ${
                selectedPeriodo === 'todos' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Todos os Períodos</span>
            </button>

            {/* Lista de Períodos */}
            {agendamentoPeriodos.map(periodo => (
              <button
                key={periodo.id}
                onClick={() => {
                  onPeriodoChange(periodo.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 
                           transition-colors flex items-center gap-2 ${
                  selectedPeriodo === periodo.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{periodo.nome}</span>
                {periodo.count && (
                  <span className="ml-auto text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 
                                   px-2 py-1 rounded-full">
                    {periodo.count}
                  </span>
                )}
              </button>
            ))}

            {/* Estado vazio */}
            {agendamentoPeriodos.length === 0 && !isLoading && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Nenhum período encontrado
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
