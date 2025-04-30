
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

// Configure o cliente Supabase com opções explícitas para autenticação
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
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

// Tipos comuns usados em todo o projeto
// Que também são exportados do arquivo types.ts
