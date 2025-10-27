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
      if (!user?.id) {
        console.log('⚠️ [useUnifiedChecklist] User ID não disponível');
        return null;
      }
      
      console.log('🔍 [useUnifiedChecklist] ========== BUSCANDO DO BANCO ==========');
      console.log('🔍 [useUnifiedChecklist] Params:', {
        userId: user.id,
        solutionId,
        checklistType,
        timestamp: new Date().toISOString()
      });

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
        console.error('❌ [useUnifiedChecklist] Erro:', error);
        return null;
      }

      if (data) {
        console.log('✅ [useUnifiedChecklist] ========== DADOS DO BANCO ==========');
        console.log('✅ ID:', data.id);
        console.log('✅ Updated:', data.updated_at);
        console.log('✅ Total items:', data.checklist_data?.items?.length);
        console.log('✅ Distribuição:', {
          todo: data.checklist_data?.items?.filter((i: any) => i.column === 'todo').length,
          in_progress: data.checklist_data?.items?.filter((i: any) => i.column === 'in_progress').length,
          done: data.checklist_data?.items?.filter((i: any) => i.column === 'done').length,
        });
        console.log('✅ Primeiros 3 items:', 
          data.checklist_data?.items?.slice(0, 3).map((i: any) => ({
            id: i.id,
            title: i.title?.substring(0, 35),
            column: i.column
          }))
        );
      } else {
        console.log('⚠️ [useUnifiedChecklist] Nenhum progresso encontrado para este usuário');
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
  return useQuery({
    queryKey: ['unified-checklist-template', solutionId, checklistType],
    queryFn: async (): Promise<UnifiedChecklistData | null> => {
      console.log('🔍 [useUnifiedChecklistTemplate] Buscando template:', { solutionId, checklistType });

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

      // 2️⃣ FALLBACK: Se não há template, buscar checklist de OUTRO usuário
      console.log('⚠️ Template não encontrado, buscando checklist de outro usuário como referência...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: anyChecklist, error: anyError } = await supabase
        .from('unified_checklists')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('checklist_type', checklistType)
        .neq('user_id', user?.id || '') // ✅ NUNCA usar progresso do próprio usuário
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (anyError) {
        console.error('❌ Erro ao buscar checklist alternativo:', anyError);
        return null;
      }

      if (anyChecklist) {
        console.log('🔄 Usando checklist de outro usuário como template:', anyChecklist.id);
        console.log('📋 Items encontrados:', anyChecklist.checklist_data?.items?.length || 0);
      } else {
        console.log('⚠️ Nenhum template ou checklist de outro usuário encontrado, retornando null');
      }

      // ❌ NÃO USAR CHECKLIST DE OUTROS USUÁRIOS! Isso causa o bug de posições erradas
      console.log('❌ [useUnifiedChecklistTemplate] REMOVIDO FALLBACK - retornando null');
      return null;
    },
    enabled: !!solutionId,
    staleTime: 0, // ✅ Sem cache para sempre buscar dados atualizados
    gcTime: 1000 * 60 * 10, // 10 minutos
    refetchOnMount: 'always', // ✅ Forçar reload ao montar componente
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

      // 🎯 SOLUÇÃO DEFINITIVA: UPDATE vs INSERT explícitos
      const isUpdate = checklistData.id && checklistData.id !== templateId;
      
      console.log('💾 [useUpdateUnifiedChecklist] Operação:', {
        type: isUpdate ? 'UPDATE' : 'INSERT',
        userId: user.id,
        solutionId,
        checklistType,
        checklistId: checklistData.id,
        templateId,
        itemsToSave: checklistData.checklist_data.items.length,
        firstItemColumn: checklistData.checklist_data.items[0]?.column
      });

      let data, error;

      if (isUpdate) {
        // ✅ UPDATE: Já existe progresso do usuário
        console.log('🔄 [UPDATE] Atualizando registro existente:', checklistData.id);
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
          .eq('user_id', user.id) // Segurança adicional
          .select()
          .single();
        
        data = result.data;
        error = result.error;
        
        if (error) {
          console.error('❌ [UPDATE] Erro:', error);
          console.error('❌ [UPDATE] RLS Debug:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            user_id: user.id,
            checklist_id: checklistData.id
          });
        } else {
          console.log('✅ [UPDATE] Sucesso:', data?.id);
        }
      } else {
        // ✅ INSERT: Primeira vez salvando progresso
        console.log('➕ [INSERT] Criando novo registro de progresso');
        console.log('➕ [INSERT] Dados a inserir:', {
          user_id: user.id,
          solution_id: solutionId,
          template_id: templateId,
          checklist_type: checklistType,
          items_count: checklistData.checklist_data.items.length,
          first_item: checklistData.checklist_data.items[0]
        });
        
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
          console.error('❌ [INSERT] Erro ao inserir:', error);
          console.error('❌ [INSERT] Error details:', JSON.stringify(error, null, 2));
          console.error('❌ [INSERT] RLS Debug:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            user_id: user.id,
            auth_uid_available: !!user.id
          });
        } else {
          console.log('✅ [INSERT] Sucesso! Novo ID:', data?.id);
          console.log('✅ [INSERT] Dados salvos:', {
            id: data?.id,
            user_id: data?.user_id,
            items_count: data?.checklist_data?.items?.length
          });
        }
      }

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
      console.log('✅ [useUpdateUnifiedChecklist] onSuccess:', {
        savedId: data.id,
        savedItemsCount: data.checklist_data?.items?.length,
        distribution: {
          todo: data.checklist_data?.items?.filter((i: any) => i.column === 'todo').length,
          in_progress: data.checklist_data?.items?.filter((i: any) => i.column === 'in_progress').length,
          done: data.checklist_data?.items?.filter((i: any) => i.column === 'done').length,
        }
      });
      
      const queryKey = ['unified-checklist', variables.solutionId, data.user_id, variables.checklistType];
      
      // ✅ Atualizar cache diretamente com os dados salvos (mais confiável que invalidar)
      queryClient.setQueryData(queryKey, data);
      console.log('✅ [useUpdateUnifiedChecklist] Cache ATUALIZADO diretamente com dados do banco');
      
      // Invalidar também para garantir sincronização em background
      queryClient.invalidateQueries({ 
        queryKey,
        refetchType: 'none' // Não refetch imediatamente, acabamos de atualizar
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