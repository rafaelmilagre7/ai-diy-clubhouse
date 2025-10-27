import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface UnifiedChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  notes?: string;
  completedAt?: string;
  column?: 'todo' | 'in_progress' | 'done';
  order?: number;
  metadata?: any; // Dados extras como estimated_time, difficulty, etc
}

// Helper para normalizar items (garantir coluna e ordem)
export const normalizeChecklistItems = (items: UnifiedChecklistItem[]): UnifiedChecklistItem[] => {
  return items.map((item, index) => ({
    ...item,
    column: item.column || (item.completed ? 'done' : 'todo'),
    order: item.order !== undefined ? item.order : index
  }));
};

export interface UnifiedChecklistData {
  id?: string;
  user_id: string;
  solution_id: string;
  template_id?: string;
  checklist_type: 'implementation' | 'user' | 'verification';
  checklist_data: {
    items: UnifiedChecklistItem[];
    lastUpdated: string;
  };
  completed_items: number;
  total_items: number;
  progress_percentage: number;
  is_completed: boolean;
  is_template: boolean;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  metadata?: any;
}

// Hook para buscar checklist do usuário
export const useUnifiedChecklist = (solutionId: string, checklistType: string = 'implementation') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unified-checklist', solutionId, user?.id, checklistType],
    queryFn: async (): Promise<UnifiedChecklistData | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('unified_checklists')
        .select('*')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .eq('checklist_type', checklistType)
        .eq('is_template', false)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar checklist do usuário:', error);
        return null;
      }
      
      return data as UnifiedChecklistData;
    },
    enabled: !!user?.id && !!solutionId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// Hook para buscar template do checklist
export const useUnifiedChecklistTemplate = (solutionId: string, checklistType: string = 'implementation') => {
  console.log('🔍 [useUnifiedChecklistTemplate] Hook CHAMADO:', {
    solutionId,
    checklistType,
    timestamp: new Date().toISOString()
  });

  return useQuery({
    queryKey: ['unified-checklist-template', solutionId, checklistType],
    queryFn: async (): Promise<UnifiedChecklistData | null> => {
      console.log('🌐 [useUnifiedChecklistTemplate] Executando query no Supabase:', {
        solutionId,
        checklistType
      });

      const { data: templateData, error: templateError } = await supabase
        .from('unified_checklists')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('checklist_type', checklistType)
        .eq('is_template', true)
        .maybeSingle();

      console.log('📥 [useUnifiedChecklistTemplate] Resposta do Supabase:', {
        hasData: !!templateData,
        hasError: !!templateError,
        errorMessage: templateError?.message,
        dataId: templateData?.id,
        itemsCount: templateData?.checklist_data?.items?.length
      });

      if (templateError) {
        console.error('Erro ao buscar template:', templateError);
        return null;
      }

      if (!templateData) return null;

      // Normalizar dados para garantir estrutura completa
      const items = Array.isArray(templateData.checklist_data?.items) 
        ? templateData.checklist_data.items 
        : [];

      const normalizedData: UnifiedChecklistData = {
        ...templateData,
        user_id: templateData.user_id || '', // Template pode não ter user
        solution_id: templateData.solution_id,
        template_id: templateData.id,
        checklist_type: templateData.checklist_type,
        is_template: true,
        checklist_data: {
          items: items,
          lastUpdated: templateData.checklist_data?.lastUpdated || templateData.updated_at || new Date().toISOString()
        },
        // ✅ CAMPOS CALCULADOS (necessários pela interface)
        total_items: items.length,
        completed_items: 0, // Templates começam zerados
        progress_percentage: 0,
        is_completed: false,
        created_at: templateData.created_at,
        updated_at: templateData.updated_at,
        completed_at: null
      };

      console.log('🔧 [Hook] Template normalizado:', {
        hasItems: items.length > 0,
        itemsCount: items.length,
        hasAllRequiredFields: !!(normalizedData.user_id !== undefined && normalizedData.total_items !== undefined)
      });

      return normalizedData;
    },
    enabled: !!solutionId,
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: 'always',
  });
};

// Hook para atualizar checklist
export const useUpdateUnifiedChecklist = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      checklistData, 
      solutionId, 
      checklistType = 'implementation',
      templateId,
    }: {
      checklistData: UnifiedChecklistData;
      solutionId: string;
      checklistType?: string;
      templateId?: string;
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      const completedItems = checklistData.checklist_data.items.filter(item => item.completed).length;
      const totalItems = checklistData.checklist_data.items.length;
      const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      const isCompleted = completedItems === totalItems && totalItems > 0;

      const updateData = {
        checklist_data: {
          ...checklistData.checklist_data,
          lastUpdated: new Date().toISOString()
        },
        completed_items: completedItems,
        total_items: totalItems,
        progress_percentage: progressPercentage,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      const isUpdate = checklistData.id && checklistData.id !== templateId;

      let data, error;

      if (isUpdate) {
        const result = await supabase
          .from('unified_checklists')
          .update({
            checklist_data: updateData.checklist_data,
            completed_items: updateData.completed_items,
            total_items: updateData.total_items,
            progress_percentage: updateData.progress_percentage,
            is_completed: updateData.is_completed,
            completed_at: updateData.completed_at,
            updated_at: updateData.updated_at
          })
          .eq('id', checklistData.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
        
        if (error) {
          console.error('Erro ao atualizar checklist:', error);
        }
      } else {
        const result = await supabase
          .from('unified_checklists')
          .insert({
            user_id: user.id,
            solution_id: solutionId,
            template_id: templateId,
            checklist_type: checklistType,
            is_template: false,
            checklist_data: updateData.checklist_data,
            completed_items: updateData.completed_items,
            total_items: updateData.total_items,
            progress_percentage: updateData.progress_percentage,
            is_completed: updateData.is_completed,
            completed_at: updateData.completed_at,
            updated_at: updateData.updated_at
          })
          .select()
          .single();
        
        data = result.data;
        error = result.error;
        
        if (error) {
          console.error('Erro ao criar checklist:', error);
        }
      }

      if (error) throw error;
      
      return data;
    },
    onMutate: async (variables) => {
      const queryKey = ['unified-checklist', variables.solutionId, user?.id, variables.checklistType];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, variables.checklistData);
      return { previousData, queryKey };
    },
    onSuccess: (data, variables) => {
      const queryKey = ['unified-checklist', variables.solutionId, data.user_id, variables.checklistType];
      queryClient.setQueryData(queryKey, data);
      queryClient.invalidateQueries({ 
        queryKey,
        refetchType: 'none'
      });
    },
    onError: (error, variables, context) => {
      console.error('Erro ao salvar checklist:', error);
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast.error('Erro ao salvar progresso');
    }
  });
};

// Hook para criar template (admin)
export const useCreateUnifiedChecklistTemplate = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      solutionId, 
      checklistData, 
      checklistType = 'implementation' 
    }: {
      solutionId: string;
      checklistData: any;
      checklistType?: string;
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Verificar se já existe template
      const { data: existing } = await supabase
        .from('unified_checklists')
        .select('id')
        .eq('solution_id', solutionId)
        .eq('checklist_type', checklistType)
        .eq('is_template', true)
        .maybeSingle();

      const templateData = {
        user_id: user.id,
        solution_id: solutionId,
        checklist_type: checklistType,
        checklist_data: {
          items: checklistData.items || [],
          lastUpdated: new Date().toISOString()
        },
        total_items: checklistData.items?.length || 0,
        is_template: true,
        metadata: checklistData.metadata || {}
      };

      if (existing) {
        // Atualizar template existente
        const { data, error } = await supabase
          .from('unified_checklists')
          .update(templateData)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar novo template
        const { data, error } = await supabase
          .from('unified_checklists')
          .insert(templateData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['unified-checklist-template', variables.solutionId, variables.checklistType],
        refetchType: 'active' // ✅ Forçar refetch ativo
      });
      toast.success('Template salvo com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao salvar template:', error);
      toast.error('Erro ao salvar template');
    }
  });
};