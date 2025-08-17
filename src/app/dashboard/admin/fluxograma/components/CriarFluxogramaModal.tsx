'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Workflow, 
  Tag, 
  FileText, 
  Folder,
  Zap,
  Users,
  ShoppingCart,
  Heart,
  Headphones,
  Building,
  Sparkles
} from 'lucide-react'
import { Fluxograma } from '../page'

interface CriarFluxogramaModalProps {
  onClose: () => void
  onSave: (fluxograma: Omit<Fluxograma, 'id' | 'created_at' | 'updated_at' | 'execucoes'>) => void
}

const categorias = [
  { id: 'delivery', label: 'Delivery', icon: ShoppingCart, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'vendas', label: 'Vendas', icon: Zap, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'saude', label: 'Saúde', icon: Heart, color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'suporte', label: 'Suporte', icon: Headphones, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'imobiliario', label: 'Imobiliário', icon: Building, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 'geral', label: 'Geral', icon: Sparkles, color: 'bg-gray-100 text-gray-700 border-gray-200' }
]

const statusOptions = [
  { id: 'rascunho', label: 'Rascunho', description: 'Fluxograma em desenvolvimento' },
  { id: 'ativo', label: 'Ativo', description: 'Fluxograma funcionando' },
  { id: 'inativo', label: 'Inativo', description: 'Fluxograma pausado' }
]

const templates = [
  {
    id: 'blank',
    nome: 'Fluxograma em Branco',
    descricao: 'Comece do zero com um fluxograma vazio',
    categoria: 'geral',
    nodes: [],
    edges: []
  },
  {
    id: 'atendimento-basico',
    nome: 'Atendimento Básico',
    descricao: 'Template para atendimento inicial com IA e transferência',
    categoria: 'suporte',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Nova Mensagem', config: { trigger: 'message_received' }, icon: '💬', color: '#10b981' }
      },
      {
        id: '2',
        type: 'ia',
        position: { x: 350, y: 100 },
        data: { label: 'IA Atendimento', config: { agente_id: null }, icon: '🤖', color: '#3b82f6' }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true }
    ]
  },
  {
    id: 'delivery-completo',
    nome: 'Delivery Completo',
    descricao: 'Fluxo completo para delivery com cardápio, pedido e pagamento',
    categoria: 'delivery',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Nova Mensagem', config: { trigger: 'message_received' }, icon: '💬', color: '#10b981' }
      },
      {
        id: '2',
        type: 'resposta',
        position: { x: 300, y: 100 },
        data: { label: 'Cardápio', config: { resposta_id: null }, icon: '📋', color: '#3b82f6' }
      },
      {
        id: '3',
        type: 'kanban',
        position: { x: 500, y: 100 },
        data: { label: 'Criar Pedido', config: { kanban_id: null, coluna: 'novo' }, icon: '📋', color: '#f97316' }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true }
    ]
  }
]

export default function CriarFluxogramaModal({ onClose, onSave }: CriarFluxogramaModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'template'>('info')
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: 'geral',
    status: 'rascunho' as 'ativo' | 'inativo' | 'rascunho',
    tags: [] as string[]
  })
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) return

    const novoFluxograma: Omit<Fluxograma, 'id' | 'created_at' | 'updated_at' | 'execucoes'> = {
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim(),
      categoria: formData.categoria,
      status: formData.status,
      tags: formData.tags,
      nodes: selectedTemplate.nodes.map((node: any) => ({
        ...node,
        type: node.type as 'trigger' | 'condition' | 'action' | 'kanban' | 'atendente' | 'resposta' | 'agendamento' | 'ia' | 'delay'
      })),
      edges: selectedTemplate.edges
    }

    onSave(novoFluxograma)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-lg flex items-center justify-center">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Novo Fluxograma</h2>
                <p className="text-gray-600 text-sm">Crie um fluxograma de automação</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'info'
                  ? 'text-[#305e73] border-b-2 border-[#305e73] bg-[#305e73]/5'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Informações Básicas
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'template'
                  ? 'text-[#305e73] border-b-2 border-[#305e73] bg-[#305e73]/5'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Folder className="w-4 h-4 inline mr-2" />
              Template Inicial
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col h-[calc(90vh-180px)]">
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Fluxograma *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Atendimento Delivery"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva o que este fluxograma faz..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Categoria
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categorias.map((categoria) => {
                        const Icon = categoria.icon
                        return (
                          <motion.button
                            key={categoria.id}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData(prev => ({ ...prev, categoria: categoria.id }))}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              formData.categoria === categoria.id
                                ? categoria.color + ' border-current'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">{categoria.label}</div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Status Inicial
                    </label>
                    <div className="space-y-2">
                      {statusOptions.map((status) => (
                        <label
                          key={status.id}
                          className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status.id}
                            checked={formData.status === status.id}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                            className="w-4 h-4 text-[#305e73] focus:ring-[#305e73] border-gray-300"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{status.label}</div>
                            <div className="text-xs text-gray-600">{status.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#305e73]/10 text-[#305e73] rounded-full text-sm"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-[#305e73]/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite uma tag e pressione Enter"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-[#305e73] text-white rounded-lg hover:bg-[#305e73]/90 transition-colors text-sm"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'template' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Escolha um Template
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      Selecione um template para começar ou crie do zero
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTemplate.id === template.id
                            ? 'border-[#305e73] bg-[#305e73]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            selectedTemplate.id === template.id ? 'bg-[#305e73]' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {template.nome}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                              {template.descricao}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{template.nodes.length} elementos</span>
                              <span>•</span>
                              <span>{template.edges.length} conexões</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formData.nome.trim()}
                className="px-6 py-2 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar Fluxograma
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
