'use client'

import React from 'react'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { useIndicatorData } from './useIndicatorData'

interface AgendamentosIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function AgendamentosIndicator({ contatoId, onClick }: AgendamentosIndicatorProps) {
  const { count } = useIndicatorData(contatoId, 'agendamentos')
  
  if (!contatoId) return null

  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm border ${
        count > 0
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
      title={`${count} agendamento${count !== 1 ? 's' : ''}`}
    >
      <div className="relative">
        <Calendar className={`w-5 h-5 transition-colors ${
          count > 0 ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
        }`} />
        
        {/* Badge com contador */}
        {count > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full flex items-center justify-center bg-blue-500 border-2 border-white dark:border-gray-800"
          >
            <span className="text-[10px] font-bold text-white px-1">{count > 99 ? '99+' : count}</span>
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}