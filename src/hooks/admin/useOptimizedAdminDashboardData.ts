
import { useMemo } from "react";
import { useOptimizedQuery } from "@/hooks/common/useOptimizedQuery";
import { useAdminStats } from "./dashboard/useAdminStats";
import { useEngagementData } from "./dashboard/useEngagementData";
import { useCompletionRateData } from "./dashboard/useCompletionRateData";

interface RecentActivity {
  id: string;
  user_id: string;
  event_type: string;
  solution?: string;
  created_at: string;
}

/**
 * Hook otimizado para dados do dashboard administrativo
 */
export const useOptimizedAdminDashboardData = (timeRange: string) => {
  const { statsData, loading: statsLoading } = useAdminStats(timeRange);
  const { engagementData, loading: engagementLoading } = useEngagementData(timeRange);
  const { completionRateData, loading: completionLoading } = useCompletionRateData(timeRange);

  // Atividades recentes com cache otimizado
  const { 
    data: recentActivities = [],
    isLoading: activitiesLoading
  } = useOptimizedQuery({
    queryKey: ['admin-recent-activities', timeRange],
    queryFn: async (): Promise<RecentActivity[]> => {
      // Dados simulados otimizados
      return [
        {
          id: "1",
          user_id: "joao.silva",
          event_type: "view",
          solution: "Integração de IA no Atendimento",
          created_at: new Date(2023, 6, 25).toISOString()
        },
        {
          id: "2",
          user_id: "maria.oliveira",
          event_type: "start",
          solution: "Automação de Marketing",
          created_at: new Date(2023, 6, 24).toISOString()
        },
        {
          id: "3",
          user_id: "pedro.santos",
          event_type: "complete",
          solution: "Chatbot para WhatsApp",
          created_at: new Date(2023, 6, 24).toISOString()
        },
        {
          id: "4",
          user_id: "ana.ferreira",
          event_type: "complete",
          solution: "Analytics avançado",
          created_at: new Date(2023, 6, 23).toISOString()
        },
        {
          id: "5",
          user_id: "carlos.mendes",
          event_type: "login",
          solution: "CRM Inteligente",
          created_at: new Date(2023, 6, 22).toISOString()
        }
      ];
    }
  });

  const loading = useMemo(() => 
    statsLoading || engagementLoading || completionLoading || activitiesLoading,
    [statsLoading, engagementLoading, completionLoading, activitiesLoading]
  );

  return {
    statsData,
    engagementData,
    completionRateData,
    recentActivities,
    loading
  };
};
