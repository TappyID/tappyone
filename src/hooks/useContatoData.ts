import { useState, useEffect } from "react";
import { normalizeTags } from "@/utils/tags";

interface ContatoData {
  id: string;
  fila?: {
    id: string;
    nome: string;
    cor: string;
  };
  tags: {
    id: string;
    nome: string;
    cor: string;
  }[];
  atendente?: {
    id: string;
    nome: string;
    email: string;
  };
  kanbanBoard?: string;
  orcamento?: {
    valor: number;
    status: string;
  };
  agendamento?: {
    data: string;
    status: string;
  };
  assinatura?: {
    id: string;
    valor: number;
    status: string;
    descricao: string;
  };
  tickets?: {
    id: string;
    titulo: string;
    status: string;
    prioridade: string;
  }[];
  rating?: number; // Avaliação do cliente de 1 a 5 estrelas
}

interface UseContatoDataReturn {
  contatos: { [chatId: string]: ContatoData | null };
  loading: boolean;
  error: string | null;
  refreshContato: (chatId: string) => void;
}

export function useContatoData(chatIds: string[]) {
  const [contatos, setContatos] = useState<{
    [chatId: string]: ContatoData | null;
  }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache global com TTL de 5 minutos
  const CACHE_TTL = 5 * 60 * 1000;
  const [cache, setCache] = useState<{
    [key: string]: { data: ContatoData | null; timestamp: number };
  }>({});

  // Cache de chats que não existem no CRM (para evitar requests repetidas)
  const [notFoundChats, setNotFoundChats] = useState<Set<string>>(new Set());

  const fetchContatoData = async (chatId: string) => {
    if (!chatId || chatId.trim() === "") {
      return null;
    }

    // Se já sabemos que este chat não existe no CRM, não tentar novamente
    if (notFoundChats.has(chatId)) {
      return null;
    }

    // Verificar cache primeiro
    const cached = cache[chatId];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado");
      }

      // Extrair número do telefone do chatId (mesmo formato do Kanban)
      const numeroTelefone = chatId.replace("@c.us", "").replace("@g.us", "");

      // Buscar contato base pelo número do telefone
      const contatoResponse = await fetch(
        `/api/contatos?numero_telefone=${numeroTelefone}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      let contatoData = null;
      if (contatoResponse.ok) {
        const contatos = await contatoResponse.json();
        contatoData = contatos.length > 0 ? contatos[0] : null;
      }

      if (!contatoData) {
        // Marcar como não encontrado para evitar requests futuros
        setNotFoundChats((prev) => new Set(prev).add(chatId));

        // Salvar no cache também (null com timestamp)
        setCache((prev) => ({
          ...prev,
          [chatId]: { data: null, timestamp: Date.now() },
        }));

        return null;
      }

      // Buscar dados relacionados usando contato_id (mesmo método do Kanban)
      const [
        tagsResponse,
        orcamentosResponse,
        agendamentosResponse,
        assinaturasResponse,
        ticketsResponse,
      ] = await Promise.all([
        fetch(`/api/contatos/${contatoData.id}/tags`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),

        fetch(`/api/orcamentos?contato_id=${numeroTelefone}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),

        fetch(`/api/agendamentos?contato_id=${numeroTelefone}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),

        fetch(`/api/assinaturas?contato_id=${numeroTelefone}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),

        fetch(`/api/tickets?contato_id=${numeroTelefone}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      // Processar tags
      let tags = [];
      if (tagsResponse?.ok) {
        const tagsData = await tagsResponse.json();
        const rawTags = tagsData?.data || tagsData?.tags || tagsData || [];
        tags = normalizeTags(Array.isArray(rawTags) ? rawTags : []);
      }

      // Processar orçamentos - calcular total de todos orçamentos
      let orcamento = null;
      if (orcamentosResponse?.ok) {
        const orcamentos = await orcamentosResponse.json();
        if (orcamentos.length > 0) {
          // Somar todos os orçamentos do contato
          const valorTotal = orcamentos.reduce((total: number, orc: any) => {
            return (
              total + (parseFloat(orc.valor) || parseFloat(orc.valorTotal) || 0)
            );
          }, 0);

          orcamento = {
            valor: valorTotal,
            status: orcamentos[0].status, // Status do primeiro orçamento
            quantidade: orcamentos.length, // Quantidade de orçamentos
          };
        }
      }

      // Processar agendamentos - pegar o mais recente
      let agendamento = null;
      if (agendamentosResponse?.ok) {
        const agendamentos = await agendamentosResponse.json();
        if (agendamentos.length > 0) {
          // Ordenar por data para pegar o mais recente
          const agendamentosOrdenados = agendamentos.sort((a: any, b: any) => {
            const dataA = new Date(a.data_agendamento || a.data).getTime();
            const dataB = new Date(b.data_agendamento || b.data).getTime();
            return dataB - dataA; // Mais recente primeiro
          });

          agendamento = {
            data:
              agendamentosOrdenados[0].data_agendamento ||
              agendamentosOrdenados[0].data,
            status: agendamentosOrdenados[0].status,
            quantidade: agendamentos.length, // Total de agendamentos
          };
        }
      }

      // Processar assinaturas - mostrar nome do plano
      let assinatura = null;
      if (assinaturasResponse?.ok) {
        const assinaturasData = await assinaturasResponse.json();
        if (Array.isArray(assinaturasData) && assinaturasData.length > 0) {
          const assinaturasAtivas = assinaturasData.filter(
            (a) => a.status === "ATIVA" || a.status === "ATIVO",
          );
          if (assinaturasAtivas.length > 0) {
            assinatura = {
              id: assinaturasAtivas[0].id,
              valor: assinaturasAtivas[0].valor || 0,
              status: assinaturasAtivas[0].status,
              nomePlano:
                assinaturasAtivas[0].plano?.nome ||
                assinaturasAtivas[0].nome ||
                assinaturasAtivas[0].descricao ||
                "Plano",
              quantidade: assinaturasAtivas.length, // Quantidade de assinaturas ativas
            };
          }
        }
      }

      // Processar tickets
      let tickets = null;
      if (ticketsResponse?.ok) {
        const ticketsData = await ticketsResponse.json();
        if (Array.isArray(ticketsData) && ticketsData.length > 0) {
          tickets = ticketsData.map((ticket) => ({
            id: ticket.id,
            titulo: ticket.titulo,
            status: ticket.status,
            prioridade: ticket.prioridade,
          }));
        }
      }

      const result = {
        id: contatoData.id,
        fila: contatoData.fila
          ? {
              id: contatoData.fila.id,
              nome: contatoData.fila.nome,
              cor: contatoData.fila.cor,
            }
          : undefined,
        tags,
        atendente: contatoData.atendente,
        kanbanBoard: contatoData.kanbanBoard,
        orcamento,
        agendamento,
        assinatura,
        tickets,
      };

      // Salvar no cache
      setCache((prev) => ({
        ...prev,
        [chatId]: { data: result, timestamp: Date.now() },
      }));

      return result;
    } catch (err) {
      // Em caso de erro, também marcar como não encontrado temporariamente
      setNotFoundChats((prev) => new Set(prev).add(chatId));

      // Salvar no cache com timestamp menor (retry mais rápido em caso de erro)
      setCache((prev) => ({
        ...prev,
        [chatId]: { data: null, timestamp: Date.now() - CACHE_TTL * 0.8 },
      }));

      return null;
    }
  };

  const loadContatosData = async () => {
    // Filtrar apenas chatIds que ainda não foram carregados e não estão em cache válido
    const pendingChatIds = chatIds.filter((id) => {
      if (!id || id.trim() === "") return false;
      if (contatos[id]) return false;

      const cached = cache[id];
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        // Se está em cache válido, usar direto
        setContatos((prev) => ({ ...prev, [id]: cached.data }));
        return false;
      }
      return true;
    });

    if (pendingChatIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // OTIMIZAÇÃO: Processar em lotes menores para evitar sobrecarga
      const BATCH_SIZE = 5;
      const batches = [];
      for (let i = 0; i < pendingChatIds.length; i += BATCH_SIZE) {
        batches.push(pendingChatIds.slice(i, i + BATCH_SIZE));
      }

      // Processar lotes sequencialmente para evitar muitas requests simultâneas
      for (const batch of batches) {
        const promises = batch.map((chatId) => fetchContatoData(chatId));
        const results = await Promise.all(promises);

        // Salvar resultados do lote
        const newContatos: { [chatId: string]: ContatoData | null } = {};
        batch.forEach((chatId, index) => {
          const result = results[index];
          newContatos[chatId] = result;
        });

        setContatos((prev) => ({
          ...prev,
          ...newContatos,
        }));

        // Pequena pausa entre lotes para não sobrecarregar o servidor
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const refreshContato = async (chatId: string) => {
    const data = await fetchContatoData(chatId);
    if (data) {
      setContatos((prev) => ({
        ...prev,
        [chatId]: data,
      }));
    }
  };

  useEffect(() => {
    // Evitar requests duplicados - só carregar se há chatIds novos
    const newChatIds = chatIds.filter(
      (id) => !contatos[id] && id.trim() !== "",
    );
    if (newChatIds.length === 0) {
      return;
    }

    // Debounce para evitar requests múltiplos rápidos
    const timeoutId = setTimeout(() => {
      loadContatosData();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [chatIds.join(",")]);

  return {
    contatos,
    loading,
    error,
    refreshContato,
  };
}
