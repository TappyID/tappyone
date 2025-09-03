'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
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

// Dados mock do funil
const funnelData = [
  {
    stage: 'Visitantes',
    value: 10000,
    percentage: 100,
    color: '#8B5CF6',
    icon: Users,
    description: 'Visitantes únicos no site'
  },
  {
    stage: 'Leads',
    value: 2500,
    percentage: 25,
    color: '#06B6D4',
    icon: MessageCircle,
    description: 'Iniciaram conversa no WhatsApp'
  },
  {
    stage: 'Qualificados',
    value: 750,
    percentage: 7.5,
    color: '#10B981',
    icon: CheckCircle,
    description: 'Leads qualificados pelos atendentes'
  },
  {
    stage: 'Convertidos',
    value: 150,
    percentage: 1.5,
    color: '#F59E0B',
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
  const [isHorizontal, setIsHorizontal] = useState(false)

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-white to-blue-50/30">
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Funil de Conversão</h1>
              <p className="text-gray-600">Análise detalhada do processo de conversão de leads</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">+15% vs mês anterior</span>
              </div>
              
              {/* Toggle Button */}
              <motion.button
                onClick={() => setIsHorizontal(!isHorizontal)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-200 text-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
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
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 font-medium">{metric.label}</span>
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                  metric.positive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <TrendingUp className={`w-3 h-3 ${metric.positive ? '' : 'rotate-180'}`} />
                  {metric.trend}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            </motion.div>
          ))}
        </motion.div>

    
      </div>
    </div>
  )
}
