'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { ArrowRight, Sparkles, Zap, MessageSquare, Bot } from 'lucide-react'

export default function HeroSection() {
  const { actualTheme } = useTheme()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const floatingIconVariants = {
    animate: {
      y: [0, -10, 0],
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1],
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Glassmorphism Container */}
      <motion.div
        className={`relative max-w-7xl mx-auto text-center ${
          actualTheme === 'dark'
            ? 'bg-gradient-to-br from-slate-800/20 via-purple-900/30 to-slate-800/20'
            : 'bg-gradient-to-br from-white/60 via-purple-50/80 to-blue-50/60'
        } backdrop-blur-xl rounded-3xl border ${
          actualTheme === 'dark'
            ? 'border-purple-500/20 shadow-2xl shadow-purple-500/10'
            : 'border-purple-200/30 shadow-2xl shadow-purple-200/20'
        } p-8 sm:p-12 lg:p-16`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-10 left-10"
            variants={floatingIconVariants}
            animate="animate"
            transition={{ duration: 3, repeat: Infinity, delay: 0 }}
          >
            <div className={`p-3 rounded-2xl ${
              actualTheme === 'dark'
                ? 'bg-gradient-to-br from-purple-500/20 to-violet-600/20'
                : 'bg-gradient-to-br from-purple-100/80 to-violet-200/80'
            } backdrop-blur-sm border ${
              actualTheme === 'dark' ? 'border-purple-400/20' : 'border-purple-300/30'
            }`}>
              <Bot className={`w-6 h-6 ${
                actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
              }`} />
            </div>
          </motion.div>

          <motion.div
            className="absolute top-20 right-16"
            variants={floatingIconVariants}
            animate="animate"
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          >
            <div className={`p-3 rounded-2xl ${
              actualTheme === 'dark'
                ? 'bg-gradient-to-br from-indigo-500/20 to-blue-600/20'
                : 'bg-gradient-to-br from-blue-100/80 to-indigo-200/80'
            } backdrop-blur-sm border ${
              actualTheme === 'dark' ? 'border-blue-400/20' : 'border-blue-300/30'
            }`}>
              <MessageSquare className={`w-6 h-6 ${
                actualTheme === 'dark' ? 'text-blue-300' : 'text-blue-600'
              }`} />
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-16 left-20"
            variants={floatingIconVariants}
            animate="animate"
            transition={{ duration: 5, repeat: Infinity, delay: 2 }}
          >
            <div className={`p-3 rounded-2xl ${
              actualTheme === 'dark'
                ? 'bg-gradient-to-br from-violet-500/20 to-purple-600/20'
                : 'bg-gradient-to-br from-violet-100/80 to-purple-200/80'
            } backdrop-blur-sm border ${
              actualTheme === 'dark' ? 'border-violet-400/20' : 'border-violet-300/30'
            }`}>
              <Zap className={`w-6 h-6 ${
                actualTheme === 'dark' ? 'text-violet-300' : 'text-violet-600'
              }`} />
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div variants={itemVariants} className="relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: actualTheme === 'dark'
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15))'
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))',
              border: `1px solid ${actualTheme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className={`w-4 h-4 ${
              actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
            }`} />
            <span className={`text-sm font-medium ${
              actualTheme === 'dark' ? 'text-purple-200' : 'text-purple-700'
            }`}>
              Powered by AI
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 ${
              actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
            style={{
              background: actualTheme === 'dark'
                ? 'linear-gradient(135deg, #ffffff, #e2e8f0, #cbd5e1)'
                : 'linear-gradient(135deg, #1e293b, #475569, #64748b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Revolucione seu
            <br />
            <span className="relative">
              <span
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Atendimento
              </span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              />
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className={`text-xl sm:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
              actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Transforme conversas em vendas com nossa plataforma de{' '}
            <span className={`font-semibold ${
              actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
            }`}>
              IA avançada
            </span>
            {' '}para WhatsApp Business. Automação inteligente, CRM integrado e resultados extraordinários.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className={`group relative px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                actualTheme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25'
              }`}
              whileHover={{ 
                scale: 1.05,
                boxShadow: actualTheme === 'dark' 
                  ? '0 20px 40px rgba(59, 130, 246, 0.4)' 
                  : '0 20px 40px rgba(59, 130, 246, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Contratar
                <motion.div
                  className="group-hover:translate-x-1 transition-transform duration-300"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>

            <motion.button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                actualTheme === 'dark'
                  ? 'bg-slate-800/50 text-white border border-slate-600/50 hover:bg-slate-700/50'
                  : 'bg-white/70 text-gray-900 border border-gray-200/50 hover:bg-white/90'
              } backdrop-blur-sm`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Recursos
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8"
          >
            {[
              { number: '10k+', label: 'Empresas Ativas' },
              { number: '95%', label: 'Taxa de Satisfação' },
              { number: '24/7', label: 'Suporte Disponível' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className={`text-3xl sm:text-4xl font-bold mb-2 ${
                  actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`}>
                  {stat.number}
                </div>
                <div className={`text-sm ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
