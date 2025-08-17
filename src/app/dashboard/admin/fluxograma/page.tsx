'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Settings,
  BarChart3,
  GitBranch,
  Zap,
  Save,
  Play,
  Pause,
  Copy,
  Trash2,
  Eye,
  Edit,
  Download,
  Upload,
  Layers,
  Bot,
  Users,
  MessageSquare,
  Calendar,
  Target,
  Activity,
  Workflow
} from 'lucide-react'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import FluxogramaCanvas from './components/FluxogramaCanvas'
import FluxogramasList from './components/FluxogramasList'
import CriarFluxogramaModal from './components/CriarFluxogramaModal'
import ElementsPalette from './components/ElementsPalette'
import FluxogramaStats from './components/FluxogramaStats'

export interface FluxogramaNode {
  id: string
  type: 'trigger' | 'condition' | 'action' | 'kanban' | 'atendente' | 'resposta' | 'agendamento' | 'ia' | 'delay'
  position: { x: number; y: number }
  data: {
    label: string
    config: any
    description?: string
    icon?: string
    color?: string
  }
}

export interface FluxogramaEdge {
  id: string
  source: string
  target: string
  label?: string
  type?: string
  animated?: boolean
}

export interface Fluxograma {
  id: string
  nome: string
  descricao: string
  status: 'ativo' | 'inativo' | 'rascunho'
  nodes: FluxogramaNode[]
  edges: FluxogramaEdge[]
  execucoes: number
  created_at: string
  updated_at: string
  categoria: string
  tags: string[]
}

const mockFluxogramas: Fluxograma[] = [
  {
    id: '1',
    nome: 'Atendimento Delivery',
    descricao: 'Fluxo completo de atendimento para delivery com IA e transferência para atendente',
    status: 'ativo',
    categoria: 'delivery',
    tags: ['delivery', 'ia', 'atendimento'],
    execucoes: 1250,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Nova Mensagem',
          config: { trigger: 'message_received' },
          icon: '💬',
          color: '#10b981'
        }
      },
      {
        id: '2',
        type: 'ia',
        position: { x: 300, y: 100 },
        data: {
          label: 'IA Delivery',
          config: { agente_id: 'agente-1' },
          icon: '🤖',
          color: '#3b82f6'
        }
      },
      {
        id: '3',
        type: 'condition',
        position: { x: 500, y: 100 },
        data: {
          label: 'Precisa Humano?',
          config: { condition: 'needs_human' },
          icon: '❓',
          color: '#f59e0b'
        }
      },
      {
        id: '4',
        type: 'atendente',
        position: { x: 700, y: 50 },
        data: {
          label: 'Transferir Atendente',
          config: { departamento: 'vendas' },
          icon: '👤',
          color: '#8b5cf6'
        }
      },
      {
        id: '5',
        type: 'kanban',
        position: { x: 700, y: 150 },
        data: {
          label: 'Criar Card Pedido',
          config: { kanban_id: 'pedidos', coluna: 'novo' },
          icon: '📋',
          color: '#ef4444'
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', label: 'Sim', animated: true },
      { id: 'e3-5', source: '3', target: '5', label: 'Não', animated: true }
    ]
  },
  {
    id: '2',
    nome: 'Qualificação de Leads',
    descricao: 'Fluxo de qualificação automática de leads com pontuação e distribuição',
    status: 'ativo',
    categoria: 'vendas',
    tags: ['leads', 'qualificacao', 'vendas'],
    execucoes: 850,
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-18T16:20:00Z',
    nodes: [],
    edges: []
  },
  {
    id: '3',
    nome: 'Agendamento Consultas',
    descricao: 'Automação completa para agendamento de consultas médicas',
    status: 'rascunho',
    categoria: 'saude',
    tags: ['agendamento', 'consultas', 'saude'],
    execucoes: 0,
    created_at: '2024-01-05T11:00:00Z',
    updated_at: '2024-01-12T13:30:00Z',
    nodes: [],
    edges: []
  }
]

export default function FluxogramaPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'canvas' | 'lista' | 'estatisticas'>('canvas')
  const [selectedFluxograma, setSelectedFluxograma] = useState<Fluxograma | null>(mockFluxogramas[0])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [fluxogramas, setFluxogramas] = useState<Fluxograma[]>(mockFluxogramas)
  const [showPalette, setShowPalette] = useState(true)

  const filteredFluxogramas = fluxogramas.filter(fluxograma => {
    return fluxograma.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
           fluxograma.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
           fluxograma.categoria.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const tabs = [
    { id: 'canvas', label: 'Editor Visual', icon: GitBranch, count: null },
    { id: 'lista', label: 'Meus Fluxogramas', icon: Layers, count: fluxogramas.length },
    { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3, count: null }
  ]

  const handleCreateFluxograma = (novoFluxograma: Omit<Fluxograma, 'id' | 'created_at' | 'updated_at' | 'execucoes'>) => {
    const fluxograma: Fluxograma = {
      ...novoFluxograma,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execucoes: 0
    }
    setFluxogramas(prev => [fluxograma, ...prev])
    setSelectedFluxograma(fluxograma)
    setActiveTab('canvas')
  }

  const handleSaveFluxograma = useCallback(() => {
    if (selectedFluxograma) {
      setFluxogramas(prev => prev.map(f => 
        f.id === selectedFluxograma.id 
          ? { ...selectedFluxograma, updated_at: new Date().toISOString() }
          : f
      ))
    }
  }, [selectedFluxograma])

  const handleToggleStatus = (id: string) => {
    setFluxogramas(prev => prev.map(f => 
      f.id === id 
        ? { ...f, status: f.status === 'ativo' ? 'inativo' : 'ativo' }
        : f
    ))
  }

  const handleDeleteFluxograma = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fluxograma?')) {
      setFluxogramas(prev => prev.filter(f => f.id !== id))
      if (selectedFluxograma?.id === id) {
        setSelectedFluxograma(fluxogramas[0] || null)
      }
    }
  }

  const handleDuplicateFluxograma = (id: string) => {
    const fluxograma = fluxogramas.find(f => f.id === id)
    if (fluxograma) {
      const duplicated: Fluxograma = {
        ...fluxograma,
        id: Date.now().toString(),
        nome: `${fluxograma.nome} (Cópia)`,
        status: 'rascunho',
        execucoes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setFluxogramas(prev => [duplicated, ...prev])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AtendimentosTopBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Elements Palette */}
        {activeTab === 'canvas' && showPalette && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-80 bg-white border-r border-gray-200 shadow-lg"
          >
            <ElementsPalette />
          </motion.div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-xl flex items-center justify-center">
                  <Workflow className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {activeTab === 'canvas' && selectedFluxograma 
                      ? selectedFluxograma.nome 
                      : 'Fluxogramas de Automação'
                    }
                  </h1>
                  <p className="text-gray-600">
                    {activeTab === 'canvas' && selectedFluxograma
                      ? selectedFluxograma.descricao
                      : 'Crie e gerencie fluxos de automação inteligentes'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {activeTab === 'canvas' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowPalette(!showPalette)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        showPalette 
                          ? 'bg-[#305e73] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveFluxograma}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Salvar
                    </motion.button>
                  </>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Novo Fluxograma
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-[#305e73] text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== null && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Canvas Controls */}
            {activeTab === 'canvas' && selectedFluxograma && (
              <div className="flex items-center gap-4 mt-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedFluxograma.status === 'ativo' ? 'bg-green-500 animate-pulse' : 
                    selectedFluxograma.status === 'inativo' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {selectedFluxograma.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="w-4 h-4" />
                  {selectedFluxograma.execucoes.toLocaleString()} execuções
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  {selectedFluxograma.nodes.length} elementos
                </div>
                
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => handleToggleStatus(selectedFluxograma.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      selectedFluxograma.status === 'ativo'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {selectedFluxograma.status === 'ativo' ? (
                      <>
                        <Pause className="w-3 h-3 inline mr-1" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 inline mr-1" />
                        Ativar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {activeTab === 'canvas' && (
                <motion.div
                  key="canvas"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <FluxogramaCanvas
                    fluxograma={selectedFluxograma}
                    onFluxogramaChange={setSelectedFluxograma}
                  />
                </motion.div>
              )}

              {activeTab === 'lista' && (
                <motion.div
                  key="lista"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-6 h-full overflow-y-auto"
                >
                  <FluxogramasList
                    fluxogramas={filteredFluxogramas}
                    onEdit={(fluxograma) => {
                      setSelectedFluxograma(fluxograma)
                      setActiveTab('canvas')
                    }}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteFluxograma}
                    onDuplicate={handleDuplicateFluxograma}
                    onView={(fluxograma) => {
                      setSelectedFluxograma(fluxograma)
                      setActiveTab('canvas')
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
                  className="p-6 h-full overflow-y-auto"
                >
                  <FluxogramaStats fluxogramas={fluxogramas} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <CriarFluxogramaModal
          onClose={() => setShowCreateModal(false)}
          onSave={(fluxograma) => {
            handleCreateFluxograma(fluxograma)
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}
