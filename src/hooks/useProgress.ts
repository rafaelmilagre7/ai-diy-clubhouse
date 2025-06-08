
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { createSolutionCompletionNotification } from '@/lib/notifications/triggers';

export const useProgress = (solutionId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['progress', user?.id, solutionId],
    queryFn: async () => {
      if (!user || !solutionId) return null;

      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user && !!solutionId,
  });

  const completeModuleMutation = useMutation({
    mutationFn: async ({ moduleId }: { moduleId: string }) => {
      if (!user || !solutionId) throw new Error('Usuário ou solução não encontrada');

      // Buscar progresso atual
      const { data: currentProgress } = await supabase
        .from('progress')
        .select('completed_modules, is_completed')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .single();

      const completedModules = currentProgress?.completed_modules || [];
      
      if (!completedModules.includes(moduleId)) {
        completedModules.push(moduleId);
      }

      // Verificar se todas as módulos foram completados
      const { data: solution } = await supabase
        .from('solutions')
        .select('modules(id)')
        .eq('id', solutionId)
        .single();

      const totalModules = solution?.modules?.length || 0;
      const isCompleted = completedModules.length >= totalModules;

      // Atualizar progresso
      const { data, error } = await supabase
        .from('progress')
        .upsert({
          user_id: user.id,
          solution_id: solutionId,
          completed_modules: completedModules,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;

      // Se a solução foi completada, criar notificação
      if (isCompleted && !currentProgress?.is_completed) {
        await createSolutionCompletionNotification(user.id, solutionId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      toast.success('Módulo marcado como concluído!');
    },
    onError: (error: any) => {
      toast.error('Erro ao marcar módulo como concluído: ' + error.message);
    },
  });

  return {
    progress,
    isLoading,
    completeModule: completeModuleMutation.mutate,
    isCompletingModule: completeModuleMutation.isPending,
  };
};
