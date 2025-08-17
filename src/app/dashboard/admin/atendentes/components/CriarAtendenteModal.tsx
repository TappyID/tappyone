'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Atendente } from '../page'

interface CriarAtendenteModalProps {
  onClose: () => void
  onCreateAtendente: (atendente: Omit<Atendente, 'id' | 'criadoEm' | 'ultimoLogin' | 'estatisticas'>) => void
}

export default function CriarAtendenteModal({ onClose, onCreateAtendente }: CriarAtendenteModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    cargo: 'atendente' as const,
    departamento: 'Suporte',
    status: 'offline' as const,
    statusAtendimento: 'disponivel' as const,
    configuracoes: {
      notificacoes: true,
      autoAssign: true,
      maxAtendimentosSimultaneos: 3,
      horarioTrabalho: {
        inicio: '08:00',
        fim: '18:00',
        diasSemana: [1, 2, 3, 4, 5]
      }
    },
    permissoes: ['atender'],
    meta: {
      atendimentosDiarios: 12,
      tempoMaximoResposta: 15,
      avaliacaoMinima: 4.0
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.email || !formData.telefone) {
      alert('Nome, email e telefone são obrigatórios')
      return
    }

    onCreateAtendente(formData)
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
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Novo Atendente</h2>
                <p className="text-sm text-gray-600">Adicionar membro à equipe</p>
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
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                  placeholder="Ex: joao@tappyone.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                  placeholder="Ex: +5511999887766"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <select
                  value={formData.departamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                >
                  <option value="Suporte">Suporte</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Técnico">Técnico</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo
                </label>
                <select
                  value={formData.cargo}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    cargo: e.target.value as any,
                    permissoes: e.target.value === 'gerente' 
                      ? ['atender', 'transferir', 'escalar', 'relatorios', 'gerenciar', 'configurar']
                      : e.target.value === 'supervisor'
                      ? ['atender', 'transferir', 'escalar', 'relatorios']
                      : ['atender', 'transferir']
                  }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                >
                  <option value="atendente">Atendente</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="gerente">Gerente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max. Atendimentos Simultâneos
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.configuracoes.maxAtendimentosSimultaneos}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuracoes: {
                      ...prev.configuracoes,
                      maxAtendimentosSimultaneos: parseInt(e.target.value) || 3
                    }
                  }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Início
                </label>
                <input
                  type="time"
                  value={formData.configuracoes.horarioTrabalho.inicio}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuracoes: {
                      ...prev.configuracoes,
                      horarioTrabalho: {
                        ...prev.configuracoes.horarioTrabalho,
                        inicio: e.target.value
                      }
                    }
                  }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário de Fim
                </label>
                <input
                  type="time"
                  value={formData.configuracoes.horarioTrabalho.fim}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuracoes: {
                      ...prev.configuracoes,
                      horarioTrabalho: {
                        ...prev.configuracoes.horarioTrabalho,
                        fim: e.target.value
                      }
                    }
                  }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.configuracoes.autoAssign}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuracoes: { ...prev.configuracoes, autoAssign: e.target.checked }
                  }))}
                  className="w-5 h-5 text-[#305e73] rounded focus:ring-[#305e73]"
                />
                <div>
                  <p className="font-medium text-gray-900">Auto-assign de tickets</p>
                  <p className="text-sm text-gray-600">Receber tickets automaticamente quando disponível</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.configuracoes.notificacoes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    configuracoes: { ...prev.configuracoes, notificacoes: e.target.checked }
                  }))}
                  className="w-5 h-5 text-[#305e73] rounded focus:ring-[#305e73]"
                />
                <div>
                  <p className="font-medium text-gray-900">Notificações ativas</p>
                  <p className="text-sm text-gray-600">Receber notificações de novos tickets e mensagens</p>
                </div>
              </label>
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
                Criar Atendente
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
