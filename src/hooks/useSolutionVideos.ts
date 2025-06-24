
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';

export interface SolutionVideo {
  id: string;
  solution_id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  video_type: 'youtube' | 'vimeo' | 'direct';
  order_index: number;
  created_at: string;
}

export const useSolutionVideos = (solutionId: string) => {
  const { log, logError } = useLogging();

  const { data: videos = [], isLoading: loading, error } = useQuery({
    queryKey: ['solution-videos', solutionId],
    queryFn: async () => {
      if (!solutionId) return [];

      log('Buscando vídeos da solução', { solutionId });

      try {
        const { data, error } = await supabase
          .from('solution_videos')
          .select('*')
          .eq('solution_id', solutionId as any)
          .order('order_index', { ascending: true });

        if (error) throw error;

        log('Vídeos da solução carregados', { count: data?.length || 0 });
        return (data as any[]) || [];
      } catch (error) {
        logError('Erro ao buscar vídeos da solução', error);
        throw error;
      }
    },
    enabled: !!solutionId
  });

  return { videos, loading, error };
};
