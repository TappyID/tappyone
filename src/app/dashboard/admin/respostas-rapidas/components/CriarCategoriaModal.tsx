'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Palette, Save, MessageCircle, Users, Headphones, DollarSign, HelpCircle, Star, Heart, Zap, Shield, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CreateCategoriaRequest } from '@/hooks/useRespostasRapidas'

interface CriarCategoriaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateCategoriaRequest) => Promise<void>
  onUpdate?: (id: string, data: CreateCategoriaRequest) => Promise<void>
  editingCategoria?: any
}

const coresPredefinidas = [
  '#305e73', '#3a6d84', '#2563eb', '#7c3aed', '#dc2626', '#ea580c',
  '#ca8a04', '#16a34a', '#0891b2', '#c2410c', '#9333ea', '#e11d48',
  '#0f766e', '#4338ca', '#7c2d12', '#166534', '#1e40af', '#be123c'
]

const iconesPredefinidos = [
  { name: 'MessageCircle', component: MessageCircle, label: 'Mensagem' },
  { name: 'Users', component: Users, label: 'Usuários' },
  { name: 'Headphones', component: Headphones, label: 'Suporte' },
  { name: 'DollarSign', component: DollarSign, label: 'Vendas' },
  { name: 'HelpCircle', component: HelpCircle, label: 'Ajuda' },
  { name: 'Star', component: Star, label: 'Favorito' },
  { name: 'Heart', component: Heart, label: 'Favorito' },
  { name: 'Zap', component: Zap, label: 'Rápido' },
  { name: 'Shield', component: Shield, label: 'Segurança' },
  { name: 'Settings', component: Settings, label: 'Configurações' }
]

export default function CriarCategoriaModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editingCategoria
}: CriarCategoriaModalProps) {
  const [formData, setFormData] = useState<CreateCategoriaRequest>({
    nome: '',
    descricao: '',
    cor: '#305e73',
    icone: 'MessageCircle',
    ordem: 0
  })
  
  const [loading, setLoading] = useState(false)
  const [corCustomizada, setCorCustomizada] = useState('')
  const [activeTab, setActiveTab] = useState<'basico' | 'aparencia'>('basico')

  // Carregar dados quando estiver editando
  useEffect(() => {
    if (editingCategoria) {
      setFormData({
        nome: editingCategoria.nome || '',
        descricao: editingCategoria.descricao || '',
        cor: editingCategoria.cor || '#305e73',
        icone: editingCategoria.icone || 'MessageCircle',
        ordem: editingCategoria.ordem || 0
      })
    } else {
      setFormData({
        nome: '',
        descricao: '',
        cor: '#305e73',
        icone: 'MessageCircle',
        ordem: 0
      })
    }
    setActiveTab('basico')
  }, [editingCategoria, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório')
      return
    }

    setLoading(true)
    try {
      if (editingCategoria && onUpdate) {
        await onUpdate(editingCategoria.id, formData)
      } else {
        await onSave(formData)
      }
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar categoria')
    } finally {
      setLoading(false)
    }
  }

  const handleCorChange = (cor: string) => {
    setFormData(prev => ({ ...prev, cor }))
    setCorCustomizada('')
  }

  const handleCorCustomizada = (cor: string) => {
    setCorCustomizada(cor)
    setFormData(prev => ({ ...prev, cor }))
  }

  if (!isOpen) return null

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
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {editingCategoria ? 'Atualize os dados da categoria' : 'Organize suas respostas'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mt-4">
              {[
                { id: 'basico', label: 'Básico', icon: Tag },
                { id: 'aparencia', label: 'Aparência', icon: Palette }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tab: Básico */}
              {activeTab === 'basico' && (
                <div className="space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
                      placeholder="Ex: Atendimento, Vendas, Suporte..."
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none resize-none"
                      rows={3}
                      placeholder="Descreva o propósito desta categoria..."
                    />
                  </div>

                  {/* Ordem */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordem de Exibição
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.ordem}
                      onChange={(e) => setFormData(prev => ({ ...prev, ordem: parseInt(e.target.value) || 0 }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Menor número = aparece primeiro na lista
                    </p>
                  </div>
                </div>
              )}

              {/* Tab: Aparência */}
              {activeTab === 'aparencia' && (
                <div className="space-y-6">
                  {/* Preview */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      {(() => {
                        const iconeAtual = iconesPredefinidos.find(i => i.name === formData.icone)
                        const IconComponent = iconeAtual?.component || MessageCircle
                        return (
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: formData.cor }}
                          >
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                        )
                      })()}
                      <div>
                        <h3 className="font-semibold text-gray-900">{formData.nome || 'Nome da Categoria'}</h3>
                        <p className="text-sm text-gray-600">{formData.descricao || 'Descrição da categoria'}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      Cor: {formData.cor} • Ícone: {formData.icone}
                    </div>
                  </div>

                  {/* Ícone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Ícone da Categoria
                    </label>
                    
                    {/* Grid de ícones */}
                    <div className="grid grid-cols-5 gap-2">
                      {iconesPredefinidos.map((icone) => {
                        const IconComponent = icone.component
                        return (
                          <motion.button
                            key={icone.name}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFormData(prev => ({ ...prev, icone: icone.name }))}
                            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                              formData.icone === icone.name 
                                ? 'bg-[#305e73] text-white shadow-lg' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={icone.label}
                          >
                            <IconComponent className="w-5 h-5" />
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Cor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Cor da Categoria
                    </label>
                    
                    {/* Cores Predefinidas */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">Cores Predefinidas:</p>
                      <div className="grid grid-cols-6 gap-2">
                        {coresPredefinidas.map((cor) => (
                          <motion.button
                            key={cor}
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCorChange(cor)}
                            className={`w-8 h-8 rounded-lg shadow-sm border-2 transition-all ${
                              formData.cor === cor ? 'border-gray-400 scale-110' : 'border-white hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: cor }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Cor Customizada */}
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Ou escolha uma cor personalizada:</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={corCustomizada || formData.cor}
                          onChange={(e) => handleCorCustomizada(e.target.value)}
                          className="w-12 h-10 border border-gray-200 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={corCustomizada || formData.cor}
                          onChange={(e) => handleCorCustomizada(e.target.value)}
                          className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none font-mono text-sm"
                          placeholder="#305e73"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-8 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingCategoria ? 'Atualizar Categoria' : 'Criar Categoria'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
