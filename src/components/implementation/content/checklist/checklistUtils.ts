
import { Solution, UserChecklist } from "@/types/supabaseTypes";
import { toast } from "sonner";

export interface ChecklistItem {
  id: string;
  title?: string;
  description?: string;
  checked: boolean;
}

/**
 * Extract checklist items from a solution
 */
export const extractChecklistFromSolution = (solution: Solution): ChecklistItem[] => {
  // Check if checklist property exists and is an array
  if (solution.checklist && Array.isArray(solution.checklist)) {
    // Transform items to ensure they have the required properties
    return solution.checklist.map((item: any, index: number) => ({
      id: item.id || `checklist-${index}`,
      title: item.title || item.text || "Item sem título",
      description: item.description,
      checked: false
    }));
  }
  
  return [];
};

/**
 * Initialize user checklist state based on solution checklist
 */
export const initializeUserChecklist = (checklist: ChecklistItem[]): Record<string, boolean> => {
  const initialUserChecklist: Record<string, boolean> = {};
  checklist.forEach(item => {
    initialUserChecklist[item.id] = false;
  });
  return initialUserChecklist;
};

/**
 * Update user checklist with saved progress
 */
export const applyUserProgress = (
  initialChecklist: Record<string, boolean>,
  userProgress: UserChecklist | null
): Record<string, boolean> => {
  if (!userProgress || !userProgress.checked_items) {
    return initialChecklist;
  }
  
  const updatedChecklist = { ...initialChecklist };
  
  Object.keys(userProgress.checked_items).forEach(itemId => {
    if (updatedChecklist.hasOwnProperty(itemId)) {
      updatedChecklist[itemId] = userProgress.checked_items[itemId];
    }
  });
  
  return updatedChecklist;
};

/**
 * Handle errors in checklist operations
 */
export const handleChecklistError = (error: any, logError: (message: string, data: any) => void): void => {
  logError("Error in checklist operation:", error);
  toast.error("Erro ao processar checklist");
};
