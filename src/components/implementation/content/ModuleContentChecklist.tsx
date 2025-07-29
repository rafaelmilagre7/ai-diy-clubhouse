
import React from "react";
import { Module } from "@/lib/supabase";
import { useParams } from "react-router-dom";
import UnifiedChecklistTab from "@/components/unified-checklist/UnifiedChecklistTab";

interface ModuleContentChecklistProps {
  module: Module;
}

export const ModuleContentChecklist = ({ module }: ModuleContentChecklistProps) => {
  const { solutionId } = useParams();
  
  if (!solutionId) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2">Lista de Verificação</h3>
        <p className="text-muted-foreground">
          Use esta lista para verificar se você implementou todos os passos necessários.
        </p>
      </div>

      <UnifiedChecklistTab 
        solutionId={solutionId}
        checklistType="implementation"
        onComplete={() => {}}
      />
    </div>
  );
};
