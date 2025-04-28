
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { LessonVideo } from '@/types/learningTypes';
import { toast } from 'sonner';

export const useLessonVideos = (lessonId: string) => {
  const queryClient = useQueryClient();

  // Buscar vídeos de uma aula
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['admin-lesson-videos', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];

      const { data, error } = await supabase
        .from('learning_lesson_videos')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });

      if (error) {
        toast.error('Erro ao carregar vídeos');
        throw error;
      }

      return data as LessonVideo[];
    },
    enabled: !!lessonId,
  });

  // Adicionar vídeo
  const addVideo = useMutation({
    mutationFn: async (video: Partial<LessonVideo>) => {
      const { data, error } = await supabase
        .from('learning_lesson_videos')
        .insert(video)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao adicionar vídeo');
        throw error;
      }

      return data as LessonVideo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-videos', lessonId] });
    },
  });

  // Remover vídeo
  const removeVideo = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from('learning_lesson_videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        toast.error('Erro ao remover vídeo');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-videos', lessonId] });
    },
  });

  return {
    videos,
    isLoading,
    error,
    addVideo,
    removeVideo,
    isUpdating: addVideo.isPending || removeVideo.isPending
  };
};
