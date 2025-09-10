'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarToggleProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className="absolute -right-3 top-8 z-50 flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isCollapsed ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <ChevronLeft 
          className="w-3 h-3 text-gray-600 group-hover:text-[#273155] transition-colors duration-200" 
          strokeWidth={2.5}
        />
      </motion.div>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 bg-[#273155] rounded-full opacity-0"
        initial={{ scale: 0 }}
        whileTap={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  )
}
