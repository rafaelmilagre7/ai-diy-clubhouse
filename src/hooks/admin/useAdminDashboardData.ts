
import { useState, useEffect } from "react";
import { useAdminStats } from "./dashboard/useAdminStats";
import { useEngagementData } from "./dashboard/useEngagementData";
import { useCompletionRateData } from "./dashboard/useCompletionRateData";
import { useToast } from "@/hooks/use-toast";

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

  // Carregar dados de atividades recentes
  useEffect(() => {
    const loadRecentActivities = async () => {
      setLoading(true);
      
      try {
        // Dados simulados para atividades recentes
        const mockActivities: RecentActivity[] = [
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
        
        setRecentActivities(mockActivities);
      } catch (error: any) {
        console.error("Erro ao carregar atividades recentes:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar as atividades recentes.",
          variant: "destructive",
        });
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
