'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard } from 'lucide-react'
import { useState } from 'react'
import { Assinatura } from '../page'

interface CriarAssinaturaModalProps {
  onClose: () => void
  onCreateAssinatura: (assinatura: Omit<Assinatura, 'id' | 'criadaEm' | 'atualizadaEm' | 'historicoPagamentos' | 'estatisticas'>) => void
}

export default function CriarAssinaturaModal({ onClose, onCreateAssinatura }: CriarAssinaturaModalProps) {
  const [formData, setFormData] = useState({
    contato: {
      id: '',
      nome: '',
      telefone: '',
      email: '',
      avatar: ''
    },
    plano: {
      nome: 'Premium Business',
      tipo: 'premium' as 'basico' | 'premium' | 'enterprise',
      valor: 299.90,
      periodo: 'mensal' as const,
      descricao: 'Plano completo para empresas',
      recursos: ['WhatsApp Business API', 'Kanban Avançado', 'Relatórios Detalhados', 'Suporte 24/7']
    },
    status: 'ativa' as const,
    dataInicio: new Date(),
    dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
    dataProximoPagamento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    formaPagamento: 'pix' as const,
    valorPago: 299.90,
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
        id: Date.now().toString()
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
                  placeholder="Ex: +5511999887766"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Opcional)
              </label>
              <input
                type="email"
                value={formData.contato.email}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contato: { ...prev.contato, email: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                placeholder="Ex: joao@empresa.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plano
                </label>
                <select
                  value={formData.plano.nome}
                  onChange={(e) => {
                    const planos = {
                      'Básico Starter': { tipo: 'basico' as const, valor: 99.90 },
                      'Premium Business': { tipo: 'premium' as const, valor: 299.90 },
                      'Enterprise Pro': { tipo: 'enterprise' as const, valor: 899.90 }
                    }
                    const planoSelecionado = planos[e.target.value as keyof typeof planos]
                    setFormData(prev => ({
                      ...prev,
                      plano: { ...prev.plano, nome: e.target.value, ...planoSelecionado },
                      valorPago: planoSelecionado.valor
                    }))
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                >
                  <option value="Básico Starter">Básico Starter</option>
                  <option value="Premium Business">Premium Business</option>
                  <option value="Enterprise Pro">Enterprise Pro</option>
                </select>
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
