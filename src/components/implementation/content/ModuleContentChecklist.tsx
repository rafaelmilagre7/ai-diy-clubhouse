
import React from "react";
import { Module } from "@/lib/supabase";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UnifiedChecklistTab from "@/components/unified-checklist/UnifiedChecklistTab";
import LearningChecklistTab from "../tabs/LearningChecklistTab";

interface ModuleContentChecklistProps {
  module: Module;
}

export const ModuleContentChecklist = ({ module }: ModuleContentChecklistProps) => {
  const { solutionId } = useParams();
  
  if (!solutionId) {
    return null;
  }

  // Verificar tipo de solução
  const { data: isBuilderSolution, isLoading } = useQuery({
    queryKey: ['is-builder-solution', solutionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_generated_solutions')
        .select('id')
        .eq('solution_id', solutionId)
        .maybeSingle();

      return !!data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2">Lista de Verificação</h3>
        <p className="text-muted-foreground">
          Use esta lista para verificar se você implementou todos os passos necessários.
        </p>
      </div>

      {isBuilderSolution ? (
        <UnifiedChecklistTab 
          solutionId={solutionId}
          checklistType="implementation"
          onComplete={() => {}}
        />
      ) : (
        <LearningChecklistTab 
          solutionId={solutionId}
          onComplete={() => {}}
        />
      )}
    </div>
  );
};
