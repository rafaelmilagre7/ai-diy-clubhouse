
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Criação do cliente Supabase com tipagem correta
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Exportação de tipos básicos
export type Tables = Database['public']['Tables'];
