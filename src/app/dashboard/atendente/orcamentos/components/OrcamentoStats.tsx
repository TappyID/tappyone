'use client'

import { motion } from 'framer-motion'
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  Calendar
} from 'lucide-react'

export default function OrcamentoStats() {
  const stats = [
    {
      title: 'Faturamento Total',
      value: 'R$ 234.500',
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      description: 'Valor total dos orçamentos',
      change: '+18%',
      changeType: 'positive' as const,
      trend: [65, 78, 82, 95, 88, 92, 100]
    },
    {
      title: 'Orçamentos Ativos',
      value: '47',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Aguardando aprovação',
      change: '+12%',
      changeType: 'positive' as const,
      trend: [45, 52, 48, 55, 47, 49, 47]
    },
    {
      title: 'Taxa de Conversão',
      value: '73%',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Orçamentos aprovados',
      change: '+5%',
      changeType: 'positive' as const,
      trend: [68, 70, 69, 72, 71, 74, 73]
    },
    {
      title: 'Tempo Médio',
      value: '3.2 dias',
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Para aprovação',
      change: '-8%',
      changeType: 'positive' as const,
      trend: [4.1, 3.8, 3.5, 3.2, 3.4, 3.1, 3.2]
    }
  ]

  const statusStats = [
    { label: 'Aprovados', value: 34, color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
    { label: 'Pendentes', value: 13, color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
    { label: 'Rejeitados', value: 5, color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle },
    { label: 'Expirados', value: 3, color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Calendar }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className={`w-full h-full bg-gradient-to-br ${stat.color}`}></div>
              </div>
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                
                {/* Change indicator */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  stat.changeType === 'positive' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${
                    stat.changeType === 'negative' ? 'rotate-180' : ''
                  }`} />
                  {stat.change}
                </div>
              </div>

              {/* Value */}
              <div className="mb-3 relative z-10">
                <div className={`text-3xl font-bold ${stat.textColor} mb-1 group-hover:scale-105 transition-transform duration-200`}>
                  {stat.value}
                </div>
                <div className="text-gray-900 font-semibold text-sm">
                  {stat.title}
                </div>
              </div>

              {/* Description */}
              <div className="text-gray-600 text-xs mb-4 relative z-10">
                {stat.description}
              </div>

              {/* Mini Chart */}
              <div className="relative z-10">
                <div className="flex items-end gap-1 h-8">
                  {stat.trend.map((value, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${(value / 100) * 100}%` }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className={`flex-1 bg-gradient-to-t ${stat.color} rounded-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Status dos Orçamentos</h3>
            <p className="text-gray-600 text-sm">Distribuição atual dos orçamentos por status</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>55 orçamentos totais</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusStats.map((status, index) => {
            const Icon = status.icon
            const percentage = Math.round((status.value / 55) * 100)
            
            return (
              <motion.div
                key={status.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${status.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-4 h-4 ${status.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`text-2xl font-bold ${status.color} group-hover:scale-105 transition-transform duration-200`}>
                      {status.value}
                    </div>
                  </div>
                </div>
                
                <div className="text-gray-700 font-medium text-sm mb-2">
                  {status.label}
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.8 + (index * 0.1), duration: 0.5 }}
                    className={`h-2 rounded-full bg-gradient-to-r ${
                      status.label === 'Aprovados' ? 'from-green-400 to-green-500' :
                      status.label === 'Pendentes' ? 'from-yellow-400 to-yellow-500' :
                      status.label === 'Rejeitados' ? 'from-red-400 to-red-500' :
                      'from-gray-400 to-gray-500'
                    }`}
                  />
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  {percentage}% do total
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
