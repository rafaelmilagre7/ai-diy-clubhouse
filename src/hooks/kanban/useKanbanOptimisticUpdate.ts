import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UnifiedChecklistItem, UnifiedChecklistData } from '@/hooks/useUnifiedChecklists';

interface UpdateItemParams {
  itemId: string;
  updates: Partial<UnifiedChecklistItem>;
  checklistData: UnifiedChecklistData;
  solutionId: string;
  checklistType: string;
  templateId?: string;
}

export const useKanbanOptimisticUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ checklistData, solutionId, checklistType, templateId }: UpdateItemParams) => {
      console.log('💾 [useKanbanOptimisticUpdate] Salvando:', {
        checklistId: checklistData.id,
        hasId: !!checklistData.id,
        userId: checklistData.user_id,
        solutionId,
        checklistType,
        itemsCount: checklistData.checklist_data?.items?.length
      });

      // ✅ UPSERT: Se tem ID, UPDATE. Se não tem, INSERT.
      const payload = {
        solution_id: solutionId,
        user_id: checklistData.user_id,
        checklist_type: checklistType,
        template_id: templateId || null,
        checklist_data: checklistData.checklist_data,
        completed_items: checklistData.completed_items,
        total_items: checklistData.total_items,
        progress_percentage: checklistData.progress_percentage,
        is_completed: checklistData.is_completed,
        updated_at: new Date().toISOString()
      };

      if (checklistData.id) {
        // UPDATE existente
        const { data, error } = await supabase
          .from('unified_checklists')
          .update(payload)
          .eq('id', checklistData.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro no UPDATE:', error);
          throw error;
        }
        console.log('✅ UPDATE bem-sucedido:', data.id);
        return data;
      } else {
        // INSERT novo
        const { data, error } = await supabase
          .from('unified_checklists')
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro no INSERT:', error);
          throw error;
        }
        console.log('✅ INSERT bem-sucedido:', data.id);
        return data;
      }
    },
    onMutate: async ({ itemId, updates, checklistData, solutionId, checklistType }) => {
      // 1. Cancelar queries em andamento
      const queryKey = ['unified-checklist', solutionId, checklistData.user_id, checklistType];
      await queryClient.cancelQueries({ queryKey });

      // 2. Snapshot do estado atual
      const previousData = queryClient.getQueryData(queryKey);

      // 3. Atualizar cache otimisticamente
      queryClient.setQueryData(queryKey, (old: UnifiedChecklistData | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          checklist_data: {
            ...old.checklist_data,
            items: old.checklist_data.items.map((item: UnifiedChecklistItem) =>
              item.id === itemId ? { ...item, ...updates } : item
            )
          }
        };
      });

      // 4. Retornar snapshot para rollback
      return { previousData, queryKey };
    },
    onError: (err, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      console.error('Erro no update otimista:', err);
      toast.error('Erro ao atualizar. Suas mudanças foram revertidas.');
    },
    onSettled: (data, error, variables) => {
      // Refetch para garantir sincronização
      const queryKey = ['unified-checklist', variables.solutionId, variables.checklistData.user_id, variables.checklistType];
      queryClient.invalidateQueries({ queryKey });
    }
  });
};
