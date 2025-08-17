'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Shield, Cpu, MessageSquare, AlertTriangle, Mail, Phone, Monitor, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Alerta } from '../page'

interface CriarAlertaModalProps {
  onClose: () => void
  onCreateAlerta: (alerta: Omit<Alerta, 'id' | 'criadoEm' | 'atualizadoEm' | 'estatisticas'>) => void
}

export default function CriarAlertaModal({ onClose, onCreateAlerta }: CriarAlertaModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'sistema' as const,
    prioridade: 'media' as 'baixa' | 'media' | 'alta' | 'critica',
    status: 'ativo' as const,
    cor: '#305e73',
    icone: 'Bell',
    configuracoes: {
      emailNotificacao: true,
      whatsappNotificacao: false,
      dashboardNotificacao: true,
      frequencia: 'imediata' as const,
      destinatarios: [''],
      condicoes: [
        {
          metrica: '',
          operador: '>' as const,
          valor: ''
        }
      ]
    }
  })

  const cores = [
    '#305e73', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#6B7280', '#DC2626', '#059669',
    '#7C3AED', '#DB2777'
  ]

  const tipoOptions = [
    { value: 'sistema', label: 'Sistema', icon: Cpu, desc: 'Alertas relacionados ao sistema' },
    { value: 'usuario', label: 'Usuário', icon: MessageSquare, desc: 'Alertas de atividade do usuário' },
    { value: 'seguranca', label: 'Segurança', icon: Shield, desc: 'Alertas de segurança e acesso' },
    { value: 'performance', label: 'Performance', icon: AlertTriangle, desc: 'Alertas de performance e velocidade' },
    { value: 'integracao', label: 'Integração', icon: Bell, desc: 'Alertas de integrações externas' }
  ]

  const operadores = [
    { value: '>', label: 'Maior que (>)' },
    { value: '<', label: 'Menor que (<)' },
    { value: '=', label: 'Igual a (=)' },
    { value: '>=', label: 'Maior ou igual (>=)' },
    { value: '<=', label: 'Menor ou igual (<=)' },
    { value: '!=', label: 'Diferente de (!=)' }
  ]

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.titulo.trim()) newErrors.titulo = 'Título é obrigatório'
      if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória'
    }

    if (step === 3) {
      if (formData.configuracoes.destinatarios.some(d => !d.trim())) {
        newErrors.destinatarios = 'Todos os destinatários devem ser preenchidos'
      }
      if (formData.configuracoes.condicoes.some(c => !c.metrica || !c.valor)) {
        newErrors.condicoes = 'Todas as condições devem ser preenchidas'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = () => {
    if (validateStep(3)) {
      const alertaData = {
        ...formData,
        configuracoes: {
          ...formData.configuracoes,
          destinatarios: formData.configuracoes.destinatarios.filter(d => d.trim()),
          condicoes: formData.configuracoes.condicoes.map(c => ({
            ...c,
            valor: isNaN(Number(c.valor)) ? c.valor : Number(c.valor)
          }))
        }
      }
      onCreateAlerta(alertaData)
    }
  }

  const addDestinatario = () => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        destinatarios: [...prev.configuracoes.destinatarios, '']
      }
    }))
  }

  const removeDestinatario = (index: number) => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        destinatarios: prev.configuracoes.destinatarios.filter((_, i) => i !== index)
      }
    }))
  }

  const addCondicao = () => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        condicoes: [...prev.configuracoes.condicoes, { metrica: '', operador: '>' as const, valor: '' }]
      }
    }))
  }

  const removeCondicao = (index: number) => {
    setFormData(prev => ({
      ...prev,
      configuracoes: {
        ...prev.configuracoes,
        condicoes: prev.configuracoes.condicoes.filter((_, i) => i !== index)
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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#305e73] to-[#3a6d84] rounded-xl">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Criar Novo Alerta</h2>
                <p className="text-sm text-gray-600">Configure um alerta inteligente para monitoramento</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-center">
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
            <div className="flex justify-center mt-2">
              <span className="text-sm text-gray-600">
                {currentStep === 1 && 'Informações Básicas'}
                {currentStep === 2 && 'Configurações'}
                {currentStep === 3 && 'Condições e Destinatários'}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Informações Básicas */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Alerta *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all ${
                      errors.titulo ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Ex: Tempo de Resposta Alto, Falha na Integração..."
                  />
                  {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
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
                    placeholder="Descreva quando e como este alerta deve ser disparado..."
                  />
                  {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Alerta
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tipoOptions.map((tipo) => {
                      const IconComponent = tipo.icon
                      return (
                        <motion.button
                          key={tipo.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData(prev => ({ ...prev, tipo: tipo.value as any }))}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.tipo === tipo.value
                              ? 'border-[#305e73] bg-[#305e73]/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <IconComponent className="w-5 h-5 text-[#305e73]" />
                            <span className="font-medium text-gray-900">{tipo.label}</span>
                          </div>
                          <p className="text-sm text-gray-600">{tipo.desc}</p>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Prioridade
                    </label>
                    <div className="space-y-2">
                      {(['baixa', 'media', 'alta', 'critica'] as const).map((prioridade) => (
                        <motion.button
                          key={prioridade}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData(prev => ({ ...prev, prioridade }))}
                          className={`w-full p-3 rounded-xl border-2 transition-all ${
                            formData.prioridade === prioridade
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
                      Cor do Alerta
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {cores.map((cor) => (
                        <motion.button
                          key={cor}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setFormData(prev => ({ ...prev, cor }))}
                          className={`w-12 h-12 rounded-xl border-2 transition-all ${
                            formData.cor === cor ? 'border-gray-400 scale-110' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: cor }}
                        />
                      ))}
                    </div>
                  </div>
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
                    Canais de Notificação
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotificacao', label: 'Email', icon: Mail, desc: 'Enviar notificações por email' },
                      { key: 'whatsappNotificacao', label: 'WhatsApp', icon: Phone, desc: 'Enviar notificações via WhatsApp' },
                      { key: 'dashboardNotificacao', label: 'Dashboard', icon: Monitor, desc: 'Mostrar notificações no dashboard' }
                    ].map((canal) => {
                      const IconComponent = canal.icon
                      return (
                        <motion.label
                          key={canal.key}
                          whileHover={{ scale: 1.01 }}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.configuracoes[canal.key as keyof typeof formData.configuracoes]
                              ? 'border-[#305e73] bg-[#305e73]/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.configuracoes[canal.key as keyof typeof formData.configuracoes] as boolean}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              configuracoes: { ...prev.configuracoes, [canal.key]: e.target.checked }
                            }))}
                            className="sr-only"
                          />
                          <IconComponent className="w-6 h-6 text-gray-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{canal.label}</p>
                            <p className="text-sm text-gray-600">{canal.desc}</p>
                          </div>
                        </motion.label>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Frequência de Verificação
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'imediata', label: 'Imediata', desc: 'Verificar constantemente' },
                      { value: 'horaria', label: 'A cada hora', desc: 'Verificar de hora em hora' },
                      { value: 'diaria', label: 'Diária', desc: 'Verificar uma vez por dia' },
                      { value: 'semanal', label: 'Semanal', desc: 'Verificar uma vez por semana' }
                    ].map((freq) => (
                      <motion.button
                        key={freq.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          configuracoes: { ...prev.configuracoes, frequencia: freq.value as any }
                        }))}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          formData.configuracoes.frequencia === freq.value
                            ? 'border-[#305e73] bg-[#305e73]/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{freq.label}</p>
                        <p className="text-sm text-gray-600">{freq.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Condições e Destinatários */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Destinatários
                    </label>
                    <button
                      onClick={addDestinatario}
                      className="flex items-center gap-1 text-sm text-[#305e73] hover:text-[#244659]"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.configuracoes.destinatarios.map((destinatario, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="email"
                          value={destinatario}
                          onChange={(e) => {
                            const newDestinatarios = [...formData.configuracoes.destinatarios]
                            newDestinatarios[index] = e.target.value
                            setFormData(prev => ({
                              ...prev,
                              configuracoes: { ...prev.configuracoes, destinatarios: newDestinatarios }
                            }))
                          }}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          placeholder="email@exemplo.com"
                        />
                        {formData.configuracoes.destinatarios.length > 1 && (
                          <button
                            onClick={() => removeDestinatario(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.destinatarios && <p className="text-red-500 text-sm mt-1">{errors.destinatarios}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Condições de Disparo
                    </label>
                    <button
                      onClick={addCondicao}
                      className="flex items-center gap-1 text-sm text-[#305e73] hover:text-[#244659]"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.configuracoes.condicoes.map((condicao, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={condicao.metrica}
                          onChange={(e) => {
                            const newCondicoes = [...formData.configuracoes.condicoes]
                            newCondicoes[index].metrica = e.target.value
                            setFormData(prev => ({
                              ...prev,
                              configuracoes: { ...prev.configuracoes, condicoes: newCondicoes }
                            }))
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          placeholder="métrica (ex: cpu_usage)"
                        />
                        <select
                          value={condicao.operador}
                          onChange={(e) => {
                            const newCondicoes = [...formData.configuracoes.condicoes]
                            newCondicoes[index].operador = e.target.value as any
                            setFormData(prev => ({
                              ...prev,
                              configuracoes: { ...prev.configuracoes, condicoes: newCondicoes }
                            }))
                          }}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                        >
                          {operadores.map(op => (
                            <option key={op.value} value={op.value}>{op.label}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={condicao.valor}
                          onChange={(e) => {
                            const newCondicoes = [...formData.configuracoes.condicoes]
                            newCondicoes[index].valor = e.target.value
                            setFormData(prev => ({
                              ...prev,
                              configuracoes: { ...prev.configuracoes, condicoes: newCondicoes }
                            }))
                          }}
                          className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                          placeholder="valor"
                        />
                        {formData.configuracoes.condicoes.length > 1 && (
                          <button
                            onClick={() => removeCondicao(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.condicoes && <p className="text-red-500 text-sm mt-1">{errors.condicoes}</p>}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              
              {currentStep < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  className="px-6 py-2 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Próximo
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Criar Alerta
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
