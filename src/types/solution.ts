
import { Database } from '@/lib/supabase';

export type Solution = Database['public']['Tables']['solutions']['Row'] & {
  modules?: {
    id: string;
    title: string;
    type: string;
    module_order: number;
  }[];
  progress?: {
    current_module: number;
    is_completed: boolean;
    completed_modules: number[];
    last_activity: string;
  } | null;
};

// Tipos auxiliares para recursos e ferramentas relacionadas
export type SolutionResource = Database['public']['Tables']['solution_resources']['Row'];
export type SolutionTool = Database['public']['Tables']['solution_tools']['Row'];
