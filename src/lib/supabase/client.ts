
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

// Função auxiliar para verificar o ambiente atual
export const isDevelopmentMode = (): boolean => {
  return (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.lovable.dev') ||
    window.location.hostname.includes('.lovable.app')
  );
};

// Função para obter o cliente Supabase com base no ambiente
export const getSupabaseClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Verificar se estamos em ambiente de desenvolvimento sem variáveis configuradas
  const isDevWithoutEnv = isDevelopmentMode() && (!supabaseUrl || !supabaseAnonKey);
  
  if (isDevWithoutEnv) {
    console.warn(
      'Ambiente de desenvolvimento detectado sem variáveis do Supabase configuradas.\n' +
      'Operando em modo offline com dados simulados. Algumas funcionalidades podem estar limitadas.\n' +
      'Para conexão completa, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local'
    );
    
    // Retorna uma instância mockada do cliente Supabase
    return createMockClient();
  }
  
  // Verificação de segurança para as variáveis de ambiente em produção
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      'Erro crítico: Variáveis de ambiente do Supabase não estão configuradas.\n' +
      'Certifique-se de definir VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu arquivo .env.local'
    );
    
    // Em produção, lançar um erro mais visível para o usuário
    if (!isDevelopmentMode()) {
      throw new Error('Erro de configuração: Conecte-se ao suporte técnico.');
    }
    
    // Mesmo em desenv, retornamos o cliente mockado para evitar erros
    return createMockClient();
  }
  
  // Criação do cliente Supabase com configuração correta
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'viver-de-ia-auth'
    }
  });
};

// Criação de um cliente mockado para desenvolvimento sem Supabase
const createMockClient = () => {
  // Esta é uma implementação básica que simula a API do Supabase
  // mas retorna respostas predefinidas ou vazias
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            limit: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
              single: async () => ({ data: null, error: null })
            }),
            maybeSingle: async () => ({ data: null, error: null }),
            single: async () => ({ data: null, error: null })
          }),
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null })
        }),
        limit: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null })
        }),
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null })
      }),
      insert: () => ({
        select: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null })
      }),
      update: () => ({
        eq: () => ({
          select: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null })
        })
      }),
      upsert: () => ({
        select: async () => ({ data: null, error: null })
      })
    }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: null, error: null, unsubscribe: () => {} })
    },
    storage: {
      listBuckets: async () => ({ data: [], error: null }),
      createBucket: async () => ({ data: null, error: null }),
      from: () => ({
        upload: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    },
    rpc: async () => ({ data: null, error: null })
  } as any;
};

// Exportação do cliente Supabase
export const supabase = getSupabaseClient();

// Exportação de tipos básicos
export type Tables = Database['public']['Tables'];

// Função de auxílio para bucket de armazenamento
export async function ensureStorageBucketExists(bucketName: string): Promise<boolean> {
  try {
    // Verificar se estamos em modo de desenvolvimento sem variáveis
    if (isDevelopmentMode() && !import.meta.env.VITE_SUPABASE_URL) {
      console.log(`Modo de desenvolvimento: simulando criação do bucket ${bucketName}`);
      return true;
    }
    
    // Verificar se o bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`Erro ao listar buckets:`, listError);
      return false;
    }
    
    const exists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!exists) {
      console.log(`Bucket ${bucketName} não existe. Tentando criar...`);
      
      // Tentar criar o bucket
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 314572800 // 300MB
      });
      
      if (createError) {
        console.error(`Erro ao criar bucket ${bucketName}:`, createError);
        
        // Se o erro foi de permissão, tentar usar a função RPC
        if (createError.message.includes('permission') || createError.message.includes('not authorized')) {
          console.log(`Tentando criar bucket ${bucketName} via RPC...`);
          
          try {
            const { error } = await supabase.rpc('create_storage_public_policy', {
              bucket_name: bucketName
            });
            
            if (error) {
              console.error(`Erro ao criar bucket ${bucketName} via RPC:`, error);
              return false;
            }
            
            console.log(`Bucket ${bucketName} criado com sucesso via RPC`);
            return true;
          } catch (rpcError) {
            console.error(`Erro ao chamar RPC para criar bucket ${bucketName}:`, rpcError);
            return false;
          }
        }
        
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar/criar bucket:", error);
    return false;
  }
}
