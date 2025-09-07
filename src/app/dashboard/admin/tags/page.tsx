'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
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

interface Contato {
  id: string
  nome: string
  numeroTelefone: string
  tags?: Array<{
    id: string
    contatoId: string
    tagId: string
  }>
}

export default function TagsPage() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
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
  const [contatos, setContatos] = useState<Contato[]>([])
  const [contatosLoading, setContatosLoading] = useState(true)

  const loading = authLoading || tagsLoading

  // Função para buscar contatos
  const fetchContatos = async () => {
    try {
      setContatosLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/contatos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (response.ok) {
        const data = await response.json()
        const contatosData = Array.isArray(data) ? data : (data.contatos || [])
        setContatos(contatosData)
      } else {
        console.error('Erro ao buscar contatos:', response.status)
      }
    } catch (error) {
      console.error('Erro ao buscar contatos:', error)
    } finally {
      setContatosLoading(false)
    }
  }

  // Buscar contatos quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      fetchContatos()
    }
  }, [user])

  // Handlers para ações das tags
  const handleCreateTag = async (tagData: {
    nome: string
    descricao?: string
    cor: string
    categoria: string
    contatos?: string[]
  }) => {
    try {
      // Remover contatos do objeto antes de criar a tag
      const { contatos, ...tagDataSemContatos } = tagData
      
      // Criar a tag primeiro (sem contatos)
      const novaTag = await createTag(tagDataSemContatos)
      
      // Se há contatos selecionados, aplicar a tag neles
      if (tagData.contatos && tagData.contatos.length > 0 && novaTag) {
        console.log('🏷️ Aplicando tag nos contatos selecionados:', {
          tagId: novaTag.id,
          contatos: tagData.contatos
        })
        
        // Aplicar tag em cada contato
        const token = localStorage.getItem('token')
        for (const contatoId of tagData.contatos) {
          try {
            await fetch(`/api/contatos/${contatoId}/tags`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ tagIds: [novaTag.id] })
            })
            console.log(`✅ Tag aplicada ao contato ${contatoId}`)
          } catch (error) {
            console.error(`❌ Erro ao aplicar tag ao contato ${contatoId}:`, error)
          }
        }
      }
      
      // Recarregar dados para sincronizar
      await Promise.all([
        fetchContatos(),
        fetchTags()
      ])
      
      setShowCriarModal(false)
    } catch (error) {
      console.error('Erro ao criar tag:', error)
    }
  }

  const handleUpdateTag = async (tagData: Partial<TagData>) => {
    if (!selectedTag) return
    try {
      await updateTag(selectedTag.id, tagData)
      
      // Recarregar dados para sincronizar
      await Promise.all([
        fetchContatos(),
        fetchTags()
      ])
      
      setShowEditarModal(false)
      setSelectedTag(null)
    } catch (error) {
      console.error('Erro ao atualizar tag:', error)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag(tagId)
      
      // Recarregar dados para sincronizar
      await Promise.all([
        fetchContatos(),
        fetchTags()
      ])
      
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
      // Sincronizar dados
      await fetchTags()
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
      <div className={`flex items-center justify-center min-h-screen ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-white'
      }`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-white'
      }`}>
        <div className={`mb-4 ${
          theme === 'dark' ? 'text-red-400' : 'text-red-500'
        }`}>❌ Erro ao carregar tags: {error}</div>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-slate-700 to-slate-600 border border-slate-500/50' 
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
            }`}>
              <Tag className={`w-8 h-8 ${
                theme === 'dark' ? 'text-emerald-400' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent' 
                  : 'text-gray-900'
              }`}>
                Gerenciar Tags
              </h1>
              <p className={`text-lg mt-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Organize e categorize seus contatos com tags personalizadas para facilitar a busca e segmentação.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <TagsStats tags={tags} />
        
        {/* Controles */}
        <div className="flex flex-col lg:flex-row gap-4">
        {/* Barra de Pesquisa */}
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Buscar tags por nome ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === 'dark' 
                ? 'bg-slate-800 border-slate-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === 'dark' 
                ? 'bg-slate-800 border-slate-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="todas">Todas as categorias</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === 'dark' 
                ? 'bg-slate-800 border-slate-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="todas">Todos os status</option>
            <option value="ativas">Ativas</option>
            <option value="inativas">Inativas</option>
            <option value="favoritas">Favoritas</option>
          </select>

          {/* Botão de View Mode */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={`p-2 border rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'border-slate-600 hover:bg-slate-700 text-white' 
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          {selectedTags.length > 0 && (
            <motion.button
              onClick={handleBulkDelete}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Excluir ({selectedTags.length})
            </motion.button>
          )}
          
          <motion.button
            onClick={() => setShowImportarModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-all ${
              theme === 'dark' 
                ? 'border-slate-600 hover:bg-slate-700 text-white' 
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4" />
            Importar
          </motion.button>

          <motion.button
            onClick={() => setShowCriarModal(true)}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-500 group overflow-hidden ${
              theme === 'dark' ? 'text-white' : 'bg-blue-500 text-white rounded-lg hover:bg-blue-600'
            }`}
            style={theme === 'dark' ? {
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px -12px rgba(59, 130, 246, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            } : {}}
          >
            {/* Glass effect layers for dark mode */}
            {theme === 'dark' && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-500/20 rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
              </>
            )}
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Nova Tag</span>
          </motion.button>
        </div>
      </div>

      {/* Lista de Tags */}
      <TagsList
        tags={filteredTags}
        viewMode={viewMode}
        selectedTags={selectedTags}
        contatos={contatos}
        onSelectedTagsChange={setSelectedTags}
        onEditTag={handleEditTag}
        onDeleteTag={handleDeleteTag}
        onToggleFavorito={handleToggleFavorite}
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
