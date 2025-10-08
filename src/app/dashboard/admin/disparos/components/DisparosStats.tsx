'use client'

import { motion } from 'framer-motion'
import { Send, Clock, CheckCircle, XCircle, Pause, TrendingUp } from 'lucide-react'

interface DisparosStatsProps {
  totalCampanhas: number
  campanhasAtivas: number
  campanhasAgendadas: number
  campanhasConcluidas: number
  campanhasCanceladas: number
  mensagensEnviadas: number
  loading?: boolean
}

export function DisparosStats({
  totalCampanhas,
  campanhasAtivas,
  campanhasAgendadas,
  campanhasConcluidas,
  campanhasCanceladas,
  mensagensEnviadas,
  loading = false
}: DisparosStatsProps) {
  const stats = [
    {
      title: 'Total Campanhas',
      value: totalCampanhas,
      icon: Send,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    {
      title: 'Ativas/Enviando',
      value: campanhasAtivas,
      icon: TrendingUp,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500'
    },
    {
      title: 'Agendadas',
      value: campanhasAgendadas,
      icon: Clock,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'bg-orange-500/10',
      iconColor: 'text-orange-500'
    },
    {
      title: 'Concluídas',
      value: campanhasConcluidas,
      icon: CheckCircle,
      color: 'from-emerald-400 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500'
    },
    {
      title: 'Canceladas',
      value: campanhasCanceladas,
      icon: XCircle,
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-500/10',
      iconColor: 'text-red-500'
    },
    {
      title: 'Mensagens Enviadas',
      value: mensagensEnviadas,
      icon: Send,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? '...' : stat.value.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {stat.title}
            </p>
          </div>

          {/* Progress bar decorativa */}
          <div className="mt-3 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: loading ? '50%' : '100%' }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`h-full bg-gradient-to-r ${stat.color}`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
