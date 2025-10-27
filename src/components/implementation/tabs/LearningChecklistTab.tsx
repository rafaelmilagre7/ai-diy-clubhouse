import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { ChecklistItem } from "../content/checklist/ChecklistItem";
import { ChecklistProgress } from "../content/checklist/ChecklistProgress";
import { ChecklistLoading } from "../content/checklist/ChecklistLoading";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface LearningChecklistTabProps {
  solutionId: string;
  onComplete?: () => void;
}

interface ChecklistItemData {
  id: string;
  description: string;
  title?: string;
}

const LearningChecklistTab: React.FC<LearningChecklistTabProps> = ({ 
  solutionId, 
  onComplete 
}) => {
  const { user } = useAuth();

  // Buscar checklist da solução
  const { data: checklistItems, isLoading: loadingChecklist } = useQuery({
    queryKey: ['learning-checklist', solutionId],
    queryFn: async () => {
      console.log('🔍 [LearningChecklist] Buscando checklist para:', solutionId);
      
      // 1. Buscar em solutions.checklist_items ou implementation_steps
      const { data: solution } = await supabase
        .from('solutions')
        .select('checklist_items, implementation_steps')
        .eq('id', solutionId)
        .maybeSingle();

      if (solution?.checklist_items && Array.isArray(solution.checklist_items)) {
        console.log('✅ [LearningChecklist] Encontrado em checklist_items');
        return solution.checklist_items as ChecklistItemData[];
      }

      // 2. Fallback: extrair de implementation_steps
      if (solution?.implementation_steps && Array.isArray(solution.implementation_steps)) {
        console.log('✅ [LearningChecklist] Extraindo de implementation_steps');
        return solution.implementation_steps.map((step: any, idx: number) => ({
          id: step.id || `step-${idx}`,
          description: step.description || step.title || `Passo ${idx + 1}`,
          title: step.title
        }));
      }

      // 3. Buscar estrutura de checklist de QUALQUER usuário desta solução
      const { data: anyUserChecklist } = await supabase
        .from('unified_checklists')
        .select('checklist_data')
        .eq('solution_id', solutionId)
        .eq('checklist_type', 'implementation')
        .limit(1)
        .maybeSingle();

      if (anyUserChecklist?.checklist_data?.items && Array.isArray(anyUserChecklist.checklist_data.items)) {
        console.log('✅ [LearningChecklist] Usando estrutura de checklist existente');
        return anyUserChecklist.checklist_data.items.map((item: any) => ({
          id: item.id,
          description: item.description || item.title,
          title: item.title
        }));
      }

      console.log('⚠️ [LearningChecklist] Nenhum checklist encontrado');
      return [];
    },
  });

  // Buscar progresso do usuário (user_checklists)
  const { data: userProgress, refetch: refetchProgress } = useQuery({
    queryKey: ['user-checklist-progress', solutionId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data } = await supabase
        .from('user_checklists')
        .select('checked_items')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .maybeSingle();

      console.log('📊 [LearningChecklist] Progresso do usuário:', data?.checked_items);
      return data?.checked_items as Record<string, boolean> || {};
    },
    enabled: !!user,
  });

  // Função para atualizar item
  const handleCheckChange = async (itemId: string, checked: boolean) => {
    if (!user) {
      toast.error("Você precisa estar logado para marcar itens");
      return;
    }

    const updatedProgress = {
      ...userProgress,
      [itemId]: checked,
    };

    console.log('💾 [LearningChecklist] Salvando progresso:', { itemId, checked, updatedProgress });

    // Atualizar no banco
    const { error } = await supabase
      .from('user_checklists')
      .upsert({
        user_id: user.id,
        solution_id: solutionId,
        checked_items: updatedProgress,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ [LearningChecklist] Erro ao salvar:', error);
      toast.error("Erro ao salvar progresso");
      return;
    }

    refetchProgress();
    
    // Verificar se completou tudo
    const allChecked = checklistItems?.every(item => updatedProgress[item.id]);
    if (allChecked && onComplete) {
      console.log('🎉 [LearningChecklist] Checklist completo!');
      onComplete();
      toast.success("Parabéns! Você completou o checklist!");
    }
  };

  if (loadingChecklist) {
    return <ChecklistLoading />;
  }

  if (!checklistItems || checklistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum Checklist Disponível</h3>
        <p className="text-muted-foreground">
          Esta solução ainda não possui um checklist de implementação.
        </p>
      </div>
    );
  }

  const completedCount = checklistItems.filter(item => userProgress?.[item.id]).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Lista de Verificação</h3>
        <p className="text-muted-foreground">
          Marque os itens conforme você implementa a solução.
        </p>
      </div>

      <div className="space-y-3">
        {checklistItems.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            isChecked={userProgress?.[item.id] || false}
            onChange={(checked) => handleCheckChange(item.id, checked)}
            disabled={!user}
          />
        ))}
      </div>

      <ChecklistProgress
        completedItems={completedCount}
        totalItems={checklistItems.length}
      />
    </div>
  );
};

export default LearningChecklistTab;
