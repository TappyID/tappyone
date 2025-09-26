'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { 
  X, 
  Tag,
  Palette,
  Hash,
  FileText,
  Eye,
  EyeOff,
  Star,
  Save,
  Plus,
  Users,
  Search,
  Check
} from 'lucide-react'

interface CriarTagModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tag: TagData) => void
  categorias: string[]
}

interface TagData {
  nome: string
  descricao?: string
  cor: string
  categoria: string
  ativo: boolean
  favorito: boolean
  contatos?: string[] // IDs dos contatos selecionados
}

interface Contato {
  id: string
  nome: string
  telefone: string
  avatar?: string
}

export default function CriarTagModal({ 
  isOpen, 
  onClose, 
  onSave, 
  categorias 
}: CriarTagModalProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const [formData, setFormData] = useState<TagData>({
    nome: '',
    descricao: '',
    cor: '#3b82f6',
    categoria: categorias[0] || '',
    ativo: true,
    favorito: false,
    contatos: []
  })

  const [novaCategoria, setNovaCategoria] = useState('')
  const [showNovaCategoria, setShowNovaCategoria] = useState(false)
  const [contatos, setContatos] = useState<Contato[]>([])
  const [searchContatos, setSearchContatos] = useState('')
  const [loadingContatos, setLoadingContatos] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const categoria = showNovaCategoria && novaCategoria 
      ? novaCategoria 
      : formData.categoria

    // Remover o campo contatos antes de enviar - as associações são feitas separadamente
    const { contatos, ...tagData } = formData

    onSave({
      ...tagData,
      categoria,
      contatos: formData.contatos // Enviar contatos separadamente para processamento
    })
    
    onClose()
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      cor: '#3b82f6',
      categoria: categorias[0] || '',
      ativo: true,
      favorito: false,
      contatos: []
    })
    setNovaCategoria('')
    setShowNovaCategoria(false)
    setContatos([])
    setSearchContatos('')
  }

  // Carregar contatos
  const fetchContatos = async () => {
    try {
      setLoadingContatos(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/contatos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Dados completos da API contatos:', data)
        // Tentar diferentes estruturas de resposta
        const contatosData = data.data || data.contatos || data || []
        console.log('📋 Contatos extraídos:', contatosData)
        setContatos(contatosData)
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error)
    } finally {
      setLoadingContatos(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchContatos()
    }
  }, [isOpen])

  const toggleContato = (contatoId: string) => {
    setFormData(prev => ({
      ...prev,
      contatos: prev.contatos?.includes(contatoId) 
        ? prev.contatos.filter(id => id !== contatoId)
        : [...(prev.contatos || []), contatoId]
    }))
  }

  const filteredContatos = contatos.filter(contato => 
    contato.nome.toLowerCase().includes(searchContatos.toLowerCase()) ||
    contato.telefone.includes(searchContatos)
  )

  const handleChange = (field: keyof TagData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const coresDisponiveis = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
    '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
    '#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6'
  ]

  const categoriasComuns = [
    'Prioridade', 'Cliente', 'Departamento', 'Tipo', 'Status',
    'Projeto', 'Urgência', 'Categoria', 'Assunto', 'Origem'
  ]

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
                      <Tag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Nova Tag</h2>
                      <p className="text-white/80">Crie uma nova tag para organizar o sistema</p>
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
                  {/* Nome da Tag */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <Hash className="w-4 h-4 inline mr-2" />
                      Nome da Tag
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all ${
                        isDark 
                          ? 'border-slate-600 bg-slate-700 text-white placeholder-gray-400 focus:ring-emerald-500' 
                          : 'border-gray-300 focus:ring-[#305e73]'
                      }`}
                      placeholder="Ex: Urgente, Cliente VIP, Bug..."
                      required
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <FileText className="w-4 h-4 inline mr-2" />
                      Descrição (Opcional)
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => handleChange('descricao', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all resize-none ${
                        isDark 
                          ? 'border-slate-600 bg-slate-700 text-white placeholder-gray-400 focus:ring-emerald-500' 
                          : 'border-gray-300 focus:ring-[#305e73]'
                      }`}
                      placeholder="Descreva quando e como usar esta tag..."
                    />
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <Palette className="w-4 h-4 inline mr-2" />
                      Categoria
                    </label>
                    
                    <div className="space-y-3">
                      {/* Toggle para nova categoria */}
                      <div className="flex items-center gap-3">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setShowNovaCategoria(!showNovaCategoria)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            showNovaCategoria
                              ? (isDark 
                                  ? 'border-slate-500 bg-slate-700/50 text-slate-300' 
                                  : 'border-[#305e73] bg-[#305e73]/5 text-[#305e73]')
                              : (isDark 
                                  ? 'border-slate-600 text-gray-300 hover:border-slate-500' 
                                  : 'border-gray-300 text-gray-700 hover:border-gray-400')
                          }`}
                        >
                          <Plus className="w-4 h-4 inline mr-2" />
                          Nova Categoria
                        </motion.button>
                      </div>

                      {showNovaCategoria ? (
                        <div>
                          <input
                            type="text"
                            value={novaCategoria}
                            onChange={(e) => setNovaCategoria(e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${
                              isDark 
                                ? 'border-slate-600 bg-slate-700 text-white focus:ring-slate-500' 
                                : 'border-gray-300 focus:ring-[#305e73]'
                            }`}
                            placeholder="Nome da nova categoria"
                            required={showNovaCategoria}
                          />
                          <div className="mt-2 flex flex-wrap gap-2">
                            {categoriasComuns.map(categoria => (
                              <motion.button
                                key={categoria}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setNovaCategoria(categoria)}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                  isDark 
                                    ? 'bg-slate-600 hover:bg-slate-500 text-gray-200' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                }`}
                              >
                                {categoria}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <select
                          value={formData.categoria}
                          onChange={(e) => handleChange('categoria', e.target.value)}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${
                            isDark 
                              ? 'border-slate-600 bg-slate-700 text-white focus:ring-slate-500' 
                              : 'border-gray-300 focus:ring-[#305e73]'
                          }`}
                          required={!showNovaCategoria}
                        >
                          <option value="">Selecione uma categoria</option>
                          {categorias.map(categoria => (
                            <option key={categoria} value={categoria}>
                              {categoria}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Cor */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <Palette className="w-4 h-4 inline mr-2" />
                      Cor da Tag
                    </label>
                    <div className="grid grid-cols-10 gap-3">
                      {coresDisponiveis.map((cor) => (
                        <motion.button
                          key={cor}
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleChange('cor', cor)}
                          className={`w-10 h-10 rounded-xl border-4 transition-all ${
                            formData.cor === cor 
                              ? 'border-gray-400 scale-110' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: cor }}
                        />
                      ))}
                    </div>
                    
                    {/* Color Picker Customizado */}
                    <div className="mt-3">
                      <input
                        type="color"
                        value={formData.cor}
                        onChange={(e) => handleChange('cor', e.target.value)}
                        className={`w-full h-12 rounded-xl border cursor-pointer ${
                          isDark ? 'border-slate-600' : 'border-gray-300'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Seleção de Contatos */}
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      <Users className="w-4 h-4 inline mr-2" />
                      Aplicar em Contatos (Opcional)
                    </label>
                    <div className={`border rounded-xl overflow-hidden ${
                      isDark ? 'border-slate-600' : 'border-gray-300'
                    }`}>
                      {/* Search */}
                      <div className={`p-3 border-b ${
                        isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-300'
                      }`}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchContatos}
                            onChange={(e) => setSearchContatos(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent text-sm ${
                              isDark 
                                ? 'border-slate-600 bg-slate-800 text-white placeholder-gray-400 focus:ring-slate-500' 
                                : 'border-gray-300 focus:ring-[#305e73]'
                            }`}
                            placeholder="Buscar contatos..."
                          />
                        </div>
                      </div>

                      {/* Lista de Contatos */}
                      <div className="max-h-48 overflow-y-auto">
                        {loadingContatos ? (
                          <div className={`p-4 text-center ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Carregando contatos...
                          </div>
                        ) : filteredContatos.length === 0 ? (
                          <div className={`p-4 text-center ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {searchContatos ? 'Nenhum contato encontrado' : 'Nenhum contato disponível'}
                          </div>
                        ) : (
                          filteredContatos.map((contato) => (
                            <motion.div
                              key={contato.id}
                              whileHover={{ backgroundColor: isDark ? '#374151' : '#f9fafb' }}
                              className={`p-3 border-b last:border-b-0 cursor-pointer ${
                                isDark ? 'border-slate-600' : 'border-gray-100'
                              }`}
                              onClick={() => toggleContato(contato.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  formData.contatos?.includes(contato.id)
                                    ? (isDark ? 'border-slate-400 bg-slate-500' : 'border-[#305e73] bg-[#305e73]')
                                    : (isDark ? 'border-slate-500 hover:border-slate-400' : 'border-gray-300 hover:border-gray-400')
                                }`}>
                                  {formData.contatos?.includes(contato.id) && (
                                    <Check className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={`font-medium text-sm ${
                                    isDark ? 'text-white' : 'text-gray-900'
                                  }`}>{contato.nome}</p>
                                  <p className={`text-xs ${
                                    isDark ? 'text-gray-400' : 'text-gray-500'
                                  }`}>{contato.telefone}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>

                      {/* Contatos Selecionados */}
                      {formData.contatos && formData.contatos.length > 0 && (
                        <div className={`p-3 border-t ${
                          isDark ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-gray-300'
                        }`}>
                          <p className={`text-sm font-medium mb-2 ${
                            isDark ? 'text-slate-300' : 'text-blue-700'
                          }`}>
                            {formData.contatos.length} contato(s) selecionado(s)
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {formData.contatos.map((contatoId) => {
                              const contato = contatos.find(c => c.id === contatoId)
                              if (!contato) return null
                              return (
                                <span
                                  key={contatoId}
                                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md ${
                                    isDark ? 'bg-slate-600/50 text-slate-300' : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {contato.nome}
                                  <button
                                    type="button"
                                    onClick={() => toggleContato(contatoId)}
                                    className={`rounded-full p-0.5 ${
                                      isDark ? 'hover:bg-slate-500' : 'hover:bg-blue-200'
                                    }`}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Configurações */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status */}
                    <div>
                      <label className={`block text-sm font-semibold mb-3 ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Status
                      </label>
                      <div className="flex items-center gap-4">
                        <motion.label
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.ativo
                              ? (isDark ? 'border-green-600 bg-green-900/20' : 'border-green-300 bg-green-50')
                              : (isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-gray-400')
                          }`}
                        >
                          <input
                            type="radio"
                            name="ativo"
                            checked={formData.ativo}
                            onChange={() => handleChange('ativo', true)}
                            className="sr-only"
                          />
                          <Eye className={`w-5 h-5 ${formData.ativo ? (isDark ? 'text-green-400' : 'text-green-600') : 'text-gray-400'}`} />
                          <span className={`font-medium ${formData.ativo ? (isDark ? 'text-green-300' : 'text-green-700') : (isDark ? 'text-gray-300' : 'text-gray-600')}`}>
                            Ativa
                          </span>
                        </motion.label>

                        <motion.label
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            !formData.ativo
                              ? (isDark ? 'border-slate-500 bg-slate-700/50' : 'border-gray-400 bg-gray-50')
                              : (isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-gray-400')
                          }`}
                        >
                          <input
                            type="radio"
                            name="ativo"
                            checked={!formData.ativo}
                            onChange={() => handleChange('ativo', false)}
                            className="sr-only"
                          />
                          <EyeOff className={`w-5 h-5 ${!formData.ativo ? (isDark ? 'text-slate-300' : 'text-gray-600') : 'text-gray-400'}`} />
                          <span className={`font-medium ${!formData.ativo ? (isDark ? 'text-slate-200' : 'text-gray-700') : (isDark ? 'text-gray-300' : 'text-gray-600')}`}>
                            Inativa
                          </span>
                        </motion.label>
                      </div>
                    </div>

                    {/* Favorito */}
                    <div>
                      <label className={`block text-sm font-semibold mb-3 ${
                        isDark ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Favorito
                      </label>
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.favorito
                            ? (isDark ? 'border-yellow-600 bg-yellow-900/20' : 'border-yellow-300 bg-yellow-50')
                            : (isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-300 hover:border-gray-400')
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.favorito}
                          onChange={(e) => handleChange('favorito', e.target.checked)}
                          className="sr-only"
                        />
                        <Star className={`w-5 h-5 ${
                          formData.favorito 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-400'
                        }`} />
                        <span className={`font-medium ${
                          formData.favorito ? (isDark ? 'text-yellow-300' : 'text-yellow-700') : (isDark ? 'text-gray-300' : 'text-gray-600')
                        }`}>
                          Marcar como favorita
                        </span>
                      </motion.label>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className={`rounded-xl p-4 ${
                    isDark ? 'bg-slate-700' : 'bg-gray-50'
                  }`}>
                    <h4 className={`text-sm font-semibold mb-3 ${
                      isDark ? 'text-gray-200' : 'text-gray-700'
                    }`}>Preview</h4>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-white shadow-sm"
                        style={{ backgroundColor: formData.cor }}
                      >
                        <Tag className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {formData.nome || 'Nome da tag'}
                          </span>
                          {formData.favorito && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {showNovaCategoria && novaCategoria ? novaCategoria : formData.categoria || 'Categoria'}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            formData.ativo ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center justify-between pt-6 border-t ${
                    isDark ? 'border-slate-600' : 'border-gray-200'
                  }`}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      onClick={onClose}
                      className={`px-6 py-3 border rounded-xl font-medium transition-colors ${
                        isDark 
                          ? 'border-slate-600 text-gray-300 hover:bg-slate-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancelar
                    </motion.button>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-6 py-3 text-white rounded-xl hover:shadow-lg font-medium flex items-center gap-2 transition-all ${
                        isDark 
                          ? 'bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400' 
                          : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] hover:from-[#3a6d84] hover:to-[#305e73]'
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      Criar Tag
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
