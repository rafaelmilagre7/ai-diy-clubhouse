
import { Database } from "@supabase/supabase-js";

// Tipo de perfil do usuário
export interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'admin' | 'member';
  company: string | null;
  position: string | null;
  created_at: string;
  updated_at: string | null;
}

// Tipo de solução
export interface Solution {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string | null;
  published: boolean;
  created_at: string;
  updated_at: string | null;
  creator_id: string | null;
  category?: string | null;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
  implementation_time?: number | null;
  tags?: string[] | null;
}

// Tipo de módulo
export interface Module {
  id: string;
  solution_id: string;
  title: string;
  content: any; // Conteúdo específico do módulo
  type: 'landing' | 'overview' | 'preparation' | 'implementation' | 'verification' | 'results' | 'optimization' | 'celebration';
  module_order: number;
  created_at: string;
  updated_at: string | null;
}

// Tipo de progresso
export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  started_at: string;
  completed_at?: string | null;
  current_module?: string | null;
  completed_modules?: number[] | null;
  is_completed: boolean;
  notes?: string | null;
}

// Tipo de ferramenta
export interface Tool {
  id: string;
  name: string;
  description: string;
  logo_url?: string | null;
  official_url?: string | null;
  category: string;
  created_at: string;
  updated_at: string | null;
  is_featured: boolean;
  member_benefits?: string[] | null;
  tags?: string[] | null;
}

// Tipo de recurso
export interface Resource {
  id: string;
  solution_id: string;
  title: string;
  description?: string | null;
  type: 'link' | 'pdf' | 'video' | 'image' | 'document';
  url: string;
  created_at: string;
  updated_at: string | null;
}

// Tipo de Database do Supabase para tipar as queries
export type SupabaseDatabase = Database;
