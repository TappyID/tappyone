'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { AssinaturaDisplay } from '../page'

interface Contato {
  id: string
  nome: string
  telefone?: string
  email?: string
  empresa?: string
  avatar?: string
}

interface CriarAssinaturaModalProps {
  onClose: () => void
  onCreateAssinatura: (assinatura: any) => void
  editingAssinatura?: any
  contatos?: Contato[]
}

export default function CriarAssinaturaModal({ onClose, onCreateAssinatura, editingAssinatura, contatos = [] }: CriarAssinaturaModalProps) {
  const [formData, setFormData] = useState({
    contato: {
      id: '',
      nome: '',
      telefone: '',
      email: '',
      avatar: ''
    },
    plano: {
      nome: '',
      tipo: 'custom' as 'basico' | 'premium' | 'enterprise' | 'custom',
      valor: 0,
      periodo: 'mensal' as const,
      descricao: '',
      recursos: []
    },
    status: 'ativa' as const,
    dataInicio: new Date(),
    dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
    dataProximoPagamento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    formaPagamento: 'pix' as const,
    valorPago: 0,
    desconto: 0,
    configuracoes: {
      renovacaoAutomatica: true,
      notificacoes: {
        lembreteVencimento: {
          ativo: true,
          diasAntes: [7, 3, 1],
          mensagem: 'Olá {nome}! Sua assinatura {plano} vence em {dias} dias.'
        },
        confirmacaoPagamento: {
          ativo: true,
          mensagem: 'Pagamento confirmado! Sua assinatura foi renovada.'
        },
        expiracaoAssinatura: {
          ativo: true,
          mensagem: 'Sua assinatura expirou. Renove agora.'
        },
        suspensaoServico: {
          ativo: false,
          diasAposSuspensao: 7,
          mensagem: 'Serviços suspensos por falta de pagamento.'
        }
      },
      limitesUso: {
        mensagensWhatsapp: 10000,
        atendimentosSimultaneos: 50,
        integracoes: 10,
        armazenamento: 100
      }
    }
  })

  const [selectedContato, setSelectedContato] = useState<Contato | null>(null)
  const [searchContato, setSearchContato] = useState('')

  // Filtrar contatos baseado na busca
  const filteredContatos = contatos.filter(contato =>
    contato.nome.toLowerCase().includes(searchContato.toLowerCase()) ||
    contato.telefone?.includes(searchContato) ||
    contato.email?.toLowerCase().includes(searchContato.toLowerCase())
  )

  // Atualizar formData quando contato é selecionado
  useEffect(() => {
    if (selectedContato) {
      setFormData(prev => ({
        ...prev,
        contato: {
          id: selectedContato.id,
          nome: selectedContato.nome,
          telefone: selectedContato.telefone || '',
          email: selectedContato.email || '',
          avatar: selectedContato.avatar || ''
        }
      }))
    }
  }, [selectedContato])

  // Preencher dados quando editando
  useEffect(() => {
    if (editingAssinatura) {
      setFormData({
        contato: {
          id: editingAssinatura.contato.id,
          nome: editingAssinatura.contato.nome,
          telefone: editingAssinatura.contato.telefone,
          email: editingAssinatura.contato.email || '',
          avatar: editingAssinatura.contato.avatar || ''
        },
        plano: {
          nome: editingAssinatura.plano.nome,
          tipo: editingAssinatura.plano.tipo,
          valor: editingAssinatura.plano.valor,
          periodo: editingAssinatura.plano.periodo,
          descricao: editingAssinatura.plano.descricao || '',
          recursos: editingAssinatura.plano.recursos || []
        },
        status: editingAssinatura.status,
        dataInicio: new Date(editingAssinatura.dataInicio),
        dataVencimento: new Date(editingAssinatura.dataVencimento),
        dataProximoPagamento: new Date(editingAssinatura.dataProximoPagamento),
        formaPagamento: editingAssinatura.formaPagamento,
        valorPago: editingAssinatura.valorPago,
        desconto: editingAssinatura.desconto || 0,
        configuracoes: editingAssinatura.configuracoes || formData.configuracoes
      })
    }
  }, [editingAssinatura])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.contato.nome || !formData.contato.telefone) {
      alert('Nome e telefone são obrigatórios')
      return
    }

    const assinaturaData = {
      ...formData,
      contato: {
        ...formData.contato,
        id: editingAssinatura ? editingAssinatura.contato.id : Date.now().toString()
      }
    }
    
    onCreateAssinatura(assinaturaData)
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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#305e73] to-[#3a6d84] rounded-xl">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nova Assinatura</h2>
                <p className="text-sm text-gray-600">Criar assinatura para cliente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Seleção de Contato */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                👤 Selecionar Cliente
              </h3>
              
              {/* Campo de busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Contato
                </label>
                <input
                  type="text"
                  value={searchContato}
                  onChange={(e) => setSearchContato(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                  placeholder="Digite o nome, telefone ou email..."
                />
              </div>

              {/* Lista de contatos */}
              {filteredContatos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                  {filteredContatos.map((contato) => (
                    <motion.label
                      key={contato.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedContato?.id === contato.id
                          ? 'border-[#305e73] bg-[#305e73]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="contato"
                        value={contato.id}
                        checked={selectedContato?.id === contato.id}
                        onChange={() => setSelectedContato(contato)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        {contato.avatar ? (
                          <img
                            src={contato.avatar}
                            alt={contato.nome}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {contato.nome.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{contato.nome}</div>
                          {contato.telefone && (
                            <div className="text-sm text-gray-500">{contato.telefone}</div>
                          )}
                        </div>
                      </div>
                    </motion.label>
                  ))}
                </div>
              )}

              {/* Contato selecionado ou campos manuais */}
              {selectedContato ? (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    {selectedContato.avatar ? (
                      <img
                        src={selectedContato.avatar}
                        alt={selectedContato.nome}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {selectedContato.nome.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{selectedContato.nome}</div>
                      <div className="text-sm text-gray-600">{selectedContato.telefone}</div>
                      {selectedContato.email && (
                        <div className="text-sm text-gray-500">{selectedContato.email}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedContato(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contato.nome}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contato: { ...prev.contato, nome: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                      placeholder="Ex: João Silva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contato.telefone}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        contato: { ...prev.contato, telefone: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                      placeholder="Ex: +5519999887766"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plano *
                  </label>
                  <select
                    required
                    value={formData.plano.tipo === 'custom' ? 'custom' : formData.plano.nome}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setFormData(prev => ({ 
                          ...prev, 
                          plano: { 
                            ...prev.plano, 
                            tipo: 'custom',
                            nome: '',
                            valor: 0,
                            descricao: ''
                          }
                        }))
                      } else {
                        const planValues = {
                          'Básico': { valor: 99.90, periodo: 'mensal' as const },
                          'Premium': { valor: 199.90, periodo: 'mensal' as const },
                          'Enterprise': { valor: 399.90, periodo: 'mensal' as const }
                        }
                        const selectedPlan = planValues[e.target.value as keyof typeof planValues]
                        setFormData(prev => ({ 
                          ...prev, 
                          plano: { 
                            ...prev.plano, 
                            nome: e.target.value,
                            tipo: e.target.value.toLowerCase() as 'basico' | 'premium' | 'enterprise',
                            valor: selectedPlan.valor,
                            periodo: selectedPlan.periodo
                          },
                          valorPago: selectedPlan.valor
                        }))
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um plano</option>
                    <option value="Básico">Básico - R$ 99,90/mês</option>
                    <option value="Premium">Premium - R$ 199,90/mês</option>
                    <option value="Enterprise">Enterprise - R$ 399,90/mês</option>
                    <option value="custom">✏️ Criar plano personalizado</option>
                  </select>
                </div>

                {/* Campos para plano personalizado */}
                {formData.plano.tipo === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Plano *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.plano.nome}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          plano: { ...prev.plano, nome: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Plano Especial..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor do Plano *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.plano.valor ? `R$ ${formData.plano.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}
                        onChange={(e) => {
                          // Remove tudo exceto números e vírgula/ponto
                          const value = e.target.value.replace(/[^\d,\.]/g, '').replace(',', '.')
                          const numericValue = parseFloat(value) || 0
                          setFormData(prev => ({ 
                            ...prev, 
                            plano: { ...prev.plano, valor: numericValue },
                            valorPago: numericValue
                          }))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="R$ 0,00"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <select
                  value={formData.plano.periodo}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    plano: { ...prev.plano, periodo: e.target.value as any }
                  }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                >
                  <option value="mensal">Mensal</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento
                </label>
                <select
                  value={formData.formaPagamento}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    formaPagamento: e.target.value as any
                  }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                >
                  <option value="pix">PIX</option>
                  <option value="cartao">Cartão de Crédito</option>
                  <option value="boleto">Boleto Bancário</option>
                  <option value="transferencia">Transferência Bancária</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Valor Total:</span>
                <span className="text-2xl font-bold text-[#305e73]">
                  R$ {formData.valorPago.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Criar Assinatura
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
