'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  MessageSquare, 
  Users, 
  Settings, 
  AlertCircle, 
  CheckCircle,
  Info,
  X
} from 'lucide-react'

interface NotificationsDropdownProps {
  sidebarCollapsed?: boolean
}

export function NotificationsDropdown({ sidebarCollapsed = true }: NotificationsDropdownProps) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <motion.div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowNotifications(!showNotifications)}
        className={`w-10 h-10 flex items-center justify-center rounded-lg backdrop-blur-sm border transition-all duration-300 ${
          sidebarCollapsed
            ? 'bg-white/70 border-white/20 hover:bg-white/90 hover:shadow-md text-gray-600'
            : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
        } shadow-sm hover:shadow-lg`}
        title="Notificações"
      >
        <Bell className="w-4 h-4" />
      </motion.button>
      
      {/* Badge Notificações - Vermelho */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm border border-red-300/30">
        <span className="text-[10px] font-bold text-white drop-shadow-sm">3</span>
      </div>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full right-0 mt-2 w-96 rounded-2xl shadow-2xl border overflow-hidden z-[99999] ${
              sidebarCollapsed
                ? 'bg-white border-gray-200'
                : 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155] backdrop-blur-xl border-white/20'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${
              sidebarCollapsed ? 'border-gray-100' : 'border-white/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    sidebarCollapsed
                      ? 'bg-gray-100'
                      : 'bg-gradient-to-br from-white/30 to-white/10'
                  }`}>
                    <Bell className={`w-4 h-4 ${
                      sidebarCollapsed ? 'text-gray-600' : 'text-white'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      sidebarCollapsed ? 'text-gray-900' : 'text-white'
                    }`}>Notificações</h3>
                    <p className={`text-xs ${
                      sidebarCollapsed ? 'text-gray-500' : 'text-white/60'
                    }`}>3 não lidas</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(false)}
                  className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
                    sidebarCollapsed
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
            
            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {[
                {
                  id: 1,
                  type: 'message',
                  icon: MessageSquare,
                  title: 'Nova mensagem de João Silva',
                  description: 'Olá, gostaria de saber mais sobre...',
                  time: '2 min',
                  unread: true,
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  id: 2,
                  type: 'alert',
                  icon: AlertCircle,
                  title: 'Atendimento pendente há 15 min',
                  description: 'Cliente Maria Santos aguardando',
                  time: '15 min',
                  unread: true,
                  color: 'from-orange-500 to-orange-600'
                },
                {
                  id: 3,
                  type: 'info',
                  icon: Info,
                  title: 'Sistema atualizado',
                  description: 'Nova versão 2.1.0 disponível',
                  time: '1 hora',
                  unread: false,
                  color: 'from-green-500 to-green-600'
                },
                {
                  id: 4,
                  type: 'file',
                  icon: Settings,
                  title: 'Maria Santos enviou arquivo',
                  description: 'documento_contrato.pdf',
                  time: '2 horas',
                  unread: true,
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  id: 5,
                  type: 'success',
                  icon: CheckCircle,
                  title: 'Backup concluído',
                  description: 'Todos os dados foram salvos',
                  time: '3 horas',
                  unread: false,
                  color: 'from-green-500 to-green-600'
                }
              ].map((notification) => {
                const IconComponent = notification.icon
                return (
                  <motion.div
                    key={notification.id}
                    whileHover={{ backgroundColor: sidebarCollapsed ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)' }}
                    className={`p-4 border-b cursor-pointer transition-all ${
                      sidebarCollapsed ? 'border-gray-50' : 'border-white/5'
                    } ${
                      notification.unread
                        ? sidebarCollapsed ? 'bg-blue-50/50' : 'bg-white/5'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${notification.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium truncate ${
                            sidebarCollapsed ? 'text-gray-900' : 'text-white'
                          }`}>{notification.title}</h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs ${
                              sidebarCollapsed ? 'text-gray-500' : 'text-white/60'
                            }`}>{notification.time}</span>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className={`text-xs truncate ${
                          sidebarCollapsed ? 'text-gray-600' : 'text-white/70'
                        }`}>{notification.description}</p>
                      </div>
                    </div>
                  </motion.div>
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sidebarCollapsed
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Marcar todas como lidas
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all ${
                    sidebarCollapsed
                      ? 'bg-blue-500 border-blue-400 text-white hover:bg-blue-600'
                      : 'bg-blue-500/20 border-blue-400/30 text-blue-300 hover:bg-blue-500/30'
                  }`}
                >
                  Ver todas
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
