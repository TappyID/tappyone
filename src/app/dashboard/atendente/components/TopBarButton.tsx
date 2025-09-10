'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface TopBarButtonProps {
  icon: LucideIcon
  onClick?: () => void
  sidebarCollapsed?: boolean
  badge?: number | boolean
  badgeColor?: string
  tooltip?: string
  isActive?: boolean
  children?: ReactNode
}

export function TopBarButton({ 
  icon: Icon, 
  onClick, 
  sidebarCollapsed = true, 
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
        className={`relative p-3 rounded-xl transition-all duration-200 group backdrop-blur-sm border ${
          sidebarCollapsed 
            ? `bg-white/70 border-white/20 shadow-sm hover:bg-white/90 hover:shadow-md ${isActive ? 'bg-white text-[#273155] shadow-md' : 'text-gray-600'}`
            : `bg-white/10 border-white/20 hover:bg-white/20 ${isActive ? 'bg-white/20 text-white' : 'text-white'}`
        }`}
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        title={tooltip}
      >
        <Icon 
          size={18} 
          className={`transition-colors duration-200 ${
            sidebarCollapsed 
              ? (isActive ? 'text-[#273155]' : 'text-gray-600 group-hover:text-[#273155]')
              : (isActive ? 'text-white' : 'text-white/90 group-hover:text-white')
          }`} 
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
