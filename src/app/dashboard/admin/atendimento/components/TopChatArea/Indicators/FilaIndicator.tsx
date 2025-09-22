'use client'

import React from 'react'
import { Users } from 'lucide-react'

interface FilaIndicatorProps {
  nome: string
  onClick: () => void
}

export default function FilaIndicator({ nome, onClick }: FilaIndicatorProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-sm 
                 border border-purple-400/30 transition-colors"
      title={`Fila: ${nome}`}
    >
      <Users className="w-4 h-4 text-purple-600" />
      
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full 
                      border border-white">
      </div>
    </button>
  )
}
