'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, Sparkles, Wand2, Briefcase, Smile, Minus, Plus, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDeepSeekAI } from '@/hooks/useDeepSeekAI'

interface EditMessageModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newText: string) => void
  initialText: string
  loading?: boolean
}

export const EditMessageModal: React.FC<EditMessageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialText,
  loading = false
}) => {
  const [text, setText] = useState(initialText)
  const { generateText, loading: aiLoading, error: aiError } = useDeepSeekAI()

  useEffect(() => {
    setText(initialText)
  }, [initialText])

  const handleSave = () => {
    if (text.trim() && text !== initialText) {
      onSave(text.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleAIAction = async (action: 'generate' | 'improve' | 'formal' | 'casual' | 'shorter' | 'longer') => {
    if (!text.trim()) return
    
    const result = await generateText(text, action)
    if (result) {
      setText(result)
    }
  }

  const aiButtons = [
    { action: 'generate' as const, label: 'Gerar com IA', icon: Sparkles, color: 'bg-purple-600 hover:bg-purple-700' },
    { action: 'improve' as const, label: 'Melhorar', icon: Wand2, color: 'bg-blue-600 hover:bg-blue-700' },
    { action: 'formal' as const, label: 'Formal', icon: Briefcase, color: 'bg-gray-600 hover:bg-gray-700' },
    { action: 'casual' as const, label: 'Casual', icon: Smile, color: 'bg-green-600 hover:bg-green-700' },
    { action: 'shorter' as const, label: 'Resumir', icon: Minus, color: 'bg-orange-600 hover:bg-orange-700' },
    { action: 'longer' as const, label: 'Expandir', icon: Plus, color: 'bg-indigo-600 hover:bg-indigo-700' }
  ]

  const isAnyLoading = loading || aiLoading

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Editar Mensagem
              </h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                disabled={isAnyLoading}
              />
              
              {/* Botões de IA */}
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Ferramentas de IA:</div>
                <div className="grid grid-cols-2 gap-2">
                  {aiButtons.map((button) => {
                    const Icon = button.icon
                    return (
                      <button
                        key={button.action}
                        onClick={() => handleAIAction(button.action)}
                        disabled={isAnyLoading || !text.trim()}
                        className={`
                          ${button.color} text-white px-3 py-2 rounded-lg text-xs font-medium
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-colors flex items-center gap-2 justify-center
                        `}
                      >
                        {aiLoading ? (
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Icon className="w-3 h-3" />
                        )}
                        {button.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Erro da IA */}
              {aiError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">{aiError}</div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-3">
                Pressione Ctrl+Enter para salvar ou Esc para cancelar
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isAnyLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isAnyLoading || !text.trim() || text === initialText}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isAnyLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
