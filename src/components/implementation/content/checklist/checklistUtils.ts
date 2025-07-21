
import { Solution } from "@/lib/supabase";

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  checked: boolean;
}

export interface CheckpointData {
  items: ChecklistItem[];
  lastUpdated?: string;
}

// Extrair checklist de uma solução
export const extractChecklistFromSolution = (solution: Solution): ChecklistItem[] => {
  if (!solution) return [];
  
  // Verificar se há checklist_items na solução (campo legado)
  if (solution.checklist_items && Array.isArray(solution.checklist_items)) {
    return solution.checklist_items.map((item: any, index: number) => ({
      id: item.id || `legacy-${index}`,
      title: item.title || item.text || `Item ${index + 1}`,
      description: item.description,
      checked: false
    }));
  }
  
  return [];
};

// Inicializar checklist do usuário
export const initializeUserChecklist = (checklist: ChecklistItem[]): Record<string, boolean> => {
  const userChecklist: Record<string, boolean> = {};
  checklist.forEach(item => {
    userChecklist[item.id] = false;
  });
  return userChecklist;
};

// Converter checkpoint data para checklist items
export const convertCheckpointToChecklist = (checkpointData: CheckpointData, userChecklist: Record<string, boolean>): ChecklistItem[] => {
  if (!checkpointData || !checkpointData.items) return [];
  
  return checkpointData.items.map(item => ({
    ...item,
    checked: userChecklist[item.id] || false
  }));
};

// Lidar com erros de checklist
export const handleChecklistError = (error: any, context: string) => {
  console.error(`Erro no checklist (${context}):`, error);
  
  // Log específico para erros de SQL
  if (error.code) {
    console.error(`SQL Error Code: ${error.code}`);
    console.error(`SQL Error Details: ${error.details}`);
    console.error(`SQL Error Message: ${error.message}`);
  }
  
  return {
    hasError: true,
    errorMessage: error.message || "Erro desconhecido no checklist",
    errorCode: error.code
  };
};
