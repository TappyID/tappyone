'use client'

import { motion } from 'framer-motion'
import { Search, Filter, X, CreditCard, Star, Crown, Building, Calendar } from 'lucide-react'
import { useState } from 'react'

interface AssinaturasFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterStatus: 'todas' | 'ativa' | 'expirada' | 'cancelada' | 'pendente' | 'suspensa'
  setFilterStatus: (status: 'todas' | 'ativa' | 'expirada' | 'cancelada' | 'pendente' | 'suspensa') => void
  filterTipo: string
  setFilterTipo: (tipo: string) => void
  filterPeriodo: string
  setFilterPeriodo: (periodo: string) => void
}

export default function AssinaturasFilters({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterTipo,
  setFilterTipo,
  filterPeriodo,
  setFilterPeriodo
}: AssinaturasFiltersProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const statusOptions = [
    { value: 'todas', label: 'Todas', color: 'bg-gray-100 text-gray-700' },
    { value: 'ativa', label: 'Ativas', color: 'bg-green-100 text-green-700' },
    { value: 'expirada', label: 'Expiradas', color: 'bg-red-100 text-red-700' },
    { value: 'pendente', label: 'Pendentes', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'suspensa', label: 'Suspensas', color: 'bg-orange-100 text-orange-700' },
    { value: 'cancelada', label: 'Canceladas', color: 'bg-gray-100 text-gray-700' }
  ]

  const tipoOptions = [
    { value: '', label: 'Todos os Tipos', icon: CreditCard },
    { value: 'basico', label: 'Básico', icon: Star },
    { value: 'premium', label: 'Premium', icon: Crown },
    { value: 'enterprise', label: 'Enterprise', icon: Building },
    { value: 'custom', label: 'Personalizado', icon: CreditCard }
  ]

  const periodoOptions = [
    { value: '', label: 'Todos os Períodos', icon: Calendar },
    { value: 'mensal', label: 'Mensal', icon: Calendar },
    { value: 'trimestral', label: 'Trimestral', icon: Calendar },
    { value: 'semestral', label: 'Semestral', icon: Calendar },
    { value: 'anual', label: 'Anual', icon: Calendar }
  ]

  const activeFiltersCount = [filterTipo, filterPeriodo].filter(Boolean).length + 
    (filterStatus !== 'todas' ? 1 : 0)

  const clearAllFilters = () => {
    setFilterStatus('todas')
    setFilterTipo('')
    setFilterPeriodo('')
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
            placeholder="Buscar por nome, telefone ou plano..."
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
              Tipo de Plano
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

          {/* Período Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período de Cobrança
            </label>
            <div className="flex flex-wrap gap-2">
              {periodoOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilterPeriodo(option.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all ${
                      filterPeriodo === option.value
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

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ações Rápidas
            </label>
            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFilterStatus('ativa')
                  setFilterTipo('premium')
                }}
                className="px-3 py-2 rounded-xl font-medium bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white hover:shadow-lg transition-all"
              >
                Premium Ativas
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFilterStatus('expirada')
                }}
                className="px-3 py-2 rounded-xl font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
              >
                Expiradas
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFilterPeriodo('anual')
                  setFilterStatus('ativa')
                }}
                className="px-3 py-2 rounded-xl font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
              >
                Anuais Ativas
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
