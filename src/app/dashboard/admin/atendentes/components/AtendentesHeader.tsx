'use client'

import { motion } from 'framer-motion'
import { Users, UserPlus, Crown, Download } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface AtendentesHeaderProps {
  onCreateClick: () => void
  onExportClick: () => void
}

export default function AtendentesHeader({ onCreateClick, onExportClick }: AtendentesHeaderProps) {
  const { actualTheme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl shadow-sm border p-6 backdrop-blur-sm ${
        actualTheme === 'dark'
          ? 'bg-slate-800/60 border-slate-700/50'
          : 'bg-white border-gray-100'
      }`}
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
              className={`mt-1 ${
                actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
              }`}
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
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExportClick}
            className={`relative flex items-center gap-2 px-4 py-3 font-semibold transition-all duration-500 group overflow-hidden ${
              actualTheme === 'dark'
                ? 'text-white'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl'
            }`}
            style={actualTheme === 'dark' ? {
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            } : {}}
          >
            {/* Glass effect layers for dark mode */}
            {actualTheme === 'dark' && (
              <>
                {/* Base glass layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-2xl" />
                
                {/* Blue accent layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 rounded-2xl" />
                
                {/* Light reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
              </>
            )}
            
            <Download className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Exportar</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateClick}
            className={`relative flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-500 group overflow-hidden ${
              actualTheme === 'dark'
                ? 'text-white'
                : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl'
            }`}
            style={actualTheme === 'dark' ? {
              background: 'linear-gradient(135deg, rgba(48, 94, 115, 0.8) 0%, rgba(58, 109, 132, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px -12px rgba(48, 94, 115, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            } : {}}
          >
            {/* Glass effect layers for dark mode */}
            {actualTheme === 'dark' && (
              <>
                {/* Base glass layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-2xl" />
                
                {/* Blue accent layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 rounded-2xl" />
                
                {/* Light reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
              </>
            )}
            
            <UserPlus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Novo Atendente</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
