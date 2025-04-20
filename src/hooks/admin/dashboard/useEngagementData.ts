
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export const useEngagementData = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [engagementData, setEngagementData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        setLoading(true);
        
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('last_activity');
        
        if (progressError) throw progressError;

        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const currentDate = new Date();
        const activityByMonth: Record<string, number> = {};
        
        // Inicializar últimos 6 meses
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentDate.getMonth() - i + 12) % 12;
          const year = new Date(currentDate).setMonth(currentDate.getMonth() - i);
          const yearStr = new Date(year).getFullYear();
          const monthKey = `${yearStr}-${monthIndex + 1}`;
          activityByMonth[monthKey] = 0;
        }
        
        // Contar atividades por mês
        progressData?.forEach(progress => {
          const date = new Date(progress.last_activity);
          const monthIndex = date.getMonth();
          const monthKey = `${date.getFullYear()}-${monthIndex + 1}`;
          
          if (activityByMonth[monthKey] !== undefined) {
            activityByMonth[monthKey]++;
          }
        });
        
        // Formatar para gráfico
        const formattedData = Object.entries(activityByMonth).map(([key, value]) => {
          const [year, month] = key.split('-');
          const monthIndex = parseInt(month) - 1;
          return {
            name: `${monthNames[monthIndex]}`,
            value: value
          };
        });

        setEngagementData(formattedData);

      } catch (error: any) {
        console.error("Erro ao carregar dados de engajamento:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os dados de engajamento.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementData();
  }, [toast, timeRange]);

  return { engagementData, loading };
};
