'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '../components/AdminLayout'
import { 
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Phone,
  Video,
  Coffee,
  Briefcase,
  Star,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Bell,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react'
import CalendarioSofisticado from './components/CalendarioSofisticado'
import AgendamentoStats from './components/AgendamentoStats'
import CriarAgendamentoModal from './components/CriarAgendamentoModal'
import DetalhesAgendamentoModal from './components/DetalhesAgendamentoModal'

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
  lembrete?: number // minutos antes
  cor?: string
}

export default function AgendamentosPage() {
  const { user, loading } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [showCriarModal, setShowCriarModal] = useState(false)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  // Mock data para agendamentos
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([
    {
      id: '1',
      titulo: 'Reunião de Projeto',
      descricao: 'Discussão sobre o novo sistema de CRM',
      data: '2024-08-04',
      hora_inicio: '09:00',
      hora_fim: '10:30',
      tipo: 'reuniao',
      status: 'confirmado',
      prioridade: 'alta',
      contato: {
        id: '1',
        nome: 'João Silva',
        telefone: '(11) 99999-9999',
        email: 'joao@empresa.com',
        empresa: 'Tech Solutions',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      local: 'Sala de Reuniões A',
      observacoes: 'Trazer documentos do projeto',
      lembrete: 15,
      cor: '#3b82f6'
    },
    {
      id: '2',
      titulo: 'Call com Cliente',
      data: '2024-08-04',
      hora_inicio: '14:00',
      hora_fim: '15:00',
      tipo: 'video',
      status: 'agendado',
      prioridade: 'media',
      contato: {
        id: '2',
        nome: 'Maria Santos',
        telefone: '(11) 88888-8888',
        email: 'maria@startup.com',
        empresa: 'StartupX',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      link_video: 'https://meet.google.com/abc-def-ghi',
      lembrete: 10,
      cor: '#10b981'
    },
    {
      id: '3',
      titulo: 'Coffee Meeting',
      data: '2024-08-05',
      hora_inicio: '16:00',
      hora_fim: '17:00',
      tipo: 'coffee',
      status: 'agendado',
      prioridade: 'baixa',
      contato: {
        id: '3',
        nome: 'Pedro Costa',
        telefone: '(11) 77777-7777',
        email: 'pedro@agency.com',
        empresa: 'Creative Agency',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      local: 'Café Central',
      cor: '#f59e0b'
    },
    {
      id: '4',
      titulo: 'Apresentação de Proposta',
      data: '2024-08-06',
      hora_inicio: '10:00',
      hora_fim: '11:30',
      tipo: 'presencial',
      status: 'confirmado',
      prioridade: 'alta',
      contato: {
        id: '4',
        nome: 'Ana Oliveira',
        telefone: '(11) 66666-6666',
        email: 'ana@corporation.com',
        empresa: 'Big Corporation',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      local: 'Escritório do Cliente',
      observacoes: 'Levar apresentação impressa',
      lembrete: 30,
      cor: '#8b5cf6'
    },
    {
      id: '5',
      titulo: 'Follow-up Vendas',
      data: '2024-08-07',
      hora_inicio: '15:30',
      hora_fim: '16:00',
      tipo: 'ligacao',
      status: 'agendado',
      prioridade: 'media',
      contato: {
        id: '5',
        nome: 'Carlos Ferreira',
        telefone: '(11) 55555-5555',
        email: 'carlos@business.com',
        empresa: 'Business Solutions',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      },
      cor: '#ef4444'
    }
  ])

  // Mock data para contatos
  const contatos = [
    {
      id: '1',
      nome: 'João Silva',
      telefone: '(11) 99999-9999',
      email: 'joao@empresa.com',
      empresa: 'Tech Solutions',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      telefone: '(11) 88888-8888',
      email: 'maria@startup.com',
      empresa: 'StartupX',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      telefone: '(11) 77777-7777',
      email: 'pedro@agency.com',
      empresa: 'Creative Agency',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  ]

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#305e73]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleCriarAgendamento = (novoAgendamento: Omit<Agendamento, 'id'>) => {
    const agendamento: Agendamento = {
      ...novoAgendamento,
      id: Date.now().toString()
    }
    setAgendamentos(prev => [...prev, agendamento])
  }

  const handleEditarAgendamento = (agendamentoEditado: Agendamento) => {
    setAgendamentos(prev => 
      prev.map(ag => ag.id === agendamentoEditado.id ? agendamentoEditado : ag)
    )
  }

  const handleExcluirAgendamento = (id: string) => {
    setAgendamentos(prev => prev.filter(ag => ag.id !== id))
  }

  const handleAgendamentoClick = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento)
    setShowDetalhesModal(true)
  }

  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    const matchSearch = agendamento.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       agendamento.contato.nome.toLowerCase().includes(searchQuery.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || agendamento.tipo === filtroTipo
    const matchStatus = filtroStatus === 'todos' || agendamento.status === filtroStatus
    
    return matchSearch && matchTipo && matchStatus
  })

  const tiposAgendamento = [
    { value: 'todos', label: 'Todos os Tipos', icon: CalendarIcon },
    { value: 'reuniao', label: 'Reunião', icon: Users },
    { value: 'ligacao', label: 'Ligação', icon: Phone },
    { value: 'video', label: 'Videochamada', icon: Video },
    { value: 'presencial', label: 'Presencial', icon: MapPin },
    { value: 'coffee', label: 'Coffee Meeting', icon: Coffee }
  ]

  const statusAgendamento = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'agendado', label: 'Agendado' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'concluido', label: 'Concluído' }
  ]

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
                  <p className="text-gray-600">Gerencie seus compromissos e reuniões</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Filtros */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar agendamentos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                    />
                  </div>

                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                  >
                    {tiposAgendamento.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                  >
                    {statusAgendamento.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  {['month', 'week', 'day'].map((mode) => (
                    <motion.button
                      key={mode}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setViewMode(mode as any)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === mode
                          ? 'bg-white text-[#305e73] shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {mode === 'month' ? 'Mês' : mode === 'week' ? 'Semana' : 'Dia'}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCriarModal(true)}
                  className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Novo Agendamento
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-6">
          <AgendamentoStats agendamentos={agendamentos} />
        </div>

        {/* Calendar */}
        <div className="px-6 pb-6">
          <CalendarioSofisticado
            agendamentos={agendamentosFiltrados}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            viewMode={viewMode}
            onAgendamentoClick={handleAgendamentoClick}
            contatos={contatos}
          />
        </div>

        {/* Modals */}
        <CriarAgendamentoModal
          isOpen={showCriarModal}
          onClose={() => setShowCriarModal(false)}
          onSave={handleCriarAgendamento}
          contatos={contatos}
          selectedDate={selectedDate}
        />

        <DetalhesAgendamentoModal
          isOpen={showDetalhesModal}
          onClose={() => setShowDetalhesModal(false)}
          agendamento={selectedAgendamento}
          onEdit={handleEditarAgendamento}
          onDelete={handleExcluirAgendamento}
        />
      </div>
    </AdminLayout>
  )
}
