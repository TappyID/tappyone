'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Users, 
  Shield, 
  UserCheck, 
  Crown,
  TrendingUp,
  Calendar,
  Activity,
  UserPlus,
  Clock,
  CheckCircle
} from 'lucide-react'

interface Usuario {
  id: string
  nome: string
  email: string
  tipo: 'admin' | 'atendente' | 'assinante'
  status: 'ativo' | 'inativo' | 'suspenso'
  ultimo_acesso: string
  criado_em: string
  permissoes: string[]
}

interface UsuariosStatsProps {
  usuarios: Usuario[]
}

export default function UsuariosStats({ usuarios }: UsuariosStatsProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  // Estatísticas gerais
  const totalUsuarios = usuarios.length
  const usuariosAtivos = usuarios.filter(u => u.status === 'ativo').length
  const usuariosInativos = usuarios.filter(u => u.status === 'inativo').length
  const usuariosSuspensos = usuarios.filter(u => u.status === 'suspenso').length

  // Estatísticas por tipo
  const admins = usuarios.filter(u => u.tipo === 'admin').length
  const atendentes = usuarios.filter(u => u.tipo === 'atendente').length
  const assinantes = usuarios.filter(u => u.tipo === 'assinante').length

  // Usuários criados nos últimos 30 dias
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - 30)
  const novosUsuarios = usuarios.filter(u => new Date(u.criado_em) > dataLimite).length

  // Usuários online (último acesso nas últimas 24h)
  const dataOnline = new Date()
  dataOnline.setHours(dataOnline.getHours() - 24)
  const usuariosOnline = usuarios.filter(u => new Date(u.ultimo_acesso) > dataOnline).length

  const statsCards = [
    {
      titulo: 'Total de Usuários',
      valor: totalUsuarios,
      icone: Users,
      cor: 'from-blue-500 to-blue-600',
      bgColor: isDark ? 'bg-blue-900/30' : 'bg-blue-50',
      textColor: isDark ? 'text-blue-300' : 'text-blue-600',
      descricao: 'Todos os usuários cadastrados'
    },
    {
      titulo: 'Usuários Ativos',
      valor: usuariosAtivos,
      icone: CheckCircle,
      cor: 'from-green-500 to-green-600',
      bgColor: isDark ? 'bg-green-900/30' : 'bg-green-50',
      textColor: isDark ? 'text-green-300' : 'text-green-600',
      descricao: 'Usuários com status ativo'
    },
    {
      titulo: 'Online Agora',
      valor: usuariosOnline,
      icone: Activity,
      cor: 'from-emerald-500 to-emerald-600',
      bgColor: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
      textColor: isDark ? 'text-emerald-300' : 'text-emerald-600',
      descricao: 'Últimas 24 horas'
    },
    {
      titulo: 'Novos (30 dias)',
      valor: novosUsuarios,
      icone: UserPlus,
      cor: 'from-purple-500 to-purple-600',
      bgColor: isDark ? 'bg-purple-900/30' : 'bg-purple-50',
      textColor: isDark ? 'text-purple-300' : 'text-purple-600',
      descricao: 'Cadastrados recentemente'
    }
  ]

  const tiposUsuarios = [
    {
      tipo: 'Administradores',
      quantidade: admins,
      cor: 'from-red-500 to-red-600',
      bgColor: isDark ? 'bg-red-900/30' : 'bg-red-50',
      textColor: isDark ? 'text-red-300' : 'text-red-600',
      icone: Crown,
      porcentagem: totalUsuarios > 0 ? (admins / totalUsuarios) * 100 : 0
    },
    {
      tipo: 'Atendentes',
      quantidade: atendentes,
      cor: 'from-orange-500 to-orange-600',
      bgColor: isDark ? 'bg-orange-900/30' : 'bg-orange-50',
      textColor: isDark ? 'text-orange-300' : 'text-orange-600',
      icone: UserCheck,
      porcentagem: totalUsuarios > 0 ? (atendentes / totalUsuarios) * 100 : 0
    },
    {
      tipo: 'Assinantes',
      quantidade: assinantes,
      cor: 'from-indigo-500 to-indigo-600',
      bgColor: isDark ? 'bg-indigo-900/30' : 'bg-indigo-50',
      textColor: isDark ? 'text-indigo-300' : 'text-indigo-600',
      icone: Shield,
      porcentagem: totalUsuarios > 0 ? (assinantes / totalUsuarios) * 100 : 0
    }
  ]

  const statusDistribution = [
    { label: 'Ativos', value: usuariosAtivos, color: 'bg-green-500' },
    { label: 'Inativos', value: usuariosInativos, color: 'bg-gray-400' },
    { label: 'Suspensos', value: usuariosSuspensos, color: 'bg-red-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.titulo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-2xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 ${
              isDark 
                ? 'bg-slate-800/50 border-slate-600 hover:bg-slate-800/70' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icone className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${stat.cor} text-white text-xs font-medium`}>
                +{Math.floor(Math.random() * 15)}%
              </div>
            </div>
            
            <div className="mb-2">
              <motion.div
                className={`text-3xl font-bold ${
                  isDark ? 'text-slate-200' : 'text-gray-900'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
              >
                {stat.valor.toLocaleString()}
              </motion.div>
              <div className={`text-sm font-semibold ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>{stat.titulo}</div>
            </div>
            
            <div className={`text-xs ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}>{stat.descricao}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Tipo de Usuário */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-2xl p-6 shadow-sm border ${
            isDark 
              ? 'bg-slate-800/50 border-slate-600' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark 
                ? 'bg-gradient-to-r from-slate-600 to-slate-500' 
                : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
            }`}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${
                isDark ? 'text-slate-200' : 'text-gray-900'
              }`}>Tipos de Usuários</h3>
              <p className={`text-sm ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>Distribuição por categoria</p>
            </div>
          </div>

          <div className="space-y-4">
            {tiposUsuarios.map((tipo, index) => (
              <motion.div
                key={tipo.tipo}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                  isDark 
                    ? 'hover:bg-slate-700/30' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${tipo.bgColor} flex items-center justify-center`}>
                    <tipo.icone className={`w-4 h-4 ${tipo.textColor}`} />
                  </div>
                  <div>
                    <div className={`font-semibold ${
                      isDark ? 'text-slate-200' : 'text-gray-900'
                    }`}>{tipo.tipo}</div>
                    <div className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`}>{tipo.quantidade} usuários</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold ${
                    isDark ? 'text-slate-200' : 'text-gray-900'
                  }`}>{tipo.porcentagem.toFixed(1)}%</div>
                  <div className={`w-20 h-2 rounded-full mt-1 ${
                    isDark ? 'bg-slate-600' : 'bg-gray-200'
                  }`}>
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${tipo.cor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${tipo.porcentagem}%` }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Status dos Usuários */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-2xl p-6 shadow-sm border ${
            isDark 
              ? 'bg-slate-800/50 border-slate-600' 
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark 
                ? 'bg-gradient-to-r from-slate-600 to-slate-500' 
                : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
            }`}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${
                isDark ? 'text-slate-200' : 'text-gray-900'
              }`}>Status dos Usuários</h3>
              <p className={`text-sm ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>Distribuição por status</p>
            </div>
          </div>

          <div className="space-y-4">
            {statusDistribution.map((status, index) => (
              <motion.div
                key={status.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${status.color}`} />
                  <span className={`font-medium ${
                    isDark ? 'text-slate-200' : 'text-gray-900'
                  }`}>{status.label}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>{status.value}</span>
                  <div className={`w-24 h-2 rounded-full ${
                    isDark ? 'bg-slate-600' : 'bg-gray-200'
                  }`}>
                    <motion.div
                      className={`h-full rounded-full ${status.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: totalUsuarios > 0 ? `${(status.value / totalUsuarios) * 100}%` : '0%' }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Resumo */}
          <div className={`mt-6 pt-4 border-t ${
            isDark ? 'border-slate-600' : 'border-gray-100'
          }`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  isDark ? 'text-green-300' : 'text-green-600'
                }`}>{((usuariosAtivos / totalUsuarios) * 100).toFixed(1)}%</div>
                <div className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>Taxa de Atividade</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  isDark ? 'text-blue-300' : 'text-blue-600'
                }`}>{usuariosOnline}</div>
                <div className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>Online Agora</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
