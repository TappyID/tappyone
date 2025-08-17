'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { 
  Tag,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Palette,
  Hash,
  TrendingUp,
  Users,
  FileText,
  Star,
  Copy,
  Download,
  Upload,
  Grid3X3,
  List,
  EyeOff,
  X
} from 'lucide-react'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import TagsStats from './components/TagsStats'
import TagsList from './components/TagsList'
import CriarTagModal from './components/CriarTagModal'
import EditarTagModal from './components/EditarTagModal'
import ImportarTagsModal from './components/ImportarTagsModal'

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
}

export default function TagsPage() {
  const { user, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [filtroStatus, setFiltroStatus] = useState<string>('todas')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCriarModal, setShowCriarModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showImportarModal, setShowImportarModal] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Mock data para tags
  const [tags, setTags] = useState<TagData[]>([
    {
      id: '1',
      nome: 'Urgente',
      descricao: 'Para casos que precisam de atenção imediata',
      cor: '#ef4444',
      categoria: 'Prioridade',
      uso_count: 156,
      criado_em: '2024-01-15',
      criado_por: 'Admin',
      ativo: true,
      favorito: true
    },
    {
      id: '2',
      nome: 'Cliente VIP',
      descricao: 'Clientes com alto valor ou importância estratégica',
      cor: '#8b5cf6',
      categoria: 'Cliente',
      uso_count: 89,
      criado_em: '2024-01-20',
      criado_por: 'Admin',
      ativo: true,
      favorito: true
    },
    {
      id: '3',
      nome: 'Suporte Técnico',
      descricao: 'Questões relacionadas a problemas técnicos',
      cor: '#3b82f6',
      categoria: 'Departamento',
      uso_count: 234,
      criado_em: '2024-02-01',
      criado_por: 'Admin',
      ativo: true,
      favorito: false
    },
    {
      id: '4',
      nome: 'Vendas',
      descricao: 'Oportunidades e negociações comerciais',
      cor: '#10b981',
      categoria: 'Departamento',
      uso_count: 178,
      criado_em: '2024-02-05',
      criado_por: 'Admin',
      ativo: true,
      favorito: true
    },
    {
      id: '5',
      nome: 'Bug Report',
      descricao: 'Relatórios de problemas no sistema',
      cor: '#f59e0b',
      categoria: 'Tipo',
      uso_count: 67,
      criado_em: '2024-02-10',
      criado_por: 'Admin',
      ativo: true,
      favorito: false
    },
    {
      id: '6',
      nome: 'Feature Request',
      descricao: 'Solicitações de novas funcionalidades',
      cor: '#06b6d4',
      categoria: 'Tipo',
      uso_count: 45,
      criado_em: '2024-02-15',
      criado_por: 'Admin',
      ativo: true,
      favorito: false
    },
    {
      id: '7',
      nome: 'Feedback',
      descricao: 'Comentários e sugestões dos usuários',
      cor: '#84cc16',
      categoria: 'Tipo',
      uso_count: 92,
      criado_em: '2024-02-20',
      criado_por: 'Admin',
      ativo: true,
      favorito: false
    },
    {
      id: '8',
      nome: 'Cancelamento',
      descricao: 'Solicitações de cancelamento de serviços',
      cor: '#f97316',
      categoria: 'Status',
      uso_count: 23,
      criado_em: '2024-02-25',
      criado_por: 'Admin',
      ativo: false,
      favorito: false
    }
  ])

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#305e73]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleCriarTag = (novaTag: Omit<TagData, 'id' | 'uso_count' | 'criado_em' | 'criado_por'>) => {
    const tag: TagData = {
      ...novaTag,
      id: Date.now().toString(),
      uso_count: 0,
      criado_em: new Date().toISOString().split('T')[0],
      criado_por: user.nome || 'Admin'
    }
    setTags(prev => [...prev, tag])
  }

  const handleEditarTag = (tagEditada: TagData) => {
    setTags(prev => prev.map(tag => tag.id === tagEditada.id ? tagEditada : tag))
  }

  const handleExcluirTag = (id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id))
  }

  const handleExcluirSelecionadas = () => {
    setTags(prev => prev.filter(tag => !selectedTags.includes(tag.id)))
    setSelectedTags([])
  }

  const handleToggleFavorito = (id: string) => {
    setTags(prev => prev.map(tag => 
      tag.id === id ? { ...tag, favorito: !tag.favorito } : tag
    ))
  }

  const handleToggleStatus = (id: string) => {
    setTags(prev => prev.map(tag => 
      tag.id === id ? { ...tag, ativo: !tag.ativo } : tag
    ))
  }

  const tagsFiltradas = tags.filter(tag => {
    const matchSearch = tag.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       tag.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       tag.categoria.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchCategoria = filtroCategoria === 'todas' || tag.categoria === filtroCategoria
    const matchStatus = filtroStatus === 'todas' || 
                       (filtroStatus === 'ativas' && tag.ativo) ||
                       (filtroStatus === 'inativas' && !tag.ativo) ||
                       (filtroStatus === 'favoritas' && tag.favorito)
    
    return matchSearch && matchCategoria && matchStatus
  })

  const categorias = Array.from(new Set(tags.map(tag => tag.categoria)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Top Bar */}
        <AtendimentosTopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {/* Tags Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-xl flex items-center justify-center">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Tags</h1>
                  <p className="text-gray-600">Organize e gerencie as tags do sistema</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Bulk Actions */}
                {selectedTags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <span className="text-sm font-medium text-red-700">
                      {selectedTags.length} selecionada{selectedTags.length > 1 ? 's' : ''}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExcluirSelecionadas}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}

                {/* Import/Export */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowImportarModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Importar</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </motion.button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-[#305e73] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-[#305e73] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Create Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCriarModal(true)}
                  className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Nova Tag</span>
                </motion.button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="appearance-none bg-white pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all min-w-[160px]"
                >
                  <option value="todas">Todas as Categorias</option>
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
                <Palette className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="appearance-none bg-white pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent transition-all min-w-[140px]"
                >
                  <option value="todas">Todas as Tags</option>
                  <option value="ativas">Ativas</option>
                  <option value="inativas">Inativas</option>
                  <option value="favoritas">Favoritas</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Active Filters Display */}
            {(filtroCategoria !== 'todas' || filtroStatus !== 'todas') && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-4 flex-wrap"
              >
                <span className="text-sm text-gray-600">Filtros ativos:</span>
                
                {filtroCategoria !== 'todas' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    <Palette className="w-3 h-3" />
                    <span>{filtroCategoria}</span>
                    <button
                      onClick={() => setFiltroCategoria('todas')}
                      className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </motion.div>
                )}

                {filtroStatus !== 'todas' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {filtroStatus === 'ativas' && <Eye className="w-3 h-3" />}
                    {filtroStatus === 'inativas' && <EyeOff className="w-3 h-3" />}
                    {filtroStatus === 'favoritas' && <Star className="w-3 h-3" />}
                    <span>{filtroStatus === 'ativas' ? 'Ativas' : filtroStatus === 'inativas' ? 'Inativas' : 'Favoritas'}</span>
                    <button
                      onClick={() => setFiltroStatus('todas')}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setFiltroCategoria('todas')
                    setFiltroStatus('todas')
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Limpar todos
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 py-6">
          <TagsStats tags={tags} />
        </div>

        {/* Tags List */}
        <div className="px-6 pb-6">
          <TagsList
            tags={tagsFiltradas}
            viewMode={viewMode}
            selectedTags={selectedTags}
            onSelectedTagsChange={setSelectedTags}
            onEditTag={(tag) => {
              setSelectedTag(tag)
              setShowEditarModal(true)
            }}
            onDeleteTag={handleExcluirTag}
            onToggleFavorito={handleToggleFavorito}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        {/* Modals */}
        <CriarTagModal
          isOpen={showCriarModal}
          onClose={() => setShowCriarModal(false)}
          onSave={handleCriarTag}
          categorias={categorias}
        />

        <EditarTagModal
          isOpen={showEditarModal}
          onClose={() => {
            setShowEditarModal(false)
            setSelectedTag(null)
          }}
          tag={selectedTag}
          onSave={handleEditarTag}
          onDelete={handleExcluirTag}
          categorias={categorias}
        />

        <ImportarTagsModal
          isOpen={showImportarModal}
          onClose={() => setShowImportarModal(false)}
          existingTags={tags.map(tag => tag.nome.toLowerCase())}
          onImport={(novasTags) => {
            const tagsComId = novasTags.map(tag => ({
              ...tag,
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              uso_count: 0,
              criado_em: new Date().toISOString().split('T')[0],
              criado_por: user.nome || 'Admin'
            }))
            setTags(prev => [...prev, ...tagsComId])
          }}
        />
    </div>
  )
}
