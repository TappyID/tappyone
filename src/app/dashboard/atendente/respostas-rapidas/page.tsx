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
import { useRespostasRapidas, RespostaRapida } from '../../../../hooks/useRespostasRapidas'
import { useTheme } from '@/contexts/ThemeContext'
import RespostasList from './components/RespostasList'
import CategoriasList from './components/CategoriasList'
import EstatisticasCard from './components/EstatisticasCard'
import CriarRespostaModal from './components/CriarRespostaModal'
import CriarCategoriaModal from './components/CriarCategoriaModal'
import VisualizarRespostaModal from './components/VisualizarRespostaModal'
import CriarComIAModal from './components/CriarComIAModal'

export default function RespostasRapidasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'respostas' | 'categorias' | 'estatisticas'>('respostas')
  const { actualTheme } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all')
  const [showCategoriaModal, setShowCategoriaModal] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedResposta, setSelectedResposta] = useState<RespostaRapida | null>(null)
  const [editingResposta, setEditingResposta] = useState<RespostaRapida | null>(null)
  const [showAIModal, setShowAIModal] = useState(false)

  const {
    respostas,
    categorias,
    estatisticas,
    loading,
    error,
    fetchRespostas,
    fetchCategorias,
    createResposta,
    updateResposta,
    deleteResposta,
    togglePauseResposta,
    executeResposta,
    createCategoria,
    deleteCategoria,
    updateCategoria
  } = useRespostasRapidas()

  const filteredRespostas = (respostas || []).filter(resposta => {
    const matchesSearch = resposta.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resposta.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || resposta.categoria_id === selectedCategory
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && resposta.ativo) ||
                         (statusFilter === 'paused' && !resposta.ativo)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleCreateWithAI = () => {
    setShowAIModal(true)
  }

  const handleViewResposta = (resposta: RespostaRapida) => {
    setSelectedResposta(resposta)
    setShowViewModal(true)
  }

  const handleEditResposta = (resposta: RespostaRapida) => {
    setEditingResposta(resposta)
    setShowCreateModal(true)
  }

  const handleDuplicateResposta = async (resposta: RespostaRapida) => {
    try {
      const duplicatedResposta = {
        ...resposta,
        titulo: `${resposta.titulo} (Cópia)`,
        id: undefined
      }
      await createResposta(duplicatedResposta)
    } catch (err) {
      console.error('Erro ao duplicar resposta:', err)
    }
  }

  const handleExecuteResposta = async (respostaId: string, chatId: string) => {
    try {
      await executeResposta(respostaId, chatId)
    } catch (err) {
      console.error('Erro ao executar resposta:', err)
    }
  }

  const filteredCategorias = (categorias || []).filter(categoria => {
    return categoria.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
           categoria.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const tabs = [
    { id: 'respostas', label: 'Respostas Rápidas', icon: Zap, count: respostas?.length || 0 },
    { id: 'categorias', label: 'Categorias', icon: Tag, count: categorias?.length || 0 },
    { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3, count: null }
  ]

  const handleEditCategoria = (categoria: any) => {
    setEditingCategoria(categoria)
    setShowCategoriaModal(true)
  }

  const handleDeleteCategoria = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteCategoria(id)
        console.log('Categoria excluída com sucesso:', id)
      } catch (error) {
        console.error('Erro ao excluir categoria:', error)
        alert('Erro ao excluir categoria: ' + (error instanceof Error ? error.message : 'Erro desconhecido'))
      }
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      actualTheme === 'dark' 
        ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
    }`}>
      <AtendimentosTopBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold transition-colors duration-300 ${
                actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Respostas Rápidas</h1>
              <p className={`mt-1 transition-colors duration-300 ${
                actualTheme === 'dark' ? 'text-white/70' : 'text-gray-600'
              }`}>
                Automatize suas conversas com respostas inteligentes
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {activeTab === 'respostas' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCreateWithAI()}
                    className={`relative flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-500 group overflow-hidden ${
                      actualTheme === 'dark'
                        ? 'text-white'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl'
                    }`}
                    style={actualTheme === 'dark' ? {
                      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(79, 70, 229, 0.9) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px -12px rgba(147, 51, 234, 0.6), 0 0 0 1px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    } : {}}
                  >
                    {/* Glass effect layers for dark mode */}
                    {actualTheme === 'dark' && (
                      <>
                        {/* Base glass layer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-800/60 via-purple-900/40 to-indigo-800/60 rounded-2xl" />
                        
                        {/* Purple accent layer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-indigo-500/20 rounded-2xl" />
                        
                        {/* Light reflection */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                        
                        {/* Animated border glow */}
                        <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-purple-400/50 transition-all duration-500" />
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                      </>
                    )}
                    
                    <Zap className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Criar com IA</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className={`relative flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-500 group overflow-hidden ${
                      actualTheme === 'dark'
                        ? 'text-white'
                        : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl shadow-lg hover:shadow-xl'
                    }`}
                    style={actualTheme === 'dark' ? {
                      background: 'linear-gradient(135deg, rgba(48, 94, 115, 0.8) 0%, rgba(58, 109, 132, 0.9) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px -12px rgba(48, 94, 115, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    } : {}}
                  >
                    {/* Glass effect layers for dark mode */}
                    {actualTheme === 'dark' && (
                      <>
                        {/* Base glass layer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-2xl" />
                        
                        {/* Blue accent layer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 rounded-2xl" />
                        
                        {/* Light reflection */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                        
                        {/* Animated border glow */}
                        <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                      </>
                    )}
                    
                    <Plus className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Nova Resposta</span>
                  </motion.button>
                </>
              )}
              
              {activeTab === 'categorias' && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCategoriaModal(true)}
                  className={`relative flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-500 group overflow-hidden ${
                    actualTheme === 'dark'
                      ? 'text-white'
                      : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl shadow-lg hover:shadow-xl'
                  }`}
                  style={actualTheme === 'dark' ? {
                    background: 'linear-gradient(135deg, rgba(48, 94, 115, 0.8) 0%, rgba(58, 109, 132, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px -12px rgba(48, 94, 115, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  } : {}}
                >
                  {/* Glass effect layers for dark mode */}
                  {actualTheme === 'dark' && (
                    <>
                      {/* Base glass layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-2xl" />
                      
                      {/* Blue accent layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20 rounded-2xl" />
                      
                      {/* Light reflection */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                      
                      {/* Animated border glow */}
                      <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                    </>
                  )}
                  
                  <Plus className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Nova Categoria</span>
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
                      ? actualTheme === 'dark'
                        ? 'bg-slate-900/60 text-blue-300 shadow-lg border border-blue-400/30 backdrop-blur-sm'
                        : 'bg-white text-[#305e73] shadow-lg border border-[#305e73]/20'
                      : actualTheme === 'dark'
                        ? 'text-white/70 hover:text-white hover:bg-slate-800/40'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {tab.count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? actualTheme === 'dark'
                          ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                          : 'bg-[#305e73] text-white'
                        : actualTheme === 'dark'
                          ? 'bg-slate-700/50 text-white/70'
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
              className={`rounded-2xl p-6 shadow-lg border transition-all duration-300 ${
                actualTheme === 'dark'
                  ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-sm'
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4 flex-wrap">
                {/* Search */}
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      actualTheme === 'dark' ? 'text-white/40' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      placeholder="Buscar respostas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-300 ${
                        actualTheme === 'dark'
                          ? 'border-slate-600/50 bg-slate-800/50 text-white placeholder-white/40 focus:ring-blue-400/30 focus:bg-slate-800/70'
                          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring-[#305e73]'
                      }`}
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="min-w-[200px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all duration-300 ${
                      actualTheme === 'dark'
                        ? 'border-slate-600/50 bg-slate-800/50 text-white focus:ring-blue-400/30 focus:bg-slate-800/70'
                        : 'border-gray-200 bg-white text-gray-900 focus:ring-[#305e73]'
                    }`}
                  >
                    <option value="">Todas as categorias</option>
                    {(categorias || []).map(categoria => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  {[
                    { 
                      value: 'all', 
                      label: 'Todas', 
                      colorLight: 'bg-gray-100 text-gray-700',
                      colorDark: 'bg-slate-700/50 text-white border border-slate-600/50'
                    },
                    { 
                      value: 'active', 
                      label: 'Ativas', 
                      colorLight: 'bg-green-100 text-green-700',
                      colorDark: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    },
                    { 
                      value: 'paused', 
                      label: 'Pausadas', 
                      colorLight: 'bg-red-100 text-red-700',
                      colorDark: 'bg-red-500/20 text-red-300 border border-red-400/30'
                    }
                  ].map((status) => (
                    <motion.button
                      key={status.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStatusFilter(status.value as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        statusFilter === status.value
                          ? actualTheme === 'dark' ? status.colorDark : status.colorLight
                          : actualTheme === 'dark'
                            ? 'bg-slate-800/50 text-white/70 hover:bg-slate-700/50 border border-slate-600/30'
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
                onEdit={handleEditResposta}
                onDelete={deleteResposta}
                onTogglePause={togglePauseResposta}
                onExecute={handleExecuteResposta}
                onDuplicate={handleDuplicateResposta}
                onCreateFirst={() => setShowCreateModal(true)}
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
                categorias={categorias}
                loading={loading}
                onEdit={handleEditCategoria}
                onDelete={handleDeleteCategoria}
                onCreateFirst={() => setShowCategoriaModal(true)}
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
        <CriarRespostaModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setEditingResposta(null)
          }}
          onSave={createResposta}
          onUpdate={updateResposta}
          categorias={categorias}
          editingResposta={editingResposta}
        />

        <CriarCategoriaModal
          isOpen={showCategoriaModal}
          onClose={() => {
            setShowCategoriaModal(false)
            setEditingCategoria(null)
          }}
          onSave={createCategoria}
          onUpdate={updateCategoria}
          editingCategoria={editingCategoria}
        />

        <VisualizarRespostaModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          resposta={selectedResposta}
          onEdit={() => {
            setShowViewModal(false)
            setShowCreateModal(true)
          }}
        />

        <CriarComIAModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onCreateResposta={createResposta}
        />
    </div>
  )
}
