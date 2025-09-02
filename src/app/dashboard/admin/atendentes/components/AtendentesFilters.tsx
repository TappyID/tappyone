'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Download, RefreshCw, Users, Activity } from 'lucide-react'
import { useState } from 'react'
import { AtendenteComStats } from '@/hooks/useAtendentes'

interface AtendentesFiltersProps {
  filters: {
    search: string
    status: string
    tipo: string
  }
  onFiltersChange: (filters: any) => void
  atendentes: AtendenteComStats[]
}

export default function AtendentesFilters({ filters, onFiltersChange, atendentes }: AtendentesFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const statusOptions = [
    { value: 'todos', label: 'Todos Status', color: 'text-gray-600' },
    { value: 'ativo', label: 'Ativo', color: 'text-green-600' },
    { value: 'inativo', label: 'Inativo', color: 'text-red-600' }
  ]

  const tipoOptions = [
    { value: 'todos', label: 'Todos Tipos', color: 'text-gray-600' },
    { value: 'ADMIN', label: 'Admin', color: 'text-purple-600' },
    { value: 'ATENDENTE_COMERCIAL', label: 'Comercial', color: 'text-blue-600' },
    { value: 'ATENDENTE_FINANCEIRO', label: 'Financeiro', color: 'text-green-600' },
    { value: 'ATENDENTE_SUPORTE', label: 'Suporte', color: 'text-orange-600' },
    { value: 'ASSINANTE', label: 'Assinante', color: 'text-indigo-600' }
  ]

  // Dados reais não possuem departamentos e cargos

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'todos',
      tipo: 'todos'
    })
  }

  const hasActiveFilters = filters.search || 
    filters.status !== 'todos' || 
    filters.tipo !== 'todos'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <div className="space-y-4">
        {/* Linha principal de filtros */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Busca */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou departamento..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
            />
          </div>

          {/* Status Ativo/Inativo */}
          <div className="flex gap-2">
            {statusOptions.slice(1).map((status) => {
              const count = atendentes.filter(a => status.value === 'ativo' ? a.ativo : !a.ativo).length
              const isActive = filters.status === status.value
              
              return (
                <motion.button
                  key={status.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onFiltersChange({ 
                    ...filters, 
                    status: isActive ? 'todos' : status.value 
                  })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-[#305e73] text-white border-[#305e73] shadow-lg' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#305e73] hover:text-[#305e73]'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    status.value === 'ativo' ? 'bg-green-400' : 'bg-red-400'
                  } ${isActive ? 'bg-white' : ''}`} />
                  <span className="text-sm font-medium">{status.label}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Botões de ação */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                showAdvanced 
                  ? 'bg-[#305e73] text-white border-[#305e73]' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#305e73]'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtros</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Atualizar</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Exportar</span>
            </motion.button>
          </div>
        </div>

        {/* Tipo de Usuário */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Tipo de Usuário:</span>
          {tipoOptions.map((tipo) => {
            const count = tipo.value === 'todos' 
              ? atendentes.length 
              : atendentes.filter(a => a.tipo === tipo.value).length
            const isActive = filters.tipo === tipo.value
            
            return (
              <motion.button
                key={tipo.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onFiltersChange({ 
                  ...filters, 
                  tipo: tipo.value 
                })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  isActive 
                    ? 'bg-[#305e73] text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tipo.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
                }`}>
                  {count}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Filtros avançados - removidos pois dados reais não possuem departamento/cargo */}

        {/* Limpar filtros */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 text-blue-700">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                Filtros ativos - {atendentes.length} atendentes encontrados
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">Limpar</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
