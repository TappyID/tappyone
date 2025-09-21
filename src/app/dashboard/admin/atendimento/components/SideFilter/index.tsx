'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, ChevronDown } from 'lucide-react'

import SearchInput from './SearchInput'
import FilterTags from './FilterTags'
import FilterFilas from './FilterFilas'
import FilterKanban from './FilterKanban'
import FilterTickets from './FilterTickets'
import FilterAgendamentos from './FilterAgendamentos'

interface SideFilterProps {
  // Search
  searchQuery: string
  onSearchChange: (query: string) => void
  
  // Tags Filter
  selectedTag: string
  onTagChange: (tagId: string) => void
  tags: any[]
  
  // Filas Filter  
  selectedFila: string
  onFilaChange: (filaId: string) => void
  filas: any[]
  
  // Loading states
  isLoadingTags?: boolean
  isLoadingFilas?: boolean
  
  // Layout
  isCollapsed?: boolean
}

export default function SideFilter({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  tags,
  selectedFila,
  onFilaChange,
  filas,
  isLoadingTags = false,
  isLoadingFilas = false,
  isCollapsed = false
}: SideFilterProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Modo colapsado - só mostra ícone
  if (isCollapsed) {
    return (
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="w-full p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 
                     dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Filtros"
        >
          <Filter className="w-4 h-4 mx-auto text-gray-600 dark:text-gray-400" />
        </motion.button>
      </div>
    )
  }

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
      {/* Barra de Pesquisa */}
      <SearchInput 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      {/* Botão de Filtros Avançados */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 
                   dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtros Avançados
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transform transition-transform ${
          showAdvancedFilters ? 'rotate-180' : ''
        }`} />
      </motion.button>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="space-y-3 overflow-hidden"
        >
          {/* Filtro de Tags */}
          <FilterTags
            selectedTag={selectedTag}
            onTagChange={onTagChange}
            tags={tags}
            isLoading={isLoadingTags}
          />

          {/* Filtro de Filas */}
          <FilterFilas
            selectedFila={selectedFila}
            onFilaChange={onFilaChange}
            filas={filas}
            isLoading={isLoadingFilas}
          />

          {/* Filtro de Kanban */}
          <FilterKanban
            selectedQuadro={'todos'}
            onQuadroChange={() => {}}
            quadros={[
              { id: '1', nome: 'Vendas', cor: '#10B981', colunas: 4 },
              { id: '2', nome: 'Suporte', cor: '#3B82F6', colunas: 3 }
            ]}
          />

          {/* Filtro de Tickets */}
          <FilterTickets
            selectedStatus={'todos'}
            onStatusChange={() => {}}
            ticketStatuses={[
              { id: '1', nome: 'Aberto', cor: '#F59E0B', count: 12 },
              { id: '2', nome: 'Em Andamento', cor: '#3B82F6', count: 5 },
              { id: '3', nome: 'Resolvido', cor: '#10B981', count: 23 }
            ]}
          />

          {/* Filtro de Agendamentos */}
          <FilterAgendamentos
            selectedPeriodo={'todos'}
            onPeriodoChange={() => {}}
            agendamentoPeriodos={[
              { id: '1', nome: 'Hoje', count: 8 },
              { id: '2', nome: 'Esta Semana', count: 25 },
              { id: '3', nome: 'Este Mês', count: 67 }
            ]}
          />

          {/* TODO: Outros filtros em desenvolvimento */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              🚧 Em desenvolvimento: FilterOrcamentos, FilterAgentes, FilterConexao, FilterAssinatura
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
