'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter, 
  Settings,
  BarChart3,
  Bot,
  Brain,
  Zap,
  Users,
  MessageSquare,
  Activity,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  MoreVertical
} from 'lucide-react'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import AgentesList from './components/AgentesList'
import CriarAgenteModal from './components/CriarAgenteModal'
import EstatisticasAgentes from './components/EstatisticasAgentes'

export interface Agente {
  id: string
  nome: string
  nicho: string
  departamento: string
  lista: string[]
  kanban: string[]
  card: string[]
  chats: string[]
  prompt: string
  modelo: 'deepseek' | 'chatgpt' | 'qwen'
  regras: string[]
  status: 'ativado' | 'desativado'
  atendente: string[]
  usodetokens: number
  fluxograma_id: string[]
  created_at: string
  updated_at: string
}

const mockAgentes: Agente[] = [
  {
    id: '1',
    nome: 'AgentBot Delivery',
    nicho: 'delivery',
    departamento: 'comercial',
    lista: ['lista-1', 'lista-2'],
    kanban: ['kanban-1'],
    card: ['card-1', 'card-2'],
    chats: ['chat-1', 'chat-2', 'chat-3'],
    prompt: 'Você é um assistente especializado em delivery, focado em vendas e atendimento ao cliente.',
    modelo: 'chatgpt',
    regras: ['Sempre ser educado', 'Focar em vendas', 'Responder rapidamente'],
    status: 'ativado',
    atendente: ['atendente-1', 'atendente-2'],
    usodetokens: 15420,
    fluxograma_id: ['fluxo-1'],
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z'
  },
  {
    id: '2',
    nome: 'DentalBot Pro',
    nicho: 'odontologico',
    departamento: 'vendas',
    lista: ['lista-3'],
    kanban: ['kanban-2', 'kanban-3'],
    card: ['card-3'],
    chats: ['chat-4', 'chat-5'],
    prompt: 'Assistente especializado em clínicas odontológicas, focado em agendamentos e vendas de tratamentos.',
    modelo: 'deepseek',
    regras: ['Focar em agendamentos', 'Explicar tratamentos', 'Ser técnico mas acessível'],
    status: 'ativado',
    atendente: ['atendente-3'],
    usodetokens: 8750,
    fluxograma_id: ['fluxo-2', 'fluxo-3'],
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-18T16:20:00Z'
  },
  {
    id: '3',
    nome: 'ClinicAssist',
    nicho: 'clinicas',
    departamento: 'financeiro',
    lista: [],
    kanban: ['kanban-4'],
    card: ['card-4', 'card-5', 'card-6'],
    chats: ['chat-6'],
    prompt: 'Assistente para clínicas médicas, especializado em questões financeiras e cobrança.',
    modelo: 'qwen',
    regras: ['Ser discreto com informações financeiras', 'Focar em cobrança', 'Manter profissionalismo'],
    status: 'desativado',
    atendente: ['atendente-4', 'atendente-5'],
    usodetokens: 3200,
    fluxograma_id: [],
    created_at: '2024-01-05T11:00:00Z',
    updated_at: '2024-01-12T13:30:00Z'
  }
]

export default function AgentesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'agentes' | 'estatisticas'>('agentes')
  const [selectedNicho, setSelectedNicho] = useState<string>('')
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativado' | 'desativado'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [agentes, setAgentes] = useState<Agente[]>(mockAgentes)

  const filteredAgentes = agentes.filter(agente => {
    const matchesSearch = agente.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agente.nicho.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agente.departamento.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesNicho = !selectedNicho || agente.nicho === selectedNicho
    const matchesDepartamento = !selectedDepartamento || agente.departamento === selectedDepartamento
    const matchesStatus = statusFilter === 'all' || agente.status === statusFilter
    
    return matchesSearch && matchesNicho && matchesDepartamento && matchesStatus
  })

  const nichos = Array.from(new Set(agentes.map(a => a.nicho)))
  const departamentos = Array.from(new Set(agentes.map(a => a.departamento)))

  const tabs = [
    { id: 'agentes', label: 'Agentes IA', icon: Bot, count: agentes.length },
    { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3, count: null }
  ]

  const handleCreateAgente = (novoAgente: Omit<Agente, 'id' | 'created_at' | 'updated_at'>) => {
    const agente: Agente = {
      ...novoAgente,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setAgentes(prev => [agente, ...prev])
  }

  const handleToggleStatus = (id: string) => {
    setAgentes(prev => prev.map(agente => 
      agente.id === id 
        ? { ...agente, status: agente.status === 'ativado' ? 'desativado' : 'ativado' }
        : agente
    ))
  }

  const handleDeleteAgente = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agente?')) {
      setAgentes(prev => prev.filter(agente => agente.id !== id))
    }
  }

  const handleDuplicateAgente = (id: string) => {
    const agente = agentes.find(a => a.id === id)
    if (agente) {
      const duplicated: Agente = {
        ...agente,
        id: Date.now().toString(),
        nome: `${agente.nome} (Cópia)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setAgentes(prev => [duplicated, ...prev])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AtendimentosTopBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                Agentes de IA
              </h1>
              <p className="text-gray-600 mt-1">
                Crie e gerencie seus assistentes inteligentes personalizados
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab === 'agentes' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Novo Agente
                </motion.button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total de Agentes</p>
                  <p className="text-2xl font-bold text-gray-900">{agentes.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Agentes Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {agentes.filter(a => a.status === 'ativado').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tokens Usados</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {agentes.reduce((total, a) => total + a.usodetokens, 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Conversas Ativas</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {agentes.reduce((total, a) => total + a.chats.length, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-[#305e73] shadow-lg border border-[#305e73]/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-[#305e73] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Filters - Only show for agentes tab */}
          {activeTab === 'agentes' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-4 flex-wrap">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar agentes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Nicho Filter */}
                <div className="min-w-[180px]">
                  <select
                    value={selectedNicho}
                    onChange={(e) => setSelectedNicho(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Todos os nichos</option>
                    {nichos.map(nicho => (
                      <option key={nicho} value={nicho}>
                        {nicho.charAt(0).toUpperCase() + nicho.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Departamento Filter */}
                <div className="min-w-[180px]">
                  <select
                    value={selectedDepartamento}
                    onChange={(e) => setSelectedDepartamento(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Todos os departamentos</option>
                    {departamentos.map(dept => (
                      <option key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  {[
                    { value: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-700' },
                    { value: 'ativado', label: 'Ativos', color: 'bg-green-100 text-green-700' },
                    { value: 'desativado', label: 'Inativos', color: 'bg-red-100 text-red-700' }
                  ].map((status) => (
                    <motion.button
                      key={status.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStatusFilter(status.value as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        statusFilter === status.value
                          ? status.color
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {status.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'agentes' && (
            <motion.div
              key="agentes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AgentesList
                agentes={filteredAgentes}
                onEdit={(agente) => {
                  // TODO: Implement edit modal
                  console.log('Edit agente:', agente)
                }}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteAgente}
                onDuplicate={handleDuplicateAgente}
                onView={(agente) => {
                  // TODO: Implement view modal
                  console.log('View agente:', agente)
                }}
              />
            </motion.div>
          )}

          {activeTab === 'estatisticas' && (
            <motion.div
              key="estatisticas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <EstatisticasAgentes agentes={agentes} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <CriarAgenteModal
          onClose={() => setShowCreateModal(false)}
          onSave={(agente) => {
            handleCreateAgente(agente)
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}
