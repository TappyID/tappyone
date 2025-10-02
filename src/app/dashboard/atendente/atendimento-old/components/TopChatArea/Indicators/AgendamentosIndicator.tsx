'use client'

import React from 'react'
import { Calendar } from 'lucide-react'
import { useIndicatorData } from './useIndicatorData'

interface AgendamentosIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function AgendamentosIndicator({ contatoId, onClick }: AgendamentosIndicatorProps) {
  const { count } = useIndicatorData(contatoId, 'agendamentos')
  
  if (!contatoId) return null

  return (
    <button
      onClick={onClick}
      className="relative p-1 rounded-sm border transition-colors bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/30"
      title={`${count} agendamento${count !== 1 ? 's' : ''}`}
    >
      <Calendar className="w-4 h-4 text-blue-600" />
      
      {/* Badge com contador */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center bg-blue-500">
        <span className="text-xs font-bold text-white">{count}</span>
      </div>
    </button>
  )
}