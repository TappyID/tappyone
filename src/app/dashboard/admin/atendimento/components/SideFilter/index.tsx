'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MessageCircle, 
  Circle, 
  CheckCircle2, 
  Star, 
  Archive, 
  Users, 
  EyeOff,
  User,
  Settings,
  ChevronDown,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Calendar,
  FileText,
  Ticket,
  DollarSign,
  Tag
} from 'lucide-react'

// import SearchInput from './SearchInput' // Não usado mais
import FilterTags from './FilterTags'
import FilterFilas from './FilterFilas'
import FilterKanban from './FilterKanban'
import FilterTickets from './FilterTickets'
// import FilterAgendamentos from './FilterAgendamentos' // REMOVIDO
import FilterPrecos from './FilterPrecos'

interface SearchOptions {
  searchInChats: boolean
  searchInMessages: boolean
  searchInContacts: boolean
}

interface SideFilterProps {
  // Search
  searchQuery: string
  onSearchChange: (query: string) => void
  
  // Tags Filter
  selectedTag: string
  onTagChange: (tag: string) => void
  tags: Array<{ id: string; nome: string; cor?: string }>
  
  // Filas Filter  
  selectedFila: string
  onFilaChange: (fila: string) => void
  filas: Array<{ id: string; nome: string; cor?: string }>
  
  // Dados dos filtros avançados
  kanbanStatuses: Array<{ id: string; nome: string; cor?: string }>
  ticketStatuses: Array<{ id: string; nome: string; cor?: string }>
  priceRanges: Array<{ id: string; nome: string; valor_min?: number; valor_max?: number }>
  selectedKanbanStatus: string
  selectedTicketStatus: string
  selectedPriceRange: string
  
  // Estados de loading
  isLoadingTags: boolean
  isLoadingFilas: boolean
  isLoadingKanban: boolean
  isLoadingTickets: boolean
  isLoadingAtendentes: boolean
  
  // Dados para contadores
  totalChats: number
  unreadChats: number
  readChats: number
  archivedChats: number
  groupChats: number
  favoriteChats: number
  hiddenChats: number
  
  // Controle do filtro ativo
  activeFilter: string
  onFilterChange: (filter: string) => void
  
  // Opções de busca
  searchOptions: SearchOptions
  onSearchOptionsChange: (options: SearchOptions) => void
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
  selectedPriceRange = 'todos',
  onPriceRangeChange = () => {},
  priceRanges = [],
  kanbanStatuses = [],
  selectedKanbanStatus = 'todos',
  onKanbanStatusChange = () => {},
  ticketStatuses = [],
  selectedTicketStatus = 'todos',
  onTicketStatusChange = () => {},
  isLoadingTags = false,
  isLoadingFilas = false,
  isLoadingPrices = false,
  isLoadingKanban = false,
  isLoadingTickets = false,
  isLoadingAtendentes = false,
  isCollapsed = false,
  totalChats = 0,
  unreadChats = 0,
  readChats = 0,
  archivedChats = 0,
  groupChats = 0,
  favoriteChats = 0,
  hiddenChats = 0,
  activeFilter = 'all',
  onFilterChange = () => {},
  searchOptions,
  onSearchOptionsChange
}: SideFilterProps) {
  // Estados para o novo sistema de filtros
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showSortOptions, setShowSortOptions] = useState(false)
  
  // Estados para ordenação
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Estado para filtro sem fila
  const [showOnlyWithoutQueue, setShowOnlyWithoutQueue] = useState(false)
  
  // Opções de ordenação
  const sortOptions = [
    { id: 'date-desc', label: 'Mais recentes primeiro', sortBy: 'date', sortOrder: 'desc', icon: ArrowDown },
    { id: 'date-asc', label: 'Mais antigas primeiro', sortBy: 'date', sortOrder: 'asc', icon: ArrowUp },
    { id: 'name-asc', label: 'Nome A-Z', sortBy: 'name', sortOrder: 'asc', icon: ArrowUp },
    { id: 'name-desc', label: 'Nome Z-A', sortBy: 'name', sortOrder: 'desc', icon: ArrowDown },
  ]
  
  const currentSort = sortOptions.find(opt => opt.sortBy === sortBy && opt.sortOrder === sortOrder)
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const sortButtonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  
  // Calcular posição do dropdown
  const updateDropdownPosition = () => {
    if (sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right
      })
    }
  }
  
  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node) &&
          sortButtonRef.current && !sortButtonRef.current.contains(event.target as Node)) {
        setShowSortOptions(false)
      }
    }
    
    if (showSortOptions) {
      updateDropdownPosition()
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSortOptions])


  // Definir tabs de filtros igual ao antigo
  const filterTabs = [
    { id: 'all', label: 'Todas', icon: MessageCircle, count: totalChats },
    { id: 'unread', label: 'Não lidas', icon: Circle, count: unreadChats },
    { id: 'read-no-reply', label: 'Não respondidas', icon: CheckCircle2, count: readChats },
    { id: 'favorites', label: 'Favoritos', icon: Star, count: favoriteChats },
    { id: 'archived', label: 'Arquivados', icon: Archive, count: archivedChats },
    { id: 'groups', label: 'Grupos', icon: Users, count: groupChats },
    { id: 'hidden', label: 'Ocultos', icon: EyeOff, count: hiddenChats },
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
            className="w-full pl-10 pr-40 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 
                       dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-sm placeholder-gray-500 dark:placeholder-gray-400"
          />
          
          {/* Loading indicator durante busca */}
          {searchQuery.trim() && (searchOptions.searchInMessages || searchOptions.searchInContacts) && (
            <div className="absolute right-44 top-1/2 -translate-y-1/2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          )}
          
          {/* Separador visual entre busca e filtros */}
          <div className="absolute right-36 top-1/2 -translate-y-1/2 h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          
          {/* Ícones de Filtro e Ordenação */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Ícone de Filtros Avançados */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                showAdvancedFilters 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Filtros Avançados"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
            
            {/* Ícone de Ordenação com Dropdown */}
            <div className="relative">
              <button
                ref={sortButtonRef}
                onClick={() => setShowSortOptions(!showSortOptions)}
                className={`p-1.5 rounded-md transition-all duration-200 ${
                  showSortOptions 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={`Ordenar por: ${currentSort?.label}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Ícone de Filtro Sem Fila */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowOnlyWithoutQueue(!showOnlyWithoutQueue)}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                showOnlyWithoutQueue 
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={showOnlyWithoutQueue ? "Mostrando apenas chats sem fila" : "Filtrar chats sem fila"}
            >
              <motion.div
                animate={{ 
                  scale: showOnlyWithoutQueue ? [1, 1.2, 1] : 1,
                  rotate: showOnlyWithoutQueue ? [0, 5, -5, 0] : 0
                }}
                transition={{ 
                  duration: showOnlyWithoutQueue ? 0.6 : 0.2,
                  ease: "easeInOut"
                }}
              >
                <EyeOff className="w-3.5 h-3.5" />
              </motion.div>
            </motion.button>
          </div>
        </div>
        
        {/* Debug visual da busca */}
        {searchQuery.trim() && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs">
            <div className="font-medium text-blue-700 dark:text-blue-300 mb-1">🔍 Debug da Busca:</div>
            <div className="space-y-1 text-blue-600 dark:text-blue-400">
              <div>Query: "{searchQuery}"</div>
              <div>Opções: {Object.entries(searchOptions).filter(([_, active]) => active).map(([key]) => key).join(', ') || 'Nenhuma'}</div>
              <div>Status: {searchOptions.searchInChats || searchOptions.searchInMessages || searchOptions.searchInContacts ? 'Busca Avançada' : 'Busca Simples'}</div>
            </div>
          </div>
        )}

        {/* Ícones de opções de busca - FORA do input */}
        <div className="flex items-center gap-2 mt-3 px-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Buscar em:</span>
          
          {/* Ícone Chats */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSearchOptionsChange({ ...searchOptions, searchInChats: !searchOptions.searchInChats })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              searchOptions.searchInChats 
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                : 'text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
            title="Buscar em Chats"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Chats</span>
          </motion.button>
          
          {/* Ícone Mensagens */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSearchOptionsChange({ ...searchOptions, searchInMessages: !searchOptions.searchInMessages })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              searchOptions.searchInMessages 
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                : 'text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
            title="Buscar em Mensagens"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Mensagens</span>
          </motion.button>
          
          {/* Ícone Contatos */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSearchOptionsChange({ ...searchOptions, searchInContacts: !searchOptions.searchInContacts })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              searchOptions.searchInContacts 
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                : 'text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
            title="Buscar em Contatos (WAHA)"
          >
            <User className="w-3 h-3" />
            <span>Contatos</span>
          </motion.button>
        </div>
      </div>

      {/* 🔍 DEBUG VISUAL - TEMPORÁRIO */}
     

      {/* 🎯 TABS DE FILTROS PRINCIPAIS */}
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
              const isActive = activeFilter === tab.id
              
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onFilterChange(tab.id)}
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
                  selectedQuadro={selectedKanbanStatus}
                  onQuadroChange={onKanbanStatusChange}
                  quadros={kanbanStatuses}
                  isLoading={isLoadingKanban}
                />
              </div>

              {/* Filtro de Tickets */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
                  <Ticket className="w-4 h-4 text-orange-500" />
                  Tickets
                </h4>
                <FilterTickets 
                  selectedStatus={selectedTicketStatus}
                  onStatusChange={onTicketStatusChange}
                  ticketStatuses={ticketStatuses}
                  isLoading={isLoadingTickets}
                />
              </div>

              {/* Filtro de Preços de Orçamentos */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  Faixa de Preços
                </h4>
                <FilterPrecos 
                  selectedRange={selectedPriceRange}
                  onRangeChange={onPriceRangeChange}
                  priceRanges={priceRanges}
                  isLoading={isLoadingPrices}
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
      
      {/* Portal para Dropdown de Ordenação */}
      {showSortOptions && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div
            ref={sortDropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[99999]"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right
            }}
          >
            <div className="p-1">
              {sortOptions.map((option) => {
                const IconComponent = option.icon
                const isActive = sortBy === option.sortBy && sortOrder === option.sortOrder
                
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.sortBy as 'name' | 'date')
                      setSortOrder(option.sortOrder as 'asc' | 'desc')
                      setShowSortOptions(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
