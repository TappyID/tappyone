'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { TrendingUp, Users, MessageCircle, Award, Target, Rocket } from 'lucide-react'

export default function AboutSection() {
  const { actualTheme } = useTheme()

  const stats = [
    {
      icon: Users,
      number: '10,000+',
      label: 'Empresas Ativas',
      description: 'Confiam em nossa plataforma',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: MessageCircle,
      number: '2.5M+',
      label: 'Mensagens Processadas',
      description: 'Por mês em nossa rede',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: TrendingUp,
      number: '340%',
      label: 'Aumento em Vendas',
      description: 'Média dos nossos clientes',
      color: 'from-purple-500 to-violet-600'
    },
    {
      icon: Award,
      number: '99.9%',
      label: 'Uptime Garantido',
      description: 'Disponibilidade da plataforma',
      color: 'from-orange-500 to-red-600'
    }
  ]

  const features = [
    {
      icon: Target,
      title: 'Foco no Resultado',
      description: 'Nossa missão é aumentar suas vendas e melhorar o relacionamento com clientes através de tecnologia avançada.'
    },
    {
      icon: Rocket,
      title: 'Inovação Constante',
      description: 'Sempre atualizando nossa plataforma com as últimas tecnologias de IA e automação do mercado.'
    }
  ]

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${
            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Números que{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Impressionam
            </span>
          </h2>

          <p className={`text-xl max-w-3xl mx-auto ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Resultados reais de empresas que transformaram seu atendimento e vendas com nossa plataforma de IA.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
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
                {/* Animated Background */}
                <motion.div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Icon */}
                <motion.div
                  className={`inline-flex p-4 rounded-2xl mb-6 bg-gradient-to-br ${stat.color} shadow-lg`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Number with Counter Animation */}
                <motion.div
                  className={`text-4xl sm:text-5xl font-bold mb-2 ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1 + 0.3,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {stat.number}
                </motion.div>

                <h3 className={`text-lg font-semibold mb-2 ${
                  actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`}>
                  {stat.label}
                </h3>

                <p className={`text-sm ${
                  actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.description}
                </p>

                {/* Floating Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-1 h-1 rounded-full ${
                        actualTheme === 'dark' ? 'bg-purple-400/30' : 'bg-purple-500/40'
                      }`}
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${20 + i * 20}%`,
                      }}
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className={`text-3xl sm:text-4xl font-bold mb-8 ${
              actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Por que escolher{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                nossa plataforma?
              </span>
            </h3>

            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <motion.div
                    className="flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h4 className={`text-xl font-semibold mb-2 ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h4>
                    <p className={`text-base leading-relaxed ${
                      actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className={`relative p-12 rounded-3xl ${
              actualTheme === 'dark'
                ? 'bg-gradient-to-br from-slate-800/40 via-purple-900/30 to-slate-800/40 border border-purple-500/20'
                : 'bg-gradient-to-br from-white/70 via-purple-50/50 to-white/70 border border-purple-200/30'
            } backdrop-blur-xl shadow-2xl`}>
              
              {/* Animated Chart Visualization */}
              <div className="space-y-6">
                <div className={`text-center text-lg font-semibold ${
                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Crescimento de Vendas
                </div>
                
                {/* Animated Bars */}
                <div className="space-y-4">
                  {[
                    { label: 'Q1', value: 30, color: 'from-blue-500 to-cyan-600' },
                    { label: 'Q2', value: 60, color: 'from-green-500 to-emerald-600' },
                    { label: 'Q3', value: 85, color: 'from-purple-500 to-violet-600' },
                    { label: 'Q4', value: 100, color: 'from-orange-500 to-red-600' }
                  ].map((bar, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className={`text-sm font-medium w-8 ${
                        actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {bar.label}
                      </span>
                      <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${bar.color} rounded-full`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${bar.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: index * 0.2 }}
                        />
                      </div>
                      <span className={`text-sm font-medium w-12 text-right ${
                        actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {bar.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full"
                animate={{
                  y: [0, 10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
