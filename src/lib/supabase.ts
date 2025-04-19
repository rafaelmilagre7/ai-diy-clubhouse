
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zotzvtepvpnkcoobdubt.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type UserRole = 'admin' | 'member';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  industry: string | null;
  role: UserRole;
  created_at: string;
}

// Definições de tipos para as soluções e módulos que estão sendo usadas em outros componentes
export interface Solution {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  image_url?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  slug: string;
  status?: string;
  completion_percentage?: number;
}

export interface Module {
  id: string;
  solution_id: string;
  title: string;
  description?: string;
  order: number;
  type: string;
  content?: any;
  created_at: string;
  updated_at: string;
  completed?: boolean;
}
