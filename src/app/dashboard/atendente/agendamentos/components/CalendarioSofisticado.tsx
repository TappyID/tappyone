'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Phone,
  User,
  MapPin,
  ExternalLink,
  Briefcase,
  Heart,
  Users,
  Coffee,
  Video,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

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
  onAgendamentoMove?: (agendamentoId: string, newDate: string) => Promise<void>
  contatos: Contato[]
}


export default function CalendarioSofisticado({
  agendamentos,
  selectedDate,
  onDateSelect,
  viewMode,
  onAgendamentoClick,
  onAgendamentoMove,
  contatos
}: CalendarioSofisticadoProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const { theme } = useTheme()

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
    agendado: theme === 'dark' 
      ? 'bg-yellow-900/30 border-yellow-600/50 text-yellow-300' 
      : 'bg-yellow-100 border-yellow-300 text-yellow-800',
    confirmado: theme === 'dark' 
      ? 'bg-green-900/30 border-green-600/50 text-green-300' 
      : 'bg-green-100 border-green-300 text-green-800',
    cancelado: theme === 'dark' 
      ? 'bg-red-900/30 border-red-600/50 text-red-300' 
      : 'bg-red-100 border-red-300 text-red-800',
    concluido: theme === 'dark' 
      ? 'bg-blue-900/30 border-blue-600/50 text-blue-300' 
      : 'bg-blue-100 border-blue-300 text-blue-800'
  }

  const prioridadeColors = {
    baixa: 'border-l-green-400',
    media: 'border-l-yellow-400',
    alta: 'border-l-red-400'
  }

  // Função para determinar cor do dot baseada no status dominante
  const getStatusDotColor = (agendamentos: Agendamento[]) => {
    if (agendamentos.length === 0) return 'bg-[#305e73]'
    
    // Contar status
    const statusCount = agendamentos.reduce((acc, ag) => {
      acc[ag.status] = (acc[ag.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Encontrar status dominante
    const dominantStatus = Object.entries(statusCount)
      .sort(([,a], [,b]) => b - a)[0][0] as keyof typeof statusColors
    
    // Mapear para cores dos dots
    const dotColors = {
      agendado: 'bg-yellow-500',
      confirmado: 'bg-green-500', 
      cancelado: 'bg-red-500',
      concluido: 'bg-blue-500'
    }
    
    return dotColors[dominantStatus] || 'bg-[#305e73]'
  }

  // Função para obter cor da borda baseada no status
  const getStatusBorderColor = (status: string) => {
    const borderColors = {
      agendado: '#eab308', // yellow-500
      confirmado: '#10b981', // green-500
      cancelado: '#ef4444', // red-500
      concluido: '#3b82f6' // blue-500
    }
    return borderColors[status as keyof typeof borderColors] || '#305e73'
  }

  // Função para mover agendamento
  const moveAgendamento = async (agendamentoId: string, newDate: Date) => {
    const dateString = newDate.toISOString().split('T')[0]
    
    // Encontrar agendamento e atualizar data
    const agendamento = agendamentos.find(ag => ag.id === agendamentoId)
    if (agendamento && onAgendamentoMove) {
      await onAgendamentoMove(agendamentoId, dateString)
    }
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
        isToday: false,
        onClick: () => {
          const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
          setCurrentMonth(newDate)
        }
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
    const newDate = new Date(currentMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentMonth(newDate)
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
      <div
        key={agendamento.id}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onAgendamentoClick(agendamento)
        }}
        draggable
        onDragStart={(e: React.DragEvent) => {
          e.stopPropagation()
          e.dataTransfer.setData('agendamento-id', agendamento.id)
          e.dataTransfer.effectAllowed = 'move'
          // Adicionar dados extras para debug
          e.dataTransfer.setData('text/plain', agendamento.titulo)
        }}
        className={`
          relative p-2 rounded-lg border-l-4 cursor-pointer transition-all duration-200
          ${statusColors[agendamento.status]}
          hover:shadow-md hover:scale-105 group transform
          ${isCompact ? 'mb-1' : 'mb-2'}
          ${theme === 'dark' ? 'backdrop-blur-sm border-white/10' : ''}
        `}
        style={{ 
          backgroundColor: agendamento.cor ? `${agendamento.cor}15` : undefined,
          borderLeftColor: getStatusBorderColor(agendamento.status)
        }}
      >
        <div className="flex items-start gap-2">
          {/* Avatar do contato */}
          <div className="flex-shrink-0">
            {agendamento.contato.avatar ? (
              <img
                src={agendamento.contato.avatar}
                alt={agendamento.contato?.nome || 'Contato'}
                className="w-6 h-6 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {agendamento.contato?.nome?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <TipoIcon className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`text-xs font-medium truncate ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                {agendamento.titulo}
              </span>
              {agendamento.prioridade === 'alta' && (
                <AlertTriangle className="w-3 h-3 text-red-500" />
              )}
            </div>
            
            <div className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <Clock className="w-3 h-3" />
              <span>{agendamento.hora_inicio}</span>
              {!isCompact && (
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  • {agendamento.contato?.nome || 'Contato não encontrado'}
                </span>
              )}
            </div>

            {!isCompact && agendamento.local && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
        <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
          theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
        }`} />
      </div>
    )
  }

  const days = getDaysInMonth(currentMonth)

  if (viewMode === 'month') {
    return (
      <div 
        className="rounded-2xl shadow-sm border overflow-hidden"
        style={{
          background: theme === 'dark' 
            ? 'rgba(31, 41, 55, 0.3)' 
            : 'white',
          borderColor: theme === 'dark' 
            ? 'rgba(75, 85, 99, 0.3)' 
            : 'rgb(229, 231, 235)',
          backdropFilter: theme === 'dark' ? 'blur(10px)' : undefined
        }}
      >
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
                <h2 className="text-xl font-bold text-white">{meses[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
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
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
            >
              Hoje
            </motion.button>
          </div>
        </div>

        {/* Dias da Semana */}
        <div 
          className="grid grid-cols-7 border-b"
          style={{
            borderColor: theme === 'dark' 
              ? 'rgba(75, 85, 99, 0.3)' 
              : 'rgb(229, 231, 235)'
          }}
        >
          {diasSemana.map((dia) => (
            <div key={dia} className="p-4 text-center">
              <span className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>{dia}</span>
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
              <div
                key={index}
                className={`
                  min-h-[120px] p-2 border-r border-b cursor-pointer transition-all duration-200
                  ${!day.isCurrentMonth 
                    ? theme === 'dark' 
                      ? 'bg-gray-800/20 text-gray-500' 
                      : 'bg-gray-50 text-gray-400'
                    : theme === 'dark'
                      ? 'text-gray-100'
                      : 'bg-white text-gray-900'
                  }
                  ${day.isToday 
                    ? theme === 'dark'
                      ? 'bg-blue-900/30 border-blue-600/50'
                      : 'bg-blue-50 border-blue-200'
                    : ''
                  }
                  ${isHovered 
                    ? theme === 'dark'
                      ? 'bg-blue-800/30 ring-2 ring-blue-600/50'
                      : 'bg-blue-100 ring-2 ring-blue-300'
                    : ''
                  }
                  relative
                `}
                style={{
                  borderColor: theme === 'dark' 
                    ? 'rgba(75, 85, 99, 0.2)' 
                    : 'rgb(243, 244, 246)',
                  background: !day.isCurrentMonth && theme === 'dark'
                    ? 'rgba(55, 65, 81, 0.1)'
                    : day.isCurrentMonth && theme === 'dark'
                      ? 'rgba(31, 41, 55, 0.2)'
                      : undefined
                }}
              >
                {/* Drop zone overlay - cobre toda a área */}
                <div
                  onClick={() => onDateSelect(day.date)}
                  onMouseEnter={() => setHoveredDate(dateString)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onDragOver={(e: React.DragEvent) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.dataTransfer.dropEffect = 'move'
                    setHoveredDate(dateString)
                  }}
                  onDragLeave={(e: React.DragEvent) => {
                    // Só remove hover se saiu da div inteira
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setHoveredDate(null)
                    }
                  }}
                  onDrop={async (e: React.DragEvent) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const agendamentoId = e.dataTransfer.getData('agendamento-id')
                    console.log('🎯 DROP NA DATA:', dateString, agendamentoId)
                    
                    if (agendamentoId && onAgendamentoMove) {
                      try {
                        await moveAgendamento(agendamentoId, day.date)
                        console.log('✅ Agendamento movido com sucesso!')
                      } catch (error) {
                        console.error('❌ Erro ao mover:', error)
                      }
                    }
                    setHoveredDate(null)
                  }}
                  className="absolute inset-0 z-10"
                />
                
                <div className="flex items-center justify-between mb-2 relative z-20">
                  <span className={`
                    text-sm font-medium
                    ${day.isToday ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : ''}
                    ${!day.isCurrentMonth 
                      ? theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      : theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                    }
                  `}>
                    {day.date.getDate()}
                  </span>
                  
                  {dayAgendamentos.length > 0 && (
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusDotColor(dayAgendamentos)}`} />
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>{dayAgendamentos.length}</span>
                    </div>
                  )}
                </div>

                {/* Agendamentos do dia */}
                <div className="space-y-1 relative z-20">
                  {dayAgendamentos.slice(0, 3).map((agendamento) => (
                    renderAgendamento(agendamento, true)
                  ))}
                  
                  {dayAgendamentos.length > 3 && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`text-xs text-center py-1 rounded cursor-pointer transition-colors ${
                        theme === 'dark'
                          ? 'text-gray-400 bg-gray-700/30 hover:bg-gray-600/40'
                          : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                      }`}
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
                          <div className={`w-4 h-4 rounded-full ${
                            theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                          }`} />
                        )}
                        <span className={`text-xs truncate ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {contato.nome.split(' ')[0]}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legenda */}
        <div 
          className="px-6 py-4 border-t"
          style={{
            background: theme === 'dark' 
              ? 'rgba(55, 65, 81, 0.2)' 
              : 'rgb(249, 250, 251)',
            borderColor: theme === 'dark' 
              ? 'rgba(75, 85, 99, 0.3)' 
              : 'rgb(229, 231, 235)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Confirmado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Agendado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Cancelado</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Alta Prioridade</span>
              </div>
            </div>
            
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Clique em uma data para ver detalhes • Clique em um agendamento para editar
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Views de semana e dia seriam implementadas aqui
  return (
    <div 
      className="rounded-2xl shadow-sm border p-6"
      style={{
        background: theme === 'dark' 
          ? 'rgba(31, 41, 55, 0.3)' 
          : 'white',
        borderColor: theme === 'dark' 
          ? 'rgba(75, 85, 99, 0.3)' 
          : 'rgb(229, 231, 235)',
        backdropFilter: theme === 'dark' ? 'blur(10px)' : undefined
      }}
    >
      <div className={`text-center ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        View mode "{viewMode}" em desenvolvimento...
      </div>
    </div>
  )
}
