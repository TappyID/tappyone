'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { WhatsAppConnection } from './WhatsAppConnection'
import { SocialConnection } from './SocialConnection'
import { MessageCircle, Facebook, Instagram, Linkedin, Mail, Phone } from 'lucide-react'

interface ConnectionsGridProps {
  onConnectionChange: (active: number, total: number) => void
}

export function ConnectionsGrid({ onConnectionChange }: ConnectionsGridProps) {
  const [connections, setConnections] = useState([
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Conecte sua conta do WhatsApp Business para atendimento automatizado',
      icon: MessageCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      isActive: false,
      isConnected: false,
      type: 'whatsapp'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      description: 'Integre com Facebook Messenger e páginas comerciais',
      icon: Facebook,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      isActive: false,
      isConnected: false,
      type: 'social',
      comingSoon: true
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Conecte com Instagram Direct e Instagram Business',
      icon: Instagram,
      color: 'from-pink-500 to-purple-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
      isActive: false,
      isConnected: false,
      type: 'social',
      comingSoon: true
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Integração com LinkedIn para networking profissional',
      icon: Linkedin,
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      isActive: false,
      isConnected: false,
      type: 'social',
      comingSoon: true
    },
    {
      id: 'email',
      name: 'Email Marketing',
      description: 'Conecte com provedores de email para campanhas automatizadas',
      icon: Mail,
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      isActive: false,
      isConnected: false,
      type: 'social',
      comingSoon: true
    },
    {
      id: 'sms',
      name: 'SMS',
      description: 'Envie SMS automatizados e campanhas via SMS',
      icon: Phone,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      isActive: false,
      isConnected: false,
      type: 'social',
      comingSoon: true
    }
  ])

  useEffect(() => {
    const active = connections.filter(conn => conn.isActive).length
    const total = connections.length
    onConnectionChange(active, total)
  }, [connections, onConnectionChange])

  const updateConnection = (id: string, updates: any) => {
    setConnections(prev => prev.map(conn => 
      conn.id === id ? { ...conn, ...updates } : conn
    ))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Plataformas Disponíveis
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {connections.filter(c => c.isConnected).length} de {connections.length} conectadas
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {connections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            {connection.type === 'whatsapp' ? (
              <WhatsAppConnection
                onUpdate={(updates) => updateConnection(connection.id, updates)}
              />
            ) : (
              <SocialConnection
                connection={connection}
                onUpdate={(updates) => updateConnection(connection.id, updates)}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
