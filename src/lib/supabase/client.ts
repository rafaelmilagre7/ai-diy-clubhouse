
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação robusta de variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'ERRO CRÍTICO: Variáveis de ambiente do Supabase não configuradas';
  console.error(errorMessage);
  console.error('Certifique-se de definir VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local');
  
  // Em produção, falhar de forma mais graciosa
  if (typeof window !== 'undefined') {
    alert('Erro de configuração da aplicação. Contate o suporte.');
  }
  
  throw new Error(errorMessage);
}

// Validar formato das variáveis
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('VITE_SUPABASE_URL deve começar com https://');
}

if (supabaseAnonKey.length < 100) {
  throw new Error('VITE_SUPABASE_ANON_KEY parece ser inválida (muito curta)');
}

// Criação do cliente Supabase com configurações de segurança
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  global: {
    headers: {
      'X-Client-Info': 'viverdeia-app'
    }
  }
});

export type Tables = Database['public']['Tables'];

export async function ensureStorageBucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`Erro ao listar buckets:`, listError);
      return false;
    }
    
    const exists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!exists) {
      console.log(`Bucket ${bucketName} não existe. Tentando criar...`);
      
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 314572800 // 300MB
      });
      
      if (createError) {
        console.error(`Erro ao criar bucket ${bucketName}:`, createError);
        
        if (createError.message.includes('permission') || createError.message.includes('not authorized')) {
          console.log(`Tentando criar bucket ${bucketName} via RPC...`);
          
          try {
            const { data, error } = await supabase.rpc('create_storage_public_policy', {
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
      
      try {
        await createStoragePublicPolicy(bucketName);
      } catch (policyError) {
        console.error(`Não foi possível definir políticas para ${bucketName}:`, policyError);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar/criar bucket:", error);
    return false;
  }
}

export async function createStoragePublicPolicy(bucketName: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) {
      console.error(`Erro ao criar políticas para ${bucketName}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error(`Erro ao criar políticas para ${bucketName}:`, error);
    return { success: false, error: error.message };
  }
}
