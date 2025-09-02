'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Globe, ChevronDown } from 'lucide-react'

interface GlassClockProps {
  sidebarCollapsed: boolean
}

const timezones = [
  { name: 'São Paulo', value: 'America/Sao_Paulo', flag: '🇧🇷' },
  { name: 'New York', value: 'America/New_York', flag: '🇺🇸' },
  { name: 'London', value: 'Europe/London', flag: '🇬🇧' },
  { name: 'Tokyo', value: 'Asia/Tokyo', flag: '🇯🇵' },
  { name: 'Dubai', value: 'Asia/Dubai', flag: '🇦🇪' },
  { name: 'Sydney', value: 'Australia/Sydney', flag: '🇦🇺' },
  { name: 'Paris', value: 'Europe/Paris', flag: '🇫🇷' },
  { name: 'Los Angeles', value: 'America/Los_Angeles', flag: '🇺🇸' },
]

export function GlassClock({ sidebarCollapsed }: GlassClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTimezone, setSelectedTimezone] = useState('America/Sao_Paulo')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Atualiza a cada minuto

    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date, timezone: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
      hour12: false
    }).format(date)
  }

  const formatDate = (date: Date, timezone: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      timeZone: timezone
    }).format(date)
  }

  const getCurrentTimezone = () => {
    return timezones.find(tz => tz.value === selectedTimezone) || timezones[0]
  }

  return (
    <div className="relative">
      <motion.div
        className={`
          relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300
          ${sidebarCollapsed 
            ? 'bg-white/20 border border-gray-200/30 hover:bg-white/30' 
            : 'bg-white/10 border border-white/20 hover:bg-white/20'
          }
          backdrop-blur-md shadow-lg hover:shadow-xl
          px-4 py-2.5 min-w-[140px]
        `}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Glass Morphism Background Effects */}
        <div className="absolute inset-0">
          <div className={`
            absolute top-0 left-0 w-full h-full
            ${sidebarCollapsed 
              ? 'bg-gradient-to-br from-white/30 via-transparent to-blue-100/20' 
              : 'bg-gradient-to-br from-white/20 via-transparent to-blue-200/10'
            }
          `} />
          <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-6 h-6 bg-blue-200/30 rounded-full blur-lg" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <Clock size={16} className={`
              ${sidebarCollapsed ? 'text-gray-700' : 'text-white/90'}
            `} />
          </motion.div>
          
          <div className="flex items-center gap-2">
            <div className="text-center">
              <motion.div 
                className={`
                  font-mono text-lg font-bold tracking-wider leading-none
                  ${sidebarCollapsed ? 'text-gray-800' : 'text-white'}
                `}
                key={formatTime(currentTime, selectedTimezone)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {formatTime(currentTime, selectedTimezone)}
              </motion.div>
              <motion.div 
                className={`
                  text-xs font-medium leading-none mt-0.5
                  ${sidebarCollapsed ? 'text-gray-600' : 'text-white/70'}
                `}
                key={formatDate(currentTime, selectedTimezone)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {formatDate(currentTime, selectedTimezone)}
              </motion.div>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <span className="text-base">
                {getCurrentTimezone().flag}
              </span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={12} className={`
                  ${sidebarCollapsed ? 'text-gray-600' : 'text-white/70'}
                `} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Pulse Effect */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(59, 130, 246, 0)',
              '0 0 0 4px rgba(59, 130, 246, 0.1)',
              '0 0 0 0 rgba(59, 130, 246, 0)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Timezone Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDropdownOpen(false)}
            />
            
            <motion.div
              className={`
                absolute right-0 top-full mt-2 z-50 min-w-[200px]
                ${sidebarCollapsed 
                  ? 'bg-white/95 border border-gray-200/50' 
                  : 'bg-gray-900/95 border border-white/20'
                }
                backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden
              `}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-2">
                <div className={`
                  flex items-center gap-2 px-3 py-2 mb-2 rounded-lg
                  ${sidebarCollapsed ? 'bg-gray-100/50' : 'bg-white/10'}
                `}>
                  <Globe size={14} className={`
                    ${sidebarCollapsed ? 'text-gray-600' : 'text-white/70'}
                  `} />
                  <span className={`
                    text-xs font-medium
                    ${sidebarCollapsed ? 'text-gray-700' : 'text-white/90'}
                  `}>
                    Selecionar Fuso Horário
                  </span>
                </div>
                
                {timezones.map((timezone) => (
                  <motion.button
                    key={timezone.value}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200 text-left
                      ${selectedTimezone === timezone.value
                        ? sidebarCollapsed 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-blue-500/20 text-blue-300'
                        : sidebarCollapsed
                          ? 'hover:bg-gray-100 text-gray-700'
                          : 'hover:bg-white/10 text-white/90'
                      }
                    `}
                    onClick={() => {
                      setSelectedTimezone(timezone.value)
                      setIsDropdownOpen(false)
                    }}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm">{timezone.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{timezone.name}</div>
                      <div className={`
                        text-xs
                        ${selectedTimezone === timezone.value
                          ? sidebarCollapsed ? 'text-blue-600' : 'text-blue-200'
                          : sidebarCollapsed ? 'text-gray-500' : 'text-white/60'
                        }
                      `}>
                        {formatTime(currentTime, timezone.value)}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
