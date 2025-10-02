'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface PriceRange {
  id: string
  label: string
  min: number
  max: number | null
  count?: number
}

interface FilterPrecosProps {
  selectedRange: string
  onRangeChange: (rangeId: string) => void
  priceRanges: PriceRange[]
  isLoading?: boolean
}

export default function FilterPrecos({
  selectedRange,
  onRangeChange,
  priceRanges,
  isLoading = false
}: FilterPrecosProps) {
  
  // Função para obter ícone baseado no valor
  const getRangeIcon = (min: number) => {
    if (min === 0) return <TrendingDown className="w-3.5 h-3.5" />
    if (min > 5000) return <TrendingUp className="w-3.5 h-3.5" />
    return <DollarSign className="w-3.5 h-3.5" />
  }
  
  // Função para obter cor baseada no valor
  const getRangeColor = (min: number) => {
    if (min === 0) return 'text-gray-500'
    if (min <= 500) return 'text-green-500'
    if (min <= 1000) return 'text-blue-500'
    if (min <= 5000) return 'text-purple-500'
    if (min <= 10000) return 'text-orange-500'
    return 'text-red-500'
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Opção "Todos" */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onRangeChange('todos')}
        className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
          selectedRange === 'todos'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}
      >
        <DollarSign className="w-4 h-4" />
        <span className="flex-1 text-left text-sm font-medium">Todos os valores</span>
      </motion.button>

      {/* Faixas de preço */}
      {priceRanges.map((range) => {
        const isSelected = selectedRange === range.id
        const colorClass = getRangeColor(range.min)
        
        return (
          <motion.button
            key={range.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRangeChange(range.id)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
              isSelected
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className={`${isSelected ? 'text-green-600' : colorClass}`}>
              {getRangeIcon(range.min)}
            </div>
            
            <div className="flex-1 text-left">
              <span className="text-sm font-medium">{range.label}</span>
            </div>
            
            {range.count !== undefined && range.count > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                isSelected
                  ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {range.count}
              </span>
            )}
          </motion.button>
        )
      })}
      
      {/* Informação adicional */}
      <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Filtra conversas com orçamentos na faixa selecionada
        </p>
      </div>
    </div>
  )
}
