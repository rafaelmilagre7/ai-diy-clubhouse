
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zotzvtepvpnkcoobdubt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for Supabase tables
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
  estimated_time: number; // in minutes
  success_rate: number;
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  solution_id: string;
  title: string;
  content: any; // JSON content
  type: 'landing' | 'overview' | 'preparation' | 'implementation' | 'verification' | 'results' | 'optimization' | 'celebration';
  order: number;
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
