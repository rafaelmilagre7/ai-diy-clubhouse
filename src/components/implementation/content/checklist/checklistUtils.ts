
import { Solution, UserChecklist } from "@/lib/supabase";
import { toast } from "sonner";

export interface ChecklistItem {
  id: string;
  title?: string;
  description?: string;
  checked: boolean;
}

/**
 * Extrai checklist de uma solução.
 * Agora retorna vazio se não há checklist.
 */
export const extractChecklistFromSolution = (solution: Solution): ChecklistItem[] => {
  // Suporte legado: caso o checklist venha dentro de implementation_steps/checklist_items
  if ((solution as any).checklist && Array.isArray((solution as any).checklist)) {
    // legacy, não existe mais oficialmente
    return (solution as any).checklist.map((item: any, index: number) => ({
      id: item.id || `checklist-${index}`,
      title: item.title || item.text || "Item sem título",
      description: item.description,
      checked: false
    }));
  }
  if ((solution as any).checklist_items && Array.isArray((solution as any).checklist_items)) {
    return (solution as any).checklist_items.map((item: any, index: number) => ({
      id: item.id || `checklist-${index}`,
      title: item.title || item.text || "Item sem título",
      description: item.description,
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
  
  // Safe JSON parsing
  let checkedItems: Record<string, boolean> = {};
  
  if (typeof userProgress.checked_items === 'string') {
    try {
      checkedItems = JSON.parse(userProgress.checked_items);
    } catch (error) {
      console.error('Failed to parse checked_items:', error);
      return initialChecklist;
    }
  } else if (typeof userProgress.checked_items === 'object' && userProgress.checked_items !== null) {
    checkedItems = userProgress.checked_items as Record<string, boolean>;
  }
  
  const updatedChecklist = { ...initialChecklist };
  Object.keys(checkedItems).forEach(itemId => {
    if (updatedChecklist.hasOwnProperty(itemId)) {
      updatedChecklist[itemId] = checkedItems[itemId];
    }
  });
  return updatedChecklist;
};

export const handleChecklistError = (error: any, logError: (message: string, data: any) => void): void => {
  logError("Error in checklist operation:", error);
  toast.error("Erro ao processar checklist");
};
