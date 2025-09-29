'use client'

import { motion } from 'framer-motion'
import { Clock, UserCheck, CheckCircle, User } from 'lucide-react'

interface StatusBadgeProps {
  status: 'aguardando' | 'atendimento' | 'finalizado'
  responsavel?: string
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md'
}

const statusConfig = {
  aguardando: {
    label: 'Aguardando',
    color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
    icon: Clock,
    pulse: true
  },
  atendimento: {
    label: 'Em Atendimento',
    color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
    icon: UserCheck,
    pulse: false
  },
  finalizado: {
    label: 'Finalizado',
    color: 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400',
    icon: CheckCircle,
    pulse: false
  }
}

export function StatusBadge({ 
  status, 
  responsavel, 
  className = '', 
  showIcon = true,
  size = 'sm'
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Badge Principal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          inline-flex items-center gap-1.5 rounded-full font-medium
          ${config.color}
          ${sizeClasses[size]}
          ${config.pulse ? 'animate-pulse' : ''}
          ${className}
        `}
      >
        {showIcon && <Icon className={iconSizes[size]} />}
        <span>{config.label}</span>
      </motion.div>

      {/* Badge do Responsável */}
      {responsavel && status === 'atendimento' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`
            inline-flex items-center gap-1 rounded-full
            bg-indigo-100 dark:bg-indigo-900/20 
            text-indigo-800 dark:text-indigo-300
            ${sizeClasses[size]}
          `}
        >
          <User className={iconSizes[size]} />
          <span className="truncate max-w-[80px]">
            {responsavel}
          </span>
        </motion.div>
      )}
    </div>
  )
}
