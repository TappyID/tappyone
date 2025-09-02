'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  Zap, 
  Crown, 
  Rocket, 
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 97,
    originalPrice: 197,
    period: '/mês',
    description: 'Perfeito para começar',
    icon: Zap,
    popular: false,
    features: [
      '1 Número WhatsApp',
      'Até 1.000 contatos',
      'Chatbot básico',
      'Kanban simples',
      'Suporte por email'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 197,
    originalPrice: 397,
    period: '/mês',
    description: 'Ideal para crescimento',
    icon: Crown,
    popular: true,
    features: [
      '3 Números WhatsApp',
      'Até 10.000 contatos',
      'IA Avançada GPT-4',
      'Multi-agentes IA',
      'Suporte prioritário'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 497,
    originalPrice: 997,
    period: '/mês',
    description: 'Solução completa',
    icon: Rocket,
    popular: false,
    features: [
      'Números ilimitados',
      'Contatos ilimitados',
      'IA Personalizada',
      'API Completa',
      'Suporte 24/7'
    ]
  }
]

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section className="py-32 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800 mb-8">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Planos Simples
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Escolha seu
            <span className="text-blue-600"> plano</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
            Transparente, simples e sem surpresas. Comece grátis hoje.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                !isAnnual 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
                isAnnual 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Anual
              {isAnnual && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  -20%
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg">
                    Mais Popular
                  </div>
                </div>
              )}

              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`relative p-8 rounded-3xl border transition-all duration-300 ${
                  plan.popular 
                    ? 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10 shadow-xl shadow-blue-100/50 dark:shadow-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Icon */}
                <div className="mb-8">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${
                    plan.popular ? 'bg-blue-600' : 'bg-gray-900 dark:bg-white'
                  }`}>
                    {React.createElement(plan.icon, { 
                      className: `w-7 h-7 ${plan.popular ? 'text-white' : 'text-white dark:text-gray-900'}` 
                    })}
                  </div>
                </div>

                {/* Header */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      R${isAnnual ? Math.round(plan.price * 0.8) : plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {plan.period}
                    </span>
                  </div>
                  
                  {isAnnual && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-2">
                      Economize R${Math.round((plan.price - plan.price * 0.8) * 12)} por ano
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Check className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className={`w-full py-4 font-semibold text-lg transition-all duration-300 group rounded-2xl ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                    }`}
                  >
                    Começar Agora
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>

                {/* Guarantee */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Garantia de 30 dias
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">14 dias grátis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Teste sem compromisso</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Suporte especializado</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time dedicado para você</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Atualizações gratuitas</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sempre a versão mais nova</p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Todos os planos incluem SSL gratuito, backups automáticos e nossa garantia de 99.9% de uptime.
          </p>
        </motion.div>
      </div>
    </section>
  )
}