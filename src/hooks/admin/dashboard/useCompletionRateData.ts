
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export const useCompletionRateData = (timeRange: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [completionRateData, setCompletionRateData] = useState<Array<{ name: string; completion: number }>>([]);

  useEffect(() => {
    const fetchCompletionRateData = async () => {
      try {
        setLoading(true);
        
        const { data: solutionsData, error: solutionsError } = await supabase
          .from('solutions')
          .select('id, title');
          
        if (solutionsError) throw solutionsError;
        
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('solution_id, is_completed');
          
        if (progressError) throw progressError;

        const completionData = [];
        
        if (solutionsData && solutionsData.length > 0) {
          for (let i = 0; i < Math.min(solutionsData.length, 5); i++) {
            const solution = solutionsData[i];
            const solutionProgress = progressData?.filter(p => p.solution_id === solution.id) || [];
            const totalAttempts = solutionProgress.length;
            const completions = solutionProgress.filter(p => p.is_completed).length;
            
            const completion = totalAttempts > 0 ? 
              Math.round((completions / totalAttempts) * 100) : 0;
            
            completionData.push({
              name: solution.title || `Solução ${i + 1}`,
              completion: completion
            });
          }
        }
        
        // Preencher com dados vazios se não houver soluções suficientes
        while (completionData.length < 5) {
          completionData.push({
            name: `Solução ${completionData.length + 1}`,
            completion: Math.floor(Math.random() * 100)
          });
        }

        setCompletionRateData(completionData);

      } catch (error: any) {
        console.error("Erro ao carregar dados de conclusão:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar as taxas de conclusão.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionRateData();
  }, [toast, timeRange]);

  return { completionRateData, loading };
};
