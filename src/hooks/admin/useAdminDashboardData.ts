
import { useState, useEffect } from "react";
import { useAdminStats } from "./dashboard/useAdminStats";
import { useEngagementData } from "./dashboard/useEngagementData";
import { useCompletionRateData } from "./dashboard/useCompletionRateData";
import { useToast } from "@/hooks/use-toast";

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  solution: string;
  date: Date;
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
            user: "João Silva",
            action: "concluiu",
            solution: "Integração de IA no Atendimento",
            date: new Date(2023, 6, 25)
          },
          {
            id: "2",
            user: "Maria Oliveira",
            action: "iniciou",
            solution: "Automação de Marketing",
            date: new Date(2023, 6, 24)
          },
          {
            id: "3",
            user: "Pedro Santos",
            action: "revisou",
            solution: "Chatbot para WhatsApp",
            date: new Date(2023, 6, 24)
          },
          {
            id: "4",
            user: "Ana Ferreira",
            action: "concluiu",
            solution: "Analytics avançado",
            date: new Date(2023, 6, 23)
          },
          {
            id: "5",
            user: "Carlos Mendes",
            action: "abandonou",
            solution: "CRM Inteligente",
            date: new Date(2023, 6, 22)
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
