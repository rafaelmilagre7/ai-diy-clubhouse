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

  // Buscar checklist template da solução
  const { data: checklistItems, isLoading: loadingChecklist } = useQuery({
    queryKey: ['learning-checklist-template', solutionId],
    queryFn: async () => {
      console.log('🔍 [LearningChecklist] Buscando template para:', solutionId);
      
      // Buscar template em unified_checklists (cadastrado no admin)
      const { data: template } = await supabase
        .from('unified_checklists')
        .select('checklist_data')
        .eq('solution_id', solutionId)
        .eq('checklist_type', 'implementation')
        .eq('is_template', true)
        .maybeSingle();

      if (template?.checklist_data?.items && Array.isArray(template.checklist_data.items)) {
        console.log('✅ [LearningChecklist] Template encontrado:', template.checklist_data.items.length, 'itens');
        return template.checklist_data.items as ChecklistItemData[];
      }

      console.log('⚠️ [LearningChecklist] Nenhum template encontrado');
      return [];
    },
  });

  // Buscar progresso do usuário (não é template)
  const { data: userProgress, refetch: refetchProgress } = useQuery({
    queryKey: ['learning-user-progress', solutionId, user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      const { data } = await supabase
        .from('unified_checklists')
        .select('checklist_data')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .eq('checklist_type', 'implementation')
        .eq('is_template', false)
        .maybeSingle();

      const items = data?.checklist_data?.items || [];
      const progress: Record<string, boolean> = {};
      items.forEach((item: any) => {
        progress[item.id] = item.checked || false;
      });

      console.log('📊 [LearningChecklist] Progresso do usuário:', progress);
      return progress;
    },
    enabled: !!user?.id,
  });

  // Função para atualizar item
  const handleCheckChange = async (itemId: string, checked: boolean) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para marcar itens");
      return;
    }

    // Buscar checklist atual do usuário
    const { data: currentData } = await supabase
      .from('unified_checklists')
      .select('checklist_data')
      .eq('user_id', user.id)
      .eq('solution_id', solutionId)
      .eq('checklist_type', 'implementation')
      .eq('is_template', false)
      .maybeSingle();

    // Atualizar os itens com o novo estado
    const updatedItems = checklistItems?.map(item => ({
      id: item.id,
      description: item.description,
      title: item.title,
      checked: item.id === itemId ? checked : (userProgress?.[item.id] || false)
    }));

    console.log('💾 [LearningChecklist] Salvando progresso:', { itemId, checked });

    // Salvar no banco
    const { error } = await supabase
      .from('unified_checklists')
      .upsert({
        user_id: user.id,
        solution_id: solutionId,
        checklist_type: 'implementation',
        is_template: false,
        checklist_data: {
          items: updatedItems,
          lastUpdated: new Date().toISOString()
        },
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ [LearningChecklist] Erro ao salvar:', error);
      toast.error("Erro ao salvar progresso");
      return;
    }

    refetchProgress();
    
    // Verificar se completou tudo
    const allChecked = updatedItems?.every(item => item.checked);
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
