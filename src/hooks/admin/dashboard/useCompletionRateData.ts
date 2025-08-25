
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface CompletionRateData {
  name: string;
  completion: number;
}

export const useCompletionRateData = (timeRange: string) => {
  const [completionRateData, setCompletionRateData] = useState<CompletionRateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataReal, setIsDataReal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompletionRateData = async () => {
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          setLoading(true);
          setError(null);
          
          // Usar nova RPC para dados reais
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_completion_rate_by_solution', { time_range: timeRange });

          if (rpcError) {
            throw rpcError;
          }

          if (rpcData && rpcData.length > 0) {
            setCompletionRateData(rpcData.map((item: any) => ({
              name: item.name,
              completion: Number(item.completion)
            })));
            setIsDataReal(true);
            return;
          } else {
            // Se não há dados, mostrar mensagem apropriada
            setCompletionRateData([]);
            setIsDataReal(true);
            setError('Nenhum dado de conclusão disponível para o período selecionado');
            return;
          }

        } catch (err: any) {
          console.error(`Tentativa ${retryCount + 1} falhou:`, err);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            setError('Falha ao carregar dados de taxa de conclusão após 3 tentativas');
            setCompletionRateData([]);
            setIsDataReal(false);
            
            toast({
              title: "Erro ao carregar dados",
              description: "Não foi possível carregar a taxa de conclusão. Verifique sua conexão.",
              variant: "destructive",
            });
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
        setCompletionRateData([]);
        setIsDataReal(false);
      }
    }, 30000);

    fetchCompletionRateData();

    return () => clearTimeout(timeoutId);
  }, [timeRange, toast]);

  return { 
    completionRateData, 
    loading, 
    error, 
    isDataReal,
    isEmpty: completionRateData.length === 0 && !loading
  };
};
