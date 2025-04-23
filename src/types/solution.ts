
export interface Solution {
  id: string;
  title: string;
  description: string;
  category: 'revenue' | 'operations' | 'strategy';
  difficulty: 'easy' | 'medium' | 'advanced';
  published: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  slug: string;
  implementation_steps?: any[];
  checklist_items?: any[];
  completion_requirements?: Record<string, any>;
  modules?: Module[];
  progress?: Progress;
}

export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completed_modules: number[];
  last_activity: string;
  implementation_status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  completion_data?: Record<string, any>;
}

export interface Module {
  id: string;
  solution_id: string;
  title: string;
  type: string;
  content: any;
  module_order: number;
}

export interface SolutionCertificate {
  id: string;
  solution_id: string;
  user_id: string;
  issued_at: string;
  certificate_data: Record<string, any>;
  created_at: string;
}
