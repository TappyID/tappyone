'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  MessageSquare, 
  Users, 
  Clock,
  Filter,
  MoreHorizontal,
  Zap,
  Languages,
  Kanban,
  Globe,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Flag,
  GitBranch,
  MessageCircle,
  List
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ReactCountryFlag from 'react-country-flag'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  title?: string
  searchQuery?: string
  onSearchChange?: (query: string) => void
  showSearch?: boolean
  customActions?: React.ReactNode
}

export default function TopBar({ 
  title = "TappyOne CRM", 
  searchQuery = "", 
  onSearchChange,
  showSearch = true,
  customActions 
}: TopBarProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-20 bg-gradient-to-r from-[#273155] via-[#2a3660] to-[#273155] backdrop-blur-xl border-b border-white/10 shadow-2xl relative z-[10000]"
    >
      {/* Glass Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative h-full flex items-center justify-between px-8">
        {/* Left Section - Logo & Title */}
        <div className="flex items-center gap-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="text-xs text-white/70">Sistema de Gestão Inteligente</p>
            </div>
          </motion.div>
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 max-w-md mx-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Buscar conversas, contatos..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </motion.div>
        )}

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-4">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                title="Automação"
              >
                <Zap className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Automação - Amarelo */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-[8px] font-bold text-white">⚡</span>
              </motion.div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/kanban')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                title="CRM Kanban"
              >
                <Kanban className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Kanban - Azul */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-[8px] font-bold text-white">📋</span>
              </motion.div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/fluxograma')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                title="Fluxograma"
              >
                <GitBranch className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Fluxograma - Roxo */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-[8px] font-bold text-white">🔀</span>
              </motion.div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/respostas-rapidas')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                title="Respostas Rápidas"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Respostas - Rosa */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-[8px] font-bold text-white">💬</span>
              </motion.div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/admin/filas')}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                title="Filas"
              >
                <List className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge Filas - Laranja */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-[8px] font-bold text-white">📝</span>
              </motion.div>
            </motion.div>
            
            <motion.div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTranslation(!showTranslation)}
                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                title="Tradução"
              >
                <Languages className="w-4 h-4 text-white" />
              </motion.button>
              
              {/* Badge com idioma ativo */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-[10px] font-bold text-white">
                  {(() => {
                    const activeLanguage = [
                      { code: 'pt-BR', badge: 'PT', active: true },
                      { code: 'en-US', badge: 'EN', active: false },
                      { code: 'es-ES', badge: 'ES', active: false },
                      { code: 'hi-IN', badge: 'HI', active: false },
                      { code: 'fr-FR', badge: 'FR', active: false }
                    ].find(lang => lang.active);
                    return activeLanguage?.badge || 'PT';
                  })()} 
                </span>
              </motion.div>
              
              {/* Translation Dropdown */}
              <AnimatePresence>
                {showTranslation && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-[99999]"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                            <Globe className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-sm">Tradução Automática</h3>
                            <p className="text-xs text-white/60">Selecione o idioma</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowTranslation(false)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <X className="w-4 h-4 text-white/70" />
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
                        ].map((lang, index) => (
                          <motion.button
                            key={lang.code}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${
                              lang.active 
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
                            {lang.active && (
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Custom Actions */}
          {customActions}

          {/* Notifications */}
          <motion.div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
              title="Notificações"
            >
              <Bell className="w-4 h-4 text-white" />
            </motion.button>
            
            {/* Notification Badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">3</span>
            </div>
          </motion.div>

          {/* Profile */}
          <motion.div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-white">{user?.name || 'Admin'}</div>
                <div className="text-xs text-white/60">Online</div>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
