'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Phone, Shield, Users, X, Loader2, Save } from 'lucide-react'
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
    ativo: atendente.ativo,
    fila_id: atendente.fila_id || '', // Mantido para compatibilidade
    filas_ids: [] as string[], // Novo campo para múltiplas filas
    senha: '', // Nova senha (opcional)
    confirmarSenha: '' // Confirmação da nova senha
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [filas, setFilas] = useState<Array<{id: string, nome: string}>>([])  
  const [loadingFilas, setLoadingFilas] = useState(false)

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

  // Buscar filas disponíveis quando o modal for aberto para atendentes
  useEffect(() => {
    if (formData.tipo.startsWith('ATENDENTE_')) {
      fetchFilas()
      fetchFilasDoAtendente()
    }
  }, [formData.tipo])

  // Buscar filas atuais do atendente
  const fetchFilasDoAtendente = async () => {
    if (!atendente?.id) return
    
    try {
      const response = await fetch(`/api/users/${atendente.id}/filas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        const filasDoAtendente = data.data || []
        const filasIds = filasDoAtendente.map((fila: any) => fila.id)
        
        setFormData(prev => ({ ...prev, filas_ids: filasIds }))
      }
    } catch (error) {
      console.error('Erro ao buscar filas do atendente:', error)
    }
  }

  // Buscar filas disponíveis
  const fetchFilas = async () => {
    setLoadingFilas(true)
    try {
      const response = await fetch('/api/filas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFilas(data.data || data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar filas:', error)
    }
    setLoadingFilas(false)
  }

  useEffect(() => {
    fetchFilas()
  }, [])

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

    // Validação de senha (opcional, mas se preenchida precisa ser válida)
    if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres'
    }

    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem'
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
      // Preparar dados para atualização
      const updateData: any = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim() || undefined,
        tipo: formData.tipo as any,
        ativo: formData.ativo,
        fila_id: formData.fila_id || undefined
      }

      // Adicionar senha se fornecida
      if (formData.senha && formData.senha.trim()) {
        updateData.senha = formData.senha.trim()
      }

      // Atualizar dados básicos do usuário
      await onUpdateAtendente(atendente.id, updateData)
      
      // Se é atendente, atualizar filas
      if (formData.tipo.startsWith('ATENDENTE_')) {
        const response = await fetch(`/api/users/${atendente.id}/filas`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filas_ids: formData.filas_ids
          })
        })
        
        if (!response.ok) {
          throw new Error('Erro ao atualizar filas')
        }
      }
      
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

            {/* Filas */}
            {formData.tipo.startsWith('ATENDENTE_') && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
                }`}>
                  <Users className="w-4 h-4 inline mr-2" />
                  Filas de Atendimento
                </label>
                {loadingFilas ? (
                  <div className="flex items-center justify-center py-2">
                    <span className={`text-sm ${
                      actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Carregando filas...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Tags selecionadas */}
                    {formData.filas_ids.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.filas_ids.map(filaId => {
                          const fila = filas.find(f => f.id === filaId)
                          if (!fila) return null
                          
                          return (
                            <div
                              key={filaId}
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                                actualTheme === 'dark'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              <span>{fila.nome}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    filas_ids: prev.filas_ids.filter(id => id !== filaId)
                                  }))
                                }}
                                className="hover:bg-blue-700 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    {/* Lista de filas disponíveis */}
                    <div className={`border rounded-lg max-h-32 overflow-y-auto ${
                      actualTheme === 'dark'
                        ? 'border-slate-600/50 bg-slate-700/30'
                        : 'border-gray-300 bg-gray-50'
                    }`}>
                      {filas.length === 0 ? (
                        <div className="p-3 text-center text-sm text-gray-500">
                          Nenhuma fila disponível
                        </div>
                      ) : (
                        filas.map(fila => {
                          const isSelected = formData.filas_ids.includes(fila.id)
                          
                          return (
                            <label
                              key={fila.id}
                              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-opacity-50 ${
                                actualTheme === 'dark'
                                  ? 'hover:bg-slate-600'
                                  : 'hover:bg-gray-100'
                              } ${isSelected ? (
                                actualTheme === 'dark'
                                  ? 'bg-blue-900/30'
                                  : 'bg-blue-50'
                              ) : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData(prev => ({
                                      ...prev,
                                      filas_ids: [...prev.filas_ids, fila.id]
                                    }))
                                  } else {
                                    setFormData(prev => ({
                                      ...prev,
                                      filas_ids: prev.filas_ids.filter(id => id !== fila.id)
                                    }))
                                  }
                                }}
                                className="rounded border-gray-300 text-[#305e73] focus:ring-[#305e73]"
                              />
                              <div className="flex-1">
                                <div className={`font-medium ${
                                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {fila.nome}
                                </div>
                              </div>
                            </label>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Alteração de Senha */}
            <div className="space-y-4 border-t pt-4">
              <h4 className={`text-sm font-medium ${
                actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
              }`}>
                Alterar Senha (Opcional)
              </h4>
              
              {/* Nova Senha */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
                }`}>
                  <Shield className="w-4 h-4 inline mr-2" />
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="Deixe em branco para manter a atual"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                    actualTheme === 'dark'
                      ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } ${errors.senha ? 'border-red-500' : ''}`}
                />
                {errors.senha && (
                  <p className="text-red-500 text-xs mt-1">{errors.senha}</p>
                )}
              </div>

              {/* Confirmar Nova Senha */}
              {formData.senha && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    actualTheme === 'dark' ? 'text-white/90' : 'text-gray-700'
                  }`}>
                    <Shield className="w-4 h-4 inline mr-2" />
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                    placeholder="Confirme a nova senha"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent ${
                      actualTheme === 'dark'
                        ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } ${errors.confirmarSenha ? 'border-red-500' : ''}`}
                  />
                  {errors.confirmarSenha && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmarSenha}</p>
                  )}
                </div>
              )}
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
