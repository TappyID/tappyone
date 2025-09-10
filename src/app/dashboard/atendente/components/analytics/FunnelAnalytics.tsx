'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { ResponsiveFunnel } from '@nivo/funnel'
import { 
  Users, 
  MessageCircle, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  ArrowDown,
  Zap,
  RotateCcw,
  LayoutGrid
} from 'lucide-react'

// Dados do funil para Nivo
const funnelData = [
  { id: 'visitantes', value: 10000, label: 'Visitantes' },
  { id: 'leads', value: 2500, label: 'Leads' },
  { id: 'qualificados', value: 750, label: 'Qualificados' },
  { id: 'convertidos', value: 150, label: 'Convertidos' }
]

// Dados detalhados para cards informativos
const stageDetails = [
  {
    stage: 'Visitantes',
    value: 10000,
    percentage: 100,
    color: '#305e73',
    icon: Users,
    description: 'Visitantes únicos no site'
  },
  {
    stage: 'Leads',
    value: 2500,
    percentage: 25,
    color: '#4a7c95',
    icon: MessageCircle,
    description: 'Iniciaram conversa no WhatsApp'
  },
  {
    stage: 'Qualificados',
    value: 750,
    percentage: 7.5,
    color: '#6b9ab8',
    icon: CheckCircle,
    description: 'Leads qualificados pelos atendentes'
  },
  {
    stage: 'Convertidos',
    value: 150,
    percentage: 1.5,
    color: '#8db8da',
    icon: DollarSign,
    description: 'Fecharam negócio'
  }
]

const conversionMetrics = [
  { label: 'Taxa de Conversão Geral', value: '1.5%', trend: '+0.3%', positive: true },
  { label: 'Ticket Médio', value: 'R$ 2.847', trend: '+12%', positive: true },
  { label: 'Tempo Médio no Funil', value: '4.2 dias', trend: '-0.8d', positive: true },
  { label: 'ROI', value: '340%', trend: '+45%', positive: true }
]

export default function FunnelAnalytics() {
  const { theme } = useTheme()
  const [isHorizontal, setIsHorizontal] = useState(false)

  return (
    <div className={`h-full overflow-y-auto ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-blue-950/30' 
        : 'bg-gradient-to-br from-white to-blue-50/30'
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
              }`}>Funil de Conversão</h1>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Análise detalhada do processo de conversão de leads</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
              }`}>
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+15% vs mês anterior</span>
              </div>
              
              {/* Toggle Button */}
              <motion.button
                onClick={() => setIsHorizontal(!isHorizontal)}
                className={`flex items-center gap-2 px-4 py-2 border-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-slate-800 border-blue-600/50 text-blue-400' 
                    : 'bg-white border-blue-200 text-blue-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isHorizontal ? <RotateCcw className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                <span className="text-sm font-semibold">
                  {isHorizontal ? 'Modo Vertical' : 'Modo Horizontal'}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Métricas de Conversão */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {conversionMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              whileHover={{ y: -2, scale: 1.02 }}
              className={`backdrop-blur-sm rounded-3xl p-6 border shadow-lg ${
                theme === 'dark' 
                  ? 'bg-slate-800/80 border-slate-600/50' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>{metric.label}</span>
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  metric.positive 
                    ? (theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')
                    : (theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700')
                }`}>
                  <TrendingUp className={`w-3 h-3 ${metric.positive ? '' : 'rotate-180'}`} />
                  {metric.trend}
                </div>
              </div>
              <div className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{metric.value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Funil Interativo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Gráfico do Funil */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className={`backdrop-blur-sm rounded-3xl p-8 border shadow-xl ${
              theme === 'dark' 
                ? 'bg-slate-800/90 border-slate-600/50' 
                : 'bg-white/90 border-gray-200/50'
            }`}>
              <div className="mb-6">
                <h2 className={`text-2xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Visualização do Funil</h2>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Conversão de visitantes até vendas</p>
              </div>
              
              {/* Funil Horizontal Nivo */}
              <div className="relative h-[500px] rounded-3xl overflow-hidden">
                {/* Background Pattern Suave */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  theme === 'dark' 
                    ? 'from-slate-800/50 to-blue-950/50' 
                    : 'from-blue-50/80 to-indigo-50/80'
                }`}></div>
                <div 
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `
                      repeating-linear-gradient(
                        0deg,
                        #305e73 0px,
                        #305e73 0.5px,
                        transparent 0.5px,
                        transparent 30px
                      )
                    `
                  }}
                ></div>
                
                {/* ResponsiveFunnel */}
                <div className="relative z-10 h-full">
                  <ResponsiveFunnel
                    data={funnelData}
                    margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                    direction="horizontal"
                    shapeBlending={1}
                    valueFormat=">-.4s"
                    colors={['#305e73', '#4a7c95', '#6b9ab8', '#8db8da']}
                    borderWidth={0}
                    labelColor={{ from: 'color', modifiers: [['darker', 2]] }}
                    beforeSeparatorLength={120}
                    beforeSeparatorOffset={30}
                    afterSeparatorLength={120}
                    afterSeparatorOffset={30}
                    currentPartSizeExtension={15}
                    currentBorderWidth={0}
                    fillOpacity={0.9}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cards de Detalhes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className={`backdrop-blur-sm rounded-3xl p-6 border shadow-xl ${
              theme === 'dark' 
                ? 'bg-slate-800/90 border-slate-600/50' 
                : 'bg-white/90 border-gray-200/50'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Zap className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-[#305e73]'
                }`} />
                Detalhes do Funil
              </h3>
              
              <div className="space-y-4">
                {stageDetails.map((stage, index) => {
                  const Icon = stage.icon
                  const conversionRate = index > 0 
                    ? ((stage.value / stageDetails[index - 1].value) * 100).toFixed(1)
                    : '100.0'
                  
                  return (
                    <motion.div
                      key={stage.stage}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-2xl border-l-4 bg-gradient-to-r ${
                        theme === 'dark' 
                          ? 'from-slate-700/50 to-slate-800/50' 
                          : 'from-white to-gray-50/50'
                      }`}
                      style={{ borderLeftColor: stage.color }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: stage.color + '20' }}
                        >
                          <Icon className="w-4 h-4" style={{ color: stage.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-semibold ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>{stage.stage}</span>
                            <div className="text-right">
                              <div className={`font-bold ${
                                theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {stage.value.toLocaleString()}
                              </div>
                              <div className={`text-xs ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                              }`}>
                                {conversionRate}% conversão
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className={`text-xs ml-11 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>{stage.description}</p>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Taxa de Conversão por Etapa */}
            <div className={`backdrop-blur-sm rounded-3xl p-6 border shadow-xl ${
              theme === 'dark' 
                ? 'bg-slate-800/90 border-slate-600/50' 
                : 'bg-white/90 border-gray-200/50'
            }`}>
              <h3 className={`text-lg font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Taxas de Conversão</h3>
              <div className="space-y-3">
                <div className={`flex justify-between items-center p-3 rounded-2xl bg-gradient-to-r ${
                  theme === 'dark' 
                    ? 'from-green-900/20 to-green-800/20' 
                    : 'from-green-50 to-green-100'
                }`}>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Visitante → Lead</span>
                  <span className={`font-bold ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-700'
                  }`}>25.0%</span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-2xl bg-gradient-to-r ${
                  theme === 'dark' 
                    ? 'from-blue-900/20 to-blue-800/20' 
                    : 'from-blue-50 to-blue-100'
                }`}>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Lead → Qualificado</span>
                  <span className={`font-bold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                  }`}>30.0%</span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-2xl bg-gradient-to-r ${
                  theme === 'dark' 
                    ? 'from-orange-900/20 to-orange-800/20' 
                    : 'from-orange-50 to-orange-100'
                }`}>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Qualificado → Venda</span>
                  <span className={`font-bold ${
                    theme === 'dark' ? 'text-orange-400' : 'text-orange-700'
                  }`}>20.0%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
