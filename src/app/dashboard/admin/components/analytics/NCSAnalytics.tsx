'use client'

import { motion } from 'framer-motion'
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
    ncsScore: 9.2,
    totalChats: 147,
    avgResponseTime: '2.3min',
    satisfaction: 94,
    resolutionRate: 89,
    trend: '+0.3',
    status: 'online'
  },
  {
    id: '2', 
    name: 'Carlos Santos',
    avatar: '',
    ncsScore: 8.7,
    totalChats: 132,
    avgResponseTime: '3.1min',
    satisfaction: 91,
    resolutionRate: 85,
    trend: '+0.1',
    status: 'online'
  },
  {
    id: '3',
    name: 'Maria Costa',
    avatar: '',
    ncsScore: 8.9,
    totalChats: 156,
    avgResponseTime: '2.8min',
    satisfaction: 93,
    resolutionRate: 87,
    trend: '+0.5',
    status: 'away'
  },
  {
    id: '4',
    name: 'João Oliveira',
    avatar: '',
    ncsScore: 8.4,
    totalChats: 98,
    avgResponseTime: '4.2min',
    satisfaction: 88,
    resolutionRate: 82,
    trend: '-0.2',
    status: 'online'
  }
]

const qualityMetrics = [
  { 
    label: 'NCS Médio Geral', 
    value: '8.8', 
    target: '9.0',
    trend: '+0.2',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  { 
    label: 'Tempo Resposta Médio', 
    value: '3.1min', 
    target: '< 3min',
    trend: '-0.3min',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  { 
    label: 'Taxa de Resolução', 
    value: '86%', 
    target: '90%',
    trend: '+2%',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  { 
    label: 'Satisfação Cliente', 
    value: '92%', 
    target: '95%',
    trend: '+1%',
    icon: ThumbsUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
]

const getScoreColor = (score: number) => {
  if (score >= 9) return 'text-green-600 bg-green-100'
  if (score >= 8) return 'text-yellow-600 bg-yellow-100'
  return 'text-red-600 bg-red-100'
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
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-white to-emerald-50/30">
      <div className="p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Net Customer Score (NCS)</h1>
              <p className="text-gray-600">Análise da qualidade dos atendimentos em tempo real</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full">
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
                    metric.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 
                    metric.trend.startsWith('-') && metric.label.includes('Tempo') ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {metric.trend}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-sm text-gray-600">Meta: {metric.target}</div>
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
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ranking de Performance</h2>
              <p className="text-gray-600">Avaliação individual dos atendentes</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-500">{attendantsData.length} atendentes ativos</span>
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
                className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all"
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
                      <h3 className="font-semibold text-gray-900">{attendant.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
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
                      <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(attendant.ncsScore)}`}>
                        {attendant.ncsScore}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">NCS</div>
                    </div>

                    {/* Satisfação */}
                    <div className="text-center">
                      <div className="text-xl font-semibold text-gray-900">{attendant.satisfaction}%</div>
                      <div className="text-xs text-gray-500">Satisfação</div>
                    </div>

                    {/* Taxa de Resolução */}
                    <div className="text-center">
                      <div className="text-xl font-semibold text-gray-900">{attendant.resolutionRate}%</div>
                      <div className="text-xs text-gray-500">Resolução</div>
                    </div>

                    {/* Tendência */}
                    <div className="text-center">
                      <div className={`text-lg font-semibold flex items-center gap-1 ${
                        attendant.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={`w-4 h-4 ${attendant.trend.startsWith('-') ? 'rotate-180' : ''}`} />
                        {attendant.trend}
                      </div>
                      <div className="text-xs text-gray-500">Tendência</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
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
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Pontos Fortes</span>
              </div>
              <ul className="space-y-2 text-sm text-green-800">
                <li>• Ana Silva mantém excelente NCS (9.2)</li>
                <li>• Tempo de resposta geral melhorou 15%</li>
                <li>• Taxa de satisfação acima da meta</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200/50">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-900">Oportunidades</span>
              </div>
              <ul className="space-y-2 text-sm text-orange-800">
                <li>• João precisa melhorar tempo de resposta</li>
                <li>• Foco em aumentar taxa de resolução</li>
                <li>• Treinamento em técnicas de atendimento</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
