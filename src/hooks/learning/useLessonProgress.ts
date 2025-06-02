
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

export const useLessonProgress = (lessonId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  // Buscar progresso atual da aula
  const {
    data: progressData,
    isLoading
  } = useQuery({
    queryKey: ['lesson-progress', lessonId, user?.id],
    queryFn: async () => {
      if (!lessonId || !user?.id) return null;

      const { data, error } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar progresso:', error);
        return null;
      }

      return data;
    },
    enabled: !!lessonId && !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000 // 5 minutos
  });

  // Atualizar estado local quando dados chegarem
  useEffect(() => {
    if (progressData) {
      setProgress(progressData.progress_percentage || 0);
    }
  }, [progressData]);

  // Mutation para atualizar progresso
  const updateProgressMutation = useMutation({
    mutationFn: async (newProgress: number) => {
      if (!lessonId || !user?.id) throw new Error('Dados insuficientes');

      const now = new Date().toISOString();

      if (progressData) {
        // Atualizar progresso existente
        const { data, error } = await supabase
          .from('learning_progress')
          .update({
            progress_percentage: newProgress,
            updated_at: now,
            completed_at: newProgress >= 100 ? now : progressData.completed_at
          })
          .eq('id', progressData.id)
          .select();

        if (error) throw error;
        return data[0];
      } else {
        // Criar novo progresso
        const { data, error } = await supabase
          .from('learning_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            progress_percentage: newProgress,
            started_at: now,
            completed_at: newProgress >= 100 ? now : null
          })
          .select();

        if (error) throw error;
        return data[0];
      }
    },
    onSuccess: (data) => {
      setProgress(data.progress_percentage || 0);
      queryClient.invalidateQueries({
        queryKey: ['lesson-progress', lessonId, user?.id]
      });
      queryClient.invalidateQueries({
        queryKey: ['user-learning-progress', user?.id]
      });
    }
  });

  // Função para atualizar progresso de vídeo
  const updateProgress = (videoId: string, videoProgress: number) => {
    // Lógica simplificada: usar o progresso do vídeo atual
    if (videoProgress > progress) {
      updateProgressMutation.mutate(Math.min(videoProgress, 100));
    }
  };

  // Função para marcar como concluída
  const markAsCompleted = async () => {
    await updateProgressMutation.mutateAsync(100);
  };

  const isCompleted = progress >= 100;

  return {
    progress,
    isCompleted,
    updateProgress,
    markAsCompleted,
    isLoading,
    isUpdating: updateProgressMutation.isPending
  };
};
