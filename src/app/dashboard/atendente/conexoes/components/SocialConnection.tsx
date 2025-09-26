'use client'

import { motion } from 'framer-motion'
import { Clock, Lock, Sparkles } from 'lucide-react'

interface SocialConnectionProps {
  connection: any
  onUpdate: (updates: any) => void
}

export function SocialConnection({ connection, onUpdate }: SocialConnectionProps) {
  return (
    <motion.div
      className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border-2 ${connection.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Coming Soon Badge */}
      {connection.comingSoon && (
        <div className="absolute top-4 right-4">
          <motion.div
            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-3 h-3" />
            Em Breve
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${connection.bgColor} relative`}>
          <connection.icon className={`w-8 h-8 ${
            connection.id === 'facebook' ? 'text-blue-600 dark:text-blue-400' :
            connection.id === 'instagram' ? 'text-pink-600 dark:text-pink-400' :
            connection.id === 'linkedin' ? 'text-blue-700 dark:text-blue-400' :
            connection.id === 'email' ? 'text-gray-600 dark:text-gray-400' :
            'text-orange-600 dark:text-orange-400'
          }`} />
          
          {/* Overlay for disabled state */}
          <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-700/50 rounded-xl flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-500" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {connection.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {connection.description}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Não disponível
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Esta integração estará disponível em breve
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Desenvolvimento</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">75%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${connection.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: '75%' }}
            transition={{ 
              duration: 2,
              ease: "easeOut"
            }}
          />
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl cursor-not-allowed"
        disabled
      >
        <Clock className="w-4 h-4" />
        Em Desenvolvimento
      </motion.button>

      {/* Features Preview */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
          Recursos planejados:
        </div>
        <div className="space-y-1">
          {connection.id === 'facebook' && (
            <>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full" />
                Messenger automático
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full" />
                Gestão de páginas
              </div>
            </>
          )}
          {connection.id === 'instagram' && (
            <>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <div className="w-1 h-1 bg-pink-500 rounded-full" />
                Instagram Direct
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <div className="w-1 h-1 bg-pink-500 rounded-full" />
                Stories automáticos
              </div>
            </>
          )}
          {connection.id === 'linkedin' && (
            <>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full" />
                Networking automático
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full" />
                Gestão de leads B2B
              </div>
            </>
          )}
          {connection.id === 'email' && (
            <>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <div className="w-1 h-1 bg-gray-500 rounded-full" />
                Campanhas automáticas
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <div className="w-1 h-1 bg-gray-500 rounded-full" />
                Segmentação avançada
              </div>
            </>
          )}
          {connection.id === 'sms' && (
            <>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <div className="w-1 h-1 bg-orange-500 rounded-full" />
                SMS em massa
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <div className="w-1 h-1 bg-orange-500 rounded-full" />
                Notificações automáticas
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
