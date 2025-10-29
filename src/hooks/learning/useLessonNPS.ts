
import { useState } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      
      setIsSubmitting(true);
      
      try {
        // Verificar rate limiting para novas avaliações
        if (!existingNPS) {
          const { data: canRate } = await supabase.rpc('check_nps_rate_limit', {
            p_user_id: user.id,
            p_lesson_id: lessonId
          });

          if (!canRate) {
            throw new Error('Você já avaliou esta aula hoje. Tente novamente amanhã.');
          }
        }

        let result;
        
        // Se já existe uma avaliação, atualiza
        if (existingNPS) {
          const { data, error } = await supabase
            .from('learning_lesson_nps')
            .update({ 
              score, 
              feedback: feedback || null,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingNPS.id)
            .select()
            .single();
            
          if (error) throw error;
          result = data;

          // Log da atualização
          await supabase.rpc('log_learning_action', {
            p_action: 'nps_updated',
            p_resource_type: 'lesson',
            p_resource_id: lessonId,
            p_details: {
              score,
              feedback_length: feedback?.length || 0,
              previous_score: existingNPS.score
            }
          });
        } 
        // Caso contrário, cria nova
        else {
          const { data, error } = await supabase
            .from('learning_lesson_nps')
            .insert({
              lesson_id: lessonId,
              user_id: user.id,
              score,
              feedback: feedback || null
            })
            .select()
            .single();
            
          if (error) throw error;
          result = data;

          // Log da nova avaliação
          await supabase.rpc('log_learning_action', {
            p_action: 'nps_created',
            p_resource_type: 'lesson',
            p_resource_id: lessonId,
            p_details: {
              score,
              feedback_length: feedback?.length || 0,
              nps_id: data.id
            }
          });
        }

        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast.success('Sua avaliação foi enviada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['lesson-nps', lessonId, user?.id] });
    },
    onError: (error) => {
      console.error('Erro ao enviar avaliação:', error);
      toast.error(`Erro: ${error.message}`);
    }
  });

  const submitNPS = (score: number, feedback?: string) => {
    submitNPSMutation.mutate({ score, feedback });
  };

  return {
    existingNPS,
    isLoading,
    isSubmitting,
    submitNPS
  };
};

export default useLessonNPS;
