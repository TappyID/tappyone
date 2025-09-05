'use client'

import { useState, useEffect } from 'react'
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
  Plus,
  Calendar,
  User,
  TrendingUp,
  AlertTriangle,
  Users,
  Search
} from 'lucide-react'

interface TagData {
  id: string
  nome: string
  descricao?: string
  cor: string
  categoria: string
  uso_count: number
  criado_em: string
  criado_por: string
  ativo: boolean
  favorito: boolean
  contatos?: string[]
}

interface Contato {
  id: string
  nome: string
  numeroTelefone: string
  fotoPerfil?: string
  tags?: Array<{
    id: string
    contatoId: string
    tagId: string
  }>
}

interface EditarTagModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tag: TagData) => void
  onDelete: (id: string) => void
  tag: TagData | null
  categorias: string[]
}

export default function EditarTagModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  tag,
  categorias 
}: EditarTagModalProps) {
  const [formData, setFormData] = useState<Partial<TagData>>({})
  const [novaCategoria, setNovaCategoria] = useState('')
  const [showNovaCategoria, setShowNovaCategoria] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [contatos, setContatos] = useState<Contato[]>([])
  const [searchContatos, setSearchContatos] = useState('')
  const [loadingContatos, setLoadingContatos] = useState(false)

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
        console.log('🔍 Dados completos da API contatos (EditarTagModal):', data)
        const contatosData = data.data || data.contatos || data || []
        console.log('📋 Contatos extraídos (EditarTagModal):', contatosData)
        setContatos(contatosData)
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error)
    } finally {
      setLoadingContatos(false)
    }
  }

  // Carregar contatos associados à tag
  const fetchContatosAssociados = async (tagId: string) => {
    try {
      console.log(`🏷️ Buscando contatos associados à tag ${tagId}`)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tags/${tagId}/contatos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log(`📡 Status da resposta: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 Dados dos contatos associados:', data)
        
        // Tentar diferentes estruturas de resposta
        const contatosData = data.data || data || []
        const contatosIds = contatosData.map((contato: any) => {
          return contato.contato_id || contato.id || contato.contatoId
        }).filter(Boolean)
        
        console.log('📋 IDs dos contatos extraídos:', contatosIds)
        return contatosIds
      } else {
        console.log('❌ Erro na resposta:', await response.text())
      }
    } catch (error) {
      console.error('Erro ao carregar contatos da tag:', error)
    }
    return []
  }

  useEffect(() => {
    if (isOpen) {
      fetchContatos()
    }
  }, [isOpen])

  useEffect(() => {
    if (tag && contatos.length > 0) {
      // Encontrar contatos que têm esta tag associada usando os dados já carregados
      const contatosComEstaTag = contatos.filter(contato => 
        contato.tags && contato.tags.some((contatoTag) => 
          contatoTag.tagId === tag.id
        )
      ).map(contato => contato.id)
      
      console.log(`🏷️ Contatos associados à tag ${tag.id}:`, contatosComEstaTag)
      console.log(`📋 Total de contatos carregados:`, contatos.length)
      
      setFormData({
        ...tag,
        contatos: contatosComEstaTag
      })
      setShowNovaCategoria(false)
      setNovaCategoria('')
      setShowDeleteConfirm(false)
    }
  }, [tag, contatos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tag || !formData.nome) return

    const categoria = showNovaCategoria && novaCategoria 
      ? novaCategoria 
      : formData.categoria

    // Remover o campo contatos antes de enviar para a API de tags
    const { contatos, ...tagDataSemContatos } = formData

    onSave({
      ...tag,
      ...tagDataSemContatos,
      categoria
    } as TagData)

    // Gerenciar associações de contatos separadamente se houve mudanças
    if (contatos && tag) {
      await handleContatosAssociation(tag.id, contatos)
    }
    
    onClose()
  }

  // Função para gerenciar associações de contatos
  const handleContatosAssociation = async (tagId: string, contatosIds: string[]) => {
    try {
      const token = localStorage.getItem('token')
      
      // Para cada contato, aplicar a tag
      for (const contatoId of contatosIds) {
        await fetch(`/api/contatos/${contatoId}/tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ tagIds: [tagId] })
        })
      }
      
      console.log(`✅ Associações atualizadas para tag ${tagId}`)
    } catch (error) {
      console.error('❌ Erro ao atualizar associações de contatos:', error)
    }
  }

  const handleDelete = () => {
    if (tag) {
      onDelete(tag.id)
      onClose()
    }
  }

  const handleChange = (field: keyof TagData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
    contato.numeroTelefone.includes(searchContatos)
  )

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não informada'
    
    try {
      // Tentar diferentes formatos de data
      let date = new Date(dateString)
      
      // Se a data é inválida, tentar parseamento manual
      if (isNaN(date.getTime())) {
        // Tentar formato ISO sem timezone
        date = new Date(dateString.replace('Z', ''))
      }
      
      if (isNaN(date.getTime())) {
        return 'Data inválida'
      }
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return 'Data inválida'
    }
  }

  const coresDisponiveis = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
    '#14b8a6', '#f87171', '#34d399', '#fbbf24', '#a78bfa'
  ]

  const categoriasComuns = [
    'Prioridade', 'Cliente', 'Departamento', 'Tipo', 'Status',
    'Projeto', 'Urgência', 'Categoria', 'Assunto', 'Origem'
  ]

  if (!tag) return null

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
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center border-4 border-white/20"
                      style={{ backgroundColor: formData.cor || tag.cor }}
                    >
                      <Tag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Editar Tag</h2>
                      <p className="text-white/80">Modifique as informações da tag</p>
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
                {/* Info da Tag */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Informações da Tag</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Usos</p>
                        <p className="font-semibold text-gray-900">{tag.uso_count}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Criada em</p>
                        <p className="font-semibold text-gray-900">{formatDate(tag.criado_em)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Criada por</p>
                        <p className="font-semibold text-gray-900">{tag.criado_por}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome da Tag */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Hash className="w-4 h-4 inline mr-2" />
                      Nome da Tag
                    </label>
                    <input
                      type="text"
                      value={formData.nome || ''}
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
                      value={formData.descricao || ''}
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
                          value={formData.categoria || ''}
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
                            (formData.cor || tag.cor) === cor 
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
                        value={formData.cor || tag.cor}
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

                  {/* Seleção de Contatos */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Users className="w-4 h-4 inline mr-2" />
                      Contatos Associados à Tag
                    </label>
                    <div className="border border-gray-300 rounded-xl overflow-hidden">
                      {/* Search */}
                      <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar contatos..."
                            value={searchContatos}
                            onChange={(e) => setSearchContatos(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Lista de Contatos */}
                      <div className="max-h-48 overflow-y-auto">
                        {loadingContatos ? (
                          <div className="p-4 text-center text-gray-500">
                            Carregando contatos...
                          </div>
                        ) : filteredContatos.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            {searchContatos ? 'Nenhum contato encontrado' : 'Nenhum contato disponível'}
                          </div>
                        ) : (
                          filteredContatos.map((contato) => (
                            <motion.div
                              key={contato.id}
                              whileHover={{ backgroundColor: '#f9fafb' }}
                              className={`flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 cursor-pointer ${
                                formData.contatos?.includes(contato.id) ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => toggleContato(contato.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{contato.nome}</p>
                                  <p className="text-sm text-gray-500">{contato.numeroTelefone}</p>
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={formData.contatos?.includes(contato.id) || false}
                                onChange={() => toggleContato(contato.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                            </motion.div>
                          ))
                        )}
                      </div>

                      {/* Resumo de selecionados */}
                      {formData.contatos && formData.contatos.length > 0 && (
                        <div className="p-3 bg-blue-50 border-t border-blue-200">
                          <p className="text-sm text-blue-700 font-medium mb-2">
                            {formData.contatos.length} contato(s) associado(s)
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {formData.contatos.map((contatoId) => {
                              const contato = contatos.find(c => c.id === contatoId)
                              if (!contato) return null
                              return (
                                <span 
                                  key={contatoId}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs"
                                >
                                  {contato.nome}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleContato(contatoId)
                                    }}
                                    className="hover:bg-blue-200 rounded-full p-0.5"
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

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-white shadow-sm"
                        style={{ backgroundColor: formData.cor || tag.cor }}
                      >
                        <Tag className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {formData.nome || tag.nome}
                          </span>
                          {formData.favorito && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {showNovaCategoria && novaCategoria ? novaCategoria : formData.categoria || tag.categoria}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            formData.ativo ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning sobre uso */}
                  {tag.uso_count > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-800">Atenção</h4>
                          <p className="text-sm text-amber-700">
                            Esta tag está sendo usada em <strong>{tag.uso_count}</strong> {tag.uso_count === 1 ? 'item' : 'itens'}. 
                            Alterações podem afetar a organização existente.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                      >
                        Cancelar
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-3 border border-red-300 text-red-700 rounded-xl hover:bg-red-50 font-medium transition-colors"
                      >
                        Excluir
                      </motion.button>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      className="px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl hover:shadow-lg font-medium flex items-center gap-2 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
                    <p className="text-gray-600 mb-6">
                      Tem certeza que deseja excluir a tag <strong>"{tag.nome}"</strong>? 
                      {tag.uso_count > 0 && (
                        <span className="block mt-2 text-red-600">
                          Esta ação afetará {tag.uso_count} {tag.uso_count === 1 ? 'item' : 'itens'} e não pode ser desfeita.
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                      >
                        Cancelar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={handleDelete}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
                      >
                        Excluir Tag
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
