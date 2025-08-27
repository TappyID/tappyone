'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Workflow } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import FluxoCard from './FluxoCard'

interface Fluxo {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  created_at: string
  updated_at: string
  quadro_id?: string
  nos_count?: number
  execucoes_count?: number
  ultima_execucao?: string
}

interface ViewFluxosTabProps {
  fluxos: Fluxo[]
  loading: boolean
  onToggleFluxo: (id: string, ativo: boolean) => void
  onExecuteFluxo: (id: string) => void
  filterStatus: 'all' | 'active' | 'inactive'
  onFilterChange: (status: 'all' | 'active' | 'inactive') => void
}

export default function ViewFluxosTab({ 
  fluxos, 
  loading, 
  onToggleFluxo, 
  onExecuteFluxo,
  filterStatus,
  onFilterChange 
}: ViewFluxosTabProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const primaryColor = 'blue'

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-12"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className={`inline-flex rounded-lg p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            {[
              { key: 'all', label: 'Todos' },
              { key: 'active', label: 'Ativos' },
              { key: 'inactive', label: 'Inativos' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => onFilterChange(filter.key as any)}
                className={`px-4 py-2 rounded-md text-sm transition-all ${
                  filterStatus === filter.key
                    ? `bg-${primaryColor}-500 text-white`
                    : `${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fluxos Grid */}
      {fluxos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}
        >
          <Workflow className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Nenhum fluxo encontrado
          </h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            Crie seu primeiro fluxo de automação
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fluxos.map((fluxo, index) => (
            <FluxoCard
              key={fluxo.id}
              fluxo={fluxo}
              index={index}
              onToggle={onToggleFluxo}
              onExecute={onExecuteFluxo}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
