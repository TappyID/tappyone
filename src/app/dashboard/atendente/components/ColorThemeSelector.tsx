'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'
import { motion } from 'framer-motion'
import { useColorTheme } from '@/contexts/ColorThemeContext'
import { ColorThemeModal } from './ColorThemeModal'

export function ColorThemeSelector() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { colorTheme } = useColorTheme()

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05, rotate: 10 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-lg backdrop-blur-sm border transition-all duration-300 bg-white/10 border-white/20 hover:bg-white/20 text-white shadow-sm hover:shadow-lg"
        title="Personalizar Cores"
      >
        <Palette className="w-4 h-4" />
      </motion.button>
      
      {/* Badge com a cor do tema ativo */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border-2 border-white/30"
        style={{ 
          backgroundColor: colorTheme.primary,
          boxShadow: `0 0 10px ${colorTheme.primary}40`
        }}
      >
        <div className="w-3 h-3 rounded-full bg-white/20" />
      </motion.div>
      
      <ColorThemeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
