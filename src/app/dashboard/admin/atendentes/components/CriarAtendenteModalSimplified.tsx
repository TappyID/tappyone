'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, User, Mail, Phone, Shield } from 'lucide-react'
import { useState } from 'react'
import { AtendenteComStats } from '@/hooks/useAtendentes'

interface CriarAtendenteModalProps {
  onClose: () => void
  onCreateAtendente: (atendente: {
    nome: string
    email: string
    telefone?: string
    tipo: 'ADMIN' | 'ATENDENTE_FINANCEIRO' | 'ATENDENTE_COMERCIAL' | 'ATENDENTE_JURIDICO' | 'ATENDENTE_SUPORTE' | 'ATENDENTE_VENDAS' | 'ASSINANTE' | 'AFILIADO'
    senha: string
  }) => void
}

export default function CriarAtendenteModal({ onClose, onCreateAtendente }: CriarAtendenteModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo: 'ATENDENTE_SUPORTE' as const,
    senha: ''
  })
  const [loading, setLoading] = useState(false)

  const tipoOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'ATENDENTE_COMERCIAL', label: 'Atendente Comercial' },
    { value: 'ATENDENTE_FINANCEIRO', label: 'Atendente Financeiro' },
    { value: 'ATENDENTE_JURIDICO', label: 'Atendente Jurídico' },
    { value: 'ATENDENTE_SUPORTE', label: 'Atendente Suporte' },
    { value: 'ATENDENTE_VENDAS', label: 'Atendente Vendas' },
    { value: 'ASSINANTE', label: 'Assinante' },
    { value: 'AFILIADO', label: 'Afiliado' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.email || !formData.senha) {
      alert('Nome, email e senha são obrigatórios')
      return
    }

    if (formData.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      await onCreateAtendente(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao criar atendente:', error)
      alert('Erro ao criar atendente. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Novo Atendente</h2>
                  <p className="text-white/80 text-sm">Adicionar um novo membro à equipe</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4" />
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Digite o nome completo"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="exemplo@empresa.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4" />
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Shield className="w-4 h-4" />
                Tipo de Usuário *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                required
              >
                {tipoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Shield className="w-4 h-4" />
                Senha *
              </label>
              <input
                type="password"
                value={formData.senha}
                onChange={(e) => handleChange('senha', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500">A senha deve ter pelo menos 6 caracteres</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-[#305e73] text-white rounded-xl hover:bg-[#3a6d84] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando...' : 'Criar Atendente'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
