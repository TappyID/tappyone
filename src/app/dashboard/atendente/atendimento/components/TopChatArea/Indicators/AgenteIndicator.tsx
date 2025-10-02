'use client'

import React from 'react'
import { User } from 'lucide-react'

interface AgenteIndicatorProps {
  nome: string
  onClick: () => void
}

export default function AgenteIndicator({ nome, onClick }: AgenteIndicatorProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-1 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-sm
                 border border-indigo-400/30 transition-colors"
      title={`Agente: ${nome}`}
    >
      <User className="w-4 h-4 text-indigo-600" />

      <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full
                      border border-white">
      </div>
    </button>
  )
}
