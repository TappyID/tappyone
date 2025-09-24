'use client'

import React from 'react'
import { X } from 'lucide-react'

interface ProfileHeaderProps {
  theme: string
  onClose: () => void
}

export default function ProfileHeader({ theme, onClose }: ProfileHeaderProps) {
  return (
    <div className={`p-4 border-b ${
      theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Informações do Contato
        </h3>
        <button
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
