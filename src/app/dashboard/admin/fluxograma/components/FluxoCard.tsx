'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Edit3, 
  Zap,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Activity,
  Clock,
  ArrowRight
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface Fluxo {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  created_at: string
  updated_at: string
  quadro_id?: string
  nos_count?: number
  execucoes_count?: number
  ultima_execucao?: string
}

interface FluxoCardProps {
  fluxo: Fluxo
  index: number
  onToggle: (id: string, ativo: boolean) => void
  onExecute: (id: string) => void
}

export default function FluxoCard({ 
  fluxo, 
  index, 
  onToggle, 
  onExecute 
}: FluxoCardProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const primaryColor = 'blue'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} hover:shadow-xl transition-all group`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
            {fluxo.nome}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
            {fluxo.descricao}
          </p>
        </div>
        
        {/* Status Badge */}
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
          fluxo.ativo 
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {fluxo.ativo ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              <span>Ativo</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3" />
              <span>Inativo</span>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <GitBranch className="w-4 h-4" />
          <span>{fluxo.nos_count || 0} nós</span>
        </div>
        <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <Activity className="w-4 h-4" />
          <span>{fluxo.execucoes_count || 0} exec.</span>
        </div>
        <div className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <Clock className="w-4 h-4" />
          <span>{new Date(fluxo.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggle(fluxo.id, fluxo.ativo)}
            className={`p-2 rounded-lg transition-colors ${
              fluxo.ativo
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {fluxo.ativo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onExecute(fluxo.id)}
            className={`p-2 rounded-lg bg-${primaryColor}-100 text-${primaryColor}-600 hover:bg-${primaryColor}-200 transition-colors`}
          >
            <Zap className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`text-xs font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} flex items-center space-x-1`}
        >
          <span>Ver detalhes</span>
          <ArrowRight className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.div>
  )
}
