'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface ExpandableDataSectionProps {
  theme: string
  icon: string
  title: string
  count: number
  items: any[]
  onAddClick: () => void
  renderItem: (item: any) => React.ReactNode
}

export default function ExpandableDataSection({
  theme,
  icon,
  title,
  count,
  items,
  onAddClick,
  renderItem
}: ExpandableDataSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`rounded-lg overflow-hidden ${
      theme === 'dark' ? 'bg-slate-700/50' : 'bg-white border'
    }`}>
      {/* Header Clicável */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-3 flex items-center justify-between transition-colors ${
          theme === 'dark' 
            ? 'hover:bg-slate-700' 
            : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </span>
          {count > 0 && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              theme === 'dark' 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {count}
            </span>
          )}
        </div>
        
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* Conteúdo Expansível */}
      {isExpanded && (
        <div className={`border-t ${
          theme === 'dark' ? 'border-slate-600' : 'border-gray-200'
        }`}>
          {items.length > 0 ? (
            <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index}>
                  {renderItem(item)}
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-4 text-center ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <p className="text-sm mb-2">Nenhum {title.toLowerCase()} encontrado</p>
            </div>
          )}

          {/* Botão Adicionar */}
          <button
            onClick={onAddClick}
            className={`w-full p-2 text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-slate-700 hover:bg-slate-600 text-blue-400'
                : 'bg-gray-50 hover:bg-gray-100 text-blue-600'
            }`}
          >
            + Adicionar {title}
          </button>
        </div>
      )}
    </div>
  )
}
