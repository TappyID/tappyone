'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check } from 'lucide-react'
import { useColorTheme } from '@/contexts/ColorThemeContext'
import { TopBarButton } from './TopBarButton'

interface ColorThemeSelectorProps {
  sidebarCollapsed?: boolean
}

export function ColorThemeSelector({ sidebarCollapsed = true }: ColorThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { colorTheme, setColorTheme, colorThemes } = useColorTheme()

  const handleThemeSelect = (theme: any) => {
    setColorTheme(theme)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <TopBarButton
        icon={Palette}
        onClick={() => setIsOpen(!isOpen)}
        sidebarCollapsed={sidebarCollapsed}
        tooltip={`Cores: ${colorTheme.name}`}
      />

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Tema de Cores</h3>
                <p className="text-sm text-gray-600 mt-1">Escolha a paleta de cores</p>
              </div>

              {/* Theme Options */}
              <div className="p-4 space-y-3">
                {colorThemes.map((theme, index) => (
                  <motion.button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                      colorTheme.id === theme.id 
                        ? 'bg-gray-50 border-2 border-gray-200' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {theme.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-gray-200 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{theme.name}</span>
                    </div>
                    {colorTheme.id === theme.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Check size={16} style={{ color: colorTheme.primary }} />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  As cores serão aplicadas em toda a interface
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
