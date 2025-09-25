'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ResponsiveFunnel } from '@nivo/funnel'
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Target,
  ArrowRight,
  Activity
} from 'lucide-react'

interface FunnelViewProps {
  theme: string
  colunas: any[]
  chats: any[]
}

export default function FunnelView({ theme, colunas, chats }: FunnelViewProps) {
  // Calcular dados do funil baseado nas colunas
  const calculateFunnelData = () => {
    return colunas.map(coluna => ({
      id: coluna.id,
      label: coluna.nome,
      value: coluna.cards?.length || 0,
      color: coluna.cor
    }))
  }

  const funnelData = calculateFunnelData()

  // Calcular taxas de conversão entre etapas
  const conversionRates = funnelData.map((item, index) => {
    if (index === 0) return 100
    const previousValue = funnelData[index - 1].value
    return previousValue > 0 ? ((item.value / previousValue) * 100).toFixed(1) : 0
  })

  // KPIs do funil
  const totalLeads = funnelData[0]?.value || 0
  const totalConversions = funnelData[funnelData.length - 1]?.value || 0
  const overallConversion = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-6 ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
      }`}
    >
      {/* Header com KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm opacity-70">Total Entrada</span>
          </div>
          <div className="text-3xl font-bold">{totalLeads}</div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-sm opacity-70">Conversões</span>
          </div>
          <div className="text-3xl font-bold">{totalConversions}</div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm opacity-70">Taxa Conversão</span>
          </div>
          <div className="text-3xl font-bold">{overallConversion}%</div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Activity className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-sm opacity-70">Etapas Ativas</span>
          </div>
          <div className="text-3xl font-bold">{colunas.length}</div>
        </motion.div>
      </div>

      {/* Funil Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Funil */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <h3 className="text-lg font-semibold mb-4">Funil de Conversão</h3>
          <div className="h-[400px]">
            <ResponsiveFunnel
              data={funnelData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              shapeBlending={0.66}
              valueFormat=">-.0f"
              colors={(d) => d.color}
              beforeSeparatorLength={100}
              afterSeparatorLength={100}
              currentPartSizeExtension={10}
              currentBorderWidth={40}
              theme={{
                text: {
                  fill: theme === 'dark' ? '#fff' : '#000'
                }
              }}
              labelColor={{
                from: 'color',
                modifiers: [['darker', 3]]
              }}
              motionConfig="gentle"
            />
          </div>
        </motion.div>

        {/* Detalhamento por Etapa */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`p-6 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <h3 className="text-lg font-semibold mb-4">Detalhamento por Etapa</h3>
          <div className="space-y-4">
            {funnelData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`p-4 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-slate-900/50 border-slate-700'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-2xl font-bold">{item.value}</span>
                </div>
                
                {/* Barra de progresso */}
                <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${conversionRates[index]}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    className="absolute inset-y-0 left-0 flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}40` }}
                  >
                    <span className="text-sm font-medium" style={{ color: item.color }}>
                      {conversionRates[index]}%
                    </span>
                  </motion.div>
                </div>

                {/* Indicador de conversão */}
                {index < funnelData.length - 1 && (
                  <div className="flex items-center gap-2 mt-2 text-sm opacity-70">
                    <ArrowRight className="w-4 h-4" />
                    <span>
                      {((item.value / (funnelData[index + 1]?.value || 1)) * 100).toFixed(1)}% 
                      para próxima etapa
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Top Conversores */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className={`mt-8 p-6 rounded-xl border ${
          theme === 'dark'
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-white border-gray-200'
        }`}
      >
        <h3 className="text-lg font-semibold mb-4">Principais Oportunidades</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {chats.slice(0, 6).map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + index * 0.05 }}
              className={`p-4 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-slate-900/50 border-slate-700'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {chat.nome?.charAt(0) || 'C'}
                </div>
                <div className="flex-1">
                  <div className="font-medium truncate">{chat.nome || 'Contato'}</div>
                  <div className="text-sm opacity-70">{chat.numeroTelefone}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 opacity-50" />
                <span className="text-sm opacity-70">
                  {chat.mensagens?.length || 0} mensagens
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
