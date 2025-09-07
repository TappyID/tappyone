'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  X, 
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  UserCheck,
  Crown,
  Eye,
  EyeOff,
  Save,
  Upload,
  Key,
  Settings,
  Building,
  FileText
} from 'lucide-react'

interface CriarUsuarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (usuario: UsuarioData) => void
}

interface UsuarioData {
  nome: string
  email: string
  telefone?: string
  senha: string
  tipo: 'admin' | 'atendente' | 'assinante'
  status: 'ativo' | 'inativo'
  departamento?: string
  cargo?: string
  permissoes: string[]
  avatar?: string
}

const permissoesDisponiveis = [
  { id: 'usuarios.criar', nome: 'Criar Usuários', categoria: 'Usuários' },
  { id: 'usuarios.editar', nome: 'Editar Usuários', categoria: 'Usuários' },
  { id: 'usuarios.excluir', nome: 'Excluir Usuários', categoria: 'Usuários' },
  { id: 'usuarios.visualizar', nome: 'Visualizar Usuários', categoria: 'Usuários' },
  { id: 'atendimentos.visualizar', nome: 'Visualizar Atendimentos', categoria: 'Atendimentos' },
  { id: 'atendimentos.responder', nome: 'Responder Atendimentos', categoria: 'Atendimentos' },
  { id: 'atendimentos.transferir', nome: 'Transferir Atendimentos', categoria: 'Atendimentos' },
  { id: 'kanban.criar', nome: 'Criar Quadros Kanban', categoria: 'Kanban' },
  { id: 'kanban.editar', nome: 'Editar Quadros Kanban', categoria: 'Kanban' },
  { id: 'tags.gerenciar', nome: 'Gerenciar Tags', categoria: 'Tags' },
  { id: 'relatorios.visualizar', nome: 'Visualizar Relatórios', categoria: 'Relatórios' },
  { id: 'configuracoes.sistema', nome: 'Configurações do Sistema', categoria: 'Sistema' }
]

const permissoesPorTipo = {
  admin: permissoesDisponiveis.map(p => p.id),
  atendente: [
    'atendimentos.visualizar',
    'atendimentos.responder',
    'atendimentos.transferir',
    'kanban.criar',
    'kanban.editar',
    'tags.gerenciar'
  ],
  assinante: [
    'atendimentos.visualizar'
  ]
}

export default function CriarUsuarioModal({ 
  isOpen, 
  onClose, 
  onSave 
}: CriarUsuarioModalProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<UsuarioData>({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    tipo: 'atendente',
    status: 'ativo',
    departamento: '',
    cargo: '',
    permissoes: [],
    avatar: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      senha: '',
      tipo: 'atendente',
      status: 'ativo',
      departamento: '',
      cargo: '',
      permissoes: [],
      avatar: ''
    })
    setStep(1)
    setAvatarPreview(null)
  }

  const handleChange = (field: keyof UsuarioData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Atualizar permissões automaticamente quando o tipo mudar
    if (field === 'tipo') {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        permissoes: permissoesPorTipo[value as keyof typeof permissoesPorTipo] || []
      }))
    }
  }

  const handlePermissaoToggle = (permissaoId: string) => {
    setFormData(prev => ({
      ...prev,
      permissoes: prev.permissoes.includes(permissaoId)
        ? prev.permissoes.filter(p => p !== permissaoId)
        : [...prev.permissoes, permissaoId]
    }))
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setAvatarPreview(result)
        setFormData(prev => ({ ...prev, avatar: result }))
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
        case 'admin': return 'border-red-400/50 bg-red-900/30 text-red-300'
        case 'atendente': return 'border-orange-400/50 bg-orange-900/30 text-orange-300'
        case 'assinante': return 'border-indigo-400/50 bg-indigo-900/30 text-indigo-300'
        default: return 'border-slate-600 bg-slate-700/30 text-slate-300'
      }
    } else {
      switch (tipo) {
        case 'admin': return 'border-red-300 bg-red-50 text-red-700'
        case 'atendente': return 'border-orange-300 bg-orange-50 text-orange-700'
        case 'assinante': return 'border-indigo-300 bg-indigo-50 text-indigo-700'
        default: return 'border-gray-300 bg-gray-50 text-gray-700'
      }
    }
  }

  const getAvatarInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const categorias = Array.from(new Set(permissoesDisponiveis.map(p => p.categoria)))

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
            <div className={`rounded-2xl shadow-2xl border w-full max-w-4xl max-h-[90vh] overflow-hidden ${
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
                      <h2 className="text-2xl font-bold text-white">Novo Usuário</h2>
                      <p className="text-white/80">
                        Etapa {step} de 3 - {step === 1 ? 'Informações Básicas' : step === 2 ? 'Tipo e Cargo' : 'Permissões'}
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

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      className="bg-white h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(step / 3) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Informações Básicas */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Avatar Upload */}
                      <div className="text-center">
                        <div className="relative inline-block">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Avatar"
                              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-[#305e73] to-[#3a6d84] flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg">
                              {formData.nome ? getAvatarInitials(formData.nome) : <User className="w-8 h-8" />}
                            </div>
                          )}
                          
                          <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                            <Upload className="w-4 h-4 text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className={`text-sm mt-2 ${
                          isDark ? 'text-slate-400' : 'text-gray-500'
                        }`}>Clique no ícone para adicionar uma foto</p>
                      </div>

                      {/* Nome */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          <User className="w-4 h-4 inline mr-2" />
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          value={formData.nome}
                          onChange={(e) => handleChange('nome', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            isDark 
                              ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="Digite o nome completo"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            isDark 
                              ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="usuario@exemplo.com"
                          required
                        />
                      </div>

                      {/* Telefone */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          <Phone className="w-4 h-4 inline mr-2" />
                          Telefone (Opcional)
                        </label>
                        <input
                          type="tel"
                          value={formData.telefone}
                          onChange={(e) => handleChange('telefone', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            isDark 
                              ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      {/* Senha */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          <Key className="w-4 h-4 inline mr-2" />
                          Senha
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.senha}
                            onChange={(e) => handleChange('senha', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 ${
                              isDark 
                                ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                            }`}
                            placeholder="Digite uma senha segura"
                            required
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
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Tipo e Cargo */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      {/* Tipo de Usuário */}
                      <div>
                        <label className={`block text-sm font-semibold mb-3 ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          Tipo de Usuário
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(['admin', 'atendente', 'assinante'] as const).map((tipo) => {
                            const TipoIcon = getTipoIcon(tipo)
                            return (
                              <motion.label
                                key={tipo}
                                whileHover={{ scale: 1.02 }}
                                className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  formData.tipo === tipo
                                    ? getTipoColor(tipo)
                                    : isDark
                                      ? 'border-slate-600 hover:border-slate-500'
                                      : 'border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="tipo"
                                  value={tipo}
                                  checked={formData.tipo === tipo}
                                  onChange={(e) => handleChange('tipo', e.target.value)}
                                  className="sr-only"
                                />
                                <TipoIcon className={`w-8 h-8 mb-2 ${
                                  formData.tipo === tipo ? '' : isDark ? 'text-slate-400' : 'text-gray-400'
                                }`} />
                                <span className={`font-medium capitalize ${
                                  formData.tipo === tipo ? '' : isDark ? 'text-slate-300' : 'text-gray-700'
                                }`}>{tipo}</span>
                                <span className={`text-xs text-center mt-1 ${
                                  formData.tipo === tipo ? '' : isDark ? 'text-slate-400' : 'text-gray-500'
                                }`}>
                                  {tipo === 'admin' && 'Acesso total ao sistema'}
                                  {tipo === 'atendente' && 'Acesso aos atendimentos'}
                                  {tipo === 'assinante' && 'Acesso limitado'}
                                </span>
                              </motion.label>
                            )
                          })}
                        </div>
                      </div>

                      {/* Departamento */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          <Building className="w-4 h-4 inline mr-2" />
                          Departamento (Opcional)
                        </label>
                        <select
                          value={formData.departamento}
                          onChange={(e) => handleChange('departamento', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDark 
                              ? 'border-slate-600 bg-slate-700/50 text-white' 
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                        >
                          <option value="">Selecione um departamento</option>
                          <option value="Atendimento">Atendimento</option>
                          <option value="Vendas">Vendas</option>
                          <option value="Suporte">Suporte</option>
                          <option value="Financeiro">Financeiro</option>
                          <option value="Marketing">Marketing</option>
                          <option value="TI">TI</option>
                          <option value="RH">RH</option>
                        </select>
                      </div>

                      {/* Cargo */}
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          <Settings className="w-4 h-4 inline mr-2" />
                          Cargo (Opcional)
                        </label>
                        <input
                          type="text"
                          value={formData.cargo}
                          onChange={(e) => handleChange('cargo', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            isDark 
                              ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400' 
                              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                          }`}
                          placeholder="Ex: Gerente, Analista, Coordenador..."
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label className={`block text-sm font-semibold mb-3 ${
                          isDark ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                          Status Inicial
                        </label>
                        <div className="flex gap-4">
                          <motion.label
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.status === 'ativo'
                                ? isDark
                                  ? 'border-green-400/50 bg-green-900/30'
                                  : 'border-green-300 bg-green-50'
                                : isDark
                                  ? 'border-slate-600 hover:border-slate-500'
                                  : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="status"
                              value="ativo"
                              checked={formData.status === 'ativo'}
                              onChange={(e) => handleChange('status', e.target.value)}
                              className="sr-only"
                            />
                            <Eye className={`w-5 h-5 ${
                              formData.status === 'ativo' 
                                ? isDark ? 'text-green-400' : 'text-green-600'
                                : isDark ? 'text-slate-400' : 'text-gray-400'
                            }`} />
                            <span className={`font-medium ${
                              formData.status === 'ativo' 
                                ? isDark ? 'text-green-300' : 'text-green-700'
                                : isDark ? 'text-slate-300' : 'text-gray-600'
                            }`}>
                              Ativo
                            </span>
                          </motion.label>

                          <motion.label
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.status === 'inativo'
                                ? isDark
                                  ? 'border-slate-500 bg-slate-700/30'
                                  : 'border-gray-400 bg-gray-50'
                                : isDark
                                  ? 'border-slate-600 hover:border-slate-500'
                                  : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="status"
                              value="inativo"
                              checked={formData.status === 'inativo'}
                              onChange={(e) => handleChange('status', e.target.value)}
                              className="sr-only"
                            />
                            <EyeOff className={`w-5 h-5 ${
                              formData.status === 'inativo' 
                                ? isDark ? 'text-slate-300' : 'text-gray-600'
                                : isDark ? 'text-slate-400' : 'text-gray-400'
                            }`} />
                            <span className={`font-medium ${
                              formData.status === 'inativo' 
                                ? isDark ? 'text-slate-300' : 'text-gray-700'
                                : isDark ? 'text-slate-300' : 'text-gray-600'
                            }`}>
                              Inativo
                            </span>
                          </motion.label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Permissões */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div className={`rounded-xl p-4 border ${
                        isDark 
                          ? 'bg-blue-900/20 border-blue-400/30' 
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          <Shield className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            isDark ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                          <div>
                            <h4 className={`font-semibold ${
                              isDark ? 'text-blue-300' : 'text-blue-800'
                            }`}>Permissões por Tipo</h4>
                            <p className={`text-sm ${
                              isDark ? 'text-blue-200' : 'text-blue-700'
                            }`}>
                              As permissões foram pré-selecionadas baseadas no tipo de usuário escolhido. 
                              Você pode personalizar conforme necessário.
                            </p>
                          </div>
                        </div>
                      </div>

                      {categorias.map(categoria => (
                        <div key={categoria} className={`rounded-xl p-4 ${
                          isDark ? 'bg-slate-700/30' : 'bg-gray-50'
                        }`}>
                          <h4 className={`font-semibold mb-3 flex items-center gap-2 ${
                            isDark ? 'text-slate-200' : 'text-gray-900'
                          }`}>
                            <FileText className="w-4 h-4" />
                            {categoria}
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {permissoesDisponiveis
                              .filter(p => p.categoria === categoria)
                              .map(permissao => (
                                <motion.label
                                  key={permissao.id}
                                  whileHover={{ scale: 1.02 }}
                                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                    formData.permissoes.includes(permissao.id)
                                      ? isDark
                                        ? 'border-blue-400/50 bg-blue-900/30'
                                        : 'border-[#305e73] bg-[#305e73]/5'
                                      : isDark
                                        ? 'border-slate-600 hover:border-slate-500'
                                        : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.permissoes.includes(permissao.id)}
                                    onChange={() => handlePermissaoToggle(permissao.id)}
                                    className={`rounded focus:ring-2 ${
                                      isDark 
                                        ? 'border-slate-600 text-blue-400 focus:ring-blue-500 bg-slate-700'
                                        : 'border-gray-300 text-[#305e73] focus:ring-[#305e73] bg-white'
                                    }`}
                                  />
                                  <span className={`font-medium ${
                                    isDark ? 'text-slate-200' : 'text-gray-900'
                                  }`}>{permissao.nome}</span>
                                </motion.label>
                              ))}
                          </div>
                        </div>
                      ))}

                      {/* Resumo das Permissões */}
                      <div className={`rounded-xl p-4 ${
                        isDark ? 'bg-slate-700/30' : 'bg-gray-50'
                      }`}>
                        <h4 className={`font-semibold mb-2 ${
                          isDark ? 'text-slate-200' : 'text-gray-900'
                        }`}>Resumo</h4>
                        <p className={`text-sm ${
                          isDark ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          {formData.permissoes.length} permissões selecionadas de {permissoesDisponiveis.length} disponíveis
                        </p>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>

              {/* Footer Actions */}
              <div className={`px-6 py-4 border-t ${
                isDark 
                  ? 'bg-slate-800 border-slate-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {step > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setStep(step - 1)}
                        className={`px-6 py-3 border rounded-xl font-medium transition-colors ${
                          isDark 
                            ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Voltar
                      </motion.button>
                    )}
                    
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
                  </div>

                  {step < 3 ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setStep(step + 1)}
                      className={`px-6 py-3 text-white rounded-xl font-medium transition-all ${
                        isDark 
                          ? 'bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 hover:shadow-lg' 
                          : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] hover:shadow-lg'
                      }`}
                    >
                      Próximo
                    </motion.button>
                  ) : (
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
                      Criar Usuário
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
