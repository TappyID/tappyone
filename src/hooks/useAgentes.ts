import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const API_BASE_URL = '';

export interface AgenteIa {
  id: string;
  usuarioId: string;
  nome: string;
  descricao?: string;
  prompt: string;
  modelo: string;
  categoria?: string;
  funcao?: string;
  tokensUsados: number;
  nicho?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AgentesResponse {
  agentes: AgenteIa[];
  total: number;
  page: number;
  limit: number;
}

interface UseAgentesOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoria?: string;
}

export function useAgentes(options: UseAgentesOptions = {}) {
  const [data, setData] = useState<AgentesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const { page = 1, limit = 10, search, categoria } = options;

  const fetchAgentes = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);
      if (categoria) params.append('categoria', categoria);

      const response = await fetch(`${API_BASE_URL}/api/agentes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar agentes');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentes();
  }, [token, page, limit, search, categoria]);

  const createAgente = async (agente: Omit<AgenteIa, 'id' | 'usuarioId' | 'tokensUsados' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agentes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(agente),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar agente');
      }

      const newAgente = await response.json();
      await fetchAgentes(); // Recarregar lista
      return newAgente;
    } catch (error) {
      throw error;
    }
  };

  const updateAgente = async (id: string, updates: Partial<AgenteIa>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agentes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar agente');
      }

      const updatedAgente = await response.json();
      await fetchAgentes(); // Recarregar lista
      return updatedAgente;
    } catch (error) {
      throw error;
    }
  };

  const deleteAgente = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agentes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar agente');
      }

      await fetchAgentes(); // Recarregar lista
    } catch (error) {
      throw error;
    }
  };

  const toggleAgente = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agentes/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao alternar status do agente');
      }

      const toggledAgente = await response.json();
      await fetchAgentes(); // Recarregar lista
      return toggledAgente;
    } catch (error) {
      throw error;
    }
  };

  return {
    agentes: data?.agentes || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    loading,
    error,
    refetch: fetchAgentes,
    createAgente,
    updateAgente,
    deleteAgente,
    toggleAgente,
  };
}

export function useAgentesAtivos() {
  const [agentes, setAgentes] = useState<AgenteIa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchAgentesAtivos = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/agentes/ativos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar agentes ativos');
      }

      const result = await response.json();
      setAgentes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentesAtivos();
  }, [token]);

  return {
    agentes,
    loading,
    error,
    refetch: fetchAgentesAtivos,
  };
}
