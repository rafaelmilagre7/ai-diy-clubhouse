
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
  category: string; // Changed from enum to string to match database
  difficulty: string; // Changed from enum to string
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  estimated_time?: number | null;
  success_rate?: number | null;
  related_solutions?: string[];
  tags?: string[];
  overview?: string;
  tools?: Array<{
    name: string;
    description?: string;
    url?: string;
  }>;
  materials?: Array<{
    name: string;
    description?: string;
    url?: string;
  }>;
  videos?: Array<{
    title?: string;
    description?: string;
    url?: string;
    youtube_id?: string;
  }>;
  checklist?: Array<{
    id?: string;
    title?: string;
    description?: string;
    checked?: boolean;
  }>;
  // Used internally - not part of database schema
  progress?: Progress;
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
  completed_at: string | null; // Changed from completion_date to completed_at
  last_activity: string;
  created_at: string;
  completed_modules?: number[]; // Added completed_modules property as optional
}

export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string; // Changed from enum to string
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
  event_type: string; // Changed from enum to string
  event_data: any; // JSON data
  created_at: string;
}
