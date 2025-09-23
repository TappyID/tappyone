'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Filter, 
  Search, 
  MessageCircle, 
  Circle, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Archive, 
  Users,
  User,
  X,
  Settings,
  ChevronDown,
  Star,
  Eye,
  Calendar,
  FileText,
  Ticket
} from 'lucide-react'

// import SearchInput from './SearchInput' // Não usado mais
import FilterTags from './FilterTags'
import FilterFilas from './FilterFilas'
import FilterKanban from './FilterKanban'
import FilterTickets from './FilterTickets'
import FilterAgendamentos from './FilterAgendamentos'

interface SideFilterProps {
  // Search
  searchQuery: string
  onSearchChange: (query: string) => void
  
  // Tags Filter
  selectedTag: string
  onTagChange: (tagId: string) => void
  tags: any[]
  
  // Filas Filter  
  selectedFila: string
  onFilaChange: (filaId: string) => void
  filas: any[]
  
  // Loading states
  isLoadingTags?: boolean
  isLoadingFilas?: boolean
  
  // Layout
  isCollapsed?: boolean
  
  // Chat counts for tabs
  totalChats?: number
  unreadChats?: number
  readChats?: number
  archivedChats?: number
  groupChats?: number
}

export default function SideFilter({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  tags,
  selectedFila,
  onFilaChange,
  filas,
  isLoadingTags = false,
  isLoadingFilas = false,
  isCollapsed = false,
  totalChats = 0,
  unreadChats = 0,
  readChats = 0,
  archivedChats = 0,
  groupChats = 0
}: SideFilterProps) {
  // Estados para o novo sistema de filtros
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchOptions, setSearchOptions] = useState({
    searchInChats: true,
    searchInMessages: false,
    searchInContacts: false
  })

  // Definir tabs de filtros igual ao antigo
  const filterTabs = [
    { id: 'all', label: 'Todas', icon: MessageCircle, count: totalChats },
    { id: 'unread', label: 'Não lidas', icon: Circle, count: unreadChats },
    { id: 'read', label: 'Lidas', icon: CheckCircle2, count: readChats },
    { id: 'read-no-reply', label: 'Lidas não respondidas', icon: Clock, count: 0 },
    { id: 'em-aberto', label: 'Em aberto', icon: Tag, count: 0 },
    { id: 'archived', label: 'Arquivados', icon: Archive, count: archivedChats },
    { id: 'groups', label: 'Grupos', icon: Users, count: groupChats },
  ]

  // Modo colapsado - só mostra ícone
  if (isCollapsed) {
    return (
      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="w-full p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 
                     dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Filtros"
        >
          <Filter className="w-4 h-4 mx-auto text-gray-600 dark:text-gray-400" />
        </motion.button>
      </div>
    )
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      {/* 🔍 INPUT DE BUSCA COM ÍCONES DENTRO */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar conversas..."
            className="w-full pl-10 pr-32 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 
                       dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-sm placeholder-gray-500 dark:placeholder-gray-400"
          />
          
          {/* Ícones de opções de busca DENTRO do input */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            {/* Ícone Chats */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOptions(prev => ({ ...prev, searchInChats: !prev.searchInChats }))}
              className={`p-1 rounded transition-colors ${
                searchOptions.searchInChats 
                  ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Buscar em Chats (nomes)"
            >
              <Users className="w-3.5 h-3.5" />
            </motion.button>
            
            {/* Ícone Mensagens */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOptions(prev => ({ ...prev, searchInMessages: !prev.searchInMessages }))}
              className={`p-1 rounded transition-colors ${
                searchOptions.searchInMessages 
                  ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Buscar em Mensagens"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </motion.button>
            
            {/* Ícone Contatos */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOptions(prev => ({ ...prev, searchInContacts: !prev.searchInContacts }))}
              className={`p-1 rounded transition-colors ${
                searchOptions.searchInContacts 
                  ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Buscar em Contatos (WAHA)"
            >
              <User className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          
          {/* Ícone de filtros avançados ALINHADO */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              showAdvancedFilters 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Filtros Avançados"
          >
            <Filter className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* 📊 TABS DE FILTROS COM SCROLL HORIZONTAL */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <div 
            className="flex gap-1 overflow-x-auto pb-1 cursor-grab active:cursor-grabbing"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
            onMouseDown={(e) => {
              const container = e.currentTarget as HTMLDivElement;
              const startX = e.pageX - container.offsetLeft;
              const scrollLeft = container.scrollLeft;
              const handleMouseMove = (e: MouseEvent) => {
                const x = e.pageX - container.offsetLeft;
                const walk = (x - startX) * 2;
                container.scrollLeft = scrollLeft - walk;
              };
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
              e.preventDefault();
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {filterTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-w-fit ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      isActive
                        ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ⚙️ SIDEBAR DE FILTROS AVANÇADOS */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700"
          >
            {/* Header da sidebar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtros Avançados
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAdvancedFilters(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Conteúdo da sidebar com scroll */}
            <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-73px)]">
              {/* Filtro de Tags */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
                  <Tag className="w-4 h-4 text-blue-500" />
                  Tags
                </h4>
                <FilterTags
                  selectedTag={selectedTag}
                  onTagChange={onTagChange}
                  tags={tags}
                  isLoading={isLoadingTags}
                />
              </div>

              {/* Filtro de Filas */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
                  <Users className="w-4 h-4 text-purple-500" />
                  Filas de Atendimento
                </h4>
                <FilterFilas
                  selectedFila={selectedFila}
                  onFilaChange={onFilaChange}
                  filas={filas}
                  isLoading={isLoadingFilas}
                />
              </div>

              {/* Filtro de Kanban */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
                  <Settings className="w-4 h-4 text-green-500" />
                  Status Kanban
                </h4>
                <FilterKanban 
                  selectedQuadro="todos"
                  onQuadroChange={() => {}}
                  quadros={[
                    { id: '1', nome: 'Vendas', cor: '#10B981' },
                    { id: '2', nome: 'Suporte', cor: '#3B82F6' },
                    { id: '3', nome: 'Marketing', cor: '#F59E0B' }
                  ]}
                />
              </div>

              {/* Filtro de Tickets */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
                  <Ticket className="w-4 h-4 text-orange-500" />
                  Tickets
                </h4>
                <FilterTickets 
                  selectedStatus="todos"
                  onStatusChange={() => {}}
                  ticketStatuses={[
                    { id: '1', nome: 'Aberto', cor: '#F59E0B', count: 12 },
                    { id: '2', nome: 'Em Andamento', cor: '#3B82F6', count: 5 },
                    { id: '3', nome: 'Resolvido', cor: '#10B981', count: 23 }
                  ]}
                />
              </div>

              {/* Filtro de Agendamentos */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
                  <Calendar className="w-4 h-4 text-red-500" />
                  Agendamentos
                </h4>
                <FilterAgendamentos 
                  selectedPeriodo="todos"
                  onPeriodoChange={() => {}}
                  agendamentoPeriodos={[
                    { id: '1', nome: 'Hoje', count: 8 },
                    { id: '2', nome: 'Esta Semana', count: 25 },
                    { id: '3', nome: 'Este Mês', count: 67 }
                  ]}
                />
              </div>

              {/* Filtros Especiais */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Filtros Especiais
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Favoritos</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">12</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-purple-500 rounded border-gray-300 focus:ring-purple-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Eye className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Ocultos</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">3</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-green-500 rounded border-gray-300 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Com Orçamentos</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">28</span>
                  </label>

                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Com Agendamentos</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">15</span>
                  </label>

                  <label className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Archive className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Arquivados</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">45</span>
                  </label>
                </div>
              </div>

              {/* Botão de Limpar Filtros */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 
                             text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                  Limpar Todos os Filtros
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para fechar sidebar */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdvancedFilters(false)}
            className="fixed inset-0 bg-black/20 z-40"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
