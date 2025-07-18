// FASE 1: Hook para salvar checklists na nova tabela implementation_checkpoints
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ChecklistData {
  solutionId: string;
  userId: string;
  checkpointData: any;
  completedSteps: string[];
  totalSteps: number;
  progressPercentage: number;
  lastCompletedStep?: string;
}

export const useChecklistSave = () => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const saveChecklist = async (data: ChecklistData) => {
    const requestId = `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      setSaving(true);
      console.log(`💾 [CHECKLIST_SAVE_${requestId}] Salvando checklist:`, data);

      const { data: existingCheckpoint, error: fetchError } = await supabase
        .from('implementation_checkpoints')
        .select('*')
        .eq('user_id', data.userId)
        .eq('solution_id', data.solutionId)
        .maybeSingle();

      if (fetchError) {
        console.error(`❌ [CHECKLIST_SAVE_${requestId}] Erro ao buscar checkpoint existente:`, fetchError);
        throw new Error(`Erro ao verificar checkpoint: ${fetchError.message}`);
      }

      let result;

      if (existingCheckpoint) {
        console.log(`🔄 [CHECKLIST_SAVE_${requestId}] Atualizando checkpoint existente:`, existingCheckpoint.id);
        
        const { data: updatedData, error: updateError } = await supabase
          .from('implementation_checkpoints')
          .update({
            checkpoint_data: data.checkpointData,
            completed_steps: data.completedSteps,
            total_steps: data.totalSteps,
            progress_percentage: data.progressPercentage,
            last_completed_step: data.lastCompletedStep,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCheckpoint.id)
          .select()
          .single();

        if (updateError) {
          console.error(`❌ [CHECKLIST_SAVE_${requestId}] Erro ao atualizar:`, updateError);
          throw new Error(`Erro ao atualizar checklist: ${updateError.message}`);
        }

        result = updatedData;
      } else {
        console.log(`➕ [CHECKLIST_SAVE_${requestId}] Criando novo checkpoint`);
        
        const { data: newData, error: insertError } = await supabase
          .from('implementation_checkpoints')
          .insert({
            user_id: data.userId,
            solution_id: data.solutionId,
            checkpoint_data: data.checkpointData,
            completed_steps: data.completedSteps,
            total_steps: data.totalSteps,
            progress_percentage: data.progressPercentage,
            last_completed_step: data.lastCompletedStep
          })
          .select()
          .single();

        if (insertError) {
          console.error(`❌ [CHECKLIST_SAVE_${requestId}] Erro ao inserir:`, insertError);
          throw new Error(`Erro ao criar checklist: ${insertError.message}`);
        }

        result = newData;
      }

      console.log(`✅ [CHECKLIST_SAVE_${requestId}] Checklist salvo com sucesso:`, result);

      toast({
        title: "✅ Checklist salvo",
        description: "Seu progresso foi salvo com sucesso.",
      });

      return result;

    } catch (error: any) {
      console.error(`❌ [CHECKLIST_SAVE_${requestId}] Erro completo:`, error);
      console.error(`❌ [CHECKLIST_SAVE_${requestId}] Stack trace:`, error.stack);
      
      toast({
        title: "❌ Erro ao salvar checklist",
        description: error.message || "Erro desconhecido ao salvar seu progresso.",
        variant: "destructive",
      });

      throw error;
    } finally {
      setSaving(false);
    }
  };

  const loadChecklist = async (userId: string, solutionId: string) => {
    const requestId = `checklist_load_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`📖 [CHECKLIST_LOAD_${requestId}] Carregando checklist:`, { userId, solutionId });

      const { data, error } = await supabase
        .from('implementation_checkpoints')
        .select('*')
        .eq('user_id', userId)
        .eq('solution_id', solutionId)
        .maybeSingle();

      if (error) {
        console.error(`❌ [CHECKLIST_LOAD_${requestId}] Erro ao carregar:`, error);
        throw new Error(`Erro ao carregar checklist: ${error.message}`);
      }

      console.log(`✅ [CHECKLIST_LOAD_${requestId}] Checklist carregado:`, data);
      return data;

    } catch (error: any) {
      console.error(`❌ [CHECKLIST_LOAD_${requestId}] Erro completo:`, error);
      throw error;
    }
  };

  return {
    saveChecklist,
    loadChecklist,
    saving
  };
};