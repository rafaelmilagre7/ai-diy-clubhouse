
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

  // Carregar atividades recentes reais do banco de dados
  useEffect(() => {
    const loadRecentActivities = async () => {
      setLoading(true);
      
      try {
        // Buscar atividades reais do banco de dados
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
          .limit(10);

        if (error) {
          console.error("Erro ao carregar atividades:", error);
          setRecentActivities([]);
          return;
        }

        // Transformar dados para o formato esperado
        const activities: RecentActivity[] = (analyticsData || []).map(item => ({
          id: item.id,
          user_id: item.user_id,
          event_type: item.event_type,
          solution: item.solutions?.title || 'Solução não identificada',
          created_at: item.created_at
        }));
        
        setRecentActivities(activities);
      } catch (error: any) {
        console.error("Erro ao carregar atividades recentes:", error);
        setRecentActivities([]);
        toast({
          title: "Aviso",
          description: "Não foi possível carregar as atividades recentes.",
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
