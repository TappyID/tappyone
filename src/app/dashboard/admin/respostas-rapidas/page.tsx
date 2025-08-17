'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Filter,
  Zap,
  Clock,
  BarChart3,
  Settings,
  Play,
  Pause,
  Edit,
  Tag
} from 'lucide-react'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import { useRespostasRapidas } from '../../../../hooks/useRespostasRapidas'
import RespostasList from './components/RespostasList'
import CategoriasList from './components/CategoriasList'
import EstatisticasCard from './components/EstatisticasCard'
import CriarRespostaModal from './components/CriarRespostaModal'
import CriarCategoriaModal from './components/CriarCategoriaModal'

export default function RespostasRapidasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'respostas' | 'categorias' | 'estatisticas'>('respostas')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false)

  const {
    respostas,
    categorias,
    estatisticas,
    loading,
    createResposta,
    updateResposta,
    deleteResposta,
    togglePauseResposta,
    executeResposta,
    createCategoria,
    updateCategoria,
    deleteCategoria
  } = useRespostasRapidas()

  const filteredRespostas = respostas.filter(resposta => {
    const matchesSearch = resposta.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resposta.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || resposta.categoria_id === selectedCategory
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && !resposta.pausado) ||
                         (statusFilter === 'paused' && resposta.pausado)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const filteredCategorias = categorias.filter(categoria => {
    return categoria.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
           categoria.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const tabs = [
    { id: 'respostas', label: 'Respostas Rápidas', icon: Zap, count: respostas.length },
    { id: 'categorias', label: 'Categorias', icon: Tag, count: categorias.length },
    { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3, count: null }
  ]

  const handleEditCategoria = (categoria: any) => {
    // TODO: Implement edit categoria modal
    console.log('Edit categoria:', categoria)
  }

  const handleDeleteCategoria = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      await deleteCategoria(id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AtendimentosTopBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Respostas Rápidas</h1>
              <p className="text-gray-600 mt-1">
                Automatize suas conversas com respostas inteligentes
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab === 'respostas' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Nova Resposta
                </motion.button>
              )}
              
              {activeTab === 'categorias' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateCategoryModal(true)}
                  className="bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  Nova Categoria
                </motion.button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-[#305e73] shadow-lg border border-[#305e73]/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-[#305e73] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Filters - Only show for respostas tab */}
          {activeTab === 'respostas' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-4 flex-wrap">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar respostas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="min-w-[200px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#305e73] focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Todas as categorias</option>
                    {categorias.map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  {[
                    { value: 'all', label: 'Todas', color: 'bg-gray-100 text-gray-700' },
                    { value: 'active', label: 'Ativas', color: 'bg-green-100 text-green-700' },
                    { value: 'paused', label: 'Pausadas', color: 'bg-red-100 text-red-700' }
                  ].map((status) => (
                    <motion.button
                      key={status.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStatusFilter(status.value as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        statusFilter === status.value
                          ? status.color
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {status.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'respostas' && (
            <motion.div
              key="respostas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <RespostasList
                respostas={filteredRespostas}
                categorias={categorias}
                loading={loading}
                onEdit={(resposta) => {
                  // TODO: Implement edit modal
                  console.log('Edit resposta:', resposta)
                }}
                onDuplicate={(resposta) => {
                  // TODO: Implement duplicate functionality
                  console.log('Duplicate resposta:', resposta)
                }}
                onTogglePause={togglePauseResposta}
                onExecute={(resposta) => {
                  // TODO: Implement chat selection for execution
                  console.log('Execute resposta:', resposta)
                }}
                onDelete={deleteResposta}
              />
            </motion.div>
          )}

          {activeTab === 'categorias' && (
            <motion.div
              key="categorias"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CategoriasList
                categorias={filteredCategorias}
                loading={loading}
                onEdit={handleEditCategoria}
                onDelete={handleDeleteCategoria}
              />
            </motion.div>
          )}

          {activeTab === 'estatisticas' && (
            <motion.div
              key="estatisticas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <EstatisticasCard
                estatisticas={estatisticas}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CriarRespostaModal
          categorias={categorias}
          onClose={() => setShowCreateModal(false)}
          onSave={createResposta}
        />
      )}

      {showCreateCategoryModal && (
        <CriarCategoriaModal
          onClose={() => setShowCreateCategoryModal(false)}
          onSave={createCategoria}
        />
      )}
    </div>
  )
}
