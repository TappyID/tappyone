import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { AgenteIa } from './useAgentes';

export interface ChatAgente {
  id: string;
  chatId: string;
  agenteId: string;
  usuarioId: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  agente?: AgenteIa;
}

interface ChatAgenteResponse {
  ativo: boolean;
  agente?: AgenteIa;
  chatAgente?: ChatAgente;
}

export function useChatAgente(chatId: string | null) {
  const [data, setData] = useState<ChatAgenteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchChatAgente = async () => {
    if (!token || !chatId) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/chat-agentes/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar agente do chat');
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
    if (chatId) {
      fetchChatAgente();
    } else {
      setData(null);
    }
  }, [token, chatId]);

  const activateAgent = async (agenteId: string) => {
    if (!chatId) throw new Error('Chat ID é obrigatório');
    if (!token) throw new Error('Token de autorização é obrigatório');
    
    try {
      const response = await fetch(`/api/chat-agentes/${chatId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ agenteId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao ativar agente');
      }

      const result = await response.json();
      await fetchChatAgente(); // Recarregar dados
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deactivateAgent = async () => {
    if (!chatId) throw new Error('Chat ID é obrigatório');
    if (!token) throw new Error('Token de autorização é obrigatório');
    
    try {
      const response = await fetch(`/api/chat-agentes/${chatId}/deactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao desativar agente');
      }

      const result = await response.json();
      await fetchChatAgente(); // Recarregar dados
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    data,
    ativo: data?.ativo || false,
    agente: data?.agente,
    chatAgente: data?.chatAgente,
    loading,
    error,
    refetch: fetchChatAgente,
    activateAgent,
    deactivateAgent,
  };
}
