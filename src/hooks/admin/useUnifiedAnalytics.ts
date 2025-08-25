import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UnifiedAnalyticsData {
  completion_rate_data: Array<{ name: string; completion: number; }>;
  engagement_data: Array<{ name: string; value: number; }>;
  recent_activities: Array<{
    id: string;
    user_id: string;
    event_type: string;
    solution: string;
    created_at: string;
    user_name: string;
    user_email: string;
  }>;
  stats: any;
  generated_at: string;
  time_range: string;
}

export const useUnifiedAnalytics = (timeRange: string) => {
  const [data, setData] = useState<UnifiedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUnifiedData = async () => {
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          setLoading(true);
          setError(null);
          
          console.log(`[UnifiedAnalytics] Buscando dados para período: ${timeRange}`);
          
          // Usar RPC unificada
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_unified_analytics_data', { time_range: timeRange });

          if (rpcError) {
            throw rpcError;
          }

          if (rpcData) {
            setData(rpcData);
            setLastUpdate(new Date());
            
            console.log(`[UnifiedAnalytics] Dados carregados com sucesso:`, {
              completion_items: rpcData.completion_rate_data?.length || 0,
              engagement_items: rpcData.engagement_data?.length || 0,
              activities: rpcData.recent_activities?.length || 0,
              stats_available: !!rpcData.stats
            });
            
            return;
          } else {
            throw new Error('Nenhum dado retornado da RPC unificada');
          }

        } catch (err: any) {
          console.error(`[UnifiedAnalytics] Tentativa ${retryCount + 1} falhou:`, err);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            const errorMessage = `Falha ao carregar analytics unificados após ${maxRetries} tentativas: ${err.message}`;
            setError(errorMessage);
            
            toast({
              title: "Erro no Analytics",
              description: "Não foi possível carregar os dados unificados do dashboard.",
              variant: "destructive",
            });
          } else {
            // Aguardar progressivamente mais tempo entre tentativas
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          }
        } finally {
          if (retryCount >= maxRetries) {
            setLoading(false);
          }
        }
      }
    };

    // Timeout de 45 segundos para operação completa
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Timeout na operação - dados não puderam ser carregados em tempo hábil');
        console.warn('[UnifiedAnalytics] Timeout de 45s atingido');
      }
    }, 45000);

    fetchUnifiedData();

    return () => clearTimeout(timeoutId);
  }, [timeRange, toast]);

  // Função para recarregar dados manualmente
  const refetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_unified_analytics_data', { time_range: timeRange });

      if (rpcError) throw rpcError;
      
      setData(rpcData);
      setLastUpdate(new Date());
      
      toast({
        title: "Dados atualizados",
        description: "Analytics recarregados com sucesso.",
        variant: "default",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro ao recarregar",
        description: "Não foi possível atualizar os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    lastUpdate,
    refetch,
    isStale: lastUpdate && (Date.now() - lastUpdate.getTime()) > 5 * 60 * 1000, // 5 minutos
    hasData: !!data && (
      (data.completion_rate_data?.length || 0) > 0 ||
      (data.engagement_data?.length || 0) > 0 ||
      (data.recent_activities?.length || 0) > 0
    )
  };
};