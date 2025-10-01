'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface TopBarButtonProps {
  icon: LucideIcon
  onClick?: () => void
  badge?: number | boolean
  badgeColor?: string
  tooltip?: string
  isActive?: boolean
  children?: ReactNode
}

export function TopBarButton({ 
  icon: Icon, 
  onClick, 
  badge, 
  badgeColor = 'bg-red-500',
  tooltip,
  isActive = false,
  children 
}: TopBarButtonProps) {
  return (
    <div className="relative group">
      <motion.button
        onClick={onClick}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group backdrop-blur-sm border border-white/20 shadow-sm hover:shadow-lg ${
          isActive 
            ? 'bg-white/20 text-white' 
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={tooltip}
      >
        <Icon 
          size={18} 
          className="transition-colors duration-200 text-white" 
        />
        
        {/* Badge */}
        {badge && (
          <motion.div
            className={`absolute -top-1.5 -right-1.5 ${badgeColor} text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center font-medium shadow-lg border-2 border-white`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {typeof badge === 'number' ? (badge > 99 ? '99+' : badge) : ''}
          </motion.div>
        )}
      </motion.button>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/90"></div>
        </div>
      )}

      {/* Dropdown content */}
      {children}
    </div>
  )
}
