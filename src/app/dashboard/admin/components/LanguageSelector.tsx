'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Languages, Check } from 'lucide-react'
import { TopBarButton } from './TopBarButton'

interface Language {
  code: string
  name: string
  flag: string
  nativeName: string
}

const languages: Language[] = [
  { code: 'pt', name: 'Português (Brasil)', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'en', name: 'English (US)', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'hi', name: 'Hindi (भारत)', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'pt-ao', name: 'Português (Angola)', flag: '🇦🇴', nativeName: 'Português' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' }
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
    <TopBarButton
      icon={Languages}
      onClick={() => setIsOpen(!isOpen)}
      sidebarCollapsed={sidebarCollapsed}
      tooltip={`Idioma: ${selectedLanguage.nativeName}`}
    >
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
                    <span className="text-2xl drop-shadow-sm">{language.flag}</span>
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
    </TopBarButton>
  )
}
