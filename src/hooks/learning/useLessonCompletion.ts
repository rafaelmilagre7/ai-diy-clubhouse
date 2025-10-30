import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface UseLessonCompletionOptions {
  lessonId: string;
  initialCompleted?: boolean;
  onSuccess?: () => void;
}

export const useLessonCompletion = ({ lessonId, initialCompleted = false, onSuccess }: UseLessonCompletionOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCompleted, setIsCompleted] = useState(false);

  const completeMutation = useMutation({
    mutationFn: async () => {
      console.log('🚀 [MUTATION] Iniciando mutation...');
      console.log('👤 [MUTATION] User ID:', user?.id);
      console.log('📚 [MUTATION] Lesson ID:', lessonId);
      
      if (!user?.id) {
        console.error('❌ [MUTATION] User ID ausente!');
        throw new Error("Usuário não autenticado");
      }

      const rpcParams = {
        p_lesson_id: lessonId,
        p_progress_percentage: 100,
        p_completed_at: new Date().toISOString()
      };

      console.log('📡 [MUTATION] Chamando RPC complete_lesson_v2 com:', rpcParams);

      const { data, error } = await supabase.rpc('complete_lesson_v2', rpcParams);

      if (error) {
        console.error('❌ [MUTATION] Erro retornado pela RPC:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ [MUTATION] Sucesso! Data retornada:', data);
      return data;
    },
    onSuccess: (data) => {
      setIsCompleted(true);
      
      // Invalidar query local primeiro (para UI imediata)
      queryClient.invalidateQueries({ queryKey: ["learning-progress", lessonId] });
      
      // Invalidar queries globais (para sincronização)
      queryClient.invalidateQueries({ queryKey: ["learning-user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["learning-course-stats"] });
      queryClient.invalidateQueries({ queryKey: ["course-details"] });
      queryClient.invalidateQueries({ queryKey: ["learning-completed-lessons"] });
      
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
