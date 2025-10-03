"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import SideFilter from "./components/SideFilter";
import SideChat from "./components/SideChat";
import ChatHeader from "./components/TopChatArea/ChatHeader";
import ChatArea from "./components/ChatArea";
import FooterChatArea from "./components/FooterChatArea";
import EditTextModal from "../atendimentos/components/EditTextModal";
import AgenteSelectionModal from "./components/FooterChatArea/modals/AgenteSelectionModal";
import ForwardMessageModal from "@/components/ForwardMessageModal";
import AudioRecorderModal from "./components/FooterChatArea/modals/AudioRecorderModal";
import { useAuth } from "@/hooks/useAuth";
import { useContatoData } from "@/hooks/useContatoData";
import useChatsOverview from "@/hooks/useChatsOverview";
import { useFiltersData } from "@/hooks/useFiltersData";
import { useAtendenteFilas } from "@/hooks/useAtendenteFilas";
import useMessagesData from "@/hooks/useMessagesData";
import { useSearchData } from "@/hooks/useSearchData";
import { useChatStats } from "@/hooks/useChatStats";
import { useChatLeadBatch } from "@/hooks/useChatLeadBatch";
import AtendimentosTopBar from "../atendimentos/components/AtendimentosTopBar";
import QuickActionsSidebar from "../atendimentos/components/QuickActionsSidebar";
import TransferirAtendimentoModal from "../atendimentos/components/modals/TransferirAtendimentoModal";
import ModalAceitarAtendimento from "./components/ModalAceitarAtendimento";
import { normalizeTags } from "@/utils/tags";

// Mock data para demonstração
const mockTags = [
  { id: "1", nome: "VIP", cor: "#10B981" },
  { id: "2", nome: "Suporte", cor: "#3B82F6" },
  { id: "3", nome: "Vendas", cor: "#F59E0B" },
];

const mockFilas = [
  { id: "1", nome: "Atendimento", cor: "#8B5CF6", atendentes: [] },
  { id: "2", nome: "Vendas", cor: "#EF4444", atendentes: [] },
  { id: "3", nome: "Suporte", cor: "#06B6D4", atendentes: [] },
];

const mockChats = [
  {
    id: "1",
    name: "João Silva",
    lastMessage: {
      type: "text" as const,
      content: "Olá, preciso de ajuda com meu pedido",
      timestamp: Date.now() - 300000,
      sender: "user" as const,
      isRead: false,
    },
    tags: [{ id: "1", nome: "VIP", cor: "#10B981" }],
    rating: 4.5,
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Maria Santos",
    lastMessage: {
      type: "image" as const,
      content: "",
      timestamp: Date.now() - 600000,
      sender: "user" as const,
      isRead: true,
    },
    tags: [{ id: "2", nome: "Suporte", cor: "#3B82F6" }],
    isTransferred: true,
    transferredTo: { nome: "Carlos" },
  },
  {
    id: "3",
    name: "Pedro Costa",
    lastMessage: {
      type: "text" as const,
      content: "Obrigado pelo atendimento!",
      timestamp: Date.now() - 900000,
      sender: "user" as const,
      isRead: true,
    },
    rating: 5.0,
  },
];

function AtendimentoPage() {
  // Hook de autenticação
  const { user } = useAuth();
  
  // Estados para busca e filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("todas");
  const [selectedFila, setSelectedFila] = useState("todas");
  const [selectedConexoes, setSelectedConexoes] = useState<string[]>([]); // ✅ Filtro de conexões
  const [whatsappChats, setWhatsappChats] = useState<any[]>([]); // ✅ Estado para chats do WhatsApp
  const [selectedTagsMulti, setSelectedTagsMulti] = useState<string[]>([]); // ✅ Filtro de tags múltiplas
  const [selectedFilasMulti, setSelectedFilasMulti] = useState<string[]>([]);
  const [selectedAtendentes, setSelectedAtendentes] = useState<string[]>([]);
  const [selectedQuadrosMulti, setSelectedQuadrosMulti] = useState<string[]>(
    [],
  );
  const [selectedKanbanColunas, setSelectedKanbanColunas] = useState<string[]>(
    [],
  );
  const [selectedTicketPriorities, setSelectedTicketPriorities] = useState<
    string[]
  >([]);
  const [activeFilter, setActiveFilter] = useState("all"); // Novo estado para filtros de tabs

  // Estados para opções de busca
  const [searchOptions, setSearchOptions] = useState({
    searchInChats: true,
    searchInMessages: false,
    searchInContacts: false,
  });

  // Estados para filtros avançados
  const [selectedKanbanStatus, setSelectedKanbanStatus] = useState("todos");
  const [selectedTicketStatus, setSelectedTicketStatus] = useState("todos");
  const [selectedPriceRange, setSelectedPriceRange] = useState("todos");

  // Estados do chat
  const [selectedChatId, setSelectedChatId] = useState<string>();
  const [showModalAceitar, setShowModalAceitar] = useState(false);
  const [modoEspiar, setModoEspiar] = useState(false);
  const [chatAguardando, setChatAguardando] = useState<any>(null);

  // Hook para filtros avançados com dados reais
  const {
    tags: realTags,
    filas: realFilas,
    kanbanStatuses: realKanbanStatuses,
    ticketStatuses: realTicketStatuses,
    priceRanges: realPriceRanges,
  } = useFiltersData();

  // 🎯 Hook para buscar filas do atendente logado
  const { filas: minhasFilas, loading: loadingMinhasFilas } = useAtendenteFilas()
  const minhasFilasIds = useMemo(() => minhasFilas.map(f => f.id), [minhasFilas])

  // 🔥 Buscar conexões para o filtro
  const [conexoesParaFiltro, setConexoesParaFiltro] = useState<any[]>([]);
  useEffect(() => {
    const fetchConexoes = async () => {
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
          setConexoesParaFiltro(data.connections || []);
        }
      } catch {}
    };
    fetchConexoes();
  }, []);

  // Estados dos modais
  const [showAgenteModal, setShowAgenteModal] = useState(false);
  const [showEditTextModal, setShowEditTextModal] = useState(false);
  const [showQuickActionsSidebar, setShowQuickActionsSidebar] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<string | null>(
    null,
  );
  const [showAudioModal, setShowAudioModal] = useState(false);

  // Estados para paginação dos chats
  const [displayedChatsCount, setDisplayedChatsCount] = useState(10);
  const [isLoadingMoreChats, setIsLoadingMoreChats] = useState(false);

  // Estados para ordenação
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Estados removidos - agora usando useFiltersData

  // Estados de tradução
  const [translatedMessages, setTranslatedMessages] = useState<{
    [messageId: string]: string;
  }>({});

  // Estado de resposta
  const [replyingTo, setReplyingTo] = useState<{
    messageId: string;
    content: string;
    sender: string;
  } | null>(null);

  // Estados para funcionalidades dos ícones do SideChat - COM PERSISTÊNCIA
  const [favoriteChats, setFavoriteChats] = useState<Set<string>>(new Set());
  const [archivedChats, setArchivedChats] = useState<Set<string>>(new Set());
  const [hiddenChats, setHiddenChats] = useState<Set<string>>(new Set());

  // Estados para modal de transferir
  const [showTransferirModal, setShowTransferirModal] = useState(false);
  const [selectedChatForTransfer, setSelectedChatForTransfer] = useState<
    string | null
  >(null);

  // Funções para gerenciar estados dos chats
  const toggleFavoriteChat = (chatId: string) => {
    setFavoriteChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }

      return newSet;
    });
  };

  const toggleArchiveChat = (chatId: string) => {
    setArchivedChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
        // Se desarquivar, remover também dos ocultos
        setHiddenChats((prevHidden) => {
          const newHiddenSet = new Set(prevHidden);
          newHiddenSet.delete(chatId);
          return newHiddenSet;
        });
      } else {
        newSet.add(chatId);
      }

      return newSet;
    });
  };

  const toggleHiddenChat = (chatId: string) => {
    setHiddenChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  const deleteChat = (chatId: string) => {
    if (confirm("Deseja realmente ocultar esta conversa?")) {
      toggleHiddenChat(chatId);
    }
  };

  // 🔥 Escutar eventos de tags criadas/deletadas para atualizar em tempo real
  useEffect(() => {
    const handleTagCreated = (event: any) => {
      console.log('🏷️ [TAG CREATED] Evento recebido:', event.detail);
      // Forçar reload dos chats extra data
      setChatsExtraData(prev => {
        const chatId = event.detail?.chatId;
        if (chatId && prev[chatId]) {
          // Remover do cache para forçar reload
          const newData = { ...prev };
          delete newData[chatId];
          return newData;
        }
        return prev;
      });
    };

    const handleTagDeleted = (event: any) => {
      console.log('🏷️ [TAG DELETED] Evento recebido:', event.detail);
      // Forçar reload dos chats extra data
      setChatsExtraData(prev => {
        const chatId = event.detail?.chatId;
        if (chatId && prev[chatId]) {
          // Remover do cache para forçar reload
          const newData = { ...prev };
          delete newData[chatId];
          return newData;
        }
        return prev;
      });
    };

    // Listener para atualização de status de chat
    const handleChatStatusUpdated = (event: CustomEvent) => {
      const { chatId } = event.detail;
      console.log('🔄 [STATUS UPDATE] Chat status updated:', chatId);
      
      // Limpar cache do chat específico
      const cacheKey = `chat-lead-${chatId}`;
      sessionStorage.removeItem(cacheKey);
      
      // Forçar reload dos chats após 500ms
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    window.addEventListener('tag-created', handleTagCreated);
    window.addEventListener('tag-deleted', handleTagDeleted);
    window.addEventListener('chatStatusUpdated', handleChatStatusUpdated as EventListener);

    return () => {
      window.removeEventListener('tag-created', handleTagCreated);
      window.removeEventListener('tag-deleted', handleTagDeleted);
      window.removeEventListener('chatStatusUpdated', handleChatStatusUpdated as EventListener);
    };
  }, []);

  // Carregar estados do localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("tappyone-favorite-chats");
      const savedArchived = localStorage.getItem("tappyone-archived-chats");
      const savedHidden = localStorage.getItem("tappyone-hidden-chats");

      if (savedFavorites) {
        const favorites = new Set<string>(JSON.parse(savedFavorites));

        setFavoriteChats(favorites);
      }
      if (savedArchived) {
        const archived = new Set<string>(JSON.parse(savedArchived));

        setArchivedChats(archived);
      }
      if (savedHidden) {
        const hidden = new Set<string>(JSON.parse(savedHidden));

        setHiddenChats(hidden);
      }
    } catch {}
  }, []);

  // Salvar estados no localStorage
  useEffect(() => {
    localStorage.setItem(
      "tappyone-favorite-chats",
      JSON.stringify(Array.from(favoriteChats)),
    );
  }, [favoriteChats]);

  useEffect(() => {
    localStorage.setItem(
      "tappyone-archived-chats",
      JSON.stringify(Array.from(archivedChats)),
    );
  }, [archivedChats]);

  useEffect(() => {
    localStorage.setItem(
      "tappyone-hidden-chats",
      JSON.stringify(Array.from(hiddenChats)),
    );
  }, [hiddenChats]);

  // Hook de mensagens com dados reais da WAHA
  const {
    messages: realMessages,
    loading: loadingMessages,
    error: messagesError,
    hasMore: hasMoreMessages,
    totalMessages,
    loadMore: loadMoreMessages,
    refreshMessages,
  } = useMessagesData(selectedChatId);

  // Hook de overview dos chats da WAHA (com paginação real)
  const {
    chats: overviewChats,
    loading: loadingOverview,
    error: errorOverview,
    refreshChats: refreshOverviewChats,
    loadMoreChats,
    hasMore: hasMoreOverviewChats,
    isLoadingMore: isLoadingMoreOverview,
    markChatAsRead,
    markChatAsUnread,
    totalChatsCount,
    unreadChatsCount,
    readNoReplyCount,
    groupChatsCount,
  } = useChatsOverview();

  // Hook para estatísticas de atendimento (dados reais do backend)
  const { stats: chatStats } = useChatStats();

  // Hook para buscar dados de chat leads em batch (OTIMIZADO - apenas 50 primeiros chats)
  const activeChatIdsForLeads = useMemo(() => {
    return overviewChats
      .slice(0, 50)
      .map((chat) => chat.id)
      .filter(Boolean);
  }, [overviewChats]);

  const { chatLeads, loading: loadingChatLeads } = useChatLeadBatch(
    activeChatIdsForLeads,
  );

  // 🎯 Popular chatsExtraData com chatLeads
  useEffect(() => {
    if (chatLeads && Object.keys(chatLeads).length > 0) {
      console.log('📦 [CHAT LEADS] Populando chatsExtraData com:', Object.keys(chatLeads).length, 'chat leads')
      
      setChatsExtraData(prev => {
        const updated = { ...prev }
        
        Object.entries(chatLeads).forEach(([chatId, chatLead]) => {
          if (!updated[chatId]) {
            updated[chatId] = {}
          }
          updated[chatId].chatLead = chatLead
          
          console.log(`✅ [CHAT LEAD] Chat ${chatId} tem fila:`, chatLead?.fila_id)
        })
        
        return updated
      })
    }
  }, [chatLeads])

  // Estado para armazenar agentes ativos (para contagem)
  const [agentesAtivos, setAgentesAtivos] = useState<Set<string>>(new Set());

  // ❌ DESABILITADO: Busca individual de agentes (muito lento!)
  // Agora usa apenas os dados do useChatAgente dentro do ItemSideChat
  // O contador será calculado baseado nos chats visíveis que têm agente

  // useEffect(() => {
  //   // Buscar agentes ativos - DESABILITADO para performance
  // }, [])

  // Hook para busca avançada (passar overviewChats para busca local)
  const searchResults = useSearchData(searchQuery, searchOptions, overviewChats);

  // Reset displayedChatsCount quando há filtros
  useEffect(() => {
    if (
      searchQuery.trim() ||
      selectedTag !== "todas" ||
      selectedFila !== "todas" ||
      selectedKanbanStatus !== "todos" ||
      selectedTicketStatus !== "todos" ||
      selectedPriceRange !== "todos" ||
      selectedTagsMulti.length > 0 ||
      selectedFilasMulti.length > 0 ||
      selectedConexoes.length > 0 ||
      selectedAtendentes.length > 0 ||
      selectedQuadrosMulti.length > 0 ||
      selectedKanbanColunas.length > 0 ||
      selectedTicketPriorities.length > 0
    ) {
      setDisplayedChatsCount(10); // Reset para 10 quando há filtros
    }
  }, [
    searchQuery,
    selectedTag,
    selectedTagsMulti,
    selectedFila,
    selectedFilasMulti,
    selectedConexoes,
    selectedAtendentes,
    selectedQuadrosMulti,
    selectedKanbanColunas,
    selectedTicketPriorities,
    selectedKanbanStatus,
    selectedTicketStatus,
    selectedPriceRange,
  ]);

  // Estado para armazenar dados extras dos chats
  const [chatsExtraData, setChatsExtraData] = useState<Record<string, any>>({});

  // Buscar dados extras para cada chat (tags, agendamentos, etc)
  useEffect(() => {
    const fetchExtraData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      // 🔥 OTIMIZAÇÃO: Limitar a apenas 10 chats para evitar sobrecarga
      for (const chat of overviewChats.slice(0, 10)) {
        const chatId = chat.id;
        const contatoId = chat.id?.replace("@c.us", "").replace("@g.us", "");
        if (!chatId || !contatoId) continue;

        // ⚡ Pular se já temos dados deste chat (evita refetch desnecessário)
        if (chatsExtraData[chatId]) {
          continue;
        }

        try {
          // 🔥 CORREÇÃO: Usar API nova de tags por chat (via proxy para evitar CORS)
          const [
            tagsRes,
            agendamentosRes,
            orcamentosRes,
            ticketsRes,
            contatoRes,
          ] = await Promise.all([
            // Tags (API NOVA - por chatId via proxy)
            fetch(`/api/chat-tags?chatId=${encodeURIComponent(chatId)}`, {
              headers: {
                Authorization: token.startsWith("Bearer ")
                  ? token
                  : `Bearer ${token}`,
              },
            }).catch(() => null),
            // Agendamentos
            fetch(`/api/agendamentos?contato_id=${contatoId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null),
            // Orçamentos
            fetch(`/api/orcamentos?contato_id=${contatoId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null),
            // Tickets
            fetch(`/api/tickets?contato_id=${contatoId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null),
            // Contato
            fetch(`/api/contatos?telefone=${contatoId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null),
          ]);

          const extraData: any = {};

          // Processar tags
          if (tagsRes?.ok) {
            const tagsData = await tagsRes.json();
            const rawTags = tagsData?.data || tagsData?.tags || tagsData || [];
            extraData.tags = normalizeTags(
              Array.isArray(rawTags) ? rawTags : [],
            );
          }

          // Processar agendamentos
          if (agendamentosRes?.ok) {
            const agendamentosData = await agendamentosRes.json();
            extraData.agendamentos =
              agendamentosData.data || agendamentosData || [];
          }

          // Processar orçamentos
          if (orcamentosRes?.ok) {
            const orcamentosData = await orcamentosRes.json();
            extraData.orcamentos = orcamentosData.data || orcamentosData || [];
          }

          // Processar tickets
          if (ticketsRes?.ok) {
            const ticketsData = await ticketsRes.json();
            extraData.tickets = ticketsData.data || ticketsData || [];
          }

          // Verificar se é contato
          if (contatoRes?.ok) {
            const contatoData = await contatoRes.json();
            const contatos = contatoData.data || contatoData || [];
            extraData.isContact = contatos.length > 0;
          }

          // Atualizar estado com os dados extras
          setChatsExtraData((prev) => ({
            ...prev,
            [chat.id]: extraData,
          }));
        } catch {}
      }
    };

    if (overviewChats.length > 0) {
      fetchExtraData();
    }
  }, [overviewChats]); // ⚠️ NÃO incluir selectedTagsMulti aqui (causa loop infinito)

  // Preparar dados de contato para filtros e indicadores
  const finalChats = overviewChats;
  const activeChats = useMemo(() => finalChats, [finalChats]);

  const activeChatIds = useMemo(() => {
    return activeChats
      .map((chat) => {
        if (typeof chat.id === "string") {
          return chat.id;
        }
        if (
          chat.id &&
          typeof chat.id === "object" &&
          "_serialized" in chat.id
        ) {
          return (chat.id as any)._serialized;
        }
        return "";
      })
      .filter(Boolean);
  }, [activeChats]);

  const { contatos: contatosData, loading: loadingContatos } =
    useContatoData(activeChatIds);

  // Filtrar e transformar overview chats para formato da SideChat
  const transformedChats = useMemo(() => {
    // 🔥 DEBUG CRÍTICO: Ver sessionName

    let filteredChats = overviewChats;

    // Aplicar filtro de busca avançada
    if (searchQuery.trim()) {
      // Se qualquer opção de busca está ativa, usar resultados da busca avançada
      if (
        searchOptions.searchInChats ||
        searchOptions.searchInMessages ||
        searchOptions.searchInContacts
      ) {
        const searchResultIds = new Set();

        // Adicionar IDs dos chats encontrados
        if (searchOptions.searchInChats) {
          searchResults.chats.forEach((chat) => {
            searchResultIds.add(chat.id);
          });
        }

        // Adicionar IDs dos chats que têm mensagens encontradas
        if (searchOptions.searchInMessages) {
          searchResults.messages.forEach((msg) => {
            searchResultIds.add(msg.chatId);
          });
        }

        // Adicionar IDs dos contatos encontrados (se são chats existentes)
        if (searchOptions.searchInContacts) {
          searchResults.contacts.forEach((contact) => {
            // Tentar encontrar chat correspondente ao contato
            const matchingChat = overviewChats.find(
              (chat) =>
                chat.id === contact.id ||
                chat.id.includes(contact.id?.replace("@c.us", "")) ||
                contact.id?.includes(chat.id?.replace("@c.us", "")),
            );
            if (matchingChat) {
              searchResultIds.add(matchingChat.id);
            }
          });
        }

        // Filtrar chats pelos IDs encontrados
        filteredChats = overviewChats.filter((chat) =>
          searchResultIds.has(chat.id),
        );
      } else {
        // Busca simples apenas em chats (comportamento padrão)
        filteredChats = overviewChats.filter(
          (chat) =>
            chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.lastMessage?.body
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()),
        );
      }
    }

    // ❌ REMOVIDO: Filtros de tags e filas duplicados
    // Esses filtros são aplicados DEPOIS no processedChats (após carregar dados extras)

    // ✅ Aplicar filtro de conexões (múltipla seleção) - CORRIGIDO para usar sessionName
    if (
      selectedConexoes &&
      selectedConexoes.length > 0 &&
      conexoesParaFiltro.length > 0
    ) {
      let chatsComErro = 0;

      filteredChats = filteredChats.filter((chat) => {
        // 🔥 CORREÇÃO: Usar sessionName do chat para identificar a conexão
        const chatSessionName = (chat as any).sessionName;

        if (!chatSessionName) {
          chatsComErro++;
          return true; // Mostrar chat se não tem sessionName (fallback)
        }

        // Encontrar a conexão pelo sessionName
        const conexaoDoChat = conexoesParaFiltro.find(
          (conn) => conn.sessionName === chatSessionName,
        );

        if (!conexaoDoChat) {
          chatsComErro++;
          return true; // Mostrar chat se não encontrou conexão (fallback)
        }

        // Verificar se a conexão está nas selecionadas
        return selectedConexoes.includes(conexaoDoChat.id);
      });
    }

    // Aplicar ordenação
    const sortedChats = [...filteredChats].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a.name?.toLowerCase() || "";
        const nameB = b.name?.toLowerCase() || "";
        const comparison = nameA.localeCompare(nameB);
        return sortOrder === "asc" ? comparison : -comparison;
      } else {
        // Ordenar por data (timestamp da última mensagem)
        const timestampA = a.lastMessage?.timestamp || 0;
        const timestampB = b.lastMessage?.timestamp || 0;
        const comparison = timestampA - timestampB;
        return sortOrder === "asc" ? comparison : -comparison;
      }
    });

    // Limitar para performance (apenas se há filtros ativos)
    const hasActiveFilters = Boolean(
      searchQuery.trim() ||
        selectedTag !== "todas" ||
        selectedFila !== "todas" ||
        selectedKanbanStatus !== "todos" ||
        selectedTicketStatus !== "todos" ||
        selectedPriceRange !== "todos" ||
        (selectedTagsMulti && selectedTagsMulti.length > 0) ||
        (selectedFilasMulti && selectedFilasMulti.length > 0) ||
        (selectedConexoes && selectedConexoes.length > 0) ||
        (selectedAtendentes && selectedAtendentes.length > 0) ||
        (selectedQuadrosMulti && selectedQuadrosMulti.length > 0) ||
        (selectedKanbanColunas && selectedKanbanColunas.length > 0) ||
        (selectedTicketPriorities && selectedTicketPriorities.length > 0),
    );
    const chatsToShow = hasActiveFilters
      ? sortedChats.slice(0, displayedChatsCount)
      : sortedChats;

    return chatsToShow.map((chat) => {
      const extraData = contatosData[chat.id] || chatsExtraData[chat.id] || {};

      return {
        id: chat.id,
        name: chat.name,
        avatar: chat.image, // Foto real do contato
        sessionName: (chat as any).sessionName, // ✅ CRÍTICO: Passar sessionName para identificar conexão
        lastMessage: {
          type:
            chat.lastMessage?.type === "text"
              ? ("text" as const)
              : chat.lastMessage?.hasMedia
                ? ("image" as const)
                : ("text" as const),
          content: chat.lastMessage?.body || "Sem mensagens",
          timestamp: chat.lastMessage?.timestamp || Date.now(),
          sender: chat.lastMessage?.fromMe
            ? ("agent" as const)
            : ("user" as const),
          isRead: (chat.unreadCount ?? 0) === 0,
        },
        isSelected: selectedChatId === chat.id,
        unreadCount: chat.unreadCount,
        // Dados reais dos indicadores
        tags: extraData.tags,
        agendamentos: extraData.agendamentos,
        orcamentos: extraData.orcamentos,
        tickets: extraData.tickets,
        isContact: extraData.isContact,
        kanbanStatus: extraData.kanbanStatus || chat.kanbanStatus,
        fila: extraData.fila || chat.fila,
        // Dados mock por enquanto
        rating:
          Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : undefined,
        isOnline: Math.random() > 0.3,
        kanbanStatus:
          Math.random() > 0.4
            ? {
                id: "1",
                nome: ["Pendente", "Em Andamento", "Finalizado"][
                  Math.floor(Math.random() * 3)
                ],
                cor: ["#f59e0b", "#3b82f6", "#10b981"][
                  Math.floor(Math.random() * 3)
                ],
              }
            : undefined,
        fila:
          Math.random() > 0.2
            ? mockFilas[Math.floor(Math.random() * mockFilas.length)]
            : undefined,
      };
    });
  }, [
    overviewChats,
    selectedChatId,
    chatsExtraData,
    displayedChatsCount,
    searchQuery,
    selectedTag,
    selectedTagsMulti,
    selectedFila,
    selectedFilasMulti,
    selectedConexoes,
    selectedAtendentes,
    selectedQuadrosMulti,
    selectedKanbanColunas,
    selectedTicketPriorities,
    selectedKanbanStatus,
    selectedTicketStatus,
    selectedPriceRange,
    conexoesParaFiltro,
    favoriteChats,
    archivedChats,
    hiddenChats,
    searchOptions,
    searchResults,
    sortBy,
    sortOrder,
    chatLeads, // 🔥 CRÍTICO: Adicionar chatLeads para atualizar quando os dados chegarem
  ]);

  // Função para carregar mais chats (agora usa paginação real da API)
  const handleLoadMoreChats = useCallback(async () => {
    // 🚫 BLOQUEAR scroll infinito para filtros de status E para "all" (atendente só vê suas filas)
    if (["all", "em_atendimento", "aguardando", "finalizado", "agentes_ia", "leads_quentes", "favorites", "archived", "hidden"].includes(activeFilter)) {
      console.log('🚫 [LOAD MORE] Bloqueado para filtro:', activeFilter)
      return
    }
    
    const hasClientSideFilters = Boolean(
      searchQuery.trim() ||
        selectedTag !== "todas" ||
        selectedFila !== "todas" ||
        selectedKanbanStatus !== "todos" ||
        selectedTicketStatus !== "todos" ||
        selectedPriceRange !== "todos" ||
        (selectedTagsMulti && selectedTagsMulti.length > 0) ||
        (selectedFilasMulti && selectedFilasMulti.length > 0) ||
        (selectedConexoes && selectedConexoes.length > 0) ||
        (selectedAtendentes && selectedAtendentes.length > 0) ||
        (selectedQuadrosMulti && selectedQuadrosMulti.length > 0) ||
        (selectedKanbanColunas && selectedKanbanColunas.length > 0) ||
        (selectedTicketPriorities && selectedTicketPriorities.length > 0),
    );

    if (hasClientSideFilters) {
      if (isLoadingMoreChats || displayedChatsCount >= overviewChats.length) {
        return;
      }

      setIsLoadingMoreChats(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newCount = Math.min(displayedChatsCount + 12, overviewChats.length);

      setDisplayedChatsCount(newCount);
      setIsLoadingMoreChats(false);
      return;
    }

    // Sem filtros - usar paginação real da API

    if (isLoadingMoreOverview) {
      return;
    }

    try {
      // Usar o hook useChatsOverview para carregar mais chats

      await loadMoreChats(); // Função do hook useChatsOverview (já gerencia isLoadingMore)
    } catch {}
  }, [
    activeFilter, // 🔥 CRÍTICO: Adicionar activeFilter para bloquear scroll em filtros de status
    searchQuery,
    selectedTag,
    selectedTagsMulti,
    selectedFila,
    selectedFilasMulti,
    selectedConexoes,
    selectedAtendentes,
    selectedQuadrosMulti,
    selectedKanbanColunas,
    selectedTicketPriorities,
    selectedKanbanStatus,
    selectedTicketStatus,
    selectedPriceRange,
    isLoadingMoreChats,
    isLoadingMoreOverview,
    displayedChatsCount,
    overviewChats.length,
    loadMoreChats,
  ]);

  // Função helper para obter URL base
  // SEMPRE usar /api/waha-proxy para passar pela nossa API que busca a sessão
  const getWahaUrl = useCallback((path: string = "") => {
    return `/api/waha-proxy${path}`;
  }, []);

  // Função helper para buscar sessão ativa
  const getActiveSessionName = useCallback(async () => {
    const { getActiveSessionClient } = await import('@/utils/getActiveSession')
    return await getActiveSessionClient()
  }, []);

  // Função helper para obter headers com Authorization
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }, []);

  // Função para votar em enquete
  const handlePollVote = useCallback(
    async (messageId: string, chatId: string, votes: string[]) => {
      try {
        const sessionName = await getActiveSessionName();
        if (!sessionName) return;
        const response = await fetch(getWahaUrl("/api/sendPollVote"), {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            session: sessionName,
            chatId,
            pollMessageId: messageId,
            votes,
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        // Recarregar mensagens para mostrar o resultado
        setTimeout(() => refreshMessages(), 1000);
      } catch {
        alert("Erro ao votar na enquete. Tente novamente.");
      }
    },
    [refreshMessages],
  );

  // Usar apenas mensagens reais vindas da API
  const displayMessages = useMemo(() => {
    if (!selectedChatId) return [];

    // Adicionar traduções às mensagens
    return realMessages.map((message) => ({
      ...message,
      translation: translatedMessages[message.id],
    }));
  }, [
    selectedChatId,
    realMessages,
    hasMoreMessages,
    totalMessages,
    loadingMessages,
    translatedMessages,
  ]);

  // ❌ REMOVIDO: Estados antigos de whatsappChats (agora usa useChatsOverview)

  // Funções para manipular os ícones do SideChat - IGUAL AO ConversationSidebar
  const toggleFavoriteConversation = (chatId: string) => {
    setFavoriteChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  const toggleArchiveConversation = (chatId: string) => {
    setArchivedChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  const toggleHideConversation = (chatId: string) => {
    setHiddenChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm("Deseja realmente excluir esta conversa?")) return;

    try {
      const token = localStorage.getItem("token");

      // Primeiro tentar via API Next.js (se existir)
      let response = await fetch(
        `/api/whatsapp/chats/${encodeURIComponent(chatId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Se 404 (não existe) ou 405 (método não permitido), ocultar localmente
      if (response.status === 404 || response.status === 405) {
        setHiddenChats((prev) => new Set(Array.from(prev).concat([chatId])));
        return;
      }

      if (response.ok) {
        // Se deletou com sucesso, adicionar à lista de chats ocultos
        setHiddenChats((prev) => new Set(Array.from(prev).concat([chatId])));
      } else {
        alert("Erro ao deletar chat. Tente novamente.");
      }
    } catch {
      alert("Erro ao deletar chat. Tente novamente.");
    }
  };

  const handleTransferChat = (chatId: string) => {
    setSelectedChatForTransfer(chatId);
    setShowTransferirModal(true);
  };

  // Handler para confirmar transferência
  const handleTransferirSave = async (transferData: any) => {
    try {
      // TODO: Implementar lógica de transferência real
      // Por enquanto, apenas simular
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowTransferirModal(false);
      setSelectedChatForTransfer(null);
    } catch (error) {
      throw error; // Re-throw para o modal não fechar
    }
  };

  // Função para buscar chats (inicial ou pesquisa)
  const fetchChats = async (searchTerm: string = "") => {
    try {
      const isSearch = searchTerm.length > 0;
      // if (isSearch) setIsSearching(true) // ❌ Função removida
      // else setLoadingChats(true) // ❌ Função removida

      const token = localStorage.getItem("token");
      if (!token) {
        setWhatsappChats([]);
        return;
      }

      const response = await fetch("/api/whatsapp/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const allChats = await response.json();

        let filteredChats = allChats;

        // Se tem pesquisa, filtrar
        if (searchTerm) {
          filteredChats = allChats.filter(
            (chat: any) =>
              chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              chat.lastMessage
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()),
          );
        } else {
          // Sem pesquisa, pegar apenas os primeiros 20
          filteredChats = allChats.slice(0, 20);
        }

        // Remover URLs de imagem para evitar requisições extras
        const chatsWithoutImages = filteredChats.map((chat: any) => ({
          ...chat,
          profilePictureUrl: undefined,
        }));

        setWhatsappChats(chatsWithoutImages);
      } else {
        setWhatsappChats([]);
      }
    } catch {
      setWhatsappChats([]);
    } finally {
      // setLoadingChats(false) // ❌ Função removida
      // setIsSearching(false) // ❌ Função removida
    }
  };

  // Carregamento inicial
  useEffect(() => {
    fetchChats();
  }, []);

  // Listener para atualizar lista quando houver transferência
  useEffect(() => {
    const handleChatTransferred = (event: any) => {
      // Aguardar 500ms para garantir que o backend atualizou
      setTimeout(() => {
        fetchChats(searchQuery);
      }, 500);
    };

    window.addEventListener("chatTransferred", handleChatTransferred);
    return () =>
      window.removeEventListener("chatTransferred", handleChatTransferred);
  }, [searchQuery]);

  // Debounce para pesquisa
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchChats(searchQuery);
    }, 300); // 300ms de delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Helper functions para processar mensagens da WAHA
  const getMessageType = (
    lastMessage: any,
  ):
    | "text"
    | "image"
    | "video"
    | "audio"
    | "document"
    | "location"
    | "contact"
    | "call" => {
    if (!lastMessage) return "text";
    if (
      lastMessage.type === "image" ||
      lastMessage.mimetype?.startsWith("image/")
    )
      return "image";
    if (
      lastMessage.type === "video" ||
      lastMessage.mimetype?.startsWith("video/")
    )
      return "video";
    if (
      lastMessage.type === "audio" ||
      lastMessage.mimetype?.startsWith("audio/")
    )
      return "audio";
    if (lastMessage.type === "document") return "document";
    if (lastMessage.type === "location") return "location";
    if (lastMessage.type === "vcard") return "contact";
    if (lastMessage.type === "call_log") return "call";
    return "text";
  };

  const getMessageSender = (chat: any): "user" | "agent" => {
    const lastMessage = chat.lastMessage;

    // Se não há mensagem, considerar como user (novo chat)
    if (!lastMessage) return "user";

    // Se for string simples, usar o fromMe do chat
    if (typeof lastMessage === "string") {
      return chat.fromMe ? "agent" : "user";
    }

    // Se for objeto WAHA, verificar fromMe da mensagem
    return lastMessage.fromMe ? "agent" : "user";
  };

  const getMessageReadStatus = (chat: any): boolean => {
    const lastMessage = chat.lastMessage;

    // Se não há mensagem, considerar como lida
    if (!lastMessage) return true;

    // Para mensagens do agente (enviadas por nós), sempre consideramos lidas
    if (getMessageSender(chat) === "agent") return true;

    // Para mensagens do usuário, verificar se há unreadCount
    // Se unreadCount é 0, a última mensagem foi lida
    return (chat.unreadCount || 0) === 0;
  };

  // Usar dados já processados do transformedChats (que inclui busca) e adicionar dados extras dos contatos
  const processedChats = useMemo(() => {
    console.log('🔍 [PROCESSED CHATS] Início - transformedChats:', transformedChats.length);
    console.log('🎯 [FILAS ATENDENTE] Minhas filas:', minhasFilasIds);
    console.log('📦 [CHATS EXTRA DATA] Dados carregados:', Object.keys(chatsExtraData).length);
    
    // 🎯 FILTRO 1: Mostrar apenas chats das filas do atendente (excluir recusados)
    let chatsFiltradasPorFila = transformedChats
    
    if (minhasFilasIds.length > 0) {
      chatsFiltradasPorFila = transformedChats.filter((chat: any) => {
        // Buscar chat_lead do banco via chatsExtraData
        const chatLead = chatsExtraData[chat.id]?.chatLead
        
        if (!chatLead || !chatLead.fila_id) {
          console.log(`⚠️ Chat ${chat.id} sem fila atribuída - OCULTO`)
          return false // Ocultar chats sem fila
        }
        
        // 🚫 OCULTAR chats recusados
        if (chatLead.status === 'recusado') {
          console.log(`🚫 Chat ${chat.id} foi recusado - OCULTO`)
          return false
        }
        
        const pertenceAMinhaFila = minhasFilasIds.includes(chatLead.fila_id)
        
        if (!pertenceAMinhaFila) {
          console.log(`🚫 Chat ${chat.id} da fila ${chatLead.fila_id} - NÃO é uma fila - OCULTO`)
        }
        
        return pertenceAMinhaFila
      })
      
      console.log(`✅ [FILAS ATENDENTE] Filtrados: ${chatsFiltradasPorFila.length} de ${transformedChats.length} chats`)
    }
    
    let result = chatsFiltradasPorFila.map((chat: any) => {
      // ✅ ADICIONAR sessionName - sempre adicionar
      let sessionName = chat.sessionName; // Já tem do hook (esperamos que sim após fix)

      const contatoData: any = contatosData[chat.id] || {};

      // ❌ REMOVIDO: Dados de exemplo (causavam conflito com filtros)
      // Agora usa APENAS dados reais do banco de dados

      const kanbanStatusFromContato = contatoData.kanbanStatus
        ? {
            id: contatoData.kanbanStatus.id,
            nome: contatoData.kanbanStatus.nome,
            cor: contatoData.kanbanStatus.cor || "#3B82F6",
            quadro:
              contatoData.kanbanStatus.quadroId ||
              contatoData.kanbanStatus.quadro_id ||
              contatoData.kanbanStatus.kanban_id,
          }
        : contatoData.kanban?.length > 0
          ? {
              id: contatoData.kanban[0].coluna_id,
              nome: contatoData.kanban[0].coluna_nome || "Kanban",
              cor: contatoData.kanban[0].coluna_cor || "#3B82F6",
              quadro:
                contatoData.kanban[0].quadro_id ||
                contatoData.kanban[0].kanban_id ||
                contatoData.kanban[0].quadro,
            }
          : undefined;

      return {
        ...chat, // Usar dados já processados (incluindo lastMessage.body correto)
        sessionName, // ✅ GARANTIR que sessionName está presente
        // Garantir que lastMessage existe
        lastMessage: chat.lastMessage || {
          type: "text" as const,
          content: "Sem mensagens",
          timestamp: Date.now(),
          sender: "user" as const,
          isRead: true,
        },
        // Dados reais dos contatos (SEM exemplos mockados)
        // 🎯 Buscar tags do chatsExtraData (carregado por loadExtraData)
        tags: (() => {
          const extraTags = chatsExtraData[chat.id]?.tags || [];
          const contatoTags = contatoData.tags || [];
          const finalTags = extraTags.length > 0 ? extraTags : contatoTags;
          
          if (chat.name && chat.name.includes('Jorge')) {
            console.log('🏷️ [TAGS DEBUG] Chat Jorge:', {
              chatId: chat.id,
              extraTags,
              contatoTags,
              finalTags
            });
          }
          
          return finalTags;
        })(),
        agendamentos: contatoData.agendamentos || [],
        orcamentos: contatoData.orcamentos || [],
        tickets: contatoData.tickets || [],
        atendente: contatoData.atendente
          ? typeof contatoData.atendente === "string"
            ? {
                id: contatoData.atendente,
                nome: contatoData.atendente,
              }
            : {
                id:
                  contatoData.atendente.id ||
                  contatoData.atendente.usuarioId ||
                  contatoData.atendente.atendenteId ||
                  contatoData.atendente.responsavelId ||
                  contatoData.atendente.uuid ||
                  contatoData.atendente.email ||
                  contatoData.atendente.nome,
                nome:
                  contatoData.atendente.nome ||
                  contatoData.atendente.name ||
                  contatoData.atendente.fullName ||
                  contatoData.atendente.email ||
                  "Atendente",
              }
          : undefined,
        kanbanBoard: (() => {
          const board = contatoData.kanbanBoard;
          if (!board) return undefined;
          if (typeof board === "string") {
            return { id: board, nome: board };
          }
          return {
            id:
              board.id ||
              board.quadro_id ||
              board.kanbanId ||
              board.quadroId ||
              board.uuid,
            nome: board.nome || board.name || board.titulo || "Quadro",
          };
        })(),
        rating:
          contatoData.rating ||
          (Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 4 : undefined), // 4-5 estrelas às vezes

        // Kanban - buscar dados reais do contato
        kanbanStatus: kanbanStatusFromContato || undefined,

        // Fila - buscar dados reais do contato
        fila: contatoData.fila
          ? {
              id: contatoData.fila.id,
              nome: contatoData.fila.nome,
              cor: contatoData.fila.cor || "#9333ea",
            }
          : undefined,

        // Ticket Status - buscar do primeiro ticket ativo
        ticketStatus:
          contatoData.tickets?.length > 0
            ? {
                id: contatoData.tickets[0].status,
                nome:
                  contatoData.tickets[0].status === "ABERTO"
                    ? "Aberto"
                    : contatoData.tickets[0].status === "ANDAMENTO"
                      ? "Em Andamento"
                      : "Encerrado",
                cor:
                  contatoData.tickets[0].status === "ABERTO"
                    ? "#F59E0B"
                    : contatoData.tickets[0].status === "ANDAMENTO"
                      ? "#3B82F6"
                      : "#10B981",
              }
            : undefined,

        // Estados de conexão (mock por enquanto)
        isOnline: Math.random() > 0.7,
        connectionStatus: ["connected", "disconnected", "connecting"][
          Math.floor(Math.random() * 3)
        ] as "connected" | "disconnected" | "connecting",

        // Chat Lead Status (buscar dados reais do batch)
        chatLeadStatus: (() => {
          const leadData = chatLeads[chat.id] || contatoData.chatLead;
          if (chat.name && chat.name.includes('Paul')) {
            console.log('🔍 [LEAD DATA]', {
              chatId: chat.id,
              chatName: chat.name,
              leadData,
              chatLeadsHasData: !!chatLeads[chat.id],
              contatoDataHasLead: !!contatoData.chatLead
            });
          }
          return leadData;
        })(),
        
        // Nome do responsável (buscar do chatLeadStatus)
        nomeResponsavel: (() => {
          const leadData = chatLeads[chat.id] || contatoData.chatLead;
          return leadData?.responsavelUser?.nome || '';
        })(),

        // Agente IA ativo (usar do chatLeads que já busca isso)
        hasActiveAgent:
          chatLeads[chat.id]?.hasActiveAgent || agentesAtivos.has(chat.id),

        // Estados de favorito, arquivado, oculto
        isFavorite: favoriteChats.has(chat.id),
        isArchived: archivedChats.has(chat.id),
        isHidden: hiddenChats.has(chat.id),
      };
    });

    // Aplicar filtros baseados no activeFilter
    console.log('🔍 [ACTIVE FILTER] Filtro ativo:', activeFilter, '| Total de chats:', result.length);
    
    switch (activeFilter) {
      case "unread":
        result = result.filter((chat) => (chat.unreadCount || 0) > 0);
        break;
      case "read":
        result = result.filter((chat) => (chat.unreadCount || 0) === 0);
        break;
      case "read-no-reply":
        result = result.filter(
          (chat) => (chat.unreadCount || 0) === 0 && !chat.lastMessage?.fromMe,
        );
        break;
      case "favorites":
        result = result.filter((chat) => favoriteChats.has(chat.id));
        break;
      case "archived":
        result = result.filter((chat) => archivedChats.has(chat.id));
        break;
      case "groups":
        result = result.filter((chat) => chat.id?.includes("@g.us"));
        break;
      case "hidden":
        result = result.filter((chat) => hiddenChats.has(chat.id));
        break;
      case "em_atendimento":
        result = result.filter((chat) => {
          const leadStatus = chat.chatLeadStatus?.status?.toLowerCase();
          const hasResponsavel = !!chat.chatLeadStatus?.responsavel;

          // Mesma lógica do contador (linha 1199-1211)
          if (
            leadStatus === "em_atendimento" ||
            leadStatus === "atendimento" ||
            leadStatus === "em_atendimento_sem_responsavel"
          ) {
            return true;
          } else if (hasResponsavel && !leadStatus) {
            return true; // Tem responsável mas sem status = em atendimento
          }
          return false;
        });
        break;
      case "aguardando":
        result = result.filter((chat) => {
          const leadStatus = chat.chatLeadStatus?.status?.toLowerCase();
          const hasResponsavel = !!chat.chatLeadStatus?.responsavel;

          // Mesma lógica do contador
          if (leadStatus === "aguardando" || leadStatus === "pendente") {
            return true;
          } else if (!hasResponsavel && !leadStatus) {
            return true; // Sem responsável nem status = aguardando
          } else if (
            leadStatus === "em_atendimento" ||
            leadStatus === "atendimento" ||
            leadStatus === "finalizado" ||
            leadStatus === "concluido"
          ) {
            return false; // Já está em outro status
          }
          return false;
        });
        break;
      case "finalizado":
        result = result.filter((chat) => {
          const chatLeadStatus = chat.chatLeadStatus?.status?.toLowerCase();
          return (
            chatLeadStatus === "finalizado" || chatLeadStatus === "concluido"
          );
        });
        break;
      case "agentes_ia":
        // Filtrar chats que têm agente IA ativo
        result = result.filter((chat) => {
          const leadData = chatLeads[chat.id];
          return leadData?.hasActiveAgent === true || chat.hasActiveAgent === true;
        });
        break;
      case "leads_quentes":
        result = result.filter((chat) => {
          // Lead quente: tem rating alto OU tem tags OU tem agendamentos próximos
          return (
            (chat.rating && chat.rating >= 4) ||
            (chat.tags && chat.tags.length > 0) ||
            (chat.agendamentos && chat.agendamentos.length > 0)
          );
        });
        break;
      case "all":
      default:
        // Para 'all', filtrar chats ocultos e arquivados (não mostrar)
        result = result.filter(
          (chat) => !hiddenChats.has(chat.id) && !archivedChats.has(chat.id),
        );
        break;
    }

    // Aplicar filtros avançados selecionados

    // Filtro por tags (múltipla seleção tem prioridade sobre seleção única)
    if (selectedTagsMulti.length > 0) {
      console.log('🏷️ [FILTRO TAGS] Filtrando por tags:', selectedTagsMulti);
      console.log('🏷️ [FILTRO TAGS] Total de chats antes:', result.length);
      
      // 🔍 DEBUG: Ver tags de TODOS os chats
      result.forEach((chat, index) => {
        if (index < 3) { // Mostrar apenas os 3 primeiros
          const chatTags = chat.tags || [];
          console.log(`🔍 [FILTRO TAGS] Chat ${index + 1}: "${chat.name}"`);
          console.log('  Tags do chat:', chatTags);
          console.log('  IDs das tags:', chatTags.map((t: any) => t.id));
          console.log('  Tag procurada:', selectedTagsMulti[0]);
        }
      });
      
      result = result.filter((chat) => {
        const chatTags = chat.tags || [];
        const hasTag = Array.isArray(chatTags) && chatTags.some((tag: any) => selectedTagsMulti.includes(tag.id));
        
        if (hasTag) {
          console.log('✅ [FILTRO TAGS] Chat permitido:', chat.name, 'Tags:', chatTags.map((t: any) => t.nome));
        }
        
        return hasTag;
      });
      
      console.log('🏷️ [FILTRO TAGS] Total de chats após:', result.length);
    } else if (selectedTag && selectedTag !== "todas") {
      result = result.filter((chat) => {
        const hasTag = chat.tags?.some((tag: any) => tag.id === selectedTag);
        return hasTag;
      });
    }

    // Filtro por filas (múltipla seleção)
    if (selectedFilasMulti.length > 0) {
      result = result.filter((chat) => {
        // 🎯 BUSCAR FILA DO CHAT_LEAD (banco de dados)
        const filaId = chatLeads[chat.id]?.fila_id;
        return filaId ? selectedFilasMulti.includes(filaId) : false;
      });
    } else if (selectedFila && selectedFila !== "todas") {
      result = result.filter((chat) => {
        // 🎯 BUSCAR FILA DO CHAT_LEAD (banco de dados)
        const filaId = chatLeads[chat.id]?.fila_id;
        return filaId === selectedFila;
      });
    }

    // Filtro por atendentes associados
    if (selectedAtendentes.length > 0) {
      result = result.filter((chat) => {
        const atendenteId = chat.atendente?.id
          ? String(chat.atendente.id)
          : undefined;
        const atendenteNome = chat.atendente?.nome
          ? String(chat.atendente.nome)
          : undefined;
        const responsavel = chat.chatLeadStatus?.responsavel;
        const responsavelId = responsavel ? String(responsavel) : undefined;

        return (
          (atendenteId && selectedAtendentes.includes(atendenteId)) ||
          (atendenteNome && selectedAtendentes.includes(atendenteNome)) ||
          (responsavelId && selectedAtendentes.includes(responsavelId))
        );
      });
    }

    // Filtro por quadros do Kanban
    if (selectedQuadrosMulti.length > 0) {
      result = result.filter((chat) => {
        const quadroId =
          chat.kanbanBoard?.id ||
          chat.chatLeadStatus?.quadro_id ||
          chat.kanbanStatus?.quadro;
        return quadroId
          ? selectedQuadrosMulti.includes(String(quadroId))
          : false;
      });
    }

    // Filtro por colunas específicas do Kanban
    if (selectedKanbanColunas.length > 0) {
      console.log('[FILTRO KANBAN COLUNAS] Filtrando por colunas:', selectedKanbanColunas);
      console.log('[FILTRO KANBAN COLUNAS] Total de chats antes do filtro:', result.length);
      
      result = result.filter((chat) => {
        const colunaId = chat.kanbanStatus?.id;
        const match = colunaId
          ? selectedKanbanColunas.includes(String(colunaId))
          : false;
        
        if (match) {
          console.log('[FILTRO KANBAN COLUNAS] Chat matched:', {
            chatId: chat.id,
            colunaId,
            kanbanStatus: chat.kanbanStatus
          });
        }
        
        return match;
      });
      
      console.log('[FILTRO KANBAN COLUNAS] Total de chats após filtro:', result.length);
    }

    // Filtro por status kanban específico
    if (selectedKanbanStatus && selectedKanbanStatus !== "todos") {
      result = result.filter((chat) => {
        const hasKanban = chat.kanbanStatus?.id === selectedKanbanStatus;
        return hasKanban;
      });
    }

    // Filtro por status de ticket específico
    if (selectedTicketStatus && selectedTicketStatus !== "todos") {
      result = result.filter(
        (chat) => chat.ticketStatus?.id === selectedTicketStatus,
      );
    }

    // Filtro por prioridade de tickets
    if (selectedTicketPriorities.length > 0) {
      result = result.filter((chat) => {
        const tickets = Array.isArray(chat.tickets) ? chat.tickets : [];

        if (tickets.length === 0) {
          return selectedTicketPriorities.includes("sem_prioridade");
        }

        return tickets.some((ticket: any) => {
          const prioridade = (ticket.prioridade || "").toLowerCase();
          if (!prioridade) {
            return selectedTicketPriorities.includes("sem_prioridade");
          }
          return selectedTicketPriorities.includes(prioridade);
        });
      });
    }

    // Filtro por faixa de preço (orçamentos)
    if (selectedPriceRange && selectedPriceRange !== "todos") {
      // TODO: Implementar quando tivermos dados de orçamentos com valores
    }

    return result;
  }, [
    transformedChats,
    contatosData,
    favoriteChats,
    archivedChats,
    hiddenChats,
    activeFilter,
    selectedTag,
    selectedTagsMulti,
    selectedFila,
    selectedFilasMulti,
    selectedAtendentes,
    selectedQuadrosMulti,
    selectedKanbanColunas,
    selectedTicketPriorities,
    selectedKanbanStatus,
    selectedTicketStatus,
    selectedPriceRange,
    chatLeads, // 🤖 Adicionar para filtro de agentes IA funcionar
  ]);

  // Calcular contadores para os novos filtros (baseado em dados visíveis)
  const chatCounters = useMemo(() => {
    
    const counts = {
      emAtendimento: 0,
      aguardando: 0,
      finalizado: 0,
      agentesIA: 0,
      leadsQuentes: 0,
    };

    // Contar apenas chats VISÍVEIS (excluir ocultos e arquivados, assim como o filtro 'all')
    const chatsToCount = transformedChats.filter(
      (chat) => !hiddenChats.has(chat.id) && !archivedChats.has(chat.id),
    );
    

    chatsToCount.forEach((chat: any) => {
      // 🔥 BUSCAR DIRETO DO chatLeads ao invés de chat.chatLeadStatus
      const leadData = chatLeads[chat.id] || contatosData[chat.id]?.chatLead;
      const leadStatus = leadData?.status?.toLowerCase();
      const hasResponsavel = !!leadData?.responsavel;

      // Lógica de contagem melhorada
      if (
        leadStatus === "em_atendimento" ||
        leadStatus === "atendimento" ||
        leadStatus === "em atendimento" ||
        leadStatus === "em_atendimento_sem_responsavel"
      ) {
        counts.emAtendimento++;
      } else if (
        leadStatus === "finalizado" || 
        leadStatus === "concluido" ||
        leadStatus === "concluído"
      ) {
        counts.finalizado++;
      } else if (
        leadStatus === "aguardando" || 
        leadStatus === "pendente" ||
        leadStatus === "novo"
      ) {
        counts.aguardando++;
      } else if (hasResponsavel && !leadStatus) {
        // Se tem responsável mas sem status explícito, está em atendimento
        counts.emAtendimento++;
      } else if (!leadStatus) {
        // Se não tem status nenhum, está aguardando
        counts.aguardando++;
      }

      // Contar agentes IA ativos
      if (leadData?.hasActiveAgent === true) {
        counts.agentesIA++
      }

      // Contar leads quentes
      const isHotLead =
        (chat.rating && chat.rating >= 4) ||
        (chat.tags && chat.tags.length > 0) ||
        (chat.agendamentos && chat.agendamentos.length > 0) ||
        (chat.unreadCount && chat.unreadCount > 5);

      if (isHotLead) {
        counts.leadsQuentes++;
      }
    });

    return counts;
  }, [transformedChats, contatosData, hiddenChats, archivedChats, chatLeads, minhasFilasIds, chatsExtraData]);

  // Expor funções para testes no console (só uma vez)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // TODO: Implementar funções de marcar como lido/não lido

      // Função para testar API da WAHA diretamente
      (window as any).testWahaAPI = async () => {
        try {
          const response = await fetch(
            "http://159.65.34.199:3001/api/user_fb8da1d7_1758158816675/chats/overview?limit=5&offset=0",
            {
              headers: { "X-Api-Key": "tappyone-waha-2024-secretkey" },
            },
          );
          const data = await response.json();

          // Procurar qualquer campo relacionado a unread
          data.forEach((chat: any, i: number) => {
            const unreadFields = Object.keys(chat).filter(
              (key) =>
                key.toLowerCase().includes("unread") ||
                key.toLowerCase().includes("read") ||
                key.toLowerCase().includes("count"),
            );
          });
        } catch {}
      };
    }
  }, []); // Removido overviewChats da dependência

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Topbar */}
      <div className="flex-shrink-0">
        <AtendimentosTopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Container principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Esquerda - Filtros + Chats */}
        <div className="w-[32rem] flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
          {/* Filtros */}
          <div className="flex-shrink-0">
            <SideFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTag={selectedTag}
              onTagChange={setSelectedTag}
              tags={realTags}
              selectedFila={selectedFila}
              onFilaChange={setSelectedFila}
              filas={realFilas}
              selectedFilasMulti={selectedFilasMulti}
              onFilasMultiChange={setSelectedFilasMulti}
              // ✅ Filtro de conexões
              selectedConexoes={selectedConexoes}
              onConexoesChange={setSelectedConexoes}
              // ✅ Filtro de tags múltiplas
              selectedTagsMulti={selectedTagsMulti}
              onTagsMultiChange={setSelectedTagsMulti}
              selectedAtendentes={selectedAtendentes}
              onAtendentesChange={setSelectedAtendentes}
              selectedQuadrosMulti={selectedQuadrosMulti}
              onQuadrosMultiChange={setSelectedQuadrosMulti}
              selectedKanbanColunas={selectedKanbanColunas}
              onKanbanColunasChange={setSelectedKanbanColunas}
              selectedTicketsMulti={selectedTicketPriorities}
              onTicketsMultiChange={setSelectedTicketPriorities}
              // Estados de loading dos filtros avançados
              isLoadingTags={false}
              isLoadingFilas={loadingMinhasFilas}
              isLoadingKanban={false}
              isLoadingTickets={false}
              isLoadingAtendentes={false}
              // Dados dos filtros avançados
              kanbanStatuses={realKanbanStatuses}
              ticketStatuses={realTicketStatuses}
              priceRanges={realPriceRanges}
              selectedKanbanStatus={selectedKanbanStatus}
              onKanbanStatusChange={setSelectedKanbanStatus}
              selectedTicketStatus={selectedTicketStatus}
              onTicketStatusChange={setSelectedTicketStatus}
              selectedPriceRange={selectedPriceRange}
              onPriceRangeChange={setSelectedPriceRange}
              // Dados para contadores das tabs
              conversations={processedChats}
              totalChats={totalChatsCount} // Total real da WAHA
              unreadChats={unreadChatsCount} // Total real de não lidas da WAHA
              readChats={readNoReplyCount} // Total real de lidas mas não respondidas da WAHA
              archivedChats={archivedChats.size}
              groupChats={groupChatsCount} // Total real de grupos da WAHA
              favoriteChats={favoriteChats.size}
              hiddenChats={hiddenChats.size}
              // Novos contadores
              emAtendimentoChats={chatCounters.emAtendimento}
              aguardandoChats={chatCounters.aguardando}
              finalizadoChats={chatCounters.finalizado}
              agentesIAChats={chatCounters.agentesIA}
              leadsQuentesChats={chatCounters.leadsQuentes}
              // Controle do filtro ativo
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              // Opções de busca
              searchOptions={searchOptions}
              onSearchOptionsChange={setSearchOptions}
              // Ordenação
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(newSortBy, newSortOrder) => {
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              // Debug info
              debugInfo={{
                totalChatsTransformados: transformedChats.length,
                chatLeadsCarregados: Object.keys(chatLeads).length,
                primeirosChatLeads: Object.entries(chatLeads)
                  .slice(0, 3)
                  .map(([id, lead]: any) => ({
                    status: lead?.status,
                    hasAgent: lead?.hasActiveAgent,
                  })),
              }}
            />
          </div>

          {/* Lista de Chats */}
          <div className="flex-1 overflow-hidden">
            <SideChat
              chats={processedChats}
              selectedChatId={selectedChatId}
              onSelectChat={(chatId) => {
                // Buscar o chat clicado
                const chat = processedChats.find(c => c.id === chatId)
                const status = chat?.chatLeadStatus?.status
                
                // Se está aguardando, mostrar modal de aceitar
                if (status === 'aguardando') {
                  setChatAguardando(chat)
                  setShowModalAceitar(true)
                  setSelectedChatId(chatId) // Seleciona mas fica borrado
                } else {
                  // Se já está em atendimento ou finalizado, abre normalmente
                  setSelectedChatId(chatId)
                  setModoEspiar(false)
                }
              }}
              isLoading={loadingOverview && activeFilter === "all"}
              onLoadMore={handleLoadMoreChats}
              hasMoreChats={(() => {
                // Para filtros específicos (favoritos, arquivados, ocultos, status, all), nunca há mais para carregar
                if (
                  ["all", "favorites", "archived", "hidden", "em_atendimento", "aguardando", "finalizado", "agentes_ia", "leads_quentes"].includes(activeFilter)
                ) {
                  return false;
                }

                // Se há filtros de busca, usar paginação local
                if (
                  searchQuery.trim() ||
                  selectedTag !== "todas" ||
                  selectedFila !== "todas" ||
                  selectedTagsMulti.length > 0 ||
                  selectedFilasMulti.length > 0 ||
                  selectedConexoes.length > 0 ||
                  selectedAtendentes.length > 0 ||
                  selectedQuadrosMulti.length > 0 ||
                  selectedKanbanColunas.length > 0 ||
                  selectedTicketPriorities.length > 0 ||
                  selectedKanbanStatus !== "todos" ||
                  selectedTicketStatus !== "todos" ||
                  selectedPriceRange !== "todos"
                ) {
                  const localHasMore =
                    displayedChatsCount < overviewChats.length;

                  return localHasMore;
                }

                // Se não há filtros, usar paginação real da API

                return hasMoreOverviewChats;
              })()}
              isLoadingMore={isLoadingMoreChats || isLoadingMoreOverview}
              onTagsClick={(chatId, e) => {
                e.stopPropagation();

                // TODO: Abrir modal de tags
              }}
              onTransferClick={(chatId, e) => {
                e.stopPropagation();

                setSelectedChatForTransfer(chatId);
                setShowTransferirModal(true);
              }}
              onToggleFavorite={toggleFavoriteChat}
              onToggleArchive={toggleArchiveChat}
              onToggleHidden={toggleHiddenChat}
              onDelete={deleteChat}
            />
          </div>
        </div>

        {/* Área Principal - Chat Completa */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {/* Header do Chat */}
          <ChatHeader
            chat={
              selectedChatId
                ? (() => {
                    const foundChat = processedChats.find(
                      (c) => c.id === selectedChatId,
                    );

                    return {
                      id: selectedChatId,
                      name: foundChat?.name || "Usuário",
                      avatar: foundChat?.avatar,
                      isOnline: foundChat?.isOnline || false,
                      lastSeen: foundChat?.lastMessage?.timestamp || Date.now(),
                      unreadCount: foundChat?.unreadCount,
                      chatLeadStatus: foundChat?.chatLeadStatus, // Passar dados do chat lead
                      nomeResponsavel: foundChat?.nomeResponsavel, // Passar nome do responsável já calculado
                    };
                  })()
                : undefined
            }
            selectedChatId={selectedChatId}
            onCallClick={() => undefined}
            onVideoClick={() => undefined}
            onMenuClick={() => undefined}
          />

          {/* Área de Mensagens */}
          <div className={`relative ${
            selectedChatId && 
            processedChats.find(c => c.id === selectedChatId)?.chatLeadStatus?.status === 'aguardando' && 
            !modoEspiar
              ? 'blur-sm pointer-events-none'
              : ''
          }`}>
            <ChatArea
              messages={modoEspiar ? displayMessages.slice(-5) : displayMessages}
            isLoading={loadingMessages}
            hasMore={hasMoreMessages}
            totalMessages={totalMessages}
            onLoadMore={loadMoreMessages}
            selectedChat={
              selectedChatId
                ? {
                    id: selectedChatId,
                    name:
                      processedChats.find((c) => c.id === selectedChatId)
                        ?.name || "Usuário",
                  }
                : undefined
            }
            onReply={(messageId) => {
              const message = displayMessages.find((m) => m.id === messageId);
              if (message) {
                setReplyingTo({
                  messageId: message.id,
                  content: message.content,
                  sender:
                    message.sender === "user"
                      ? processedChats.find((c) => c.id === selectedChatId)
                          ?.name || "Usuário"
                      : "Você",
                });
              }
            }}
            onForward={(messageId) => {
              setForwardingMessage(messageId);
              setShowForwardModal(true);
            }}
            onReaction={async (messageId, emoji) => {
              if (!selectedChatId) return;
              const sessionName = await getActiveSessionName();
              if (!sessionName) return;

              // API correta da WAHA para reações!
              fetch(getWahaUrl("/api/reaction"), {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  messageId: messageId,
                  reaction: emoji,
                  session: sessionName,
                }),
              })
                .then(async (response) => {
                  if (response.ok) {
                    const result = await response.json();

                    setTimeout(() => refreshMessages(), 500);
                  } else {
                    const errorData = await response.json().catch(() => null);
                  }
                })
                .catch((error) => undefined);
            }}
            onTranslate={(messageId, translatedText) => {
              if (translatedText) {
                setTranslatedMessages((prev) => ({
                  ...prev,
                  [messageId]: translatedText,
                }));
              }
            }}
            onAIReply={async (messageId, content) => {
              // Enviar mensagem traduzida diretamente
              if (selectedChatId && content.trim()) {
                try {
                  const wahaUrl = getWahaUrl(
                    `/api/user_fb8da1d7_1758158816675/chats/${selectedChatId}/messages/text`,
                  );

                  const response = await fetch(wahaUrl, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      text: content,
                    }),
                  });

                  if (response.ok) {
                    // Atualizar mensagens
                    refreshMessages();
                  }
                } catch {}
              }
            }}
          />
          </div>

          {/* Debug info para mensagens */}
          {messagesError && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ Erro ao carregar mensagens: {messagesError}
              </p>
            </div>
          )}

          {/* Footer - Input de Mensagem */}
          <FooterChatArea
            onStartTyping={async () => {
              if (!selectedChatId) return;
              const sessionName = await getActiveSessionName();
              if (!sessionName) return;
              // Usar API WAHA para mostrar "digitando..."
              fetch(getWahaUrl("/api/startTyping"), {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  session: sessionName,
                  chatId: selectedChatId,
                }),
              }).then(() => undefined);
            }}
            onStopTyping={async () => {
              if (!selectedChatId) return;
              const sessionName = await getActiveSessionName();
              if (!sessionName) return;
              // Usar API WAHA para parar "digitando..."
              fetch(getWahaUrl("/api/stopTyping"), {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  session: sessionName,
                  chatId: selectedChatId,
                }),
              }).then(() => undefined);
            }}
            onMarkAsSeen={async (messageId) => {
              if (!selectedChatId) return;
              const sessionName = await getActiveSessionName();
              if (!sessionName) return;
              // Usar API WAHA para marcar como vista (✓✓ azul)
              fetch(getWahaUrl("/api/sendSeen"), {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  session: sessionName,
                  chatId: selectedChatId,
                  messageId: messageId,
                }),
              }).then(() => undefined);
            }}
            onAgentClick={() => setShowAgenteModal(true)}
            onIAClick={() => setShowEditTextModal(true)}
            onRespostaRapidaClick={() => {
              setShowQuickActionsSidebar(true);
            }}
            onSendAudio={() => setShowAudioModal(true)}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            onSendMessage={async (content) => {
              if (!selectedChatId) return;
              const sessionName = await getActiveSessionName();
              if (!sessionName) return;
              // Usar API WAHA para enviar texto
              fetch(getWahaUrl("/api/sendText"), {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  session: sessionName,
                  chatId: selectedChatId,
                  text: content,
                  reply_to: replyingTo?.messageId || null,
                  linkPreview: true,
                  linkPreviewHighQuality: false,
                }),
              })
                .then(async (response) => {
                  if (response.ok) {
                    const result = await response.json();

                    // Limpar reply após enviar
                    setReplyingTo(null);

                    // Recarregar mensagens imediatamente (sem reload da página)
                    setTimeout(() => refreshMessages(), 500);
                  } else {
                    const errorData = await response.json().catch(() => null);
                  }
                })
                .catch((error) => undefined);
            }}
            onSendPoll={async (pollData) => {
              if (!selectedChatId) return;
              const sessionName = await getActiveSessionName();
              if (!sessionName) return;
              // Usar API WAHA para enviar enquete
              fetch(getWahaUrl("/api/sendPoll"), {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  session: sessionName,
                  chatId: selectedChatId,
                  poll: pollData,
                }),
              }).then(() => undefined);
            }}
            onSendList={async (listData) => {
              if (!selectedChatId) return;
              const sessionName = await getActiveSessionName();
              if (!sessionName) return;

              // Usar API WAHA para enviar lista/menu - formato correto da documentação
              fetch(getWahaUrl("/api/sendList"), {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  chatId: selectedChatId,
                  session: sessionName,
                  message: listData, // Envolver em 'message' como a API espera
                  reply_to: null,
                }),
              })
                .then(async (response) => {
                  if (response.ok) {
                    const result = await response.json();

                    setTimeout(() => refreshMessages(), 500);
                  } else {
                    const errorData = await response.json().catch(() => null);
                  }
                })
                .catch(() => undefined);
            }}
            onSendEvent={async (eventData) => {
              if (!selectedChatId) return;
              const sessionName = await getActiveSessionName();
              if (!sessionName) return;
              // Usar API WAHA para enviar evento
              fetch(getWahaUrl(`/api/${sessionName}/events`), {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  chatId: selectedChatId,
                  event: eventData,
                }),
              }).then(() => undefined);
            }}
            onSendMedia={async (
              file: File,
              caption: string,
              mediaType: "image" | "video" | "document",
            ) => {
              if (!selectedChatId || !file) return;

              try {
                // Converter arquivo para base64
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                  reader.onloadend = () => {
                    const base64 = reader.result as string;
                    resolve(base64.split(",")[1]); // Remove o prefixo data:...
                  };
                });
                reader.readAsDataURL(file);
                const base64Data = await base64Promise;

                // Determinar mimetype
                let mimetype = file.type || "application/octet-stream";

                const sessionName = await getActiveSessionName();
                if (!sessionName) return;

                // Preparar payload JSON
                const payload = {
                  session: sessionName,
                  chatId: selectedChatId,
                  file: {
                    data: base64Data,
                    mimetype: mimetype,
                    filename: file.name,
                  },
                };

                if (caption?.trim()) {
                  payload["caption"] = caption.trim();
                }

                // Determinar endpoint baseado no tipo
                let endpoint = "/api/sendFile";
                if (mediaType === "image") {
                  endpoint = "/api/sendImage";
                } else if (mediaType === "video") {
                  endpoint = "/api/sendVideo";
                }

                const response = await fetch(getWahaUrl(endpoint), {
                  method: "POST",
                  headers: getAuthHeaders(),
                  body: JSON.stringify(payload),
                });

                if (response.ok) {
                  const result = await response.json();

                  setTimeout(() => refreshMessages(), 500);
                } else {
                  const errorData = await response.json().catch(() => null);
                }
              } catch {}
            }}
            onSendContact={async (contactsData) => {
              if (!selectedChatId) return;
              const sessionName = await getActiveSessionName();
              if (!sessionName) return;
              // Usar API WAHA para enviar contato
              fetch(getWahaUrl("/api/sendContactVcard"), {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  session: sessionName,
                  chatId: selectedChatId,
                  contacts: contactsData.contacts || [],
                }),
              })
                .then(async (response) => {
                  if (response.ok) {
                    setTimeout(() => refreshMessages(), 500);
                  } else {
                    const errorData = await response.json().catch(() => null);
                  }
                })
                .catch((error) => undefined);
            }}
            onSendLocation={async (locationData) => {
              if (!selectedChatId) return;
              const sessionName = await getActiveSessionName();
              if (!sessionName) return;
              // Usar API WAHA para enviar localização
              fetch(getWahaUrl("/api/sendLocation"), {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  session: sessionName,
                  chatId: selectedChatId,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  title: locationData.title || "Localização",
                  address: locationData.address || "",
                }),
              })
                .then(async (response) => {
                  if (response.ok) {
                    setTimeout(() => refreshMessages(), 500);
                  } else {
                    const errorData = await response.json().catch(() => null);
                  }
                })
                .catch((error) => undefined);
            }}
            selectedChat={
              selectedChatId
                ? {
                    id: selectedChatId,
                    name:
                      processedChats.find((c) => c.id === selectedChatId)
                        ?.name || "Usuário",
                  }
                : undefined
            }
          />
        </div>
      </div>

      {/* Modais */}
      {showAgenteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowAgenteModal(false)}
          />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Selecionar Agente IA</h3>
            <p className="text-gray-600 mb-4">
              Funcionalidade em desenvolvimento...
            </p>
            <button
              onClick={() => setShowAgenteModal(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showEditTextModal && (
        <EditTextModal
          isOpen={showEditTextModal}
          onClose={() => setShowEditTextModal(false)}
          initialText=""
          contactName={
            processedChats.find((c) => c.id === selectedChatId)?.name ||
            "Usuário"
          }
          actionTitle="Gerar com IA"
          onSend={async (message) => {
            // Enviar mensagem gerada pela IA
            if (selectedChatId) {
              const sessionName = await getActiveSessionName();
              if (!sessionName) return;
              fetch(getWahaUrl("/api/sendText"), {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                  session: sessionName,
                  chatId: selectedChatId,
                  text: message,
                }),
              }).then(() => {
                setTimeout(() => refreshMessages(), 500);
                setShowEditTextModal(false);
              });
            }
          }}
        />
      )}

      <QuickActionsSidebar
        isOpen={showQuickActionsSidebar}
        onClose={() => setShowQuickActionsSidebar(false)}
        activeChatId={selectedChatId}
        onSelectAction={(action) => {
          // Executar ação rápida selecionada

          setShowQuickActionsSidebar(false);
        }}
      />

      {/* Modal de Gravação de Áudio */}
      <AudioRecorderModal
        isOpen={showAudioModal}
        onClose={() => setShowAudioModal(false)}
        onSend={async (audioBlob) => {
          if (!selectedChatId) return;

          try {
            // Converter blob para base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
              reader.onloadend = () => {
                const base64 = reader.result as string;
                resolve(base64.split(",")[1]); // Remove o prefixo data:...
              };
            });
            reader.readAsDataURL(audioBlob);
            const base64Data = await base64Promise;

            const sessionName = await getActiveSessionName();
            if (!sessionName) return;

            // Preparar payload JSON para áudio
            const payload = {
              session: sessionName,
              chatId: selectedChatId,
              file: {
                data: base64Data,
                mimetype: "audio/webm",
                filename: "audio.webm",
              },
            };

            const response = await fetch(getWahaUrl("/api/sendVoice"), {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              const result = await response.json();

              setTimeout(() => refreshMessages(), 500);
              setShowAudioModal(false);
            } else {
              const errorData = await response.json().catch(() => null);

              alert("Erro ao enviar áudio. Tente novamente.");
            }
          } catch {
            alert("Erro de conexão. Verifique sua internet.");
          }
        }}
      />

      {/* Modal de Encaminhamento */}
      {showForwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowForwardModal(false)}
          />
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Encaminhar Mensagem</h3>
            <p className="text-gray-600 mb-4">
              Funcionalidade de encaminhamento em desenvolvimento...
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Mensagem ID: {forwardingMessage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (forwardingMessage && selectedChatId) {
                    const sessionName = await getActiveSessionName();
                    if (!sessionName) return;
                    // Implementar encaminhamento via WAHA
                    fetch(getWahaUrl("/api/forwardMessage"), {
                      method: "POST",
                      headers: getAuthHeaders(),
                      body: JSON.stringify({
                        session: sessionName,
                        messageId: forwardingMessage,
                        to: selectedChatId, // Por enquanto encaminha para o mesmo chat
                      }),
                    }).then(() => {
                      setShowForwardModal(false);
                      setTimeout(() => refreshMessages(), 500);
                    });
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Encaminhar
              </button>
              <button
                onClick={() => setShowForwardModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Transferir Atendimento */}
      <TransferirAtendimentoModal
        isOpen={showTransferirModal}
        onClose={() => {
          setShowTransferirModal(false);
          setSelectedChatForTransfer(null);
        }}
        onConfirm={handleTransferirSave}
        chatId={selectedChatForTransfer || undefined}
        contactData={{
          id: selectedChatForTransfer || "",
          nome:
            processedChats.find((c) => c.id === selectedChatForTransfer)
              ?.name || "",
          telefone: selectedChatForTransfer?.replace("@c.us", "") || "",
        }}
      />

      {/* 🚀 Botão Flutuante: Transferir Todos para "Sem Fila" - OCULTO (filas são atribuídas automaticamente) */}
      {false && <button
        onClick={async () => {
          const token = localStorage.getItem('token');
          
          // 1. Buscar a fila "Sem fila"
          const filasResponse = await fetch('/api/filas', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const filasData = await filasResponse.json();
          const filas = filasData.data || filasData;
          const filaSemFila = filas.find((f: any) => f.nome.toLowerCase().includes('sem fila'));
          
          if (!filaSemFila) {
            alert('❌ Fila "Sem fila" não encontrada! Crie a fila primeiro.');
            return;
          }
          
          if (!confirm(`⚠️ Isso vai transferir TODOS os chats para a fila "${filaSemFila.nome}". Continuar?`)) return;
          
          const filaId = filaSemFila.id;
          
          try {
            // Buscar todos os chats
            const response = await fetch('/api/whatsapp/chats', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            const chats = data.data || data.chats || data;
            
            let count = 0;
            for (const chat of chats) {
              const chatId = chat.id?._serialized || chat.id;
              
              // Transferir para a fila
              await fetch(`/api/chats/${encodeURIComponent(chatId)}/transferir`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  novoResponsavelId: '',
                  novaFilaId: filaId,
                  motivo: 'Transferência automática para Sem Fila'
                })
              });
              
              count++;
              if (count % 10 === 0) {
                console.log(`✅ ${count}/${chats.length} chats transferidos...`);
              }
            }
            
            alert(`✅ ${count} chats transferidos com sucesso!`);
            window.location.reload();
          } catch (error) {
            alert(`❌ Erro: ${error}`);
          }
        }}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-2 z-50 font-semibold"
        title="Transferir todos os chats sem fila para a fila Suporte"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Transferir Todos
      </button>}

      {/* Modal de Aceitar Atendimento */}
      <ModalAceitarAtendimento
        isOpen={showModalAceitar}
        chatName={chatAguardando?.name || 'Cliente'}
        onAceitar={async () => {
          if (!chatAguardando?.id) {
            console.error('❌ Chat aguardando não encontrado')
            return
          }
          
          console.log('🎯 [ACEITAR] Iniciando aceitação do chat:', chatAguardando.id)
          
          const token = localStorage.getItem('token')
          if (!token) {
            console.error('❌ Token não encontrado')
            return
          }
          
          // Usar ID do usuário do hook useAuth
          const atendenteId = user?.id
          
          if (!atendenteId) {
            console.error('❌ ID do usuário não encontrado')
            alert('Erro: Não foi possível identificar o usuário. Faça login novamente.')
            return
          }
          
          console.log('👤 [ACEITAR] Atendente ID:', atendenteId)
          console.log('📋 [ACEITAR] Fila ID:', chatAguardando?.chatLeadStatus?.fila_id)
          
          try {
            // Aceitar atendimento (muda status para 'atendimento' e define responsavel)
            const response = await fetch(`/api/chats/${encodeURIComponent(chatAguardando.id)}/aceitar`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                responsavelId: atendenteId,
                filaId: chatAguardando?.chatLeadStatus?.fila_id || ''
              })
            })
            
            console.log('📡 [ACEITAR] Response status:', response.status)
            
            if (!response.ok) {
              const errorData = await response.json()
              console.error('❌ [ACEITAR] Erro do backend:', errorData)
              throw new Error('Erro ao aceitar atendimento')
            }
            
            const result = await response.json()
            console.log('✅ [ACEITAR] Resposta do backend:', result)
            
            // Selecionar o chat para mostrar o ChatArea
            setSelectedChatId(chatAguardando.id)
            
            // Recarregar dados do chat e atualizar lista
            refreshMessages()
            setModoEspiar(false)
            
            // Forçar reload da página para atualizar todos os dados
            setTimeout(() => {
              window.location.reload()
            }, 500)
            
            console.log('✅ Atendimento aceito com sucesso!')
          } catch (error) {
            console.error('❌ Erro ao aceitar atendimento:', error)
            alert('Erro ao aceitar atendimento. Tente novamente.')
          }
        }}
        onRecusar={async () => {
          if (!chatAguardando?.id) {
            console.error('❌ Chat aguardando não encontrado')
            return
          }
          
          console.log('🚫 [RECUSAR] Iniciando recusa do chat:', chatAguardando.id)
          
          const token = localStorage.getItem('token')
          if (!token) {
            console.error('❌ Token não encontrado')
            return
          }
          
          try {
            const response = await fetch(`/api/chats/${encodeURIComponent(chatAguardando.id)}/recusar`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            console.log('📡 [RECUSAR] Response status:', response.status)
            
            if (!response.ok) {
              const errorData = await response.json()
              console.error('❌ [RECUSAR] Erro do backend:', errorData)
              throw new Error('Erro ao recusar atendimento')
            }
            
            const result = await response.json()
            console.log('✅ [RECUSAR] Resposta do backend:', result)
            
            setSelectedChatId(undefined)
            
            setTimeout(() => {
              window.location.reload()
            }, 500)
            
            console.log('✅ Atendimento recusado com sucesso!')
          } catch (error) {
            console.error('❌ Erro ao recusar atendimento:', error)
            alert('Erro ao recusar atendimento. Tente novamente.')
          }
        }}
        onEspiar={() => {
          // Selecionar o chat para mostrar o ChatArea
          setSelectedChatId(chatAguardando?.id)
          
          // Ativar modo espiar (mostra últimas 5 mensagens, bloqueia scroll)
          setModoEspiar(true)
          console.log('👁️ Modo espiar ativado - últimas 5 mensagens')
          
          // Após 5 segundos, borrar novamente e reabrir modal
          setTimeout(() => {
            setModoEspiar(false)
            setShowModalAceitar(true)
            console.log('⏰ Tempo de espiar acabou - reabrindo modal')
          }, 5000)
        }}
        onClose={() => {
          setShowModalAceitar(false)
          if (modoEspiar) {
            // Se está espiando, mantém selecionado
          } else {
            // Se não aceitou nem espiou, desseleciona
            setSelectedChatId(undefined)
          }
        }}
      />
    </div>
  );
}

export default AtendimentoPage;
