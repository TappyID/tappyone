'use client'

import { motion } from 'framer-motion'
import { Users, UserPlus, Crown, Download } from 'lucide-react'

interface AtendentesHeaderProps {
  onCreateClick: () => void
  onExportClick: () => void
}

export default function AtendentesHeader({ onCreateClick, onExportClick }: AtendentesHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="p-3 bg-gradient-to-br from-[#305e73] to-[#3a6d84] rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full shadow-lg"
            />
          </motion.div>

          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-[#305e73] to-[#3a6d84] bg-clip-text text-transparent"
            >
              Atendentes
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mt-1"
            >
              Monitore e gerencie sua equipe de atendimento em tempo real
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg"
          >
            <Crown className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">Admin</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 8px 20px rgba(59, 130, 246, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onExportClick}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            Exportar
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(48, 94, 115, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateClick}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <UserPlus className="w-5 h-5" />
            Novo Atendente
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
