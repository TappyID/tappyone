'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { Check, Star, Zap, Crown, Rocket } from 'lucide-react'

export default function PricingSection() {
  const { actualTheme } = useTheme()

  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      price: 'R$ 97',
      period: '/mês',
      description: 'Perfeito para pequenas empresas começando',
      features: [
        'Até 1.000 mensagens/mês',
        'Chatbot básico com IA',
        'Integração WhatsApp',
        'Relatórios básicos',
        'Suporte por email',
        '1 usuário'
      ],
      popular: false,
      color: 'from-blue-500 to-cyan-600',
      buttonStyle: 'outline'
    },
    {
      name: 'Professional',
      icon: Star,
      price: 'R$ 197',
      period: '/mês',
      description: 'Ideal para empresas em crescimento',
      features: [
        'Até 10.000 mensagens/mês',
        'IA avançada + automação',
        'CRM integrado',
        'Analytics completo',
        'Suporte prioritário',
        'Até 5 usuários',
        'Integrações avançadas',
        'Templates personalizados'
      ],
      popular: true,
      color: 'from-purple-500 to-violet-600',
      buttonStyle: 'filled'
    },
    {
      name: 'Enterprise',
      icon: Crown,
      price: 'R$ 397',
      period: '/mês',
      description: 'Para grandes empresas e alta demanda',
      features: [
        'Mensagens ilimitadas',
        'IA personalizada',
        'Multi-canais',
        'Dashboard executivo',
        'Suporte 24/7',
        'Usuários ilimitados',
        'API completa',
        'Consultoria dedicada',
        'SLA garantido'
      ],
      popular: false,
      color: 'from-orange-500 to-red-600',
      buttonStyle: 'outline'
    }
  ]

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
            <Rocket className={`w-4 h-4 ${
              actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
            }`} />
            <span className={`text-sm font-medium ${
              actualTheme === 'dark' ? 'text-purple-200' : 'text-purple-700'
            }`}>
              Planos e Preços
            </span>
          </motion.div>

          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${
            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Escolha seu{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Plano Ideal
            </span>
          </h2>

          <p className={`text-xl max-w-3xl mx-auto ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Planos flexíveis que crescem com seu negócio. Comece grátis e escale conforme sua necessidade.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative ${plan.popular ? 'lg:scale-110 lg:-mt-8' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -10 }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <div className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${plan.color} shadow-lg`}>
                    Mais Popular
                  </div>
                </motion.div>
              )}

              <div
                className={`relative p-8 rounded-3xl border transition-all duration-500 ${
                  actualTheme === 'dark'
                    ? 'bg-gradient-to-br from-slate-800/40 via-purple-900/20 to-slate-800/40 border-purple-500/20 hover:border-purple-400/40'
                    : 'bg-gradient-to-br from-white/70 via-purple-50/50 to-white/70 border-purple-200/30 hover:border-purple-300/50'
                } backdrop-blur-xl hover:shadow-2xl ${
                  actualTheme === 'dark' 
                    ? 'hover:shadow-purple-500/20' 
                    : 'hover:shadow-purple-200/30'
                } ${plan.popular ? 'ring-2 ring-purple-500/50' : ''}`}
              >
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <motion.div
                    className={`inline-flex p-4 rounded-2xl mb-4 bg-gradient-to-br ${plan.color} shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <plan.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  <h3 className={`text-2xl font-bold mb-2 ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.name}
                  </h3>

                  <p className={`text-sm mb-6 ${
                    actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className={`text-5xl font-bold ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {plan.price}
                    </span>
                    <span className={`text-lg ${
                      actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className={`text-sm ${
                        actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 ${
                    plan.buttonStyle === 'filled'
                      ? `bg-gradient-to-r ${plan.color} text-white shadow-lg hover:shadow-xl`
                      : `border-2 border-purple-500/50 ${
                          actualTheme === 'dark' 
                            ? 'text-purple-300 hover:bg-purple-500/10' 
                            : 'text-purple-600 hover:bg-purple-50'
                        }`
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {plan.popular ? 'Começar Agora' : 'Escolher Plano'}
                </motion.button>

                {/* Animated Background */}
                <motion.div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${plan.color} opacity-0 hover:opacity-5 transition-opacity duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className={`text-lg mb-6 ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Todos os planos incluem teste grátis de 14 dias. Sem compromisso, cancele quando quiser.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              className={`px-8 py-3 rounded-2xl font-medium transition-all duration-300 ${
                actualTheme === 'dark'
                  ? 'bg-slate-800/50 text-white border border-slate-600/50 hover:bg-slate-700/50'
                  : 'bg-white/70 text-gray-900 border border-gray-200/50 hover:bg-white/90'
              } backdrop-blur-sm`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Comparar Planos
            </motion.button>
            
            <motion.button
              className={`px-8 py-3 rounded-2xl font-medium transition-all duration-300 ${
                actualTheme === 'dark'
                  ? 'text-purple-300 hover:text-purple-200'
                  : 'text-purple-600 hover:text-purple-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Falar com Vendas
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
