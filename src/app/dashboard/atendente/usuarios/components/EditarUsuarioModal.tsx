'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  X, 
  User,
  Save,
  Upload,
  Crown,
  UserCheck,
  Shield,
  Mail,
  Phone,
  Building,
  Briefcase,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string
  avatar?: string
  tipo: 'admin' | 'atendente' | 'assinante'
  status: 'ativo' | 'inativo' | 'suspenso'
  ultimo_acesso: string
  criado_em: string
  permissoes: string[]
  departamento?: string
  cargo?: string
}

interface EditarUsuarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (usuario: Usuario) => void
  onDelete: (id: string) => void
  usuario: Usuario | null
}

export default function EditarUsuarioModal({ 
  isOpen, 
  onClose, 
  onSave,
  onDelete,
  usuario 
}: EditarUsuarioModalProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo: 'assinante' as 'admin' | 'atendente' | 'assinante',
    status: 'ativo' as 'ativo' | 'inativo' | 'suspenso',
    departamento: '',
    cargo: '',
    avatar: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone || '',
        tipo: usuario.tipo,
        status: usuario.status,
        departamento: usuario.departamento || '',
        cargo: usuario.cargo || '',
        avatar: usuario.avatar || ''
      })
    }
  }, [usuario])

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

    if (newPassword && newPassword.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (newPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !usuario) return

    const usuarioAtualizado: Usuario = {
      ...usuario,
      ...formData
    }

    onSave(usuarioAtualizado)
    onClose()
  }

  const handleDelete = () => {
    if (usuario) {
      onDelete(usuario.id)
      onClose()
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          avatar: event.target?.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'admin': return Crown
      case 'atendente': return UserCheck
      case 'assinante': return Shield
      default: return User
    }
  }

  const getTipoColor = (tipo: string) => {
    if (isDark) {
      switch (tipo) {
        case 'admin': return 'text-red-300 bg-red-900/30'
        case 'atendente': return 'text-orange-300 bg-orange-900/30'
        case 'assinante': return 'text-indigo-300 bg-indigo-900/30'
        default: return 'text-slate-300 bg-slate-700/30'
      }
    } else {
      switch (tipo) {
        case 'admin': return 'text-red-600 bg-red-100'
        case 'atendente': return 'text-orange-600 bg-orange-100'
        case 'assinante': return 'text-indigo-600 bg-indigo-100'
        default: return 'text-gray-600 bg-gray-100'
      }
    }
  }

  const getStatusColor = (status: string) => {
    if (isDark) {
      switch (status) {
        case 'ativo': return 'text-green-300 bg-green-900/30'
        case 'inativo': return 'text-slate-300 bg-slate-700/30'
        case 'suspenso': return 'text-red-300 bg-red-900/30'
        default: return 'text-slate-300 bg-slate-700/30'
      }
    } else {
      switch (status) {
        case 'ativo': return 'text-green-600 bg-green-100'
        case 'inativo': return 'text-gray-600 bg-gray-100'
        case 'suspenso': return 'text-red-600 bg-red-100'
        default: return 'text-gray-600 bg-gray-100'
      }
    }
  }

  if (!usuario) return null

  const TipoIcon = getTipoIcon(formData.tipo)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 backdrop-blur-sm z-50 ${
              isDark ? 'bg-black/70' : 'bg-black/50'
            }`}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={`rounded-2xl shadow-2xl border w-full max-w-2xl max-h-[90vh] overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 border-slate-600' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Header */}
              <div className={`px-6 py-4 ${
                isDark 
                  ? 'bg-gradient-to-r from-slate-700 to-slate-600' 
                  : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Editar Usuário</h2>
                      <p className="text-white/80">Modifique as informações do usuário</p>
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
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#305e73] to-[#3a6d84] rounded-2xl flex items-center justify-center overflow-hidden">
                        {formData.avatar ? (
                          <img 
                            src={formData.avatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50">
                        <Upload className="w-4 h-4 text-gray-600" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${
                        isDark ? 'text-slate-100' : 'text-gray-900'
                      }`}>{usuario.nome}</h3>
                      <p className={`text-sm mb-2 ${
                        isDark ? 'text-slate-300' : 'text-gray-600'
                      }`}>{usuario.email}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getTipoColor(usuario.tipo)}`}>
                          <TipoIcon className="w-3 h-3" />
                          {usuario.tipo}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(usuario.status)}`}>
                          {usuario.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        <User className="w-4 h-4 inline mr-2" />
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.nome 
                            ? 'border-red-400' 
                            : isDark 
                              ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                              : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="Digite o nome completo"
                      />
                      {errors.nome && (
                        <p className="text-red-600 text-sm mt-1">{errors.nome}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.email 
                            ? 'border-red-400' 
                            : isDark 
                              ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                              : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="Digite o email"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        <Phone className="w-4 h-4 inline mr-2" />
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark 
                            ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        Tipo de Usuário *
                      </label>
                      <select
                        value={formData.tipo}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark 
                            ? 'border-slate-600 bg-slate-700/50 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="assinante">Assinante</option>
                        <option value="atendente">Atendente</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        <Building className="w-4 h-4 inline mr-2" />
                        Departamento
                      </label>
                      <input
                        type="text"
                        value={formData.departamento}
                        onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark 
                            ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="Ex: Atendimento, TI, Vendas"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        isDark ? 'text-slate-300' : 'text-gray-700'
                      }`}>
                        <Briefcase className="w-4 h-4 inline mr-2" />
                        Cargo
                      </label>
                      <input
                        type="text"
                        value={formData.cargo}
                        onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDark 
                            ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="Ex: Atendente, Gerente, Analista"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDark ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                      Status da Conta
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark 
                          ? 'border-slate-600 bg-slate-700/50 text-white' 
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="suspenso">Suspenso</option>
                    </select>
                  </div>

                  {/* Alterar Senha */}
                  <div className={`border-t pt-6 ${
                    isDark ? 'border-slate-600' : 'border-gray-200'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-slate-200' : 'text-gray-900'
                    }`}>Alterar Senha</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          Nova Senha
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                              errors.password 
                                ? 'border-red-400' 
                                : isDark 
                                  ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                                  : 'border-gray-300 bg-white text-gray-900'
                            }`}
                            placeholder="Digite a nova senha"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                              isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          Confirmar Senha
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.confirmPassword 
                              ? 'border-red-400' 
                              : isDark 
                                ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                                : 'border-gray-300 bg-white text-gray-900'
                          }`}
                          placeholder="Confirme a nova senha"
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm mt-2 ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Deixe em branco para manter a senha atual
                    </p>
                  </div>

                  {/* Zona de Perigo */}
                  <div className={`border-t pt-6 ${
                    isDark ? 'border-slate-600' : 'border-gray-200'
                  }`}>
                    <div className={`rounded-xl p-4 border ${
                      isDark 
                        ? 'bg-red-900/20 border-red-400/30' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`} />
                        <div className="flex-1">
                          <h4 className={`font-semibold mb-1 ${
                            isDark ? 'text-red-300' : 'text-red-900'
                          }`}>Zona de Perigo</h4>
                          <p className={`text-sm mb-3 ${
                            isDark ? 'text-red-200' : 'text-red-700'
                          }`}>
                            Esta ação não pode ser desfeita. O usuário será permanentemente removido do sistema.
                          </p>
                          
                          {!showDeleteConfirm ? (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              type="button"
                              onClick={() => setShowDeleteConfirm(true)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir Usuário
                            </motion.button>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className={`font-medium ${
                                isDark ? 'text-red-300' : 'text-red-700'
                              }`}>Tem certeza?</span>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                              >
                                Sim, excluir
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                                  isDark 
                                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                Cancelar
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 border-t ${
                isDark 
                  ? 'bg-slate-800 border-slate-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Criado em {new Date(usuario.criado_em).toLocaleDateString('pt-BR')}
                  </p>

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={onClose}
                      className={`px-6 py-3 border rounded-xl font-medium transition-colors ${
                        isDark 
                          ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancelar
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={handleSubmit}
                      className={`px-6 py-3 text-white rounded-xl font-medium flex items-center gap-2 transition-all ${
                        isDark 
                          ? 'bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 hover:shadow-lg' 
                          : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] hover:shadow-lg'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
