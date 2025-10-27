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

      console.log('🔍 Buscando checklist unificado:', { userId: user.id, solutionId, checklistType });

      const { data, error } = await supabase
        .from('unified_checklists')
        .select('*')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .eq('checklist_type', checklistType)
        .eq('is_template', false)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar checklist:', error);
        return null;
      }

      console.log('✅ Checklist encontrado:', data);
      return data as UnifiedChecklistData;
    },
    enabled: !!user?.id && !!solutionId
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
    // ✨ FASE 3: Configurações de cache agressivas para detecção rápida
    staleTime: 0, // Dados sempre considerados "stale"
    gcTime: 1000 * 60, // Cache limpo após 1 minuto sem uso
    refetchInterval: 5000, // Refetch automático a cada 5s
    refetchIntervalInBackground: false, // Não refetch se usuário saiu da aba
    refetchOnMount: 'always', // Sempre refetch ao montar
    refetchOnWindowFocus: true, // Refetch ao focar janela
    retry: 3, // Tentar 3 vezes em caso de erro
    retryDelay: 1000 // 1s entre retries
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

      console.log('💾 Salvando checklist:', { 
        checklistId: checklistData.id,
        solutionId, 
        checklistType,
        itemsCount: checklistData.checklist_data.items.length 
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

      if (checklistData.id) {
        // Atualizar existente
        console.log('📝 Atualizando checklist existente:', checklistData.id);
        
        const { data, error } = await supabase
          .from('unified_checklists')
          .update(updateData)
          .eq('id', checklistData.id)
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao atualizar:', error);
          throw error;
        }
        
        console.log('✅ Checklist atualizado com sucesso');
        return data;
      } else {
        // Criar novo
        console.log('✨ Criando novo checklist');
        
        const { data, error } = await supabase
          .from('unified_checklists')
          .insert({
            user_id: user.id,
            solution_id: solutionId,
            template_id: templateId,
            checklist_type: checklistType,
            is_template: false,
            ...updateData
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Erro ao criar:', error);
          throw error;
        }
        
        console.log('✅ Checklist criado com sucesso:', data.id);
        return data;
      }
    },
    onSuccess: (data, variables) => {
      console.log('🔄 Invalidando queries após sucesso');
      
      // Sempre invalidar queries para garantir sincronização
      queryClient.invalidateQueries({ 
        queryKey: ['unified-checklist', variables.solutionId, user?.id, variables.checklistType] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['unified-checklist-template', variables.solutionId, variables.checklistType] 
      });
    },
    onError: (error) => {
      console.error('❌ Erro ao salvar checklist:', error);
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