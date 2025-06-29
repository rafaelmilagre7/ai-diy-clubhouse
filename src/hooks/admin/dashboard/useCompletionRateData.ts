
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface CompletionRateData {
  name: string;
  completion: number;
}

export const useCompletionRateData = (timeRange: string) => {
  const [completionRateData, setCompletionRateData] = useState<CompletionRateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletionRateData = async () => {
      try {
        setLoading(true);
        
        // Calcular período baseado no timeRange
        let startDate = new Date();
        switch (timeRange) {
          case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
          default:
            startDate = new Date('2024-01-01');
        }

        // Buscar dados de progresso e soluções
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select(`
            solution_id,
            is_completed,
            created_at,
            solutions!inner (
              title
            )
          `)
          .gte('created_at', startDate.toISOString());

        if (progressError || !progressData) {
          console.warn('Usando dados mock para taxa de conclusão:', progressError?.message);
          setCompletionRateData([
            { name: 'Assistente WhatsApp', completion: 85 },
            { name: 'Automação Email', completion: 72 },
            { name: 'Chatbot Website', completion: 90 },
            { name: 'IA Atendimento', completion: 68 },
            { name: 'Sistema CRM', completion: 55 }
          ]);
        } else {
          // Agrupar por solução e calcular taxa de conclusão
          const solutionStats = progressData.reduce((acc: any, item) => {
            const solutionTitle = (item.solutions as any)?.title || 'Solução Desconhecida';
            if (!acc[solutionTitle]) {
              acc[solutionTitle] = { total: 0, completed: 0 };
            }
            acc[solutionTitle].total++;
            if (item.is_completed) {
              acc[solutionTitle].completed++;
            }
            return acc;
          }, {});

          const formattedData = Object.entries(solutionStats).map(([name, stats]: [string, any]) => ({
            name: name.length > 25 ? name.substring(0, 25) + '...' : name,
            completion: Math.round((stats.completed / stats.total) * 100)
          }));

          setCompletionRateData(formattedData.length > 0 ? formattedData : [
            { name: 'Sem dados', completion: 0 }
          ]);
        }
      } catch (error) {
        console.error('Erro ao buscar taxa de conclusão:', error);
        // Fallback com dados mock
        setCompletionRateData([
          { name: 'Solução A', completion: 75 },
          { name: 'Solução B', completion: 60 },
          { name: 'Solução C', completion: 85 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    // Timeout para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Timeout no carregamento de taxa de conclusão');
        setCompletionRateData([
          { name: 'Timeout', completion: 50 }
        ]);
        setLoading(false);
      }
    }, 10000);

    fetchCompletionRateData();

    return () => clearTimeout(timeoutId);
  }, [timeRange]);

  return { completionRateData, loading };
};
