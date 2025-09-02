'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Languages, Check } from 'lucide-react'
import ReactCountryFlag from 'react-country-flag'
import { TopBarButton } from './TopBarButton'

interface Language {
  code: string
  name: string
  flag: string
  nativeName: string
}

const languages: Language[] = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: 'BR', nativeName: 'Português' },
  { code: 'en-US', name: 'English (US)', flag: 'US', nativeName: 'English' },
  { code: 'es-ES', name: 'Español', flag: 'ES', nativeName: 'Español' },
  { code: 'hi-IN', name: 'Hindi (भारत)', flag: 'IN', nativeName: 'हिन्दी' },
  { code: 'fr-FR', name: 'Français', flag: 'FR', nativeName: 'Français' }
]

interface LanguageSelectorProps {
  sidebarCollapsed?: boolean
}

export function LanguageSelector({ sidebarCollapsed = true }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])

  const handleLanguageSelect = (language: Language) => {
    console.log('🔥 CLIQUE NO IDIOMA:', language.code, language.name)
    setSelectedLanguage(language)
    setIsOpen(false)
    
    // Disparar evento global para tradução
    const event = new CustomEvent('languageChanged', { 
      detail: { languageCode: language.code } 
    })
    
    console.log('📡 Disparando evento languageChanged:', event.detail)
    window.dispatchEvent(event)
    
    console.log('🌍 Idioma selecionado para tradução:', language.code)
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 flex items-center justify-center rounded-lg backdrop-blur-sm border transition-all duration-300 ${
          sidebarCollapsed 
            ? 'bg-gray-100/80 border-gray-200/60 hover:bg-gray-200/80 text-gray-700' 
            : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
        }`}
        title={`Idioma: ${selectedLanguage.nativeName}`}
      >
        <Languages className="w-4 h-4" />
      </motion.button>
      
      {/* Badge com bandeira do idioma ativo */}
      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border ${
        selectedLanguage.code !== 'pt-BR' 
          ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300/30 animate-pulse' 
          : 'bg-gradient-to-br from-indigo-400 to-indigo-600 border-indigo-300/30'
      }`}>
        <ReactCountryFlag
          countryCode={selectedLanguage.flag}
          svg
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '2px'
          }}
        />
      </div>
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full right-0 mt-3 w-72 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100/50 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Languages size={16} className="text-[#273155]" />
                Selecionar Idioma
              </h3>
              <p className="text-xs text-gray-600 mt-1">Escolha seu idioma preferido</p>
            </div>

            {/* Language List */}
            <div className="max-h-80 overflow-y-auto">
              {languages.map((language, index) => (
                <motion.button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left group ${
                    selectedLanguage.code === language.code 
                      ? 'bg-blue-50 border-l-4 border-[#273155]' 
                      : 'hover:bg-gray-50/80'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <ReactCountryFlag
                      countryCode={language.flag}
                      svg
                      style={{
                        width: '24px',
                        height: '18px',
                        borderRadius: '2px'
                      }}
                    />
                    {selectedLanguage.code === language.code && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-[#273155] rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Check size={8} className="text-white" />
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-[#273155] transition-colors">
                      {language.nativeName}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                      {language.name}
                    </div>
                  </div>
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="w-2 h-2 bg-[#273155] rounded-full"></div>
                  </motion.div>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Tradução automática ativa</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-1">
                Powered by IA • {languages.length} idiomas
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
