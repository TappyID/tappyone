'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Shield, Save, Loader2 } from 'lucide-react'
import { AtendenteComStats } from '@/hooks/useAtendentes'
import { useTheme } from '@/contexts/ThemeContext'

interface EditarAtendenteModalProps {
  atendente: AtendenteComStats
  onClose: () => void
  onUpdateAtendente: (id: string, updates: Partial<AtendenteComStats>) => Promise<void>
}

export default function EditarAtendenteModal({ 
  atendente, 
  onClose, 
  onUpdateAtendente 
}: EditarAtendenteModalProps) {
  const { actualTheme } = useTheme()
  const [formData, setFormData] = useState({
    nome: atendente.nome,
    email: atendente.email,
    telefone: atendente.telefone || '',
    tipo: atendente.tipo,
    ativo: atendente.ativo
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const tiposAtendente = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'ATENDENTE_COMERCIAL', label: 'Comercial' },
    { value: 'ATENDENTE_FINANCEIRO', label: 'Financeiro' },
    { value: 'ATENDENTE_JURIDICO', label: 'Jurídico' },
    { value: 'ATENDENTE_SUPORTE', label: 'Suporte' },
    { value: 'ATENDENTE_VENDAS', label: 'Vendas' },
    { value: 'ASSINANTE', label: 'Assinante' },
    { value: 'AFILIADO', label: 'Afiliado' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await onUpdateAtendente(atendente.id, {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim() || undefined,
        tipo: formData.tipo as any,
        ativo: formData.ativo
      })
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar atendente:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`rounded-2xl shadow-2xl w-full max-w-md overflow-hidden backdrop-blur-sm ${
            actualTheme === 'dark'
              ? 'bg-slate-800/90 border border-slate-700/50'
              : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#305e73] to-[#273155] px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Editar Atendente</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nome */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
              }`}>
                <User className="w-4 h-4 inline mr-2" />
                Nome completo
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                  errors.nome ? 'border-red-300' : actualTheme === 'dark' 
                    ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Digite o nome completo"
              />
              {errors.nome && (
                <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
              }`}>
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                  errors.email ? 'border-red-300' : actualTheme === 'dark'
                    ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Digite o email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
              }`}>
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone (opcional)
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                  actualTheme === 'dark'
                    ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Digite o telefone"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
              }`}>
                <Shield className="w-4 h-4 inline mr-2" />
                Tipo de usuário
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                  actualTheme === 'dark'
                    ? 'bg-slate-700/50 border-slate-600/50 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {tiposAtendente.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-[#305e73] border-gray-300 rounded focus:ring-[#305e73]"
                />
                <span className={`text-sm font-medium ${
                  actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
                }`}>Usuário ativo</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  actualTheme === 'dark'
                    ? 'text-white/80 border-slate-600/50 hover:bg-slate-700/50'
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-[#305e73] text-white rounded-lg hover:bg-[#273155] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
