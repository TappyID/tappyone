'use client'

import { motion } from 'framer-motion'
import { 
  GitBranch, 
  CheckCircle, 
  MessageSquare, 
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Fila } from '../page'
import { useTheme } from '@/contexts/ThemeContext'

interface FilasStatsProps {
  filas: Fila[]
}

export default function FilasStats({ filas }: FilasStatsProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const safeFilas = Array.isArray(filas) ? filas : []
  
  const stats = [
    {
      title: 'Total de Filas',
      value: safeFilas.length,
      icon: GitBranch,
      color: 'from-[#305e73] to-[#244659]',
      change: '+2 este mês',
      trend: 'up' as const
    },
    {
      title: 'Filas Ativas',
      value: safeFilas.filter(f => f.ativa).length,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      change: '100% operacional',
      trend: 'up' as const
    },
    {
      title: 'Conversas Ativas',
      value: safeFilas.reduce((acc, f) => acc + (f.estatisticas?.conversasAtivas || 0), 0),
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      change: '+15% hoje',
      trend: 'up' as const
    },
    {
      title: 'Tempo Médio',
      value: `${safeFilas.length > 0 ? (safeFilas.reduce((acc, f) => acc + (f.estatisticas?.tempoMedioResposta || 0), 0) / safeFilas.length).toFixed(1) : 0}min`,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      change: '-12% esta semana',
      trend: 'down' as const
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`group relative rounded-2xl p-6 shadow-lg transition-all duration-300 overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border border-slate-600/50 hover:shadow-2xl hover:shadow-slate-900/20' 
                : 'bg-white border border-gray-100 hover:shadow-xl'
            }`}
          >
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDark 
                ? 'bg-gradient-to-br from-slate-700/50 to-slate-600/50' 
                : 'bg-gradient-to-br from-gray-50 to-white'
            }`} />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>{stat.title}</p>
                <p className={`text-2xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{stat.value}</p>
                
                <div className="flex items-center gap-1">
                  <TrendIcon className={`w-3 h-3 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                  <p className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </p>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
                className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <IconComponent className="w-7 h-7 text-white" />
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500 ${
              isDark 
                ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10' 
                : 'bg-gradient-to-br from-blue-100/20 to-purple-100/20'
            }`} />
            <div className={`absolute bottom-0 left-0 w-16 h-16 rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-500 ${
              isDark 
                ? 'bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10' 
                : 'bg-gradient-to-tr from-green-100/20 to-blue-100/20'
            }`} />
          </motion.div>
        )
      })}
    </div>
  )
}
