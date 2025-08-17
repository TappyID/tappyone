'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap,
  MessageCircle,
  Bot,
  Activity,
  Users,
  Target,
  Brain,
  Cpu,
  Globe,
  PieChart,
  Calendar
} from 'lucide-react'
import { Agente } from '../page'

interface EstatisticasAgentesProps {
  agentes: Agente[]
}

export default function EstatisticasAgentes({ agentes }: EstatisticasAgentesProps) {
  const totalTokens = agentes.reduce((total, a) => total + a.usodetokens, 0)
  const totalChats = agentes.reduce((total, a) => total + a.chats.length, 0)
  const agentesAtivos = agentes.filter(a => a.status === 'ativado').length
  const mediaTokensPorAgente = agentes.length > 0 ? Math.round(totalTokens / agentes.length) : 0

  // Estatísticas por nicho
  const estatisticasPorNicho = agentes.reduce((acc, agente) => {
    if (!acc[agente.nicho]) {
      acc[agente.nicho] = {
        count: 0,
        tokens: 0,
        chats: 0,
        ativos: 0
      }
    }
    acc[agente.nicho].count++
    acc[agente.nicho].tokens += agente.usodetokens
    acc[agente.nicho].chats += agente.chats.length
    if (agente.status === 'ativado') acc[agente.nicho].ativos++
    return acc
  }, {} as Record<string, { count: number; tokens: number; chats: number; ativos: number }>)

  // Estatísticas por modelo
  const estatisticasPorModelo = agentes.reduce((acc, agente) => {
    if (!acc[agente.modelo]) {
      acc[agente.modelo] = {
        count: 0,
        tokens: 0,
        performance: 0
      }
    }
    acc[agente.modelo].count++
    acc[agente.modelo].tokens += agente.usodetokens
    return acc
  }, {} as Record<string, { count: number; tokens: number; performance: number }>)

  const stats = [
    {
      title: 'Total de Agentes',
      value: agentes.length,
      icon: Bot,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      description: 'Agentes criados',
      trend: '+12%'
    },
    {
      title: 'Agentes Ativos',
      value: agentesAtivos,
      icon: Zap,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      description: 'Funcionando agora',
      trend: '+8%'
    },
    {
      title: 'Total de Tokens',
      value: `${(totalTokens / 1000).toFixed(1)}k`,
      icon: Cpu,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      description: 'Tokens consumidos',
      trend: '+25%'
    },
    {
      title: 'Conversas Ativas',
      value: totalChats,
      icon: MessageCircle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      description: 'Chats em andamento',
      trend: '+15%'
    },
    {
      title: 'Média de Tokens',
      value: `${(mediaTokensPorAgente / 1000).toFixed(1)}k`,
      icon: Activity,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      description: 'Por agente',
      trend: '+5%'
    },
    {
      title: 'Taxa de Ativação',
      value: `${agentes.length > 0 ? Math.round((agentesAtivos / agentes.length) * 100) : 0}%`,
      icon: Target,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      description: 'Agentes ativos',
      trend: '+3%'
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Estatísticas dos Agentes de IA
        </h2>
        <p className="text-gray-600">
          Acompanhe o desempenho e uso dos seus assistentes inteligentes
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Icon */}
              <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon className={`w-7 h-7 ${stat.textColor}`} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {stat.title}
              </h3>

              {/* Value */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </span>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{stat.trend}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm">
                {stat.description}
              </p>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-500`}
                    style={{ 
                      width: `${Math.min(
                        stat.title === 'Taxa de Ativação' 
                          ? parseInt(stat.value.toString()) 
                          : Math.random() * 80 + 20, 
                        100
                      )}%`
                    }}
                  ></div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Estatísticas por Nicho */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Desempenho por Nicho
            </h3>
            <p className="text-gray-600 text-sm">
              Análise detalhada por segmento de mercado
            </p>
          </div>
          <PieChart className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(estatisticasPorNicho).map(([nicho, stats], index) => (
            <motion.div
              key={nicho}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 capitalize">{nicho}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stats.ativos === stats.count 
                    ? 'bg-green-100 text-green-700' 
                    : stats.ativos > 0 
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stats.ativos}/{stats.count} ativos
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Agentes:</span>
                  <span className="font-medium">{stats.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tokens:</span>
                  <span className="font-medium">{(stats.tokens / 1000).toFixed(1)}k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chats:</span>
                  <span className="font-medium">{stats.chats}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Estatísticas por Modelo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Uso por Modelo de IA
            </h3>
            <p className="text-gray-600 text-sm">
              Comparativo de consumo entre modelos
            </p>
          </div>
          <Brain className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(estatisticasPorModelo).map(([modelo, stats], index) => {
            const modeloInfo = {
              chatgpt: { icon: '🤖', color: 'bg-green-100 text-green-700', name: 'ChatGPT' },
              deepseek: { icon: '🧠', color: 'bg-blue-100 text-blue-700', name: 'DeepSeek' },
              qwen: { icon: '⚡', color: 'bg-purple-100 text-purple-700', name: 'Qwen' }
            }[modelo as keyof typeof modeloInfo] || { icon: '🤖', color: 'bg-gray-100 text-gray-700', name: modelo }

            return (
              <motion.div
                key={modelo}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${modeloInfo.color}`}>
                    <span className="text-2xl">{modeloInfo.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{modeloInfo.name}</h4>
                    <p className="text-sm text-gray-600">{stats.count} agentes</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tokens Consumidos</span>
                    <span className="font-bold text-lg text-gray-900">
                      {(stats.tokens / 1000).toFixed(1)}k
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((stats.tokens / totalTokens) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {totalTokens > 0 ? ((stats.tokens / totalTokens) * 100).toFixed(1) : 0}% do total
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Activity Timeline Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Atividade dos Agentes
            </h3>
            <p className="text-gray-600 text-sm">
              Timeline de atividades dos últimos 7 dias
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Últimos 7 dias</span>
          </div>
        </div>

        {/* Timeline Placeholder */}
        <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Timeline de Atividades</p>
            <p className="text-gray-400 text-sm">Gráfico em desenvolvimento</p>
          </div>
        </div>
      </motion.div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Resumo de Performance
            </h3>
            <p className="text-white/80 text-sm">
              Seus agentes estão performando bem! Continue otimizando para melhores resultados.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-all duration-200"
            >
              Ver Relatório Completo
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
