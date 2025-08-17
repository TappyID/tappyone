'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileSignature, CreditCard, Link, User, Phone, Calendar, DollarSign } from 'lucide-react'

interface AssinaturaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (assinatura: AssinaturaData) => void
  contactData?: {
    nome?: string
    telefone?: string
  }
}

interface AssinaturaData {
  nome: string
  plano: string
  formaPagamento: 'pix' | 'cartao' | 'boleto'
  linkPagamento: string
  valor: number
  renovacao: 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'limitado'
  cliente: string
  telefone: string
}

export default function AssinaturaModal({ 
  isOpen, 
  onClose, 
  onSave, 
  contactData 
}: AssinaturaModalProps) {
  const [formData, setFormData] = useState<AssinaturaData>({
    nome: '',
    plano: '',
    formaPagamento: 'pix',
    linkPagamento: '',
    valor: 0,
    renovacao: 'mensal',
    cliente: contactData?.nome || '',
    telefone: contactData?.telefone || ''
  })

  // Preencher dados do contato quando disponível
  useEffect(() => {
    if (contactData) {
      setFormData(prev => ({
        ...prev,
        cliente: contactData.nome || '',
        telefone: contactData.telefone || ''
      }))
    }
  }, [contactData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
    // Reset form
    setFormData({
      nome: '',
      plano: '',
      formaPagamento: 'pix',
      linkPagamento: '',
      valor: 0,
      renovacao: 'mensal',
      cliente: contactData?.nome || '',
      telefone: contactData?.telefone || ''
    })
  }

  const handleChange = (field: keyof AssinaturaData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const planosDisponiveis = [
    { value: 'basico', label: 'Plano Básico', descricao: 'Funcionalidades essenciais' },
    { value: 'profissional', label: 'Plano Profissional', descricao: 'Recursos avançados' },
    { value: 'empresarial', label: 'Plano Empresarial', descricao: 'Solução completa' },
    { value: 'personalizado', label: 'Plano Personalizado', descricao: 'Sob medida' }
  ]

  const formasPagamento = [
    { 
      value: 'pix', 
      label: 'PIX', 
      icon: '💳',
      color: 'from-green-500 to-green-600',
      descricao: 'Pagamento instantâneo'
    },
    { 
      value: 'cartao', 
      label: 'Cartão', 
      icon: '💳',
      color: 'from-blue-500 to-blue-600',
      descricao: 'Crédito ou débito'
    },
    { 
      value: 'boleto', 
      label: 'Boleto', 
      icon: '🧾',
      color: 'from-orange-500 to-orange-600',
      descricao: 'Boleto bancário'
    }
  ]

  const periodosRenovacao = [
    { value: 'mensal', label: 'Mensal', multiplicador: 1 },
    { value: 'trimestral', label: 'Trimestral', multiplicador: 3 },
    { value: 'semestral', label: 'Semestral', multiplicador: 6 },
    { value: 'anual', label: 'Anual', multiplicador: 12 },
    { value: 'limitado', label: 'Limitado', multiplicador: 1 }
  ]

  const calcularValorTotal = () => {
    const periodo = periodosRenovacao.find(p => p.value === formData.renovacao)
    if (formData.renovacao === 'limitado') return formData.valor
    return formData.valor * (periodo?.multiplicador || 1)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#273155] to-[#2a3660] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <FileSignature className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Nova Assinatura</h2>
                      <p className="text-blue-100 text-sm">Configure um plano de assinatura para o cliente</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome da Assinatura */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FileSignature className="w-4 h-4 inline mr-2" />
                      Nome da Assinatura
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                      placeholder="Ex: Assinatura Premium - João Silva"
                      required
                    />
                  </div>

                  {/* Plano */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Plano Selecionado
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {planosDisponiveis.map((plano) => (
                        <motion.button
                          key={plano.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleChange('plano', plano.value)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.plano === plano.value
                              ? 'border-[#273155] bg-gradient-to-r from-[#273155] to-[#2a3660] text-white'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="font-semibold">{plano.label}</div>
                          <div className={`text-sm ${
                            formData.plano === plano.value ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {plano.descricao}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Valor e Renovação */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Valor Base (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.valor}
                        onChange={(e) => handleChange('valor', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                        placeholder="0.00"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Período de Renovação
                      </label>
                      <select
                        value={formData.renovacao}
                        onChange={(e) => handleChange('renovacao', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                        required
                      >
                        {periodosRenovacao.map((periodo) => (
                          <option key={periodo.value} value={periodo.value}>
                            {periodo.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Valor Total */}
                  {formData.valor > 0 && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Valor Total ({formData.renovacao === 'limitado' ? 'Único' : periodosRenovacao.find(p => p.value === formData.renovacao)?.label}):
                        </span>
                        <span className="text-xl font-bold text-[#273155]">
                          R$ {calcularValorTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Forma de Pagamento */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {formasPagamento.map((forma) => (
                        <motion.button
                          key={forma.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleChange('formaPagamento', forma.value)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.formaPagamento === forma.value
                              ? `border-[#273155] bg-gradient-to-r ${forma.color} text-white`
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="text-2xl mb-2">{forma.icon}</div>
                          <div className="font-semibold">{forma.label}</div>
                          <div className={`text-xs ${
                            formData.formaPagamento === forma.value ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {forma.descricao}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Link de Pagamento */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Link className="w-4 h-4 inline mr-2" />
                      Link de Pagamento
                    </label>
                    <input
                      type="url"
                      value={formData.linkPagamento}
                      onChange={(e) => handleChange('linkPagamento', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                      placeholder="https://pagamento.exemplo.com/assinatura/123"
                    />
                  </div>

                  {/* Cliente e Telefone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Cliente
                      </label>
                      <input
                        type="text"
                        value={formData.cliente}
                        onChange={(e) => handleChange('cliente', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all bg-gray-50"
                        placeholder="Nome do cliente"
                        readOnly={!!contactData?.nome}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => handleChange('telefone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all bg-gray-50"
                        placeholder="(11) 99999-9999"
                        readOnly={!!contactData?.telefone}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#273155] to-[#2a3660] text-white rounded-xl hover:shadow-lg transition-all font-medium"
                    >
                      Criar Assinatura
                    </motion.button>
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
