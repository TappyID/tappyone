'use client'

import React, { ReactNode } from 'react'

interface ProfileInfoCardProps {
  theme: string
  icon: string
  title: string
  content: string | ReactNode
}

export default function ProfileInfoCard({
  theme,
  icon,
  title,
  content
}: ProfileInfoCardProps) {
  return (
    <div className={`p-3 rounded-lg ${
      theme === 'dark' ? 'bg-slate-700/50' : 'bg-white'
    }`}>
      <h5 className={`text-sm font-medium mb-2 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {icon} {title}
      </h5>
      
      {typeof content === 'string' ? (
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {content}
        </p>
      ) : (
        content
      )}
    </div>
  )
}
