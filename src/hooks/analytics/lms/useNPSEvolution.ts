import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { NPSEvolutionData, NPSMonthlyEvolution, NPSByCourse, NPSCourseEvolution } from './types';

interface UseNPSEvolutionOptions {
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export const useNPSEvolution = (options?: UseNPSEvolutionOptions) => {
  return useQuery({
    queryKey: ['nps-evolution', options?.dateRange],
    queryFn: async (): Promise<NPSEvolutionData> => {
      console.log('[useNPSEvolution] Buscando dados de evolução...');

      const { data, error } = await supabase.rpc('get_nps_evolution_data', {
        p_start_date: options?.dateRange?.from?.toISOString(),
        p_end_date: options?.dateRange?.to?.toISOString()
      });

      if (error) {
        console.error('[useNPSEvolution] Erro ao buscar dados:', error);
        throw error;
      }

      console.log('[useNPSEvolution] Dados recebidos:', data);

      // Parse dos dados
      const monthlyEvolution: NPSMonthlyEvolution[] = (data?.monthly_evolution || []).map((item: any) => ({
        month: item.month,
        nps_score: item.nps_score || 0,
        total_responses: item.total_responses || 0,
        promoters: item.promoters || 0,
        neutrals: item.neutrals || 0,
        detractors: item.detractors || 0,
        avg_score: item.avg_score || 0
      }));

      const coursesNPS: NPSByCourse[] = (data?.course_nps || []).map((item: any) => ({
        course_id: item.course_id,
        course_title: item.course_title,
        nps_score: item.nps_score || 0,
        total_responses: item.total_responses || 0,
        promoters: item.promoters || 0,
        neutrals: item.neutrals || 0,
        detractors: item.detractors || 0,
        avg_score: item.avg_score || 0
      }));

      const courseEvolution: NPSCourseEvolution[] = (data?.course_evolution || []).map((item: any) => ({
        course_id: item.course_id,
        course_title: item.course_title,
        month: item.month,
        nps_score: item.nps_score || 0,
        total_responses: item.total_responses || 0
      }));

      return {
        monthlyEvolution,
        coursesNPS,
        courseEvolution
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false
  });
};
