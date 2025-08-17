'use client'

import { motion } from 'framer-motion'
import { 
  Zap, 
  GitBranch, 
  Play, 
  Users, 
  MessageSquare, 
  Calendar, 
  Bot, 
  Clock,
  Layers,
  Target,
  Settings,
  Activity,
  ArrowRight,
  Plus,
  Search
} from 'lucide-react'
import { useState } from 'react'

interface ElementType {
  type: string
  label: string
  description: string
  icon: React.ComponentType<any>
  color: string
  category: 'trigger' | 'logic' | 'action' | 'integration'
  config: any
}

const elements: ElementType[] = [
  // Triggers
  {
    type: 'trigger',
    label: 'Nova Mensagem',
    description: 'Inicia o fluxo quando uma nova mensagem é recebida',
    icon: MessageSquare,
    color: '#10b981',
    category: 'trigger',
    config: { trigger: 'message_received' }
  },
  {
    type: 'trigger',
    label: 'Palavra-chave',
    description: 'Ativa quando uma palavra específica é detectada',
    icon: Zap,
    color: '#f59e0b',
    category: 'trigger',
    config: { trigger: 'keyword', keywords: [] }
  },
  {
    type: 'trigger',
    label: 'Horário',
    description: 'Executa em horários programados',
    icon: Clock,
    color: '#8b5cf6',
    category: 'trigger',
    config: { trigger: 'schedule', time: '09:00' }
  },

  // Logic
  {
    type: 'condition',
    label: 'Condição',
    description: 'Avalia condições e direciona o fluxo',
    icon: GitBranch,
    color: '#f59e0b',
    category: 'logic',
    config: { condition: 'custom', rules: [] }
  },
  {
    type: 'delay',
    label: 'Aguardar',
    description: 'Pausa o fluxo por um tempo determinado',
    icon: Clock,
    color: '#6b7280',
    category: 'logic',
    config: { delay: 5, unit: 'seconds' }
  },

  // Actions
  {
    type: 'resposta',
    label: 'Resposta Rápida',
    description: 'Envia uma resposta pré-definida',
    icon: MessageSquare,
    color: '#3b82f6',
    category: 'action',
    config: { resposta_id: null, texto: '' }
  },
  {
    type: 'ia',
    label: 'Resposta IA',
    description: 'Gera resposta usando inteligência artificial',
    icon: Bot,
    color: '#8b5cf6',
    category: 'action',
    config: { agente_id: null, prompt: '' }
  },
  {
    type: 'atendente',
    label: 'Transferir Atendente',
    description: 'Transfere a conversa para um atendente humano',
    icon: Users,
    color: '#ef4444',
    category: 'action',
    config: { departamento: 'geral', atendente_id: null }
  },

  // Integrations
  {
    type: 'kanban',
    label: 'Criar Card',
    description: 'Cria um card no quadro Kanban',
    icon: Layers,
    color: '#f97316',
    category: 'integration',
    config: { kanban_id: null, coluna: 'novo', titulo: '', descricao: '' }
  },
  {
    type: 'agendamento',
    label: 'Agendar',
    description: 'Cria um agendamento no calendário',
    icon: Calendar,
    color: '#06b6d4',
    category: 'integration',
    config: { tipo: 'consulta', data: null, horario: null }
  },
  {
    type: 'action',
    label: 'Webhook',
    description: 'Chama uma API externa',
    icon: Activity,
    color: '#84cc16',
    category: 'integration',
    config: { url: '', method: 'POST', headers: {}, body: {} }
  }
]

const categories = [
  { id: 'trigger', label: 'Gatilhos', icon: Zap, color: 'text-green-600' },
  { id: 'logic', label: 'Lógica', icon: GitBranch, color: 'text-yellow-600' },
  { id: 'action', label: 'Ações', icon: Play, color: 'text-blue-600' },
  { id: 'integration', label: 'Integrações', icon: Settings, color: 'text-purple-600' }
]

export default function ElementsPalette() {
  const [selectedCategory, setSelectedCategory] = useState<string>('trigger')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredElements = elements.filter(element => {
    const matchesCategory = element.category === selectedCategory
    const matchesSearch = element.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         element.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.setData('application/nodedata', JSON.stringify(nodeData))
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Elementos</h3>
            <p className="text-xs text-gray-600">Arraste para o canvas</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar elementos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedCategory === category.id
                    ? 'border-[#305e73] bg-[#305e73]/10 text-[#305e73]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${
                  selectedCategory === category.id ? 'text-[#305e73]' : category.color
                }`} />
                <div className="text-xs font-medium">{category.label}</div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Elements List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredElements.map((element, index) => {
            const Icon = element.icon
            return (
              <motion.div
                key={`${element.type}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                draggable
                onDragStart={(e) => onDragStart(e, element.type, {
                  label: element.label,
                  icon: element.icon,
                  color: element.color,
                  config: element.config
                })}
                className="group p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#305e73] hover:bg-[#305e73]/5 transition-all cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${element.color}20` }}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: element.color }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm group-hover:text-[#305e73] transition-colors">
                      {element.label}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {element.description}
                    </p>
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#305e73] transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredElements.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Nenhum elemento encontrado</p>
            <p className="text-gray-500 text-sm">Tente buscar por outro termo</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#305e73] rounded-full"></div>
            <span>Arraste elementos para o canvas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#305e73] rounded-full"></div>
            <span>Conecte elementos para criar fluxos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#305e73] rounded-full"></div>
            <span>Clique duplo para configurar</span>
          </div>
        </div>
      </div>
    </div>
  )
}
