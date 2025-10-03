'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Languages, CheckCircle, Globe, X } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'
import { useColorTheme } from '@/contexts/ColorThemeContext'

export function LanguageSelector() {
  const [showTranslation, setShowTranslation] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR')
  const { colorTheme } = useColorTheme()
  
  // Mapeamento de idiomas para bandeiras
  const getCountryCode = (langCode: string) => {
    const mapping: { [key: string]: string } = {
      'pt-BR': 'BR',
      'en-US': 'US', 
      'es-ES': 'ES',
      'hi-IN': 'IN',
      'fr-FR': 'FR'
    }
    return mapping[langCode] || 'BR'
  }

  // Função para alterar idioma
  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode)
    
    console.log('🌍 Alterando idioma para:', langCode)
    
    // Disparar evento global para o ChatArea
    const event = new CustomEvent('languageChanged', {
      detail: { languageCode: langCode }
    })
    window.dispatchEvent(event)
    
    // Fechar dropdown após seleção
    setShowTranslation(false)
  }

  return (
    <motion.div className="relative">
      <motion.button
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowTranslation(!showTranslation)}
        className="w-10 h-10 flex items-center justify-center rounded-lg backdrop-blur-sm border transition-all duration-300 bg-white/10 border-white/20 hover:bg-white/20 text-white shadow-sm hover:shadow-lg"
        title="Tradução"
      >
        <Languages className="w-4 h-4" />
      </motion.button>
      
      {/* Badge com bandeira do idioma ativo */}
      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border ${
        selectedLanguage !== 'pt-BR' 
          ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300/30 animate-pulse' 
          : 'bg-gradient-to-br from-indigo-400 to-indigo-600 border-indigo-300/30'
      }`}>
        <ReactCountryFlag
          countryCode={getCountryCode(selectedLanguage)}
          svg
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '2px'
          }}
        />
      </div>
      {/* Translation Dropdown */}
      <AnimatePresence>
        {showTranslation && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              backgroundColor: colorTheme.primary
            }}
            className="absolute top-full right-0 mt-2 w-80 rounded-2xl shadow-2xl border overflow-hidden z-[99999] backdrop-blur-xl border-white/20"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-white/30 to-white/10">
                    <Globe className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Tradução Automática</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowTranslation(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg transition-colors bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
            
            {/* Languages List */}
            <div className="p-3">
              <div className="space-y-2">
                {[
                  {
                    code: 'pt-BR',
                    name: 'Português',
                    country: 'Brasil',
                    countryCode: 'BR',
                    active: true
                  },
                  {
                    code: 'en-US',
                    name: 'English',
                    country: 'United States',
                    countryCode: 'US',
                    active: false
                  },
                  {
                    code: 'es-ES',
                    name: 'Español',
                    country: 'España',
                    countryCode: 'ES',
                    active: false
                  },
                  {
                    code: 'hi-IN',
                    name: 'हिन्दी Hindi',
                    country: 'भारत',
                    countryCode: 'IN',
                    active: false
                  },
                  {
                    code: 'fr-FR',
                    name: 'Français',
                    country: 'France',
                    countryCode: 'FR',
                    active: false
                  }
                ].map((lang, index) => {
                  const isActive = selectedLanguage === lang.code
                  return (
                  <motion.button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-green-500/20 border-green-400/50 text-green-300 shadow-lg shadow-green-500/20'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <ReactCountryFlag 
                        countryCode={lang.countryCode}
                        svg
                        style={{
                          width: '24px',
                          height: '18px',
                          borderRadius: '2px'
                        }}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm">{lang.name}</div>
                      <div className="text-xs opacity-70">{lang.country}</div>
                    </div>
                    {isActive && (
                      <CheckCircle className="w-4 h-4 flex-shrink-0 text-green-400" />
                    )}
                  </motion.button>
                  )
                })}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-white/80">Tradução ativa</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/10 hover:bg-white/20 text-white"
                >
                  Configurações
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
