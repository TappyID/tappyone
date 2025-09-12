'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  X, 
  MessageSquare, 
  Clock,
  User,
  AlertCircle,
  ChevronRight,
  Timer
} from 'lucide-react'

interface ChatRequest {
  id: string
  adminNome: string
  adminAvatar: string
  assunto: string
  preview: string
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente'
  timestamp: Date
  tempoLimite: number // em segundos
}

interface ChatPendingModalProps {
  chatRequest: ChatRequest | null
  isOpen: boolean
  onAccept: () => void
  onReject: () => void
  isDark?: boolean
}

const prioridadeConfig = {
  baixa: { 
    color: 'from-gray-500 to-gray-600',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: 'bg-gray-500'
  },
  media: { 
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: 'bg-blue-500'
  },
  alta: { 
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    icon: 'bg-orange-500'
  },
  urgente: { 
    color: 'from-red-500 to-red-600',
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: 'bg-red-500'
  }
}

export default function ChatPendingModal({ 
  chatRequest, 
  isOpen, 
  onAccept, 
  onReject, 
  isDark = false 
}: ChatPendingModalProps) {
  const [tempoRestante, setTempoRestante] = useState(30) // 30 segundos para responder
  const [isCountingDown, setIsCountingDown] = useState(false)

  if (!isOpen || !chatRequest) return null

  const prioridadeStyle = prioridadeConfig[chatRequest.prioridade]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`w-full max-w-lg rounded-3xl shadow-2xl border ${
            isDark 
              ? 'bg-gray-900/95 border-gray-700/50' 
              : 'bg-white/95 border-gray-200/50'
          } backdrop-blur-xl`}
        >
          {/* Header com Prioridade */}
          <div className={`p-6 rounded-t-3xl bg-gradient-to-r ${prioridadeStyle.color} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"
                >
                  <MessageSquare className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold">Novo Chat Interno</h3>
                  <p className="text-sm opacity-90">
                    Prioridade: {chatRequest.prioridade.toUpperCase()}
                  </p>
                </div>
              </div>
              
              {/* Timer */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl backdrop-blur-sm"
              >
                <Timer className="w-4 h-4" />
                <span className="font-mono font-bold">{tempoRestante}s</span>
              </motion.div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="p-6">
            {/* Info do Admin */}
            <div className="flex items-center gap-4 mb-6">
              <motion.img
                src={chatRequest.adminAvatar}
                alt={chatRequest.adminNome}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                whileHover={{ scale: 1.05 }}
              />
              <div className="flex-1">
                <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {chatRequest.adminNome}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Administrador do Sistema
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Há {Math.floor((Date.now() - chatRequest.timestamp.getTime()) / 60000)} min
                  </span>
                </div>
              </div>
            </div>

            {/* Assunto */}
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Assunto
              </label>
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {chatRequest.assunto}
                </p>
              </div>
            </div>

            {/* Preview Borrado */}
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Prévia da Mensagem
              </label>
              <div className={`relative p-4 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                {/* Texto borrado */}
                <div className="filter blur-sm select-none pointer-events-none">
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                    {chatRequest.preview}
                  </p>
                </div>
                
                {/* Overlay de desbloqueio */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md rounded-xl text-white text-sm font-semibold"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Aceite para ver o conteúdo
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Aviso */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl ${prioridadeStyle.bg} border-l-4 border-l-${chatRequest.prioridade === 'urgente' ? 'red' : chatRequest.prioridade === 'alta' ? 'orange' : chatRequest.prioridade === 'media' ? 'blue' : 'gray'}-500 mb-6`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full ${prioridadeStyle.icon} mt-2 flex-shrink-0`} />
                <div>
                  <p className={`text-sm font-semibold ${prioridadeStyle.text}`}>
                    ⚡ Ação Requerida
                  </p>
                  <p className={`text-xs ${prioridadeStyle.text} mt-1 opacity-80`}>
                    Se rejeitar, este chat será direcionado para outro atendente disponível.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Botões de Ação */}
            <div className="flex gap-4">
              {/* Botão Rejeitar */}
              <motion.button
                onClick={onReject}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg transition-all duration-300`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <X className="w-5 h-5" />
                Rejeitar
              </motion.button>

              {/* Botão Aceitar */}
              <motion.button
                onClick={onAccept}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg transition-all duration-300`}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check className="w-5 h-5" />
                Aceitar & Abrir
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
