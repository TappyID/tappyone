import { useState, useCallback, useEffect } from "react";
import { useAuth } from "./useAuth";

export interface CategoriaResposta {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  ordem: number;
  ativo: boolean;
  usuario_id: string;
  created_at: string;
  updated_at: string;
}

export interface AcaoResposta {
  id: string;
  resposta_rapida_id: string;
  tipo: "texto" | "imagem" | "audio" | "video" | "arquivo" | "pix" | "delay";
  conteudo: any; // JSON content
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface RespostaRapida {
  id: string;
  titulo: string;
  descricao?: string;
  categoria_id?: string;
  categoria?: CategoriaResposta;
  triggers: string[]; // palavras-chave que ativam a resposta
  ativo: boolean;
  trigger_tipo:
    | "manual"
    | "primeira_mensagem"
    | "palavra_chave"
    | "horario"
    | "intervalo";
  agendamento_ativo: boolean;
  agendamento_config?: any; // JSON config
  pausado: boolean;
  ordem: number;
  usuario_id: string;
  acoes: AcaoResposta[];
  created_at: string;
  updated_at: string;
}

export interface EstatisticasResposta {
  total_categorias: number;
  total_respostas: number;
  respostas_ativas: number;
  total_execucoes: number;
  execucoes_hoje: number;
}

export interface CreateRespostaRequest {
  titulo: string;
  descricao?: string;
  categoria_id?: string;
  triggers: string[];
  ativo: boolean;
  automatico: boolean;
  fallback: boolean;
  agendamento_ativo: boolean;
  agendamento_config?: any;
  acoes: Omit<
    AcaoResposta,
    "id" | "resposta_rapida_id" | "created_at" | "updated_at"
  >[];
}

export interface CreateCategoriaRequest {
  nome: string;
  descricao?: string;
  cor: string;
  icone: string; // Campo obrigatório no backend Go
  ordem?: number;
}

export function useRespostasRapidas() {
  const { token } = useAuth();

  // Mock token temporário para desenvolvimento
  const effectiveToken = token || "mock-token-dev";
  const [respostas, setRespostas] = useState<RespostaRapida[]>([]);
  const [categorias, setCategorias] = useState<CategoriaResposta[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasResposta | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseURL = "/api/respostas-rapidas"; // Usar endpoint Next.js local

  const apiCall = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${effectiveToken}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` };
        }
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${errorText}`,
        );
      }

      return response.json();
    },
    [effectiveToken, baseURL],
  );

  const fetchRespostas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall("/");
      setRespostas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar respostas");
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    try {
      // Usar API route do Next.js para evitar Mixed Content
      const categoriasURL = "/api/respostas-rapidas/categorias";

      const response = await fetch(categoriasURL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setCategorias(data || []);
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchEstatisticas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall("/estatisticas");
      setEstatisticas(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao buscar estatísticas",
      );
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const createResposta = useCallback(
    async (data: CreateRespostaRequest) => {
      try {
        setLoading(true);
        setError(null);

        // Transformar dados para formato esperado pelo backend Go
        const backendData = {
          titulo: data.titulo,
          descricao: data.descricao || null,
          // REMOVER categoria_id - backend vai criar/usar categoria "Geral"
          agendamento_ativo: data.agendamento_ativo || false,
          trigger_tipo: data.automatico ? "palavra_chave" : "manual",
          trigger_condicao: {
            palavras_chave: data.triggers.filter((t) => t.trim()),
          },
          delay_segundos: 0,
          repetir: false,
          max_repeticoes: 1,
          aplicar_novos_contatos: true,
          aplicar_contatos_existentes: false,
          acoes: data.acoes.map((acao, index) => ({
            tipo: acao.tipo,
            conteudo:
              typeof acao.conteudo === "string"
                ? { texto: acao.conteudo }
                : acao.conteudo,
            ordem: acao.ordem || index,
            ativo: acao.ativo !== false,
            delay_segundos: 0,
            obrigatorio: true,
            condicional: false,
          })),
        };

        const response = await apiCall("/", {
          method: "POST",
          body: JSON.stringify(backendData),
        });
        // Recarregar lista após criar
        await fetchRespostas();
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao criar resposta");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchRespostas],
  );

  const updateResposta = useCallback(
    async (id: string, data: Partial<CreateRespostaRequest>) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall(`/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        // Recarregar lista após atualizar
        await fetchRespostas();
        return response;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao atualizar resposta",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchRespostas],
  );

  const deleteResposta = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await apiCall(`/${id}`, {
          method: "DELETE",
        });
        // Remove da lista local
        setRespostas((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao excluir resposta",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall],
  );

  const togglePauseResposta = useCallback(
    async (id: string, pausado: boolean) => {
      try {
        setLoading(true);
        setError(null);
        await apiCall(`/${id}/pausar`, {
          method: "PUT",
          body: JSON.stringify({ pausado }),
        });
        // Atualiza na lista local
        setRespostas((prev) =>
          prev.map((r) => (r.id === id ? { ...r, pausado } : r)),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao pausar/despausar resposta",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall],
  );

  const executeResposta = useCallback(
    async (id: string, chatId: string) => {
      try {
        setLoading(true);
        setError(null);

        // Usar o handler Next.js que faz proxy para o backend
        const response = await fetch(`${baseURL}/${id}/executar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ chat_id: chatId }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erro ${response.status}: ${errorText || response.statusText}`,
          );
        }

        const result = await response.json();

        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao executar resposta",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, baseURL],
  );

  const createCategoria = useCallback(
    async (data: CreateCategoriaRequest) => {
      try {
        setLoading(true);
        setError(null);

        // Garantir que icone esteja presente (obrigatório no backend Go)
        const categoriaData = {
          nome: data.nome,
          descricao: data.descricao || `Categoria ${data.nome}`,
          cor: data.cor,
          icone: data.icone || "MessageCircle",
        };

        const categoriasURL = "/api/respostas-rapidas/categorias";

        const bodyData = JSON.stringify(categoriaData);

        const response = await fetch(categoriasURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: bodyData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erro ${response.status}: ${errorText || response.statusText}`,
          );
        }

        const result = await response.json();

        // Atualizar lista de categorias
        await fetchCategorias();

        return result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, fetchCategorias],
  );

  const deleteCategoria = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/respostas-rapidas/categorias/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erro ao excluir categoria: ${response.status} - ${errorText}`,
          );
        }

        // Atualizar lista de categorias
        await fetchCategorias();
      } catch (error) {
        throw error;
      }
    },
    [token, fetchCategorias],
  );

  const updateCategoria = useCallback(
    async (id: string, data: CreateCategoriaRequest) => {
      try {
        const response = await fetch(
          `/api/respostas-rapidas/categorias/${id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Erro ao atualizar categoria: ${response.status} - ${errorText}`,
          );
        }

        // Atualizar lista de categorias
        await fetchCategorias();
      } catch (error) {
        throw error;
      }
    },
    [token, fetchCategorias],
  );

  // Carregar dados automaticamente quando o hook for montado
  useEffect(() => {
    if (token) {
      fetchRespostas();
      fetchCategorias();
      fetchEstatisticas();
    }
  }, [token, fetchRespostas, fetchCategorias, fetchEstatisticas]);

  return {
    respostas,
    categorias,
    estatisticas,
    loading,
    error,
    fetchRespostas,
    fetchCategorias,
    fetchEstatisticas,
    createResposta,
    updateResposta,
    deleteResposta,
    togglePauseResposta,
    executeResposta,
    createCategoria,
    deleteCategoria,
    updateCategoria,
  };
}
