'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import { Users, UserCheck, Star, UserX, TrendingUp, MessageCircle } from 'lucide-react'

interface StatsData {
  totalContatos: number
  contatosAtivos: number
  favoritos: number
  conversasHoje: number
}

export default function ContatosStats() {
  const { theme } = useTheme()
  const [statsData, setStatsData] = useState<StatsData>({
    totalContatos: 0,
    contatosAtivos: 0,
    favoritos: 0,
    conversasHoje: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/contatos/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStatsData(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const stats = [
    {
      title: 'Total de Contatos',
      value: loading ? 0 : statsData.totalContatos,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
      textColor: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      description: 'Contatos sincronizados',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Contatos Ativos',
      value: loading ? 0 : statsData.contatosAtivos,
      icon: UserCheck,
      color: 'from-green-500 to-green-600',
      bgColor: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
      textColor: theme === 'dark' ? 'text-green-400' : 'text-green-600',
      description: 'Com conversas recentes',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Favoritos',
      value: loading ? 0 : statsData.favoritos,
      icon: Star,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100',
      textColor: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
      description: 'Marcados como favoritos',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Conversas Hoje',
      value: loading ? 0 : statsData.conversasHoje,
      icon: MessageCircle,
      color: 'from-purple-500 to-purple-600',
      bgColor: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100',
      textColor: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
      description: 'Nas últimas 24 horas',
      change: '+23%',
      changeType: 'positive'
    }
  ]

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + (index * 0.1) }}
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              transition: { duration: 0.2 } 
            }}
            className={`rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 cursor-pointer group ${
              theme === 'dark' 
                ? 'bg-slate-800/80 border-slate-600/50 backdrop-blur-sm' 
                : 'bg-white border-gray-100'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              
              {/* Change indicator */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                stat.changeType === 'positive' 
                  ? (theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                  : (theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700')
              }`}>
                <TrendingUp className={`w-3 h-3 ${
                  stat.changeType === 'negative' ? 'rotate-180' : ''
                }`} />
                {stat.change}
              </div>
            </div>

            {/* Value */}
            <div className="mb-3">
              <div className={`text-3xl font-bold ${stat.textColor} mb-1 group-hover:scale-105 transition-transform duration-200`}>
                {stat.value.toLocaleString()}
              </div>
              <div className={`font-semibold text-sm ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {stat.title}
              </div>
            </div>

            {/* Description */}
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {stat.description}
            </div>

            {/* Progress bar for some stats */}
            {(index === 1 || index === 3) && (
              <div className="mt-4">
                <div className={`w-full rounded-full h-1.5 ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`bg-gradient-to-r ${stat.color} h-1.5 rounded-full transition-all duration-500`}
                    style={{ 
                      width: index === 1 
                        ? `${Math.min((987 / 1234) * 100, 100)}%`
                        : '75%'
                    }}
                  ></div>
                </div>
              </div>
            )}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
