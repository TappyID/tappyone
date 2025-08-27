'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTags } from '@/hooks/useTags'
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
import AdminLayout from '../components/AdminLayout'
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
  const { user, loading: authLoading } = useAuth()
  const { tags, loading: tagsLoading, error, fetchTags, createTag, updateTag, deleteTag } = useTags()
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [filtroStatus, setFiltroStatus] = useState<string>('todas')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCriarModal, setShowCriarModal] = useState(false)
  const [showEditarModal, setShowEditarModal] = useState(false)
  const [showImportarModal, setShowImportarModal] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const loading = authLoading || tagsLoading

  // Handlers para ações das tags
  const handleCreateTag = async (tagData: {
    nome: string
    descricao?: string
    cor: string
    categoria: string
  }) => {
    try {
      await createTag(tagData)
      setShowCriarModal(false)
    } catch (error) {
      console.error('Erro ao criar tag:', error)
    }
  }

  const handleUpdateTag = async (tagData: Partial<TagData>) => {
    if (!selectedTag) return
    try {
      await updateTag(selectedTag.id, tagData)
      setShowEditarModal(false)
      setSelectedTag(null)
    } catch (error) {
      console.error('Erro ao atualizar tag:', error)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag(tagId)
      console.log('✅ Tag deletada com sucesso')
    } catch (error) {
      console.error('❌ Erro ao deletar tag:', error)
    }
  }

  const handleEditTag = (tag: TagData) => {
    setSelectedTag(tag)
    setShowEditarModal(true)
  }

  const handleToggleFavorite = async (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    if (tag) {
      await updateTag(tagId, { favorito: !tag.favorito })
    }
  }

  const handleBulkDelete = async () => {
    for (const tagId of selectedTags) {
      await handleDeleteTag(tagId)
    }
    setSelectedTags([])
  }

  // Filtros
  const filteredTags = Array.isArray(tags) ? tags.filter(tag => {
    const matchesSearch = tag.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tag.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filtroCategoria === 'todas' || tag.categoria === filtroCategoria
    const matchesStatus = filtroStatus === 'todas' || 
                         (filtroStatus === 'ativas' && tag.ativo) ||
                         (filtroStatus === 'inativas' && !tag.ativo) ||
                         (filtroStatus === 'favoritas' && tag.favorito)
    
    return matchesSearch && matchesCategory && matchesStatus
  }) : []

  const categorias = Array.from(new Set((Array.isArray(tags) ? tags : []).map(tag => tag.categoria)))

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login'
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">❌ Erro ao carregar tags: {error}</div>
        <button 
          onClick={fetchTags}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-8">
        {/* Stats */}
        <TagsStats tags={tags} />
        
        {/* Controles */}
        <div className="flex flex-col lg:flex-row gap-4">
        {/* Barra de Pesquisa */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar tags por nome ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todas">Todas as categorias</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todas">Todos os status</option>
            <option value="ativas">Ativas</option>
            <option value="inativas">Inativas</option>
            <option value="favoritas">Favoritas</option>
          </select>

          {/* Botão de View Mode */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 border rounded-lg hover:bg-gray-50"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          {selectedTags.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Excluir ({selectedTags.length})
            </button>
          )}
          
          <button
            onClick={() => setShowImportarModal(true)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Importar
          </button>

          <button
            onClick={() => setShowCriarModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Tag
          </button>
        </div>
      </div>

      {/* Lista de Tags */}
      <TagsList
        tags={filteredTags}
        viewMode={viewMode}
        selectedTags={selectedTags}
        onSelectTag={(id, selected) => {
          if (selected) {
            setSelectedTags(prev => [...prev, id])
          } else {
            setSelectedTags(prev => prev.filter(tagId => tagId !== id))
          }
        }}
        onEditTag={handleEditTag}
        onDeleteTag={handleDeleteTag}
        onToggleFavorite={handleToggleFavorite}
        onToggleStatus={async (tagId: string) => {
          const tag = tags.find(t => t.id === tagId)
          if (tag) {
            await updateTag(tagId, { ativo: !tag.ativo })
          }
        }}
      />

      {/* Modais */}
      <CriarTagModal
        isOpen={showCriarModal}
        onClose={() => setShowCriarModal(false)}
        onSave={handleCreateTag}
        categorias={categorias}
      />

      <EditarTagModal
        isOpen={showEditarModal}
        onClose={() => {
          setShowEditarModal(false)
          setSelectedTag(null)
        }}
        tag={selectedTag}
        onSave={handleUpdateTag}
        onDelete={handleDeleteTag}
        categorias={categorias}
      />

      <ImportarTagsModal
        isOpen={showImportarModal}
        onClose={() => setShowImportarModal(false)}
        onImport={async (importedTags) => {
          for (const tagData of importedTags) {
            await handleCreateTag(tagData)
          }
          setShowImportarModal(false)
        }}
        existingTags={tags.map(tag => tag.nome.toLowerCase())}
      />
      </div>
    </AdminLayout>
  )
}
