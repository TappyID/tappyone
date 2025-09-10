'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users,
  MessageCircle,
  Clock,
  Target,
  Zap,
  Activity,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react'

// Dados mock para os charts
const revenueData = [
  { month: 'Jan', revenue: 45000, growth: 12 },
  { month: 'Fev', revenue: 52000, growth: 15 },
  { month: 'Mar', revenue: 48000, growth: -8 },
  { month: 'Abr', revenue: 61000, growth: 27 },
  { month: 'Mai', revenue: 55000, growth: -10 },
  { month: 'Jun', revenue: 67000, growth: 22 }
]

const channelData = [
  { channel: 'WhatsApp', value: 45, color: '#25D366' },
  { channel: 'Website', value: 30, color: '#305e73' },
  { channel: 'Instagram', value: 15, color: '#E4405F' },
  { channel: 'Outros', value: 10, color: '#6B7280' }
]

const deviceData = [
  { device: 'Mobile', percentage: 68, icon: Smartphone },
  { device: 'Desktop', percentage: 25, icon: Monitor },
  { device: 'Tablet', percentage: 7, icon: Globe }
]

const getKpiData = (theme: string) => [
  {
    label: 'Receita Total',
    value: 'R$ 328K',
    change: '+18%',
    trend: 'up',
    icon: DollarSign,
    color: theme === 'dark' ? 'text-green-400' : 'text-green-600',
    bgColor: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
    borderColor: theme === 'dark' ? 'border-green-600/30' : 'border-green-200'
  },
  {
    label: 'Novos Clientes',
    value: '1,247',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
    bgColor: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
    borderColor: theme === 'dark' ? 'border-blue-600/30' : 'border-blue-200'
  },
  {
    label: 'Conversas Ativas',
    value: '89',
    change: '+5%',
    trend: 'up',
    icon: MessageCircle,
    color: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
    bgColor: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
    borderColor: theme === 'dark' ? 'border-purple-600/30' : 'border-purple-200'
  },
  {
    label: 'Tempo Médio',
    value: '3.2min',
    change: '-8%',
    trend: 'down',
    icon: Clock,
    color: theme === 'dark' ? 'text-orange-400' : 'text-orange-600',
    bgColor: theme === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50',
    borderColor: theme === 'dark' ? 'border-orange-600/30' : 'border-orange-200'
  }
]

export default function OverviewAnalytics() {
  const { theme } = useTheme()
  const kpiData = getKpiData(theme)
  
  return (
    <div className={`h-full overflow-y-auto ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-orange-950/30' 
        : 'bg-gradient-to-br from-white to-orange-50/30'
    }`}>
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Visão Geral</h1>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Dashboard executivo com métricas consolidadas</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-full">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-semibold">Dados em Tempo Real</span>
            </div>
          </div>
        </motion.div>

        {/* KPIs Principais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <motion.div
                key={kpi.label}
                whileHover={{ y: -2, scale: 1.02 }}
                className={`${kpi.bgColor} backdrop-blur-sm rounded-2xl p-6 border ${kpi.borderColor} shadow-lg relative overflow-hidden`}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <div className={`w-full h-full rounded-full ${kpi.color.replace('text-', 'bg-')}`} />
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      kpi.trend === 'up' ? 
                        (theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700') : 
                        (theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700')
                    }`}>
                      <TrendingUp className={`w-3 h-3 ${kpi.trend === 'down' ? 'rotate-180' : ''}`} />
                      {kpi.change}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{kpi.value}</div>
                    <div className={`text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>{kpi.label}</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Receita */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 dark:border-border/50 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Evolução da Receita</h3>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Últimos 6 meses</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>R$ 328K</div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`}>+18% vs período anterior</div>
              </div>
            </div>

            <div className="space-y-4">
              {revenueData.map((item, index) => (
                <motion.div
                  key={item.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={`w-12 text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>{item.month}</div>
                  <div className={`flex-1 rounded-full h-3 overflow-hidden ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                  }`}>
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.revenue / 70000) * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    />
                  </div>
                  <div className="w-20 text-right">
                    <div className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      R$ {(item.revenue / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div className={`w-16 text-xs font-medium ${
                    item.growth > 0 ? 
                      (theme === 'dark' ? 'text-green-400' : 'text-green-600') : 
                      (theme === 'dark' ? 'text-red-400' : 'text-red-600')
                  }`}>
                    {item.growth > 0 ? '+' : ''}{item.growth}%
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Canais de Atendimento */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 dark:border-border/50 shadow-xl"
          >
            <div className="mb-6">
              <h3 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Canais de Atendimento</h3>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Distribuição por canal</p>
            </div>

            <div className="space-y-6">
              {channelData.map((channel, index) => (
                <motion.div
                  key={channel.channel}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: channel.color }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{channel.channel}</span>
                      <span className={`text-sm font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>{channel.value}%</span>
                    </div>
                    <div className={`rounded-full h-2 overflow-hidden ${
                      theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                    }`}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: channel.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${channel.value}%` }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dispositivos */}
            <div className={`mt-8 pt-6 border-t ${
              theme === 'dark' ? 'border-slate-600' : 'border-gray-200'
            }`}>
              <h4 className={`font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Dispositivos</h4>
              <div className="space-y-3">
                {deviceData.map((device, index) => {
                  const Icon = device.icon
                  return (
                    <motion.div
                      key={device.device}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`} />
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>{device.device}</span>
                      </div>
                      <span className={`text-sm font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{device.percentage}%</span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Insights e Alertas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className={`rounded-2xl p-6 border ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-green-950/30 to-emerald-950/30 border-green-600/30' 
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <Target className={`w-5 h-5 ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`} />
              <span className={`font-semibold ${
                theme === 'dark' ? 'text-green-300' : 'text-green-900'
              }`}>Meta Atingida</span>
            </div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-green-200' : 'text-green-800'
            }`}>
              Receita mensal superou a meta em 18%. Excelente performance!
            </p>
          </div>

          <div className={`rounded-2xl p-6 border ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border-blue-600/30' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <Zap className={`w-5 h-5 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <span className={`font-semibold ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
              }`}>Oportunidade</span>
            </div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
            }`}>
              WhatsApp representa 45% dos atendimentos. Potencial para automação.
            </p>
          </div>

          <div className={`rounded-2xl p-6 border ${
            theme === 'dark' 
              ? 'bg-gradient-to-r from-orange-950/30 to-yellow-950/30 border-orange-600/30' 
              : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200/50'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <Activity className={`w-5 h-5 ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
              }`} />
              <span className={`font-semibold ${
                theme === 'dark' ? 'text-orange-300' : 'text-orange-900'
              }`}>Tendência</span>
            </div>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-orange-200' : 'text-orange-800'
            }`}>
              Crescimento consistente nos últimos 3 meses. Manter estratégia atual.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
