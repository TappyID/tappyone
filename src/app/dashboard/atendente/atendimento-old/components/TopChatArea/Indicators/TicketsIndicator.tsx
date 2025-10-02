'use client'

import React from 'react'
import { Ticket } from 'lucide-react'
import { useIndicatorData } from './useIndicatorData'

interface TicketsIndicatorProps {
  contatoId?: string | null
  onClick: () => void
}

export default function TicketsIndicator({ contatoId, onClick }: TicketsIndicatorProps) {
  const { count } = useIndicatorData(contatoId, 'tickets')
  
  if (!contatoId) return null

  return (
    <button
      onClick={onClick}
      className="relative p-1 rounded-sm border transition-colors bg-orange-500/20 hover:bg-orange-500/30 border-orange-400/30"
      title={`${count} ticket${count !== 1 ? 's' : ''}`}
    >
      <Ticket className="w-4 h-4 text-orange-600" />
      
      {/* Badge com contador */}
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white flex items-center justify-center bg-orange-500">
        <span className="text-xs font-bold text-white">{count}</span>
      </div>
    </button>
  )
}