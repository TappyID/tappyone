'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, MessageSquare, Users, Calendar, AlertCircle, Check } from 'lucide-react'

interface Notification {
  id: string
  type: 'message' | 'user' | 'appointment' | 'alert'
  title: string
  description: string
  time: string
  isRead: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'Nova mensagem',
    description: 'Cliente João enviou uma mensagem',
    time: '2 min',
    isRead: false
  },
  {
    id: '2',
    type: 'user',
    title: 'Novo usuário',
    description: 'Maria Silva se cadastrou',
    time: '5 min',
    isRead: false
  },
  {
    id: '3',
    type: 'appointment',
    title: 'Agendamento',
    description: 'Reunião em 30 minutos',
    time: '10 min',
    isRead: true
  },
  {
    id: '4',
    type: 'alert',
    title: 'Sistema',
    description: 'Backup concluído com sucesso',
    time: '1h',
    isRead: true
  }
]

interface NotificationsDropdownProps {
  sidebarCollapsed?: boolean
}

export function NotificationsDropdown({ sidebarCollapsed = true }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageSquare
      case 'user': return Users
      case 'appointment': return Calendar
      case 'alert': return AlertCircle
      default: return Bell
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600'
      case 'user': return 'text-green-600'
      case 'appointment': return 'text-purple-600'
      case 'alert': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  return (
    <div className="relative">
      {/* Notification Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-colors duration-200 group ${
          sidebarCollapsed 
            ? 'hover:bg-gray-100 text-gray-600'
            : 'hover:bg-white/10 text-white'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell size={20} className={sidebarCollapsed 
          ? 'text-gray-600 group-hover:text-[#273155] transition-colors'
          : 'text-white group-hover:text-blue-200 transition-colors'
        } />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}

        {/* Pulse Animation */}
        {unreadCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ opacity: 0.3 }}
          />
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notificações</h3>
                  {unreadCount > 0 && (
                    <motion.button
                      onClick={markAllAsRead}
                      className="text-sm text-[#273155] hover:text-[#1e2442] font-medium transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Marcar todas como lidas
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification, index) => {
                  const Icon = getIcon(notification.type)
                  const iconColor = getIconColor(notification.type)
                  
                  return (
                    <motion.div
                      key={notification.id}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => markAsRead(notification.id)}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <motion.div
                          className={`p-2 rounded-lg bg-gray-100 ${iconColor}`}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 ml-2">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.description}
                          </p>
                        </div>

                        {/* Unread Indicator */}
                        {!notification.isRead && (
                          <motion.div
                            className="w-2 h-2 bg-[#273155] rounded-full mt-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <motion.button
                  className="w-full text-sm text-[#273155] hover:text-[#1e2442] font-medium transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Ver todas as notificações
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
