'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Users, Bot, Kanban, MessageSquare, AlertCircle } from 'lucide-react'
import { Fila } from '../page'

interface CriarFilaModalProps {
  onClose: () => void
  onCreateFila: (fila: Omit<Fila, 'id' | 'criadaEm' | 'atualizadaEm' | 'estatisticas'>) => void
}

const coresPredefinidas = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
  '#EF4444', '#06B6D4', '#84CC16', '#F97316',
  '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
]

const mockAtendentes = [
  'João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira',
  'Carlos Ferreira', 'Lucia Mendes', 'Rafael Lima', 'Fernanda Rocha'
]

export default function CriarFilaModal({ onClose, onCreateFila }: CriarFilaModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#3B82F6',
    ordenacao: 1,
    ativa: true,
    regras: {
      chatBot: false,
      kanban: false,
      atendentes: [] as string[],
      whatsappChats: false,
      prioridade: 'media' as 'baixa' | 'media' | 'alta' | 'urgente'
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.nome.trim()) {
        newErrors.nome = 'Nome é obrigatório'
      }
      if (!formData.descricao.trim()) {
        newErrors.descricao = 'Descrição é obrigatória'
      }
    }

    if (step === 2) {
      if (formData.regras.atendentes.length === 0) {
        newErrors.atendentes = 'Selecione pelo menos um atendente'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    setErrors({})
  }

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onCreateFila(formData)
    }
  }

  const toggleAtendente = (atendente: string) => {
    setFormData(prev => ({
      ...prev,
      regras: {
        ...prev.regras,
        atendentes: prev.regras.atendentes.includes(atendente)
          ? prev.regras.atendentes.filter(a => a !== atendente)
          : [...prev.regras.atendentes, atendente]
      }
    }))
  }

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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nova Fila de Atendimento</h2>
              <p className="text-gray-600 mt-1">Etapa {currentStep} de 3</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <motion.div
                    animate={{
                      backgroundColor: step <= currentStep ? '#305e73' : '#E5E7EB',
                      color: step <= currentStep ? '#FFFFFF' : '#6B7280'
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  >
                    {step}
                  </motion.div>
                  {step < 3 && (
                    <motion.div
                      animate={{
                        backgroundColor: step < currentStep ? '#305e73' : '#E5E7EB'
                      }}
                      className="w-16 h-1 mx-2"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Informações Básicas</span>
              <span>Configurações</span>
              <span>Revisão</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Step 1: Informações Básicas */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Fila *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all ${
                      errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Ex: Suporte Técnico, Vendas Premium..."
                  />
                  {errors.nome && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all resize-none ${
                      errors.descricao ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Descreva o propósito e funcionamento desta fila..."
                  />
                  {errors.descricao && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.descricao}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Palette className="w-4 h-4 inline mr-2" />
                    Cor da Fila
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {coresPredefinidas.map((cor) => (
                      <motion.button
                        key={cor}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFormData(prev => ({ ...prev, cor }))}
                        className={`w-12 h-12 rounded-xl shadow-md border-4 transition-all ${
                          formData.cor === cor ? 'border-gray-400 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenação
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.ordenacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, ordenacao: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all bg-white"
                    placeholder="1"
                  />
                  <p className="text-gray-500 text-sm mt-1">Ordem de prioridade da fila (menor número = maior prioridade)</p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Configurações */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Prioridade da Fila
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['baixa', 'media', 'alta', 'urgente'] as const).map((prioridade) => (
                      <motion.button
                        key={prioridade}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          regras: { ...prev.regras, prioridade }
                        }))}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.regras.prioridade === prioridade
                            ? 'border-[#305e73] bg-[#305e73]/10 text-[#305e73]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Integrações Ativas
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: 'chatBot', label: 'ChatBot', icon: Bot, desc: 'Integrar com sistema de chatbot' },
                      { key: 'kanban', label: 'Kanban', icon: Kanban, desc: 'Sincronizar com quadros kanban' },
                      { key: 'whatsappChats', label: 'WhatsApp', icon: MessageSquare, desc: 'Receber conversas do WhatsApp' }
                    ].map((integracao) => {
                      const IconComponent = integracao.icon
                      return (
                        <motion.label
                          key={integracao.key}
                          whileHover={{ scale: 1.01 }}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.regras[integracao.key as keyof typeof formData.regras]
                              ? 'border-[#305e73] bg-[#305e73]/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.regras[integracao.key as keyof typeof formData.regras] as boolean}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              regras: { ...prev.regras, [integracao.key]: e.target.checked }
                            }))}
                            className="sr-only"
                          />
                          <IconComponent className="w-6 h-6 text-gray-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{integracao.label}</p>
                            <p className="text-sm text-gray-600">{integracao.desc}</p>
                          </div>
                        </motion.label>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Users className="w-4 h-4 inline mr-2" />
                    Atendentes Responsáveis *
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3">
                    {mockAtendentes.map((atendente) => (
                      <motion.label
                        key={atendente}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          formData.regras.atendentes.includes(atendente)
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.regras.atendentes.includes(atendente)}
                          onChange={() => toggleAtendente(atendente)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          formData.regras.atendentes.includes(atendente)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.regras.atendentes.includes(atendente) && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="text-sm">{atendente}</span>
                      </motion.label>
                    ))}
                  </div>
                  {errors.atendentes && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.atendentes}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Revisão */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Resumo da Fila</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: formData.cor }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{formData.nome}</p>
                        <p className="text-sm text-gray-600">{formData.descricao}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Prioridade:</span>
                        <span className="ml-2 font-medium">{formData.regras.prioridade}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ordenação:</span>
                        <span className="ml-2 font-medium">#{formData.ordenacao}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-2">Integrações:</p>
                      <div className="flex gap-2">
                        {formData.regras.chatBot && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">ChatBot</span>}
                        {formData.regras.kanban && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Kanban</span>}
                        {formData.regras.whatsappChats && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">WhatsApp</span>}
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm mb-2">Atendentes ({formData.regras.atendentes.length}):</p>
                      <div className="text-sm text-gray-700">
                        {formData.regras.atendentes.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={currentStep === 1 ? onClose : handlePrevious}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {currentStep === 1 ? 'Cancelar' : 'Voltar'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              {currentStep === 3 ? 'Criar Fila' : 'Próximo'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
