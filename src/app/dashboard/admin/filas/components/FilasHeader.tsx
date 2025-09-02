'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface FilasHeaderProps {
  onCreateFila: () => void
}

export default function FilasHeader({ onCreateFila }: FilasHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#305e73] via-[#3a6d84] to-[#305e73] bg-clip-text text-transparent">
          Filas de Atendimento
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Gerencie regras globais para integração entre chatbot, kanban, atendentes e conversas do WhatsApp
        </p>
      </motion.div>
      
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCreateFila}
        className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#305e73] via-[#2a5266] to-[#244659] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        <motion.div
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-5 h-5 relative z-10" />
        </motion.div>
        <span className="relative z-10">Nova Fila</span>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[#305e73] rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10" />
      </motion.button>
    </div>
  )
}
