'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Check, Plus, Sliders, Sparkles } from 'lucide-react'
import { useColorTheme } from '@/contexts/ColorThemeContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useState } from 'react'
import { CustomColorEditor } from './CustomColorEditor'

interface ColorThemeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ColorThemeModal({ isOpen, onClose }: ColorThemeModalProps) {
  const { colorTheme, setColorTheme, colorThemes } = useColorTheme()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -100 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              mass: 0.8
            }}
            className="fixed left-1/2 top-20 -translate-x-1/2 z-[60] w-full max-w-2xl"
          >
            <div className={`rounded-3xl shadow-2xl border overflow-hidden ${
              theme === 'dark'
                ? 'bg-slate-800/95 border-slate-600/50'
                : 'bg-white/95 border-gray-200/50'
            } backdrop-blur-xl`}>
              {/* Header */}
              <div className={`p-6 border-b ${
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      theme === 'dark'
                        ? 'bg-gradient-to-br from-slate-700 to-slate-600'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      <Palette className={`w-6 h-6 ${
                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Personalizar Cores
                      </h2>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Escolha um tema de cores para o dashboard
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className={`p-2 rounded-xl transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Tabs */}
              <div className={`px-6 pt-4 flex gap-2 border-b ${
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => setActiveTab('presets')}
                  className={`px-4 py-2 font-semibold rounded-t-xl transition-all ${
                    activeTab === 'presets'
                      ? theme === 'dark'
                        ? 'bg-slate-700 text-white'
                        : 'bg-white text-blue-600 shadow-sm'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Temas Prontos
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('custom')}
                  className={`px-4 py-2 font-semibold rounded-t-xl transition-all ${
                    activeTab === 'custom'
                      ? theme === 'dark'
                        ? 'bg-slate-700 text-white'
                        : 'bg-white text-blue-600 shadow-sm'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Criar Personalizado
                  </div>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'presets' ? (
                  /* Temas Prontos */
                  <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {colorThemes.map((themeOption) => {
                    const isActive = colorTheme.id === themeOption.id

                    return (
                      <motion.button
                        key={themeOption.id}
                        onClick={() => setColorTheme(themeOption)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative p-6 rounded-2xl border-2 transition-all ${
                          isActive
                            ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                            : theme === 'dark'
                            ? 'border-slate-600 hover:border-slate-500'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${
                          theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50/50'
                        }`}
                      >
                        {/* Check Icon */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}

                        {/* Theme Name */}
                        <div className={`mb-4 font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {themeOption.name}
                        </div>

                        {/* Color Squares */}
                        <div className="flex gap-2 mb-3">
                          {themeOption.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded-lg shadow-md"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        {/* Gradient Preview */}
                        <div
                          className="h-16 rounded-xl shadow-inner"
                          style={{
                            background: `linear-gradient(135deg, ${themeOption.primary}, ${themeOption.secondary})`
                          }}
                        />
                      </motion.button>
                    )
                  })}
                </div>

                {/* Info */}
                <div className={`mt-6 p-4 rounded-xl ${
                    theme === 'dark'
                      ? 'bg-blue-900/20 border border-blue-600/30'
                      : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                      💡 <strong>Dica:</strong> As cores selecionadas serão aplicadas na TopBar, Sidebar e outros elementos do dashboard.
                    </p>
                  </div>
                  </>
                ) : (
                  /* Editor Customizado */
                  <CustomColorEditor />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
