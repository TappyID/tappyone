'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Star, 
  Clock, 
  MessageSquare, 
  ThumbsUp,
  Award,
  Target,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

// Dados mock dos atendentes
const attendantsData = [
  {
    id: '1',
    name: 'Ana Silva',
    avatar: '',
    ncsScore: 0,
    totalChats: 0,
    avgResponseTime: '0min',
    satisfaction: 0,
    resolutionRate: 0,
    trend: '0',
    status: 'offline'
  },
  {
    id: '2', 
    name: 'Carlos Santos',
    avatar: '',
    ncsScore: 0,
    totalChats: 0,
    avgResponseTime: '0min',
    satisfaction: 0,
    resolutionRate: 0,
    trend: '0',
    status: 'offline'
  },
  {
    id: '3',
    name: 'Maria Costa',
    avatar: '',
    ncsScore: 0,
    totalChats: 0,
    avgResponseTime: '0min',
    satisfaction: 0,
    resolutionRate: 0,
    trend: '0',
    status: 'offline'
  },
  {
    id: '4',
    name: 'João Oliveira',
    avatar: '',
    ncsScore: 0,
    totalChats: 0,
    avgResponseTime: '0min',
    satisfaction: 0,
    resolutionRate: 0,
    trend: '0',
    status: 'offline'
  }
]

const getQualityMetrics = (theme: string) => [
  { 
    label: 'NCS Médio Geral', 
    value: '0', 
    target: '9.0',
    trend: '0%',
    icon: Star,
    color: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
    bgColor: theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50',
    borderColor: theme === 'dark' ? 'border-yellow-600/30' : 'border-yellow-200'
  },
  { 
    label: 'Tempo Resposta Médio', 
    value: '0min', 
    target: '< 3min',
    trend: '0min',
    icon: Clock,
    color: theme === 'dark' ? 'text-blue-400' : 'text-blue-600',
    bgColor: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
    borderColor: theme === 'dark' ? 'border-blue-600/30' : 'border-blue-200'
  },
  { 
    label: 'Taxa de Resolução', 
    value: '0%', 
    target: '90%',
    trend: '0%',
    icon: CheckCircle2,
    color: theme === 'dark' ? 'text-green-400' : 'text-green-600',
    bgColor: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
    borderColor: theme === 'dark' ? 'border-green-600/30' : 'border-green-200'
  },
  { 
    label: 'Satisfação Cliente', 
    value: '0%', 
    target: '95%',
    trend: '0%',
    icon: ThumbsUp,
    color: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
    bgColor: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
    borderColor: theme === 'dark' ? 'border-purple-600/30' : 'border-purple-200'
  }
]

const getScoreColor = (score: number, theme: string) => {
  if (score >= 9) return theme === 'dark' ? 'text-green-300 bg-green-900/30' : 'text-green-600 bg-green-100'
  if (score >= 8) return theme === 'dark' ? 'text-yellow-300 bg-yellow-900/30' : 'text-yellow-600 bg-yellow-100'
  return theme === 'dark' ? 'text-red-300 bg-red-900/30' : 'text-red-600 bg-red-100'
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-500'
    case 'away': return 'bg-yellow-500'
    case 'offline': return 'bg-gray-400'
    default: return 'bg-gray-400'
  }
}

export default function NCSAnalytics() {
  const { theme } = useTheme()
  const qualityMetrics = getQualityMetrics(theme)
  
  return (
    <div className={`h-full overflow-y-auto ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 to-emerald-950/30' 
        : 'bg-gradient-to-br from-white to-emerald-50/30'
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
              }`}>Net Customer Score (NCS)</h1>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Análise da qualidade dos atendimentos em tempo real</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              theme === 'dark' 
                ? 'bg-emerald-900/30 text-emerald-300' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              <Award className="w-4 h-4" />
              <span className="text-sm font-semibold">Qualidade Excelente</span>
            </div>
          </div>
        </motion.div>

        {/* Métricas Gerais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {qualityMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                whileHover={{ y: -2, scale: 1.02 }}
                className={`${metric.bgColor} backdrop-blur-sm rounded-2xl p-6 border ${metric.borderColor} shadow-lg`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                  <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    metric.trend.startsWith('+') ? 
                      (theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700') : 
                    metric.trend.startsWith('-') && metric.label.includes('Tempo') ? 
                      (theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700') :
                      (theme === 'dark' ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700')
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {metric.trend}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{metric.value}</div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Meta: {metric.target}</div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Ranking dos Atendentes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 dark:border-border/50 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Ranking de Performance</h2>
              <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Avaliação individual dos atendentes</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>{attendantsData.length} atendentes ativos</span>
            </div>
          </div>

          <div className="space-y-4">
            {attendantsData.map((attendant, index) => (
              <motion.div
                key={attendant.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.01, x: 5 }}
                className={`rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600/50' 
                    : 'bg-gradient-to-r from-gray-50 to-white border-gray-200/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Ranking e Info do Atendente */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="relative">
                        {attendant.avatar ? (
                          <img
                            src={attendant.avatar}
                            alt={attendant.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {attendant.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(attendant.status)}`} />
                      </div>
                    </div>

                    <div>
                      <h3 className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{attendant.name}</h3>
                      <div className={`flex items-center gap-4 text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <span>{attendant.totalChats} chats</span>
                        <span>•</span>
                        <span>{attendant.avgResponseTime} resposta</span>
                      </div>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className="flex items-center gap-8">
                    {/* NCS Score */}
                    <div className="text-center">
                      <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(attendant.ncsScore, theme)}`}>
                        {attendant.ncsScore}
                      </div>
                      <div className={`text-xs mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>NCS</div>
                    </div>

                    {/* Satisfação */}
                    <div className="text-center">
                      <div className={`text-xl font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{attendant.satisfaction}%</div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Satisfação</div>
                    </div>

                    {/* Taxa de Resolução */}
                    <div className="text-center">
                      <div className={`text-xl font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{attendant.resolutionRate}%</div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Resolução</div>
                    </div>

                    {/* Tendência */}
                    <div className="text-center">
                      <div className={`text-lg font-semibold flex items-center gap-1 ${
                        attendant.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={`w-4 h-4 ${attendant.trend.startsWith('-') ? 'rotate-180' : ''}`} />
                        {attendant.trend}
                      </div>
                      <div className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>Tendência</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className={`mt-4 rounded-full h-2 overflow-hidden ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
                }`}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(attendant.ncsScore / 10) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Insights e Recomendações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className={`rounded-2xl p-6 border ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-green-950/30 to-emerald-950/30 border-green-600/30' 
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
                <span className={`font-semibold ${
                  theme === 'dark' ? 'text-green-300' : 'text-green-900'
                }`}>Pontos Fortes</span>
              </div>
              <ul className={`space-y-2 text-sm ${
                theme === 'dark' ? 'text-green-200' : 'text-green-800'
              }`}>
                <li>• Nenhum dado de performance disponível</li>
                <li>• Sistema aguardando inicialização</li>
                <li>• Métricas serão carregadas após primeiro atendimento</li>
              </ul>
            </div>

            <div className={`rounded-2xl p-6 border ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-orange-950/30 to-red-950/30 border-orange-600/30' 
                : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200/50'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className={`w-5 h-5 ${
                  theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                }`} />
                <span className={`font-semibold ${
                  theme === 'dark' ? 'text-orange-300' : 'text-orange-900'
                }`}>Oportunidades</span>
              </div>
              <ul className={`space-y-2 text-sm ${
                theme === 'dark' ? 'text-orange-200' : 'text-orange-800'
              }`}>
                <li>• Aguardando dados para análise</li>
                <li>• Configure metas de performance</li>
                <li>• Inicie atendimentos para gerar métricas</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
