
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";

interface EngagementData {
  name: string;
  value: number;
}

export const useEngagementData = (timeRange: string) => {
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataReal, setIsDataReal] = useState(false);
  const { showError } = useToastModern();

  useEffect(() => {
    const fetchEngagementData = async () => {
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          setLoading(true);
          setError(null);
          
          // Usar nova RPC para dados reais
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_engagement_metrics_by_period', { time_range: timeRange });

          if (rpcError) {
            throw rpcError;
          }

          if (rpcData && rpcData.length > 0) {
            setEngagementData(rpcData.map((item: any) => ({
              name: item.name,
              value: Number(item.value)
            })));
            setIsDataReal(true);
            return;
          } else {
            // Se não há dados, mostrar mensagem apropriada
            setEngagementData([]);
            setIsDataReal(true);
            setError('Nenhum dado de engajamento disponível para o período selecionado');
            return;
          }

        } catch (err: any) {
          console.error(`Tentativa ${retryCount + 1} falhou:`, err);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            setError('Falha ao carregar dados de engajamento após 3 tentativas');
            setEngagementData([]);
            setIsDataReal(false);
            
            showError("Erro ao carregar dados", "Não foi possível carregar dados de engajamento. Verifique sua conexão.");
          } else {
            // Aguardar antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        } finally {
          if (retryCount >= maxRetries || !loading) {
            setLoading(false);
          }
        }
      }
    };

    // Timeout expandido para 30 segundos
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Timeout no carregamento de dados - operação cancelada');
        setEngagementData([]);
        setIsDataReal(false);
      }
    }, 30000);

    fetchEngagementData();

    return () => clearTimeout(timeoutId);
  }, [timeRange]);

  return { 
    engagementData, 
    loading, 
    error, 
    isDataReal,
    isEmpty: engagementData.length === 0 && !loading
  };
};
