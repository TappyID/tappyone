'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, Settings, PlayCircle, PauseCircle, Zap } from 'lucide-react'

interface AutomacaoCardProps {
  automacao: {
    id: string
    nome: string
    descricao: string
    trigger: string
    actions: string[]
    ativa: boolean
    icon: any
  }
  theme: string
  coluna: {
    cor: string
  }
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  delay?: number
}

export default function AutomacaoCard({ 
  automacao, 
  theme, 
  coluna, 
  onToggle, 
  onDelete, 
  delay = 0 
}: AutomacaoCardProps) {
  const Icon = automacao.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`relative p-5 rounded-2xl backdrop-blur-xl border transition-all ${
        theme === 'dark' 
          ? 'bg-slate-900/50 border-slate-700/30 hover:bg-slate-900/70' 
          : 'bg-white/80 border-gray-200/30 hover:bg-white/90'
      }`}
      style={{
        boxShadow: automacao.ativa 
          ? `0 10px 30px ${coluna.cor}20` 
          : '0 5px 15px rgba(0,0,0,0.05)',
        borderLeft: `3px solid ${automacao.ativa ? coluna.cor : '#94A3B8'}`
      }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Status Badge */}
      <motion.div
        className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold ${
          automacao.ativa 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-400 text-white'
        }`}
        animate={{
          scale: automacao.ativa ? [1, 1.1, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: automacao.ativa ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {automacao.ativa ? 'Ativa' : 'Pausada'}
      </motion.div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <motion.div 
          className="p-3 rounded-xl"
          style={{ 
            backgroundColor: automacao.ativa ? `${coluna.cor}20` : '#94A3B820',
            color: automacao.ativa ? coluna.cor : '#94A3B8'
          }}
          animate={automacao.ativa ? {
            rotate: [0, 5, -5, 0],
          } : {}}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        {/* Content */}
        <div className="flex-1">
          <h4 className={`font-bold mb-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {automacao.nome}
          </h4>
          <p className={`text-sm mb-3 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {automacao.descricao}
          </p>

          {/* Trigger e Actions */}
          <div className="flex flex-wrap gap-2 mb-3">
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
            }`}>
              <Zap className="w-3 h-3 inline mr-1" style={{ color: coluna.cor }} />
              {automacao.trigger.replace('_', ' ')}
            </div>
            {automacao.actions.map((action, idx) => (
              <div 
                key={idx}
                className={`px-2 py-1 rounded-lg text-xs ${
                  theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
                }`}
              >
                → {action.replace('_', ' ')}
              </div>
            ))}
          </div>

          {/* Actions Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onToggle(automacao.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                automacao.ativa
                  ? theme === 'dark'
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                  : theme === 'dark'
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {automacao.ativa ? (
                <>
                  <PauseCircle className="w-3 h-3" />
                  Pausar
                </>
              ) : (
                <>
                  <PlayCircle className="w-3 h-3" />
                  Ativar
                </>
              )}
            </motion.button>

            <motion.button
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                theme === 'dark'
                  ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="w-3 h-3" />
              Configurar
            </motion.button>

            <motion.button
              onClick={() => onDelete(automacao.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                theme === 'dark'
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'bg-red-50 text-red-500 hover:bg-red-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 className="w-3 h-3" />
              Excluir
            </motion.button>
          </div>
        </div>
      </div>

      {/* Execution Stats */}
      {automacao.ativa && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`mt-4 pt-4 border-t ${
            theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Última execução: há 2 horas
            </span>
            <span className={`font-medium ${
              theme === 'dark' ? 'text-green-400' : 'text-green-600'
            }`}>
              127 execuções hoje
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
