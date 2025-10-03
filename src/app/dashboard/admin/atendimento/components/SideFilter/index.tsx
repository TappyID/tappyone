"use client";

import React, { useState, useEffect, useRef } from "react";
import "../SideChat/ScrollbarStyles.css";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Grid3X3,
  Phone,
} from "lucide-react";

// import SearchInput from './SearchInput' // Não usado mais
import FilterTags from "./FilterTags";
import FilterFilas from "./FilterFilas";
import FilterKanban from "./FilterKanban";
import FilterTickets from "./FilterTickets";
// import FilterAgendamentos from './FilterAgendamentos' // REMOVIDO
import FilterPrecos from "./FilterPrecos";
import { useKanban } from "@/hooks/useKanban";
import { useAtendentes } from "@/hooks/useAtendentes";
import { useTickets } from "@/hooks/useTickets";
import { useTheme } from "@/contexts/ThemeContext";
import Select2 from "./Select2";

interface SearchOptions {
  searchInChats: boolean;
  searchInMessages: boolean;
  searchInContacts: boolean;
}

interface SideFilterProps {
  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Tags Filter
  selectedTag: string;
  onTagChange: (tag: string) => void;
  tags: Array<{ id: string; nome: string; cor?: string }>;

  // ✅ Tags Filter (múltipla seleção)
  selectedTagsMulti?: string[];
  onTagsMultiChange?: (tags: string[]) => void;
  
  // ✅ Ocultar filtro de quadros (quando já está em um quadro específico)
  hideQuadrosFilter?: boolean;
  
  // ✅ Colunas pré-carregadas (quando já está em um quadro)
  preloadedColunas?: any[];

  // Filas Filter
  selectedFila: string;
  onFilaChange: (fila: string) => void;
  filas: Array<{ id: string; nome: string; cor?: string }>;
  selectedFilasMulti?: string[];
  onFilasMultiChange?: (filas: string[]) => void;

  // ✅ Conexões Filter (múltipla seleção)
  selectedConexoes?: string[];
  onConexoesChange?: (conexoes: string[]) => void;

  // Atendentes Filter (múltipla seleção)
  selectedAtendentes?: string[];
  onAtendentesChange?: (atendentes: string[]) => void;

  // Kanban quadros e colunas (múltipla seleção)
  selectedQuadrosMulti?: string[];
  onQuadrosMultiChange?: (quadros: string[]) => void;
  selectedKanbanColunas?: string[];
  onKanbanColunasChange?: (colunas: string[]) => void;

  // Prioridades de ticket (múltipla seleção)
  selectedTicketsMulti?: string[];
  onTicketsMultiChange?: (prioridades: string[]) => void;

  // Dados dos filtros avançados
  kanbanStatuses: Array<{ id: string; nome: string; cor?: string }>;
  ticketStatuses: Array<{ id: string; nome: string; cor?: string }>;
  priceRanges: Array<{
    id: string;
    nome: string;
    valor_min?: number;
    valor_max?: number;
  }>;
  selectedKanbanStatus: string;
  selectedTicketStatus: string;
  selectedPriceRange: string;

  // Status Filter
  selectedStatusFilter: string;
  onStatusFilterChange: (status: string) => void;

  // Estados de loading
  isLoadingTags: boolean;
  isLoadingFilas: boolean;
  isLoadingKanban: boolean;
  isLoadingTickets: boolean;
  isLoadingAtendentes: boolean;

  // Dados para contadores
  totalChats: number;
  unreadChats: number;
  readChats: number;
  archivedChats: number;
  groupChats: number;
  favoriteChats: number;
  hiddenChats: number;
  emAtendimentoChats: number;
  aguardandoChats: number;
  finalizadoChats: number;
  agentesIAChats: number;
  leadsQuentesChats: number;

  // Controle do filtro ativo
  activeFilter: string;
  onFilterChange: (filter: string) => void;

  // Opções de busca
  searchOptions: SearchOptions;
  onSearchOptionsChange: (options: SearchOptions) => void;

  // Ordenação
  sortBy: "name" | "date";
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: "name" | "date", sortOrder: "asc" | "desc") => void;

  // Debug info
  debugInfo?: {
    totalChatsTransformados: number;
    chatLeadsCarregados: number;
    primeirosChatLeads: any[];
  };

  conversations?: any[];
}

export default function SideFilter({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  tags,
  selectedTagsMulti = [],
  onTagsMultiChange = () => {},
  hideQuadrosFilter = false,
  preloadedColunas = [],
  selectedFila,
  onFilaChange,
  filas,
  selectedFilasMulti = [],
  onFilasMultiChange = () => {},
  selectedConexoes = [],
  onConexoesChange = () => {},
  selectedAtendentes = [],
  onAtendentesChange = () => {},
  selectedQuadrosMulti = [],
  onQuadrosMultiChange = () => {},
  selectedKanbanColunas = [],
  onKanbanColunasChange = () => {},
  selectedTicketsMulti = [],
  onTicketsMultiChange = () => {},
  selectedPriceRange = "todos",
  onPriceRangeChange = () => {},
  priceRanges = [],
  kanbanStatuses = [],
  selectedKanbanStatus = "todos",
  onKanbanStatusChange = () => {},
  ticketStatuses = [],
  selectedTicketStatus = "todos",
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
  emAtendimentoChats = 0,
  aguardandoChats = 0,
  finalizadoChats = 0,
  agentesIAChats = 0,
  leadsQuentesChats = 0,
  activeFilter = "all",
  onFilterChange = () => {},
  // Debug props
  debugInfo,
  searchOptions,
  onSearchOptionsChange,
  sortBy,
  sortOrder,
  onSortChange,
}: SideFilterProps) {
  // Debug: log das tags recebidas
  // Estados para o novo sistema de filtros
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Estados para ordenação (agora vêm como props)

  // Estado para filtro sem fila
  const [showOnlyWithoutQueue, setShowOnlyWithoutQueue] = useState(false);

  // Estado para controlar visibilidade das opções de busca
  const [showSearchOptions, setShowSearchOptions] = useState(false);

  // Hooks para buscar dados reais - SEM MOCKS PORRA!
  const { quadros: kanbanQuadros } = useKanban();
  const { atendentes: atendentesReais } = useAtendentes();
  const { tickets: ticketsReais } = useTickets();

  // Estado para conexões
  const [conexoes, setConexoes] = useState<any[]>([]);
  const [isLoadingConexoes, setIsLoadingConexoes] = useState(false);

  // Buscar conexões reais - MESMA API DO SIDECHAT
  useEffect(() => {
    const fetchConexoes = async () => {
      setIsLoadingConexoes(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/connections", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const conexoesData = data.connections || data.data || [];
          const conexoesFormatted = conexoesData.map((conn: any) => ({
            value: conn.id,
            label:
              conn.nome ||
              conn.modulation?.connectionName ||
              `Conexão ${conn.numero}`,
            numero: conn.numero,
            status: conn.status,
          }));
          setConexoes(conexoesFormatted);
        }
      } catch {
      } finally {
        setIsLoadingConexoes(false);
      }
    };

    fetchConexoes();
  }, []);

  // Estado para armazenar colunas do quadro selecionado
  const [kanbanColunas, setKanbanColunas] = useState<any[]>([]);

  // Buscar colunas quando selecionar quadros (múltiplos) OU usar preloadedColunas
  useEffect(() => {
    // Se tiver colunas pré-carregadas (ex: já está no quadro), usar elas
    if (preloadedColunas && preloadedColunas.length > 0) {
      console.log('[KANBAN COLUNAS] Usando colunas pré-carregadas:', preloadedColunas.length)
      setKanbanColunas(preloadedColunas)
      return
    }
    
    const fetchKanbanColunas = async () => {
      if (selectedQuadrosMulti.length > 0) {
        try {
          const token = localStorage.getItem("token");
          const allColunas: any[] = [];

          console.log('[KANBAN COLUNAS] Buscando colunas para quadros:', selectedQuadrosMulti);

          // Buscar colunas de todos os quadros selecionados
          for (const quadroId of selectedQuadrosMulti) {
            const response = await fetch(`/api/kanban/quadros/${quadroId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const data = await response.json();
              console.log(`[KANBAN COLUNAS] Resposta COMPLETA do quadro ${quadroId}:`, JSON.stringify(data, null, 2));
              console.log(`[KANBAN COLUNAS] Chaves disponíveis:`, Object.keys(data));
              
              // Tentar tanto "colunas" quanto "Colunas" (case sensitive)
              const colunas = data.colunas || data.Colunas || [];
              
              if (colunas && colunas.length > 0) {
                console.log(`[KANBAN COLUNAS] ${colunas.length} colunas encontradas no quadro ${quadroId}:`, colunas);
                // Adicionar colunas com referência ao quadro
                colunas.forEach((col: any) => {
                  allColunas.push({
                    ...col,
                    quadroNome: data.nome || data.Nome || "Quadro",
                  });
                });
              } else {
                console.warn(`[KANBAN COLUNAS] Nenhuma coluna encontrada no quadro ${quadroId}. Data:`, data);
              }
            } else {
              console.error(`[KANBAN COLUNAS] Erro ao buscar quadro ${quadroId}:`, response.status);
              const errorText = await response.text();
              console.error(`[KANBAN COLUNAS] Erro detalhado:`, errorText);
            }
          }

          console.log('[KANBAN COLUNAS] Total de colunas carregadas:', allColunas);
          setKanbanColunas(allColunas);
        } catch (error) {
          console.error('[KANBAN COLUNAS] Erro ao buscar colunas:', error);
        }
      }
    };

    fetchKanbanColunas();
  }, [selectedQuadrosMulti, preloadedColunas]);

  // Opções de ordenação - Design moderno
  const sortOptions = [
    {
      id: "date-desc",
      label: "Recentes",
      description: "Mais novos primeiro",
      sortBy: "date",
      sortOrder: "desc",
      icon: Clock,
      color: "blue"
    },
    {
      id: "date-asc",
      label: "Antigas",
      description: "Mais antigas primeiro",
      sortBy: "date",
      sortOrder: "asc",
      icon: Clock,
      color: "gray"
    },
    {
      id: "name-asc",
      label: "A → Z",
      description: "Ordem alfabética",
      sortBy: "name",
      sortOrder: "asc",
      icon: ArrowUp,
      color: "green"
    },
    {
      id: "name-desc",
      label: "Z → A",
      description: "Ordem reversa",
      sortBy: "name",
      sortOrder: "desc",
      icon: ArrowDown,
      color: "purple"
    },
  ];

  const currentSort = sortOptions.find(
    (opt) => opt.sortBy === sortBy && opt.sortOrder === sortOrder,
  );
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });

  // Calcular posição do dropdown
  const updateDropdownPosition = () => {
    if (sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node) &&
        sortButtonRef.current &&
        !sortButtonRef.current.contains(event.target as Node)
      ) {
        setShowSortOptions(false);
      }
    };

    if (showSortOptions) {
      updateDropdownPosition();
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSortOptions]);

  // Definir tabs de filtros igual ao antigo
  const filterTabs = [
    { id: "unread", label: "Não lidas", icon: Circle, count: unreadChats },
    {
      id: "read-no-reply",
      label: "Não respondidas",
      icon: CheckCircle2,
      count: readChats,
    },
    { id: "favorites", label: "Favoritos", icon: Star, count: favoriteChats },
    {
      id: "archived",
      label: "Arquivados",
      icon: Archive,
      count: archivedChats,
    },
    { id: "hidden", label: "Ocultos", icon: EyeOff, count: hiddenChats },
  ];

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
    );
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
          {searchQuery.trim() &&
            (searchOptions.searchInMessages ||
              searchOptions.searchInContacts) && (
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
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                  ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              title={
                showSearchOptions
                  ? "Ocultar opções de busca"
                  : "Mostrar opções de busca"
              }
            >
              <motion.div
                animate={{
                  scale: showSearchOptions ? [1, 1.2, 1] : 1,
                  rotate: showSearchOptions ? [0, 5, -5, 0] : 0,
                }}
                transition={{
                  duration: showSearchOptions ? 0.6 : 0.2,
                  ease: "easeInOut",
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
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Buscar em:
            </span>

            {/* Ícone Chats */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                onSearchOptionsChange({
                  ...searchOptions,
                  searchInChats: !searchOptions.searchInChats,
                })
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                searchOptions.searchInChats
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  : "text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
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
              onClick={() =>
                onSearchOptionsChange({
                  ...searchOptions,
                  searchInMessages: !searchOptions.searchInMessages,
                })
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                searchOptions.searchInMessages
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  : "text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
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
              onClick={() =>
                onSearchOptionsChange({
                  ...searchOptions,
                  searchInContacts: !searchOptions.searchInContacts,
                })
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                searchOptions.searchInContacts
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  : "text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
              title="Buscar em Contatos (WAHA)"
            >
              <User className="w-3 h-3" />
              <span>Contatos</span>
            </motion.button>
          </div>
        )}

        {/* 🎯 TABS DE FILTROS PRINCIPAIS */}
        <div className="px-0 pt-2">
          <div className="bg-gray-50/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <div
              className="flex gap-1 overflow-x-auto pb-1 cursor-grab active:cursor-grabbing"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
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
                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                };
                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
                e.preventDefault();
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFilter === tab.id;

                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onFilterChange(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-w-fit ${
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-xs ${
                          isActive
                            ? "bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                            : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 📊 Filtros de Status - Apenas Ícones com Tooltips */}
        <div className="bg-gray-50 dark:bg-gray-800/30 mt-2 rounded-lg p-2">
          <div className="flex justify-start gap-3">
            {/* Todos Atendimentos */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange("all")}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm ${
                activeFilter === "all"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-400 dark:border-gray-500"
                  : "text-gray-500 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="relative">
                <Grid3X3 className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  {totalChats}
                </span>
              </div>

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Todos Atendimentos
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>

            {/* Em Atendimento */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange("em_atendimento")}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm ${
                activeFilter === "em_atendimento"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-2 border-green-400"
                  : "text-gray-500 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="relative">
                <MessageCircle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  {emAtendimentoChats}
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
              onClick={() => onFilterChange("aguardando")}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm ${
                activeFilter === "aguardando"
                  ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-2 border-yellow-400"
                  : "text-gray-500 bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="relative">
                <Clock className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  {aguardandoChats}
                </span>
              </div>

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Aguardando
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>

            {/* Finalizados */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange("finalizado")}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm ${
                activeFilter === "finalizado"
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-2 border-blue-400"
                  : "text-gray-500 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="relative">
                <CheckCircle2 className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  {finalizadoChats}
                </span>
              </div>

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Finalizados
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>

            {/* Agente IA */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange("agentes_ia")}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm ${
                activeFilter === "agentes_ia"
                  ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-2 border-cyan-400"
                  : "text-gray-500 bg-white dark:bg-gray-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="relative">
                <Bot className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  {agentesIAChats}
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
              onClick={() => onFilterChange("groups")}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm ${
                activeFilter === "groups"
                  ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-2 border-purple-400"
                  : "text-gray-500 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="relative">
                <Users className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  {groupChats}
                </span>
              </div>

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Grupos
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>

            {/* Leads Quentes */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange("leads_quentes")}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm ${
                activeFilter === "leads_quentes"
                  ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-2 border-orange-400"
                  : "text-gray-500 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="relative">
                <Flame className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  {leadsQuentesChats}
                </span>
              </div>

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Leads Quentes
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>

            {/* Favoritos */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange("favorites")}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm ${
                activeFilter === "favorites"
                  ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-2 border-yellow-400"
                  : "text-gray-500 bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="relative">
                <Star className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  {favoriteChats}
                </span>
              </div>

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Favoritos
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>

            {/* Arquivados */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange("archived")}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-sm ${
                activeFilter === "archived"
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-400"
                  : "text-gray-500 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="relative">
                <Archive className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm">
                  {archivedChats}
                </span>
              </div>

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Arquivados
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </motion.button>
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
            className="fixed inset-y-0 left-0 w-[500px] bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700"
            style={{ zIndex: 9998 }}
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
              {/* Filtro de Conexões - React Select MULTI */}
              <Select2
                label="Conexões (Múltipla Seleção)"
                value={selectedConexoes}
                onChange={(val) => {
                  const valores = val as string[];
                  onConexoesChange(valores);
                }}
                options={conexoes}
                placeholder="Selecione múltiplas conexões"
                icon={Phone}
                iconColor="green"
                isMulti={true}
                isClearable
                isSearchable
                isLoading={isLoadingConexoes}
              />

              {/* Filtro de Tags - React Select MULTI */}
              <div onClick={() => {
                console.log('🏷️ [FILTRO TAGS] Options disponíveis:', tags);
                console.log('🏷️ [FILTRO TAGS] Total:', tags.length);
                console.log('🏷️ [FILTRO TAGS] Primeiras 3 tags:', tags.slice(0, 3).map(t => ({ id: t.id, nome: t.nome })));
              }}>
                <Select2
                  label="Tags (Múltipla Seleção)"
                  value={selectedTagsMulti}
                  onChange={(val) => {
                    const valores = val as string[];
                    console.log('🏷️ [FILTRO TAGS] Selecionadas:', valores);
                    onTagsMultiChange(valores);
                  }}
                  options={tags}
                  placeholder="Selecione múltiplas tags"
                  icon={Tag}
                  iconColor="blue"
                  isMulti={true}
                  isClearable
                  isSearchable
                  isLoading={isLoadingTags}
                />
              </div>

              {/* Filtro de Filas - React Select MULTI */}
              <div onClick={() => {
                console.log('🔍 [FILTRO FILAS] Options disponíveis:', filas);
                console.log('🔍 [FILTRO FILAS] Total:', filas.length);
              }}>
                <Select2
                  label="Filas de Atendimento (Múltipla Seleção)"
                  value={selectedFilasMulti}
                  onChange={(val) => {
                    console.log('🔍 [FILTRO FILAS] Selecionadas:', val);
                    onFilasMultiChange(val as string[]);
                  }}
                  options={filas}
                  placeholder="Selecione múltiplas filas"
                  icon={Users}
                  iconColor="purple"
                  isMulti={true}
                  isClearable
                  isSearchable
                />
              </div>

              {/* Filtro de Atendentes - React Select MULTI com DADOS REAIS */}
              <Select2
                label="Atendentes (Múltipla Seleção)"
                value={selectedAtendentes}
                onChange={(val) => onAtendentesChange(val as string[])}
                options={atendentesReais.map((at) => ({
                  id: at.id || at.nome || at.email || at.usuarioId,
                  nome: at.nome || at.email || "Sem nome",
                }))}
                placeholder="Selecione múltiplos atendentes"
                icon={User}
                iconColor="indigo"
                isMulti={true}
                isClearable
                isSearchable
              />

              {/* Filtro de Kanban - React Select MULTI com DADOS REAIS */}
              {!hideQuadrosFilter && (
                <Select2
                  label="Quadros Kanban (Múltipla Seleção)"
                  value={selectedQuadrosMulti}
                  onChange={(val) => {
                    const valores = val as string[];
                    onQuadrosMultiChange(valores);
                    onKanbanColunasChange([]); // Reset colunas quando mudar quadro
                  }}
                  options={kanbanQuadros}
                  placeholder="Selecione múltiplos quadros"
                  icon={Settings}
                  iconColor="green"
                  isMulti={true}
                  isClearable
                  isSearchable
                />
              )}

              {/* Filtro de Colunas do Kanban - React Select MULTI com DADOS REAIS */}
              <Select2
                label={`Colunas do Kanban (${kanbanColunas.length} disponíveis)`}
                value={selectedKanbanColunas}
                onChange={(val) => {
                  console.log('[KANBAN COLUNAS] Colunas selecionadas:', val);
                  onKanbanColunasChange(val as string[]);
                }}
                options={kanbanColunas.map((col) => {
                  console.log('[KANBAN COLUNAS] Mapeando coluna:', col);
                  return {
                    id: col.id,
                    nome: col.nome,
                    icon: col.icone || "",
                    cor: col.cor,
                  };
                })}
                placeholder="Selecione múltiplas colunas"
                icon={Layers}
                iconColor="teal"
                isMulti={true}
                isClearable
                isSearchable
                isLoading={
                  kanbanColunas.length === 0 && selectedQuadrosMulti.length > 0
                }
              />

              {/* Filtro de PRIORIDADE de Tickets - React Select MULTI */}
              <Select2
                label="Prioridade de Tickets (Múltipla Seleção)"
                value={selectedTicketsMulti}
                onChange={(val) => onTicketsMultiChange(val as string[])}
                options={[
                  { id: "urgente", nome: "Urgente", icon: "🔴" },
                  { id: "alta", nome: "Alta", icon: "🟠" },
                  { id: "media", nome: "Média", icon: "🟡" },
                  { id: "baixa", nome: "Baixa", icon: "🟢" },
                  { id: "sem_prioridade", nome: "Sem Prioridade", icon: "⚪" },
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
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdvancedFilters(false)}
            className="fixed inset-0 bg-black/20"
            style={{ zIndex: 9997 }}
          />
        )}
      </AnimatePresence>

      {/* Portal para Dropdown de Ordenação */}
      {showSortOptions &&
        typeof window !== "undefined" &&
        createPortal(
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
                right: dropdownPosition.right,
              }}
            >
              <div className="p-2 space-y-1">
                {sortOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isActive =
                    sortBy === option.sortBy && sortOrder === option.sortOrder;

                  const colorClasses = {
                    blue: isActive 
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" 
                      : "hover:bg-blue-50/50 dark:hover:bg-blue-900/10",
                    gray: isActive 
                      ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700" 
                      : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30",
                    green: isActive 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                      : "hover:bg-green-50/50 dark:hover:bg-green-900/10",
                    purple: isActive 
                      ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" 
                      : "hover:bg-purple-50/50 dark:hover:bg-purple-900/10"
                  };

                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        onSortChange(
                          option.sortBy as "name" | "date",
                          option.sortOrder as "asc" | "desc",
                        );
                        setShowSortOptions(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border ${
                        isActive ? "border" : "border-transparent"
                      } ${colorClasses[option.color as keyof typeof colorClasses]}`}
                    >
                      <div className={`p-1.5 rounded-md ${
                        option.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        option.color === 'gray' ? 'bg-gray-100 dark:bg-gray-800' :
                        option.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        <IconComponent className={`w-3.5 h-3.5 ${
                          option.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                          option.color === 'gray' ? 'text-gray-600 dark:text-gray-400' :
                          option.color === 'green' ? 'text-green-600 dark:text-green-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className={`w-2 h-2 rounded-full ${
                          option.color === 'blue' ? 'bg-blue-500' :
                          option.color === 'gray' ? 'bg-gray-500' :
                          option.color === 'green' ? 'bg-green-500' :
                          'bg-purple-500'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
