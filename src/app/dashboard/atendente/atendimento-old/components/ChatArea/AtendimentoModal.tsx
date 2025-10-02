'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye, 
  Check, 
  X, 
  User,
  Clock,
  MessageSquare
} from 'lucide-react'

interface AtendimentoModalProps {
  isOpen: boolean
  chatName: string
  chatId: string
  onAccept: () => void
  onReject: () => void
  onSpy: () => void
  onClose: () => void
}

export default function AtendimentoModal({
  isOpen,
  chatName,
  chatId,
  onAccept,
  onReject,
  onSpy,
  onClose
}: AtendimentoModalProps) {
  // Debug: Log quando o modal é renderizado
  React.useEffect(() => {
    console.log('🎯 [AtendimentoModal] Renderizado:', { isOpen, chatName, chatId })
  }, [isOpen, chatName, chatId])
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Novo Atendimento
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{chatName}</span> está aguardando atendimento
                </p>
                
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Agora</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {/* Aceitar */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onAccept}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Aceitar Atendimento</span>
                </motion.button>

                {/* Espiar */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSpy}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">Espiar Conversa</span>
                </motion.button>

                {/* Recusar */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onReject}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span className="font-medium">Recusar</span>
                </motion.button>
              </div>

              {/* Info */}
              <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  <span className="font-medium">Aceitar:</span> Assume o atendimento<br/>
                  <span className="font-medium">Espiar:</span> Visualiza sem assumir<br/>
                  <span className="font-medium">Recusar:</span> Retorna para a fila
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
