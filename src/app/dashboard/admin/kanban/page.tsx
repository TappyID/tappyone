'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Users, 
  Calendar, 
  Clock, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  CheckCircle,
  Target,
  Trello,
  Filter,
  Search,
  BarChart3,
  Activity,
  Zap,
  Archive,
  PlayCircle,
  PauseCircle,
  Settings,
  ChevronDown
} from 'lucide-react'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import { useTheme } from '@/contexts/ThemeContext'
import { useKanban } from '@/hooks/useKanban'
import CriarQuadroModal from './components/CriarQuadroModal'

export default function KanbanPage() {
  const [selectedQuadro, setSelectedQuadro] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCriarModal, setShowCriarModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState('todos')
  const [sortBy, setSortBy] = useState('recente')
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()
  const { actualTheme } = useTheme()
  const { quadros, loading, error, createQuadro, deleteQuadro } = useKanban()

  // Mock statistics - em produção viria da API
  const statistics = {
    ativos: quadros.filter(q => q.status === 'ativo').length || 12,
    inativos: quadros.filter(q => q.status === 'inativo').length || 3,
    excluidos: quadros.filter(q => q.status === 'excluido').length || 2,
    automatizados: 8, // Mock value - em produção seria baseado em uma propriedade real
    total: quadros.length || 25,
    crescimento: '+12%'
  }

  const handleCreateQuadro = () => {
    setShowCriarModal(true)
  }

  const handleCreateQuadroWithData = async (data: {
    nome: string
    nicho: string
    cor: string
    descricao: string
  }) => {
    try {
      const newQuadro = await createQuadro({
        nome: data.nome,
        cor: data.cor,
        descricao: data.descricao,
        posicao: quadros.length + 1
      })
      console.log('Quadro criado:', newQuadro)
      // TODO: Aqui vamos integrar com a IA para gerar as colunas baseadas no nicho
      console.log('Nicho para IA:', data.nicho)
    } catch (error) {
      console.error('Erro ao criar quadro:', error)
      throw error
    }
  }

  const handleEditQuadro = (quadroId: string) => {
    console.log('Editar quadro:', quadroId)
    // TODO: Implementar modal de edição
  }

  const handleViewQuadro = (quadroId: string) => {
    console.log('Visualizar quadro:', quadroId)
    setSelectedQuadro(quadroId)
    router.push(`/dashboard/admin/kanban/${quadroId}`)
  }

  const handleDeleteQuadro = async (quadroId: string) => {
    try {
      await deleteQuadro(quadroId)
      console.log('Quadro deletado:', quadroId)
    } catch (error) {
      console.error('Erro ao deletar quadro:', error)
    }
  }

  const toggleFavorito = (quadroId: string) => {
    console.log('Toggle favorito:', quadroId)
    // TODO: Implementar sistema de favoritos
  }

  if (loading) {
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
        <div className="pt-20 px-6 pb-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className={`text-sm ${
                actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
              }`}>Carregando quadros...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
        <div className="pt-20 px-6 pb-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className={`text-sm mb-4 ${
                actualTheme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>Erro ao carregar quadros: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  actualTheme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      actualTheme === 'dark' 
        ? 'bg-gradient-to-br from-[#273155] via-[#2a3660] to-[#273155]' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100'
    }`}>
      {/* TopBar Original */}
      <AtendimentosTopBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Conteúdo Principal */}
      <div className="pt-20 px-6 pb-8">
        <div className="w-full">
          
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <motion.h1 
                  className="text-3xl font-bold text-gray-900"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  CRM Kanban
                </motion.h1>
                <motion.div
                  className="px-4 py-2 bg-gradient-to-r from-[#305e73]/10 to-[#3a6d84]/10 border border-[#305e73]/20 rounded-full flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-sm font-semibold text-[#305e73]">{statistics.total} Quadros</span>
                </motion.div>
              </div>
              
              <motion.button
                onClick={handleCreateQuadro}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 group"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Plus className="w-5 h-5" />
                </motion.div>
                <span>Novo Quadro</span>
              </motion.button>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Total de Quadros */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-[#305e73]" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {statistics.crescimento}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.total}</div>
                <div className="text-sm text-gray-600">Total de Quadros</div>
              </motion.div>

              {/* Quadros Ativos */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                    <PlayCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <motion.div 
                    className="w-3 h-3 bg-emerald-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.ativos}</div>
                <div className="text-sm text-gray-600">Quadros Ativos</div>
              </motion.div>

              {/* Quadros Inativos */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                    <PauseCircle className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.inativos}</div>
                <div className="text-sm text-gray-600">Quadros Inativos</div>
              </motion.div>

              {/* Quadros Automatizados */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Settings className="w-4 h-4 text-purple-400" />
                  </motion.div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.automatizados}</div>
                <div className="text-sm text-gray-600">Automatizados</div>
              </motion.div>

              {/* Quadros Excluídos */}
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl">
                    <Archive className="w-6 h-6 text-red-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{statistics.excluidos}</div>
                <div className="text-sm text-gray-600">Excluídos</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Filtros Sofisticados */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#305e73]/10 to-[#3a6d84]/10 rounded-xl">
                    <Filter className="w-5 h-5 text-[#305e73]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Filtros Avançados</h3>
                </div>
                
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-[#305e73] hover:bg-[#305e73]/5 rounded-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm font-medium">
                    {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                  </span>
                  <motion.div
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              </div>

              {/* Barra de Busca */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar quadros por nome, descrição ou tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#305e73]/20 focus:border-[#305e73] transition-all duration-300"
                />
              </div>

              {/* Filtros Expandidos */}
              <motion.div
                initial={false}
                animate={{ 
                  height: showFilters ? 'auto' : 0,
                  opacity: showFilters ? 1 : 0 
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-6">
                  {/* Filtros por Status */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Status dos Quadros</h4>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { key: 'todos', label: 'Todos', icon: BarChart3, color: 'gray' },
                        { key: 'ativos', label: 'Ativos', icon: PlayCircle, color: 'emerald' },
                        { key: 'inativos', label: 'Inativos', icon: PauseCircle, color: 'orange' },
                        { key: 'automatizados', label: 'Automatizados', icon: Zap, color: 'purple' },
                        { key: 'excluidos', label: 'Excluídos', icon: Archive, color: 'red' }
                      ].map((filter) => {
                        const Icon = filter.icon
                        const isActive = activeFilter === filter.key
                        return (
                          <motion.button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                              isActive
                                ? `bg-${filter.color}-100 text-${filter.color}-700 border-2 border-${filter.color}-200`
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{filter.label}</span>
                            {isActive && (
                              <motion.div
                                className={`w-2 h-2 bg-${filter.color}-400 rounded-full`}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Ordenação */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Ordenar Por</h4>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { key: 'recente', label: 'Mais Recentes' },
                        { key: 'antigo', label: 'Mais Antigos' },
                        { key: 'nome', label: 'Nome A-Z' },
                        { key: 'progresso', label: 'Progresso' },
                        { key: 'cards', label: 'Nº de Cards' }
                      ].map((sort) => (
                        <motion.button
                          key={sort.key}
                          onClick={() => setSortBy(sort.key)}
                          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                            sortBy === sort.key
                              ? 'bg-[#305e73] text-white'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {sort.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Filtros Rápidos */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Filtros Rápidos</h4>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { label: 'Criados Hoje', count: 3 },
                        { label: 'Atualizados Recentemente', count: 8 },
                        { label: 'Com Automação', count: statistics.automatizados },
                        { label: 'Alta Atividade', count: 5 },
                        { label: 'Necessitam Atenção', count: 2 }
                      ].map((quick, index) => (
                        <motion.button
                          key={index}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-xl font-medium text-sm transition-all duration-300 border border-blue-200"
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>{quick.label}</span>
                          <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
                            {quick.count}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Grid de Quadros */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {quadros.length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <p className={`text-sm mb-4 ${
                    actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                  }`}>Nenhum quadro encontrado</p>
                  <button
                    onClick={handleCreateQuadro}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      actualTheme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Criar Primeiro Quadro
                  </button>
                </div>
              </div>
            ) : (
              quadros.map((quadro, index) => (
                <motion.div
                  key={quadro.id}
                  className="group cursor-pointer relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 + (index * 0.1) }}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/dashboard/admin/kanban/${quadro.id}`)}
                >
                  {/* Card Principal */}
                  <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100/50 backdrop-blur-sm">
                    
                    {/* Gradiente de fundo com cor do branding */}
                    <div 
                      className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                      style={{ 
                        background: `linear-gradient(135deg, #305e73 0%, #3a6d84 100%)`
                      }}
                    />
                    
                    {/* Barra superior colorida */}
                    <div 
                      className="h-2 w-full"
                      style={{ 
                        background: `linear-gradient(90deg, #305e73 0%, #3a6d84 100%)`
                      }}
                    />
                    
                    {/* Efeito de brilho no hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
                      style={{ transform: 'skewX(-20deg)' }}
                    />
                    
                    <div className="p-8">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          {/* Título editável */}
                          <motion.h3 
                            className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#305e73] transition-colors cursor-text"
                            whileHover={{ x: 2 }}
                            onDoubleClick={(e) => {
                              e.stopPropagation()
                              // TODO: Implementar edição inline
                              console.log('Edit title:', quadro.nome)
                            }}
                          >
                            {quadro.nome}
                          </motion.h3>
                          
                          {/* Descrição */}
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {quadro.descricao || 'Sem descrição disponível'}
                          </p>
                          
                          {/* Status Badge */}
                          <motion.div 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-700"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <motion.div 
                              className="w-2 h-2 rounded-full bg-emerald-400"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <span className="text-xs font-semibold">Ativo</span>
                          </motion.div>
                        </div>
                        
                        {/* Menu de Ações */}
                        <motion.div
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          initial={{ scale: 0.8 }}
                          whileHover={{ scale: 1 }}
                        >
                          <div className="flex items-center gap-2">
                            <motion.button
                              className="p-2 rounded-xl bg-gray-50 hover:bg-[#305e73] hover:text-white transition-all duration-300 group/btn"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/dashboard/admin/kanban/${quadro.id}`)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              className="p-2 rounded-xl bg-gray-50 hover:bg-blue-500 hover:text-white transition-all duration-300"
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                // TODO: Implementar edição
                                console.log('Edit quadro:', quadro.id)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              className="p-2 rounded-xl bg-gray-50 hover:bg-red-500 hover:text-white transition-all duration-300"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Tem certeza que deseja excluir este quadro?')) {
                                  deleteQuadro(quadro.id)
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      </div>
                      
                      {/* Estatísticas */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <motion.div 
                          className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="text-2xl font-bold text-[#305e73] mb-1">
                            {quadro.totalCards || 0}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">Cards</div>
                        </motion.div>
                        
                        <motion.div 
                          className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {quadro.membros || 1}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">Membros</div>
                        </motion.div>
                        
                        <motion.div 
                          className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100"
                          whileHover={{ scale: 1.05, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="text-2xl font-bold text-emerald-600 mb-1">
                            {quadro.progresso || 0}%
                          </div>
                          <div className="text-xs text-gray-600 font-medium">Progresso</div>
                        </motion.div>
                      </div>
                      
                      {/* Barra de Progresso */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">Progresso Geral</span>
                          <span className="text-xs font-bold text-[#305e73]">{quadro.progresso || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-[#305e73] to-[#3a6d84] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${quadro.progresso || 0}%` }}
                            transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                          />
                        </div>
                      </div>
                      
                      {/* Footer com ações rápidas */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="flex items-center gap-2 text-xs text-gray-500"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Criado há {Math.floor(Math.random() * 30) + 1} dias</span>
                          </motion.div>
                        </div>
                        
                        <motion.button
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl text-xs font-semibold hover:shadow-lg transition-all duration-300"
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/admin/kanban/${quadro.id}`)
                          }}
                        >
                          <Target className="w-3 h-3" />
                          Abrir Quadro
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criar Quadro */}
      <CriarQuadroModal
        isOpen={showCriarModal}
        onClose={() => setShowCriarModal(false)}
        onCreateQuadro={handleCreateQuadroWithData}
      />
    </div>
  )
}
