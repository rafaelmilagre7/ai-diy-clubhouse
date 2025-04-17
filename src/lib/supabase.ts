
import { createClient } from '@supabase/supabase-js';

// Tipo para perfil de usuário
export type UserRole = 'admin' | 'member';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  company_name: string | null;
  industry: string | null;
  created_at: string;
}

// Tipo para soluções
export interface Solution {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  thumbnail_url?: string;
  slug: string;
  tags?: string[];
  related_solutions?: string[];
  success_rate?: number;
  estimated_time?: number;
  created_at: string;
  updated_at: string;
  published: boolean;
}

// Tipos para módulos
export interface Module {
  id: string;
  solution_id: string;
  title: string;
  type: string;
  content: any;
  module_order: number;
  estimated_time_minutes?: number;
  created_at: string;
  updated_at: string;
}

// Tipos para progresso
export interface Progress {
  id: string;
  user_id: string;
  solution_id: string;
  current_module: number;
  completed_modules?: number[];
  is_completed: boolean;
  completed_at?: string;
  last_activity: string;
  created_at: string;
}

// Configuração do cliente Supabase
const supabaseUrl = "https://zotzvtepvpnkcoobdubt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ";

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'viverdeiaclub-auth-storage'
  }
});

// Função para criar bucket de imagens de perfil se não existir
export const ensureProfileImagesBucket = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const profileBucketExists = buckets?.some(bucket => bucket.name === 'profile_images');
    
    if (!profileBucketExists) {
      await supabase.storage.createBucket('profile_images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      // Definir política de acesso público
      await supabase.storage.from('profile_images').createSignedUrl('test.txt', 60);
    }
  } catch (error) {
    console.error('Erro ao verificar/criar bucket de imagens de perfil:', error);
  }
};

// Tentar criar o bucket quando o módulo for importado
ensureProfileImagesBucket();
