'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Globe, ChevronDown } from 'lucide-react'

interface GlassClockProps {}

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

export function GlassClock() {
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
        className="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm shadow-sm hover:shadow-lg p-3 min-w-[140px] h-10"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Glass Morphism Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 via-transparent to-blue-200/10" />
          <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-6 h-6 bg-blue-200/30 rounded-full blur-lg" />
        </div>

        <div className="relative z-10 flex items-center gap-2 h-full">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            <Clock size={18} className="text-white/90" />
          </motion.div>
          
          <div className="flex items-center gap-2">
            <motion.div 
              className="font-mono text-base font-bold tracking-wider leading-none text-white"
              key={formatTime(currentTime, selectedTimezone)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {formatTime(currentTime, selectedTimezone)}
            </motion.div>

            <div className="flex items-center gap-1 ml-1">
              <span className="text-sm">
                {getCurrentTimezone().flag}
              </span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} className="text-white/70" />
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
              className="absolute right-0 top-full mt-2 z-50 min-w-[200px] bg-gray-900/95 border border-white/20 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-2">
                <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-white/10">
                  <Globe size={14} className="text-white/70" />
                  <span className="text-xs font-medium text-white/90">
                    Selecionar Fuso Horário
                  </span>
                </div>
                
                {timezones.map((timezone) => (
                  <motion.button
                    key={timezone.value}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${
                      selectedTimezone === timezone.value
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'hover:bg-white/10 text-white/90'
                    }`}
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
                      <div className={`text-xs ${
                        selectedTimezone === timezone.value
                          ? 'text-blue-200'
                          : 'text-white/60'
                      }`}>
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
