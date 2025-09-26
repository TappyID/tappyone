'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface FilasFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterStatus: 'todas' | 'ativas' | 'inativas'
  setFilterStatus: (status: 'todas' | 'ativas' | 'inativas') => void
  filterPrioridade: string
  setFilterPrioridade: (prioridade: string) => void
  filterIntegracao: string
  setFilterIntegracao: (integracao: string) => void
}

export default function FilasFilters({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterPrioridade,
  setFilterPrioridade,
  filterIntegracao,
  setFilterIntegracao
}: FilasFiltersProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const clearFilters = () => {
    setSearchQuery('')
    setFilterStatus('todas')
    setFilterPrioridade('')
    setFilterIntegracao('')
    setShowAdvancedFilters(false)
  }

  const hasActiveFilters = searchQuery || filterStatus !== 'todas' || filterPrioridade || filterIntegracao

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`rounded-2xl p-6 shadow-lg ${
        isDark 
          ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border border-slate-600/50' 
          : 'bg-white border border-gray-100'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-1 w-full">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Buscar filas por nome ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white focus:ring-emerald-500 focus:bg-slate-600 placeholder-gray-400'
                  : 'border-gray-200 focus:ring-[#305e73] focus:border-transparent bg-gray-50 focus:bg-white'
              }`}
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
          
          {/* Advanced Filters Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
              showAdvancedFilters || hasActiveFilters
                ? isDark
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-[#305e73]/10 border-[#305e73]/30 text-[#305e73]'
                : isDark
                  ? 'bg-slate-600 border-slate-500 text-gray-300 hover:bg-slate-500'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-2 h-2 rounded-full ${
                  isDark ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
              />
            )}
          </motion.button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearFilters}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                isDark
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20'
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Limpar</span>
            </motion.button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2">
          {(['todas', 'ativas', 'inativas'] as const).map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                filterStatus === status
                  ? isDark
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-sm'
                    : 'bg-[#305e73]/10 text-[#305e73] border-[#305e73]/30 shadow-sm'
                  : isDark
                    ? 'text-gray-400 hover:bg-slate-600 border-transparent'
                    : 'text-gray-600 hover:bg-gray-100 border-transparent'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`mt-6 pt-6 border-t ${
              isDark ? 'border-gray-600' : 'border-gray-200'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Prioridade Filter */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Prioridade</label>
                <select
                  value={filterPrioridade}
                  onChange={(e) => setFilterPrioridade(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white focus:ring-emerald-500 focus:bg-slate-600'
                      : 'border-gray-200 focus:ring-[#305e73] focus:border-transparent bg-gray-50 focus:bg-white'
                  }`}
                >
                  <option value="">Todas as prioridades</option>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              {/* Integração Filter */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Integração</label>
                <select
                  value={filterIntegracao}
                  onChange={(e) => setFilterIntegracao(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-all duration-200 ${
                    isDark
                      ? 'bg-slate-700 border-slate-600 text-white focus:ring-emerald-500 focus:bg-slate-600'
                      : 'border-gray-200 focus:ring-[#305e73] focus:border-transparent bg-gray-50 focus:bg-white'
                  }`}
                >
                  <option value="">Todas as integrações</option>
                  <option value="chatbot">ChatBot</option>
                  <option value="kanban">Kanban</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              {/* Ordenação */}
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>Ordenação</label>
                <select className={`w-full px-3 py-2 border rounded-lg focus:ring-2 transition-all duration-200 ${
                  isDark
                    ? 'bg-slate-700 border-slate-600 text-white focus:ring-emerald-500 focus:bg-slate-600'
                    : 'border-gray-200 focus:ring-[#305e73] focus:border-transparent bg-gray-50 focus:bg-white'
                }`}>
                  <option value="nome">Nome (A-Z)</option>
                  <option value="nome-desc">Nome (Z-A)</option>
                  <option value="criacao">Mais recentes</option>
                  <option value="criacao-desc">Mais antigas</option>
                  <option value="prioridade">Prioridade</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
