'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Brain, 
  Sparkles, 
  MessageSquare, 
  Users, 
  ShoppingCart, 
  Calendar, 
  HeadphonesIcon, 
  Star, 
  Zap, 
  ArrowRight,
  Wand2
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface AiGenerateModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (type: 'template' | 'prompt', data: any) => void
}

const FLOW_TEMPLATES = [
  {
    id: 'atendimento-basico',
    title: 'Atendimento Básico',
    description: 'Fluxo simples de recepção e direcionamento',
    icon: MessageSquare,
    color: 'blue',
    nodes: 8,
    complexity: 'Simples',
    preview: 'Recebe mensagem → Boas-vindas → Menu opções → Direciona para fila'
  },
  {
    id: 'vendas-completo',
    title: 'Vendas Completo',
    description: 'Qualificação de leads e processo de vendas',
    icon: ShoppingCart,
    color: 'green', 
    nodes: 15,
    complexity: 'Avançado',
    preview: 'Qualifica lead → Envia catálogo → Coleta dados → Agenda reunião → CRM'
  },
  {
    id: 'suporte-tecnico',
    title: 'Suporte Técnico',
    description: 'Triagem e resolução de problemas',
    icon: HeadphonesIcon,
    color: 'orange',
    nodes: 12,
    complexity: 'Médio',
    preview: 'Identifica problema → Soluções automáticas → Escalação → Ticket'
  },
  {
    id: 'agendamento-inteligente',
    title: 'Agendamento Inteligente',
    description: 'Agendamento automático com confirmação',
    icon: Calendar,
    color: 'purple',
    nodes: 10,
    complexity: 'Médio', 
    preview: 'Verifica disponibilidade → Agenda → Confirma → Lembra → Kanban'
  },
  {
    id: 'feedback-nps',
    title: 'Pesquisa NPS',
    description: 'Coleta feedback e avaliação de satisfação',
    icon: Star,
    color: 'yellow',
    nodes: 7,
    complexity: 'Simples',
    preview: 'Envia NPS → Coleta nota → Feedback detalhado → Análise'
  },
  {
    id: 'onboarding-cliente',
    title: 'Onboarding de Clientes',
    description: 'Processo de boas-vindas para novos clientes',
    icon: Users,
    color: 'indigo',
    nodes: 11,
    complexity: 'Médio',
    preview: 'Boas-vindas → Tutorial → Documentos → Primeiro uso → Suporte'
  }
]

export default function AiGenerateModal({ isOpen, onClose, onGenerate }: AiGenerateModalProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const [activeTab, setActiveTab] = useState<'templates' | 'prompt'>('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const handleGenerateTemplate = async (templateId: string) => {
    setIsGenerating(true)
    try {
      await onGenerate('template', { templateId })
      onClose()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGeneratePrompt = async () => {
    if (!customPrompt.trim()) return
    
    setIsGenerating(true)
    try {
      await onGenerate('prompt', { prompt: customPrompt })
      onClose()
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border`}
        >
          {/* Header */}
          <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          } rounded-t-xl`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Gerar Fluxo com IA
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Escolha um modelo ou descreva seu fluxo personalizado
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'templates'
                  ? isDark ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20' : 'text-purple-600 border-b-2 border-purple-500 bg-purple-50'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Modelos Prontos
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'prompt'
                  ? isDark ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-900/20' : 'text-purple-600 border-b-2 border-purple-500 bg-purple-50'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Wand2 className="w-4 h-4 inline mr-2" />
              Prompt Personalizado
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'templates' ? (
              <div className="space-y-4">
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  Escolha um modelo pré-configurado para começar rapidamente:
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FLOW_TEMPLATES.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? `border-${template.color}-500 bg-${template.color}-50 dark:bg-${template.color}-900/20`
                          : isDark ? 'border-gray-600 hover:border-gray-500 bg-gray-700' : 'border-gray-200 hover:border-gray-300 bg-white'
                      } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg bg-${template.color}-100 dark:bg-${template.color}-900`}>
                          <template.icon className={`w-5 h-5 text-${template.color}-600 dark:text-${template.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {template.title}
                          </h3>
                          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded ${
                                template.complexity === 'Simples' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                template.complexity === 'Médio' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {template.complexity}
                              </span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                {template.nodes} nodes
                              </span>
                            </div>
                          </div>
                          <div className={`text-xs mt-2 p-2 rounded ${isDark ? 'bg-gray-600' : 'bg-gray-100'}`}>
                            <div className={`font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Preview:</div>
                            <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>{template.preview}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => handleGenerateTemplate(selectedTemplate)}
                      disabled={isGenerating}
                      className={`flex items-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ${
                        isGenerating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Gerando...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Gerar Fluxo</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                  Descreva o fluxo que você deseja criar e a IA gerará automaticamente:
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Descreva seu fluxo *
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ex: Crie um fluxo para atendimento de pizzaria que colete o pedido, endereço de entrega, forma de pagamento e envie para o WhatsApp da cozinha..."
                    rows={6}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                    💡 Dicas para um prompt melhor:
                  </h4>
                  <ul className={`text-xs space-y-1 ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
                    <li>• Seja específico sobre o tipo de negócio</li>
                    <li>• Mencione quais informações devem ser coletadas</li>
                    <li>• Indique onde os dados devem ser enviados (CRM, Kanban, etc.)</li>
                    <li>• Descreva o comportamento esperado em diferentes cenários</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleGeneratePrompt}
                    disabled={isGenerating || !customPrompt.trim()}
                    className={`flex items-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors ${
                      isGenerating || !customPrompt.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Gerando...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        <span>Gerar com IA</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
