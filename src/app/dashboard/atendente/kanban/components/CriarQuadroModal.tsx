'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Trello, 
  Sparkles, 
  Loader2,
  Plus,
  Target,
  Lightbulb,
  Zap,
  Brain,
  Users,
  ShoppingCart,
  Truck,
  Headphones,
  Scale,
  Building,
  Stethoscope,
  GraduationCap,
  Palette,
  DollarSign,
  Briefcase,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Wand2,
  Columns,
  Star
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface CriarQuadroModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateQuadro: (data: {
    nome: string
    nicho: string
    cor: string
    descricao?: string
    colunas: string[]
  }) => Promise<void>
}

const cores = [
  { nome: 'Azul', valor: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
  { nome: 'Verde', valor: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
  { nome: 'Roxo', valor: '#8b5cf6', gradient: 'from-violet-500 to-violet-600' },
  { nome: 'Rosa', valor: '#ec4899', gradient: 'from-pink-500 to-pink-600' },
  { nome: 'Laranja', valor: '#f59e0b', gradient: 'from-amber-500 to-amber-600' },
  { nome: 'Vermelho', valor: '#ef4444', gradient: 'from-red-500 to-red-600' },
  { nome: 'Ciano', valor: '#06b6d4', gradient: 'from-cyan-500 to-cyan-600' },
  { nome: 'Índigo', valor: '#6366f1', gradient: 'from-indigo-500 to-indigo-600' }
]

const nichosInteligentes = [
  {
    nome: 'Delivery',
    icon: Truck,
    cor: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
    descricao: 'Sistema de entrega e pedidos',
    colunas: ['Conversa', 'Em Preparo', 'Em Entrega', 'Entregue', 'Cancelado'],
    categoria: 'negocio'
  },
  {
    nome: 'E-commerce',
    icon: ShoppingCart,
    cor: '#10b981',
    gradient: 'from-emerald-500 to-green-500',
    descricao: 'Vendas online e marketplace',
    colunas: ['Lead', 'Negociação', 'Pagamento', 'Enviado', 'Finalizado'],
    categoria: 'negocio'
  },
  {
    nome: 'Atendimento',
    icon: Headphones,
    cor: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-500',
    descricao: 'Suporte e atendimento ao cliente',
    colunas: ['Atendimento', 'Suporte', 'Jurídico', 'Resolvido', 'Arquivado'],
    categoria: 'fila'
  },
  {
    nome: 'Saúde',
    icon: Stethoscope,
    cor: '#ec4899',
    gradient: 'from-pink-500 to-rose-500',
    descricao: 'Gestão de pacientes e consultas',
    colunas: ['Agendado', 'Consulta', 'Exames', 'Tratamento', 'Alta'],
    categoria: 'negocio'
  },
  {
    nome: 'Educação',
    icon: GraduationCap,
    cor: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-500',
    descricao: 'Cursos e educação online',
    colunas: ['Interesse', 'Matrícula', 'Estudando', 'Concluído', 'Certificado'],
    categoria: 'negocio'
  },
  {
    nome: 'Imobiliário',
    icon: Building,
    cor: '#06b6d4',
    gradient: 'from-cyan-500 to-teal-500',
    descricao: 'Vendas e aluguel de imóveis',
    colunas: ['Interesse', 'Visita', 'Proposta', 'Negociação', 'Fechado'],
    categoria: 'negocio'
  },
  {
    nome: 'Jurídico',
    icon: Scale,
    cor: '#6366f1',
    gradient: 'from-indigo-500 to-blue-500',
    descricao: 'Processos e consultoria jurídica',
    colunas: ['Consulta', 'Análise', 'Processo', 'Audiência', 'Concluído'],
    categoria: 'fila'
  },
  {
    nome: 'Personalizado',
    icon: Palette,
    cor: '#ef4444',
    gradient: 'from-red-500 to-pink-500',
    descricao: 'Crie suas próprias colunas',
    colunas: [],
    categoria: 'custom'
  }
]

export default function CriarQuadroModal({ isOpen, onClose, onCreateQuadro }: CriarQuadroModalProps) {
  const [nome, setNome] = useState('')
  const [nichoSelecionado, setNichoSelecionado] = useState<typeof nichosInteligentes[0] | null>(null)
  const [etapa, setEtapa] = useState<'nicho' | 'detalhes' | 'preview'>('nicho')
  const [colunasPersonalizadas, setColunasPersonalizadas] = useState<string[]>([''])
  const [isCreating, setIsCreating] = useState(false)
  const [fluxoSelecionado, setFluxoSelecionado] = useState('')
  const [tagSelecionada, setTagSelecionada] = useState('')
  const [fluxos, setFluxos] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const { actualTheme } = useTheme()

  const handleSubmit = async () => {
    if (!nome.trim() || !nichoSelecionado) return

    setIsCreating(true)
    try {
      const colunasParaCriar = nichoSelecionado.categoria === 'custom' 
        ? colunasPersonalizadas.filter(col => col.trim() !== '')
        : nichoSelecionado.colunas

      console.log('🎯 [MODAL] Dados para criação do quadro:', {
        nome: nome.trim(),
        nicho: nichoSelecionado.nome,
        categoria: nichoSelecionado.categoria,
        cor: nichoSelecionado.cor,
        colunasOriginais: nichoSelecionado.colunas,
        colunasPersonalizadas: colunasPersonalizadas,
        colunasFinais: colunasParaCriar,
        fluxo: fluxoSelecionado,
        tag: tagSelecionada
      })

      await onCreateQuadro({
        nome: nome.trim(),
        nicho: nichoSelecionado.nome,
        cor: nichoSelecionado.cor,
        descricao: nichoSelecionado.descricao,
        colunas: colunasParaCriar
      })
      
      // Reset form
      setNome('')
      setNichoSelecionado(null)
      setEtapa('nicho')
      setColunasPersonalizadas([''])
      setFluxoSelecionado('')
      setTagSelecionada('')
      onClose()
    } catch (error) {
      console.error('Erro ao criar quadro:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleNichoSelect = (nicho: typeof nichosInteligentes[0]) => {
    setNichoSelecionado(nicho)
    if (nicho.categoria === 'custom') {
      setColunasPersonalizadas(['Nova Coluna', 'Em Andamento', 'Concluído'])
    }
    setEtapa('detalhes')
  }

  const addColunaPersonalizada = () => {
    setColunasPersonalizadas([...colunasPersonalizadas, ''])
  }

  const updateColunaPersonalizada = (index: number, valor: string) => {
    const novasColunas = [...colunasPersonalizadas]
    novasColunas[index] = valor
    setColunasPersonalizadas(novasColunas)
  }

  const removeColunaPersonalizada = (index: number) => {
    if (colunasPersonalizadas.length > 1) {
      const novasColunas = colunasPersonalizadas.filter((_, i) => i !== index)
      setColunasPersonalizadas(novasColunas)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative ${
            actualTheme === 'dark'
              ? 'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border border-slate-700/50 backdrop-blur-2xl'
              : 'bg-gradient-to-br from-white/95 via-blue-50/95 to-white/95 border border-blue-200/50 backdrop-blur-2xl'
          }`}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", bounce: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Particles Background */}
          {actualTheme === 'dark' && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          )}

          {/* Header */}
          <div className={`relative px-8 py-6 border-b ${
            actualTheme === 'dark' ? 'border-slate-700/50' : 'border-blue-200/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className={`p-4 rounded-2xl ${
                    actualTheme === 'dark'
                      ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-400/20'
                      : 'bg-gradient-to-br from-blue-100 to-purple-100'
                  }`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  animate={{
                    boxShadow: actualTheme === 'dark' ? [
                      '0 0 20px rgba(59, 130, 246, 0.3)',
                      '0 0 40px rgba(147, 51, 234, 0.3)',
                      '0 0 20px rgba(59, 130, 246, 0.3)'
                    ] : []
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className={`w-7 h-7 ${
                    actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </motion.div>
                <div>
                  <motion.h2 
                    className={`text-2xl font-bold ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Assistente IA - Quadros
                  </motion.h2>
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <p className={`text-sm ${
                      actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                    }`}>
                      {etapa === 'nicho' ? 'Escolha seu nicho e eu criarei as colunas perfeitas' :
                       etapa === 'detalhes' ? 'Personalize os detalhes do seu quadro' :
                       'Visualize seu quadro antes de criar'}
                    </p>
                  </motion.div>
                </div>
              </div>
              
              <motion.button
                onClick={onClose}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  actualTheme === 'dark'
                    ? 'hover:bg-red-500/20 text-white/60 hover:text-red-400 border border-white/10 hover:border-red-400/30'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mt-6">
              <div className="flex items-center gap-4">
                {['nicho', 'detalhes', 'preview'].map((step, index) => {
                  const isActive = etapa === step
                  const isCompleted = ['nicho', 'detalhes', 'preview'].indexOf(etapa) > index
                  return (
                    <motion.div
                      key={step}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : isActive
                            ? actualTheme === 'dark'
                              ? 'border-blue-400 bg-blue-500/20 text-blue-400'
                              : 'border-blue-500 bg-blue-50 text-blue-600'
                            : actualTheme === 'dark'
                            ? 'border-slate-600 text-slate-400'
                            : 'border-gray-300 text-gray-400'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        animate={isActive ? { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' } : {}}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </motion.div>
                      {index < 2 && (
                        <motion.div
                          className={`w-12 h-0.5 ${
                            isCompleted
                              ? 'bg-emerald-500'
                              : actualTheme === 'dark'
                              ? 'bg-slate-600'
                              : 'bg-gray-300'
                          }`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: isCompleted ? 1 : 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {etapa === 'nicho' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <motion.div
                    className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Wand2 className="w-8 h-8 text-blue-400" />
                  </motion.div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Escolha seu nicho
                  </h3>
                  <p className={`text-sm ${
                    actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                  }`}>
                    Selecione um modelo e a IA criará as colunas automaticamente
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {nichosInteligentes.map((nicho, index) => {
                    const IconComponent = nicho.icon
                    return (
                      <motion.button
                        key={nicho.nome}
                        onClick={() => handleNichoSelect(nicho)}
                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group ${
                          actualTheme === 'dark'
                            ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/80'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{
                          boxShadow: actualTheme === 'dark' 
                            ? `0 10px 25px ${nicho.cor}15` 
                            : 'none'
                        }}
                      >
                        <motion.div
                          className="flex items-center gap-3 mb-3"
                          whileHover={{ x: 5 }}
                        >
                          <div
                            className="p-2 rounded-lg"
                            style={{
                              background: `linear-gradient(135deg, ${nicho.cor}20, ${nicho.cor}10)`
                            }}
                          >
                            <IconComponent 
                              className="w-5 h-5" 
                              style={{ color: nicho.cor }}
                            />
                          </div>
                          <h4 className={`font-semibold ${
                            actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {nicho.nome}
                          </h4>
                        </motion.div>
                        
                        <p className={`text-xs mb-4 ${
                          actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                        }`}>
                          {nicho.descricao}
                        </p>

                        {nicho.colunas.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {nicho.colunas.slice(0, 3).map((coluna, i) => (
                              <span
                                key={i}
                                className={`px-2 py-1 text-xs rounded-md ${
                                  actualTheme === 'dark'
                                    ? 'bg-slate-700/50 text-white/70'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {coluna}
                              </span>
                            ))}
                            {nicho.colunas.length > 3 && (
                              <span className={`px-2 py-1 text-xs rounded-md ${
                                actualTheme === 'dark'
                                  ? 'bg-slate-700/50 text-white/70'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                +{nicho.colunas.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <motion.div
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.1 }}
                        >
                          <ArrowRight className="w-4 h-4 text-blue-400" />
                        </motion.div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {etapa === 'detalhes' && nichoSelecionado && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <motion.button
                    onClick={() => setEtapa('nicho')}
                    className={`p-2 rounded-lg ${
                      actualTheme === 'dark'
                        ? 'hover:bg-slate-700 text-white/60 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    whileHover={{ x: -2 }}
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </motion.button>
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${nichoSelecionado.cor}20, ${nichoSelecionado.cor}10)`
                      }}
                    >
                      <nichoSelecionado.icon 
                        className="w-5 h-5" 
                        style={{ color: nichoSelecionado.cor }}
                      />
                    </div>
                    <div>
                      <h3 className={`font-bold ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {nichoSelecionado.nome}
                      </h3>
                      <p className={`text-sm ${
                        actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                      }`}>
                        {nichoSelecionado.descricao}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Target className="w-4 h-4 inline mr-2" />
                    Nome do Quadro
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder={`Ex: ${nichoSelecionado.nome} 2024, Gestão ${nichoSelecionado.nome}...`}
                    className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500/20 ${
                      actualTheme === 'dark'
                        ? 'bg-slate-800/50 border-slate-600 text-white placeholder-white/40'
                        : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                {/* Seletor de Fila */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Users className="w-4 h-4 inline mr-2" />
                    Fila (Fluxo)
                  </label>
                  <select
                    value={fluxoSelecionado}
                    onChange={(e) => setFluxoSelecionado(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500/20 ${
                      actualTheme === 'dark'
                        ? 'bg-slate-800/50 border-slate-600 text-white'
                        : 'bg-white/50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Selecione uma fila (opcional)</option>
                    <option value="atendimento">Atendimento Geral</option>
                    <option value="vendas">Vendas</option>
                    <option value="suporte">Suporte Técnico</option>
                    <option value="cobranca">Cobrança</option>
                    <option value="juridico">Jurídico</option>
                  </select>
                </div>

                {/* Seletor de Tag */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <Star className="w-4 h-4 inline mr-2" />
                    Tag
                  </label>
                  <select
                    value={tagSelecionada}
                    onChange={(e) => setTagSelecionada(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500/20 ${
                      actualTheme === 'dark'
                        ? 'bg-slate-800/50 border-slate-600 text-white'
                        : 'bg-white/50 border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Selecione uma tag (opcional)</option>
                    <option value="urgente">Urgente</option>
                    <option value="vip">VIP</option>
                    <option value="potencial">Lead Potencial</option>
                    <option value="recorrente">Cliente Recorrente</option>
                    <option value="novo">Novo Cliente</option>
                  </select>
                </div>

                {nichoSelecionado.categoria === 'custom' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className={`text-sm font-medium ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <Columns className="w-4 h-4 inline mr-2" />
                        Colunas Personalizadas
                      </label>
                      <motion.button
                        type="button"
                        onClick={addColunaPersonalizada}
                        className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1 ${
                          actualTheme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar
                      </motion.button>
                    </div>
                    
                    <div className="space-y-2">
                      {colunasPersonalizadas.map((coluna, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <input
                            type="text"
                            value={coluna}
                            onChange={(e) => updateColunaPersonalizada(index, e.target.value)}
                            placeholder={`Coluna ${index + 1}`}
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                              actualTheme === 'dark'
                                ? 'bg-slate-800/50 border-slate-600 text-white placeholder-white/40'
                                : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                          />
                          {colunasPersonalizadas.length > 1 && (
                            <motion.button
                              type="button"
                              onClick={() => removeColunaPersonalizada(index)}
                              className={`p-2 rounded-lg ${
                                actualTheme === 'dark'
                                  ? 'hover:bg-red-500/20 text-red-400'
                                  : 'hover:bg-red-100 text-red-600'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className={`text-sm ${
                      actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      {nichoSelecionado.categoria === 'custom' 
                        ? 'Colunas personalizadas' 
                        : `${nichoSelecionado.colunas.length} colunas serão criadas automaticamente`}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <motion.button
                      type="button"
                      onClick={onClose}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                        actualTheme === 'dark'
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancelar
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      onClick={() => setEtapa('preview')}
                      disabled={!nome.trim()}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 text-white ${
                        !nome.trim()
                          ? 'opacity-50 cursor-not-allowed bg-gray-400'
                          : `bg-gradient-to-r ${nichoSelecionado.gradient} hover:shadow-lg`
                      }`}
                      whileHover={{ scale: nome.trim() ? 1.02 : 1 }}
                      whileTap={{ scale: nome.trim() ? 0.98 : 1 }}
                    >
                      <ArrowRight className="w-4 h-4" />
                      Preview
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {etapa === 'preview' && nichoSelecionado && nome && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <motion.button
                    onClick={() => setEtapa('detalhes')}
                    className={`p-2 rounded-lg ${
                      actualTheme === 'dark'
                        ? 'hover:bg-slate-700 text-white/60 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    whileHover={{ x: -2 }}
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </motion.button>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Preview do Quadro
                    </h3>
                    <p className={`text-sm ${
                      actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      Visualize como seu quadro ficará
                    </p>
                  </div>
                </div>

                <motion.div
                  className={`p-6 rounded-2xl border-2 border-dashed ${
                    actualTheme === 'dark'
                      ? 'border-slate-600 bg-slate-800/30'
                      : 'border-gray-300 bg-gray-50/50'
                  }`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${nichoSelecionado.cor}20, ${nichoSelecionado.cor}10)`
                      }}
                    >
                      <nichoSelecionado.icon 
                        className="w-6 h-6" 
                        style={{ color: nichoSelecionado.cor }}
                      />
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold ${
                        actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {nome}
                      </h4>
                      <p className={`text-sm ${
                        actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                      }`}>
                        {nichoSelecionado.descricao}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className={`text-sm font-medium ${
                      actualTheme === 'dark' ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Colunas que serão criadas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(nichoSelecionado.categoria === 'custom' ? colunasPersonalizadas.filter(c => c.trim()) : nichoSelecionado.colunas).map((coluna, i) => (
                        <motion.div
                          key={i}
                          className={`px-4 py-2 rounded-lg border ${
                            actualTheme === 'dark'
                              ? 'bg-slate-700/50 border-slate-600 text-white'
                              : 'bg-white border-gray-200 text-gray-800'
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          style={{
                            borderLeftColor: nichoSelecionado.cor,
                            borderLeftWidth: '3px'
                          }}
                        >
                          {coluna}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <div className="flex items-center justify-between pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className={`text-sm ${
                      actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      Tudo pronto para criar seu quadro!
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <motion.button
                      type="button"
                      onClick={onClose}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                        actualTheme === 'dark'
                          ? 'bg-slate-700 hover:bg-slate-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancelar
                    </motion.button>
                    
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isCreating}
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 text-white ${
                        isCreating
                          ? 'opacity-50 cursor-not-allowed bg-gray-400'
                          : `bg-gradient-to-r ${nichoSelecionado.gradient} hover:shadow-lg`
                      }`}
                      whileHover={{ scale: isCreating ? 1 : 1.02 }}
                      whileTap={{ scale: isCreating ? 1 : 0.98 }}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Criar Quadro
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
