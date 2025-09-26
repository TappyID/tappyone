'use client'

import React from 'react'
import { DollarSign } from 'lucide-react'
import { useIndicatorData } from './useIndicatorData'

interface OrcamentosIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function OrcamentosIndicator({ contatoId, onClick }: OrcamentosIndicatorProps) {
  const { count } = useIndicatorData(contatoId, 'orcamentos')
  
  if (!contatoId) return null

  return (
    <button
      onClick={onClick}
      className="relative p-1 rounded-sm border transition-colors bg-green-500/20 hover:bg-green-500/30 border-green-400/30"
      title={`${count} orçamento${count !== 1 ? 's' : ''}`}
    >
      <DollarSign className="w-4 h-4 text-green-600" />
      
      {/* Badge com contador */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center bg-green-500">
        <span className="text-xs font-bold text-white">{count}</span>
      </div>
    </button>
  )
}