
import { supabase } from '@/integrations/supabase/client';

export { supabase };

// Types para as tabelas do Supabase
export type UserRole = 'admin' | 'member';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  company_name: string | null;
  industry: string | null;
  created_at: string;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  slug: string;
  category: 'revenue' | 'operational' | 'strategy';
  difficulty: 'easy' | 'medium' | 'advanced';
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  estimated_time?: number | null;
  success_rate?: number | null;
  related_solutions?: string[];
  tags?: string[];
}

export interface Module {
  id: string;
  solution_id: string;
  title: string;
  content: any; // JSON content
  type: 'landing' | 'overview' | 'preparation' | 'implementation' | 'verification' | 'results' | 'optimization' | 'celebration';
  module_order: number; // Alterado de 'order' para 'module_order'
  created_at: string;
  updated_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completion_date: string | null;
  last_activity: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: 'revenue' | 'operational' | 'strategy' | 'achievement';
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface Analytics {
  id: string;
  user_id: string;
  solution_id: string | null;
  module_id: string | null;
  event_type: 'view' | 'complete' | 'start' | 'abandon' | 'interact';
  event_data: any; // JSON data
  created_at: string;
}
