'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { 
  User,
  Phone,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  MessageSquare,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Camera,
  Upload,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GeralSectionProps {
  onConfigChange?: () => void
}

export default function GeralSection({ onConfigChange }: GeralSectionProps) {
  const { actualTheme } = useTheme()
  const { user } = useAuth()
  const isDark = actualTheme === 'dark'
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    fotoPerfil: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  })
  
  const [chats, setChats] = useState<any[]>([])
  const [previewFoto, setPreviewFoto] = useState('')
  const [showPassword, setShowPassword] = useState({
    atual: false,
    nova: false,
    confirmar: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nome: user.nome || '',
        email: user.email || '',
        fotoPerfil: (user as any).fotoPerfil || ''
      }))
      setPreviewFoto((user as any).fotoPerfil || '')
      
      // Buscar chats do atendente
      fetchAttendenteChats()
    }
  }, [user])
  
  const fetchAttendenteChats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/atendentes/chats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setChats(data)
      }
    } catch (error) {
      console.error('Erro ao buscar chats:', error)
    }
  }
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
    setSuccess('')
  }
  
  const handleFotoUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setFormData(prev => ({ ...prev, fotoPerfil: base64 }))
      setPreviewFoto(base64)
    }
    reader.readAsDataURL(file)
  }
  
  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    
    // Validações
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório')
      return
    }
    
    if (!formData.email.trim()) {
      setError('Email é obrigatório')
      return
    }
    
    // Se está tentando mudar senha
    if (formData.novaSenha || formData.confirmarSenha) {
      if (!formData.senhaAtual) {
        setError('Digite sua senha atual para alterar a senha')
        return
      }
      
      if (formData.novaSenha !== formData.confirmarSenha) {
        setError('As senhas não coincidem')
        return
      }
      
      if (formData.novaSenha.length < 6) {
        setError('A nova senha deve ter no mínimo 6 caracteres')
        return
      }
    }
    
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      
      // Preparar payload
      const payload: any = {
        nome: formData.nome,
        email: formData.email
      }
      
      if (formData.telefone) {
        payload.telefone = formData.telefone
      }
      
      if (formData.fotoPerfil) {
        payload.fotoPerfil = formData.fotoPerfil
      }
      
      if (formData.novaSenha) {
        payload.senhaAtual = formData.senhaAtual
        payload.novaSenha = formData.novaSenha
      }
      
      const response = await fetch('/api/atendentes/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao atualizar dados')
      }
      
      setSuccess('Dados atualizados com sucesso!')
      
      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: ''
      }))
      
      if (onConfigChange) {
        onConfigChange()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar dados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Informações Pessoais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl border-slate-600/50' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${
            isDark ? 'bg-blue-500/20' : 'bg-blue-100'
          }`}>
            <User className={`w-6 h-6 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Informações Pessoais</h3>
            <p className={`${
              isDark ? 'text-slate-300' : 'text-gray-600'
            }`}>Atualize seus dados cadastrais</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Foto de Perfil */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                isDark ? 'border-slate-600' : 'border-blue-200'
              }`}>
                {previewFoto ? (
                  <img src={previewFoto} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    isDark ? 'bg-slate-700' : 'bg-gray-200'
                  }`}>
                    <User className={`w-12 h-12 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                  </div>
                )}
              </div>
              <label htmlFor="foto-upload" className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer ${
                isDark ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
              } text-white shadow-lg transition-colors`}>
                <Camera className="w-4 h-4" />
                <input
                  id="foto-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFotoUpload(file)
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Foto de Perfil
              </h4>
              <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Clique no ícone para alterar
              </p>
              {previewFoto && (
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, fotoPerfil: '' }))
                    setPreviewFoto('')
                  }}
                  className={`text-sm flex items-center gap-1 ${
                    isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                  Remover foto
                </button>
              )}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Nome *
            </label>
            <Input
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              className={isDark ? 'bg-slate-700/50 border-slate-600 text-white' : ''}
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Email * (somente leitura)
            </label>
            <Input
              value={formData.email}
              disabled
              className={`${isDark ? 'bg-slate-700/30 border-slate-600 text-slate-400' : 'bg-gray-100'} cursor-not-allowed`}
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Telefone
            </label>
            <Input
              value={formData.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              className={isDark ? 'bg-slate-700/50 border-slate-600 text-white' : ''}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              <strong>{chats.length}</strong> {chats.length === 1 ? 'chat' : 'chats'} sob sua responsabilidade
            </span>
          </div>
        </div>
      </motion.div>

      {/* Alterar Senha */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl p-6 border ${
          isDark 
            ? 'bg-gradient-to-r from-slate-800/60 to-slate-700/60 backdrop-blur-xl border-slate-600/50' 
            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${
            isDark ? 'bg-purple-500/20' : 'bg-purple-100'
          }`}>
            <Lock className={`w-6 h-6 ${
              isDark ? 'text-purple-400' : 'text-purple-600'
            }`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Alterar Senha</h3>
            <p className={`${
              isDark ? 'text-slate-300' : 'text-gray-600'
            }`}>Atualize sua senha de acesso</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Senha Atual
            </label>
            <div className="relative">
              <Input
                type={showPassword.atual ? 'text' : 'password'}
                value={formData.senhaAtual}
                onChange={(e) => handleChange('senhaAtual', e.target.value)}
                className={isDark ? 'bg-slate-700/50 border-slate-600 text-white pr-10' : 'pr-10'}
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, atual: !prev.atual }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.atual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Nova Senha
            </label>
            <div className="relative">
              <Input
                type={showPassword.nova ? 'text' : 'password'}
                value={formData.novaSenha}
                onChange={(e) => handleChange('novaSenha', e.target.value)}
                className={isDark ? 'bg-slate-700/50 border-slate-600 text-white pr-10' : 'pr-10'}
                placeholder="Digite a nova senha (mín. 6 caracteres)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, nova: !prev.nova }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.nova ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Input
                type={showPassword.confirmar ? 'text' : 'password'}
                value={formData.confirmarSenha}
                onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                className={isDark ? 'bg-slate-700/50 border-slate-600 text-white pr-10' : 'pr-10'}
                placeholder="Digite a nova senha novamente"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, confirmar: !prev.confirmar }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.confirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mensagens de Erro/Sucesso */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/30"
        >
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-600 dark:text-red-400">{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/30"
        >
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-600 dark:text-green-400">{success}</span>
        </motion.div>
      )}

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
