'use client'

import React from 'react'
import { StickyNote } from 'lucide-react'
import { useIndicatorData } from './useIndicatorData'

interface AnotacoesIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function AnotacoesIndicator({ contatoId, onClick }: AnotacoesIndicatorProps) {
  const { count } = useIndicatorData(contatoId, 'anotacoes')
  
  if (!contatoId) return null

  return (
    <button
      onClick={onClick}
      className="relative p-1 rounded-sm border transition-colors bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/30"
      title={`${count} anotaç${count !== 1 ? 'ões' : 'ão'}`}
    >
      <StickyNote className="w-4 h-4 text-purple-600" />
      
      {/* Badge com contador */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center bg-purple-500">
        <span className="text-xs font-bold text-white">{count}</span>
      </div>
    </button>
  )
}