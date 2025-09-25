'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, TrendingUp, TrendingDown, Activity,
  Clock, Calendar, Users, DollarSign, Target,
  Award, Zap, AlertTriangle
} from 'lucide-react'

interface AnalyticsTabProps {
  coluna: {
    id: string
    nome: string
    cor: string
  }
  theme: string
}

export default function AnalyticsTab({ coluna, theme }: AnalyticsTabProps) {
  // Dados mockados para demonstração
  const metricas = {
    tempoMedio: '3.5 dias',
    taxaConversao: 68,
    cardsAtivos: 12,
    metaCumprimento: 85,
    velocidade: '+15%',
    eficiencia: 92
  }

  const historicoSemanal = [
    { dia: 'Seg', entradas: 5, saidas: 3 },
    { dia: 'Ter', entradas: 8, saidas: 6 },
    { dia: 'Qua', entradas: 6, saidas: 7 },
    { dia: 'Qui', entradas: 10, saidas: 8 },
    { dia: 'Sex', entradas: 7, saidas: 9 },
    { dia: 'Sáb', entradas: 3, saidas: 2 },
    { dia: 'Dom', entradas: 2, saidas: 1 }
  ]

  const topPerformers = [
    { nome: 'João Silva', cards: 45, eficiencia: 96 },
    { nome: 'Maria Santos', cards: 38, eficiencia: 92 },
    { nome: 'Pedro Lima', cards: 34, eficiencia: 88 }
  ]

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl backdrop-blur-xl border ${
          theme === 'dark' 
            ? 'bg-slate-900/50 border-slate-700/30' 
            : 'bg-white/80 border-gray-200/30'
        }`}
        style={{
          background: `linear-gradient(135deg, ${coluna.cor}05 0%, transparent 100%)`,
        }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div 
            className="p-3 rounded-xl"
            style={{ 
              backgroundColor: `${coluna.cor}20`,
              color: coluna.cor 
            }}
          >
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Analytics e Insights
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Análise detalhada do desempenho da coluna
            </p>
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Tempo Médio */}
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-green-500 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                -12%
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {metricas.tempoMedio}
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Tempo médio na coluna
            </p>
          </div>

          {/* Taxa de Conversão */}
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Target className="w-4 h-4" style={{ color: coluna.cor }} />
              <span className="text-xs text-green-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8%
              </span>
            </div>
            <p className={`text-2xl font-bold`} style={{ color: coluna.cor }}>
              {metricas.taxaConversao}%
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Taxa de conversão
            </p>
          </div>

          {/* Cards Ativos */}
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-4 h-4 text-purple-500" />
              <span className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Agora
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {metricas.cardsAtivos}
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Cards ativos
            </p>
          </div>

          {/* Meta Cumprimento */}
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-3 h-3 text-yellow-500" />
              </motion.div>
            </div>
            <p className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {metricas.metaCumprimento}%
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Metas cumpridas
            </p>
          </div>

          {/* Velocidade */}
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500">
                {metricas.velocidade}
              </span>
            </div>
            <p className={`text-lg font-bold text-green-500`}>
              Rápido
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Velocidade
            </p>
          </div>

          {/* Eficiência */}
          <div className={`p-4 rounded-xl ${
            theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <div
                    key={i}
                    className={`w-1 h-3 rounded-full ${
                      i <= Math.floor(metricas.eficiencia / 20)
                        ? 'bg-emerald-500'
                        : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className={`text-2xl font-bold text-emerald-500`}>
              {metricas.eficiencia}%
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Eficiência
            </p>
          </div>
        </div>
      </motion.div>

      {/* Gráfico Semanal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-6 rounded-2xl backdrop-blur-xl border ${
          theme === 'dark' 
            ? 'bg-slate-900/50 border-slate-700/30' 
            : 'bg-white/80 border-gray-200/30'
        }`}
      >
        <h4 className={`text-lg font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          📊 Fluxo Semanal
        </h4>
        
        <div className="space-y-3">
          {historicoSemanal.map((dia, index) => {
            const maxValue = Math.max(...historicoSemanal.flatMap(d => [d.entradas, d.saidas]))
            const entradaWidth = (dia.entradas / maxValue) * 100
            const saidaWidth = (dia.saidas / maxValue) * 100
            
            return (
              <motion.div
                key={dia.dia}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <span className={`text-xs font-medium w-8 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {dia.dia}
                </span>
                
                <div className="flex-1 space-y-1">
                  {/* Entradas */}
                  <div className="flex items-center gap-2">
                    <div className={`h-3 rounded-full ${
                      theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'
                    } flex-1 overflow-hidden`}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: coluna.cor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${entradaWidth}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      />
                    </div>
                    <span className="text-xs text-green-500 w-6">
                      +{dia.entradas}
                    </span>
                  </div>
                  
                  {/* Saídas */}
                  <div className="flex items-center gap-2">
                    <div className={`h-3 rounded-full ${
                      theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'
                    } flex-1 overflow-hidden`}>
                      <motion.div
                        className="h-full rounded-full bg-red-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${saidaWidth}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 + 0.1 }}
                      />
                    </div>
                    <span className="text-xs text-red-500 w-6">
                      -{dia.saidas}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`p-6 rounded-2xl backdrop-blur-xl border ${
          theme === 'dark' 
            ? 'bg-slate-900/50 border-slate-700/30' 
            : 'bg-white/80 border-gray-200/30'
        }`}
      >
        <h4 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Performers
        </h4>
        
        <div className="space-y-3">
          {topPerformers.map((performer, index) => (
            <div
              key={performer.nome}
              className={`flex items-center justify-between p-3 rounded-lg ${
                theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white`}
                  style={{ backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }}
                >
                  {index + 1}
                </div>
                <div>
                  <p className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {performer.nome}
                  </p>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {performer.cards} cards processados
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold`} style={{ color: coluna.cor }}>
                  {performer.eficiencia}%
                </p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Eficiência
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Alert Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className={`p-4 rounded-xl flex items-center gap-3 ${
          theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'
        }`}
      >
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <p className={`text-sm ${
          theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
        }`}>
          ⚠️ 3 cards estão parados há mais de 5 dias nesta coluna
        </p>
      </motion.div>
    </div>
  )
}

// Exportar ícone Trophy para uso no componente
const Trophy = Award
