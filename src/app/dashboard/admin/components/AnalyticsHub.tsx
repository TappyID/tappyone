'use client'
import { useState } from 'react'
import { Activity, TrendingUp, Filter, Zap, Target, Users, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import FunnelAnalytics from './analytics/FunnelAnalytics'
import NCSAnalytics from './analytics/NCSAnalytics'
import OverviewAnalytics from './analytics/OverviewAnalytics'
import { useColorTheme } from '@/contexts/ColorThemeContext'

const tabs = [
  {
    id: 'funnel',
    icon: Target,
    description: 'Análise de conversão',
    gradient: 'from-blue-600 to-purple-600'
  },
  {
    id: 'ncs',
    label: 'NCS',
    icon: Users,
    description: 'Qualidade dos atendimentos',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'overview',
    label: 'Visão Geral',
    icon: BarChart3,
    description: 'Dashboard completo',
    gradient: 'from-orange-500 to-red-600'
  }
]

export default function AnalyticsHub() {
  const [activeTab, setActiveTab] = useState('funnel')
  const { colorTheme } = useColorTheme()

  const renderContent = () => {
    switch (activeTab) {
      case 'funnel':
        return <FunnelAnalytics />
      case 'ncs':
        return <NCSAnalytics />
      case 'overview':
        return <OverviewAnalytics />
      default:
        return <FunnelAnalytics />
    }
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-[#273155] dark:to-[#1e2442] rounded-3xl overflow-hidden">
      {/* Sidebar de Tabs */}
      <div className="w-80 bg-white/80 dark:bg-card/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-border/50 shadow-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-card-foreground">Analytics Hub</h2>
              <p className="text-sm text-gray-500 dark:text-muted-foreground">Inteligência de dados</p>
            </div>
          </div>

          <div className="space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                    isActive 
                      ? 'text-white shadow-lg' 
                      : 'bg-gray-50/50 dark:bg-secondary/50 hover:bg-gray-100/80 dark:hover:bg-secondary/80 text-gray-700 dark:text-card-foreground hover:text-gray-900 dark:hover:text-card-foreground'
                  }`}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${colorTheme.primary}, ${colorTheme.secondary})`
                  } : {}}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Background Pattern */}
                  <div className={`absolute inset-0 opacity-10 ${
                    isActive ? 'bg-white' : 'bg-transparent'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent" />
                  </div>
                  
                  <div className="relative flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isActive 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : 'bg-gradient-to-r from-[#305e73]/10 to-[#3a6d84]/10'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isActive ? 'text-white' : 'text-[#305e73]'
                      }`} />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${
                        isActive ? 'text-white' : 'text-gray-900 dark:text-card-foreground'
                      }`}>
                        {tab.label}
                      </div>
                      <div className={`text-sm ${
                        isActive ? 'text-white/80' : 'text-gray-500 dark:text-muted-foreground'
                      }`}>
                        {tab.description}
                      </div>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-2 h-8 bg-white/30 rounded-full"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#305e73]/5 to-[#3a6d84]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                  />
                </motion.button>
              )
            })}
          </div>

          {/* Stats Preview */}
          <div className="mt-8 p-4 bg-gradient-to-r from-[#305e73]/5 to-[#3a6d84]/5 dark:from-[#305e73]/10 dark:to-[#3a6d84]/10 rounded-2xl border border-[#305e73]/10 dark:border-border/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#305e73] dark:text-primary-foreground" />
              <span className="text-sm font-medium text-gray-700 dark:text-card-foreground">Status do Sistema</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-muted-foreground">Uptime</span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-muted-foreground">Dados atualizados</span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Tempo real</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
