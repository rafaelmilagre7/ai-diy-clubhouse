
// Definição de tipos para categorias de soluções
export type SolutionCategory = 'revenue' | 'operational' | 'strategy';

export type ModuleType = 
  | 'landing'
  | 'overview'
  | 'preparation'
  | 'implementation'
  | 'verification'
  | 'results'
  | 'optimization'
  | 'celebration';

export interface Module {
  id: string;
  solution_id: string;
  title: string;
  type: ModuleType;
  content: {
    blocks: any[];
  };
  module_order: number;
  created_at: string;
  updated_at: string;
  certificate_template?: any;
  estimated_time_minutes?: number;
  metrics?: any;
}

export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  implementation_status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  completed_modules: number[];
  last_activity: string;
  completion_percentage?: number;
  completion_data?: any;
  completed_at?: string | null;
  last_interaction_at?: string;
  failed_attempts?: any[];
}

// Interface para representar uma solução completa
export interface Solution {
  id: string;
  title: string;
  description: string;
  category: SolutionCategory;
  difficulty: 'easy' | 'medium' | 'advanced';
  published: boolean;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
  slug: string;
  modules?: Module[];
  progress?: Progress | null;
  checklist_items?: any[];
  implementation_steps?: any[];
  prerequisites?: any[];
  completion_criteria?: any[];
  overview?: string;
  estimated_time?: number;
  success_rate?: number;
  tags?: string[];
  modules_count?: number;
  tools_count?: number;
}
