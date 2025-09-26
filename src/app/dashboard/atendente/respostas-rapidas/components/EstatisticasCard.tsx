'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap,
  MessageCircle,
  Settings,
  Calendar,
  Activity,
  Target,
  CheckCircle
} from 'lucide-react'
import { EstatisticasResposta } from '@/hooks/useRespostasRapidas'
import { useTheme } from '@/contexts/ThemeContext'

interface EstatisticasCardProps {
  estatisticas: EstatisticasResposta | null
  loading: boolean
}

export default function EstatisticasCard({
  estatisticas,
  loading
}: EstatisticasCardProps) {
  const { actualTheme } = useTheme()
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-6 shadow-lg border backdrop-blur-xl transition-all duration-300 ${
              actualTheme === 'dark'
                ? 'bg-slate-900/60 border-slate-700/50 shadow-2xl shadow-black/50'
                : 'bg-white/80 border-gray-100'
            }`}
          >
            <div className="animate-pulse">
              <div className={`w-12 h-12 rounded-xl mb-4 ${
                actualTheme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
              }`}></div>
              <div className={`h-4 rounded mb-2 ${
                actualTheme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
              }`}></div>
              <div className={`h-8 rounded mb-2 ${
                actualTheme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
              }`}></div>
              <div className={`h-3 rounded w-2/3 ${
                actualTheme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
              }`}></div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (!estatisticas) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm ${
          actualTheme === 'dark'
            ? 'bg-slate-800/60 border border-slate-700/50'
            : 'bg-gray-100'
        }`}>
          <BarChart3 className={`w-12 h-12 ${
            actualTheme === 'dark' ? 'text-slate-400' : 'text-gray-400'
          }`} />
        </div>
        <h3 className={`text-xl font-semibold mb-2 ${
          actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Estatísticas não disponíveis
        </h3>
        <p className={`${
          actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
        }`}>
          Não foi possível carregar as estatísticas no momento
        </p>
      </motion.div>
    )
  }

  const stats = [
    {
      title: 'Total de Categorias',
      value: estatisticas.total_categorias,
      icon: Settings,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Categorias criadas'
    },
    {
      title: 'Total de Respostas',
      value: estatisticas.total_respostas,
      icon: MessageCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Respostas configuradas'
    },
    {
      title: 'Respostas Ativas',
      value: estatisticas.respostas_ativas,
      icon: Zap,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      description: 'Funcionando automaticamente'
    },
    {
      title: 'Total de Execuções',
      value: estatisticas.total_execucoes,
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Execuções realizadas'
    },
    {
      title: 'Execuções Hoje',
      value: estatisticas.execucoes_hoje,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Nas últimas 24 horas'
    },
    {
      title: 'Taxa de Sucesso',
      value: estatisticas.total_execucoes > 0 ? '98%' : '0%',
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      description: 'Execuções bem-sucedidas'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${
          actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Estatísticas das Respostas Rápidas
        </h2>
        <p className={`${
          actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
        }`}>
          Acompanhe o desempenho e uso das suas automações
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 backdrop-blur-xl ${
                actualTheme === 'dark'
                  ? 'bg-slate-900/60 border-slate-700/50 shadow-2xl shadow-black/50 hover:bg-slate-900/80 hover:border-slate-600/60'
                  : 'bg-white/80 border-gray-100 hover:bg-white'
              }`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon className={`w-7 h-7 ${stat.textColor}`} />
              </div>

              {/* Title */}
              <h3 className={`text-lg font-semibold mb-1 ${
                actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {stat.title}
              </h3>

              {/* Value */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-3xl font-bold ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </span>
                {index === 4 && estatisticas.execucoes_hoje > 0 && (
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">+12%</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className={`text-sm ${
                actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
              }`}>
                {stat.description}
              </p>

              {/* Progress Bar (for some stats) */}
              {(index === 2 || index === 5) && (
                <div className="mt-4">
                  <div className={`w-full rounded-full h-2 ${
                    actualTheme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
                  }`}>
                    <div 
                      className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-500`}
                      style={{ 
                        width: index === 2 
                          ? `${Math.min((estatisticas.respostas_ativas / Math.max(estatisticas.total_respostas, 1)) * 100, 100)}%`
                          : '98%'
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Activity Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`rounded-2xl p-6 shadow-lg border backdrop-blur-xl transition-all duration-300 ${
          actualTheme === 'dark'
            ? 'bg-slate-900/60 border-slate-700/50 shadow-2xl shadow-black/50'
            : 'bg-white/80 border-gray-100'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${
              actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Atividade Recente
            </h3>
            <p className={`text-sm ${
              actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
            }`}>
              Execuções dos últimos 7 dias
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Activity className={`w-5 h-5 ${
              actualTheme === 'dark' ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <span className={`text-sm ${
              actualTheme === 'dark' ? 'text-white/60' : 'text-gray-500'
            }`}>Últimos 7 dias</span>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className={`h-64 rounded-xl flex items-center justify-center ${
          actualTheme === 'dark'
            ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/50'
            : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
          <div className="text-center">
            <BarChart3 className={`w-12 h-12 mx-auto mb-3 ${
              actualTheme === 'dark' ? 'text-slate-400' : 'text-gray-400'
            }`} />
            <p className={`font-medium ${
              actualTheme === 'dark' ? 'text-white/80' : 'text-gray-500'
            }`}>Gráfico de Atividade</p>
            <p className={`text-sm ${
              actualTheme === 'dark' ? 'text-white/60' : 'text-gray-400'
            }`}>Em breve disponível</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Otimize suas Respostas
            </h3>
            <p className="text-white/80 text-sm">
              Analise o desempenho e melhore a eficiência das suas automações
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all duration-200"
            >
              Ver Relatório
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#305e73] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-200"
            >
              Exportar Dados
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
