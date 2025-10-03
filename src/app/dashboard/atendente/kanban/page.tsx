'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Filter,
  ChevronDown,
  Search,
  Plus,
  Star,
  Edit3,
  Trash2,
  MessageCircle,
  CreditCard,
  Columns,
  Trello,
  SortAsc,
  MoreVertical,
  Target,
  CheckCircle,
  AlertCircle,
  Zap,
  Sparkles,
  X,
  Bot,
  Workflow,
  Eye,
  BarChart3,
  PlayCircle,
  PauseCircle,
  Settings,
  Archive
} from 'lucide-react'
import AtendimentosTopBar from '../atendimentos/components/AtendimentosTopBar'
import { useKanban } from '@/hooks/useKanban'
import { useTags } from '@/hooks/useTags'
import { useTheme } from '@/contexts/ThemeContext'
import { useColorTheme } from '@/contexts/ColorThemeContext'
import CriarQuadroModal from './components/CriarQuadroModal'
import { useRouter } from 'next/navigation'

export default function KanbanPage() {
  const [selectedQuadro, setSelectedQuadro] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCriarModal, setShowCriarModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState('todos')
  const [sortBy, setSortBy] = useState('nome')
  const [showFilters, setShowFilters] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editingTitle, setEditingTitle] = useState('CRM Kanban')
  const [editingQuadroId, setEditingQuadroId] = useState<string | null>(null)
  const [editingQuadroName, setEditingQuadroName] = useState('')
  const router = useRouter()
  const { actualTheme } = useTheme()
  const { quadros, loading, error, createQuadro, fetchQuadros, deleteQuadro, createColuna, updateQuadro } = useKanban()
  const { tags, getTagsByCategory, getTagColor } = useTags()
  const { theme } = useTheme()
  const { colorTheme } = useColorTheme()
  
  // Estado local para quadros com favoritos
  const [localQuadros, setLocalQuadros] = useState(quadros)
  
  // Sincronizar com quadros do hook
  useEffect(() => {
    setLocalQuadros(quadros)
  }, [quadros])

  // Estatísticas reais baseadas nos quadros carregados
  const statistics = {
    ativos: quadros.filter(q => q.ativo === true).length,
    inativos: quadros.filter(q => q.ativo === false).length,
    total: quadros.length,
    automatizados: quadros.filter(q => q.totalCards && q.totalCards > 10).length, // Quadros com muitos cards são considerados automatizados
    excluidos: 0, // TODO: Implementar soft delete no backend
    crescimento: quadros.length > 0 ? '+' + Math.round((quadros.length / 30) * 100) + '%' : '0%',
    totalCards: quadros.reduce((acc, q) => acc + (q.totalCards || 0), 0),
    totalColunas: quadros.reduce((acc, q) => acc + (q.totalColunas || 0), 0),
    totalConversations: quadros.reduce((acc, q) => acc + (q.totalCards || 0), 0), // Usando totalCards como proxy para conversas por enquanto
    progressoMedio: quadros.length > 0 ? Math.round(quadros.reduce((acc, q) => acc + (q.progresso || 0), 0) / quadros.length) : 0
  }

  // Sistema de log automático
  const saveLogsToFile = (logs: string[]) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `kanban-debug-${timestamp}.json`
    const logData = {
      timestamp: new Date().toISOString(),
      logs: logs,
      summary: {
        totalLogs: logs.length,
        errors: logs.filter(l => l.includes('❌')).length,
        successes: logs.filter(l => l.includes('✅')).length
      }
    }
    
    // Salvar no localStorage temporariamente para debug
    localStorage.setItem('last-kanban-debug', JSON.stringify(logData))
    
    // Criar blob e download automático
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    
    console.log('📁 [PAGE] Logs salvos automaticamente:', filename)
  }

  // Handler para criar quadro com dados detalhados
  const handleCreateQuadroWithData = async (data: { 
    nome: string; 
    nicho: string;
    cor: string;
    descricao?: string; 
    colunas: string[];
  }) => {
    const debugLogs: string[] = []
    
    // Interceptar console.log temporariamente
    const originalLog = console.log
    const originalError = console.error
    
    console.log = (...args) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
      debugLogs.push(`[LOG] ${new Date().toLocaleTimeString()}: ${message}`)
      originalLog(...args)
    }
    
    console.error = (...args) => {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')
      debugLogs.push(`[ERROR] ${new Date().toLocaleTimeString()}: ${message}`)
      originalError(...args)
    }
    
    try {
      console.log('📋 [PAGE] Iniciando criação do quadro:', {
        nome: data.nome,
        nicho: data.nicho,
        cor: data.cor,
        descricao: data.descricao,
        colunasCount: data.colunas.length,
        colunas: data.colunas
      })

      // Criar o quadro primeiro
      const quadroData = await createQuadro({
        nome: data.nome,
        descricao: data.descricao || '',
        cor: data.cor || '#3b82f6',
        posicao: 1
      })
      
      console.log('✅ [PAGE] Quadro criado com sucesso:', quadroData)

      // Criar as colunas sequencialmente
      console.log('📌 [PAGE] Iniciando criação das colunas...')
      
      for (let i = 0; i < data.colunas.length; i++) {
        const colunaNome = data.colunas[i]
        const colunaCor = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'][i % 7]
        
        console.log(`📍 [PAGE] Criando coluna ${i + 1}/${data.colunas.length}:`, {
          nome: colunaNome,
          cor: colunaCor,
          posicao: i + 1,
          quadroId: quadroData.id
        })
        
        try {
          const colunaResult = await createColuna({
            nome: colunaNome,
            cor: colunaCor,
            posicao: i + 1,
            quadroId: quadroData.id
          })
          
          console.log(`✅ [PAGE] Coluna ${i + 1} criada:`, colunaResult)
        } catch (error) {
          console.error(`❌ [PAGE] Erro ao criar coluna ${i + 1}:`, error)
        }
      }
      
      // Fechar modal e atualizar lista
      setShowCriarModal(false)
      // refetch() - não existe no hook
      
      console.log('🎉 [PAGE] Processo de criação finalizado')
      
    } catch (error) {
      console.error('❌ [PAGE] Erro ao criar quadro:', error)
    } finally {
      // Restaurar console original
      console.log = originalLog
      console.error = originalError
      
      // Salvar logs automaticamente
      if (debugLogs.length > 0) {
        saveLogsToFile(debugLogs)
      }
    }
  }

  const handleCreateQuadro = () => {
    setShowCriarModal(true)
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
    setLocalQuadros(prev => prev.map(q => 
      q.id === quadroId ? { ...q, favorito: !q.favorito } : q
    ))
  }

  // Filtrar quadros baseado nos filtros ativos
  const filteredQuadros = quadros.filter(quadro => {
    // Filtro de busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        quadro.nome.toLowerCase().includes(query) ||
        (quadro.descricao && quadro.descricao.toLowerCase().includes(query))
      if (!matchesSearch) return false
    }

    // Filtro por status
    if (activeFilter === 'ativos') {
      return quadro.ativo === true
    } else if (activeFilter === 'inativos') {
      return quadro.ativo === false
    } else if (activeFilter === 'automatizados') {
      return quadro.totalCards && quadro.totalCards > 10
    } else if (activeFilter === 'favoritos') {
      return quadro.favorito === true
    } else if (activeFilter === 'recentes') {
      const hoje = new Date()
      const criacao = new Date(quadro.createdAt)
      const diffDays = Math.floor((hoje.getTime() - criacao.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    }

    return true // 'todos'
  })

  // Ordenar quadros baseado no sortBy
  const sortedQuadros = [...filteredQuadros].sort((a, b) => {
    switch (sortBy) {
      case 'recente':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case 'antigo':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'nome':
        return a.nome.localeCompare(b.nome)
      case 'progresso':
        return (b.progresso || 0) - (a.progresso || 0)
      case 'cards':
        return (b.totalCards || 0) - (a.totalCards || 0)
      default:
        return 0
    }
  })

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
                {isEditingTitle ? (
                  <motion.input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => {
                      setIsEditingTitle(false)
                      // Aqui você salvaria o título na API/localStorage
                      console.log('Saving title:', editingTitle)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsEditingTitle(false)
                        console.log('Saving title:', editingTitle)
                      }
                      if (e.key === 'Escape') {
                        setEditingTitle('CRM Kanban')
                        setIsEditingTitle(false)
                      }
                    }}
                    className={`text-3xl font-bold bg-transparent border-b-2 outline-none ${
                      actualTheme === 'dark' 
                        ? 'text-white border-blue-400 focus:border-blue-300' 
                        : 'text-gray-900 border-[#305e73] focus:border-[#305e73]'
                    }`}
                    autoFocus
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <motion.h1 
                    className={`text-3xl font-bold cursor-pointer transition-colors duration-300 ${
                      actualTheme === 'dark' 
                        ? 'text-white hover:text-blue-300' 
                        : 'text-gray-900 hover:text-[#305e73]'
                    }`}
                    onDoubleClick={() => setIsEditingTitle(true)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    title="Duplo clique para editar"
                  >
                    {editingTitle}
                  </motion.h1>
                )}
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
                  <span className={`text-sm font-semibold ${
                    actualTheme === 'dark' ? 'text-blue-300' : 'text-[#305e73]'
                  }`}>{statistics.total} Quadros</span>
                </motion.div>
              </div>
              
              <motion.button
                onClick={handleCreateQuadro}
                className={`relative flex items-center gap-3 px-6 py-3 font-semibold transition-all duration-500 group overflow-hidden ${
                  actualTheme === 'dark'
                    ? 'text-white'
                    : 'bg-gradient-to-r from-[#305e73] to-[#3a6d84] text-white rounded-xl hover:shadow-lg'
                }`}
                style={actualTheme === 'dark' ? {
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '16px',
                  transform: 'skewX(-10deg)',
                  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                } : {}}
                whileHover={{ 
                  scale: actualTheme === 'dark' ? 1.05 : 1.02, 
                  y: -3,
                  skewX: actualTheme === 'dark' ? '-8deg' : 0
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {/* Glass effect layers for dark mode */}
                {actualTheme === 'dark' && (
                  <>
                    {/* Base glass layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 via-slate-900/40 to-slate-800/60 rounded-2xl" />
                    
                    {/* Blue accent layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 rounded-2xl" />
                    
                    {/* Light reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
                    
                    {/* Animated border glow */}
                    <div className="absolute inset-0 rounded-2xl border border-white/20 group-hover:border-blue-400/50 transition-all duration-500" />
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl transform skew-x-12" />
                    
                    {/* Particle effects */}
                    <div className="absolute top-1 left-3 w-1 h-1 bg-blue-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 right-4 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                    <div className="absolute bottom-2 left-1/3 w-0.5 h-0.5 bg-cyan-400 rounded-full opacity-50 group-hover:opacity-90 transition-opacity duration-400" />
                  </>
                )}

                <motion.div
                  className="relative z-10 flex items-center gap-3"
                  style={{ transform: actualTheme === 'dark' ? 'skewX(10deg)' : 'none' }}
                >
                  <motion.div
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    transition={{ duration: 0.3, type: "spring" }}
                    className={`p-1.5 rounded-lg ${
                      actualTheme === 'dark' 
                        ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm border border-white/20' 
                        : ''
                    }`}
                  >
                    <Plus className={`w-5 h-5 ${
                      actualTheme === 'dark' ? 'text-blue-300 drop-shadow-lg' : ''
                    }`} />
                  </motion.div>
                  <span className={`font-bold ${
                    actualTheme === 'dark' ? 'text-white drop-shadow-lg bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent' : ''
                  }`}>
                    Novo Quadro
                  </span>
                </motion.div>

                {/* Pulsing background effect for dark mode */}
                {actualTheme === 'dark' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.button>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Total de Quadros */}
              <motion.div
                className={`relative rounded-2xl p-6 border transition-all duration-500 group cursor-pointer ${
                  actualTheme === 'dark' 
                    ? 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-900/60 hover:border-slate-600/60 shadow-2xl shadow-black/50 hover:shadow-blue-900/30 backdrop-blur-xl' 
                    : 'bg-white border-gray-100 shadow-lg hover:shadow-xl backdrop-blur-sm'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ y: -6, scale: 1.02 }}
                style={{
                  boxShadow: actualTheme === 'dark' 
                    ? '0 20px 40px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(148, 163, 184, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    : 'none'
                }}
              >
                {/* Dark Glass Background */}
                {actualTheme === 'dark' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-blue-900/10 backdrop-blur-sm rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500 rounded-2xl" />
                    <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
                  </>
                )}
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                    actualTheme === 'dark' 
                      ? 'bg-blue-500/20 border border-blue-400/30 shadow-lg shadow-blue-500/20' 
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
                  }`}>
                    <BarChart3 className={`w-6 h-6 ${
                      actualTheme === 'dark' ? 'text-blue-400' : 'text-[#305e73]'
                    }`} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm border transition-all duration-300 ${
                    actualTheme === 'dark'
                      ? 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30 shadow-sm shadow-emerald-500/20'
                      : 'text-emerald-600 bg-emerald-50 border-emerald-200'
                  }`}>
                    Total
                  </span>
                </div>
                
                <div className={`text-3xl font-bold mb-1 relative z-10 transition-all duration-300 ${
                  actualTheme === 'dark' ? 'text-white drop-shadow-lg group-hover:text-blue-300' : 'text-gray-900 group-hover:text-[#305e73]'
                }`}>{statistics.total}</div>
                <div className={`text-sm relative z-10 transition-all duration-300 ${
                  actualTheme === 'dark' ? 'text-white/70 group-hover:text-white/90' : 'text-gray-600'
                }`}>Total de Quadros</div>
                
                {/* Shimmer effect */}
                {actualTheme === 'dark' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                )}
              </motion.div>

              {/* Quadros Ativos */}
              <motion.div
                className={`relative rounded-2xl p-6 border transition-all duration-500 group cursor-pointer ${
                  actualTheme === 'dark' 
                    ? 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-900/60 hover:border-slate-600/60 shadow-2xl shadow-black/50 hover:shadow-emerald-900/30 backdrop-blur-xl' 
                    : 'bg-white border-gray-100 shadow-lg hover:shadow-xl backdrop-blur-sm'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ y: -6, scale: 1.02 }}
                style={{
                  boxShadow: actualTheme === 'dark' 
                    ? '0 20px 40px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(148, 163, 184, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    : 'none'
                }}
              >
                {/* Dark Glass Background */}
                {actualTheme === 'dark' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-emerald-900/10 backdrop-blur-sm rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-500/5 group-hover:from-emerald-500/10 group-hover:to-green-500/10 transition-all duration-500 rounded-2xl" />
                    <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
                  </>
                )}
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                    actualTheme === 'dark' 
                      ? 'bg-emerald-500/20 border border-emerald-400/30 shadow-lg shadow-emerald-500/20' 
                      : 'bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200'
                  }`}>
                    <PlayCircle className={`w-6 h-6 ${
                      actualTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                    }`} />
                  </div>
                  <motion.div 
                    className={`w-2 h-2 rounded-full relative ${
                      actualTheme === 'dark' ? 'bg-emerald-400' : 'bg-emerald-400'
                    }`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {actualTheme === 'dark' && (
                      <div className="absolute inset-0 bg-emerald-400 rounded-full blur-sm opacity-60" />
                    )}
                  </motion.div>
                </div>
                
                <div className={`text-3xl font-bold mb-1 relative z-10 transition-all duration-300 ${
                  actualTheme === 'dark' ? 'text-white drop-shadow-lg group-hover:text-emerald-300' : 'text-gray-900 group-hover:text-emerald-600'
                }`}>{statistics.ativos}</div>
                <div className={`text-sm relative z-10 transition-all duration-300 ${
                  actualTheme === 'dark' ? 'text-white/70 group-hover:text-white/90' : 'text-gray-600'
                }`}>Quadros Ativos</div>
                
                {/* Shimmer effect */}
                {actualTheme === 'dark' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                )}
              </motion.div>

              {/* Quadros Inativos */}
              <motion.div
                className={`relative rounded-2xl p-6 border transition-all duration-500 group cursor-pointer ${
                  actualTheme === 'dark' 
                    ? 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-900/60 hover:border-slate-600/60 shadow-2xl shadow-black/50 hover:shadow-orange-900/30 backdrop-blur-xl' 
                    : 'bg-white border-gray-100 shadow-lg hover:shadow-xl backdrop-blur-sm'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{ y: -6, scale: 1.02 }}
                style={{
                  boxShadow: actualTheme === 'dark' 
                    ? '0 20px 40px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(148, 163, 184, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    : 'none'
                }}
              >
                {/* Dark Glass Background */}
                {actualTheme === 'dark' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-transparent to-orange-900/10 backdrop-blur-sm rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 group-hover:from-orange-500/10 group-hover:to-amber-500/10 transition-all duration-500 rounded-2xl" />
                    <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
                  </>
                )}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                    actualTheme === 'dark' 
                      ? 'bg-orange-500/20 border border-orange-400/30 shadow-lg shadow-orange-500/20' 
                      : 'bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200'
                  }`}>
                    <PauseCircle className={`w-6 h-6 ${
                      actualTheme === 'dark' ? 'text-orange-400' : 'text-orange-500'
                    }`} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm border transition-all duration-300 ${
                    actualTheme === 'dark'
                      ? 'text-orange-300 bg-orange-500/20 border-orange-400/30 shadow-sm shadow-orange-500/20'
                      : 'text-orange-600 bg-orange-50 border-orange-200'
                  }`}>
                    Parado
                  </span>
                </div>
                <div className={`text-3xl font-bold mb-1 relative z-10 transition-all duration-300 ${
                  actualTheme === 'dark' ? 'text-white drop-shadow-lg group-hover:text-orange-300' : 'text-gray-900 group-hover:text-orange-600'
                }`}>{statistics.inativos}</div>
                <div className={`text-sm relative z-10 transition-all duration-300 ${
                  actualTheme === 'dark' ? 'text-white/70 group-hover:text-white/90' : 'text-gray-600'
                }`}>Quadros Inativos</div>
                
                {/* Shimmer effect */}
                {actualTheme === 'dark' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                )}
              </motion.div>

              {/* Quadros Automatizados */}
              <motion.div
                className={`relative rounded-2xl p-6 border transition-all duration-500 group cursor-pointer ${
                  actualTheme === 'dark' 
                    ? 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-900/60 hover:border-slate-600/60 shadow-2xl shadow-black/50 hover:shadow-purple-900/30 backdrop-blur-xl' 
                    : 'bg-white border-gray-100 shadow-lg hover:shadow-xl backdrop-blur-sm'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                whileHover={{ y: -6, scale: 1.02 }}
                style={{
                  boxShadow: actualTheme === 'dark' 
                    ? '0 20px 40px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(148, 163, 184, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    : 'none'
                }}
              >
                {/* Dark Glass Background */}
                {actualTheme === 'dark' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-purple-900/10 backdrop-blur-sm rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5 group-hover:from-purple-500/10 group-hover:to-violet-500/10 transition-all duration-500 rounded-2xl" />
                    <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
                  </>
                )}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                    actualTheme === 'dark' 
                      ? 'bg-purple-500/20 border border-purple-400/30 shadow-lg shadow-purple-500/20' 
                      : 'bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200'
                  }`}>
                    <Zap className={`w-6 h-6 ${
                      actualTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <motion.div
                    className={`p-1 rounded-full backdrop-blur-sm ${
                      actualTheme === 'dark' 
                        ? 'bg-purple-500/20 border border-purple-400/30' 
                        : 'bg-purple-50'
                    }`}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Settings className={`w-4 h-4 ${
                      actualTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </motion.div>
                </div>
                <div className={`text-3xl font-bold mb-1 relative z-10 transition-all duration-300 ${
                  actualTheme === 'dark' ? 'text-white drop-shadow-lg group-hover:text-purple-300' : 'text-gray-900 group-hover:text-purple-600'
                }`}>{statistics.automatizados}</div>
                <div className={`text-sm relative z-10 transition-all duration-300 ${
                  actualTheme === 'dark' ? 'text-white/70 group-hover:text-white/90' : 'text-gray-600'
                }`}>Automatizados</div>
                
                {/* Shimmer effect */}
                {actualTheme === 'dark' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                )}
              </motion.div>

              {/* Quadros Excluídos */}
              <motion.div
                className={`relative rounded-2xl p-6 border transition-all duration-500 group cursor-pointer ${
                  actualTheme === 'dark' 
                    ? 'bg-slate-900/40 border-slate-700/50 hover:bg-slate-900/60 hover:border-slate-600/60 shadow-2xl shadow-black/50 hover:shadow-red-900/30 backdrop-blur-xl' 
                    : 'bg-white border-gray-100 shadow-lg hover:shadow-xl backdrop-blur-sm'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ y: -6, scale: 1.02 }}
                style={{
                  boxShadow: actualTheme === 'dark' 
                    ? '0 20px 40px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(148, 163, 184, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                    : 'none'
                }}
              >
                {/* Dark Glass Background */}
                {actualTheme === 'dark' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-red-900/10 backdrop-blur-sm rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-rose-500/5 group-hover:from-red-500/10 group-hover:to-rose-500/10 transition-all duration-500 rounded-2xl" />
                    <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
                  </>
                )}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className={`p-3 rounded-xl backdrop-blur-sm transition-all duration-300 ${
                    actualTheme === 'dark' 
                      ? 'bg-red-500/20 border border-red-400/30 shadow-lg shadow-red-500/20' 
                      : 'bg-gradient-to-br from-red-50 to-rose-50 border border-red-200'
                  }`}>
                    <Archive className={`w-6 h-6 ${
                      actualTheme === 'dark' ? 'text-red-400' : 'text-red-500'
                    }`} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm border transition-all duration-300 ${
                    actualTheme === 'dark'
                      ? 'text-red-300 bg-red-500/20 border-red-400/30 shadow-sm shadow-red-500/20'
                      : 'text-red-600 bg-red-50 border-red-200'
                  }`}>
                    Arquivo
                  </span>
                </div>
                <div className={`text-3xl font-bold mb-1 relative z-10 transition-all duration-300 ${
                  actualTheme === 'dark' ? 'text-white drop-shadow-lg group-hover:text-red-300' : 'text-gray-900 group-hover:text-red-600'
                }`}>{statistics.excluidos}</div>
                <div className={`text-sm relative z-10 transition-all duration-300 ${
                  actualTheme === 'dark' ? 'text-white/70 group-hover:text-white/90' : 'text-gray-600'
                }`}>Excluídos</div>
                
                {/* Shimmer effect */}
                {actualTheme === 'dark' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none rounded-2xl" />
                )}
              </motion.div>
            </div>
          </motion.div>


          {/* Grid de Quadros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className={`text-sm ${
                    actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                  }`}>Carregando quadros...</p>
                </div>
              </div>
            ) : sortedQuadros.length === 0 ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <p className={`text-sm mb-4 ${
                    actualTheme === 'dark' ? 'text-white/60' : 'text-gray-600'
                  }`}>
                    {searchQuery.trim() || activeFilter !== 'todos' 
                      ? 'Nenhum quadro encontrado com os filtros aplicados'
                      : 'Nenhum quadro encontrado'
                    }
                  </p>
                  {(!searchQuery.trim() && activeFilter === 'todos') && (
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
                  )}
                  {(searchQuery.trim() || activeFilter !== 'todos') && (
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setActiveFilter('todos')
                        }}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          actualTheme === 'dark'
                            ? 'bg-slate-600 hover:bg-slate-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        Limpar Filtros
                      </button>
                      <button
                        onClick={handleCreateQuadro}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          actualTheme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        Criar Novo Quadro
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              sortedQuadros.map((quadro, index) => {
                const conversas = Math.floor(Math.random() * 20) + 5;
                const cards = Math.floor(Math.random() * 50) + 10;
                const colunas = Math.floor(Math.random() * 8) + 3;
                
                return (
                <motion.div
                  key={quadro.id}
                  className="group perspective-1000"
                  initial={{ opacity: 0, rotateX: -15, y: 50 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.1 + (index * 0.1),
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    rotateY: 2,
                    transition: { duration: 0.3 }
                  }}
                >
                  {/* NOVO DESIGN GLASSMORPHISM */}
                  <div 
                    className="relative overflow-hidden rounded-[2rem] cursor-pointer transform-gpu preserve-3d"
                    style={{
                      background: actualTheme === 'dark' 
                        ? `linear-gradient(135deg, 
                            rgba(15, 23, 42, 0.9) 0%, 
                            rgba(30, 41, 59, 0.8) 50%, 
                            rgba(15, 23, 42, 0.9) 100%)` 
                        : `linear-gradient(135deg, 
                            rgba(255, 255, 255, 0.95) 0%, 
                            rgba(248, 250, 252, 0.9) 50%, 
                            rgba(255, 255, 255, 0.95) 100%)`,
                      backdropFilter: 'blur(20px)',
                      border: actualTheme === 'dark'
                        ? '1px solid rgba(148, 163, 184, 0.2)'
                        : '1px solid rgba(203, 213, 225, 0.3)',
                      boxShadow: actualTheme === 'dark'
                        ? `0 25px 50px -12px rgba(0, 0, 0, 0.5),
                           0 0 0 1px rgba(255, 255, 255, 0.05),
                           inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                        : `0 25px 50px -12px rgba(0, 0, 0, 0.15),
                           0 0 0 1px rgba(0, 0, 0, 0.05),
                           inset 0 1px 0 rgba(255, 255, 255, 0.9)`
                    }}
                    onClick={() => router.push(`/dashboard/admin/kanban/${quadro.id}`)}
                  >
                    
                    {/* Elementos Decorativos Animados */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <motion.div
                        className="absolute -top-20 -right-20 w-40 h-40 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${actualTheme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'} 0%, transparent 70%)`
                        }}
                        animate={{
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                      <motion.div
                        className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${actualTheme === 'dark' ? 'rgba(168, 85, 247, 0.08)' : 'rgba(168, 85, 247, 0.04)'} 0%, transparent 70%)`
                        }}
                        animate={{
                          rotate: [360, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          duration: 15,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="relative z-10 p-6">
                      {/* Header Section Redesenhado */}
                      <div className="mb-4">
                        {/* Linha 1: Ícone e Ações */}
                        <div className="flex items-center justify-between mb-4">
                          {/* Ícone Principal */}
                          <motion.div 
                            className="relative"
                            animate={{ 
                              y: [0, -2, 0],
                              rotateZ: [0, 2, 0, -2, 0]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <div 
                              className={`p-3 rounded-xl relative overflow-hidden ${
                                actualTheme === 'dark'
                                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20'
                                  : 'bg-gradient-to-br from-blue-500/10 to-purple-600/10'
                              }`}
                              style={{
                                border: actualTheme === 'dark'
                                  ? '1px solid rgba(99, 102, 241, 0.3)'
                                  : '1px solid rgba(99, 102, 241, 0.2)',
                                boxShadow: `0 4px 16px ${actualTheme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)'}`
                              }}
                            >
                              <Trello className={`w-5 h-5 relative z-10 ${
                                actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            </div>
                          </motion.div>

                          {/* Ícone de Automação */}
                          <motion.div
                            className={`p-2 rounded-xl ${
                              actualTheme === 'dark'
                                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                                : 'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200'
                            }`}
                            animate={{
                              scale: [1, 1.05, 1],
                              rotateY: [0, 180, 360]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              delay: index * 0.3
                            }}
                          >
                            <Bot className={`w-3 h-3 ${
                              actualTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                            }`} />
                          </motion.div>
                        </div>

                        {/* Linha 2: Tags/Badges */}
                        <motion.div 
                          className="flex flex-wrap items-center gap-2 mb-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + (index * 0.1) }}
                        >
                          {/* Badge de Categoria/Nicho */}
                          <span 
                            className={`px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-all duration-200 hover:scale-105 ${
                              actualTheme === 'dark' 
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30' 
                                : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('Editar tags do quadro:', quadro.id)
                            }}
                          >
                            {quadro.descricao || 'Vendas'}
                          </span>

                          {/* Badge de Fluxo */}
                          <span 
                            className={`px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-all duration-200 hover:scale-105 ${
                              actualTheme === 'dark' 
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30' 
                                : 'bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('Editar fluxo do quadro:', quadro.id)
                            }}
                          >
                            Fluxo Principal
                          </span>
                          
                          {/* Badge de ID/Identificação */}
                          <span 
                            className={`px-3 py-1.5 text-xs font-medium rounded-full cursor-pointer transition-all duration-200 hover:scale-105 ${
                              actualTheme === 'dark' 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30' 
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(quadro.id)
                              console.log('ID copiado:', quadro.id)
                            }}
                          >
                            #{quadro.id.slice(-6).toUpperCase()}
                          </span>
                        </motion.div>
                        
                        {/* Linha 3: Título */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {editingQuadroId === quadro.id ? (
                              <motion.input
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                type="text"
                                value={editingQuadroName}
                                onChange={(e) => setEditingQuadroName(e.target.value)}
                                onBlur={() => {
                                  if (editingQuadroName !== quadro.nome) {
                                    updateQuadro(quadro.id, { nome: editingQuadroName })
                                  }
                                  setEditingQuadroId(null)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    if (editingQuadroName !== quadro.nome) {
                                      updateQuadro(quadro.id, { nome: editingQuadroName })
                                    }
                                    setEditingQuadroId(null)
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingQuadroName(quadro.nome)
                                    setEditingQuadroId(null)
                                  }
                                }}
                                className={`font-bold text-lg bg-transparent border-b-2 border-dashed outline-none w-full pb-1 ${
                                  actualTheme === 'dark' 
                                    ? 'text-white border-blue-400 focus:border-blue-300' 
                                    : 'text-gray-900 border-blue-600 focus:border-blue-700'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                            ) : (
                              <motion.h3 
                                className={`font-bold text-lg leading-tight cursor-pointer ${
                                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}
                                onDoubleClick={(e) => {
                                  e.stopPropagation()
                                  setEditingQuadroId(quadro.id)
                                  setEditingQuadroName(quadro.nome)
                                }}
                                whileHover={{ x: 2 }}
                              >
                                {quadro.nome}
                              </motion.h3>
                            )}
                            
                            {/* Linha decorativa */}
                            <motion.div 
                              className={`h-0.5 rounded-full mt-1 ${
                                actualTheme === 'dark'
                                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-transparent'
                                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-transparent'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: '65%' }}
                              transition={{ 
                                duration: 1.2, 
                                delay: 0.5 + (index * 0.1),
                                ease: "easeOut"
                              }}
                            />
                          </div>

                          {/* Botões de Ação */}
                          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                            <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              const newFavorito = !quadro.favorito
                              setLocalQuadros(prev => prev.map(q => 
                                q.id === quadro.id ? { ...q, favorito: newFavorito } : q
                              ))
                            }}
                            className={`p-2 rounded-xl transition-all duration-300 ${
                              quadro.favorito
                                ? actualTheme === 'dark'
                                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-400 shadow-lg shadow-yellow-500/20'
                                  : 'bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-700 shadow-lg shadow-yellow-200/50'
                                : actualTheme === 'dark'
                                  ? 'bg-white/10 text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-400'
                                  : 'bg-gray-100/80 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600'
                            }`}
                            style={{
                              border: quadro.favorito 
                                ? actualTheme === 'dark'
                                  ? '1px solid rgba(245, 158, 11, 0.3)'
                                  : '1px solid rgba(245, 158, 11, 0.2)'
                                : actualTheme === 'dark'
                                  ? '1px solid rgba(255, 255, 255, 0.1)'
                                  : '1px solid rgba(0, 0, 0, 0.05)'
                            }}
                            whileHover={{ 
                              scale: 1.1, 
                              rotateZ: quadro.favorito ? 0 : 15
                            }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <motion.div
                              animate={quadro.favorito ? {
                                rotateZ: [0, -15, 15, -10, 10, 0],
                                scale: [1, 1.2, 1]
                              } : {}}
                              transition={{ duration: 0.6 }}
                            >
                              <Star className={`w-4 h-4 ${quadro.favorito ? 'fill-current' : ''}`} />
                            </motion.div>
                          </motion.button>
                          
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingQuadroId(quadro.id)
                              setEditingQuadroName(quadro.nome)
                            }}
                            className={`p-2 rounded-xl transition-all duration-300 ${
                              actualTheme === 'dark'
                                ? 'bg-white/10 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400'
                                : 'bg-gray-100/80 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                            style={{
                              border: actualTheme === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : '1px solid rgba(0, 0, 0, 0.05)'
                            }}
                            whileHover={{ scale: 1.1, rotateZ: -10 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteQuadro(quadro.id)
                            }}
                            className={`p-2 rounded-xl transition-all duration-300 ${
                              actualTheme === 'dark'
                                ? 'bg-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400'
                                : 'bg-gray-100/80 text-gray-500 hover:bg-red-50 hover:text-red-600'
                            }`}
                            style={{
                              border: actualTheme === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.1)'
                                : '1px solid rgba(0, 0, 0, 0.05)'
                            }}
                            whileHover={{ scale: 1.1, rotateZ: 10 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Descrição */}
                      {quadro.descricao && (
                        <motion.p 
                          className={`text-xs mb-4 leading-relaxed line-clamp-1 opacity-75 ${
                            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + (index * 0.05) }}
                        >
                          {quadro.descricao}
                        </motion.p>
                      )}
                      
                      {/* Estatísticas - Grid Horizontal */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                          { icon: MessageCircle, value: conversas, label: 'Conversas', color: 'blue' },
                          { icon: CreditCard, value: cards, label: 'Cards', color: 'green' },
                          { icon: Columns, value: colunas, label: 'Colunas', color: 'purple' }
                        ].map((stat, statIndex) => (
                          <motion.div
                            key={stat.label}
                            className={`relative p-3 rounded-2xl backdrop-blur-sm ${
                              actualTheme === 'dark'
                                ? 'bg-gradient-to-br from-white/8 to-white/4'
                                : 'bg-gradient-to-br from-white/90 to-white/70'
                            }`}
                            style={{
                              border: actualTheme === 'dark'
                                ? '1px solid rgba(255, 255, 255, 0.08)'
                                : '1px solid rgba(0, 0, 0, 0.04)'
                            }}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                              delay: 0.8 + (statIndex * 0.1) + (index * 0.02), 
                              type: "spring",
                              stiffness: 300 
                            }}
                            whileHover={{ 
                              scale: 1.02,
                              y: -2,
                              transition: { duration: 0.15 }
                            }}
                          >
                            <div className="text-center">
                              <motion.div
                                className="flex justify-center mb-2"
                                animate={{ 
                                  rotateY: [0, 360],
                                  scale: [1, 1.05, 1]
                                }}
                                transition={{
                                  duration: 4,
                                  repeat: Infinity,
                                  delay: statIndex * 0.3
                                }}
                              >
                                <stat.icon className={`w-4 h-4 ${
                                  stat.color === 'blue' ? (actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600') :
                                  stat.color === 'green' ? (actualTheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600') :
                                  (actualTheme === 'dark' ? 'text-purple-400' : 'text-purple-600')
                                }`} />
                              </motion.div>
                              
                              <motion.div 
                                className={`text-lg font-bold mb-0.5 ${
                                  actualTheme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                  delay: 1 + (statIndex * 0.05) + (index * 0.02),
                                  type: "spring"
                                }}
                              >
                                {stat.value}
                              </motion.div>
                              
                              <div className={`text-[10px] uppercase tracking-wider font-medium ${
                                actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                              }`}>
                                {stat.label}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Bottom Status Bar */}
                      <motion.div 
                        className={`flex items-center justify-between p-4 rounded-2xl backdrop-blur-sm ${
                          actualTheme === 'dark'
                            ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/5'
                            : 'bg-gradient-to-r from-emerald-50 to-green-50'
                        }`}
                        style={{
                          border: actualTheme === 'dark'
                            ? '1px solid rgba(16, 185, 129, 0.2)'
                            : '1px solid rgba(16, 185, 129, 0.15)'
                        }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.2 + (index * 0.05) }}
                      >
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs ${
                          actualTheme === 'dark'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          <motion.div 
                            className="w-2 h-2 rounded-full bg-emerald-500"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          Ativo
                        </div>
                        
                        <span className={`text-sm font-medium ${
                          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {quadro.progresso || 0}% completo
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
                );
              })
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
