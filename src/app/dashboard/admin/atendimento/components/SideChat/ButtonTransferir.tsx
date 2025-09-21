'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRightLeft, User } from 'lucide-react'

interface ButtonTransferirProps {
  onClick: (e: React.MouseEvent) => void
  isTransferred?: boolean
  transferredTo?: {
    nome: string
    avatar?: string
  }
  isLoading?: boolean
}

export default function ButtonTransferir({ 
  onClick, 
  isTransferred = false,
  transferredTo,
  isLoading = false 
}: ButtonTransferirProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`relative p-1 rounded border transition-colors ${
        isTransferred 
          ? 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/30 text-blue-600'
          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600'
      }`}
      title={
        isTransferred 
          ? `Transferido para ${transferredTo?.nome || 'outro atendente'}`
          : 'Transferir Atendimento'
      }
      disabled={isLoading}
    >
      <ArrowRightLeft className="w-2.5 h-2.5" />
      
      {/* Indicador de transferência */}
      {isTransferred && (
        <div 
          className="relative p-1 bg-indigo-500/20 hover:bg-indigo-500/30 rounded 
                 border border-indigo-400/30 transition-colors k:border-gray-800 flex items-center justify-center">
          <User className="w-2 h-2 text-white" />
        </div>
      )}

      {/* Avatar do atendente transferido */}
      {isTransferred && transferredTo?.avatar && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white dark:border-gray-800 overflow-hidden">
          <img 
            src={transferredTo.avatar} 
            alt={transferredTo.nome}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </motion.button>
  )
}
