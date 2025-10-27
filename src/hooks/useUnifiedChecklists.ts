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
      
      console.log('🔍 [useUnifiedChecklist] EXECUTANDO queryFn (buscando do banco):', {
        userId: user.id,
        solutionId,
        checklistType,
        timestamp: new Date().toISOString()
      });

      console.log('🔍 [useUnifiedChecklist] Buscando userProgress (is_template: false):', { userId: user.id, solutionId, checklistType });

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
        console.error('❌ [useUnifiedChecklist] Erro ao buscar checklist:', error);
        return null;
      }

      console.log('✅ [useUnifiedChecklist] UserProgress carregado do banco:', {
        id: data?.id,
        updated_at: data?.updated_at,
        itemsCount: data?.checklist_data?.items?.length,
        allItemsColumns: data?.checklist_data?.items?.map((i: any) => ({ id: i.id, title: i.title, column: i.column }))
      });
      return data as UnifiedChecklistData;
    },
    enabled: !!user?.id && !!solutionId,
    staleTime: 0, // SEMPRE buscar dados frescos do banco
    gcTime: 0, // Não manter em cache
    refetchOnMount: 'always', // SEMPRE refetch ao montar o componente
    refetchOnWindowFocus: true, // Refetch quando a janela recebe foco
    refetchOnReconnect: true, // Refetch quando reconectar
  });
};

// Hook para buscar template do checklist
export const useUnifiedChecklistTemplate = (solutionId: string, checklistType: string = 'implementation') => {
  return useQuery({
    queryKey: ['unified-checklist-template', solutionId, checklistType],
    queryFn: async (): Promise<UnifiedChecklistData | null> => {
      console.log('🔍 Buscando template de checklist:', { solutionId, checklistType });

      // 1️⃣ PRIMEIRO: Tentar buscar template oficial
      const { data: templateData, error: templateError } = await supabase
        .from('unified_checklists')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('checklist_type', checklistType)
        .eq('is_template', true)
        .maybeSingle();

      if (templateError) {
        console.error('❌ Erro ao buscar template:', templateError);
      }

      if (templateData) {
        console.log('✅ Template oficial encontrado:', templateData.id);
        return templateData as UnifiedChecklistData;
      }

      // 2️⃣ FALLBACK: Se não há template, buscar qualquer checklist da solução
      console.log('⚠️ Template não encontrado, buscando checklist gerado...');
      
      const { data: anyChecklist, error: anyError } = await supabase
        .from('unified_checklists')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('checklist_type', checklistType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (anyError) {
        console.error('❌ Erro ao buscar checklist alternativo:', anyError);
        return null;
      }

      if (anyChecklist) {
        console.log('🔄 Usando checklist gerado como template:', anyChecklist.id);
        console.log('📋 Items encontrados:', anyChecklist.checklist_data?.items?.length || 0);
      }

      return anyChecklist as UnifiedChecklistData;
    },
    enabled: !!solutionId,
    staleTime: Infinity, // Template não muda durante uso normal
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

      console.log('💾 [useUpdateUnifiedChecklist] Salvando checklist:', { 
        checklistId: checklistData.id,
        solutionId, 
        checklistType,
        itemsCount: checklistData.checklist_data.items.length,
        allItemsColumns: checklistData.checklist_data.items.map(i => ({ id: i.id, title: i.title, column: i.column }))
      });

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

      // USAR UPSERT para evitar duplicatas
      console.log('💾 Upsert checklist:', {
        userId: user.id,
        solutionId,
        checklistType,
        hasId: !!checklistData.id,
        checklistId: checklistData.id,
        templateId,
        isCreatingNew: !checklistData.id || checklistData.id === templateId
      });

      // 🔥 FIX: Não usar o ID do template ao criar progresso do usuário
      const shouldUseExistingId = checklistData.id && checklistData.id !== templateId;

      const { data, error } = await supabase
        .from('unified_checklists')
        .upsert({
          ...(shouldUseExistingId && { id: checklistData.id }), // ✅ Só usar ID se for progresso existente
          user_id: user.id,
          solution_id: solutionId,
          template_id: templateId, // ✅ Sempre salvar referência ao template
          checklist_type: checklistType,
          is_template: false, // ✅ SEMPRE false para progresso de usuário
          ...updateData
        }, {
          onConflict: 'user_id,solution_id,checklist_type,is_template',
          ignoreDuplicates: false // Sempre atualizar se já existir
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao upsert:', error);
        throw error;
      }
      
      console.log('✅ [useUpdateUnifiedChecklist] Checklist salvo no banco com sucesso:', {
        id: data.id,
        updated_at: data.updated_at,
        allItemsColumns: data.checklist_data?.items?.map((i: any) => ({ id: i.id, title: i.title, column: i.column }))
      });
      return data;
    },
    onMutate: async (variables) => {
      const queryKey = ['unified-checklist', variables.solutionId, user?.id, variables.checklistType];
      
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot do estado anterior (para rollback)
      const previousData = queryClient.getQueryData(queryKey);
      
      // Atualizar cache otimisticamente
      queryClient.setQueryData(queryKey, variables.checklistData);
      
      console.log('⚡ [useUpdateUnifiedChecklist] Cache atualizado otimisticamente:', {
        checklistId: variables.checklistData.id,
        itemsColumns: variables.checklistData.checklist_data?.items?.map((i: any) => ({ id: i.id, column: i.column }))
      });
      
      return { previousData, queryKey };
    },
    onSuccess: (data, variables) => {
      console.log('✅ [useUpdateUnifiedChecklist] onSuccess - Invalidando cache:', {
        checklistId: data.id,
        queryKey: ['unified-checklist', variables.solutionId, data.user_id, variables.checklistType]
      });
      
      const queryKey = ['unified-checklist', variables.solutionId, data.user_id, variables.checklistType];
      
      // Invalidar IMEDIATAMENTE para forçar refetch
      queryClient.invalidateQueries({ 
        queryKey,
        exact: true,
        refetchType: 'active'
      });
      
      console.log('✅ [useUpdateUnifiedChecklist] Cache invalidado, refetch será acionado');
      
      // Também invalidar o template (caso tenha mudado)
      queryClient.invalidateQueries({ 
        queryKey: ['unified-checklist-template', variables.solutionId, variables.checklistType]
      });
    },
    onError: (error, variables, context) => {
      console.error('❌ Erro ao salvar checklist:', error);
      
      // Rollback em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
        console.log('↩️  Rollback aplicado ao cache');
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

      console.log('🎨 Criando template de checklist:', { solutionId, checklistType });

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
        queryKey: ['unified-checklist-template', variables.solutionId, variables.checklistType] 
      });
      toast.success('Template salvo com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao salvar template:', error);
      toast.error('Erro ao salvar template');
    }
  });
};