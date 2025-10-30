import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface UseLessonCompletionOptions {
  lessonId: string;
  onSuccess?: () => void;
}

export const useLessonCompletion = ({ lessonId, onSuccess }: UseLessonCompletionOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCompleted, setIsCompleted] = useState(false);

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }

      console.log('🎯 [LESSON-COMPLETION] Iniciando conclusão:', { lessonId, userId: user.id });

      // Chamar nova RPC simplificada
      const { data, error } = await supabase.rpc('complete_lesson_v2', {
        p_lesson_id: lessonId,
        p_progress_percentage: 100,
        p_completed_at: new Date().toISOString()
      });

      if (error) {
        console.error('❌ [LESSON-COMPLETION] Erro:', error);
        throw error;
      }

      console.log('✅ [LESSON-COMPLETION] Sucesso:', data);
      return data;
    },
    onSuccess: (data) => {
      setIsCompleted(true);
      
      // Invalidar caches relevantes
      queryClient.invalidateQueries({ queryKey: ["learning-user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["learning-course-stats"] });
      queryClient.invalidateQueries({ queryKey: ["learning-progress", lessonId] });
      
      toast.success("Aula concluída com sucesso!");
      
      // Callback customizado
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('❌ [LESSON-COMPLETION] Erro na mutation:', error);
      toast.error(error.message || "Erro ao concluir aula");
    }
  });

  return {
    completeLesson: () => completeMutation.mutate(),
    isCompleting: completeMutation.isPending,
    isCompleted,
    error: completeMutation.error
  };
};
