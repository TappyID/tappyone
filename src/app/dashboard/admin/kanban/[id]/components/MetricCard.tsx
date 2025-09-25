'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  color: string
  theme: string
  onClick?: () => void
}

export default function MetricCard({
  icon: Icon,
  title,
  value,
  color,
  theme,
  onClick
}: MetricCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`p-3 rounded-lg transition-all duration-300 cursor-pointer ${
        theme === 'dark'
          ? 'bg-slate-800/60 hover:bg-slate-800/80 border border-slate-700/50'
          : 'bg-white hover:bg-gray-50 border border-gray-200'
      } backdrop-blur-sm shadow-sm hover:shadow-md`}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      style={{
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div className="flex items-center gap-2">
        <div 
          className="p-1.5 rounded-md"
          style={{ 
            backgroundColor: `${color}20`,
            color: color
          }}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium truncate ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {title}
          </p>
          <p className={`text-sm font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
