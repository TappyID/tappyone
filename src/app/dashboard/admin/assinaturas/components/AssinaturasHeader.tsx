'use client'

import { motion } from 'framer-motion'
import { Plus, CreditCard, Crown } from 'lucide-react'

interface AssinaturasHeaderProps {
  onCreateAssinatura: () => void
}

export default function AssinaturasHeader({ onCreateAssinatura }: AssinaturasHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <div className="relative">
          <div className="p-3 bg-gradient-to-br from-[#305e73] to-[#3a6d84] rounded-2xl shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1 -right-1 p-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
          >
            <Crown className="w-4 h-4 text-white" />
          </motion.div>
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#305e73] via-[#3a6d84] to-[#305e73] bg-clip-text text-transparent">
            Gestão de Assinaturas
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            Gerencie planos, pagamentos e configure mensagens automáticas para seus clientes
          </p>
        </div>
      </motion.div>
      
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCreateAssinatura}
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
        <span className="relative z-10">Nova Assinatura</span>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[#305e73] rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10" />
      </motion.button>
    </div>
  )
}
