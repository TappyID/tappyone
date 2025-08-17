'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { Star, Quote, ArrowLeft, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function TestimonialsSection() {
  const { actualTheme } = useTheme()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      name: 'Carlos Silva',
      role: 'CEO',
      company: 'TechStart Solutions',
      avatar: '👨‍💼',
      rating: 5,
      text: 'Revolucionou completamente nosso atendimento. Em 3 meses, aumentamos as vendas em 280% e reduzimos o tempo de resposta em 90%. A IA é impressionante!',
      metrics: { sales: '+280%', response: '-90%', satisfaction: '98%' }
    },
    {
      name: 'Ana Costa',
      role: 'Diretora de Marketing',
      company: 'Fashion Trends',
      avatar: '👩‍💼',
      rating: 5,
      text: 'A automação inteligente nos permitiu atender 10x mais clientes sem aumentar a equipe. O ROI foi incrível, se pagou em menos de 2 meses.',
      metrics: { clients: '10x', roi: '450%', team: '0%' }
    },
    {
      name: 'Roberto Santos',
      role: 'Gerente de Vendas',
      company: 'AutoMax Concessionária',
      avatar: '👨‍🚗',
      rating: 5,
      text: 'Nunca imaginei que um chatbot pudesse ser tão eficiente. Nossos leads qualificados aumentaram 320% e a conversão melhorou drasticamente.',
      metrics: { leads: '+320%', conversion: '+150%', quality: '95%' }
    },
    {
      name: 'Marina Oliveira',
      role: 'Proprietária',
      company: 'Beleza & Estética',
      avatar: '👩‍⚕️',
      rating: 5,
      text: 'Como pequena empresária, essa plataforma me deu superpoderes! Consigo atender clientes 24/7 e minha agenda está sempre lotada.',
      metrics: { availability: '24/7', bookings: '+400%', revenue: '+250%' }
    }
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

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
            <Quote className={`w-4 h-4 ${
              actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
            }`} />
            <span className={`text-sm font-medium ${
              actualTheme === 'dark' ? 'text-purple-200' : 'text-purple-700'
            }`}>
              Depoimentos
            </span>
          </motion.div>

          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${
            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Histórias de{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Sucesso
            </span>
          </h2>

          <p className={`text-xl max-w-3xl mx-auto ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Veja como empresas reais transformaram seus resultados com nossa plataforma de IA.
          </p>
        </motion.div>

        {/* Main Testimonial */}
        <div className="relative max-w-5xl mx-auto mb-16">
          <motion.div
            key={currentTestimonial}
            className={`relative p-12 rounded-3xl border ${
              actualTheme === 'dark'
                ? 'bg-gradient-to-br from-slate-800/40 via-purple-900/30 to-slate-800/40 border-purple-500/20'
                : 'bg-gradient-to-br from-white/70 via-purple-50/50 to-white/70 border-purple-200/30'
            } backdrop-blur-xl shadow-2xl`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            {/* Quote Icon */}
            <motion.div
              className="absolute -top-6 left-12"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <div className={`p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg`}>
                <Quote className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            {/* Content */}
            <div className="pt-8">
              {/* Stars */}
              <motion.div 
                className="flex gap-1 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  </motion.div>
                ))}
              </motion.div>

              {/* Testimonial Text */}
              <motion.p
                className={`text-2xl leading-relaxed mb-8 ${
                  actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                "{testimonials[currentTestimonial].text}"
              </motion.p>

              {/* Metrics */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {Object.entries(testimonials[currentTestimonial].metrics).map(([key, value], index) => (
                  <div key={key} className="text-center">
                    <div className={`text-3xl font-bold mb-1 ${
                      actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                    }`}>
                      {value}
                    </div>
                    <div className={`text-sm capitalize ${
                      actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {key === 'sales' ? 'Vendas' : 
                       key === 'response' ? 'Tempo Resposta' :
                       key === 'satisfaction' ? 'Satisfação' :
                       key === 'clients' ? 'Mais Clientes' :
                       key === 'roi' ? 'ROI' :
                       key === 'team' ? 'Aumento Equipe' :
                       key === 'leads' ? 'Leads' :
                       key === 'conversion' ? 'Conversão' :
                       key === 'quality' ? 'Qualidade' :
                       key === 'availability' ? 'Disponibilidade' :
                       key === 'bookings' ? 'Agendamentos' :
                       key === 'revenue' ? 'Receita' : key}
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Author */}
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="text-4xl">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <div>
                  <div className={`font-bold text-lg ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className={`text-sm ${
                    actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].company}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <motion.button
              onClick={prevTestimonial}
              className={`p-3 rounded-2xl border transition-all duration-300 ${
                actualTheme === 'dark'
                  ? 'bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50'
                  : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
              } backdrop-blur-sm`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <motion.button
              onClick={nextTestimonial}
              className={`p-3 rounded-2xl border transition-all duration-300 ${
                actualTheme === 'dark'
                  ? 'bg-slate-800/50 border-slate-600/50 text-white hover:bg-slate-700/50'
                  : 'bg-white/70 border-gray-200/50 text-gray-900 hover:bg-white/90'
              } backdrop-blur-sm`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center gap-3">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentTestimonial
                  ? 'bg-gradient-to-r from-purple-500 to-violet-600 scale-125'
                  : actualTheme === 'dark'
                    ? 'bg-slate-600 hover:bg-slate-500'
                    : 'bg-gray-300 hover:bg-gray-400'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { number: '4.9/5', label: 'Avaliação Média' },
              { number: '10,000+', label: 'Clientes Satisfeitos' },
              { number: '99%', label: 'Recomendariam' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div className={`text-4xl font-bold mb-2 ${
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
          </div>
        </motion.div>
      </div>
    </section>
  )
}
