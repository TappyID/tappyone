'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { Bot, MessageSquare, BarChart3, Zap, Shield, Smartphone, Brain, Users, Clock } from 'lucide-react'

export default function FeaturesSection() {
  const { actualTheme } = useTheme()

  const features = [
    {
      icon: Bot,
      title: 'IA Conversacional Avançada',
      description: 'Chatbots inteligentes que compreendem contexto e respondem naturalmente',
      color: 'from-purple-500 to-violet-600',
      delay: 0
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Business API',
      description: 'Integração completa com WhatsApp para atendimento profissional',
      color: 'from-green-500 to-emerald-600',
      delay: 0.1
    },
    {
      icon: BarChart3,
      title: 'Analytics Inteligente',
      description: 'Relatórios detalhados e insights para otimizar suas vendas',
      color: 'from-blue-500 to-cyan-600',
      delay: 0.2
    },
    {
      icon: Zap,
      title: 'Automação Completa',
      description: 'Fluxos automatizados que convertem leads em clientes',
      color: 'from-yellow-500 to-orange-600',
      delay: 0.3
    },
    {
      icon: Shield,
      title: 'Segurança Empresarial',
      description: 'Proteção de dados com criptografia de ponta a ponta',
      color: 'from-red-500 to-pink-600',
      delay: 0.4
    },
    {
      icon: Smartphone,
      title: 'Multi-plataforma',
      description: 'Funciona perfeitamente em desktop, tablet e mobile',
      color: 'from-indigo-500 to-purple-600',
      delay: 0.5
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: actualTheme === 'dark'
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(168, 85, 247, 0.15))'
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(168, 85, 247, 0.1))',
              border: `1px solid ${actualTheme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Brain className={`w-4 h-4 ${
              actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
            }`} />
            <span className={`text-sm font-medium ${
              actualTheme === 'dark' ? 'text-purple-200' : 'text-purple-700'
            }`}>
              Recursos Avançados
            </span>
          </motion.div>

          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${
            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Tecnologia que{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Transforma
            </span>
          </h2>

          <p className={`text-xl max-w-3xl mx-auto ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Descubra como nossa plataforma revoluciona o atendimento ao cliente com recursos inovadores e inteligência artificial de última geração.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`relative p-8 rounded-3xl border transition-all duration-500 ${
                  actualTheme === 'dark'
                    ? 'bg-gradient-to-br from-slate-800/40 via-purple-900/20 to-slate-800/40 border-purple-500/20 hover:border-purple-400/40'
                    : 'bg-gradient-to-br from-white/70 via-purple-50/50 to-white/70 border-purple-200/30 hover:border-purple-300/50'
                } backdrop-blur-xl group-hover:shadow-2xl ${
                  actualTheme === 'dark' 
                    ? 'group-hover:shadow-purple-500/20' 
                    : 'group-hover:shadow-purple-200/30'
                }`}
              >
                {/* Icon */}
                <motion.div
                  className={`inline-flex p-4 rounded-2xl mb-6 bg-gradient-to-br ${feature.color} shadow-lg`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className={`text-xl font-bold mb-4 ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>

                <p className={`text-base leading-relaxed ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <motion.div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Animated Border */}
                <motion.div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20`}
                  style={{
                    background: `linear-gradient(135deg, transparent, transparent)`,
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl ${
            actualTheme === 'dark'
              ? 'bg-gradient-to-r from-slate-800/50 to-purple-900/50 border border-purple-500/20'
              : 'bg-gradient-to-r from-white/70 to-purple-50/70 border border-purple-200/30'
          } backdrop-blur-xl`}>
            <Users className={`w-6 h-6 ${
              actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
            }`} />
            <span className={`text-lg font-semibold ${
              actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Junte-se a mais de 10.000 empresas
            </span>
            <Clock className={`w-6 h-6 ${
              actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
            }`} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
