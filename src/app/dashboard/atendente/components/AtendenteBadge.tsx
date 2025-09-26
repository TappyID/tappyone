'use client'

import { motion } from 'framer-motion'
import { UserCheck } from 'lucide-react'

interface AtendenteBadgeProps {
  sidebarCollapsed?: boolean
}

export function AtendenteBadge({ sidebarCollapsed = true }: AtendenteBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 h-10 px-3 rounded-lg backdrop-blur-sm border transition-all duration-300 ${
        sidebarCollapsed
          ? 'bg-green-50/80 border-green-200/60 text-green-700'
          : 'bg-green-500/20 border-green-400/30 text-green-300'
      }`}
      title="Você está logado como Atendente"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className={`w-5 h-5 ${
          sidebarCollapsed ? 'text-green-600' : 'text-green-300'
        }`}
      >
        <UserCheck className="w-full h-full" />
      </motion.div>
      
      <span className={`text-sm font-medium ${
        sidebarCollapsed ? 'text-green-700' : 'text-green-200'
      }`}>
        Atendente
      </span>
      
      {/* Badge pulsante */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`w-2 h-2 rounded-full ${
          sidebarCollapsed ? 'bg-green-500' : 'bg-green-400'
        }`}
      />
    </motion.div>
  )
}

export default AtendenteBadge
