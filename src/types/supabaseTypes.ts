
import { Database } from '@/lib/supabase/types';
import { Solution as SupabaseSolution, UserProfile as SupabaseUserProfile } from '@/lib/supabase/types';

// Definição do tipo Solution a partir das tabelas do Supabase
export type Solution = SupabaseSolution & {
  modules?: Module[];
  progress?: {
    current_module: number;
    is_completed: boolean;
    completed_modules: number[];
    last_activity: string;
    completion_percentage?: number;
    last_interaction_at?: string;
    failed_attempts?: any[];
  } | null;
  // Adicionando campos que estão sendo utilizados mas não existem no tipo original
  overview?: string;
  checklist?: ChecklistItem[];
  implementation_steps?: ImplementationStep[];
  prerequisites?: Prerequisite[];
  completion_criteria?: CompletionCriteria[];
};

// Definição para passos de implementação
export interface ImplementationStep {
  id?: string;
  title: string;
  description?: string;
  order?: number;
}

// Definição para pré-requisitos
export interface Prerequisite {
  id?: string;
  text: string;
}

// Definição para critérios de conclusão
export interface CompletionCriteria {
  id?: string;
  text: string;
}

// Definição do tipo para itens de checklist
export interface ChecklistItem {
  id: string;
  title?: string;
  text?: string;
  description?: string;
  checked?: boolean;
}

// Definição do tipo para checklist do usuário
export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

// Definição do tipo Module a partir das tabelas do Supabase
export type Module = {
  id: string;
  solution_id: string;
  title: string;
  content: any;
  type: 'landing' | 'overview' | 'preparation' | 'implementation' | 'verification' | 'results' | 'optimization' | 'celebration';
  module_order: number;
  created_at: string;
  updated_at: string;
  solution?: Solution;
  order_position?: number;
  prerequisites?: Prerequisite[];
  status?: 'draft' | 'published' | 'archived';
};

// Definição do tipo UserProfile que extende UserProfile do Supabase
export type UserProfile = SupabaseUserProfile & {
  company_name?: string | null;
  industry?: string | null;
};

// Definição do tipo UserRole
export type UserRole = 'admin' | 'member';

// Definição de métricas de implementação
export interface ImplementationMetrics {
  id: string;
  solution_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string | null;
  time_spent_seconds: number;
  completion_status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  implementation_data?: any;
  created_at: string;
}

// Tipos auxiliares para recursos e ferramentas relacionadas
export type SolutionResource = {
  id: string;
  solution_id: string;
  title: string;
  description?: string | null;
  type: 'link' | 'pdf' | 'video' | 'image' | 'document';
  url: string;
  created_at: string;
  updated_at: string | null;
};

export type SolutionTool = {
  id: string;
  solution_id: string;
  tool_name: string;
  tool_url?: string | null;
  is_required?: boolean;
  created_at: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
};

export type Progress = {
  id: string;
  solution_id: string;
  user_id: string;
  current_module: number;
  is_completed: boolean;
  completed_modules?: number[];
  last_activity: string;
  completion_percentage?: number;
  last_interaction_at?: string;
  failed_attempts?: any[];
};

export type ImplementationCheckpoint = {
  id: string;
  solution_id?: string;
  description: string;
  checkpoint_order: number;
  created_at: string;
};

export type ImplementationProfile = {
  id: string;
  user_id?: string;
  company_name?: string;
  company_size?: string;
  company_sector?: string;
  company_website?: string;
  current_position?: string;
  annual_revenue?: string;
  created_at: string;
  updated_at: string;
  is_completed?: boolean;
};

export type ImplementationTrail = {
  id: string;
  user_id: string;
  trail_data: any;
  status: string;
  error_message?: string;
  generation_attempts: number;
  created_at: string;
  updated_at: string;
};
