'use client'

import { motion } from 'framer-motion'
import { CreditCard, Users, DollarSign, Calendar, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'
import { AssinaturaDisplay } from '../page'

interface AssinaturasStatsProps {
  assinaturas: AssinaturaDisplay[]
}

export default function AssinaturasStats({ assinaturas }: AssinaturasStatsProps) {
  const totalAssinaturas = assinaturas.length
  const assinaturasAtivas = assinaturas.filter(a => a.status === 'ativa').length
  const assinaturasExpiradas = assinaturas.filter(a => a.status === 'expirada').length
  const receitaMensal = assinaturas
    .filter(a => a.status === 'ativa')
    .reduce((acc, assinatura) => {
      // Converter para valor mensal baseado no período
      let valorMensal = assinatura.plano.valor
      switch (assinatura.plano.periodo) {
        case 'anual':
          valorMensal = assinatura.plano.valor / 12
          break
        case 'semestral':
          valorMensal = assinatura.plano.valor / 6
          break
        case 'trimestral':
          valorMensal = assinatura.plano.valor / 3
          break
        default:
          valorMensal = assinatura.plano.valor
      }
      return acc + valorMensal
    }, 0)

  const receitaTotal = assinaturas.reduce((acc, assinatura) => acc + (assinatura.plano.valor || 0), 0)
  
  // Assinaturas que vencem nos próximos 7 dias
  const proximoVencimento = assinaturas.filter(a => {
    if (a.status !== 'ativa') return false
    const diasParaVencer = Math.ceil((a.dataVencimento.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return diasParaVencer <= 7 && diasParaVencer > 0
  }).length

  const taxaRenovacao = totalAssinaturas > 0 
    ? ((assinaturasAtivas / totalAssinaturas) * 100)
    : 0

  const stats = [
    {
      title: 'Total de Assinaturas',
      value: totalAssinaturas.toString(),
      icon: CreditCard,
      trend: '+12% este mês',
      trendUp: true,
      color: 'from-[#305e73] to-[#3a6d84]',
      bgColor: 'bg-[#305e73]/10',
      iconColor: 'text-[#305e73]'
    },
    {
      title: 'Assinaturas Ativas',
      value: assinaturasAtivas.toString(),
      icon: CheckCircle,
      trend: `${((assinaturasAtivas / totalAssinaturas) * 100).toFixed(0)}% do total`,
      trendUp: assinaturasAtivas > assinaturasExpiradas,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${receitaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: '+8.5% vs mês anterior',
      trendUp: true,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Vencem em 7 dias',
      value: proximoVencimento.toString(),
      icon: AlertCircle,
      trend: proximoVencimento > 0 ? 'Requer atenção' : 'Tudo em dia',
      trendUp: proximoVencimento === 0,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Taxa de Renovação',
      value: `${taxaRenovacao.toFixed(1)}%`,
      icon: TrendingUp,
      trend: taxaRenovacao > 80 ? 'Excelente' : 'Pode melhorar',
      trendUp: taxaRenovacao > 80,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Receita Total',
      value: `R$ ${receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: 'Acumulado',
      trendUp: true,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        const TrendIcon = stat.trendUp ? TrendingUp : TrendingDown
        
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <TrendIcon className={`w-4 h-4 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              
              <div className="space-y-2">
                <motion.h3 
                  className="text-2xl font-bold text-gray-900"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {stat.value}
                </motion.h3>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-xs ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </p>
              </div>
            </div>

            {/* Hover glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10`} />
          </motion.div>
        )
      })}
    </div>
  )
}
