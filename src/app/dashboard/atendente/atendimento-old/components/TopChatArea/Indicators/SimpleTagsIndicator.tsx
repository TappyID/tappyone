'use client'

import React from 'react'
import { Tag } from 'lucide-react'
import { useIndicatorData } from './useIndicatorData'

interface SimpleTagsIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function SimpleTagsIndicator({ contatoId, onClick }: SimpleTagsIndicatorProps) {
  const { count, data } = useIndicatorData(contatoId, 'tags')
  
  if (!contatoId) return null
  
  // Criar tooltip com nomes das tags
  const tagsTooltip = count > 0 
    ? `Tags (${count}): ${data.map(tag => tag.nome).join(', ')}`
    : `Nenhuma tag`

  return (
    <button
      onClick={onClick}
      className="relative p-1 rounded-sm border transition-colors bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/30"
      title={tagsTooltip}
    >
      <Tag className="w-4 h-4 text-emerald-600" />
      
      {/* Badge com contador */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center bg-emerald-500">
        <span className="text-xs font-bold text-white">{count}</span>
      </div>
    </button>
  )
}