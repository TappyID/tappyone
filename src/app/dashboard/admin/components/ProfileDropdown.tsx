'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, LogOut, Shield, HelpCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface ProfileDropdownProps {
  sidebarCollapsed?: boolean
}

export function ProfileDropdown({ sidebarCollapsed = true }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const menuItems = [
    {
      icon: User,
      label: 'Meu Perfil',
      description: 'Gerenciar informações pessoais',
      action: () => console.log('Perfil')
    },
    {
      icon: Settings,
      label: 'Configurações',
      description: 'Preferências do sistema',
      action: () => console.log('Configurações')
    },
    {
      icon: Shield,
      label: 'Segurança',
      description: 'Senha e autenticação',
      action: () => console.log('Segurança')
    },
    {
      icon: HelpCircle,
      label: 'Ajuda & Suporte',
      description: 'Central de ajuda',
      action: () => console.log('Ajuda')
    }
  ]

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Profile Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 p-3 rounded-xl backdrop-blur-sm border transition-all duration-200 group h-12 ${
          sidebarCollapsed 
            ? 'bg-white/70 border-white/20 hover:bg-white/90 hover:shadow-md'
            : 'bg-white/10 border-white/20 hover:bg-white/20 hover:shadow-lg'
        }`}
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#273155] to-blue-600 flex items-center justify-center text-white font-semibold text-xs shadow-lg">
            {user?.nome?.charAt(0) || 'A'}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white shadow-sm"></div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-left">
          <div className={`text-sm font-semibold transition-colors leading-none ${
            sidebarCollapsed 
              ? 'text-gray-800 group-hover:text-[#273155]'
              : 'text-white group-hover:text-blue-200'
          }`}>
            {user?.nome || 'Admin'}
          </div>
          <div className={`text-xs transition-colors capitalize leading-none mt-1 ${
            sidebarCollapsed 
              ? 'text-gray-600 group-hover:text-gray-700'
              : 'text-white/70 group-hover:text-white/90'
          }`}>
            {user?.tipo || 'administrador'} • online
          </div>
        </div>

        {/* Chevron Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`transition-colors ${
            sidebarCollapsed 
              ? 'text-gray-600 group-hover:text-[#273155]'
              : 'text-white group-hover:text-blue-200'
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full right-0 mt-3 w-80 bg-[#273155]/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {user?.nome?.charAt(0) || 'A'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {user?.nome || 'Admin'}
                  </h3>
                  <p className="text-sm text-white/70 mb-2">
                    {user?.email || 'admin@tappyone.com'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white capitalize backdrop-blur-sm">
                      {user?.tipo || 'administrador'}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 backdrop-blur-sm">
                      • online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-3">
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-left group backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors backdrop-blur-sm">
                    <item.icon className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">
                      {item.label}
                    </span>
                    <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                      {item.description}
                    </p>
                  </div>
                </motion.button>
              ))}
              
              {/* Logout Button */}
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 transition-all duration-200 text-left group backdrop-blur-sm mt-2 border-t border-white/10 pt-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: menuItems.length * 0.05 }}
                whileHover={{ x: 6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-2 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors backdrop-blur-sm">
                  <LogOut className="w-4 h-4 text-red-300 group-hover:text-red-200 transition-colors" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-red-300 group-hover:text-red-200 transition-colors">
                    Sair
                  </span>
                  <p className="text-xs text-red-400/70 group-hover:text-red-300/70 transition-colors">
                    Encerrar sessão
                  </p>
                </div>
              </motion.button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 text-xs text-white/60">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>TappyOne CRM v2.0</span>
              </div>
              <p className="text-xs text-white/40 text-center mt-1">
                Powered by IA • Sessão segura
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
