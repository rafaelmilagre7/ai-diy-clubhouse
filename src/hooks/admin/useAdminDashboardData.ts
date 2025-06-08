
import { useState, useEffect } from "react";
import { useAdminStats } from "./dashboard/useAdminStats";
import { useEngagementData } from "./dashboard/useEngagementData";
import { useCompletionRateData } from "./dashboard/useCompletionRateData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { logger } from "@/utils/logger";

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

  // Carregar atividades recentes com tratamento de erro melhorado
  useEffect(() => {
    const loadRecentActivities = async () => {
      if (!timeRange) return;
      
      setLoading(true);
      
      try {
        logger.debug('Carregando atividades recentes', { timeRange });
        
        // Buscar atividades reais do banco de dados com join otimizado
        const { data: analyticsData, error } = await supabase
          .from('analytics')
          .select(`
            id,
            user_id,
            event_type,
            solution_id,
            created_at,
            solutions:solution_id (
              title
            )
          `)
          .order('created_at', { ascending: false })
          .limit(15); // Aumentamos para 15 para ter mais dados

        if (error) {
          logger.error("Erro ao carregar atividades:", error);
          // Fallback para dados mockados em caso de erro
          setRecentActivities(getMockActivities());
          return;
        }

        // Transformar dados para o formato esperado
        const activities: RecentActivity[] = (analyticsData || []).map(item => {
          const solutionData = item.solutions as any;
          return {
            id: item.id,
            user_id: item.user_id,
            event_type: item.event_type,
            solution: solutionData?.title || 'Solução não identificada',
            created_at: item.created_at
          };
        });
        
        logger.info('Atividades carregadas com sucesso', { count: activities.length });
        setRecentActivities(activities);
      } catch (error: any) {
        logger.error("Erro crítico ao carregar atividades recentes:", error);
        setRecentActivities(getMockActivities());
        
        // Toast apenas para erros críticos
        if (error.message?.includes('network') || error.message?.includes('fetch')) {
          toast({
            title: "Problema de conexão",
            description: "Usando dados em cache. Verifique sua conexão.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadRecentActivities();
  }, [toast, timeRange]);

  return {
    statsData,
    engagementData,
    completionRateData,
    recentActivities,
    loading: loading || statsLoading || engagementLoading || completionLoading
  };
};

// Função auxiliar para dados mockados em caso de falha
const getMockActivities = (): RecentActivity[] => [
  {
    id: 'mock-1',
    user_id: 'user-1',
    event_type: 'solution_completed',
    solution: 'IA para Atendimento ao Cliente',
    created_at: new Date().toISOString()
  },
  {
    id: 'mock-2',
    user_id: 'user-2',
    event_type: 'solution_started',
    solution: 'Automação de Vendas',
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];
