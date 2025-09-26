'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { AdminLayout } from '../components/AdminLayout'
import { useTheme } from '@/contexts/ThemeContext'
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
import UniversalAgendamentoModal, { type AgendamentoData as UniversalAgendamentoData } from '@/components/shared/UniversalAgendamentoModal'

interface AgendamentoBackend {
  id: string
  titulo: string
  descricao?: string
  inicioEm: string
  fimEm: string
  linkMeeting?: string
  status: 'AGENDADO' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO'
  usuarioId: string
  contatoId: string
  contato?: {
    id: string
    nome: string
    numeroTelefone?: string
    email?: string
    avatar?: string
    empresa?: string
    cpf?: string
    cnpj?: string
    cep?: string
    rua?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
    pais?: string
  }
}

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
    numeroTelefone?: string
    telefone?: string
    email?: string
    avatar?: string
    empresa?: string
    cpf?: string
    cnpj?: string
    cep?: string
    rua?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
    pais?: string
  }
  local?: string
  link_video?: string
  observacoes?: string
  lembrete?: number
  cor?: string
}

export default function AgendamentosPage() {
  const { user, loading } = useAuth()
  const { actualTheme } = useTheme()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [showCriarModal, setShowCriarModal] = useState(false)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [contatos, setContatos] = useState<any[]>([])

  // Função para transformar agendamento do backend para frontend
  const transformAgendamento = (agendamento: AgendamentoBackend): Agendamento => {
    const inicioEm = new Date(agendamento.inicioEm)
    const fimEm = new Date(agendamento.fimEm)
    
    return {
      id: agendamento.id,
      titulo: agendamento.titulo,
      descricao: agendamento.descricao,
      data: inicioEm.toISOString().split('T')[0], // YYYY-MM-DD
      hora_inicio: inicioEm.toTimeString().slice(0, 5), // HH:MM
      hora_fim: fimEm.toTimeString().slice(0, 5), // HH:MM
      tipo: 'reuniao', // default
      status: agendamento.status.toLowerCase() as any,
      prioridade: 'media', // default
      contato: agendamento.contato ? {
        id: agendamento.contato.id,
        nome: agendamento.contato.nome,
        numeroTelefone: agendamento.contato.numeroTelefone,
        telefone: agendamento.contato.numeroTelefone,
        email: agendamento.contato.email,
        avatar: agendamento.contato.avatar,
        empresa: agendamento.contato.empresa,
        cpf: agendamento.contato.cpf,
        cnpj: agendamento.contato.cnpj,
        cep: agendamento.contato.cep,
        rua: agendamento.contato.rua,
        numero: agendamento.contato.numero,
        bairro: agendamento.contato.bairro,
        cidade: agendamento.contato.cidade,
        estado: agendamento.contato.estado,
        pais: agendamento.contato.pais
      } : {
        id: agendamento.contatoId,
        nome: 'Contato não encontrado',
        telefone: ''
      },
      link_video: agendamento.linkMeeting,
      cor: '#3b82f6' // default
    }
  }

  // Função para buscar agendamentos da API
  const fetchAgendamentos = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/agendamentos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Agendamentos recebidos:', data)
        const transformedData = (data || []).map(transformAgendamento)
        console.log('Agendamentos transformados:', transformedData)
        setAgendamentos(transformedData)
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Função para buscar contatos da API
  const fetchContatos = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/contatos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setContatos(data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    } else if (user && !loading) {
      fetchAgendamentos()
      fetchContatos()
    }
  }, [user, loading])

  if (loading || loadingData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        actualTheme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#305e73]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleCriarAgendamento = async (novoAgendamento: UniversalAgendamentoData) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Converter formato UniversalAgendamentoData para formato backend
      const backendData = {
        titulo: novoAgendamento.titulo,
        descricao: novoAgendamento.descricao,
        inicioEm: `${novoAgendamento.data}T${novoAgendamento.hora_inicio}:00`,
        fimEm: `${novoAgendamento.data}T${novoAgendamento.hora_fim}:00`,
        linkMeeting: novoAgendamento.link_video,
        status: novoAgendamento.status.toUpperCase(),
        contatoId: novoAgendamento.contato.id || `temp-${Date.now()}` // Se não tem ID, criar contato
      }

      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendData)
      })

      if (response.ok) {
        await fetchAgendamentos() // Recarregar lista
        setShowCriarModal(false)
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
    }
  }

  const handleEditarAgendamento = async (agendamentoEditado: Agendamento) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      console.log('🔥 Enviando para API:', JSON.stringify(agendamentoEditado, null, 2))

      const response = await fetch(`/api/agendamentos/${agendamentoEditado.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(agendamentoEditado)
      })

      if (response.ok) {
        console.log('✅ API retornou sucesso')
        // Backend agora salva corretamente, podemos recarregar
        await fetchAgendamentos()
      } else {
        console.error('❌ API retornou erro:', response.status)
      }
    } catch (error) {
      console.error('Erro ao editar agendamento:', error)
    }
  }

  const handleExcluirAgendamento = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`/api/agendamentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchAgendamentos() // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error)
    }
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
      <div className="min-h-screen p-6">
        <div 
          className="rounded-3xl shadow-sm border backdrop-blur-sm overflow-hidden"
          style={{
            background: actualTheme === 'dark' 
              ? 'rgba(31, 41, 55, 0.3)' 
              : 'rgba(255, 255, 255, 0.9)',
            borderColor: actualTheme === 'dark' 
              ? 'rgba(75, 85, 99, 0.3)' 
              : 'rgb(229, 231, 235)',
            backdropFilter: actualTheme === 'dark' ? 'blur(10px)' : undefined
          }}
        >
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-xl flex items-center justify-center shadow-lg">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>Agenda</h1>
                  <p className={`${
                    actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                  }`}>Gerenciar reuniões</p>
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
                      className={`pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                        actualTheme === 'dark'
                          ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                      actualTheme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600/50 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
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
                    className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                      actualTheme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600/50 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {statusAgendamento.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className={`flex items-center rounded-lg p-1 ${
                  actualTheme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100'
                }`}>
                  {['month', 'week', 'day'].map((mode) => (
                    <motion.button
                      key={mode}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setViewMode(mode as any)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === mode
                          ? actualTheme === 'dark'
                            ? 'bg-slate-600 text-white shadow-sm'
                            : 'bg-white text-[#305e73] shadow-sm'
                          : actualTheme === 'dark'
                            ? 'text-white/70 hover:text-white'
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {mode === 'month' ? 'Mês' : mode === 'week' ? 'Semana' : 'Dia'}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCriarModal(true)}
                  className={`relative flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-500 group overflow-hidden ${
                    actualTheme === 'dark'
                      ? 'text-white'
                      : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl shadow-lg hover:shadow-xl'
                  }`}
                  style={actualTheme === 'dark' ? {
                    background: 'linear-gradient(135deg, rgba(48, 94, 115, 0.8) 0%, rgba(58, 109, 132, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px -12px rgba(48, 94, 115, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  } : {}}
                >
                  {/* Glass effect layers for dark mode */}
                  {actualTheme === 'dark' && (
                    <>
                      {/* Base glass layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-2xl" />
                      
                      {/* Blue accent layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 rounded-2xl" />
                      
                      {/* Light reflection */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                      
                      {/* Animated border glow */}
                      <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                    </>
                  )}
                  
                  <Plus className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Novo Agendamento</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="px-6 pb-6 pt-6">
          <CalendarioSofisticado
            agendamentos={agendamentosFiltrados}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            viewMode={viewMode}
            onAgendamentoClick={handleAgendamentoClick}
            onAgendamentoMove={async (agendamentoId: string, newDate: string) => {
              const agendamento = agendamentos.find(a => a.id === agendamentoId)
              if (!agendamento) return

              // Manter as horas originais, só mudar a data
              const updatedAgendamento = {
                ...agendamento,
                data: newDate
              }

              // Atualizar localmente primeiro (otimistic update)
              setAgendamentos(prev => prev.map(a => 
                a.id === agendamentoId 
                  ? updatedAgendamento 
                  : a
              ))

              try {
                await handleEditarAgendamento(updatedAgendamento)
                console.log('Backend confirmou a mudança')
              } catch (error) {
                console.error('Erro no backend, revertendo:', error)
                // Reverter se falhar
                await fetchAgendamentos()
              }
            }}
            contatos={contatos}
          />
          </div>

          {/* Stats */}
          <div className="px-6 py-6">
            <AgendamentoStats agendamentos={agendamentos} />
          </div>
        </div>

        {/* Modais */}
        <UniversalAgendamentoModal
          isOpen={showCriarModal}
          onClose={() => setShowCriarModal(false)}
          onSave={handleCriarAgendamento}
          contatos={contatos}
          selectedDate={selectedDate}
          mode="create"
        />

        <UniversalAgendamentoModal
          isOpen={showDetalhesModal}
          onClose={() => setShowDetalhesModal(false)}
          editData={selectedAgendamento ? {
            id: selectedAgendamento.id,
            titulo: selectedAgendamento.titulo,
            descricao: selectedAgendamento.descricao || '',
            data: selectedAgendamento.data,
            hora_inicio: selectedAgendamento.hora_inicio,
            hora_fim: selectedAgendamento.hora_fim,
            tipo: selectedAgendamento.tipo || 'reuniao',
            status: selectedAgendamento.status,
            prioridade: selectedAgendamento.prioridade || 'media',
            contato: {
              id: selectedAgendamento.contato?.id || '',
              nome: selectedAgendamento.contato?.nome || '',
              telefone: selectedAgendamento.contato?.numeroTelefone || '',
              email: selectedAgendamento.contato?.email || '',
              empresa: selectedAgendamento.contato?.empresa || '',
              cpf: selectedAgendamento.contato?.cpf || '',
              cnpj: selectedAgendamento.contato?.cnpj || '',
              cep: selectedAgendamento.contato?.cep || '',
              endereco: '',
              bairro: selectedAgendamento.contato?.bairro || '',
              rua: selectedAgendamento.contato?.rua || '',
              numero: selectedAgendamento.contato?.numero || '',
              estado: selectedAgendamento.contato?.estado || '',
              cidade: selectedAgendamento.contato?.cidade || '',
              pais: selectedAgendamento.contato?.pais || 'Brasil',
              tags: []
            },
            local: selectedAgendamento.local || '',
            link_video: selectedAgendamento.link_video || '',
            observacoes: selectedAgendamento.observacoes || '',
            lembrete: selectedAgendamento.lembrete || 15,
            cor: selectedAgendamento.cor || '#3b82f6'
          } : undefined}
          mode="view"
          onStatusChange={async (status) => {
            if (selectedAgendamento) {
              try {
                await handleEditarAgendamento({
                  ...selectedAgendamento,
                  status
                })
                console.log('Status atualizado para:', status)
                // Fechar modal após atualização bem-sucedida
                setShowDetalhesModal(false)
              } catch (error) {
                console.error('Erro ao atualizar status:', error)
              }
            }
          }}
          onEdit={() => {
            setShowDetalhesModal(false)
            setShowCriarModal(true)
          }}
          onDelete={async () => {
            if (selectedAgendamento) {
              await handleExcluirAgendamento(selectedAgendamento.id)
              setShowDetalhesModal(false)
            }
          }}
          onShare={() => {
            if (selectedAgendamento) {
              const shareText = `Agendamento: ${selectedAgendamento.titulo}\nData: ${selectedAgendamento.data} ${selectedAgendamento.hora_inicio}-${selectedAgendamento.hora_fim}\nContato: ${selectedAgendamento.contato.nome}`
              navigator.clipboard.writeText(shareText)
              alert('Informações do agendamento copiadas!')
            }
          }}
          onSave={async () => {}} // Não usado em modo view
        />
      </div>
    </AdminLayout>
  )
}
