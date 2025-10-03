import { useState, useEffect } from "react";

interface AtendenteData {
  atendente: string;
  atendenteId: number;
  filaId: number;
  status: "aguardando" | "em_atendimento" | "finalizado";
}

interface UseAtendenteDataReturn {
  atendenteData: AtendenteData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAtendenteData(
  chatId: string | null,
): UseAtendenteDataReturn {
  const [atendenteData, setAtendenteData] = useState<AtendenteData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAtendenteData = async () => {
    if (!chatId) {
      setAtendenteData(null);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // ✅ USAR ROTA PROXY PARA FUNCIONAR EM PRODUÇÃO
      const response = await fetch(
        `/api/chats/${encodeURIComponent(chatId)}/atendente`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar atendente: ${response.status}`)
      }

      const data = await response.json();

      setAtendenteData({
        atendente: data.atendente || "",
        atendenteId: data.atendenteId || 0,
        filaId: data.filaId || 0,
        status: data.status || "aguardando",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setAtendenteData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtendenteData();
  }, [chatId]);

  return {
    atendenteData,
    loading,
    error,
    refetch: fetchAtendenteData,
  };
}

export default useAtendenteData;
