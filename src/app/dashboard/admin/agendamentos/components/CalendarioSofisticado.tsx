'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  Coffee,
  Star,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Plus
} from 'lucide-react'

interface Agendamento {
  id: string
  titulo: string
  descricao?: string
  data: string
  hora_inicio: string
  hora_fim: string
  tipo: 'reuniao' | 'ligacao' | 'video' | 'presencial' | 'coffee'
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido'
  prioridade: 'baixa' | 'media' | 'alta'
  contato: {
    id: string
    nome: string
    telefone?: string
    email?: string
    avatar?: string
    empresa?: string
  }
  local?: string
  link_video?: string
  observacoes?: string
  lembrete?: number
  cor?: string
}

interface Contato {
  id: string
  nome: string
  telefone?: string
  email?: string
  empresa?: string
  avatar?: string
}

interface CalendarioSofisticadoProps {
  agendamentos: Agendamento[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
  viewMode: 'month' | 'week' | 'day'
  onAgendamentoClick: (agendamento: Agendamento) => void
  contatos: Contato[]
}

export default function CalendarioSofisticado({
  agendamentos,
  selectedDate,
  onDateSelect,
  viewMode,
  onAgendamentoClick,
  contatos
}: CalendarioSofisticadoProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const tipoIcons = {
    reuniao: Users,
    ligacao: Phone,
    video: Video,
    presencial: MapPin,
    coffee: Coffee
  }

  const statusColors = {
    agendado: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    confirmado: 'bg-green-100 border-green-300 text-green-800',
    cancelado: 'bg-red-100 border-red-300 text-red-800',
    concluido: 'bg-blue-100 border-blue-300 text-blue-800'
  }

  const prioridadeColors = {
    baixa: 'border-l-green-400',
    media: 'border-l-yellow-400',
    alta: 'border-l-red-400'
  }

  // Gerar dias do mês
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Dias do mês anterior
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
        isToday: false
      })
    }

    // Dias do mês atual
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day)
      days.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday: dayDate.toDateString() === today.toDateString()
      })
    }

    // Dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false
      })
    }

    return days
  }

  // Navegar entre meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // Obter agendamentos para uma data específica
  const getAgendamentosForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return agendamentos.filter(ag => ag.data === dateString)
  }

  // Renderizar agendamento
  const renderAgendamento = (agendamento: Agendamento, isCompact = false) => {
    const TipoIcon = tipoIcons[agendamento.tipo]
    
    return (
      <motion.div
        key={agendamento.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={() => onAgendamentoClick(agendamento)}
        className={`
          relative p-2 rounded-lg border-l-4 cursor-pointer transition-all duration-200
          ${statusColors[agendamento.status]}
          ${prioridadeColors[agendamento.prioridade]}
          hover:shadow-md group
          ${isCompact ? 'mb-1' : 'mb-2'}
        `}
        style={{ 
          backgroundColor: agendamento.cor ? `${agendamento.cor}15` : undefined,
          borderLeftColor: agendamento.cor || undefined
        }}
      >
        <div className="flex items-start gap-2">
          {/* Avatar do contato */}
          <div className="flex-shrink-0">
            {agendamento.contato.avatar ? (
              <img
                src={agendamento.contato.avatar}
                alt={agendamento.contato.nome}
                className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {agendamento.contato.nome.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <TipoIcon className="w-3 h-3 text-gray-600" />
              <span className="text-xs font-medium text-gray-700 truncate">
                {agendamento.titulo}
              </span>
              {agendamento.prioridade === 'alta' && (
                <AlertTriangle className="w-3 h-3 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3 h-3" />
              <span>{agendamento.hora_inicio}</span>
              {!isCompact && (
                <span className="text-gray-500">
                  • {agendamento.contato.nome}
                </span>
              )}
            </div>

            {!isCompact && agendamento.local && (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{agendamento.local}</span>
              </div>
            )}
          </div>

          {/* Status indicator */}
          <div className="flex-shrink-0">
            {agendamento.status === 'confirmado' && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            {agendamento.status === 'cancelado' && (
              <div className="w-4 h-4 bg-red-500 rounded-full" />
            )}
          </div>
        </div>

        {/* Hover overlay com mais detalhes */}
        <div className="absolute inset-0 bg-black/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    )
  }

  const days = getDaysInMonth(currentDate)

  if (viewMode === 'month') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header do Calendário */}
        <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigateMonth('prev')}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">
                  {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <p className="text-white/80 text-sm">
                  {agendamentos.length} agendamentos este mês
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigateMonth('next')}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
            >
              Hoje
            </motion.button>
          </div>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {diasSemana.map((dia) => (
            <div key={dia} className="p-4 text-center">
              <span className="text-sm font-semibold text-gray-700">{dia}</span>
            </div>
          ))}
        </div>

        {/* Grade do Calendário */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateString = day.date.toISOString().split('T')[0]
            const dayAgendamentos = getAgendamentosForDate(day.date)
            const isSelected = selectedDate.toDateString() === day.date.toDateString()
            const isHovered = hoveredDate === dateString

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={() => onDateSelect(day.date)}
                onMouseEnter={() => setHoveredDate(dateString)}
                onMouseLeave={() => setHoveredDate(null)}
                className={`
                  min-h-[120px] p-2 border-r border-b border-gray-100 cursor-pointer transition-all duration-200
                  ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50'}
                  ${day.isToday ? 'bg-blue-50 border-blue-200' : ''}
                  ${isSelected ? 'bg-[#305e73]/10 border-[#305e73]/30' : ''}
                  ${isHovered ? 'shadow-lg' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`
                    text-sm font-medium
                    ${day.isToday ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}
                    ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                  `}>
                    {day.date.getDate()}
                  </span>
                  
                  {dayAgendamentos.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#305e73] rounded-full" />
                      <span className="text-xs text-gray-500">{dayAgendamentos.length}</span>
                    </div>
                  )}
                </div>

                {/* Agendamentos do dia */}
                <div className="space-y-1">
                  {dayAgendamentos.slice(0, 3).map((agendamento) => (
                    renderAgendamento(agendamento, true)
                  ))}
                  
                  {dayAgendamentos.length > 3 && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-xs text-gray-500 text-center py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      +{dayAgendamentos.length - 3} mais
                    </motion.div>
                  )}
                </div>

                {/* Indicadores de contatos frequentes */}
                {day.isCurrentMonth && dayAgendamentos.length === 0 && (
                  <div className="mt-2">
                    {contatos.slice(0, 2).map((contato, idx) => (
                      <motion.div
                        key={contato.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 0.3 : 0 }}
                        className="flex items-center gap-1 mb-1"
                      >
                        {contato.avatar ? (
                          <img
                            src={contato.avatar}
                            alt={contato.nome}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-4 h-4 bg-gray-300 rounded-full" />
                        )}
                        <span className="text-xs text-gray-400 truncate">
                          {contato.nome.split(' ')[0]}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-600">Confirmado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-xs text-gray-600">Agendado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-xs text-gray-600">Cancelado</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span className="text-xs text-gray-600">Alta Prioridade</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Clique em uma data para ver detalhes • Clique em um agendamento para editar
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Views de semana e dia seriam implementadas aqui
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="text-center text-gray-500">
        View mode "{viewMode}" em desenvolvimento...
      </div>
    </div>
  )
}
