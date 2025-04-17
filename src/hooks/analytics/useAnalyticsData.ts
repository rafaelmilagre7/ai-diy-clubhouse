
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  processUsersByTime, 
  processSolutionPopularity, 
  processImplementationsByCategory,
  processCompletionRate,
  processDayOfWeekActivity
} from '@/components/admin/analytics/analyticUtils';

interface AnalyticsData {
  usersByTime: any[];
  solutionPopularity: any[];
  implementationsByCategory: any[];
  userCompletionRate: any[];
  dayOfWeekActivity: any[];
}

export const useAnalyticsData = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    usersByTime: [],
    solutionPopularity: [],
    implementationsByCategory: [],
    userCompletionRate: [],
    dayOfWeekActivity: []
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Buscar dados de usuários
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('created_at');
        
        if (userError) throw userError;

        // Buscar dados de progresso
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('solution_id, is_completed, created_at');
        
        if (progressError) throw progressError;

        // Buscar dados de soluções
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('solutions')
          .select('id, title, category, difficulty');
        
        if (solutionsError) throw solutionsError;

        // Processar dados para gráficos
        const usersByTime = processUsersByTime(userData || []);
        const solutionPopularity = processSolutionPopularity(progressData || [], solutionsData || []);
        const implementationsByCategory = processImplementationsByCategory(progressData || [], solutionsData || []);
        const userCompletionRate = processCompletionRate(progressData || []);
        const dayOfWeekActivity = processDayOfWeekActivity(progressData || []);

        setData({
          usersByTime,
          solutionPopularity,
          implementationsByCategory,
          userCompletionRate,
          dayOfWeekActivity
        });

      } catch (error) {
        console.error("Erro ao carregar dados de análise:", error);
        toast({
          title: "Erro ao carregar análises",
          description: "Não foi possível carregar os dados de análise.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [toast, timeRange]);

  return { data, loading };
};
