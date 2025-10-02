'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Tag } from 'lucide-react'

interface ButtonTagSideChatProps {
  onClick: (e: React.MouseEvent) => void
  tags?: Array<{
    id: string
    nome: string
    cor?: string
  }>
  isLoading?: boolean
}

export default function ButtonTagSideChat({
  onClick,
  tags = [],
  isLoading = false
}: ButtonTagSideChatProps) {
  const hasMultipleTags = tags.length > 1
  const firstTag = tags[0]

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="relative p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg
                 border border-emerald-400/30 transition-colors"
      title={`Gerenciar Tags${tags.length > 0 ? ` (${tags.length})` : ''}`}
      disabled={isLoading}
    >
      <Tag className="w-3 h-3 text-emerald-400" />

      {/* Badge de quantidade de tags */}
      {tags.length > 0 && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full
                        border border-white dark:border-gray-800 flex items-center justify-center">
          <span className="text-xs font-bold text-white">
            {tags.length > 9 ? '9+' : tags.length}
          </span>
        </div>
      )}

      {/* Indicador visual da primeira tag */}
      {firstTag?.cor && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-gray-800"
          style={{ backgroundColor: firstTag.cor }}
        />
      )}

      {/* Indicador de múltiplas tags */}
      {hasMultipleTags && (
        <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-emerald-600 rounded-full
                        border border-white dark:border-gray-800" />
      )}
    </motion.button>
  )
}
