'use client'

import React from 'react'
import { Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useIndicatorData } from './useIndicatorData'
import { normalizeTags } from '@/utils/tags'

interface SimpleTagsIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function SimpleTagsIndicator({ contatoId, onClick }: SimpleTagsIndicatorProps) {
  const { count, data } = useIndicatorData(contatoId, 'tags')
  const normalized = normalizeTags(data)
  const normalizedCount = normalized.length

  if (!contatoId) return null

  // Criar tooltip com nomes das tags
  const tagsTooltip = normalizedCount > 0
    ? `Tags (${normalizedCount}): ${normalized.map(tag => tag.nome).join(', ')}`
    : `Nenhuma tag`

  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm border ${
        normalizedCount > 0
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
      title={tagsTooltip}
    >
      <div className="relative">
        <Tag className={`w-5 h-5 transition-colors ${
          normalizedCount > 0 ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-600'
        }`} />

        {/* Badge com contador */}
        {normalizedCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full flex items-center justify-center bg-emerald-500 border-2 border-white dark:border-gray-800"
          >
            <span className="text-[10px] font-bold text-white px-1">{normalizedCount > 99 ? '99+' : normalizedCount}</span>
          </motion.div>
        )}
      </div>
    </motion.button>
  )
}
