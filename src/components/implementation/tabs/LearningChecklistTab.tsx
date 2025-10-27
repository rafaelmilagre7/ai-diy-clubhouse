import React, { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { ChecklistProgress } from "../content/checklist/ChecklistProgress";
import { ChecklistLoading } from "../content/checklist/ChecklistLoading";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getChecklistTemplate } from "@/lib/supabase/rpc";
import SimpleKanban from "@/components/unified-checklist/kanban/SimpleKanban";
import { UnifiedChecklistData } from "@/hooks/useUnifiedChecklists";

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

  const { data: checklistItems, isLoading: loadingChecklist, error: checklistError } = useQuery({
    queryKey: ['learning-checklist-template', solutionId],
    queryFn: async () => {
      const rpcData = await getChecklistTemplate(solutionId, 'implementation');
      
      if (rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        const template = rpcData[0];
        if (template?.checklist_data?.items && Array.isArray(template.checklist_data.items)) {
          return template.checklist_data.items as ChecklistItemData[];
        }
      }
      
      return [];
    },
  });

  // Buscar checklist pessoal do usuário
  const { data: userChecklist, refetch: refetchUserChecklist } = useQuery({
    queryKey: ['user-checklist', solutionId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data } = await supabase
        .from('unified_checklists')
        .select('*')
        .eq('user_id', user.id)
        .eq('solution_id', solutionId)
        .eq('checklist_type', 'implementation')
        .eq('is_template', false)
        .maybeSingle();
      
      return data as UnifiedChecklistData | null;
    },
    enabled: !!user?.id && !!checklistItems,
  });

  // Criar checklist pessoal se não existir
  useEffect(() => {
    if (!user?.id || !checklistItems || userChecklist !== null || loadingChecklist) return;
    
    const createUserChecklist = async () => {
      const itemsWithColumns = checklistItems.map(item => ({
        ...item,
        column: 'todo',
        completed: false,
        checked: false,
        notes: ''
      }));
      
      const { error } = await supabase
        .from('unified_checklists')
        .insert({
          user_id: user.id,
          solution_id: solutionId,
          checklist_type: 'implementation',
          is_template: false,
          checklist_data: {
            items: itemsWithColumns,
            lastUpdated: new Date().toISOString()
          },
          completed_items: 0,
          total_items: itemsWithColumns.length,
          progress_percentage: 0,
          is_completed: false,
        });
      
      if (!error) {
        refetchUserChecklist();
      }
    };
    
    createUserChecklist();
  }, [user?.id, checklistItems, userChecklist, loadingChecklist, solutionId, refetchUserChecklist]);

  // Calcular progresso baseado em items completos
  const completedCount = useMemo(() => {
    if (!userChecklist?.checklist_data?.items) return 0;
    return userChecklist.checklist_data.items.filter(item => item.completed).length;
  }, [userChecklist]);

  // Verificar conclusão total
  useEffect(() => {
    if (!userChecklist?.checklist_data?.items) return;
    
    const allDone = userChecklist.checklist_data.items.every(item => item.completed);
    
    if (allDone && onComplete) {
      onComplete();
      toast.success("🎉 Parabéns! Você completou todas as tarefas!");
    }
  }, [userChecklist, onComplete]);

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

  // Mostrar loading enquanto cria o checklist pessoal
  if (!userChecklist && user?.id) {
    return <ChecklistLoading />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Checklist de Implementação</h3>
        <p className="text-muted-foreground">
          Arraste os cards entre as colunas para organizar suas tarefas.
        </p>
      </div>

      {userChecklist ? (
        <SimpleKanban
          checklistItems={userChecklist.checklist_data?.items || []}
          checklistData={userChecklist}
          solutionId={solutionId}
          checklistType="implementation"
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Faça login para começar a usar o checklist.
        </div>
      )}

      <ChecklistProgress
        completedItems={completedCount}
        totalItems={checklistItems.length}
      />
    </div>
  );
};

export default LearningChecklistTab;
