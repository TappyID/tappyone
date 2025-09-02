'use client'

import { motion } from 'framer-motion'
import { Bell, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { Alerta } from '../page'

interface AlertasStatsProps {
  alertas: Alerta[]
}

export default function AlertasStats({ alertas }: AlertasStatsProps) {
  const totalAlertas = alertas.length
  const alertasAtivos = alertas.filter(a => a.status === 'ativo').length
  const alertasCriticos = alertas.filter(a => a.prioridade === 'critica').length
  const alertasHoje = alertas.reduce((acc, alerta) => acc + alerta.estatisticas.disparosHoje, 0)
  const taxaResolucaoMedia = alertas.length > 0 
    ? alertas.reduce((acc, alerta) => acc + alerta.estatisticas.taxaResolucao, 0) / alertas.length 
    : 0

  const stats = [
    {
      title: 'Total de Alertas',
      value: totalAlertas.toString(),
      icon: Bell,
      trend: '+2 este mês',
      trendUp: true,
      color: 'from-[#305e73] to-[#3a6d84]',
      bgColor: 'bg-[#305e73]/10',
      iconColor: 'text-[#305e73]'
    },
    {
      title: 'Alertas Ativos',
      value: alertasAtivos.toString(),
      icon: AlertTriangle,
      trend: `${((alertasAtivos / totalAlertas) * 100).toFixed(0)}% do total`,
      trendUp: alertasAtivos > 0,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Críticos',
      value: alertasCriticos.toString(),
      icon: AlertTriangle,
      trend: alertasCriticos === 0 ? 'Nenhum crítico' : 'Requer atenção',
      trendUp: alertasCriticos === 0,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Disparos Hoje',
      value: alertasHoje.toString(),
      icon: Clock,
      trend: 'Últimas 24h',
      trendUp: true,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Taxa de Resolução',
      value: `${taxaResolucaoMedia.toFixed(1)}%`,
      icon: CheckCircle,
      trend: taxaResolucaoMedia > 90 ? 'Excelente' : 'Pode melhorar',
      trendUp: taxaResolucaoMedia > 90,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown
        
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <TrendIcon className={`w-4 h-4 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              
              <div className="space-y-2">
                <motion.h3 
                  className="text-2xl font-bold text-gray-900"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-xs ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </p>
              </div>
            </div>

            {/* Hover glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`} />
          </motion.div>
        )
      })}
    </div>
  )
}
