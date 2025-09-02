'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useAnimation } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  MessageSquare, 
  Bot, 
  Users, 
  BarChart3, 
  Zap,
  Calendar,
  CreditCard,
  Star,
  TrendingUp
} from 'lucide-react'

const FloatingCard = ({ children, delay = 0, duration = 3, className = "", style = {} }: { children: React.ReactNode, delay?: number, duration?: number, className?: string, style?: React.CSSProperties }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: [20, -10, 20],
      rotateX: [0, 5, 0],
      rotateY: [0, -5, 0]
    }}
    transition={{
      opacity: { duration: 0.6, delay },
      y: { duration, repeat: Infinity, ease: "easeInOut", delay },
      rotateX: { duration: duration * 1.2, repeat: Infinity, ease: "easeInOut", delay },
      rotateY: { duration: duration * 0.8, repeat: Infinity, ease: "easeInOut", delay }
    }}
    className={`absolute ${className}`}
    style={{ transformStyle: 'preserve-3d', ...style }}
  >
    {children}
  </motion.div>
)

const PulsingDot = ({ className = "", delay = 0, style = {} }: { className?: string, delay?: number, style?: React.CSSProperties }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1.2, 1],
      opacity: [0, 1, 0.8]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    className={`w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full ${className}`}
    style={style}
  />
)

const AnimatedCRM = () => {
  const [activeCard, setActiveCard] = useState(0)
  const controls = useAnimation()

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 6)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const crmCards = [
    { icon: MessageSquare, title: "WhatsApp", color: "from-green-400 to-emerald-500", position: "top-4 left-8" },
    { icon: Bot, title: "IA Agent", color: "from-purple-400 to-violet-500", position: "top-8 right-12" },
    { icon: Users, title: "Leads", color: "from-blue-400 to-cyan-500", position: "top-32 left-4" },
    { icon: BarChart3, title: "Kanban", color: "from-orange-400 to-red-500", position: "top-36 right-8" },
    { icon: Calendar, title: "Agenda", color: "from-pink-400 to-rose-500", position: "bottom-32 left-12" },
    { icon: CreditCard, title: "Pagamentos", color: "from-yellow-400 to-amber-500", position: "bottom-8 right-4" }
  ]

  return (
    <div className="relative w-full h-96 perspective-1000">
      {/* Central Hub */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          boxShadow: [
            "0 0 20px rgba(59, 130, 246, 0.3)",
            "0 0 40px rgba(59, 130, 246, 0.5)",
            "0 0 20px rgba(59, 130, 246, 0.3)"
          ]
        }}
        transition={{ 
          scale: { duration: 1, ease: "easeOut" },
          rotate: { duration: 1, ease: "easeOut" },
          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center z-10 shadow-2xl"
      >
        <TrendingUp className="w-12 h-12 text-white" />
        
        {/* Pulsing rings */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 border-2 border-blue-400 rounded-2xl"
        />
        <motion.div
          animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute inset-0 border-2 border-indigo-400 rounded-2xl"
        />
      </motion.div>

      {/* Floating CRM Cards */}
      {crmCards.map((card, index) => (
        <FloatingCard
          key={index}
          delay={index * 0.2}
          duration={3 + index * 0.3}
          className={card.position}
        >
          <motion.div
            animate={{
              scale: activeCard === index ? 1.1 : 1,
              boxShadow: activeCard === index 
                ? "0 10px 30px rgba(0,0,0,0.3)" 
                : "0 5px 15px rgba(0,0,0,0.1)"
            }}
            transition={{ duration: 0.3 }}
            className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20`}
          >
            <card.icon className="w-8 h-8 text-white" />
          </motion.div>
          
          {/* Connection lines */}
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: activeCard === index ? 1 : 0.3,
              opacity: activeCard === index ? 1 : 0.5
            }}
            transition={{ duration: 0.5 }}
            className="absolute top-8 left-8 w-1 h-8 bg-gradient-to-b from-blue-400 to-transparent"
          />
        </FloatingCard>
      ))}

      {/* Connecting Lines Animation */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d="M 200 200 Q 300 100 400 200 Q 300 300 200 200"
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <PulsingDot
          key={i}
          delay={i * 0.3}
          className={`absolute ${
            i % 4 === 0 ? 'top-12 left-16' :
            i % 4 === 1 ? 'top-20 right-20' :
            i % 4 === 2 ? 'bottom-16 left-20' :
            'bottom-12 right-16'
          }`}
          style={{
            left: `${20 + (i * 15) % 60}%`,
            top: `${15 + (i * 20) % 70}%`
          }}
        />
      ))}

      {/* Data flow animation */}
      <motion.div
        animate={{
          x: [0, 100, 200, 300, 200, 100, 0],
          y: [0, -20, 0, 20, 40, 20, 0],
          opacity: [0, 1, 1, 1, 1, 1, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-0 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-lg"
      />
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 pt-24">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%227%22%20cy%3D%2227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2227%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%227%22%20cy%3D%2247%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2227%22%20cy%3D%2247%22%20r%3D%221%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2247%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 tracking-wide">
                🚀 Revolucione seu atendimento
              </span>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  O CRM mais
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  inteligente
                </span>
                <br />
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  do Brasil
                </span>
              </h1>
            </motion.div>

            {/* Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed font-light max-w-2xl"
            >
              Transforme conversas do WhatsApp em vendas com{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">IA avançada</span>,{' '}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">automação inteligente</span> e{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">gestão visual completa</span>.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button 
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold px-8 py-4 text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
                  >
                    Contratar
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button 
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold px-8 py-4 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 group"
                  >
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Ver Recursos
                  </Button>
                </button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex items-center space-x-8 pt-8"
            >
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  4.9/5 • 2,500+ empresas
                </span>
              </div>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400 font-semibold">✓</span> Teste grátis por 14 dias
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative"
          >
            <AnimatedCRM />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
