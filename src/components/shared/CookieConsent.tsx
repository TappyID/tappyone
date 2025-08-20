'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cookie, 
  Shield, 
  Settings, 
  X, 
  Check, 
  Info,
  Eye,
  Lock,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

const cookieTypes = [
  {
    id: 'necessary',
    name: 'Cookies Necessários',
    description: 'Essenciais para o funcionamento básico do site',
    icon: Shield,
    required: true,
    details: 'Cookies técnicos necessários para navegação, segurança e funcionalidades básicas.'
  },
  {
    id: 'functional',
    name: 'Cookies Funcionais',
    description: 'Melhoram a experiência de uso',
    icon: Settings,
    required: false,
    details: 'Lembram suas preferências e personalizam sua experiência no site.'
  },
  {
    id: 'analytics',
    name: 'Cookies Analíticos',
    description: 'Nos ajudam a entender como você usa o site',
    icon: Eye,
    required: false,
    details: 'Coletam dados anônimos sobre uso para melhorarmos nossos serviços.'
  },
  {
    id: 'marketing',
    name: 'Cookies de Marketing',
    description: 'Personalizam anúncios e conteúdo',
    icon: Sparkles,
    required: false,
    details: 'Permitem mostrar conteúdo e ofertas mais relevantes para você.'
  }
]

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    // Verificar se já existe consentimento
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Mostrar após 2 segundos
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    setPreferences(allAccepted)
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted))
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    setPreferences(onlyNecessary)
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary))
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    setIsVisible(false)
  }

  const handlePreferenceChange = (type: keyof CookiePreferences) => {
    if (type === 'necessary') return // Não pode desabilitar necessários
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Mobile Version */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 md:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="p-4">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      Cookies & Privacidade
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      Usamos cookies para melhorar sua experiência. Você pode personalizar suas preferências.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-xl"
                    >
                      Aceitar Todos
                    </Button>
                    <Button
                      onClick={() => setShowDetails(true)}
                      variant="outline"
                      className="px-3 py-2 text-xs rounded-xl border-gray-300 dark:border-gray-600"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleRejectAll}
                    variant="ghost"
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-1"
                  >
                    Apenas Necessários
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Desktop Version */}
          <motion.div
            className="fixed bottom-6 left-6 z-50 hidden md:block"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Cookies & Privacidade
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Respeitamos sua privacidade
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Utilizamos cookies para oferecer a melhor experiência possível, analisar o uso do site e personalizar conteúdo. 
                  Você tem controle total sobre suas preferências.
                </p>

                <div className="flex flex-col space-y-3">
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-medium"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Aceitar Todos
                    </Button>
                    <Button
                      onClick={() => setShowDetails(true)}
                      variant="outline"
                      className="px-4 py-3 rounded-2xl border-gray-300 dark:border-gray-600"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <Button
                    onClick={handleRejectAll}
                    variant="ghost"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2"
                  >
                    Apenas Cookies Necessários
                  </Button>
                </div>

                {/* LGPD Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Lock className="w-3 h-3" />
                    <span>Conforme LGPD • Lei 13.709/2018</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Preferences Modal */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                className="fixed inset-0 z-60 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Backdrop */}
                <motion.div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDetails(false)}
                />

                {/* Modal */}
                <motion.div
                  className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                          <Settings className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Preferências de Cookies</h3>
                          <p className="text-blue-100">Personalize sua experiência</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDetails(false)}
                        className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-6">
                      {cookieTypes.map((type) => (
                        <motion.div
                          key={type.id}
                          className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4"
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <type.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {type.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                  {type.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {type.details}
                                </p>
                              </div>
                            </div>
                            <div className="ml-4">
                              <motion.button
                                onClick={() => handlePreferenceChange(type.id as keyof CookiePreferences)}
                                disabled={type.required}
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                  preferences[type.id as keyof CookiePreferences]
                                    ? 'bg-blue-600'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                } ${type.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                whileTap={{ scale: 0.95 }}
                              >
                                <motion.div
                                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                                  animate={{
                                    x: preferences[type.id as keyof CookiePreferences] ? 24 : 2
                                  }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* LGPD Information */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Seus Direitos (LGPD)
                          </h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• Acessar seus dados pessoais</li>
                            <li>• Corrigir dados incompletos ou incorretos</li>
                            <li>• Solicitar exclusão de dados</li>
                            <li>• Revogar consentimento a qualquer momento</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleSavePreferences}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-medium"
                      >
                        Salvar Preferências
                      </Button>
                      <Button
                        onClick={() => setShowDetails(false)}
                        variant="outline"
                        className="px-6 py-3 rounded-2xl border-gray-300 dark:border-gray-600"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
