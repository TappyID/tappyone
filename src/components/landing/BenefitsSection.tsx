'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock, 
  Users, 
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  Target,
  Rocket,
  Globe,
  Award
} from 'lucide-react'

const benefits = [
  {
    id: 1,
    icon: Zap,
    title: "Automação Inteligente",
    description: "Reduza 80% do trabalho com fluxos automatizados com seus dados",
    stats: "80% menos trabalho",
    gradient: "from-yellow-400 to-orange-500",
    bgGradient: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
    features: ["Fluxos inteligentes", "Aprendizado automático", "Triggers personalizados"]
  },
  {
    id: 2,
    icon: TrendingUp,
    title: "Aumento de Vendas",
    description: "Empresas aumentam em média 150% suas vendas nos primeiros 3 meses de uso",
    stats: "+150% vendas",
    gradient: "from-green-400 to-emerald-500",
    bgGradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    features: ["Pipeline otimizado", "Lead scoring", "Conversão inteligente"]
  },
  {
    id: 3,
    icon: Clock,
    title: "Economia de Tempo",
    description: "Economize até 6 horas por dia com automações e respostas inteligentes",
    stats: "6h por dia",
    gradient: "from-blue-400 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
    features: ["Respostas automáticas", "Agendamento inteligente", "Priorização AI"]
  },
  {
    id: 4,
    icon: Users,
    title: "Satisfação do Cliente",
    description: "98% de satisfação dos clientes com atendimento 24/7 personalizado",
    stats: "98% satisfação",
    gradient: "from-purple-400 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
    features: ["Atendimento 24/7", "Personalização AI", "Feedback contínuo"]
  },
  {
    id: 5,
    icon: Shield,
    title: "Segurança Total",
    description: "Criptografia end-to-end e compliance com LGPD, SOC2 e ISO 27001",
    stats: "100% seguro",
    gradient: "from-red-400 to-rose-500",
    bgGradient: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
    features: ["Criptografia E2E", "Compliance LGPD", "Auditoria SOC2"]
  },
  {
    id: 6,
    icon: Brain,
    title: "IA Avançada",
    description: "Tecnologia de ponta com GPT-4 e machine learning para insights únicos",
    stats: "IA GPT-4",
    gradient: "from-indigo-400 to-purple-500",
    bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
    features: ["GPT-4 Integration", "ML Avançado", "Insights preditivos"]
  }
]

const FloatingElement = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.8 }}
    animate={{ 
      opacity: [0, 1, 0.8],
      y: [20, -10, 20],
      scale: [0.8, 1.1, 1],
      rotate: [0, 5, -5, 0]
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    className={`absolute ${className}`}
  >
    {children}
  </motion.div>
)

export default function BenefitsSection() {
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null)

  return (
    <section className="relative py-24 bg-gradient-to-br from-white via-gray-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-32 left-16 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-400/5 to-emerald-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating Icons */}
        <FloatingElement delay={0} className="top-20 left-20">
          <Target className="w-8 h-8 text-blue-400/40" />
        </FloatingElement>
        <FloatingElement delay={1} className="top-32 right-24">
          <Rocket className="w-6 h-6 text-purple-400/40" />
        </FloatingElement>
        <FloatingElement delay={2} className="bottom-32 left-32">
          <Globe className="w-7 h-7 text-green-400/40" />
        </FloatingElement>
        <FloatingElement delay={1.5} className="bottom-20 right-20">
          <Award className="w-8 h-8 text-orange-400/40" />
        </FloatingElement>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700 mb-6">
            <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 tracking-wide">
              Resultados Comprovados
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Por que escolher
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TappyOne?
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Mais de 10.000 empresas já transformaram seus resultados. 
            Descubra os benefícios que fazem a diferença.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredBenefit(benefit.id)}
              onHoverEnd={() => setHoveredBenefit(null)}
              className="group relative"
            >
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative p-8 rounded-2xl bg-gradient-to-br ${benefit.bgGradient} border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm overflow-hidden`}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className="relative mb-6">
                  <motion.div
                    animate={hoveredBenefit === benefit.id ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${benefit.gradient} shadow-lg`}
                  >
                    <benefit.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  {/* Stats Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="absolute -top-2 -right-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <span className={`text-xs font-bold bg-gradient-to-r ${benefit.gradient} bg-clip-text text-transparent`}>
                      {benefit.stats}
                    </span>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {benefit.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + featureIndex * 0.1 + 0.5 }}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle className={`w-4 h-4 text-green-500`} />
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Hover Arrow */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: hoveredBenefit === benefit.id ? 1 : 0,
                    x: hoveredBenefit === benefit.id ? 0 : -10
                  }}
                  className="absolute bottom-6 right-6"
                >
                  <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:text-current`} />
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center space-x-8 p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 shadow-2xl">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white mb-2">
                Pronto para transformar seus resultados?
              </h3>
              <p className="text-blue-100 font-light">
                Junte-se a mais de 10.000 empresas que já escolheram a excelência
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
