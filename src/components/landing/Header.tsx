'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  Menu, 
  X, 
  ChevronDown, 
  MessageSquare, 
  Bot, 
  Calendar, 
  CreditCard, 
  Users, 
  BarChart3,
  Zap,
  Shield,
  Headphones,
  Moon,
  Sun
} from 'lucide-react'

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

const ProductsMegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-2xl z-50"
      >
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Comunicação
              </h3>
              <div className="space-y-4">
                <Link href="#" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      WhatsApp Business
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Integração completa com API oficial
                    </p>
                  </div>
                </Link>
                <Link href="#" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Chatbots IA
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Agentes inteligentes personalizáveis
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Gestão
              </h3>
              <div className="space-y-4">
                <Link href="#" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Agendamentos
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Calendário integrado e notificações
                    </p>
                  </div>
                </Link>
                <Link href="#" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Kanban Board
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gestão visual de leads e vendas
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Financeiro
              </h3>
              <div className="space-y-4">
                <Link href="#" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Pagamentos
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      PIX, cartão e assinaturas recorrentes
                    </p>
                  </div>
                </Link>
                <Link href="#" className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Gestão de Clientes
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      CRM completo e segmentação avançada
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)

const SolutionsMegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-2xl z-50"
      >
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Por Segmento
              </h3>
              <div className="space-y-4">
                <Link href="#" className="block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">E-commerce</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automação de vendas e suporte para lojas online
                  </p>
                </Link>
                <Link href="#" className="block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Imobiliárias</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Gestão de leads e acompanhamento de negociações
                  </p>
                </Link>
                <Link href="#" className="block p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Consultórios</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Agendamentos e lembretes automáticos
                  </p>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Recursos Avançados
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Automação Inteligente</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Fluxos personalizados com IA
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Segurança Avançada</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Criptografia e compliance LGPD
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
)

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, actualTheme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }

  const handleMenuHover = (menu: string) => {
    setActiveMenu(menu)
  }

  const handleMenuLeave = () => {
    setActiveMenu(null)
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50' 
          : 'bg-transparent'
      }`}
      onMouseLeave={handleMenuLeave}
    >
      <ProductsMegaMenu isOpen={activeMenu === 'products'} onClose={() => setActiveMenu(null)} />
      <SolutionsMegaMenu isOpen={activeMenu === 'solutions'} onClose={() => setActiveMenu(null)} />
      
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                  TappyOne
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5 font-medium tracking-wide">CRM Intelligence</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8 relative">
            <div 
              className="relative"
              onMouseEnter={() => handleMenuHover('products')}
            >
              <button className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium py-2 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                <span className="font-semibold">Produtos</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === 'products' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div 
              className="relative"
              onMouseEnter={() => handleMenuHover('solutions')}
            >
              <button className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-medium py-2 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                <span className="font-semibold">Soluções</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === 'solutions' ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-semibold py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Preços
            </button>
            <button 
              onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-semibold py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Recursos
            </button>
            <button 
              onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-semibold py-2 px-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Suporte
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {actualTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            <div className="hidden lg:flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className="font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
                  Entrar
                </Button>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button 
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Contratar
                  </Button>
                </button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mt-6 pb-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="pt-6 space-y-4">
                <button 
                  onClick={() => { document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
                  className="block text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Produtos
                </button>
                <button 
                  onClick={() => { document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
                  className="block text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Soluções
                </button>
                <button 
                  onClick={() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
                  className="block text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Preços
                </button>
                <button 
                  onClick={() => { document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
                  className="block text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Recursos
                </button>
                <button 
                  onClick={() => { document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
                  className="block text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Suporte
                </button>
                <div className="pt-4 space-y-3">
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">
                      Entrar
                    </Button>
                  </Link>
                  <button 
                    onClick={() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }}
                    className="block w-full"
                  >
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700">
                      Contratar
                    </Button>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}
