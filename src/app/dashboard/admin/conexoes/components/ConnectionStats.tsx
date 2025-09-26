'use client'

import { motion } from 'framer-motion'
import { Zap, Link as LinkIcon, Activity, Clock } from 'lucide-react'

interface ConnectionStatsProps {
  activeConnections: number
  totalConnections: number
  totalChats: number
  totalGroups: number
  totalFilas: number
  loading?: boolean
}

export function ConnectionStats({ 
  activeConnections, 
  totalConnections, 
  totalChats, 
  totalGroups, 
  totalFilas,
  loading = false 
}: ConnectionStatsProps) {
  const stats = [
    {
      icon: LinkIcon,
      label: 'Conexões Ativas',
      value: loading ? '...' : activeConnections,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Zap,
      label: 'Total de Filas',
      value: loading ? '...' : totalFilas,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Activity,
      label: 'Chats WhatsApp',
      value: loading ? '...' : totalChats,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Clock,
      label: 'Grupos WhatsApp',
      value: loading ? '...' : totalGroups,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1,
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          whileHover={{ 
            scale: 1.02, 
            y: -2,
            transition: { duration: 0.2 }
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div>
            <motion.div
              className="text-2xl font-bold text-gray-900 dark:text-white mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              {stat.value}
            </motion.div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </div>

          {/* Progress bar for visual appeal */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ 
                duration: 1,
                delay: index * 0.1 + 0.5,
                ease: "easeOut"
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
