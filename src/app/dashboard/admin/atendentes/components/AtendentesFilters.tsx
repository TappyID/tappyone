'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Download, RefreshCw, Users, Activity } from 'lucide-react'
import { useState } from 'react'
import { Atendente } from '../page'

interface AtendentesFiltersProps {
  filters: {
    search: string
    status: string
    statusAtendimento: string
    departamento: string
    cargo: string
  }
  onFiltersChange: (filters: any) => void
  atendentes: Atendente[]
}

export default function AtendentesFilters({ filters, onFiltersChange, atendentes }: AtendentesFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const statusOptions = [
    { value: 'todos', label: 'Todos Status', color: 'text-gray-600' },
    { value: 'online', label: 'Online', color: 'text-green-600' },
    { value: 'ocupado', label: 'Ocupado', color: 'text-yellow-600' },
    { value: 'ausente', label: 'Ausente', color: 'text-orange-600' },
    { value: 'offline', label: 'Offline', color: 'text-gray-500' }
  ]

  const statusAtendimentoOptions = [
    { value: 'todos', label: 'Todos', color: 'text-gray-600' },
    { value: 'disponivel', label: 'Disponível', color: 'text-green-600' },
    { value: 'em_atendimento', label: 'Em Atendimento', color: 'text-blue-600' },
    { value: 'em_pausa', label: 'Em Pausa', color: 'text-yellow-600' },
    { value: 'finalizando', label: 'Finalizando', color: 'text-purple-600' }
  ]

  const departamentos = Array.from(new Set(atendentes.map(a => a.departamento)))
  const cargos = Array.from(new Set(atendentes.map(a => a.cargo)))

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'todos',
      statusAtendimento: 'todos',
      departamento: 'todos',
      cargo: 'todos'
    })
  }

  const hasActiveFilters = filters.search || 
    filters.status !== 'todos' || 
    filters.statusAtendimento !== 'todos' ||
    filters.departamento !== 'todos' ||
    filters.cargo !== 'todos'

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

          {/* Status Online */}
          <div className="flex gap-2">
            {statusOptions.slice(1).map((status) => {
              const count = atendentes.filter(a => a.status === status.value).length
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
                    status.value === 'online' ? 'bg-green-400' :
                    status.value === 'ocupado' ? 'bg-yellow-400' :
                    status.value === 'ausente' ? 'bg-orange-400' : 'bg-gray-400'
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

        {/* Status de Atendimento */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Status de Atendimento:</span>
          {statusAtendimentoOptions.map((status) => {
            const count = status.value === 'todos' 
              ? atendentes.length 
              : atendentes.filter(a => a.statusAtendimento === status.value).length
            const isActive = filters.statusAtendimento === status.value
            
            return (
              <motion.button
                key={status.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onFiltersChange({ 
                  ...filters, 
                  statusAtendimento: status.value 
                })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  isActive 
                    ? 'bg-[#305e73] text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{status.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
                }`}>
                  {count}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Filtros avançados */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200 pt-4 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <select
                    value={filters.departamento}
                    onChange={(e) => onFiltersChange({ ...filters, departamento: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                  >
                    <option value="todos">Todos os Departamentos</option>
                    {departamentos.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <select
                    value={filters.cargo}
                    onChange={(e) => onFiltersChange({ ...filters, cargo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                  >
                    <option value="todos">Todos os Cargos</option>
                    {cargos.map(cargo => (
                      <option key={cargo} value={cargo}>
                        {cargo.charAt(0).toUpperCase() + cargo.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
