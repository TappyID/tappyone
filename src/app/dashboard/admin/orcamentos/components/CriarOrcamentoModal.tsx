'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  DollarSign, 
  Plus, 
  Trash2, 
  FileText, 
  User, 
  Phone, 
  Calendar,
  Package,
  CreditCard,
  Truck,
  Tag,
  Save,
  Send
} from 'lucide-react'
import { cleanPhoneNumber } from '@/lib/utils'

interface CriarOrcamentoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (orcamento: OrcamentoData) => void
  contactData?: {
    nome?: string
    telefone?: string
  }
  disableContactFields?: boolean // Para desabilitar campos quando vem de contexto específico
}

interface ItemOrcamento {
  id: string
  nome: string
  descricao?: string
  valor: number
  quantidade: number
}

interface OrcamentoData {
  titulo: string
  data: string
  data_validade: string
  tipo: 'venda' | 'assinatura' | 'orcamento' | 'cobranca'
  itens: ItemOrcamento[]
  observacao: string
  condicoes_pagamento: string
  prazo_entrega: string
  cliente: string
  telefone: string
  desconto?: number
  taxa_adicional?: number
}

export default function CriarOrcamentoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  contactData,
  disableContactFields = false
}: CriarOrcamentoModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<OrcamentoData>({
    titulo: '',
    data: new Date().toISOString().split('T')[0],
    data_validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tipo: 'orcamento',
    itens: [{ id: '1', nome: '', descricao: '', valor: 0, quantidade: 1 }],
    observacao: '',
    condicoes_pagamento: '',
    prazo_entrega: '',
    cliente: contactData?.nome || '',
    telefone: contactData?.telefone ? cleanPhoneNumber(contactData.telefone) : '',
    desconto: 0,
    taxa_adicional: 0
  })

  useEffect(() => {
    if (contactData) {
      setFormData(prev => ({
        ...prev,
        cliente: contactData.nome || '',
        telefone: cleanPhoneNumber(contactData.telefone || '')
      }))
    }
  }, [contactData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      titulo: '',
      data: new Date().toISOString().split('T')[0],
      data_validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tipo: 'orcamento',
      itens: [{ id: '1', nome: '', descricao: '', valor: 0, quantidade: 1 }],
      observacao: '',
      condicoes_pagamento: '',
      prazo_entrega: '',
      cliente: contactData?.nome || '',
      telefone: contactData?.telefone ? cleanPhoneNumber(contactData.telefone) : '',
      desconto: 0,
      taxa_adicional: 0
    })
    setCurrentStep(1)
  }

  const handleChange = (field: keyof Omit<OrcamentoData, 'itens'>, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addItem = () => {
    const newId = (formData.itens.length + 1).toString()
    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { id: newId, nome: '', descricao: '', valor: 0, quantidade: 1 }]
    }))
  }

  const removeItem = (id: string) => {
    if (formData.itens.length > 1) {
      setFormData(prev => ({
        ...prev,
        itens: prev.itens.filter(item => item.id !== id)
      }))
    }
  }

  const updateItem = (id: string, field: keyof ItemOrcamento, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const calcularSubtotal = () => {
    return formData.itens.reduce((total, item) => total + (item.valor * item.quantidade), 0)
  }

  const calcularTotal = () => {
    const subtotal = calcularSubtotal()
    const desconto = (formData.desconto || 0) / 100 * subtotal
    const taxa = formData.taxa_adicional || 0
    return subtotal - desconto + taxa
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const tiposOrcamento = [
    { value: 'orcamento', label: 'Orçamento', icon: FileText },
    { value: 'venda', label: 'Venda', icon: DollarSign },
    { value: 'assinatura', label: 'Assinatura', icon: Package },
    { value: 'cobranca', label: 'Cobrança', icon: CreditCard }
  ]

  const steps = [
    { id: 1, title: 'Informações', icon: FileText },
    { id: 2, title: 'Itens', icon: Package },
    { id: 3, title: 'Finalização', icon: CreditCard }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-5xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Criar Novo Orçamento</h2>
                      <p className="text-white/80">
                        {contactData?.nome ? `Para ${contactData.nome}` : 'Preencha os dados'}
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-4 mt-6">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon
                    const isActive = currentStep === step.id
                    const isCompleted = currentStep > step.id
                    
                    return (
                      <div key={step.id} className="flex items-center">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setCurrentStep(step.id)}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : isCompleted
                              ? 'bg-white/10 text-white/80'
                              : 'text-white/60 hover:bg-white/10'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isActive || isCompleted ? 'bg-white/20' : 'bg-white/10'
                          }`}>
                            <StepIcon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{step.title}</span>
                        </motion.div>
                        
                        {index < steps.length - 1 && (
                          <div className="w-8 h-px bg-white/20 mx-2" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {/* Step 1 */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <User className="w-4 h-4 inline mr-2" />Cliente
                            </label>
                            <input
                              type="text"
                              value={formData.cliente}
                              onChange={(e) => handleChange('cliente', e.target.value)}
                              disabled={disableContactFields}
                              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                                disableContactFields ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
                              }`}
                              placeholder="Nome do cliente"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <Phone className="w-4 h-4 inline mr-2" />Telefone
                            </label>
                            <input
                              type="tel"
                              value={formData.telefone}
                              onChange={(e) => handleChange('telefone', e.target.value)}
                              disabled={disableContactFields}
                              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                                disableContactFields ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
                              }`}
                              placeholder="Telefone do cliente"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-2" />Título do Orçamento
                          </label>
                          <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => handleChange('titulo', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                            placeholder="Ex: Website Corporativo"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            <Tag className="w-4 h-4 inline mr-2" />Tipo de Orçamento
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {tiposOrcamento.map((tipo) => {
                              const TipoIcon = tipo.icon
                              return (
                                <motion.label
                                  key={tipo.value}
                                  whileHover={{ scale: 1.02 }}
                                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    formData.tipo === tipo.value
                                      ? 'border-[#305e73] bg-[#305e73]/5'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="tipo"
                                    value={tipo.value}
                                    checked={formData.tipo === tipo.value}
                                    onChange={(e) => handleChange('tipo', e.target.value)}
                                    className="sr-only"
                                  />
                                  <div className="text-center">
                                    <div className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                                      formData.tipo === tipo.value
                                        ? 'bg-[#305e73] text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      <TipoIcon className="w-6 h-6" />
                                    </div>
                                    <div className={`text-sm font-medium ${
                                      formData.tipo === tipo.value ? 'text-[#305e73]' : 'text-gray-700'
                                    }`}>
                                      {tipo.label}
                                    </div>
                                  </div>
                                </motion.label>
                              )
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <Calendar className="w-4 h-4 inline mr-2" />Data de Criação
                            </label>
                            <input
                              type="date"
                              value={formData.data}
                              onChange={(e) => handleChange('data', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <Calendar className="w-4 h-4 inline mr-2" />Data de Validade
                            </label>
                            <input
                              type="date"
                              value={formData.data_validade}
                              onChange={(e) => handleChange('data_validade', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
                              required
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2 */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-gray-900">Itens do Orçamento</h3>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            onClick={addItem}
                            className="bg-[#305e73] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar Item
                          </motion.button>
                        </div>

                        <div className="space-y-4">
                          {formData.itens.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-6 bg-gray-50 rounded-xl border border-gray-200"
                            >
                              <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-12 md:col-span-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                                  <input
                                    type="text"
                                    value={item.nome}
                                    onChange={(e) => updateItem(item.id, 'nome', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73]"
                                    required
                                  />
                                </div>

                                <div className="col-span-12 md:col-span-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                                  <input
                                    type="text"
                                    value={item.descricao || ''}
                                    onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73]"
                                  />
                                </div>

                                <div className="col-span-6 md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Qtd</label>
                                  <input
                                    type="number"
                                    value={item.quantidade}
                                    onChange={(e) => updateItem(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73]"
                                    min="1"
                                    required
                                  />
                                </div>

                                <div className="col-span-6 md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
                                  <input
                                    type="number"
                                    value={item.valor}
                                    onChange={(e) => updateItem(item.id, 'valor', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#305e73]"
                                    min="0"
                                    step="0.01"
                                    required
                                  />
                                </div>

                                <div className="col-span-12 flex items-end justify-between">
                                  <div className="text-lg font-bold text-green-600">
                                    Total: {formatCurrency(item.valor * item.quantidade)}
                                  </div>
                                  
                                  {formData.itens.length > 1 && (
                                    <motion.button
                                      type="button"
                                      whileHover={{ scale: 1.1 }}
                                      onClick={() => removeItem(item.id)}
                                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-xl p-6 text-white">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">Total Geral:</span>
                            <span className="text-3xl font-bold">{formatCurrency(calcularTotal())}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3 */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <CreditCard className="w-4 h-4 inline mr-2" />Condições de Pagamento
                          </label>
                          <textarea
                            value={formData.condicoes_pagamento}
                            onChange={(e) => handleChange('condicoes_pagamento', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73]"
                            placeholder="Ex: 50% entrada, 50% na entrega"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Truck className="w-4 h-4 inline mr-2" />Prazo de Entrega
                          </label>
                          <input
                            type="text"
                            value={formData.prazo_entrega}
                            onChange={(e) => handleChange('prazo_entrega', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73]"
                            placeholder="Ex: 30 dias úteis"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-2" />Observações
                          </label>
                          <textarea
                            value={formData.observacao}
                            onChange={(e) => handleChange('observacao', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] resize-none"
                            placeholder="Informações adicionais..."
                          />
                        </div>

                        <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-2xl p-6 text-white">
                          <h4 className="text-xl font-bold mb-4">Resumo do Orçamento</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <div className="space-y-2">
                                <div><strong>Cliente:</strong> {formData.cliente}</div>
                                <div><strong>Título:</strong> {formData.titulo}</div>
                                <div><strong>Tipo:</strong> {tiposOrcamento.find(t => t.value === formData.tipo)?.label}</div>
                                <div><strong>Itens:</strong> {formData.itens.length}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold mb-2">
                                {formatCurrency(calcularTotal())}
                              </div>
                              <div className="text-white/80">
                                Válido até {new Date(formData.data_validade).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="flex gap-3">
                      {currentStep > 1 && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setCurrentStep(currentStep - 1)}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                        >
                          Voltar
                        </motion.button>
                      )}
                      
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                      >
                        Cancelar
                      </motion.button>
                    </div>

                    <div className="flex gap-3">
                      {currentStep < 3 ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setCurrentStep(currentStep + 1)}
                          className="px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl hover:shadow-lg font-medium flex items-center gap-2"
                        >
                          Próximo
                        </motion.button>
                      ) : (
                        <div className="flex gap-3">
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-medium flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Salvar Rascunho
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            onClick={(e) => handleSubmit(e)}
                            className="px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl hover:shadow-lg font-medium flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            Criar e Enviar
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
