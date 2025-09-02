'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Plus
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
}

export default function CriarTagModal({ 
  isOpen, 
  onClose, 
  onSave, 
  categorias 
}: CriarTagModalProps) {
  const [formData, setFormData] = useState<TagData>({
    nome: '',
    descricao: '',
    cor: '#3b82f6',
    categoria: categorias[0] || '',
    ativo: true,
    favorito: false
  })

  const [novaCategoria, setNovaCategoria] = useState('')
  const [showNovaCategoria, setShowNovaCategoria] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const categoria = showNovaCategoria && novaCategoria 
      ? novaCategoria 
      : formData.categoria

    onSave({
      ...formData,
      categoria
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
      favorito: false
    })
    setNovaCategoria('')
    setShowNovaCategoria(false)
  }

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] px-6 py-4">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Hash className="w-4 h-4 inline mr-2" />
                      Nome da Tag
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => handleChange('nome', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all"
                      placeholder="Ex: Urgente, Cliente VIP, Bug..."
                      required
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Descrição (Opcional)
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => handleChange('descricao', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all resize-none"
                      placeholder="Descreva quando e como usar esta tag..."
                    />
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                              ? 'border-[#305e73] bg-[#305e73]/5 text-[#305e73]'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
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
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                        className="w-full h-12 rounded-xl border border-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Configurações */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Status
                      </label>
                      <div className="flex items-center gap-4">
                        <motion.label
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.ativo
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="ativo"
                            checked={formData.ativo}
                            onChange={() => handleChange('ativo', true)}
                            className="sr-only"
                          />
                          <Eye className={`w-5 h-5 ${formData.ativo ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className={`font-medium ${formData.ativo ? 'text-green-700' : 'text-gray-600'}`}>
                            Ativa
                          </span>
                        </motion.label>

                        <motion.label
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            !formData.ativo
                              ? 'border-gray-400 bg-gray-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="ativo"
                            checked={!formData.ativo}
                            onChange={() => handleChange('ativo', false)}
                            className="sr-only"
                          />
                          <EyeOff className={`w-5 h-5 ${!formData.ativo ? 'text-gray-600' : 'text-gray-400'}`} />
                          <span className={`font-medium ${!formData.ativo ? 'text-gray-700' : 'text-gray-600'}`}>
                            Inativa
                          </span>
                        </motion.label>
                      </div>
                    </div>

                    {/* Favorito */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Favorito
                      </label>
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.favorito
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-gray-300 hover:border-gray-400'
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
                          formData.favorito ? 'text-yellow-700' : 'text-gray-600'
                        }`}>
                          Marcar como favorita
                        </span>
                      </motion.label>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-white shadow-sm"
                        style={{ backgroundColor: formData.cor }}
                      >
                        <Tag className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {formData.nome || 'Nome da tag'}
                          </span>
                          {formData.favorito && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
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
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancelar
                    </motion.button>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      className="px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl hover:shadow-lg font-medium flex items-center gap-2 transition-all"
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
