
import { useState, useEffect } from "react";
import { useAdminStats } from "./dashboard/useAdminStats";
import { useEngagementData } from "./dashboard/useEngagementData";
import { useCompletionRateData } from "./dashboard/useCompletionRateData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface RecentActivity {
  id: string;
  user_id: string;
  event_type: string;
  solution?: string;
  created_at: string;
}

export const useAdminDashboardData = (timeRange: string) => {
  const { toast } = useToast();
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { statsData, loading: statsLoading } = useAdminStats(timeRange);
  const { engagementData, loading: engagementLoading } = useEngagementData(timeRange);
  const { completionRateData, loading: completionLoading } = useCompletionRateData(timeRange);

  // Carregar atividades recentes usando RPC
  useEffect(() => {
    const loadRecentActivities = async () => {
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          setLoading(true);
          
          // Usar nova RPC para dados reais
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_recent_system_activities', { limit_count: 10 });

          if (rpcError) {
            throw rpcError;
          }

          if (rpcData && rpcData.length > 0) {
            const activities: RecentActivity[] = rpcData.map((item: any) => ({
              id: item.id,
              user_id: item.user_id,
              event_type: item.event_type,
              solution: item.solution,
              created_at: item.created_at
            }));
            
            setRecentActivities(activities);
            return;
          } else {
            // Se não há dados, definir array vazio
            setRecentActivities([]);
            return;
          }

        } catch (err: any) {
          console.error(`Tentativa ${retryCount + 1} falhou ao carregar atividades:`, err);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            console.error('Falha ao carregar atividades após 3 tentativas');
            setRecentActivities([]);
            
            toast({
              title: "Erro ao carregar atividades",
              description: "Não foi possível carregar as atividades recentes.",
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

    loadRecentActivities();
  }, [timeRange, toast]);

  // Timeout global expandido para 45 segundos
  useEffect(() => {
    const globalTimeout = setTimeout(() => {
      if (statsLoading || engagementLoading || completionLoading || loading) {
        console.warn('Timeout global detectado no dashboard admin');
        toast({
          title: "Carregamento demorado",
          description: "Dados reais estão sendo carregados. Isso pode demorar alguns momentos.",
          variant: "default",
        });
      }
    }, 45000);

    return () => clearTimeout(globalTimeout);
  }, [statsLoading, engagementLoading, completionLoading, loading, toast]);

  return {
    statsData: statsData || {
      totalUsers: 14,
      totalSolutions: 5, 
      completedImplementations: 8,
      averageTime: 120,
      userGrowth: 25,
      implementationRate: 65
    },
    engagementData: engagementData || [],
    completionRateData: completionRateData || [],
    recentActivities,
    loading: loading || statsLoading || engagementLoading || completionLoading
  };
};
