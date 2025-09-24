'use client'

import React, { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface KanbanBoardProps {
  theme: string
  children: ReactNode
  boardId?: string
}

export default function KanbanBoard({ theme, children, boardId = 'kanban-scroll-container' }: KanbanBoardProps) {
  return (
    <div className="p-6">
      {/* Container com botões de navegação estilo Netflix */}
      <div className="relative group">
        {/* Botão Scroll Esquerda */}
        <button
          onClick={() => {
            const container = document.getElementById(boardId)
            if (container) {
              container.scrollBy({ left: -320, behavior: 'smooth' })
            }
          }}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 ${
            theme === 'dark'
              ? 'bg-slate-800/90 hover:bg-slate-700/90 text-white shadow-lg'
              : 'bg-white/90 hover:bg-gray-50/90 text-gray-700 shadow-lg'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Container Scroll Horizontal */}
        <div 
          id={boardId}
          className="overflow-x-auto pb-4 snap-x snap-mandatory custom-scrollbar"
          style={{ 
            scrollbarWidth: 'thin',
            scrollBehavior: 'smooth'
          }}
        >
          {/* Container das Colunas */}
          <div className="flex gap-6 min-w-max">
            {children}
          </div>
        </div>

        {/* Botão Scroll Direita */}
        <button
          onClick={() => {
            const container = document.getElementById(boardId)
            if (container) {
              container.scrollBy({ left: 320, behavior: 'smooth' })
            }
          }}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 ${
            theme === 'dark'
              ? 'bg-slate-800/90 hover:bg-slate-700/90 text-white shadow-lg'
              : 'bg-white/90 hover:bg-gray-50/90 text-gray-700 shadow-lg'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3B82F6, #1D4ED8);
          border-radius: 4px;
          transition: background 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #1D4ED8, #1E40AF);
        }
      `}</style>
    </div>
  )
}
