'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Sparkles, Paintbrush, Layers } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface KanbanColorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function KanbanColorModal({ isOpen, onClose }: KanbanColorModalProps) {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'board' | 'columns' | 'cards'>('board')
  
  // Estados para cores
  const [boardBgPrimary, setBoardBgPrimary] = useState('#273155')
  const [boardBgSecondary, setBoardBgSecondary] = useState('#2a3660')
  const [boardBgImage, setBoardBgImage] = useState('')
  
  const [columnBgPrimary, setColumnBgPrimary] = useState('#ffffff')
  const [columnBgSecondary, setColumnBgSecondary] = useState('#f8fafc')
  const [columnBorder, setColumnBorder] = useState('#e2e8f0')
  
  const [cardBgPrimary, setCardBgPrimary] = useState('#ffffff')
  const [cardBgSecondary, setCardBgSecondary] = useState('#fefefe')
  const [cardBorder, setCardBorder] = useState('#e5e7eb')
  const [cardHoverBg, setCardHoverBg] = useState('#f9fafb')

  const handleSave = () => {
    const kanbanColors = {
      board: {
        bgPrimary: boardBgPrimary,
        bgSecondary: boardBgSecondary,
        bgImage: boardBgImage
      },
      columns: {
        bgPrimary: columnBgPrimary,
        bgSecondary: columnBgSecondary,
        border: columnBorder
      },
      cards: {
        bgPrimary: cardBgPrimary,
        bgSecondary: cardBgSecondary,
        border: cardBorder,
        hoverBg: cardHoverBg
      }
    }
    
    localStorage.setItem('kanbanColors', JSON.stringify(kanbanColors))
    window.dispatchEvent(new Event('kanbanColorsChanged'))
    onClose()
  }

  const handleReset = () => {
    setBoardBgPrimary('#273155')
    setBoardBgSecondary('#2a3660')
    setBoardBgImage('')
    setColumnBgPrimary('#ffffff')
    setColumnBgSecondary('#f8fafc')
    setColumnBorder('#e2e8f0')
    setCardBgPrimary('#ffffff')
    setCardBgSecondary('#fefefe')
    setCardBorder('#e5e7eb')
    setCardHoverBg('#f9fafb')
    localStorage.removeItem('kanbanColors')
    window.dispatchEvent(new Event('kanbanColorsChanged'))
  }
  
  if (!isOpen || typeof document === 'undefined') {
    return null
  }
  
  return createPortal(
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 99999 }}
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
            className="fixed left-1/2 top-20 -translate-x-1/2 w-full max-w-3xl"
            style={{ zIndex: 100000 }}
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
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Personalizar Cores do Kanban
                      </h2>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Customize o visual do seu quadro Kanban
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Tabs */}
              <div className={`flex gap-2 p-4 border-b ${
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <motion.button
                  onClick={() => setActiveTab('board')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === 'board'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Layers className="w-4 h-4" />
                  Board
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('columns')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === 'columns'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Paintbrush className="w-4 h-4" />
                  Colunas
                </motion.button>

                <motion.button
                  onClick={() => setActiveTab('cards')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    activeTab === 'cards'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-4 h-4" />
                  Cards
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'board' && (
                    <motion.div
                      key="board"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <h3 className={`text-lg font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        🎨 Background do Board
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Cor Primária
                          </label>
                          <input
                            type="color"
                            value={boardBgPrimary}
                            onChange={(e) => setBoardBgPrimary(e.target.value)}
                            className="w-full h-12 rounded-lg cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">{boardBgPrimary}</p>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Cor Secundária
                          </label>
                          <input
                            type="color"
                            value={boardBgSecondary}
                            onChange={(e) => setBoardBgSecondary(e.target.value)}
                            className="w-full h-12 rounded-lg cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">{boardBgSecondary}</p>
                        </div>
                      </div>

                      {/* URL da Imagem de Fundo */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Imagem de Fundo (URL opcional)
                        </label>
                        <input
                          type="text"
                          value={boardBgImage}
                          onChange={(e) => setBoardBgImage(e.target.value)}
                          placeholder="https://exemplo.com/imagem.jpg"
                          className={`w-full px-4 py-3 rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-500'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                          }`}
                        />
                        <p className="text-xs text-gray-500 mt-1">Deixe vazio para usar apenas gradiente</p>
                      </div>

                      {/* Preview */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Preview
                        </label>
                        <div
                          className="h-32 rounded-2xl shadow-lg relative overflow-hidden"
                          style={{
                            background: boardBgImage 
                              ? `linear-gradient(135deg, ${boardBgPrimary}cc, ${boardBgSecondary}cc), url(${boardBgImage})`
                              : `linear-gradient(135deg, ${boardBgPrimary}, ${boardBgSecondary})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          {boardBgImage && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <span className="text-white text-xs font-bold">Com Imagem</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'columns' && (
                    <motion.div
                      key="columns"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <h3 className={`text-lg font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        📋 Estilo das Colunas
                      </h3>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Fundo Primário
                          </label>
                          <input
                            type="color"
                            value={columnBgPrimary}
                            onChange={(e) => setColumnBgPrimary(e.target.value)}
                            className="w-full h-12 rounded-lg cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">{columnBgPrimary}</p>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Fundo Secundário
                          </label>
                          <input
                            type="color"
                            value={columnBgSecondary}
                            onChange={(e) => setColumnBgSecondary(e.target.value)}
                            className="w-full h-12 rounded-lg cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">{columnBgSecondary}</p>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Borda
                          </label>
                          <input
                            type="color"
                            value={columnBorder}
                            onChange={(e) => setColumnBorder(e.target.value)}
                            className="w-full h-12 rounded-lg cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">{columnBorder}</p>
                        </div>
                      </div>

                      {/* Preview */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Preview
                        </label>
                        <div
                          className="h-32 rounded-2xl shadow-lg border-2 p-4"
                          style={{
                            background: `linear-gradient(to bottom, ${columnBgPrimary}, ${columnBgSecondary})`,
                            borderColor: columnBorder
                          }}
                        >
                          <div className="text-sm font-bold" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                            Coluna de Exemplo
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'cards' && (
                    <motion.div
                      key="cards"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <h3 className={`text-lg font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        🎴 Estilo dos Cards
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Fundo Primário
                          </label>
                          <input
                            type="color"
                            value={cardBgPrimary}
                            onChange={(e) => setCardBgPrimary(e.target.value)}
                            className="w-full h-12 rounded-lg cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">{cardBgPrimary}</p>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Fundo Secundário
                          </label>
                          <input
                            type="color"
                            value={cardBgSecondary}
                            onChange={(e) => setCardBgSecondary(e.target.value)}
                            className="w-full h-12 rounded-lg cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">{cardBgSecondary}</p>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Borda
                          </label>
                          <input
                            type="color"
                            value={cardBorder}
                            onChange={(e) => setCardBorder(e.target.value)}
                            className="w-full h-12 rounded-lg cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">{cardBorder}</p>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Hover
                          </label>
                          <input
                            type="color"
                            value={cardHoverBg}
                            onChange={(e) => setCardHoverBg(e.target.value)}
                            className="w-full h-12 rounded-lg cursor-pointer"
                          />
                          <p className="text-xs text-gray-500 mt-1">{cardHoverBg}</p>
                        </div>
                      </div>

                      {/* Preview */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Preview
                        </label>
                        <div
                          className="h-24 rounded-xl shadow-lg border p-3"
                          style={{
                            background: `linear-gradient(to bottom, ${cardBgPrimary}, ${cardBgSecondary})`,
                            borderColor: cardBorder
                          }}
                        >
                          <div className="text-xs font-bold mb-1" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                            Card de Exemplo
                          </div>
                          <div className="text-xs opacity-60" style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
                            Este é um preview do card
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className={`p-6 border-t flex justify-between ${
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Resetar
                </motion.button>

                <div className="flex gap-3">
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    Cancelar
                  </motion.button>

                  <motion.button
                    onClick={handleSave}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
                  >
                    Salvar
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
      </>
    </AnimatePresence>,
    document.body
  )
}
