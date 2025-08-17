'use client'

import { motion } from 'framer-motion'
import { Search, Filter, X, Bell, Shield, Cpu, MessageSquare, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

interface AlertasFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterStatus: 'todos' | 'ativo' | 'pausado' | 'resolvido'
  setFilterStatus: (status: 'todos' | 'ativo' | 'pausado' | 'resolvido') => void
  filterTipo: string
  setFilterTipo: (tipo: string) => void
  filterPrioridade: string
  setFilterPrioridade: (prioridade: string) => void
}

export default function AlertasFilters({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterTipo,
  setFilterTipo,
  filterPrioridade,
  setFilterPrioridade
}: AlertasFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const statusOptions = [
    { value: 'todos', label: 'Todos', color: 'bg-gray-100 text-gray-700' },
    { value: 'ativo', label: 'Ativos', color: 'bg-green-100 text-green-700' },
    { value: 'pausado', label: 'Pausados', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'resolvido', label: 'Resolvidos', color: 'bg-blue-100 text-blue-700' }
  ]

  const tipoOptions = [
    { value: '', label: 'Todos os Tipos', icon: Bell },
    { value: 'sistema', label: 'Sistema', icon: Cpu },
    { value: 'usuario', label: 'Usuário', icon: MessageSquare },
    { value: 'seguranca', label: 'Segurança', icon: Shield },
    { value: 'performance', label: 'Performance', icon: AlertTriangle },
    { value: 'integracao', label: 'Integração', icon: Bell }
  ]

  const prioridadeOptions = [
    { value: '', label: 'Todas', color: 'bg-gray-100 text-gray-700' },
    { value: 'baixa', label: 'Baixa', color: 'bg-green-100 text-green-700' },
    { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-700' },
    { value: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-700' }
  ]

  const activeFiltersCount = [filterTipo, filterPrioridade].filter(Boolean).length + 
    (filterStatus !== 'todos' ? 1 : 0)

  const clearAllFilters = () => {
    setFilterStatus('todos')
    setFilterTipo('')
    setFilterPrioridade('')
    setSearchQuery('')
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 space-y-6">
      {/* Search and Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar alertas por título ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar filtros ({activeFiltersCount})
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-[#305e73] text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-white text-[#305e73] text-xs px-2 py-1 rounded-full font-bold">
                {activeFiltersCount}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Status Filter - Always Visible */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilterStatus(option.value as any)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterStatus === option.value
                ? 'bg-[#305e73] text-white shadow-lg'
                : option.color + ' hover:shadow-md'
            }`}
          >
            {option.label}
          </motion.button>
        ))}
      </div>

      {/* Advanced Filters */}
      <motion.div
        initial={false}
        animate={{
          height: showAdvancedFilters ? 'auto' : 0,
          opacity: showAdvancedFilters ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="space-y-4 pt-2">
          {/* Tipo Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Alerta
            </label>
            <div className="flex flex-wrap gap-2">
              {tipoOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilterTipo(option.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all ${
                      filterTipo === option.value
                        ? 'bg-[#305e73] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {option.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Prioridade Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <div className="flex flex-wrap gap-2">
              {prioridadeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilterPrioridade(option.value)}
                  className={`px-3 py-2 rounded-xl font-medium transition-all ${
                    filterPrioridade === option.value
                      ? 'bg-[#305e73] text-white shadow-lg'
                      : option.color + ' hover:shadow-md'
                  }`}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
