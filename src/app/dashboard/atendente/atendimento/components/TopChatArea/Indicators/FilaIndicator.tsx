'use client'

import React from 'react'
import { Users } from 'lucide-react'
import { motion } from 'framer-motion'

interface FilaIndicatorProps {
  chatId?: string | null
  onClick: () => void
}

export default function FilaIndicator({ chatId, onClick }: FilaIndicatorProps) {
  if (!chatId) return null

  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800"
      title="Gerenciar Fila"
    >
      <div className="relative">
        <Users className="w-5 h-5 transition-colors text-indigo-600" />

        {/* Indicator dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border border-white dark:border-gray-800"
        />
      </div>
    </motion.button>
  )
}
