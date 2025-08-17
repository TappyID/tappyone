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
  Zap
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface CriarQuadroModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateQuadro: (data: {
    nome: string
    nicho: string
    cor: string
    descricao: string
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

const nichosSugeridos = [
  'E-commerce',
  'Saúde e Bem-estar',
  'Educação',
  'Tecnologia',
  'Imobiliário',
  'Alimentação',
  'Moda e Beleza',
  'Serviços Financeiros',
  'Turismo',
  'Consultoria'
]

export default function CriarQuadroModal({ isOpen, onClose, onCreateQuadro }: CriarQuadroModalProps) {
  const [nome, setNome] = useState('')
  const [nicho, setNicho] = useState('')
  const [corSelecionada, setCorSelecionada] = useState(cores[0])
  const [isCreating, setIsCreating] = useState(false)
  const [showNichoSuggestions, setShowNichoSuggestions] = useState(false)
  const { actualTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !nicho.trim()) return

    setIsCreating(true)
    try {
      await onCreateQuadro({
        nome: nome.trim(),
        nicho: nicho.trim(),
        cor: corSelecionada.valor,
        descricao: `Quadro para gerenciar ${nicho.toLowerCase()}`
      })
      
      // Reset form
      setNome('')
      setNicho('')
      setCorSelecionada(cores[0])
      onClose()
    } catch (error) {
      console.error('Erro ao criar quadro:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleNichoSelect = (nichoSelecionado: string) => {
    setNicho(nichoSelecionado)
    setShowNichoSuggestions(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
            actualTheme === 'dark'
              ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border border-slate-700'
              : 'bg-gradient-to-br from-white via-blue-50/30 to-white border border-blue-200/50'
          }`}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-8 py-6 border-b ${
            actualTheme === 'dark' ? 'border-slate-700/50' : 'border-blue-200/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className={`p-3 rounded-xl ${
                    actualTheme === 'dark'
                      ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                      : 'bg-gradient-to-br from-blue-100 to-purple-100'
                  }`}
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  <Trello className="w-6 h-6 text-blue-500" />
                </motion.div>
                <div>
                  <h2 className={`text-xl font-bold ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Criar Novo Quadro
                  </h2>
                  <p className={`text-sm ${
                    actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                  }`}>
                    Configure seu quadro e deixe a IA gerar as colunas automaticamente
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  actualTheme === 'dark'
                    ? 'hover:bg-white/10 text-white/60 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Nome do Quadro */}
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
                placeholder="Ex: Vendas Q1 2024, Suporte Técnico..."
                className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500/20 ${
                  actualTheme === 'dark'
                    ? 'bg-slate-800/50 border-slate-600 text-white placeholder-white/40'
                    : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                required
              />
            </div>

            {/* Nicho */}
            <div className="relative">
              <label className={`block text-sm font-medium mb-3 ${
                actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Lightbulb className="w-4 h-4 inline mr-2" />
                Nicho/Área de Atuação
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nicho}
                  onChange={(e) => setNicho(e.target.value)}
                  onFocus={() => setShowNichoSuggestions(true)}
                  placeholder="Ex: E-commerce, Saúde, Educação..."
                  className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-blue-500/20 ${
                    actualTheme === 'dark'
                      ? 'bg-slate-800/50 border-slate-600 text-white placeholder-white/40'
                      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  required
                />
                
                {/* Sugestões de Nicho */}
                <AnimatePresence>
                  {showNichoSuggestions && (
                    <motion.div
                      className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-lg z-10 ${
                        actualTheme === 'dark'
                          ? 'bg-slate-800 border-slate-600'
                          : 'bg-white border-gray-200'
                      }`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="p-3">
                        <p className={`text-xs font-medium mb-2 ${
                          actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                        }`}>
                          Sugestões populares:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {nichosSugeridos.map((nichoSugerido) => (
                            <motion.button
                              key={nichoSugerido}
                              type="button"
                              onClick={() => handleNichoSelect(nichoSugerido)}
                              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                                actualTheme === 'dark'
                                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {nichoSugerido}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Seleção de Cor */}
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Plus className="w-4 h-4 inline mr-2" />
                Cor do Quadro
              </label>
              <div className="grid grid-cols-4 gap-3">
                {cores.map((cor) => (
                  <motion.button
                    key={cor.valor}
                    type="button"
                    onClick={() => setCorSelecionada(cor)}
                    className={`relative p-4 rounded-xl transition-all ${
                      corSelecionada.valor === cor.valor
                        ? 'ring-2 ring-offset-2 ring-blue-500'
                        : ''
                    } ${
                      actualTheme === 'dark' ? 'ring-offset-slate-800' : 'ring-offset-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${cor.gradient}`} />
                    <p className={`text-xs mt-2 ${
                      actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
                    }`}>
                      {cor.nome}
                    </p>
                    {corSelecionada.valor === cor.valor && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Plus className="w-3 h-3 text-white rotate-45" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {nome && nicho && (
              <motion.div
                className={`p-4 rounded-xl border-2 border-dashed ${
                  actualTheme === 'dark'
                    ? 'border-slate-600 bg-slate-800/30'
                    : 'border-gray-300 bg-gray-50/50'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: corSelecionada.valor }}
                  />
                  <span className={`font-medium ${
                    actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {nome}
                  </span>
                </div>
                <p className={`text-sm ${
                  actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                }`}>
                  Quadro para gerenciar {nicho.toLowerCase()}
                </p>
              </motion.div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className={`text-sm ${
                  actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                }`}>
                  IA gerará colunas automaticamente
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
                  type="submit"
                  disabled={!nome.trim() || !nicho.trim() || isCreating}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    !nome.trim() || !nicho.trim() || isCreating
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  } bg-gradient-to-r ${corSelecionada.gradient} text-white hover:shadow-lg`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
