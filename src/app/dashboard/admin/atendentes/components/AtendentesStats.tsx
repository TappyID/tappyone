'use client'

import { motion } from 'framer-motion'
import { Users, UserCheck, Clock, MessageCircle, TrendingUp, Activity } from 'lucide-react'
import { Atendente } from '../page'

interface AtendentesStatsProps {
  atendentes: Atendente[]
}

export default function AtendentesStats({ atendentes }: AtendentesStatsProps) {
  const stats = {
    total: atendentes.length,
    online: atendentes.filter(a => a.status === 'online').length,
    emAtendimento: atendentes.filter(a => a.statusAtendimento === 'em_atendimento').length,
    atendimentosHoje: atendentes.reduce((acc, a) => acc + a.estatisticas.atendimentosHoje, 0),
    tempoMedioResposta: atendentes.reduce((acc, a) => acc + a.estatisticas.tempoMedioAtendimento, 0) / atendentes.length || 0,
    avaliacaoMedia: atendentes.reduce((acc, a) => acc + a.estatisticas.avaliacaoMedia, 0) / atendentes.length || 0,
    ticketsPendentes: atendentes.reduce((acc, a) => acc + a.estatisticas.ticketsPendentes, 0)
  }

  const statCards = [
    {
      title: 'Total de Atendentes',
      value: stats.total,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      trend: '+2 este mês'
    },
    {
      title: 'Online Agora',
      value: stats.online,
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      trend: `${Math.round((stats.online / stats.total) * 100)}% da equipe`
    },
    {
      title: 'Em Atendimento',
      value: stats.emAtendimento,
      icon: UserCheck,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      trend: 'Ativos agora'
    },
    {
      title: 'Atendimentos Hoje',
      value: stats.atendimentosHoje,
      icon: MessageCircle,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      trend: '+15% vs ontem'
    },
    {
      title: 'Tempo Médio',
      value: `${stats.tempoMedioResposta.toFixed(1)}min`,
      icon: Clock,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      trend: '-2min vs ontem'
    },
    {
      title: 'Avaliação Média',
      value: stats.avaliacaoMedia.toFixed(1),
      icon: TrendingUp,
      color: 'from-[#305e73] to-[#3a6d84]',
      bgColor: 'bg-gray-50',
      textColor: 'text-[#305e73]',
      trend: '⭐ Excelente'
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
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
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
                className="text-3xl font-bold text-gray-900"
              >
                {stat.value}
              </motion.div>
              
              <div className="text-sm font-medium text-gray-600">
                {stat.title}
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className="text-xs text-gray-500"
              >
                {stat.trend}
              </motion.div>
            </div>

            {/* Indicador de status para cards específicos */}
            {stat.title === 'Online Agora' && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full shadow-lg"
              />
            )}

            {stat.title === 'Em Atendimento' && stats.emAtendimento > 0 && (
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
