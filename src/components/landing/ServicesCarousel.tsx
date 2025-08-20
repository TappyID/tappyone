'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Bot, 
  Calendar, 
  CreditCard, 
  Users, 
  BarChart3,
  Zap,
  Shield,
  Brain,
  Workflow,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const services = [
  {
    id: 1,
    icon: MessageSquare,
    title: "WhatsApp Business API",
    subtitle: "Comunicação Oficial",
    description: "Integração completa com a API oficial do WhatsApp Business. Envie e receba mensagens, mídias e documentos com total confiabilidade e segurança.",
    features: ["API Oficial", "Multi-dispositivos", "Webhooks", "Templates aprovados"],
    gradient: "from-green-400 to-emerald-600",
    bgGradient: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
    accentColor: "text-green-600 dark:text-green-400"
  },
  {
    id: 2,
    icon: Bot,
    title: "Agentes de IA Avançados",
    subtitle: "Inteligência Artificial",
    description: "Chatbots inteligentes com processamento de linguagem natural. Respostas contextuais, aprendizado contínuo e personalização completa para seu negócio.",
    features: ["GPT-4 Integration", "Aprendizado ML", "Contexto avançado", "Multi-idiomas"],
    gradient: "from-purple-400 to-violet-600",
    bgGradient: "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
    accentColor: "text-purple-600 dark:text-purple-400"
  },
  {
    id: 3,
    icon: BarChart3,
    title: "Kanban Inteligente",
    subtitle: "Gestão Visual",
    description: "Sistema de gestão visual com drag & drop, automações inteligentes e pipeline de vendas otimizado. Transforme leads em clientes de forma eficiente.",
    features: ["Drag & Drop", "Automações", "Pipeline vendas", "Relatórios"],
    gradient: "from-blue-400 to-cyan-600",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    accentColor: "text-blue-600 dark:text-blue-400"
  },
  {
    id: 4,
    icon: Calendar,
    title: "Agendamentos Inteligentes",
    subtitle: "Gestão de Tempo",
    description: "Sistema completo de agendamentos com sincronização de calendários, lembretes automáticos e integração com videochamadas.",
    features: ["Sync calendários", "Lembretes auto", "Video calls", "Fuso horário"],
    gradient: "from-orange-400 to-red-600",
    bgGradient: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
    accentColor: "text-orange-600 dark:text-orange-400"
  },
  {
    id: 5,
    icon: CreditCard,
    title: "Pagamentos Integrados",
    subtitle: "Gestão Financeira",
    description: "Sistema completo de pagamentos com PIX, cartões, boletos e assinaturas recorrentes. Controle financeiro total em uma plataforma.",
    features: ["PIX instantâneo", "Cartões", "Assinaturas", "Relatórios"],
    gradient: "from-yellow-400 to-amber-600",
    bgGradient: "from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
    accentColor: "text-yellow-600 dark:text-yellow-400"
  },
  {
    id: 6,
    icon: TrendingUp,
    title: "Analytics Avançado",
    subtitle: "Inteligência de Dados",
    description: "Dashboards interativos com métricas em tempo real, análise preditiva e insights acionáveis para otimizar suas estratégias de vendas.",
    features: ["Tempo real", "IA Preditiva", "Dashboards", "Insights"],
    gradient: "from-indigo-400 to-purple-600",
    bgGradient: "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
    accentColor: "text-indigo-600 dark:text-indigo-400"
  }
]

const FloatingIcon = ({ icon: Icon, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, rotate: -180 }}
    animate={{ 
      opacity: [0, 1, 0.7],
      scale: [0, 1.2, 1],
      rotate: [0, 360, 0],
      y: [0, -10, 0]
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    className={`absolute ${className}`}
  >
    <Icon className="w-6 h-6 text-blue-400/60" />
  </motion.div>
)

export default function ServicesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % services.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const currentService = services[currentIndex]

  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating Icons */}
        <FloatingIcon icon={Zap} delay={0} className="top-32 left-16" />
        <FloatingIcon icon={Shield} delay={1} className="top-16 right-32" />
        <FloatingIcon icon={Brain} delay={2} className="bottom-32 left-24" />
        <FloatingIcon icon={Workflow} delay={3} className="bottom-16 right-16" />
        <FloatingIcon icon={Sparkles} delay={1.5} className="top-1/2 left-8" />
        <FloatingIcon icon={TrendingUp} delay={2.5} className="top-1/3 right-8" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 tracking-wide">
              Recursos Avançados
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Ferramentas que
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              revolucionam
            </span>
            <br />
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              seu negócio
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Descubra como nossa suíte completa de ferramentas pode transformar 
            sua operação e acelerar seus resultados
          </p>
        </motion.div>

        {/* Main Carousel */}
        <div className="relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Service Details */}
            <motion.div
              key={currentService.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${currentService.gradient} shadow-2xl`}>
                <currentService.icon className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-4">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${currentService.bgGradient} ${currentService.accentColor} border border-current/20`}>
                  {currentService.subtitle}
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {currentService.title}
                </h3>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {currentService.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {currentService.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center space-x-2 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentService.gradient}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              <Button className={`bg-gradient-to-r ${currentService.gradient} hover:shadow-xl transition-all duration-300 group px-6 py-3 font-semibold`}>
                Explorar Recurso
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Right - Visual Representation */}
            <motion.div
              key={`visual-${currentService.id}`}
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className={`relative w-full h-96 rounded-3xl bg-gradient-to-br ${currentService.bgGradient} border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden`}>
                {/* Animated Background */}
                <div className="absolute inset-0">
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${currentService.gradient} opacity-20 rounded-full blur-3xl`} />
                  <div className={`absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr ${currentService.gradient} opacity-15 rounded-full blur-2xl`} />
                </div>

                {/* Main Icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${currentService.gradient} flex items-center justify-center shadow-2xl`}
                  >
                    <currentService.icon className="w-16 h-16 text-white" />
                  </motion.div>
                </div>

                {/* Orbiting Elements */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      rotate: [0, 360],
                      x: [0, Math.cos(i * Math.PI / 4) * 100, 0],
                      y: [0, Math.sin(i * Math.PI / 4) * 100, 0]
                    }}
                    transition={{
                      duration: 10 + i,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${currentService.gradient} opacity-60 shadow-lg`} />
                  </motion.div>
                ))}

                {/* Data Flow Lines */}
                <svg className="absolute inset-0 w-full h-full">
                  <motion.path
                    d="M 100 200 Q 200 100 300 200 Q 200 300 100 200"
                    stroke={`url(#gradient-${currentService.id})`}
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id={`gradient-${currentService.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
                      <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center mt-12 space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-xl transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </motion.button>

            <div className="flex space-x-2">
              {services.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? `bg-gradient-to-r ${currentService.gradient}` 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-xl transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}
