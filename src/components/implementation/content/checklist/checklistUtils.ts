
import { Solution, UserChecklist } from "@/lib/supabase";
import { safeJsonParseObject, extractJsonArray } from "@/utils/jsonUtils";
import { toast } from "sonner";

export interface ChecklistItem {
  id: string;
  title?: string;
  description?: string;
  checked: boolean;
}

/**
 * Extrai checklist de uma solução usando parsing seguro de JSON.
 */
export const extractChecklistFromSolution = (solution: Solution): ChecklistItem[] => {
  // CORREÇÃO: Parse seguro do campo checklist_items
  const checklistItems = extractJsonArray(solution.checklist_items, []);
  
  if (checklistItems.length > 0) {
    return checklistItems.map((item: any, index: number) => ({
      id: item.id || `checklist-${index}`,
      title: item.title || item.text || "Item sem título",
      description: item.description,
      checked: false
    }));
  }

  // Fallback para implementation_steps se não há checklist_items
  const implementationSteps = extractJsonArray(solution.implementation_steps, []);
  
  if (implementationSteps.length > 0) {
    return implementationSteps.map((step: any, index: number) => ({
      id: step.id || `step-${index}`,
      title: step.title || step.text || "Passo sem título",
      description: step.description,
      checked: false
    }));
  }

  return [];
};

export const initializeUserChecklist = (checklist: ChecklistItem[]): Record<string, boolean> => {
  const initialUserChecklist: Record<string, boolean> = {};
  checklist.forEach(item => {
    initialUserChecklist[item.id] = false;
  });
  return initialUserChecklist;
};

export const applyUserProgress = (
  initialChecklist: Record<string, boolean>,
  userProgress: UserChecklist | null
): Record<string, boolean> => {
  if (!userProgress || !userProgress.checked_items) {
    return initialChecklist;
  }
  
  // CORREÇÃO: Parse seguro do JSON checked_items
  const checkedItems = safeJsonParseObject(userProgress.checked_items, {});
  
  const updatedChecklist = { ...initialChecklist };
  Object.keys(checkedItems).forEach(itemId => {
    if (updatedChecklist.hasOwnProperty(itemId)) {
      updatedChecklist[itemId] = Boolean(checkedItems[itemId]);
    }
  });
  
  return updatedChecklist;
};

export const handleChecklistError = (error: any, logError: (message: string, data: any) => void): void => {
  logError("Error in checklist operation:", error);
  toast.error("Erro ao processar checklist");
};
