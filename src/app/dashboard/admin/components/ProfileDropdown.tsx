'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Settings, 
  Bell, 
  Languages, 
  Info, 
  MoreHorizontal, 
  X 
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface ProfileDropdownProps {
  sidebarCollapsed?: boolean
}

export function ProfileDropdown({ sidebarCollapsed = true }: ProfileDropdownProps) {
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    setShowProfile(false)
  }

  const handleMenuClick = (action: string) => {
    setShowProfile(false)
    
    switch(action) {
      case 'profile':
        router.push('/dashboard/admin/perfil')
        break
      case 'settings':
        router.push('/dashboard/admin/configuracoes')
        break
      case 'notifications':
        router.push('/dashboard/admin/notificacoes')
        break
      case 'language':
        // Já implementado no LanguageSelector
        break
      case 'help':
        router.push('/dashboard/admin/ajuda')
        break
      default:
        console.log('Menu item:', action)
    }
  }

  return (
    <motion.div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowProfile(!showProfile)}
        className={`flex items-center gap-2.5 h-10 px-2.5 rounded-lg backdrop-blur-sm border transition-all duration-300 ${
          sidebarCollapsed
            ? 'bg-white/10 border-gray-200/20 hover:bg-gray-100 text-gray-700'
            : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
        }`}
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          sidebarCollapsed
            ? 'bg-gray-100'
            : 'bg-gradient-to-br from-white/30 to-white/10'
        }`}>
          <User className={`w-3.5 h-3.5 ${
            sidebarCollapsed ? 'text-gray-600' : 'text-white'
          }`} />
        </div>
        <div className="hidden md:block text-left">
          <p className={`text-sm font-medium ${
            sidebarCollapsed ? 'text-gray-900' : 'text-white'
          }`}>{user?.nome || 'Admin'}</p>
          <p className={`text-xs ${
            sidebarCollapsed ? 'text-gray-600' : 'text-white/70'
          }`}>Online</p>
        </div>
        <MoreHorizontal className={`w-3.5 h-3.5 ${
          sidebarCollapsed ? 'text-gray-600' : 'text-white/60'
        }`} />
      </motion.button>
      
      {/* Badge Online - Verde */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-green-300/30"
      >
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      </motion.div>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full right-0 mt-2 w-80 rounded-2xl shadow-2xl border overflow-hidden z-[99999] ${
              sidebarCollapsed
                ? 'bg-white border-gray-200'
                : 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155] backdrop-blur-xl border-white/20'
            }`}
          >
            {/* Header */}
            <div className={`p-6 border-b ${
              sidebarCollapsed ? 'border-gray-100' : 'border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    sidebarCollapsed
                      ? 'bg-gray-100'
                      : 'bg-gradient-to-br from-white/30 to-white/10'
                  }`}>
                    <User className={`w-6 h-6 ${
                      sidebarCollapsed ? 'text-gray-600' : 'text-white'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      sidebarCollapsed ? 'text-gray-900' : 'text-white'
                    }`}>{user?.nome || 'Admin'}</h3>
                    <p className={`text-sm ${
                      sidebarCollapsed ? 'text-gray-600' : 'text-white/70'
                    }`}>{user?.email || 'admin@tappyone.com'}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowProfile(false)}
                  className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
                    sidebarCollapsed
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </div>
              
              {/* Status */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className={`text-sm ${
                  sidebarCollapsed ? 'text-gray-600' : 'text-white/80'
                }`}>Online agora</span>
              </div>
            </div>
            
            {/* Menu Options */}
            <div className="p-4 space-y-2">
              {[
                {
                  icon: User,
                  label: 'Meu Perfil',
                  description: 'Gerenciar informações pessoais',
                  color: 'from-blue-500 to-blue-600',
                  action: 'profile'
                },
                {
                  icon: Settings,
                  label: 'Configurações',
                  description: 'Preferências do sistema',
                  color: 'from-gray-500 to-gray-600',
                  action: 'settings'
                },
                {
                  icon: Bell,
                  label: 'Notificações',
                  description: 'Gerenciar alertas',
                  color: 'from-yellow-500 to-yellow-600',
                  action: 'notifications'
                },
                {
                  icon: Languages,
                  label: 'Idioma',
                  description: 'Português (Brasil)',
                  color: 'from-green-500 to-green-600',
                  action: 'language'
                },
                {
                  icon: Info,
                  label: 'Ajuda & Suporte',
                  description: 'Central de ajuda',
                  color: 'from-purple-500 to-purple-600',
                  action: 'help'
                }
              ].map((item, index) => {
                const IconComponent = item.icon
                return (
                  <motion.button
                    key={index}
                    whileHover={{ x: 4, backgroundColor: sidebarCollapsed ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMenuClick(item.action)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        sidebarCollapsed ? 'text-gray-900' : 'text-white'
                      }`}>{item.label}</div>
                      <div className={`text-xs ${
                        sidebarCollapsed ? 'text-gray-600' : 'text-white/60'
                      }`}>{item.description}</div>
                    </div>
                    <MoreHorizontal className={`w-4 h-4 ${
                      sidebarCollapsed ? 'text-gray-400' : 'text-white/40'
                    }`} />
                  </motion.button>
                )
              })}
            </div>
            
            {/* Footer */}
            <div className={`p-4 border-t ${
              sidebarCollapsed
                ? 'border-gray-100 bg-gray-50'
                : 'border-white/10 bg-white/5'
            }`}>
              <div className="flex items-center justify-between">
                <div className={`text-xs ${
                  sidebarCollapsed ? 'text-gray-500' : 'text-white/60'
                }`}>
                  Versão 2.1.0
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                    sidebarCollapsed
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                      : 'bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-400/30 text-red-300 hover:from-red-500/30 hover:to-red-600/30'
                  }`}
                >
                  Sair
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
