
import { Database } from '@/lib/supabase/types';

// Definição do tipo Solution a partir das tabelas do Supabase
export type Solution = Database['public']['Tables']['solutions']['Row'] & {
  modules?: Module[];
  progress?: {
    current_module: number;
    is_completed: boolean;
    completed_modules: number[];
    last_activity: string;
  } | null;
  // Adicionando campos que estão sendo utilizados mas não existem no tipo original
  overview?: string;
  checklist?: ChecklistItem[];
};

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
export type Module = Database['public']['Tables']['modules']['Row'] & {
  solution?: Solution;
};

// Definição do tipo UserProfile a partir das tabelas do Supabase
export type UserProfile = Database['public']['Tables']['profiles']['Row'];

// Definição do tipo UserRole
export type UserRole = 'admin' | 'member' | 'moderator';

// Tipos auxiliares para recursos e ferramentas relacionadas
export type SolutionResource = Database['public']['Tables']['solution_resources']['Row'];
export type SolutionTool = Database['public']['Tables']['solution_tools']['Row'];
export type Badge = Database['public']['Tables']['badges']['Row'];
export type UserBadge = Database['public']['Tables']['user_badges']['Row'];
export type Progress = Database['public']['Tables']['progress']['Row'];
export type ImplementationCheckpoint = Database['public']['Tables']['implementation_checkpoints']['Row'];
export type ImplementationProfile = Database['public']['Tables']['implementation_profiles']['Row'];
export type ImplementationTrail = Database['public']['Tables']['implementation_trails']['Row'];
