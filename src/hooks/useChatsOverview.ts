"use client";

import { useState, useEffect } from "react";

interface ChatOverview {
  id: string;
  name: string;
  image?: string;
  sessionName?: string; // 🔥 CRÍTICO: Identificador da conexão WhatsApp
  lastMessage?: {
    id: string;
    body: string;
    timestamp: number;
    fromMe: boolean;
    type: string;
    hasMedia: boolean;
  };
  unreadCount?: number;
  contact?: {
    id: string;
    name: string;
    pushname?: string;
    profilePicUrl?: string;
  };
}

interface UseChatsOverviewReturn {
  chats: ChatOverview[];
  loading: boolean;
  error: string | null;
  refreshChats: () => void;
  loadMoreChats: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
  markChatAsRead: (chatId: string) => Promise<void>;
  markChatAsUnread: (chatId: string) => Promise<boolean>;
  totalChatsCount: number;
  unreadChatsCount: number;
  readNoReplyCount: number;
  groupChatsCount: number;
}

export default function useChatsOverview(): UseChatsOverviewReturn {
  const [chats, setChats] = useState<ChatOverview[]>([]);
  const [loading, setLoading] = useState(true); // ✅ Começar com loading=true
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalChatsCount, setTotalChatsCount] = useState(0);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [readNoReplyCount, setReadNoReplyCount] = useState(0);
  const [groupChatsCount, setGroupChatsCount] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const fetchChatsOverview = async (limit = 10, offset = 0, append = false) => {
    try {
      setLoading(true);
      setError(null);

      // Detectar se estamos em produção HTTPS
      const isProduction =
        typeof window !== "undefined" && window.location.protocol === "https:";

      // Usar proxy em produção, direto em desenvolvimento
      const baseUrl = isProduction
        ? "/api/waha-proxy"
        : "http://159.65.34.199:3001";

      // ✅ BUSCAR DE TODAS AS CONEXÕES ATIVAS
      // Buscar lista de sessões ativas

      const sessionsResponse = await fetch(`${baseUrl}/api/sessions`, {
        headers: {
          "X-Api-Key": "tappyone-waha-2024-secretkey",
        },
      });

      if (!sessionsResponse.ok) {
        throw new Error(`Erro ao buscar sessões: ${sessionsResponse.status}`);
      }

      const sessions = await sessionsResponse.json();

      // Buscar chats de todas as sessões em paralelo
      const allChatsPromises = sessions.map(async (session: any) => {
        try {
          const response = await fetch(
            `${baseUrl}/api/${session.name}/chats/overview?limit=${limit}&offset=${offset}`,
            {
              headers: {
                "X-Api-Key": "tappyone-waha-2024-secretkey",
              },
            },
          );

          if (!response.ok) {
            return [];
          }

          const data = await response.json();

          // ✅ CRÍTICO: Adicionar sessionName em cada chat
          const rawChats = data.chats || data || [];

          const chatsComSession = rawChats.map((chat: any) => {
            const chatComSession = {
              ...chat,
              sessionName: session.name, // Marcar de qual sessão veio
            };
            return chatComSession;
          });

          return chatsComSession;
        } catch (err) {
          return [];
        }
      });

      const allChatsArrays = await Promise.all(allChatsPromises);
      const allChats = allChatsArrays.flat();

      // Se retornou menos que o limit, não há mais páginas
      const noMorePages = allChats.length < limit;
      setHasMore(!noMorePages);
      // Transformar dados da WAHA para formato interno
      const transformedChats: ChatOverview[] = allChats.map((chat: any) => {
        return {
          id: chat.id,
          name:
            chat.name ||
            chat.contact?.name ||
            chat.contact?.pushname ||
            "Usuário",
          image: chat.contact?.profilePicUrl || chat.profilePicUrl || null,
          sessionName: chat.sessionName, // 🔥 CRÍTICO: Preservar sessionName na transformação
          lastMessage: chat.lastMessage
            ? {
                id: chat.lastMessage.id,
                body: (() => {
                  const body =
                    chat.lastMessage.body ||
                    getMessageTypeDescription(chat.lastMessage);
                  return body;
                })(),
                timestamp: chat.lastMessage.timestamp * 1000, // Converter para ms
                fromMe: chat.lastMessage.fromMe,
                type: chat.lastMessage.type || "text",
                hasMedia: chat.lastMessage.hasMedia || false,
              }
            : undefined,
          unreadCount: (() => {
            // Usar lógica ultra restritiva: APENAS ack=2 (entregue)
            if (!chat.lastMessage || chat.lastMessage.fromMe) return undefined;
            const isUnread = chat.lastMessage.ack === 2;
            return isUnread ? 1 : undefined; // Retorna 1 se não lida, undefined se lida
          })(),
          contact: chat.contact
            ? {
                id: chat.contact.id,
                name: chat.contact.name,
                pushname: chat.contact.pushname,
                profilePicUrl: chat.contact.profilePicUrl,
              }
            : undefined,
        };
      });

      // Se append = true, adicionar aos chats existentes, senão substituir
      setChats((prevChats) => {
        if (append) {
          // Evitar duplicatas - filtrar chats que já existem
          const existingIds = new Set(prevChats.map((chat) => chat.id));
          const newUniqueChats = transformedChats.filter(
            (chat) => !existingIds.has(chat.id),
          );

          // NÃO ordenar - manter ordem da API para paginação correta
          const newChats = [...prevChats, ...newUniqueChats];
          return newChats;
        } else {
          // Para carregamento inicial, manter ordem da API (já vem ordenado)
          return transformedChats;
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar mais chats (próxima página)
  const loadMoreChats = async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      await fetchChatsOverview(10, chats.length, true); // append = true
    } catch {
    } finally {
      setIsLoadingMore(false);
    }
  };

  const refreshChats = () => {
    fetchChatsOverview();
  };

  // Função para buscar totais de chats (total e não lidos)
  const fetchTotalChatsCount = async () => {
    try {
      // Buscar sessão ativa via nossa API de conexões
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ Token não encontrado')
        return
      }

      const connectionsResponse = await fetch('/api/connections', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!connectionsResponse.ok) {
        throw new Error('Erro ao buscar conexões')
      }

      const connectionsData = await connectionsResponse.json()
      const activeConnection = connectionsData.connections?.find((c: any) => c.status === 'WORKING')
      
      if (!activeConnection) {
        console.error('❌ Nenhuma sessão ativa encontrada')
        return
      }

      const sessionName = activeConnection.sessionName
      console.log('✅ [useChatsOverview] Usando sessão:', sessionName)

      const isProduction =
        typeof window !== "undefined" && window.location.protocol === "https:";
      const baseUrl = isProduction
        ? "/api/waha-proxy"
        : "http://159.65.34.199:3001";

      // Buscar com limit muito alto para pegar o total real
      const response = await fetch(
        `${baseUrl}/api/${sessionName}/chats/overview?limit=9999&offset=0`,
        {
          headers: {
            "X-Api-Key": "tappyone-waha-2024-secretkey",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const totalCount = data.length;

      // Contar chats não lidos - LÓGICA ULTRA RESTRITIVA (EXCLUINDO GRUPOS)
      // Vamos ser MUITO mais rigorosos: só conta como não lida se:
      // 1. Última mensagem não é nossa (fromMe: false)
      // 2. E tem ack = 2 (entregue) APENAS (sem ack pode ser antigo)
      // 3. NÃO é grupo (@g.us)
      const unreadCount = data.filter((chat: any) => {
        if (!chat.lastMessage) return false;

        // Se a última mensagem é nossa, não conta como não lida
        if (chat.lastMessage.fromMe) return false;

        // Excluir grupos da contagem de não lidas
        if (chat.id?.includes("@g.us")) return false;

        // Só conta como não lida se ack = 2 EXATAMENTE (entregue mas não lida)
        // ack: 1 = enviada, 2 = entregue, 3 = lida, 4 = visualizada
        const isUnread = chat.lastMessage.ack === 2;

        return isUnread;
      }).length;

      // Contar grupos (contém @g.us)
      const groupsCount = data.filter((chat: any) =>
        chat.id?.includes("@g.us"),
      ).length;

      // Contar "lidas mas não respondidas" (última mensagem deles com ack=3 ou 4)
      const readNoReply = data.filter((chat: any) => {
        if (!chat.lastMessage) return false;
        if (chat.lastMessage.fromMe) return false; // Se última mensagem é nossa, respondemos

        // Se última mensagem é deles e foi lida (ack=3 ou 4), mas não respondemos
        const wasRead =
          chat.lastMessage.ack === 3 || chat.lastMessage.ack === 4;
        return wasRead;
      }).length;

      setTotalChatsCount(totalCount);
      setUnreadChatsCount(unreadCount);
      setReadNoReplyCount(readNoReply);
      setGroupChatsCount(groupsCount);

      return { totalCount, unreadCount };
    } catch {
      return { totalCount: 0, unreadCount: 0 };
    }
  };

  // Função para marcar mensagens como lidas via WAHA
  const markChatAsRead = async (chatId: string) => {
    try {
      const isProduction =
        typeof window !== "undefined" && window.location.protocol === "https:";
      const baseUrl = isProduction
        ? "/api/waha-proxy"
        : "http://159.65.34.199:3001";

      const response = await fetch(
        `${baseUrl}/api/user_fb8da1d7_1758158816675/chats/${chatId}/messages/read`,
        {
          method: "POST",
          headers: {
            "X-Api-Key": "tappyone-waha-2024-secretkey",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}), // Corpo vazio marca todas as mensagens como lidas
        },
      );

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Recarregar chats para ver a mudança
      setTimeout(() => refreshChats(), 1000);
    } catch {}
  };

  // Função para marcar chat como não lido (teste - pode não funcionar)
  const markChatAsUnread = async (chatId: string) => {
    try {
      const isProduction =
        typeof window !== "undefined" && window.location.protocol === "https:";
      const baseUrl = isProduction
        ? "/api/waha-proxy"
        : "http://159.65.34.199:3001";

      const response = await fetch(
        `${baseUrl}/api/user_fb8da1d7_1758158816675/chats/${chatId}/unread`,
        {
          method: "POST",
          headers: {
            "X-Api-Key": "tappyone-waha-2024-secretkey",
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        return false;
      }

      setTimeout(() => refreshChats(), 1000);
      return true;
    } catch {
      return false;
    }
  };

  // Função para atualizar apenas as mensagens mais recentes (sem recarregar lista)
  const softRefresh = async () => {
    try {
      // Detectar se estamos em produção HTTPS
      const isProduction =
        typeof window !== "undefined" && window.location.protocol === "https:";
      const baseUrl = isProduction
        ? "/api/waha-proxy"
        : "http://159.65.34.199:3001";

      const response = await fetch(
        `${baseUrl}/api/user_fb8da1d7_1758158816675/chats/overview?limit=10&offset=0`,
        {
          headers: { "X-Api-Key": "tappyone-waha-2024-secretkey" },
        },
      );

      if (response.ok) {
        const newData = await response.json();

        // Atualizar apenas os chats que já existem na lista
        setChats((prevChats) => {
          let hasChanges = false;
          const updatedChats = prevChats.map((chat) => {
            const updated = newData.find(
              (newChat: any) => newChat.id === chat.id,
            );
            if (
              updated &&
              updated.lastMessage &&
              (!chat.lastMessage ||
                chat.lastMessage.id !== updated.lastMessage.id)
            ) {
              hasChanges = true;
              return {
                ...chat,
                lastMessage: {
                  ...updated.lastMessage,
                  timestamp: updated.lastMessage.timestamp * 1000,
                },
              };
            }
            return chat;
          });

          // Só atualizar se realmente houve mudanças para evitar re-renders
          return hasChanges ? updatedChats : prevChats;
        });
      }
    } catch {}
  };

  // 🔥 FORÇAR EXECUÇÃO - usar useLayoutEffect
  useEffect(() => {
    if (isMounted) return;

    setIsMounted(true);

    // Executar com delay zero para garantir que roda
    setTimeout(() => {
      fetchChatsOverview(10, 0, false);
      fetchTotalChatsCount();
    }, 0);
  }, [isMounted]);

  return {
    chats,
    loading,
    error,
    refreshChats,
    loadMoreChats,
    hasMore,
    isLoadingMore,
    markChatAsRead, // Marcar como lida via WAHA
    markChatAsUnread, // Marcar como não lida via WAHA (teste)
    totalChatsCount, // Total real de chats do WhatsApp
    unreadChatsCount, // Total real de chats não lidos
    readNoReplyCount, // Total de chats lidos mas não respondidos
    groupChatsCount, // Total real de grupos
  };
}

// Helper para descrever tipos de mensagem
function getMessageTypeDescription(message: any): string {
  if (message.hasMedia) {
    if (message.type?.includes("image")) return "📷 Imagem";
    if (message.type?.includes("video")) return "🎥 Vídeo";
    if (message.type?.includes("audio")) return "🎵 Áudio";
    if (message.type?.includes("document")) return "📄 Documento";
    return "📎 Mídia";
  }

  // Tipos específicos do WhatsApp
  if (message.type === "poll") return "📊 Enquete";
  if (message.type === "location") return "📍 Localização";
  if (message.type === "contact") return "👤 Contato";
  if (message.type === "call") return "📞 Chamada";
  if (message.type === "system") return "📢 Mensagem do sistema";
  if (message.type === "notification") return "🔔 Notificação";
  if (message.type === "revoked") return "🚫 Mensagem apagada";
  if (message.type === "group_notification") return "👥 Notificação do grupo";
  if (message.type === "e2e_notification")
    return "🔒 Notificação de criptografia";

  // Se tem body, usar o body
  if (message.body && message.body.trim()) {
    return message.body;
  }

  // Fallback final
  return "Mensagem";
}
