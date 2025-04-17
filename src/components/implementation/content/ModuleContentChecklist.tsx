
import React from "react";
import { Module } from "@/lib/supabase";
import { useChecklistData } from "./checklist/useChecklistData";
import { useChecklistInteractions } from "./checklist/useChecklistInteractions";
import { ChecklistItem } from "./checklist/ChecklistItem";
import { ChecklistProgress } from "./checklist/ChecklistProgress";
import { ChecklistLoading } from "./checklist/ChecklistLoading";

interface ModuleContentChecklistProps {
  module: Module;
}

export const ModuleContentChecklist = ({ module }: ModuleContentChecklistProps) => {
  const {
    solution,
    checklist,
    userChecklist,
    setUserChecklist,
    loading
  } = useChecklistData(module);

  const {
    saving,
    handleCheckChange
  } = useChecklistInteractions(solution);

  // Handle item toggle
  const onToggleItem = (itemId: string, checked: boolean) => {
    handleCheckChange(itemId, checked, userChecklist, setUserChecklist);
  };

  // Calculate completed items
  const completedItemsCount = Object.values(userChecklist).filter(Boolean).length;

  if (loading) {
    return <ChecklistLoading />;
  }

  if (checklist.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum checklist disponível para esta solução.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-lg font-semibold">Checklist de Implementação</h3>
      <p className="text-muted-foreground">
        Verifique se você completou todos os requisitos para implementar esta solução:
      </p>
      
      <div className="space-y-3 mt-4">
        {checklist.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            isChecked={userChecklist[item.id] || false}
            onChange={(checked) => onToggleItem(item.id, checked)}
            disabled={saving}
          />
        ))}
      </div>
      
      {/* Progresso do checklist */}
      <ChecklistProgress 
        completedItems={completedItemsCount} 
        totalItems={checklist.length} 
      />
    </div>
  );
};
