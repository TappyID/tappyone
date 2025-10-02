'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Info, CheckCircle, AlertCircle, Star } from 'lucide-react'

interface MessageEventProps {
  eventType: 'calendar' | 'group' | 'info' | 'success' | 'warning' | 'star'
  title: string
  description?: string
  timestamp?: number
  metadata?: {
    participants?: string[]
    location?: string
    date?: string
    url?: string
  }
}

export default function MessageEvent({
  eventType,
  title,
  description,
  timestamp,
  metadata
}: MessageEventProps) {

  const getEventIcon = () => {
    switch (eventType) {
      case 'calendar': return <Calendar className="w-5 h-5" />
      case 'group': return <Users className="w-5 h-5" />
      case 'success': return <CheckCircle className="w-5 h-5" />
      case 'warning': return <AlertCircle className="w-5 h-5" />
      case 'star': return <Star className="w-5 h-5" />
      default: return <Info className="w-5 h-5" />
    }
  }

  const getEventColor = () => {
    switch (eventType) {
      case 'calendar': return 'from-blue-500 to-indigo-600'
      case 'group': return 'from-green-500 to-emerald-600'
      case 'success': return 'from-emerald-500 to-green-600'
      case 'warning': return 'from-yellow-500 to-orange-600'
      case 'star': return 'from-purple-500 to-pink-600'
      default: return 'from-gray-500 to-slate-600'
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex justify-center my-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md"
      >
        <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600">

          {/* Header do evento */}
          <div className={`bg-gradient-to-r ${getEventColor()} p-4 text-white`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {getEventIcon()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{title}</h3>
                {timestamp && (
                  <p className="text-sm opacity-90">
                    {formatDate(timestamp)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo do evento */}
          <div className="p-4 space-y-3">
            {description && (
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {description}
              </p>
            )}

            {/* Metadados */}
            {metadata && (
              <div className="space-y-2">
                {metadata.date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{metadata.date}</span>
                  </div>
                )}

                {metadata.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Info className="w-4 h-4" />
                    <span>{metadata.location}</span>
                  </div>
                )}

                {metadata.participants && metadata.participants.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{metadata.participants.length} participantes</span>
                  </div>
                )}

                {metadata.url && (
                  <a
                    href={metadata.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Ver Detalhes
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
