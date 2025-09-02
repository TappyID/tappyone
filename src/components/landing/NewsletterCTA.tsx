'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Send, 
  CheckCircle, 
  Sparkles, 
  Gift,
  Star,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Bell,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const FloatingIcon = ({ icon: Icon, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0, y: 50 }}
    animate={{ 
      opacity: [0, 1, 0.8],
      scale: [0, 1.2, 1],
      y: [50, 0, -20, 0],
      rotate: [0, 10, -10, 0]
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    className={`absolute ${className}`}
  >
    <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
      <Icon className="w-6 h-6 text-blue-500/70" />
    </div>
  </motion.div>
)

const benefits = [
  {
    icon: Gift,
    title: "Acesso antecipado",
    description: "Seja o primeiro a testar novos recursos"
  },
  {
    icon: Crown,
    title: "Conteúdo exclusivo",
    description: "Dicas e estratégias dos especialistas"
  },
  {
    icon: TrendingUp,
    title: "Cases de sucesso",
    description: "Aprenda com empresas que cresceram 300%"
  },
  {
    icon: Zap,
    title: "Templates gratuitos",
    description: "Automações prontas para usar"
  }
]

export default function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    setIsSubmitted(true)
    setEmail('')
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-r from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzEyM180NTYpIj4KPHBhdGggZD0iTTQwIDFIMUw0MCA0MFYxWiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMjNfNDU2Ij4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=')] bg-repeat" />
        </div>

        {/* Floating Icons */}
        <FloatingIcon icon={Mail} delay={0} className="top-20 left-16" />
        <FloatingIcon icon={Bell} delay={1.5} className="top-32 right-24" />
        <FloatingIcon icon={Star} delay={3} className="bottom-32 left-32" />
        <FloatingIcon icon={Sparkles} delay={2} className="bottom-24 right-16" />
        <FloatingIcon icon={Users} delay={0.5} className="top-1/2 left-8" />
        <FloatingIcon icon={TrendingUp} delay={2.5} className="top-1/2 right-8" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white tracking-wide">
                Newsletter Exclusiva
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white">
              Fique por dentro das
              <br />
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                últimas novidades
              </span>
            </h2>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-light">
              Receba dicas exclusivas, cases de sucesso e novos recursos 
              diretamente no seu e-mail. Mais de <strong className="text-yellow-400">50.000</strong> profissionais já fazem parte!
            </p>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-white/70 text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Newsletter Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative"
          >
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-2xl blur-xl opacity-30" />
                  <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Digite seu melhor e-mail"
                          className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-white/60 border-none outline-none text-lg"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLoading || !email}
                        className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Inscrever
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <p className="text-white/60 text-sm mt-4">
                  🔒 Seus dados estão seguros. Não enviamos spam.
                </p>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="max-w-md mx-auto"
              >
                <div className="bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl p-8 border border-green-400/30">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Inscrição confirmada! 🎉
                  </h3>
                  <p className="text-white/80 mb-6">
                    Verifique seu e-mail para confirmar a inscrição e receber seu primeiro conteúdo exclusivo.
                  </p>
                  
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-2 rounded-lg transition-all duration-300"
                  >
                    Inscrever outro e-mail
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 flex items-center justify-center space-x-8 text-white/60"
          >
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">50.000+ inscritos</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-blue-400" />
              <span className="text-sm">4.9/5 avaliação</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">98% satisfação</span>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-16 p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Pronto para revolucionar seu negócio?
            </h3>
            <p className="text-white/80 mb-6">
              Junte-se a milhares de empresas que já transformaram seus resultados
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Começar Grátis Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
