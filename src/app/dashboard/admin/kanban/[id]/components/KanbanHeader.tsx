'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { 
  ChevronDown, 
  ChevronUp,
  Grid,
  List,
  LayoutGrid,
  RefreshCw,
  Search,
  Filter,
  Settings,
  Download,
  Upload,
  Users,
  MessageCircle,
  User,
  X,
  Tag,
  Calendar,
  Ticket,
  ArrowLeft,
  RotateCcw,
  Keyboard,
  MoreVertical,
  Trello,
  CreditCard,
  Package,
  BarChart,
  AlertTriangle,
  Columns,
  TrendingUp,
  Activity,
  Palette
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import KanbanColorModal from './KanbanColorModal'

interface KanbanHeaderProps {
  theme: string
  quadro: {
    nome: string
    descricao?: string
  }
  chats: any[]
  colunas: any[]
  searchQuery: string
  onSearchChange: (query: string) => void
  loading: boolean
  showMetrics: boolean
  onToggleMetrics: () => void
  hasManualChanges: boolean
  showShortcuts: boolean
  editingQuadroTitle: boolean
  editingQuadroDescription: boolean
  editingQuadroName: string
  editingQuadroDescricao: string
  mapearConversasParaColunas: () => any[]
  refreshData: () => void
  resetAndRemap: () => void
  syncAllCardsManually: () => void
  setShowShortcuts: (show: boolean) => void
  handleDoubleClickQuadroTitle: () => void
  handleDoubleClickQuadroDescription: () => void
  handleSaveQuadroTitle: () => void
  handleSaveQuadroDescription: () => void
  setEditingQuadroName: (name: string) => void
  setEditingQuadroDescricao: (desc: string) => void
  activeView?: 'kanban' | 'funnel' | 'ncs'
  onViewChange?: (view: 'kanban' | 'funnel' | 'ncs') => void
  showFiltersSection?: boolean
  setShowFiltersSection?: (show: boolean) => void
}

export default function KanbanHeader({
  theme,
  quadro,
  chats,
  colunas,
  searchQuery,
  onSearchChange,
  loading,
  showMetrics,
  onToggleMetrics,
  hasManualChanges,
  showShortcuts,
  editingQuadroTitle,
  editingQuadroDescription,
  editingQuadroName,
  editingQuadroDescricao,
  mapearConversasParaColunas,
  refreshData,
  resetAndRemap,
  syncAllCardsManually,
  setShowShortcuts,
  handleDoubleClickQuadroTitle,
  handleDoubleClickQuadroDescription,
  handleSaveQuadroTitle,
  handleSaveQuadroDescription,
  setEditingQuadroName,
  setEditingQuadroDescricao,
  activeView = 'kanban',
  onViewChange,
  showFiltersSection: showFiltersSectionProp,
  setShowFiltersSection: setShowFiltersSectionProp
}: KanbanHeaderProps) {
  const router = useRouter()
  
  // Estados para filtros
  const [searchOptions, setSearchOptions] = useState({
    searchInChats: true,
    searchInMessages: false,
    searchInContacts: false
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  
  // Usar props se fornecidas, senão usar estado local
  const showFiltersSection = showFiltersSectionProp !== undefined ? showFiltersSectionProp : false
  const setShowFiltersSection = setShowFiltersSectionProp || (() => {})
  // 🔄 Estado para modal de confirmação de remapeamento
  const [showRemapModal, setShowRemapModal] = useState(false)
  // 🎨 Estado para modal de customização de cores
  const [showColorModal, setShowColorModal] = useState(false)
  
  // Função para toggle de opções de busca
  const toggleSearchOption = (option: keyof typeof searchOptions) => {
    setSearchOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }))
  }

  // 🔄 Função para confirmar remapeamento
  const handleConfirmRemap = () => {
    setShowRemapModal(false)
    resetAndRemap()
  }

  return (
    <div className={`border-b backdrop-blur-sm ${
      theme === 'dark' 
        ? 'bg-slate-900/50 border-slate-700/50' 
        : 'bg-white/50 border-gray-200/50'
    }`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Botão Voltar */}
            <motion.button
              onClick={() => router.push('/dashboard/admin/kanban')}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-white/60 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-[19px] h-[19px]" />
            </motion.button>
            
            <div className="flex items-center justify-between">
              {/* Lado Esquerdo - Ícone e Título */}
              <div className="flex items-center gap-2">
                <motion.div
                  className={`p-2.5 rounded-xl ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-slate-700/50 to-slate-800/50'
                      : 'bg-gradient-to-br from-blue-50 to-blue-100/50'
                  }`}
                  style={{ 
                    boxShadow: theme === 'dark' 
                      ? `0 0 20px #305e7315`  
                      : `0 4px 20px #305e7320` 
                  }}
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  <Trello className="w-[19px] h-[19px]" style={{ color: '#305e73' }} />
                </motion.div>
                
                <div>
                  {editingQuadroTitle ? (
                    <input
                      type="text"
                      value={editingQuadroName}
                      onChange={(e) => setEditingQuadroName(e.target.value)}
                      onBlur={() => handleSaveQuadroTitle()}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveQuadroTitle()
                        }
                      }}
                      className={`text-base font-bold bg-transparent border-b-2 border-blue-500 outline-none ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                      autoFocus
                    />
                  ) : (
                    <h1 
                      className={`text-base font-bold cursor-pointer hover:text-blue-600 transition-colors ${
                        theme === 'dark' ? 'text-white hover:text-blue-400' : 'text-gray-900'
                      }`}
                      onDoubleClick={() => handleDoubleClickQuadroTitle()}
                    >
                      {quadro.nome}
                    </h1>
                  )}
                </div>
              </div>

              {/* Centro - Estatísticas Sofisticadas */}
              <div className="flex items-center gap-3 mx-16">
                {/* Conversas */}
                <motion.div 
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-white/60 border-white/20 hover:bg-white/80'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <span className={`text-xs font-medium ${
                    theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Conversas
                  </span>
                  <div className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    theme === 'dark'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {chats.length}
                  </div>
                </motion.div>

                {/* Cards */}
                <motion.div 
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-white/60 border-white/20 hover:bg-white/80'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CreditCard className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <span className={`text-xs font-medium ${
                    theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Cards
                  </span>
                  <div className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    theme === 'dark'
                      ? 'bg-green-500 text-white'
                      : 'bg-green-600 text-white'
                  }`}>
                    {mapearConversasParaColunas().reduce((total, col) => total + col.cards.length, 0)}
                  </div>
                </motion.div>

                {/* Colunas */}
                <motion.div 
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-sm border transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-white/60 border-white/20 hover:bg-white/80'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Columns className={`w-4 h-4 ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                  <span className={`text-xs font-medium ${
                    theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                  }`}>
                    Colunas
                  </span>
                  <div className={`absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    theme === 'dark'
                      ? 'bg-purple-500 text-white'
                      : 'bg-purple-600 text-white'
                  }`}>
                    {colunas.length}
                  </div>
                </motion.div>

          
              </div>
            </div>
          </div>

          {/* Centro - Filtros com Bordinha */}
          <div className="flex items-center gap-3">
            {/* Botão de Filtros */}
            <motion.button
              onClick={() => setShowFiltersSection(!showFiltersSection)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showFiltersSection
                  ? theme === 'dark'
                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30'
                    : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300'
                  : theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 text-white/80'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Mostrar/Ocultar Filtros"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filtros</span>
              <motion.div
                animate={{ rotate: showFiltersSection ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>

            {/* Botão Métricas */}
            <motion.button
              onClick={onToggleMetrics}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showMetrics
                  ? theme === 'dark'
                    ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30'
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300'
                  : theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 text-white/80'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title={showMetrics ? "Ocultar métricas" : "Mostrar métricas"}
            >
              <BarChart className="w-4 h-4" />
              <span className="text-sm">Métricas</span>
              <motion.div
                animate={{ rotate: showMetrics ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showMetrics ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </motion.div>
            </motion.button>

            <motion.button
              onClick={refreshData}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 text-white/80'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              <motion.div
                animate={loading ? { rotate: 360 } : {}}
                transition={{ 
                  duration: 1, 
                  repeat: loading ? Infinity : 0,
                  ease: 'linear'
                }}
              >
                <Settings className={`w-4 h-4 ${
                  loading ? 'text-blue-500' : ''
                }`} />
              </motion.div>
              <span className="text-sm">
                {loading ? 'Carregando...' : `Atualizar (${chats.length})`}
              </span>
              <span className={`text-xs opacity-60 ${
                theme === 'dark' ? 'text-white/40' : 'text-gray-400'
              }`}>
                Ctrl+R
              </span>
            </motion.button>

            {/* 🔥 BOTÃO DE SINCRONIZAÇÃO MANUAL - Processar leads antigos sem quadro/coluna */}
            <motion.button
              onClick={syncAllCardsManually}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Atribuir leads antigos à primeira coluna do Kanban"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">💾 Processar Leads Antigos</span>
            </motion.button>
            
            {/* Botão de Reset (só aparece se houve mudanças manuais) */}
            {hasManualChanges && (
              <motion.button
                onClick={() => setShowRemapModal(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300 border border-yellow-500/30'
                    : 'hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700 border border-yellow-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Resetar mudanças manuais e remapear conversas"
              >
                <RotateCcw className="w-[15px] h-[15px]" />
                <span className="text-sm">
                  Remapear
                </span>
              </motion.button>
            )}

            {/* Botão de Customização de Cores */}
            <motion.button
              onClick={() => {
                console.log('🎨 CLICOU NO BOTÃO DE CORES!')
                setShowColorModal(true)
                console.log('🎨 showColorModal setado para TRUE')
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 text-pink-400 border border-pink-500/30'
                  : 'bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 text-pink-600 border border-pink-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Personalizar cores do Kanban"
            >
              <Palette className="w-4 h-4" />
              <span className="text-sm">
                Cores
              </span>
            </motion.button>

            {/* Botão Funil */}
            <motion.button
              onClick={() => onViewChange?.(activeView === 'funnel' ? 'kanban' : 'funnel')}
              className={`p-2 rounded-lg transition-colors ${
                activeView === 'funnel'
                  ? theme === 'dark'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-purple-100 text-purple-700 border border-purple-300'
                  : theme === 'dark'
                    ? 'hover:bg-white/10 text-white/60 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={activeView === 'funnel' ? 'Voltar ao Kanban' : 'Ver Funil de Conversão'}
            >
              <TrendingUp className="w-[15px] h-[15px]" />
            </motion.button>

            {/* Botão NCS */}
            <motion.button
              onClick={() => onViewChange?.(activeView === 'ncs' ? 'kanban' : 'ncs')}
              className={`p-2 rounded-lg transition-colors ${
                activeView === 'ncs'
                  ? theme === 'dark'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-green-100 text-green-700 border border-green-300'
                  : theme === 'dark'
                    ? 'hover:bg-white/10 text-white/60 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={activeView === 'ncs' ? 'Voltar ao Kanban' : 'Ver NCS Score'}
            >
              <Activity className="w-[15px] h-[15px]" />
            </motion.button>
            
            {/* Botão de Atalhos */}
            <motion.button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className={`relative p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-white/60 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Keyboard className="w-[15px] h-[15px]" />
              
              {/* Tooltip com atalhos */}
              {showShortcuts && (
                <motion.div
                  className={`absolute top-full right-0 mt-2 p-3 rounded-lg shadow-lg border z-50 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="text-sm font-medium mb-2">Atalhos:</div>
                  <div className="space-y-1 text-xs whitespace-nowrap">
                    <div>Ctrl+N - Nova coluna</div>
                    <div>Ctrl+R - Atualizar conversas</div>
                    <div>Esc - Fechar modais</div>
                    <div>Arrastar - Mover cards</div>
                  </div>
                </motion.div>
              )}
            </motion.button>

            <motion.button
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-white/10 text-white/60 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MoreVertical className="w-[19px] h-[19px]" />
            </motion.button>
          </div>
        </div>
      </div>
      
     
     

      {/* 🔄 Modal de Confirmação de Remapeamento - RENDERIZADO NO BODY */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {showRemapModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[99999] flex items-center justify-center p-4"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
              onClick={() => setShowRemapModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                className={`relative max-w-md w-full rounded-2xl p-6 shadow-2xl backdrop-blur-sm ${
                  theme === 'dark' ? 'bg-slate-800/95 border border-slate-700' : 'bg-white/95 border border-gray-200'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Confirmar Remapeamento
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Esta ação irá resetar todas as mudanças
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRemapModal(false)}
                    className={`ml-auto p-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Conteúdo */}
                <div className="mb-6">
                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    O remapeamento irá:
                  </p>
                  
                  <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      Resetar todas as mudanças manuais nas colunas
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      Remapear conversas automaticamente
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                      Recarregar dados do WhatsApp
                    </li>
                  </ul>

                  <div className={`mt-4 p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-700/30' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'
                    }`}>
                      ⚠️ Esta ação não pode ser desfeita
                    </p>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRemapModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmRemap}
                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
                  >
                    Confirmar Remapeamento
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Modal de Customização de Cores */}
      <KanbanColorModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
      />
    </div>
  )
}
