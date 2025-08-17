'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Check } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface ColorPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentColor: string
  onColorSelect: (color: string) => void
  columnName: string
}

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  isOpen,
  onClose,
  currentColor,
  onColorSelect,
  columnName
}) => {
  const { theme } = useTheme()

  // Paleta de cores expandida e organizada
  const colorPalette = [
    // Azuis
    { color: '#3b82f6', name: 'Azul Clássico' },
    { color: '#1d4ed8', name: 'Azul Profundo' },
    { color: '#0ea5e9', name: 'Azul Céu' },
    { color: '#06b6d4', name: 'Ciano' },
    
    // Verdes
    { color: '#10b981', name: 'Verde Esmeralda' },
    { color: '#059669', name: 'Verde Floresta' },
    { color: '#65a30d', name: 'Verde Lima' },
    { color: '#84cc16', name: 'Verde Claro' },
    
    // Roxos
    { color: '#8b5cf6', name: 'Roxo Violeta' },
    { color: '#7c3aed', name: 'Roxo Profundo' },
    { color: '#a855f7', name: 'Roxo Magenta' },
    { color: '#c084fc', name: 'Roxo Claro' },
    
    // Vermelhos/Rosas
    { color: '#ef4444', name: 'Vermelho' },
    { color: '#dc2626', name: 'Vermelho Escuro' },
    { color: '#ec4899', name: 'Rosa Pink' },
    { color: '#f97316', name: 'Laranja' },
    
    // Amarelos
    { color: '#eab308', name: 'Amarelo Ouro' },
    { color: '#f59e0b', name: 'Âmbar' },
    { color: '#84cc16', name: 'Lima' },
    { color: '#22c55e', name: 'Verde Neon' },
    
    // Neutros
    { color: '#6b7280', name: 'Cinza' },
    { color: '#374151', name: 'Cinza Escuro' },
    { color: '#1f2937', name: 'Carvão' },
    { color: '#111827', name: 'Preto' }
  ]

  const handleColorSelect = (color: string) => {
    onColorSelect(color)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={`relative w-full max-w-lg rounded-2xl border shadow-2xl ${
              theme === 'dark'
                ? 'bg-slate-800/95 border-slate-700/50'
                : 'bg-white/95 border-gray-200/50'
            } backdrop-blur-md overflow-hidden`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b ${
              theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                  }`}>
                    <Palette className={`w-5 h-5 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Escolher Cor
                    </h2>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Coluna: {columnName}
                    </p>
                  </div>
                </div>
                
                <motion.button
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Color Grid */}
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4">
                {colorPalette.map(({ color, name }) => (
                  <motion.button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`relative group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      currentColor === color
                        ? 'border-white shadow-lg ring-4 ring-blue-500/30'
                        : theme === 'dark'
                          ? 'border-slate-700/50 hover:border-slate-600/80'
                          : 'border-gray-200/50 hover:border-gray-300/80'
                    }`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    title={name}
                  >
                    {/* Color Circle */}
                    <div
                      className="w-12 h-12 rounded-full shadow-lg border-2 border-white/20"
                      style={{ backgroundColor: color }}
                    />
                    
                    {/* Color Name */}
                    <span className={`text-xs font-medium text-center leading-tight ${
                      theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                    }`}>
                      {name}
                    </span>

                    {/* Selected Indicator */}
                    {currentColor === color && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15, stiffness: 300 }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}

                    {/* Hover Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `linear-gradient(135deg, ${color}10, ${color}05)`
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t ${
              theme === 'dark' ? 'border-slate-700/50 bg-slate-800/50' : 'border-gray-200/50 bg-gray-50/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: currentColor }}
                  />
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                    Cor atual: {colorPalette.find(c => c.color === currentColor)?.name || 'Personalizada'}
                  </span>
                </div>
                
                <motion.button
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ColorPickerModal
