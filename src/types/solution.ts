
export interface Solution {
  id: string;
  title: string;
  description: string;
  category: 'revenue' | 'operations' | 'strategy' | string;
  difficulty: 'easy' | 'medium' | 'advanced' | string;
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
  overview?: string;
  prerequisites?: Prerequisite[];
  completion_criteria?: CompletionCriteria[];
  estimated_time?: number;
  success_rate?: number;
}

export interface Module {
  id: string;
  solution_id: string;
  title: string;
  type: ModuleType;
  content: ModuleContent;
  module_order: number;
  created_at: string;
  updated_at: string;
  certificate_template?: any;
  estimated_time_minutes?: number;
  metrics?: Record<string, any>;
}

export type ModuleType = 
  | 'landing'
  | 'overview'
  | 'preparation'
  | 'implementation'
  | 'verification'
  | 'results' 
  | 'optimization'
  | 'celebration';

export interface ModuleContent {
  blocks: ContentBlock[];
}

export interface ContentBlock {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  implementation_status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  is_completed: boolean;
  completed_modules: number[];
  last_activity: string;
  completion_data?: Record<string, any>;
  completion_percentage?: number;
  completed_at?: string;
}

export interface Prerequisite {
  id?: string;
  text: string;
}

export interface CompletionCriteria {
  id?: string;
  text: string;
}
