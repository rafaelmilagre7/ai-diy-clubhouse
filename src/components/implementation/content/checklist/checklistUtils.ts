
// Simplified checklist utilities without complex type dependencies
export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
}

export const createChecklistItem = (title: string, description?: string): ChecklistItem => ({
  id: Math.random().toString(36).substring(2, 15),
  title,
  description,
  completed: false,
  order: 0
});

export const toggleChecklistItem = (items: ChecklistItem[], itemId: string): ChecklistItem[] => {
  return items.map(item => 
    item.id === itemId ? { ...item, completed: !item.completed } : item
  );
};

export const calculateProgress = (items: ChecklistItem[]): number => {
  if (items.length === 0) return 0;
  const completed = items.filter(item => item.completed).length;
  return Math.round((completed / items.length) * 100);
};

// Additional utility functions for compatibility
export const extractChecklistFromSolution = (solution: any): ChecklistItem[] => {
  // Mock implementation
  return [];
};

export const initializeUserChecklist = (userId: string, solutionId: string): Promise<ChecklistItem[]> => {
  // Mock implementation
  return Promise.resolve([]);
};

export const handleChecklistError = (error: any): void => {
  console.error('Checklist error:', error);
};
