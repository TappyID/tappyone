'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, DollarSign, Plus, Trash2, FileText, User, Phone, Calendar } from 'lucide-react'

interface OrcamentoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (orcamento: OrcamentoData) => void
  chatId?: string
  contactData?: {
    nome?: string
    telefone?: string
  }
}

interface ItemOrcamento {
  id: string
  nome: string
  valor: number
  quantidade: number
}

interface OrcamentoData {
  titulo: string
  data: string
  tipo: 'venda' | 'assinatura' | 'orcamento' | 'cobranca'
  itens: ItemOrcamento[]
  observacao: string
  cliente: string
  telefone: string
}

export default function OrcamentoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  chatId,
  contactData 
}: OrcamentoModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<OrcamentoData>({
    titulo: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'orcamento',
    itens: [{ id: '1', nome: '', valor: 0, quantidade: 1 }],
    observacao: '',
    cliente: contactData?.nome || '',
    telefone: contactData?.telefone || ''
  })

  // API para criar orçamento
  const apiCreateOrcamento = async (orcamentoData: any) => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token não encontrado')

    const response = await fetch('/api/orcamentos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orcamentoData),
    })

    if (!response.ok) {
      throw new Error('Erro ao criar orçamento')
    }

    return response.json()
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatId) return
    
    setLoading(true)
    try {
      // Preparar dados para o backend
      const orcamentoData = {
        titulo: formData.titulo,
        data: new Date(formData.data).toISOString(),
        tipo: formData.tipo,
        observacao: formData.observacao || null,
        contato_id: chatId, // JID do contato
        itens: formData.itens.map(item => ({
          nome: item.nome,
          valor: item.valor,
          quantidade: item.quantidade,
          subtotal: item.valor * item.quantidade
        }))
      }

      console.log('Criando orçamento:', orcamentoData)
      
      await apiCreateOrcamento(orcamentoData)
      
      // Callback opcional para compatibilidade
      if (onSave) {
        onSave(formData)
      }
      
      onClose()
      
      // Reset form
      setFormData({
        titulo: '',
        data: new Date().toISOString().split('T')[0],
        tipo: 'orcamento',
        itens: [{ id: '1', nome: '', valor: 0, quantidade: 1 }],
        observacao: '',
        cliente: contactData?.nome || '',
        telefone: contactData?.telefone || ''
      })
    } catch (error) {
      console.error('Erro ao criar orçamento:', error)
      alert('Erro ao criar orçamento!')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Omit<OrcamentoData, 'itens'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addItem = () => {
    const newId = (formData.itens.length + 1).toString()
    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { id: newId, nome: '', valor: 0, quantidade: 1 }]
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

  const calcularTotal = () => {
    return formData.itens.reduce((total, item) => total + (item.valor * item.quantidade), 0)
  }

  const tiposOrcamento = [
    { value: 'venda', label: 'Venda', color: 'from-green-500 to-green-600' },
    { value: 'assinatura', label: 'Assinatura', color: 'from-blue-500 to-blue-600' },
    { value: 'orcamento', label: 'Orçamento', color: 'from-yellow-500 to-yellow-600' },
    { value: 'cobranca', label: 'Cobrança', color: 'from-red-500 to-red-600' }
  ]

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
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#273155] to-[#2a3660] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Novo Orçamento</h2>
                      <p className="text-blue-100 text-sm">Crie um orçamento detalhado para o cliente</p>
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
                  {/* Título e Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Título do Orçamento
                      </label>
                      <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => handleChange('titulo', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                        placeholder="Ex: Desenvolvimento de Website"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Data
                      </label>
                      <input
                        type="date"
                        value={formData.data}
                        onChange={(e) => handleChange('data', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tipo de Documento
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {tiposOrcamento.map((tipo) => (
                        <motion.button
                          key={tipo.value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleChange('tipo', tipo.value)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            formData.tipo === tipo.value
                              ? `border-[#273155] bg-gradient-to-r ${tipo.color} text-white`
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span className="font-medium text-sm text-center block">{tipo.label}</span>
                        </motion.button>
                      ))}
                    </div>
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

                  {/* Itens */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-semibold text-gray-700">
                        Itens do Orçamento
                      </label>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={addItem}
                        className="flex items-center gap-2 px-3 py-2 bg-[#273155] text-white rounded-lg hover:bg-[#2a3660] transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar Item
                      </motion.button>
                    </div>
                    
                    <div className="space-y-3">
                      {formData.itens.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <div className="col-span-12 md:col-span-5">
                            <input
                              type="text"
                              value={item.nome}
                              onChange={(e) => updateItem(item.id, 'nome', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                              placeholder="Nome do item/serviço"
                              required
                            />
                          </div>
                          <div className="col-span-4 md:col-span-2">
                            <input
                              type="number"
                              value={item.quantidade}
                              onChange={(e) => updateItem(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                              placeholder="Qtd"
                              min="1"
                              required
                            />
                          </div>
                          <div className="col-span-6 md:col-span-3">
                            <input
                              type="number"
                              step="0.01"
                              value={item.valor}
                              onChange={(e) => updateItem(item.id, 'valor', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all"
                              placeholder="Valor unitário"
                              min="0"
                              required
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1 flex items-center">
                            <span className="text-sm font-medium text-gray-600">
                              R$ {(item.valor * item.quantidade).toFixed(2)}
                            </span>
                          </div>
                          <div className="col-span-12 md:col-span-1 flex items-center justify-center">
                            {formData.itens.length > 1 && (
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-[#273155] to-[#2a3660] rounded-xl">
                      <div className="flex justify-between items-center text-white">
                        <span className="text-lg font-semibold">Total Geral:</span>
                        <span className="text-2xl font-bold">R$ {calcularTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Observação */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Observações
                    </label>
                    <textarea
                      value={formData.observacao}
                      onChange={(e) => handleChange('observacao', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#273155] focus:border-transparent transition-all resize-none"
                      placeholder="Informações adicionais, condições de pagamento, prazo de entrega, etc."
                    />
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
                      Criar Orçamento
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
