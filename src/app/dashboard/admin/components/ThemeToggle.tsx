'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemeToggleProps {
  sidebarCollapsed?: boolean
}

export function ThemeToggle({ sidebarCollapsed = true }: ThemeToggleProps) {
  const { actualTheme, setTheme } = useTheme()

  return (
    <motion.div className="relative">
      <motion.button
        whileHover={{ scale: 1.1, rotate: actualTheme === 'dark' ? 180 : 0 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
        className={`w-10 h-10 flex items-center justify-center rounded-lg backdrop-blur-sm border transition-all duration-300 group ${
          sidebarCollapsed
            ? 'bg-white/70 border-white/20 hover:bg-white/90 hover:shadow-md text-gray-700'
            : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
        } shadow-sm hover:shadow-lg`}
        title={actualTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
      >
        <AnimatePresence mode="wait">
          {actualTheme === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Sun className={`w-4 h-4 transition-colors ${
                sidebarCollapsed
                  ? 'text-gray-700 group-hover:text-yellow-600'
                  : 'text-white group-hover:text-yellow-300'
              }`} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Moon className={`w-4 h-4 transition-colors ${
                sidebarCollapsed
                  ? 'text-gray-700 group-hover:text-blue-600'
                  : 'text-white group-hover:text-blue-300'
              }`} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Badge Theme */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border transition-all duration-300 ${
          actualTheme === 'dark' 
            ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 border-indigo-300/30' 
            : 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300/30'
        }`}
      >
        <span className="text-[10px] font-bold text-white drop-shadow-sm">
          {actualTheme === 'dark' ? '🌙' : '☀️'}
        </span>
      </motion.div>
    </motion.div>
  )
}
