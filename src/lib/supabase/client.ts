
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

// CONFIGURAÇÃO SEGURA: Usar credenciais da configuração do projeto
const supabaseUrl = 'https://zotzvtepvpnkcoobdubt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ';

// Validação de configuração
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('ERRO CRÍTICO: Configuração do Supabase não encontrada');
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
