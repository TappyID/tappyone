'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Send, ChevronLeft, ChevronRight } from 'lucide-react'

interface ScheduleRespostaModalProps {
  isOpen: boolean
  onClose: () => void
  respostaTitulo: string
  chatId?: string
  onConfirm: (data: { chatId: string; date: string; time: string }) => void
}

export default function ScheduleRespostaModal({
  isOpen,
  onClose,
  respostaTitulo,
  chatId,
  onConfirm
}: ScheduleRespostaModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [customTime, setCustomTime] = useState<string>('')
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Gerar dias do mês
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const days = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateClick = (date: Date | null) => {
    if (!date) return
    const dateWithoutTime = new Date(date)
    dateWithoutTime.setHours(0, 0, 0, 0)
    
    if (dateWithoutTime < today) return // Não permitir datas passadas
    setSelectedDate(date)
  }

  const handleConfirm = () => {
    const finalTime = useCustomTime ? customTime : selectedTime
    
    if (!selectedDate || !finalTime) {
      alert('❌ Selecione data e horário!')
      return
    }

    const dateStr = selectedDate.toISOString().split('T')[0]
    onConfirm({
      chatId: chatId || '',
      date: dateStr,
      time: finalTime
    })
  }

  // Horários disponíveis (de 8h às 20h)
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8
    return [`${hour.toString().padStart(2, '0')}:00`, `${hour.toString().padStart(2, '0')}:30`]
  }).flat()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">📅 Agendar Resposta</h2>
                <p className="text-purple-100 mt-1">{respostaTitulo}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calendário */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="font-semibold capitalize">{monthName}</h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do mês */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} />
                  }

                  const dayWithoutTime = new Date(day)
                  dayWithoutTime.setHours(0, 0, 0, 0)
                  const isPast = dayWithoutTime < today
                  const isSelected = selectedDate?.toDateString() === day.toDateString()
                  const isToday = dayWithoutTime.getTime() === today.getTime()

                  return (
                    <motion.button
                      key={index}
                      whileHover={!isPast ? { scale: 1.1 } : {}}
                      whileTap={!isPast ? { scale: 0.95 } : {}}
                      onClick={() => handleDateClick(day)}
                      disabled={isPast}
                      className={`
                        aspect-square rounded-lg text-sm font-medium transition-all
                        ${isPast ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : ''}
                        ${isSelected ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg' : ''}
                        ${!isSelected && !isPast ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
                        ${isToday && !isSelected ? 'ring-2 ring-purple-500' : ''}
                      `}
                    >
                      {day.getDate()}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Horários */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Selecione o horário
              </h3>

              {/* Toggle entre horários rápidos e personalizado */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setUseCustomTime(false)
                    setCustomTime('')
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    !useCustomTime
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Horários Rápidos
                </button>
                <button
                  onClick={() => {
                    setUseCustomTime(true)
                    setSelectedTime('')
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    useCustomTime
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Personalizado
                </button>
              </div>

              {useCustomTime ? (
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Digite o horário (HH:MM)</label>
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-2">
                  {timeSlots.map(time => (
                    <motion.button
                      key={time}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTime(time)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${selectedTime === time 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg' 
                          : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      {time}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedDate && (selectedTime || customTime) ? (
                <span className="font-medium">
                  📅 {selectedDate.toLocaleDateString('pt-BR')} às {useCustomTime ? customTime : selectedTime}
                </span>
              ) : (
                <span>Selecione data e horário</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConfirm}
                disabled={!selectedDate || (!selectedTime && !customTime)}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                  ${selectedDate && (selectedTime || customTime)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                <Send className="w-4 h-4" />
                Agendar
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
