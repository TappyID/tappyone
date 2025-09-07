'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface FilasHeaderProps {
  onCreateFila: () => void
}

export default function FilasHeader({ onCreateFila }: FilasHeaderProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  
  return (
    <div className="flex items-center justify-between">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
          isDark 
            ? 'from-emerald-400 via-teal-400 to-cyan-400' 
            : 'from-[#305e73] via-[#3a6d84] to-[#305e73]'
        }`}>
          Filas de Atendimento
        </h1>
        <p className={`mt-2 max-w-2xl ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Gerencie regras globais para integração entre chatbot, kanban, atendentes e conversas do WhatsApp
        </p>
      </motion.div>
      
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateFila}
        className={`group relative flex items-center gap-3 px-6 py-3 font-medium rounded-xl transition-all duration-500 overflow-hidden ${
          isDark
            ? 'text-white'
            : 'bg-gradient-to-r from-[#305e73] via-[#2a5266] to-[#244659] text-white shadow-lg hover:shadow-xl'
        }`}
        style={isDark ? {
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 20px 40px -12px rgba(16, 185, 129, 0.6), 0 0 0 1px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        } : {}}
      >
        {isDark && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20 rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-xl" />
            <div className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-emerald-400/50 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-xl" />
          </>
        )}
        
        {!isDark && (
          <>
            {/* Efeito de brilho light mode */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {/* Glow effect light mode */}
            <div className="absolute inset-0 bg-[#305e73] rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10" />
          </>
        )}
        
        <motion.div
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-5 h-5 relative z-10" />
        </motion.div>
        <span className="relative z-10">Nova Fila</span>
      </motion.button>
    </div>
  )
}
