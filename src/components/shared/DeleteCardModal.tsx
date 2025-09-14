'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, AlertTriangle } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface DeleteCardModalProps {
  isOpen: boolean
  onClose: () => void
  cardData: {
    id: string
    nome?: string
    name?: string
  }
  onConfirm: (cardId: string) => Promise<void>
}

export default function DeleteCardModal({ 
  isOpen, 
  onClose, 
  cardData, 
  onConfirm 
}: DeleteCardModalProps) {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(cardData.id)
      onClose()
    } catch (error) {
      console.error('Erro ao excluir card:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const contactName = cardData?.nome || cardData?.name || 'Este contato'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-md rounded-lg shadow-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Excluir Card
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-full transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className={`text-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p className="mb-3">
                Tem certeza que deseja excluir o card de{' '}
                <span className="font-semibold text-red-600">
                  {contactName}
                </span>
                ?
              </p>
              
              <div className={`p-3 rounded-lg ${
                theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-red-300' : 'text-red-700'
                }`}>
                  ⚠️ Esta ação não pode ser desfeita. O card será removido permanentemente do kanban.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex justify-end gap-3 p-4 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                loading
                  ? 'bg-red-400 text-red-200 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Excluindo...' : 'Excluir Card'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
