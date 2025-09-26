'use client'

import { motion } from 'framer-motion'
import { Users, UserCheck, Clock, MessageCircle, TrendingUp, Activity } from 'lucide-react'
import { AtendenteComStats } from '@/hooks/useAtendentes'
import { useTheme } from '@/contexts/ThemeContext'

interface AtendentesStatsProps {
  atendentes: AtendenteComStats[]
}

export default function AtendentesStats({ atendentes }: AtendentesStatsProps) {
  const { actualTheme } = useTheme()
  
  const stats = {
    total: atendentes.length,
    ativo: atendentes.filter(a => a.ativo).length,
    inativo: atendentes.filter(a => !a.ativo).length,
    conversasAtivas: atendentes.reduce((acc, a) => acc + (a.estatisticas?.conversasAtivas || 0), 0),
    totalConversas: atendentes.reduce((acc, a) => acc + (a.estatisticas?.totalConversas || 0), 0),
    emAndamento: atendentes.reduce((acc, a) => acc + (a.estatisticas?.emAndamento || 0), 0),
    concluidas: atendentes.reduce((acc, a) => acc + (a.estatisticas?.concluidas || 0), 0),
    ticketsPendentes: atendentes.reduce((acc, a) => acc + (a.estatisticas?.ticketsPendentes || 0), 0)
  }

  const statCards = [
    {
      title: 'Total de Atendentes',
      value: stats.total,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: actualTheme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50',
      textColor: actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-700',
      trend: '+2 este mês'
    },
    {
      title: 'Ativos',
      value: stats.ativo,
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: actualTheme === 'dark' ? 'bg-green-500/10' : 'bg-green-50',
      textColor: actualTheme === 'dark' ? 'text-green-400' : 'text-green-700',
      trend: `${Math.round((stats.ativo / stats.total) * 100)}% da equipe`
    },
    {
      title: 'Inativos',
      value: stats.inativo,
      icon: UserCheck,
      color: 'from-red-500 to-red-600',
      bgColor: actualTheme === 'dark' ? 'bg-red-500/10' : 'bg-red-50',
      textColor: actualTheme === 'dark' ? 'text-red-400' : 'text-red-700',
      trend: `${Math.round((stats.inativo / stats.total) * 100)}% da equipe`
    },
    {
      title: 'Conversas Ativas',
      value: stats.conversasAtivas,
      icon: MessageCircle,
      color: 'from-purple-500 to-purple-600',
      bgColor: actualTheme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-50',
      textColor: actualTheme === 'dark' ? 'text-purple-400' : 'text-purple-700',
      trend: 'Em tempo real'
    },
    {
      title: 'Total Conversas',
      value: stats.totalConversas,
      icon: Clock,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: actualTheme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-50',
      textColor: actualTheme === 'dark' ? 'text-indigo-400' : 'text-indigo-700',
      trend: 'Todas as conversas'
    },
    {
      title: 'Em Andamento',
      value: stats.emAndamento,
      icon: TrendingUp,
      color: 'from-[#305e73] to-[#3a6d84]',
      bgColor: actualTheme === 'dark' ? 'bg-slate-500/10' : 'bg-gray-50',
      textColor: actualTheme === 'dark' ? 'text-slate-300' : 'text-[#305e73]',
      trend: 'Aguardando resposta'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
            }}
            className={`rounded-2xl p-6 shadow-sm border backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${
              actualTheme === 'dark'
                ? 'bg-slate-800/60 border-slate-700/50'
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`}
              />
            </div>

            <div className="space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className={`text-3xl font-bold ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {stat.value}
              </motion.div>
              
              <div className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-white/80' : 'text-gray-600'
              }`}>
                {stat.title}
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className={`text-xs ${
                  actualTheme === 'dark' ? 'text-white/60' : 'text-gray-500'
                }`}
              >
                {stat.trend}
              </motion.div>
            </div>

            {/* Indicador de status para cards específicos */}
            {stat.title === 'Ativos' && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full shadow-lg"
              />
            )}

            {stat.title === 'Inativos' && stats.inativo > 0 && (
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-2 right-2 w-3 h-3 bg-orange-400 rounded-full shadow-lg"
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
