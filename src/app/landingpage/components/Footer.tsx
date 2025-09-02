'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ArrowRight,
  Heart,
  Zap
} from 'lucide-react'

export default function Footer() {
  const { actualTheme } = useTheme()

  const footerSections = [
    {
      title: 'Produto',
      links: [
        'Recursos',
        'Preços',
        'Integrações',
        'API',
        'Documentação'
      ]
    },
    {
      title: 'Empresa',
      links: [
        'Sobre Nós',
        'Carreiras',
        'Blog',
        'Imprensa',
        'Parceiros'
      ]
    },
    {
      title: 'Suporte',
      links: [
        'Central de Ajuda',
        'Contato',
        'Status',
        'Comunidade',
        'Webinars'
      ]
    },
    {
      title: 'Legal',
      links: [
        'Privacidade',
        'Termos',
        'Cookies',
        'Segurança',
        'LGPD'
      ]
    }
  ]

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'from-blue-500 to-blue-600' },
    { icon: Twitter, href: '#', color: 'from-sky-500 to-sky-600' },
    { icon: Instagram, href: '#', color: 'from-pink-500 to-purple-600' },
    { icon: Linkedin, href: '#', color: 'from-blue-600 to-blue-700' }
  ]

  return (
    <footer className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className={`absolute top-0 left-0 w-96 h-96 rounded-full ${
            actualTheme === 'dark'
              ? 'bg-gradient-to-br from-purple-500/10 to-violet-600/10'
              : 'bg-gradient-to-br from-purple-200/30 to-blue-300/30'
          } blur-3xl`}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Newsletter Section */}
        <motion.div
          className={`p-12 rounded-3xl border mb-16 ${
            actualTheme === 'dark'
              ? 'bg-gradient-to-br from-slate-800/40 via-purple-900/30 to-slate-800/40 border-purple-500/20'
              : 'bg-gradient-to-br from-white/70 via-purple-50/50 to-white/70 border-purple-200/30'
          } backdrop-blur-xl shadow-2xl text-center`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex p-4 rounded-2xl mb-6 bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>

          <h3 className={`text-3xl sm:text-4xl font-bold mb-4 ${
            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Fique por dentro das{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              novidades
            </span>
          </h3>

          <p className={`text-lg mb-8 max-w-2xl mx-auto ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Receba dicas exclusivas, atualizações de produto e insights sobre IA para vendas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu melhor email"
              className={`flex-1 px-6 py-4 rounded-2xl border transition-all duration-300 ${
                actualTheme === 'dark'
                  ? 'bg-slate-800/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-purple-500/50'
                  : 'bg-white/70 border-gray-200/50 text-gray-900 placeholder-gray-500 focus:border-purple-300/50'
              } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
            />
            <motion.button
              className="px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Inscrever-se
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Zap className="w-6 h-6 text-white" />
              </motion.div>
              <span className={`text-2xl font-bold ${
                actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                TappyOne
              </span>
            </div>

            <p className={`text-base mb-6 leading-relaxed ${
              actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Revolucionando o atendimento ao cliente com IA avançada e automação inteligente.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className={`w-4 h-4 ${
                  actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`} />
                <span className={`text-sm ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  contato@tappyone.com
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className={`w-4 h-4 ${
                  actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`} />
                <span className={`text-sm ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  +55 (11) 9999-9999
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className={`w-4 h-4 ${
                  actualTheme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                }`} />
                <span className={`text-sm ${
                  actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  São Paulo, Brasil
                </span>
              </div>
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <h4 className={`text-lg font-semibold mb-6 ${
                actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li key={linkIndex}>
                    <motion.a
                      href="#"
                      className={`text-sm transition-colors duration-300 ${
                        actualTheme === 'dark'
                          ? 'text-gray-300 hover:text-purple-300'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                      whileHover={{ x: 5 }}
                    >
                      {link}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          className={`pt-8 border-t ${
            actualTheme === 'dark' ? 'border-slate-700/50' : 'border-gray-200/50'
          } flex flex-col sm:flex-row justify-between items-center gap-6`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Copyright */}
          <div className="flex items-center gap-2">
            <span className={`text-sm ${
              actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              © 2024 TappyOne. Feito com
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </motion.div>
            <span className={`text-sm ${
              actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              no Brasil
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                className={`p-3 rounded-2xl border transition-all duration-300 ${
                  actualTheme === 'dark'
                    ? 'bg-slate-800/50 border-slate-600/50 hover:border-purple-500/50'
                    : 'bg-white/70 border-gray-200/50 hover:border-purple-300/50'
                } backdrop-blur-sm group`}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon className={`w-5 h-5 transition-colors duration-300 ${
                  actualTheme === 'dark'
                    ? 'text-gray-400 group-hover:text-white'
                    : 'text-gray-600 group-hover:text-gray-900'
                }`} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
