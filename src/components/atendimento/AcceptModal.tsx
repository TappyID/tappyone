'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  CheckCircle, 
  Clock,
  User,
  Users,
  AlertCircle,
  Loader2,
  MessageSquare,
  Eye
} from 'lucide-react'

interface AcceptModalProps {
  isOpen: boolean
  onClose: () => void
  chatId: string
  chatName: string
  lastMessage?: string
  onAccept: () => Promise<void>
  onPreview?: () => void
}

export function AcceptModal({
  isOpen,
  onClose,
  chatId,
  chatName,
  lastMessage,
  onAccept,
  onPreview
}: AcceptModalProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      await onAccept()
      onClose()
    } catch (error) {
      console.error('❌ Erro ao aceitar atendimento:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  const handlePreview = () => {
    setShowPreview(true)
    if (onPreview) {
      onPreview()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                       w-full max-w-md mx-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border 
                           border-gray-200 dark:border-gray-700 overflow-hidden">
              
              {/* Header */}
              <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Novo Atendimento</h2>
                    <p className="text-blue-100 text-sm">Deseja aceitar esta conversa?</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Chat Info */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 
                                   rounded-full flex items-center justify-center text-white font-semibold">
                      {chatName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {chatName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Chat ID: {chatId}
                      </p>
                      {lastMessage && (
                        <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded border-l-3 border-blue-500">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Última mensagem:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {lastMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 
                               border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Atenção
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                      Ao aceitar, você se tornará responsável por este atendimento até finalizá-lo.
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">Aguardando</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">00:00</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <User className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-green-800 dark:text-green-300 font-medium">Prioridade</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">Normal</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  {/* Preview Button */}
                  {onPreview && (
                    <button
                      onClick={handlePreview}
                      className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 
                               bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                               rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                               flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Visualizar
                    </button>
                  )}
                  
                  {/* Cancel Button */}
                  <button
                    onClick={onClose}
                    disabled={isAccepting}
                    className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 
                             bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  
                  {/* Accept Button */}
                  <button
                    onClick={handleAccept}
                    disabled={isAccepting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 
                             text-white rounded-lg hover:from-green-700 hover:to-green-800 
                             transition-all disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2 font-medium"
                  >
                    {isAccepting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Aceitando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Aceitar Atendimento
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
