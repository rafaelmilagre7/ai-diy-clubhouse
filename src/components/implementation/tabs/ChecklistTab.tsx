import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UnifiedChecklistTab from "@/components/unified-checklist/UnifiedChecklistTab";
import LearningChecklistTab from "./LearningChecklistTab";

interface ChecklistTabProps {
  solutionId: string;
  onComplete: () => void;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ solutionId, onComplete }) => {
  // Verificar se é uma solução do Builder (ai_generated_solutions)
  const { data: isBuilderSolution, isLoading } = useQuery({
    queryKey: ['is-builder-solution', solutionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_generated_solutions')
        .select('id')
        .eq('solution_id', solutionId)
        .maybeSingle();

      return !!data; // true = Builder, false = Learning
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('🔀 [ChecklistTab] Roteamento:', {
    solutionId,
    isBuilderSolution,
    component: isBuilderSolution ? 'UnifiedChecklistTab (Kanban)' : 'LearningChecklistTab (Lista Simples)'
  });

  // DECISÃO INTELIGENTE: Builder → Kanban | Learning → Lista Simples
  if (isBuilderSolution) {
    return (
      <UnifiedChecklistTab 
        solutionId={solutionId}
        checklistType="implementation"
        onComplete={onComplete}
      />
    );
  }

  return (
    <LearningChecklistTab 
      solutionId={solutionId}
      onComplete={onComplete}
    />
  );
};

export default ChecklistTab;