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

        {/* Funil Visual Horizontal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Jornada do Cliente</h2>
            <p className="text-gray-600">Visualização interativa do funil de vendas</p>
          </div>

          {/* Funil com Toggle Vertical/Horizontal */}
          {!isHorizontal ? (
            // Modo Vertical (Funil Real)
            <div className="relative flex flex-col items-center space-y-2">
              {funnelData.map((stage, index) => {
                const Icon = stage.icon
                const isLast = index === funnelData.length - 1
                
                // Calcular largura baseada na porcentagem para criar formato de funil
                const maxWidth = 800
                const minWidth = 200
                const widthPercentage = stage.percentage / funnelData[0].percentage
                const stageWidth = minWidth + (maxWidth - minWidth) * widthPercentage

                return (
                  <motion.div
                    key={stage.stage}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.15 }}
                    className="relative w-full flex justify-center"
                  >
                    {/* Forma do Funil com Bordas Arredondadas */}
                    <motion.div
                      className="relative overflow-hidden shadow-2xl rounded-3xl"
                      style={{
                        width: `${stageWidth}px`,
                        height: '120px',
                        background: `linear-gradient(135deg, ${stage.color}20, ${stage.color}40)`,
                        clipPath: index === 0 
                          ? 'polygon(5% 0%, 95% 0%, 90% 100%, 10% 100%)' // Topo mais largo
                          : index === funnelData.length - 1
                          ? 'polygon(10% 0%, 90% 0%, 85% 100%, 15% 100%)' // Base mais estreita
                          : 'polygon(8% 0%, 92% 0%, 88% 100%, 12% 100%)', // Meio afunilando
                        border: `3px solid ${stage.color}60`
                      }}
                      whileHover={{ scale: 1.02, y: -3 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {/* Background Pattern */}
                      <div 
                        className="absolute inset-0 opacity-15 rounded-3xl"
                        style={{ backgroundColor: stage.color }}
                      />
                      
                      {/* Conteúdo */}
                      <div className="relative h-full flex items-center justify-between px-8">
                        {/* Lado Esquerdo - Ícone e Nome */}
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                            style={{ backgroundColor: stage.color }}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{stage.stage}</h3>
                            <p className="text-sm text-gray-600">{stage.description}</p>
                          </div>
                        </div>
                        
                        {/* Lado Direito - Números */}
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">
                            {stage.value.toLocaleString()}
                          </div>
                          <div className="text-lg font-semibold" style={{ color: stage.color }}>
                            {stage.percentage}%
                          </div>
                        </div>
                      </div>

                      {/* Barra de Progresso no Fundo */}
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/10 rounded-b-3xl overflow-hidden">
                        <motion.div
                          className="h-full rounded-b-3xl"
                          style={{ backgroundColor: stage.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPercentage * 100}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                        />
                      </div>
                    </motion.div>

                    {/* Seta de Conexão entre os níveis */}
                    {!isLast && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ) : (
            // Modo Horizontal (Cards)
            <div className="flex items-center justify-center gap-6 overflow-x-auto pb-4">
              {funnelData.map((stage, index) => {
                const Icon = stage.icon
                const isLast = index === funnelData.length - 1

                return (
                  <div key={stage.stage} className="flex items-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="relative flex-shrink-0"
                    >
                      <motion.div
                        className="relative bg-gradient-to-br rounded-3xl shadow-xl overflow-hidden min-w-[280px] border-2"
                        style={{
                          background: `linear-gradient(135deg, ${stage.color}15, ${stage.color}25)`,
                          borderColor: `${stage.color}40`
                        }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {/* Background Pattern */}
                        <div 
                          className="absolute inset-0 opacity-10 rounded-3xl"
                          style={{ backgroundColor: stage.color }}
                        />
                        
                        <div className="relative p-6">
                          {/* Icon e Stage */}
                          <div className="flex flex-col items-center text-center mb-4">
                            <div 
                              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-3"
                              style={{ backgroundColor: stage.color }}
                            >
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{stage.stage}</h3>
                            <p className="text-sm text-gray-600 text-center">{stage.description}</p>
                          </div>
                          
                          {/* Números */}
                          <div className="text-center mb-4">
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                              {stage.value.toLocaleString()}
                            </div>
                            <div className="text-lg font-semibold" style={{ color: stage.color }}>
                              {stage.percentage}%
                            </div>
                          </div>

                          {/* Progress Bar Circular */}
                          <div className="flex justify-center">
                            <div className="relative w-20 h-20">
                              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="32"
                                  stroke="currentColor"
                                  strokeWidth="6"
                                  fill="none"
                                  className="text-gray-200"
                                />
                                <motion.circle
                                  cx="40"
                                  cy="40"
                                  r="32"
                                  stroke={stage.color}
                                  strokeWidth="6"
                                  fill="none"
                                  strokeLinecap="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: stage.percentage / 100 }}
                                  transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                                  style={{
                                    strokeDasharray: `${2 * Math.PI * 32}`,
                                    strokeDashoffset: `${2 * Math.PI * 32 * (1 - stage.percentage / 100)}`
                                  }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold" style={{ color: stage.color }}>
                                  {stage.percentage}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Seta de conexão */}
                    {!isLast && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex-shrink-0 mx-4"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Oportunidade</span>
              </div>
              <p className="text-sm text-blue-800">
                Melhorando a qualificação de leads, podemos aumentar a conversão em até 23%
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Tendência</span>
              </div>
              <p className="text-sm text-green-800">
                Taxa de conversão cresceu 15% nos últimos 30 dias
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200/50">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-900">Receita</span>
              </div>
              <p className="text-sm text-orange-800">
                Potencial de R$ 427K em receita adicional este mês
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
