

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface LessonNPSOptions {
  lessonId: string;
}

interface SubmitNPSData {
  score: number;
  feedback?: string;
}

export const useLessonNPS = ({ lessonId }: LessonNPSOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar avaliação NPS existente para esta aula e usuário
  const { data: existingNPS, isLoading } = useQuery({
    queryKey: ['lesson-nps', lessonId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('learning_lesson_nps')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar NPS:", error);
        return null;
      }

      return data;
    },
    enabled: !!user && !!lessonId
  });

  // Mutação para enviar uma nova avaliação NPS
  const submitNPSMutation = useMutation({
    mutationFn: async ({ score, feedback }: SubmitNPSData) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      console.log('[LESSON-NPS] 💾 ============ INICIANDO RPC safe_insert_or_update_lesson_nps ============');
      console.log('[LESSON-NPS] Parâmetros:', {
        p_lesson_id: lessonId,
        p_score: score,
        p_feedback: feedback?.substring(0, 50) || 'sem feedback',
        user_id: user.id
      });
      
      const { data: result, error } = await supabase.rpc('safe_insert_or_update_lesson_nps', {
        p_lesson_id: lessonId,
        p_score: score,
        p_feedback: feedback || null
      });
      
      if (error) {
        console.error('[LESSON-NPS] ❌ ============ ERRO NA RPC ============');
        console.error('[LESSON-NPS] Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Falha ao salvar avaliação: ${error.message}`);
      }

      console.log('[LESSON-NPS] ✅ ============ RPC EXECUTADA COM SUCESSO ============');
      console.log('[LESSON-NPS] Resultado:', result);
      return result;
    },
    onSuccess: () => {
      console.log('[LESSON-NPS] ✅ Mutation onSuccess - Invalidando todos os caches');
      toast.success('Sua avaliação foi enviada com sucesso!');
      
      // Invalidar TODOS os caches relacionados
      queryClient.invalidateQueries({ queryKey: ['lesson-nps', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['learning-lesson-progress', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['learning-user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['course-details'] });
      queryClient.invalidateQueries({ queryKey: ['learning-completed-lessons'] });
      
      console.log('[LESSON-NPS] ✅ Caches invalidados com sucesso');
    },
    onError: (error) => {
      console.error('[LESSON-NPS] ❌ Erro ao enviar avaliação:', error);
      toast.error(`Erro: ${error.message}`);
    }
  });

  const submitNPS = async (score: number, feedback?: string) => {
    console.log('[LESSON-NPS] 🎯 Enviando NPS:', { score, feedback: feedback?.substring(0, 50) });
    return await submitNPSMutation.mutateAsync({ score, feedback });
  };

  return {
    existingNPS,
    isLoading,
    isSubmitting: submitNPSMutation.isPending,
    submitNPS
  };
};

export default useLessonNPS;
