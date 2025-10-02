'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react'

interface ModalAceitarAtendimentoProps {
  isOpen: boolean
  chatName: string
  onAceitar: () => Promise<void>
  onRecusar: () => Promise<void>
  onEspiar: () => void
  onClose: () => void
}

export default function ModalAceitarAtendimento({
  isOpen,
  chatName,
  onAceitar,
  onRecusar,
  onEspiar,
  onClose,
}: ModalAceitarAtendimentoProps) {
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<'aceitar' | 'recusar' | null>(null)

  const handleAceitar = async () => {
    setAction('aceitar')
    setLoading(true)
    try {
      await onAceitar()
      onClose()
    } catch (error) {
      console.error('Erro ao aceitar atendimento:', error)
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  const handleRecusar = async () => {
    setAction('recusar')
    setLoading(true)
    try {
      await onRecusar()
      onClose()
    } catch (error) {
      console.error('Erro ao recusar atendimento:', error)
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  const handleEspiar = () => {
    onEspiar()
    onClose()
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mx-4">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Novo Atendimento
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">{chatName}</span> está aguardando atendimento
                </p>
              </div>

              {/* Botões */}
              <div className="space-y-3">
                {/* Aceitar */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAceitar}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && action === 'aceitar' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Aceitando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Aceitar Atendimento</span>
                    </>
                  )}
                </motion.button>

                {/* Espiar */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEspiar}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-5 h-5" />
                  <span>Espiar Mensagens (últimas 5)</span>
                </motion.button>

                {/* Recusar */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRecusar}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && action === 'recusar' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Recusando...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Recusar Atendimento</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  <span className="font-semibold">Aceitar:</span> Você se torna responsável pelo atendimento<br />
                  <span className="font-semibold">Espiar:</span> Visualize as últimas mensagens sem aceitar<br />
                  <span className="font-semibold">Recusar:</span> O chat será oferecido para outro atendente
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
