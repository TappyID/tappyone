'use client'

import React, { useState, useEffect, useRef } from 'react'
import '../SideChat/ScrollbarStyles.css'
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
  Tag,
  Clock,
  UserX,
  Layers,
  Bot,
  Flame,
  Grid3X3
} from 'lucide-react'

// import SearchInput from './SearchInput' // Não usado mais
import FilterTags from './FilterTags'
import FilterFilas from './FilterFilas'
import FilterKanban from './FilterKanban'
import FilterTickets from './FilterTickets'
// import FilterAgendamentos from './FilterAgendamentos' // REMOVIDO
import FilterPrecos from './FilterPrecos'
import { useKanban } from '@/hooks/useKanban'
import { useAtendentes } from '@/hooks/useAtendentes'
import { useTickets } from '@/hooks/useTickets'
import { useTheme } from '@/contexts/ThemeContext'
import Select2 from './Select2'

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
  
  // Ordenação
  sortBy: 'name' | 'date'
  sortOrder: 'asc' | 'desc'
  onSortChange: (sortBy: 'name' | 'date', sortOrder: 'asc' | 'desc') => void
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
  onSearchOptionsChange,
  sortBy,
  sortOrder,
  onSortChange
}: SideFilterProps) {
  // Estados para o novo sistema de filtros
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showSortOptions, setShowSortOptions] = useState(false)
  
  // Estados para ordenação (agora vêm como props)
  
  // Estado para filtro sem fila
  const [showOnlyWithoutQueue, setShowOnlyWithoutQueue] = useState(false)
  
  // Estado para controlar visibilidade das opções de busca
  const [showSearchOptions, setShowSearchOptions] = useState(false)
  
  // Hooks para buscar dados reais - SEM MOCKS PORRA!
  const { quadros: kanbanQuadros } = useKanban()
  const { atendentes: atendentesReais } = useAtendentes()
  const { tickets: ticketsReais } = useTickets()
  
  // Estado para armazenar colunas do quadro selecionado
  const [kanbanColunas, setKanbanColunas] = useState<any[]>([])
  const [selectedKanbanColuna, setSelectedKanbanColuna] = useState<string[]>([])
  const [selectedAtendente, setSelectedAtendente] = useState<string[]>([])
  const [selectedFiltrosEspeciais, setSelectedFiltrosEspeciais] = useState<string[]>([])
  const [selectedTagsMulti, setSelectedTagsMulti] = useState<string[]>([])
  const [selectedFilasMulti, setSelectedFilasMulti] = useState<string[]>([])
  const [selectedQuadrosMulti, setSelectedQuadrosMulti] = useState<string[]>([])
  const [selectedTicketsMulti, setSelectedTicketsMulti] = useState<string[]>([])
  
  // Buscar colunas quando selecionar quadros (múltiplos)
  useEffect(() => {
    const fetchKanbanColunas = async () => {
      if (selectedQuadrosMulti.length > 0) {
        try {
          const token = localStorage.getItem('token')
          const allColunas: any[] = []
          
          // Buscar colunas de todos os quadros selecionados
          for (const quadroId of selectedQuadrosMulti) {
            const response = await fetch(`/api/kanban/quadros/${quadroId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (response.ok) {
              const data = await response.json()
              if (data.colunas) {
                // Adicionar colunas com referência ao quadro
                data.colunas.forEach((col: any) => {
                  allColunas.push({
                    ...col,
                    quadroNome: data.nome || 'Quadro'
                  })
                })
              }
            }
          }
          
          setKanbanColunas(allColunas)
        } catch (error) {
          console.error('Erro ao buscar colunas:', error)
        }
      } else {
        setKanbanColunas([])
      }
    }
    
    fetchKanbanColunas()
  }, [selectedQuadrosMulti])
  
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
            
            {/* Ícone de Filtro Sem Fila - AGORA CONTROLA OPÇÕES DE BUSCA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearchOptions(!showSearchOptions)}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                showSearchOptions 
                  ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={showSearchOptions ? "Ocultar opções de busca" : "Mostrar opções de busca"}
            >
              <motion.div
                animate={{ 
                  scale: showSearchOptions ? [1, 1.2, 1] : 1,
                  rotate: showSearchOptions ? [0, 5, -5, 0] : 0
                }}
                transition={{ 
                  duration: showSearchOptions ? 0.6 : 0.2,
                  ease: "easeInOut"
                }}
              >
                <EyeOff className="w-3.5 h-3.5" />
              </motion.div>
            </motion.button>
          </div>
        </div>
        

        {/* Ícones de opções de busca - FORA do input - CONDICIONAL */}
        {showSearchOptions && (
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
        )}

        {/* Linha Divisória Superior */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-4 mb-3"></div>

        {/* 📊 Filtros de Status - Apenas Ícones com Tooltips */}
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3">
          <div className="flex justify-center gap-3">
            {/* Todos Atendimentos */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center justify-center w-10 h-10 rounded-full text-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200"
            >
              <div className="relative">
                <Grid3X3 className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  43
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Todos Atendimentos
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>
            
            {/* Leads Quentes */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center justify-center w-10 h-10 rounded-full text-gray-500 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200"
            >
              <div className="relative">
                <Flame className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  9
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Leads Quentes
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>
            
            {/* Atendimento */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center justify-center w-10 h-10 rounded-full text-gray-500 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200"
            >
              <div className="relative">
                <MessageCircle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  12
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Em Atendimento
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>
            
            {/* Aguardando */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center justify-center w-10 h-10 rounded-full text-gray-500 bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200"
            >
              <div className="relative">
                <Clock className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  5
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Aguardando
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>
            
            {/* Agente IA */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center justify-center w-10 h-10 rounded-full text-gray-500 bg-white dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200"
            >
              <div className="relative">
                <Bot className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  7
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Agente IA
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>
            
            {/* Grupos */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center justify-center w-10 h-10 rounded-full text-gray-500 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200"
            >
              <div className="relative">
                <Users className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  8
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Grupos
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>
            
            {/* Finalizados */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center justify-center w-10 h-10 rounded-full text-gray-500 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200"
            >
              <div className="relative">
                <CheckCircle2 className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  15
                </span>
              </div>
              
              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Finalizados
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Linha Divisória Inferior */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 mb-0"></div>
      </div>

      {/* 🔍 DEBUG VISUAL - TEMPORÁRIO */}
     

      {/* 🎯 TABS DE FILTROS PRINCIPAIS */}
      <div className="px-4 pb-2">
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
            className="fixed inset-y-0 left-0 z-50 w-[500px] bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700"
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
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-73px)] custom-scrollbar">
              {/* Filtro de Tags - React Select MULTI */}
              <Select2
                label="Tags (Múltipla Seleção)"
                value={selectedTagsMulti}
                onChange={(val) => setSelectedTagsMulti(val as string[])}
                options={tags}
                placeholder="Selecione múltiplas tags"
                icon={Tag}
                iconColor="blue"
                isMulti={true}
                isClearable
                isSearchable
              />

              {/* Filtro de Filas - React Select MULTI */}
              <Select2
                label="Filas de Atendimento (Múltipla Seleção)"
                value={selectedFilasMulti}
                onChange={(val) => setSelectedFilasMulti(val as string[])}
                options={filas}
                placeholder="Selecione múltiplas filas"
                icon={Users}
                iconColor="purple"
                isMulti={true}
                isClearable
                isSearchable
              />

              {/* Filtro de Atendentes - React Select MULTI com DADOS REAIS */}
              <Select2
                label="Atendentes (Múltipla Seleção)"
                value={selectedAtendente}
                onChange={(val) => setSelectedAtendente(val as string[])}
                options={atendentesReais.map(at => ({ 
                  id: at.id, 
                  nome: at.nome || 'Sem nome' 
                }))}
                placeholder="Selecione múltiplos atendentes"
                icon={User}
                iconColor="indigo"
                isMulti={true}
                isClearable
                isSearchable
              />

              {/* Filtro de Kanban - React Select MULTI com DADOS REAIS */}
              <Select2
                label="Quadros Kanban (Múltipla Seleção)"
                value={selectedQuadrosMulti}
                onChange={(val) => {
                  setSelectedQuadrosMulti(val as string[])
                  setSelectedKanbanColuna([]) // Reset colunas quando mudar quadro
                }}
                options={kanbanQuadros}
                placeholder="Selecione múltiplos quadros"
                icon={Settings}
                iconColor="green"
                isMulti={true}
                isClearable
                isSearchable
              />

              {/* Filtro de Colunas do Kanban - React Select MULTI com DADOS REAIS */}
              <Select2
                label="Colunas do Kanban (Múltipla Seleção)"
                value={selectedKanbanColuna}
                onChange={(val) => setSelectedKanbanColuna(val as string[])}
                options={kanbanColunas.map(col => ({ 
                  id: col.id, 
                  nome: col.nome,
                  icon: col.icone || '',
                  cor: col.cor
                }))}
                placeholder="Selecione múltiplas colunas"
                icon={Layers}
                iconColor="teal"
                isMulti={true}
                isClearable
                isSearchable
                isLoading={kanbanColunas.length === 0 && selectedQuadrosMulti.length > 0}
              />

              {/* Filtro de PRIORIDADE de Tickets - React Select MULTI */}
              <Select2
                label="Prioridade de Tickets (Múltipla Seleção)"
                value={selectedTicketsMulti}
                onChange={(val) => setSelectedTicketsMulti(val as string[])}
                options={[
                  { id: 'urgente', nome: 'Urgente', icon: '🔴' },
                  { id: 'alta', nome: 'Alta', icon: '🟠' },
                  { id: 'media', nome: 'Média', icon: '🟡' },
                  { id: 'baixa', nome: 'Baixa', icon: '🟢' },
                  { id: 'sem_prioridade', nome: 'Sem Prioridade', icon: '⚪' }
                ]}
                placeholder="Selecione prioridades"
                icon={Ticket}
                iconColor="orange"
                isMulti={true}
                isClearable
                isSearchable={false}
              />


              {/* Filtro de Faixa de Preços - React Select COM DADOS REAIS */}
              <Select2
                label="Faixas de Preço"
                value={selectedPriceRange}
                onChange={(val) => onPriceRangeChange(val as string)}
                options={priceRanges}
                placeholder="Todas as Faixas"
                icon={DollarSign}
                iconColor="green"
                isClearable
                isSearchable
              />
              
            

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
                      onSortChange(option.sortBy as 'name' | 'date', option.sortOrder as 'asc' | 'desc')
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
