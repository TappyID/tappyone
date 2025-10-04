'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Settings, Target, Zap, Bell, BarChart3,
  TrendingUp, Sparkles, Brain, Rocket, ChevronLeft
} from 'lucide-react'
import MetasTab from './tabs/MetasTab'
import AutomacoesTab from './tabs/AutomacoesTab'
import NotificacoesTab from './tabs/NotificacoesTab'
import AnalyticsTab from './tabs/AnalyticsTab'

interface ColumnConfigModalProps {
  isOpen: boolean
  onClose: () => void
  coluna: {
    id: string
    nome: string
    cor: string
  }
  theme: string
}

type TabType = 'metas' | 'automacoes' | 'notificacoes' | 'analytics'

export default function ColumnConfigModal({
  isOpen,
  onClose,
  coluna,
  theme
}: ColumnConfigModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('metas')

  const tabs = [
    {
      id: 'metas' as TabType,
      label: 'Metas',
      icon: Target,
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'automacoes' as TabType,
      label: 'Automações',
      icon: Zap,
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      id: 'notificacoes' as TabType,
      label: 'Notificações',
      icon: Bell,
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      id: 'analytics' as TabType,
      label: 'Analytics',
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-600'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop transparente */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/40"
          />

          {/* Sidebar Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed right-0 top-0 z-[101] h-full w-[600px] border-l shadow-2xl overflow-hidden ${
              theme === 'dark' 
                ? 'bg-slate-950 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}
            style={{
              boxShadow: `
                -10px 0 40px ${coluna.cor}20,
                0 0 100px ${coluna.cor}10
              `
            }}
          >
              {/* Gradient Orbs Animation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute -top-20 -left-20 w-96 h-96 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${coluna.cor}20 0%, transparent 70%)`
                  }}
                  animate={{
                    x: [0, 30, 0],
                    y: [0, -30, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.div
                  className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${coluna.cor}15 0%, transparent 70%)`
                  }}
                  animate={{
                    x: [0, -30, 0],
                    y: [0, 30, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>

              {/* Header Épico */}
              <div className="relative z-10">
                <div 
                  className={`p-6 border-b backdrop-blur-xl ${
                    theme === 'dark' ? 'border-slate-700/30' : 'border-gray-200/30'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${coluna.cor}10 0%, transparent 100%)`
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {/* Ícone Animado */}
                      <motion.div 
                        className="relative p-4 rounded-2xl backdrop-blur-xl"
                        style={{
                          background: `linear-gradient(135deg, ${coluna.cor}30, ${coluna.cor}10)`,
                          boxShadow: `0 10px 30px ${coluna.cor}30`
                        }}
                        animate={{
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Brain className="w-7 h-7" style={{ color: coluna.cor }} />
                        <motion.div
                          className="absolute -top-1 -right-1"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Sparkles className="w-4 h-4" style={{ color: coluna.cor }} />
                        </motion.div>
                      </motion.div>

                      <div>
                        <h2 className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r`}
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${coluna.cor}, ${coluna.cor}CC)`
                          }}
                        >
                          Configurações Inteligentes
                        </h2>
                        <p className={`text-sm mt-1 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {coluna.nome} • Configure regras avançadas e automações
                        </p>
                      </div>
                    </div>

                    {/* Botão de Fechar */}
                    <motion.button
                      onClick={onClose}
                      className={`p-3 rounded-xl transition-all ${
                        theme === 'dark'
                          ? 'hover:bg-slate-800 text-gray-400 hover:text-white'
                          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                      }`}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Tabs Navegação */}
                  <div className="flex gap-2">
                    {tabs.map((tab, index) => {
                      const Icon = tab.icon
                      const isActive = activeTab === tab.id
                      
                      return (
                        <motion.button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`relative flex items-center gap-2 px-5 py-3 rounded-xl transition-all ${
                            isActive
                              ? 'text-white shadow-xl'
                              : theme === 'dark'
                                ? 'text-gray-400 hover:text-gray-200'
                                : 'text-gray-600 hover:text-gray-900'
                          }`}
                          style={{
                            background: isActive 
                              ? `linear-gradient(135deg, ${coluna.cor}, ${coluna.cor}DD)`
                              : theme === 'dark' 
                                ? 'rgba(30, 41, 59, 0.5)'
                                : 'rgba(243, 244, 246, 0.5)',
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="font-medium">{tab.label}</span>
                          
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 rounded-xl"
                              style={{
                                background: `linear-gradient(135deg, ${coluna.cor}30, transparent)`,
                                zIndex: -1
                              }}
                            />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Content Area */}
                <div className="h-[calc(100%-180px)] overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="p-6"
                    >
                      {activeTab === 'metas' && <MetasTab coluna={coluna} theme={theme} />}
                      {activeTab === 'automacoes' && <AutomacoesTab coluna={coluna} theme={theme} />}
                      {activeTab === 'notificacoes' && <NotificacoesTab coluna={coluna} theme={theme} />}
                      {activeTab === 'analytics' && <AnalyticsTab coluna={coluna} theme={theme} />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
