'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, Edit2, TrendingUp, Clock } from 'lucide-react'

interface MetaCardProps {
  meta: {
    id: string
    tipo: string
    titulo: string
    valor: number
    valorAtual: number
    prazo: string
    icon: any
    cor: string
  }
  theme: string
  coluna: {
    cor: string
  }
  onDelete: (id: string) => void
  delay?: number
}

export default function MetaCard({ meta, theme, coluna, onDelete, delay = 0 }: MetaCardProps) {
  const Icon = meta.icon
  const progress = (meta.valorAtual / meta.valor) * 100
  const isCompleted = progress >= 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative p-5 rounded-2xl backdrop-blur-xl border transition-all ${
        theme === 'dark' 
          ? 'bg-slate-900/50 border-slate-700/30 hover:bg-slate-900/70' 
          : 'bg-white/80 border-gray-200/30 hover:bg-white/90'
      }`}
      style={{
        boxShadow: `0 10px 30px ${coluna.cor}10`,
        borderLeft: `3px solid ${isCompleted ? '#10B981' : coluna.cor}`
      }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Badge de Conclusão */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full"
        >
          ✓ Concluída
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: `${meta.cor}20`,
              color: meta.cor 
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className={`font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {meta.titulo}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {meta.prazo}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <motion.button
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-slate-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </motion.button>
          
          <motion.button
            onClick={() => onDelete(meta.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-red-500/20 text-red-400'
                : 'hover:bg-red-50 text-red-500'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Progress Info */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Progresso
          </span>
          <span className={`text-sm font-bold ${
            isCompleted ? 'text-green-500' : ''
          }`} style={{ color: !isCompleted ? coluna.cor : undefined }}>
            {meta.valorAtual.toLocaleString('pt-BR')} / {meta.valor.toLocaleString('pt-BR')}
          </span>
        </div>

        {/* Progress Bar */}
        <div className={`h-2 rounded-full overflow-hidden ${
          theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
        }`}>
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{ 
              backgroundColor: isCompleted ? '#10B981' : coluna.cor,
              width: `${Math.min(progress, 100)}%`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* Percentage */}
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            {Math.round(progress)}% completo
          </span>
          {progress > 75 && !isCompleted && (
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Quase lá!
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
