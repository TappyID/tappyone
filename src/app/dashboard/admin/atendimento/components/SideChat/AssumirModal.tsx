'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserCheck, AlertCircle } from 'lucide-react'

interface AssumirModalProps {
  isOpen: boolean
  onClose: () => void
  chatId: string
  chatName: string
  currentAtendente: string
  onAssumirSuccess?: () => void
}

export default function AssumirModal({
  isOpen,
  onClose,
  chatId,
  chatName,
  currentAtendente,
  onAssumirSuccess
}: AssumirModalProps) {
  const [loading, setLoading] = useState(false)

  const handleAssumirAtendimento = async () => {
    setLoading(true)

    try {
      // Buscar dados do usuário atual
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!userResponse.ok) {
        throw new Error('Erro ao buscar dados do usuário')
      }

      const userData = await userResponse.json()
      const userId = userData.data?.id || userData.id

      if (!userId) {
        throw new Error('ID do usuário não encontrado')
      }

      // Assumir o atendimento usando PUT no endpoint existente
      const response = await fetch(`/api/chats/${chatId}/leads`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          responsavel: userId,
          status: 'em_atendimento'
        })
      })

      if (response.ok) {

        // Disparar evento global para recarregar dados
        window.dispatchEvent(new CustomEvent('atendimento-assumido', {
          detail: { chatId }
        }))

        onAssumirSuccess?.()
        onClose()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))

        throw new Error(errorData.error || 'Erro ao assumir atendimento')
      }
    } catch {

      alert('Erro ao assumir atendimento. Tente novamente.')
    } finally {
      setLoading(false)
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md pointer-events-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Assumir Atendimento
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {chatName}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                           rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20
                              rounded-lg border border-amber-200 dark:border-amber-800 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
                    Confirmar Responsabilidade
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Você se tornará o responsável por este atendimento e receberá todas as mensagens.
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Atendente atual:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {currentAtendente}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Novo responsável:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Você (Admin)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300
                             bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                             rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssumirAtendimento}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700
                             text-white rounded-lg transition-colors font-medium
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Assumindo...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Assumir Atendimento
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
