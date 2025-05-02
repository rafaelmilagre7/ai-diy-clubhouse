
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
  },
  global: {
    // Aumentar timeouts para lidar melhor com uploads grandes
    headers: {
      'X-Client-Info': 'supabase-js/2.x'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
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

// Função auxiliar para verificar e criar buckets de armazenamento
export async function ensureStorageBucketExists(bucketName: string): Promise<boolean> {
  try {
    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`[Storage] Erro ao listar buckets: ${listError.message}`);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    // Se o bucket já existir, retornar true
    if (bucketExists) {
      console.log(`[Storage] Bucket ${bucketName} já existe`);
      return true;
    }
    
    // Se não existir, tentar criar
    console.log(`[Storage] Criando bucket ${bucketName}...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true
    });
    
    if (createError) {
      console.error(`[Storage] Erro ao criar bucket ${bucketName}: ${createError.message}`);
      return false;
    }
    
    console.log(`[Storage] Bucket ${bucketName} criado com sucesso`);
    return true;
  } catch (error) {
    console.error('[Storage] Erro ao verificar/criar bucket:', error);
    return false;
  }
}
