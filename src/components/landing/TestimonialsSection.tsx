'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  Quote, 
  ArrowLeft, 
  ArrowRight,
  TrendingUp,
  Users,
  MessageSquare,
  Award,
  Sparkles,
  Play,
  CheckCircle,
  Building,
  MapPin
} from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: "Carlos Silva",
    role: "CEO",
    company: "TechStart Brasil",
    location: "São Paulo, SP",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "O TappyOne revolucionou nossa operação de vendas. Em 3 meses aumentamos 180% nossa conversão no WhatsApp. A IA é impressionante!",
    results: {
      metric: "+180%",
      description: "Aumento em vendas"
    },
    gradient: "from-blue-500 to-cyan-600",
    category: "E-commerce"
  },
  {
    id: 2,
    name: "Marina Costa",
    role: "Diretora de Marketing",
    company: "Imóveis Premium",
    location: "Rio de Janeiro, RJ",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Automatizamos 90% do nosso atendimento inicial. Nossos corretores agora focam apenas nos leads qualificados. Resultado: 3x mais vendas!",
    results: {
      metric: "3x",
      description: "Mais vendas"
    },
    gradient: "from-purple-500 to-pink-600",
    category: "Imobiliário"
  },
  {
    id: 3,
    name: "Dr. Roberto Mendes",
    role: "Diretor Clínico",
    company: "Clínica Vida Saudável",
    location: "Belo Horizonte, MG",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Reduzimos 70% das faltas em consultas com os lembretes automáticos. O agendamento inteligente otimizou nossa agenda completamente.",
    results: {
      metric: "-70%",
      description: "Faltas em consultas"
    },
    gradient: "from-green-500 to-emerald-600",
    category: "Saúde"
  },
  {
    id: 4,
    name: "Ana Beatriz",
    role: "Fundadora",
    company: "Escola Criativa",
    location: "Brasília, DF",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "A comunicação com os pais melhorou 100%. Automatizamos avisos, cobranças e agendamentos. Economizamos 15 horas por semana!",
    results: {
      metric: "15h",
      description: "Economizadas por semana"
    },
    gradient: "from-orange-500 to-red-600",
    category: "Educação"
  },
  {
    id: 5,
    name: "Lucas Ferreira",
    role: "Gerente de Vendas",
    company: "AutoPeças Master",
    location: "Curitiba, PR",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "O sistema de follow-up automático não deixa nenhum lead escapar. Aumentamos 250% nossa taxa de conversão em apenas 2 meses!",
    results: {
      metric: "+250%",
      description: "Taxa de conversão"
    },
    gradient: "from-indigo-500 to-purple-600",
    category: "Varejo"
  },
  {
    id: 6,
    name: "Fernanda Oliveira",
    role: "CEO",
    company: "Beauty Express",
    location: "Salvador, BA",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    text: "Nossos clientes adoram o atendimento personalizado 24/7. A IA entende perfeitamente as necessidades e oferece produtos certeiros.",
    results: {
      metric: "24/7",
      description: "Atendimento ativo"
    },
    gradient: "from-pink-500 to-rose-600",
    category: "Beleza"
  }
]

const stats = [
  { value: "10,000+", label: "Empresas ativas", icon: Building },
  { value: "98%", label: "Satisfação", icon: Star },
  { value: "150%", label: "Aumento médio vendas", icon: TrendingUp },
  { value: "24/7", label: "Suporte disponível", icon: MessageSquare }
]

const FloatingTestimonial = ({ delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, y: 50 }}
    animate={{ 
      opacity: [0, 1, 0.7],
      scale: [0, 1.1, 1],
      y: [50, 0, -10, 0],
      rotate: [0, 5, -5, 0]
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    className={`absolute ${className}`}
  >
    <div className="w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
      <Quote className="w-8 h-8 text-blue-500/60" />
    </div>
  </motion.div>
)

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="relative py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-900 dark:via-gray-800 dark:to-purple-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-rose-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-blue-400/5 to-indigo-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating Testimonials */}
        <FloatingTestimonial delay={0} className="top-32 left-16" />
        <FloatingTestimonial delay={1.5} className="top-20 right-32" />
        <FloatingTestimonial delay={3} className="bottom-32 left-24" />
        <FloatingTestimonial delay={2} className="bottom-20 right-16" />
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
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-700 mb-6">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 tracking-wide">
              Depoimentos Reais
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Mais de
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              10.000 empresas
            </span>
            <br />
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              confiam em nós
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Veja como empresas de todos os tamanhos estão transformando seus resultados 
            com nossa plataforma
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Testimonial */}
        <div className="relative max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Left - Testimonial Content */}
              <div className="space-y-8">
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>

                <div className="relative">
                  <Quote className="absolute -top-4 -left-4 w-12 h-12 text-indigo-200 dark:text-indigo-800" />
                  <blockquote className="text-2xl md:text-3xl font-light text-gray-900 dark:text-white leading-relaxed pl-8">
                    "{currentTestimonial.text}"
                  </blockquote>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={currentTestimonial.avatar}
                      alt={currentTestimonial.name}
                      className="w-16 h-16 rounded-full object-cover shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {currentTestimonial.name}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentTestimonial.role} • {currentTestimonial.company}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {currentTestimonial.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`inline-flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r ${currentTestimonial.gradient} bg-opacity-10 border border-current/20`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${currentTestimonial.gradient} bg-clip-text text-transparent`}>
                      {currentTestimonial.results.metric}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentTestimonial.results.description}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${currentTestimonial.gradient} text-white`}>
                    {currentTestimonial.category}
                  </div>
                </div>
              </div>

              {/* Right - Visual */}
              <div className="relative">
                <div className={`relative w-full h-96 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${currentTestimonial.gradient} rounded-full blur-3xl`} />
                    <div className={`absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr ${currentTestimonial.gradient} rounded-full blur-2xl`} />
                  </div>

                  {/* Company Logo Placeholder */}
                  <div className="absolute top-6 left-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${currentTestimonial.gradient} flex items-center justify-center shadow-lg`}>
                      <Building className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                      }}
                      className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${currentTestimonial.gradient} flex items-center justify-center shadow-2xl`}
                    >
                      <TrendingUp className="w-16 h-16 text-white" />
                    </motion.div>
                  </div>

                  {/* Orbiting Stats */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        rotate: [0, 360],
                        x: [0, Math.cos(i * Math.PI / 3) * 80, 0],
                        y: [0, Math.sin(i * Math.PI / 3) * 80, 0]
                      }}
                      transition={{
                        duration: 8 + i,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${currentTestimonial.gradient} opacity-60 shadow-lg`} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center mt-12 space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </motion.button>

            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    setCurrentIndex(index)
                    setIsAutoPlaying(false)
                  }}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? `bg-gradient-to-r ${currentTestimonial.gradient}` 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-xl transition-all duration-300"
            >
              <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}
