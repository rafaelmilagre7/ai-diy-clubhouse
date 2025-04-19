
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zotzvtepvpnkcoobdubt.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ';

// Configure o cliente Supabase com opções explícitas para autenticação
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});

// Função para realizar logout de forma robusta
export async function signOut() {
  console.log("Iniciando processo de logout");
  try {
    // Limpar token do localStorage
    localStorage.removeItem('sb-zotzvtepvpnkcoobdubt-auth-token');
    localStorage.removeItem('supabase.auth.token');
    
    // Executar signOut do Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erro ao realizar logout via Supabase:', error);
      throw error;
    }
    
    console.log("Logout realizado com sucesso");
    return { success: true };
  } catch (error) {
    console.error('Erro durante o processo de logout:', error);
    throw error;
  }
}

// Defina funções úteis para trabalhar com contadores
export async function incrementVoteCount(suggestionId: string, voteType: 'upvote' | 'downvote') {
  const column = voteType === 'upvote' ? 'upvotes' : 'downvotes';
  return supabase.rpc('increment', { 
    row_id: suggestionId, 
    table: 'suggestions', 
    column: column 
  });
}

export async function decrementVoteCount(suggestionId: string, voteType: 'upvote' | 'downvote') {
  const column = voteType === 'upvote' ? 'upvotes' : 'downvotes';
  return supabase.rpc('decrement', { 
    row_id: suggestionId, 
    table: 'suggestions', 
    column: column 
  });
}

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

// Interface expandida para incluir todas as propriedades utilizadas no código
export interface Solution {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  image_url?: string;
  thumbnail_url?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  published: boolean;
  slug: string;
  status?: string;
  completion_percentage?: number;
  overview?: string;
  estimated_time?: number;
  success_rate?: number;
  tags?: string[];
  videos?: any[];
  checklist?: any[];
  module_order?: number;
  related_solutions?: string[];
}

export interface Module {
  id: string;
  solution_id: string;
  title: string;
  description?: string;
  order: number;
  module_order?: number; // Algumas partes do código usam essa propriedade ao invés de order
  type: string;
  content?: any;
  created_at: string;
  updated_at: string;
  completed?: boolean;
}

// Adicionando interfaces faltantes
export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  is_completed: boolean;
  completed_modules: number[];
  completed_at?: string;
  last_activity: string;
  created_at: string;
}

export interface UserChecklist {
  id: string;
  user_id: string;
  solution_id: string;
  checked_items: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}
