'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Users, Bot, Kanban, MessageSquare, AlertCircle, Loader2 } from 'lucide-react'
import { Fila } from '../page'
import { useTheme } from '@/contexts/ThemeContext'

interface Atendente {
  id: string
  nome: string
  email: string
  tipo: string
  ativo: boolean
}

interface CriarFilaModalProps {
  fila?: Fila // Para edição
  onClose: () => void
  onCreateFila: (fila: Omit<Fila, 'id' | 'criadoEm' | 'atualizadoEm' | 'estatisticas'>) => void
}

const coresPredefinidas = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
  '#EF4444', '#06B6D4', '#84CC16', '#F97316',
  '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
]

export default function CriarFilaModal({ fila, onClose, onCreateFila }: CriarFilaModalProps) {
  const { actualTheme } = useTheme()
  const isDark = actualTheme === 'dark'
  
  const [formData, setFormData] = useState({
    nome: fila?.nome || '',
    descricao: fila?.descricao || '',
    cor: fila?.cor || '#3B82F6',
    ordenacao: fila?.ordenacao || 1,
    ativa: fila?.ativa ?? true,
    chatBot: fila?.chatBot || false,
    kanban: fila?.kanban || false,
    whatsappChats: fila?.whatsappChats || false,
    prioridade: (fila?.prioridade || 'MEDIA') as 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE',
    atendentes: fila?.atendentes?.map(a => a.usuarioId) || [] as string[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [atendentesDisponiveis, setAtendentesDisponiveis] = useState<Atendente[]>([])
  const [loadingAtendentes, setLoadingAtendentes] = useState(false)

  const fetchAtendentes = async () => {
    setLoadingAtendentes(true)
    try {
      console.log('🔍 [ATENDENTES] Buscando atendentes...')
      
      const response = await fetch('/api/users?tipo=atendente', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('🔍 [ATENDENTES] Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [ATENDENTES] Dados recebidos:', data)
        
        // Verificar estrutura dos dados
        const atendentesData = data.data || data.users || data
        console.log('✅ [ATENDENTES] Dados processados:', atendentesData)
        
        if (Array.isArray(atendentesData)) {
          const atendentesAtivos = atendentesData.filter((user: Atendente) => user.ativo)
          console.log('✅ [ATENDENTES] Atendentes ativos:', atendentesAtivos)
          setAtendentesDisponiveis(atendentesAtivos)
        } else {
          console.warn('⚠️ [ATENDENTES] Dados não são um array:', atendentesData)
          setAtendentesDisponiveis([])
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [ATENDENTES] Erro ao buscar atendentes:', response.status, errorData)
        
        // Fallback: tentar endpoint de usuários
        console.log('🔄 [ATENDENTES] Tentando endpoint /api/usuarios...')
        const usersResponse = await fetch('/api/usuarios', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          console.log('✅ [USUARIOS] Dados recebidos:', usersData)
          
          const usuarios = usersData.data || usersData.users || usersData
          if (Array.isArray(usuarios)) {
            const usuariosAtivos = usuarios.filter((user: any) => user.ativo && user.tipo === 'ATENDENTE')
            console.log('✅ [USUARIOS] Atendentes encontrados:', usuariosAtivos)
            setAtendentesDisponiveis(usuariosAtivos)
          } else {
            setAtendentesDisponiveis([])
          }
        }
      }
    } catch (error) {
      console.error('❌ [ATENDENTES] Erro na requisição:', error)
      setAtendentesDisponiveis([])
    } finally {
      setLoadingAtendentes(false)
    }
  }

  useEffect(() => {
    fetchAtendentes()
  }, [])

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.nome.trim()) {
        newErrors.nome = 'Nome é obrigatório'
      }
      if (!formData.descricao.trim()) {
        newErrors.descricao = 'Descrição é obrigatória'
      }
    }

    if (step === 2) {
      if (formData.atendentes.length === 0) {
        newErrors.atendentes = 'Selecione pelo menos um atendente'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    setErrors({})
  }

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Convert form data to match Fila interface
      const filaData = {
        ...formData,
        atendentesIds: formData.atendentes // Send just the IDs to backend
      }
      // Remove the atendentes array since backend expects atendentesIds
      const { atendentes, ...finalData } = filaData
      onCreateFila(finalData as any)
    }
  }

  const toggleAtendente = (atendenteId: string) => {
    setFormData(prev => ({
      ...prev,
      atendentes: prev.atendentes.includes(atendenteId)
        ? prev.atendentes.filter(a => a !== atendenteId)
        : [...prev.atendentes, atendenteId]
    }))
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
          isDark ? 'bg-black/60' : 'bg-black/50'
        }`}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50' 
              : 'bg-white'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{fila ? 'Editar Fila de Atendimento' : 'Nova Fila de Atendimento'}</h2>
              <p className={`mt-1 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>Etapa {currentStep} de 3</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Progress Bar */}
          <div className={`px-6 py-4 ${
            isDark ? 'bg-slate-800/50' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <motion.div
                    animate={{
                      backgroundColor: step <= currentStep ? (isDark ? '#10B981' : '#305e73') : (isDark ? '#374151' : '#E5E7EB'),
                      color: step <= currentStep ? '#FFFFFF' : (isDark ? '#9CA3AF' : '#6B7280')
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  >
                    {step}
                  </motion.div>
                  {step < 3 && (
                    <motion.div
                      animate={{
                        backgroundColor: step < currentStep ? (isDark ? '#10B981' : '#305e73') : (isDark ? '#374151' : '#E5E7EB')
                      }}
                      className="w-16 h-1 mx-2"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className={`flex justify-between text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span>Informações Básicas</span>
              <span>Configurações</span>
              <span>Revisão</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Step 1: Informações Básicas */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nome da Fila *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all ${
                      isDark
                        ? `bg-slate-700 border-slate-600 text-white focus:ring-emerald-500 placeholder-gray-400 ${
                            errors.nome ? 'border-red-500 bg-red-900/20' : ''
                          }`
                        : `focus:ring-[#305e73] focus:border-transparent ${
                            errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`
                    }`}
                    placeholder="Ex: Suporte Técnico, Vendas Premium..."
                  />
                  {errors.nome && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Descrição *
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all resize-none ${
                      isDark
                        ? `bg-slate-700 border-slate-600 text-white focus:ring-emerald-500 placeholder-gray-400 ${
                            errors.descricao ? 'border-red-500 bg-red-900/20' : ''
                          }`
                        : `focus:ring-[#305e73] focus:border-transparent ${
                            errors.descricao ? 'border-red-300 bg-red-50' : 'border-gray-200'
                          }`
                    }`}
                    placeholder="Descreva o propósito e funcionamento desta fila..."
                  />
                  {errors.descricao && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.descricao}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Palette className="w-4 h-4 inline mr-2" />
                    Cor da Fila
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {coresPredefinidas.map((cor) => (
                      <motion.button
                        key={cor}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFormData(prev => ({ ...prev, cor }))}
                        className={`w-12 h-12 rounded-xl shadow-md border-4 transition-all ${
                          formData.cor === cor ? 'border-gray-400 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: cor }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Ordenação
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.ordenacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, ordenacao: parseInt(e.target.value) || 1 }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white focus:ring-emerald-500'
                        : 'border-gray-200 focus:ring-[#305e73] focus:border-transparent bg-white'
                    }`}
                    placeholder="1"
                  />
                  <p className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>Ordem de prioridade da fila (menor número = maior prioridade)</p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Configurações */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Prioridade da Fila
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'] as const).map((prioridade) => (
                      <motion.button
                        key={prioridade}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          prioridade
                        }))}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.prioridade === prioridade
                            ? isDark
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                              : 'border-[#305e73] bg-[#305e73]/10 text-[#305e73]'
                            : isDark
                              ? 'border-gray-600 hover:border-gray-500 text-gray-300'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {prioridade.charAt(0).toUpperCase() + prioridade.slice(1).toLowerCase()}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Integrações Ativas
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: 'chatBot', label: 'ChatBot', icon: Bot, desc: 'Integrar com sistema de chatbot' },
                      { key: 'kanban', label: 'Kanban', icon: Kanban, desc: 'Sincronizar com quadros kanban' },
                      { key: 'whatsappChats', label: 'WhatsApp', icon: MessageSquare, desc: 'Receber conversas do WhatsApp' }
                    ].map((integracao) => {
                      const IconComponent = integracao.icon
                      return (
                        <motion.label
                          key={integracao.key}
                          whileHover={{ scale: 1.01 }}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData[integracao.key as keyof typeof formData]
                              ? isDark
                                ? 'border-emerald-500 bg-emerald-500/20'
                                : 'border-[#305e73] bg-[#305e73]/10'
                              : isDark
                                ? 'border-gray-600 hover:border-gray-500'
                                : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData[integracao.key as keyof typeof formData] as boolean}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              [integracao.key]: e.target.checked
                            }))}
                            className="sr-only"
                          />
                          <IconComponent className={`w-6 h-6 ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`} />
                          <div className="flex-1">
                            <p className={`font-medium ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>{integracao.label}</p>
                            <p className={`text-sm ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>{integracao.desc}</p>
                          </div>
                        </motion.label>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Users className="w-4 h-4 inline mr-2" />
                    Atendentes Responsáveis *
                  </label>
                  {loadingAtendentes ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      <span className={`ml-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>Carregando atendentes...</span>
                    </div>
                  ) : (
                    <div className={`grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-xl p-3 ${
                      isDark ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      {atendentesDisponiveis.map((atendente) => (
                        <motion.label
                          key={atendente.id}
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            formData.atendentes.includes(atendente.id)
                              ? isDark
                                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                              : isDark
                                ? 'hover:bg-slate-700 border border-transparent'
                                : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.atendentes.includes(atendente.id)}
                            onChange={() => toggleAtendente(atendente.id)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            formData.atendentes.includes(atendente.id)
                              ? isDark
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-blue-500 bg-blue-500'
                              : isDark
                                ? 'border-gray-500'
                                : 'border-gray-300'
                          }`}>
                            {formData.atendentes.includes(atendente.id) && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              isDark ? 'text-gray-200' : 'text-gray-900'
                            }`}>{atendente.nome}</p>
                            <p className={`text-xs ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>{atendente.email}</p>
                          </div>
                        </motion.label>
                      ))}
                      {atendentesDisponiveis.length === 0 && (
                        <div className={`text-center py-4 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">Nenhum atendente disponível</p>
                        </div>
                      )}
                    </div>
                  )}
                  {errors.atendentes && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.atendentes}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Revisão */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className={`rounded-xl p-6 ${
                  isDark ? 'bg-slate-800/50' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Resumo da Fila</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: formData.cor }}
                      />
                      <div>
                        <p className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{formData.nome}</p>
                        <p className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>{formData.descricao}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Prioridade:</span>
                        <span className="ml-2 font-medium">{formData.prioridade.charAt(0).toUpperCase() + formData.prioridade.slice(1).toLowerCase()}</span>
                      </div>
                      <div>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Ordenação:</span>
                        <span className="ml-2 font-medium">#{formData.ordenacao}</span>
                      </div>
                    </div>

                    <div>
                      <p className={`text-sm mb-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>Integrações:</p>
                      <div className="flex gap-2">
                        {formData.chatBot && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">ChatBot</span>}
                        {formData.kanban && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Kanban</span>}
                        {formData.whatsappChats && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">WhatsApp</span>}
                        {!formData.chatBot && !formData.kanban && !formData.whatsappChats && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Nenhuma integração</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className={`text-sm mb-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>Atendentes ({formData.atendentes.length}):</p>
                      <div className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {formData.atendentes.length > 0 ? (
                          formData.atendentes.map(atendenteId => {
                            const atendente = atendentesDisponiveis.find(a => a.id === atendenteId)
                            return atendente ? atendente.nome : 'Atendente não encontrado'
                          }).join(', ')
                        ) : (
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Nenhum atendente selecionado</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between p-6 border-t ${
            isDark 
              ? 'border-gray-700 bg-slate-800/50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={currentStep === 1 ? onClose : handlePrevious}
              className={`px-6 py-2 transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:text-gray-200' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {currentStep === 1 ? 'Cancelar' : 'Voltar'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              className={`px-6 py-3 text-white rounded-xl font-medium transition-all relative overflow-hidden group ${
                isDark
                  ? ''
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg hover:shadow-xl'
              }`}
              style={isDark ? {
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8) 0%, rgba(5, 150, 105, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: '0 20px 40px -12px rgba(16, 185, 129, 0.6), 0 0 0 1px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              } : {}}
            >
              {currentStep === 3 ? (fila ? 'Salvar Alterações' : 'Criar Fila') : 'Próximo'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
