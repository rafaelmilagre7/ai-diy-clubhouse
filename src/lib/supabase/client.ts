
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

// CONFIGURAÇÃO SEGURA: Usar credenciais de configuração
const getSupabaseConfig = () => {
  // Configuração para Lovable (hardcoded permitido para chaves públicas)
  const config = {
    url: 'https://zotzvtepvpnkcoobdubt.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ'
  };
  
  // Validação de configuração
  if (!config.url || !config.anonKey) {
    throw new Error('ERRO CRÍTICO: Configuração do Supabase não encontrada');
  }
  
  // Validação adicional de segurança
  if (!config.url.startsWith('https://')) {
    throw new Error('ERRO DE SEGURANÇA: URL do Supabase deve usar HTTPS');
  }
  
  return config;
};

const supabaseConfig = getSupabaseConfig();

// Criação do cliente Supabase com configurações de segurança
export const supabase = createClient<Database>(supabaseConfig.url, supabaseConfig.anonKey, {
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
      // Erro silencioso - storage será configurado conforme necessário
      return false;
    }
    
    const exists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!exists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 314572800 // 300MB
      });
      
      if (createError) {
        // Tratar erros de storage de forma silenciosa durante registro
        if (createError.message.includes('permission') || createError.message.includes('not authorized')) {
          // Tentar via RPC silenciosamente
          try {
            const { error } = await supabase.rpc('create_storage_public_policy', {
              bucket_name: bucketName
            });
            
            return !error;
          } catch {
            return false;
          }
        }
        
        return false;
      }
      
      try {
        await createStoragePublicPolicy(bucketName);
      } catch {
        // Política será criada quando necessário
      }
    }
    
    return true;
  } catch {
    // Storage será configurado conforme demanda
    return false;
  }
}

export async function createStoragePublicPolicy(bucketName: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
