'use client'

import React from 'react'

interface ProfileActionButtonProps {
  theme: string
  icon: string
  text: string
  onClick: () => void
}

export default function ProfileActionButton({
  theme,
  icon,
  text,
  onClick
}: ProfileActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg text-left transition-colors ${
        theme === 'dark'
          ? 'bg-slate-700 hover:bg-slate-600 text-white'
          : 'bg-white hover:bg-gray-50 text-gray-900 border'
      }`}
    >
      {icon} {text}
    </button>
  )
}
