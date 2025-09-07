'use client'

import { motion } from 'framer-motion'
import { 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Video,
  Phone,
  MapPin,
  Coffee
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface Agendamento {
  id: string
  titulo: string
  data: string
  hora_inicio: string
  hora_fim: string
  tipo: 'reuniao' | 'ligacao' | 'video' | 'presencial' | 'coffee'
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido'
  prioridade: 'baixa' | 'media' | 'alta'
  contato: {
    id: string
    nome: string
    telefone?: string
    email?: string
    avatar?: string
    empresa?: string
  }
}

interface AgendamentoStatsProps {
  agendamentos: Agendamento[]
}

export default function AgendamentoStats({ agendamentos }: AgendamentoStatsProps) {
  const { actualTheme } = useTheme()
  const hoje = new Date().toISOString().split('T')[0]
  const inicioSemana = new Date()
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay())
  const fimSemana = new Date(inicioSemana)
  fimSemana.setDate(inicioSemana.getDate() + 6)

  const agendamentosHoje = agendamentos.filter(ag => ag.data === hoje)
  const agendamentosSemana = agendamentos.filter(ag => {
    const dataAg = new Date(ag.data)
    return dataAg >= inicioSemana && dataAg <= fimSemana
  })

  const stats = [
    {
      title: 'Hoje',
      value: agendamentosHoje.length,
      subtitle: `${agendamentosHoje.filter(ag => ag.status === 'confirmado').length} confirmados`,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: actualTheme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50',
      textColor: actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600',
      trend: '+12%'
    },
    {
      title: 'Esta Semana',
      value: agendamentosSemana.length,
      subtitle: `${agendamentosSemana.filter(ag => ag.status === 'agendado').length} pendentes`,
      icon: Clock,
      color: 'from-green-500 to-green-600',
      bgColor: actualTheme === 'dark' ? 'bg-green-900/30' : 'bg-green-50',
      textColor: actualTheme === 'dark' ? 'text-green-400' : 'text-green-600',
      trend: '+8%'
    },
    {
      title: 'Confirmados',
      value: agendamentos.filter(ag => ag.status === 'confirmado').length,
      subtitle: `${Math.round((agendamentos.filter(ag => ag.status === 'confirmado').length / agendamentos.length) * 100)}% do total`,
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: actualTheme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-50',
      textColor: actualTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600',
      trend: '+15%'
    },
    {
      title: 'Alta Prioridade',
      value: agendamentos.filter(ag => ag.prioridade === 'alta').length,
      subtitle: 'Requer atenção',
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      bgColor: actualTheme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-50',
      textColor: actualTheme === 'dark' ? 'text-orange-400' : 'text-orange-600',
      trend: '-5%'
    }
  ]

  const tiposStats = [
    {
      tipo: 'reuniao',
      label: 'Reuniões',
      icon: Users,
      count: agendamentos.filter(ag => ag.tipo === 'reuniao').length,
      color: 'bg-blue-500'
    },
    {
      tipo: 'video',
      label: 'Videochamadas',
      icon: Video,
      count: agendamentos.filter(ag => ag.tipo === 'video').length,
      color: 'bg-green-500'
    },
    {
      tipo: 'ligacao',
      label: 'Ligações',
      icon: Phone,
      count: agendamentos.filter(ag => ag.tipo === 'ligacao').length,
      color: 'bg-red-500'
    },
    {
      tipo: 'presencial',
      label: 'Presencial',
      icon: MapPin,
      count: agendamentos.filter(ag => ag.tipo === 'presencial').length,
      color: 'bg-purple-500'
    },
    {
      tipo: 'coffee',
      label: 'Coffee',
      icon: Coffee,
      count: agendamentos.filter(ag => ag.tipo === 'coffee').length,
      color: 'bg-yellow-500'
    }
  ]

  const totalAgendamentos = agendamentos.length
  const maxCount = Math.max(...tiposStats.map(t => t.count))

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`rounded-2xl p-6 shadow-sm border backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${
                actualTheme === 'dark'
                  ? 'bg-slate-800/90 border-slate-700/50 hover:bg-slate-800'
                  : 'bg-white/90 border-gray-200 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                      <IconComponent className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                      }`}>{stat.title}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${
                          actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{stat.value}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          stat.trend.startsWith('+') 
                            ? actualTheme === 'dark'
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-green-100 text-green-600'
                            : actualTheme === 'dark'
                              ? 'bg-red-900/50 text-red-400'
                              : 'bg-red-100 text-red-600'
                        }`}>
                          {stat.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm ${
                    actualTheme === 'dark' ? 'text-white/60' : 'text-gray-500'
                  }`}>{stat.subtitle}</p>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="mt-4">
                <div className={`w-full rounded-full h-2 ${
                  actualTheme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.value / Math.max(...stats.map(s => s.value))) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                    className={`h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Tipos de Agendamento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-2xl p-6 shadow-sm border backdrop-blur-sm ${
          actualTheme === 'dark'
            ? 'bg-slate-800/90 border-slate-700/50'
            : 'bg-white/90 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${
                actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Tipos de Agendamento</h3>
              <p className={`text-sm ${
                actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
              }`}>Distribuição por categoria</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>{totalAgendamentos}</div>
            <div className={`text-sm ${
              actualTheme === 'dark' ? 'text-white/60' : 'text-gray-500'
            }`}>Total</div>
          </div>
        </div>

        <div className="space-y-4">
          {tiposStats.map((tipo, index) => {
            const IconComponent = tipo.icon
            const percentage = totalAgendamentos > 0 ? (tipo.count / totalAgendamentos) * 100 : 0
            
            return (
              <motion.div
                key={tipo.tipo}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className="flex items-center gap-4"
              >
                <div className={`w-10 h-10 ${tipo.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
                    }`}>{tipo.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{tipo.count}</span>
                      <span className={`text-xs ${
                        actualTheme === 'dark' ? 'text-white/60' : 'text-gray-500'
                      }`}>({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  
                  <div className={`w-full rounded-full h-2 ${
                    actualTheme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1 + 0.8, duration: 1 }}
                      className={`h-2 rounded-full ${tipo.color}`}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Status Overview */}
        <div className={`mt-6 pt-6 border-t ${
          actualTheme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <h4 className={`text-sm font-semibold mb-3 ${
            actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
          }`}>Status Overview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { status: 'agendado', label: 'Agendado', color: 'bg-yellow-500' },
              { status: 'confirmado', label: 'Confirmado', color: 'bg-green-500' },
              { status: 'cancelado', label: 'Cancelado', color: 'bg-red-500' },
              { status: 'concluido', label: 'Concluído', color: 'bg-blue-500' }
            ].map((statusItem, index) => {
              const count = agendamentos.filter(ag => ag.status === statusItem.status).length
              const percentage = totalAgendamentos > 0 ? (count / totalAgendamentos) * 100 : 0
              
              return (
                <motion.div
                  key={statusItem.status}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 1 }}
                  className="text-center"
                >
                  <div className={`w-8 h-8 ${statusItem.color} rounded-full mx-auto mb-2`} />
                  <div className={`text-lg font-bold ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{count}</div>
                  <div className={`text-xs ${
                    actualTheme === 'dark' ? 'text-white/70' : 'text-gray-500'
                  }`}>{statusItem.label}</div>
                  <div className={`text-xs ${
                    actualTheme === 'dark' ? 'text-white/50' : 'text-gray-400'
                  }`}>({percentage.toFixed(1)}%)</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
