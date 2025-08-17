'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Bot, 
  Brain,
  Settings,
  MessageSquare,
  Users,
  Target,
  Activity,
  Layers,
  GitBranch,
  Plus,
  Trash2,
  Zap,
  Save
} from 'lucide-react'
import { useState } from 'react'
import { Agente } from '../page'

interface CriarAgenteModalProps {
  onClose: () => void
  onSave: (agente: Omit<Agente, 'id' | 'created_at' | 'updated_at'>) => void
}

const nichos = [
  { value: 'delivery', label: 'Delivery', icon: '🍕' },
  { value: 'odontologico', label: 'Odontológico', icon: '🦷' },
  { value: 'clinicas', label: 'Clínicas', icon: '🏥' },
  { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { value: 'imobiliario', label: 'Imobiliário', icon: '🏠' },
  { value: 'educacao', label: 'Educação', icon: '📚' },
  { value: 'beleza', label: 'Beleza', icon: '💄' },
  { value: 'fitness', label: 'Fitness', icon: '💪' }
]

const departamentos = [
  { value: 'vendas', label: 'Vendas', icon: Target },
  { value: 'comercial', label: 'Comercial', icon: Users },
  { value: 'financeiro', label: 'Financeiro', icon: Activity },
  { value: 'juridico', label: 'Jurídico', icon: Settings },
  { value: 'suporte', label: 'Suporte', icon: MessageSquare }
]

const modelos = [
  { 
    value: 'chatgpt', 
    label: 'ChatGPT', 
    icon: '🤖',
    description: 'Modelo versátil e conversacional',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  { 
    value: 'deepseek', 
    label: 'DeepSeek', 
    icon: '🧠',
    description: 'Especializado em raciocínio profundo',
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  { 
    value: 'qwen', 
    label: 'Qwen', 
    icon: '⚡',
    description: 'Rápido e eficiente',
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  }
]

export default function CriarAgenteModal({
  onClose,
  onSave
}: CriarAgenteModalProps) {
  const [activeTab, setActiveTab] = useState<'basico' | 'configuracao' | 'integracoes' | 'regras'>('basico')
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: '',
    nicho: '',
    departamento: '',
    prompt: '',
    modelo: 'chatgpt' as 'deepseek' | 'chatgpt' | 'qwen',
    status: 'ativado' as 'ativado' | 'desativado'
  })

  const [regras, setRegras] = useState<string[]>([''])
  const [integracoes, setIntegracoes] = useState({
    lista: [] as string[],
    kanban: [] as string[],
    card: [] as string[],
    chats: [] as string[],
    atendente: [] as string[],
    fluxograma_id: [] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório')
      return
    }

    if (!formData.nicho) {
      alert('Selecione um nicho')
      return
    }

    if (!formData.departamento) {
      alert('Selecione um departamento')
      return
    }

    if (!formData.prompt.trim()) {
      alert('Prompt é obrigatório')
      return
    }

    setLoading(true)
    try {
      const agente = {
        ...formData,
        ...integracoes,
        regras: regras.filter(r => r.trim()),
        usodetokens: 0
      }
      
      await onSave(agente)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar agente')
    } finally {
      setLoading(false)
    }
  }

  const addRegra = () => {
    setRegras(prev => [...prev, ''])
  }

  const removeRegra = (index: number) => {
    setRegras(prev => prev.filter((_, i) => i !== index))
  }

  const updateRegra = (index: number, value: string) => {
    setRegras(prev => prev.map((regra, i) => i === index ? value : regra))
  }

  const tabs = [
    { id: 'basico', label: 'Básico', icon: Bot },
    { id: 'configuracao', label: 'Configuração', icon: Settings },
    { id: 'integracoes', label: 'Integrações', icon: Layers },
    { id: 'regras', label: 'Regras', icon: Zap }
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Novo Agente de IA</h2>
                  <p className="text-white/80 text-sm">Configure seu assistente inteligente</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mt-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Básico Tab */}
              {activeTab === 'basico' && (
                <div className="space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Agente *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
                      placeholder="Ex: AgentBot Delivery, DentalBot Pro..."
                    />
                  </div>

                  {/* Nicho */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Nicho de Atuação *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {nichos.map((nicho) => (
                        <motion.button
                          key={nicho.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData(prev => ({ ...prev, nicho: nicho.value }))}
                          className={`p-4 rounded-xl border-2 transition-all text-center ${
                            formData.nicho === nicho.value
                              ? 'border-[#305e73] bg-[#305e73]/10 text-[#305e73]'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="text-2xl mb-2">{nicho.icon}</div>
                          <div className="text-sm font-medium">{nicho.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Departamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Departamento *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {departamentos.map((dept) => {
                        const Icon = dept.icon
                        return (
                          <motion.button
                            key={dept.value}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData(prev => ({ ...prev, departamento: dept.value }))}
                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                              formData.departamento === dept.value
                                ? 'border-[#305e73] bg-[#305e73]/10 text-[#305e73]'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{dept.label}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Configuração Tab */}
              {activeTab === 'configuracao' && (
                <div className="space-y-6">
                  {/* Modelo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Modelo de IA
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {modelos.map((modelo) => (
                        <motion.button
                          key={modelo.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData(prev => ({ ...prev, modelo: modelo.value as any }))}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.modelo === modelo.value
                              ? 'border-[#305e73] bg-[#305e73]/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{modelo.icon}</span>
                            <span className="font-semibold text-gray-900">{modelo.label}</span>
                          </div>
                          <p className="text-sm text-gray-600">{modelo.description}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt do Sistema *
                    </label>
                    <textarea
                      required
                      value={formData.prompt}
                      onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none resize-none"
                      rows={8}
                      placeholder="Descreva como o agente deve se comportar, suas responsabilidades, tom de voz, conhecimentos específicos..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Este prompt define a personalidade e comportamento do seu agente
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Status Inicial
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="ativado"
                          checked={formData.status === 'ativado'}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-4 h-4 text-[#305e73] border-gray-300 focus:ring-[#305e73]"
                        />
                        <span className="text-green-700 font-medium">Ativado</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="desativado"
                          checked={formData.status === 'desativado'}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-4 h-4 text-[#305e73] border-gray-300 focus:ring-[#305e73]"
                        />
                        <span className="text-red-700 font-medium">Desativado</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrações Tab */}
              {activeTab === 'integracoes' && (
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Integrações do Agente
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Configure as integrações com outros sistemas após criar o agente
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      {[
                        { icon: Users, label: 'Listas', desc: 'Conectar com listas de contatos' },
                        { icon: Layers, label: 'Kanban', desc: 'Integrar com quadros kanban' },
                        { icon: MessageSquare, label: 'Chats', desc: 'Conectar conversas' },
                        { icon: GitBranch, label: 'Fluxogramas', desc: 'Automatizar fluxos' },
                        { icon: Users, label: 'Atendentes', desc: 'Colaborar com equipe' },
                        { icon: Target, label: 'Cards', desc: 'Gerenciar cards' }
                      ].map((item, index) => {
                        const Icon = item.icon
                        return (
                          <div
                            key={index}
                            className="p-4 bg-gray-50 rounded-xl text-center"
                          >
                            <Icon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <h4 className="font-medium text-gray-900 text-sm">{item.label}</h4>
                            <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Regras Tab */}
              {activeTab === 'regras' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Regras do Agente</h3>
                        <p className="text-gray-600 text-sm">
                          Defina regras específicas de comportamento
                        </p>
                      </div>
                      
                      <button
                        type="button"
                        onClick={addRegra}
                        className="flex items-center gap-2 text-[#305e73] hover:text-[#3a6d84] font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Regra
                      </button>
                    </div>

                    <div className="space-y-3">
                      {regras.map((regra, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={regra}
                            onChange={(e) => updateRegra(index, e.target.value)}
                            className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
                            placeholder="Ex: Sempre ser educado e profissional"
                          />
                          {regras.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRegra(index)}
                              className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {regras.length === 0 && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Zap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium mb-2">Nenhuma regra definida</p>
                        <p className="text-gray-500 text-sm">Adicione regras para personalizar o comportamento</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-8 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Criar Agente
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
