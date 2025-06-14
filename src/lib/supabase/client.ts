import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import { SUPABASE_CONFIG } from '@/config/app';
import { logger } from '@/utils/logger';

// Log seguro da configuração (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  SUPABASE_CONFIG.getSafeConfig().then(safeConfig => {
    logger.info('🔧 [SUPABASE CLIENT] Inicializando com configuração segura', safeConfig);
  });
}

// Cliente Supabase inicializado de forma assíncrona
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;
let initializationPromise: Promise<ReturnType<typeof createClient<Database>>> | null = null;

// Função para inicializar o cliente Supabase
async function initializeSupabaseClient(): Promise<ReturnType<typeof createClient<Database>>> {
  try {
    logger.info('🔧 [SUPABASE CLIENT] Inicializando cliente...');
    
    // Obter credenciais de forma assíncrona
    const credentials = await SUPABASE_CONFIG.getCredentials();
    
    if (!credentials.url || !credentials.anonKey) {
      throw new Error('Credenciais do Supabase não disponíveis');
    }

    // Criar cliente Supabase com configurações de segurança
    const client = createClient<Database>(credentials.url, credentials.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      },
      global: {
        headers: {
          'X-Client-Info': 'viverdeia-app',
          'X-Security-Level': 'high'
        }
      }
    });

    logger.info('✅ [SUPABASE CLIENT] Cliente inicializado com sucesso');
    return client;
    
  } catch (error) {
    logger.error('❌ [SUPABASE CLIENT] Erro ao inicializar cliente:', error);
    throw error;
  }
}

// Função para obter o cliente Supabase (singleton assíncrono)
export async function getSupabaseClient(): Promise<ReturnType<typeof createClient<Database>>> {
  // Se já temos o cliente, retornar
  if (supabaseClient) {
    return supabaseClient;
  }

  // Se já está inicializando, aguardar
  if (initializationPromise) {
    return initializationPromise;
  }

  // Inicializar cliente
  initializationPromise = initializeSupabaseClient();
  supabaseClient = await initializationPromise;
  
  return supabaseClient;
}

// Cliente síncrono para compatibilidade (com warning)
let fallbackClient: ReturnType<typeof createClient<Database>> | null = null;

// Tentar criar cliente com variáveis de ambiente para fallback
try {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (envUrl && envKey) {
    fallbackClient = createClient<Database>(envUrl, envKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      },
      global: {
        headers: {
          'X-Client-Info': 'viverdeia-app-fallback',
          'X-Security-Level': 'medium'
        }
      }
    });
    
    if (import.meta.env.DEV) {
      logger.warn('⚠️ [SUPABASE CLIENT] Usando cliente fallback com variáveis de ambiente');
    }
  }
} catch (error) {
  logger.error('❌ [SUPABASE CLIENT] Erro ao criar cliente fallback:', error);
}

// Exportação síncrona para compatibilidade (DEPRECATED)
export const supabase = fallbackClient || ({} as ReturnType<typeof createClient<Database>>);

// Inicializar cliente assíncrono automaticamente
getSupabaseClient().then(client => {
  // Substituir o cliente fallback pelo cliente correto
  Object.assign(supabase, client);
  logger.info('🔄 [SUPABASE CLIENT] Cliente fallback substituído pelo cliente seguro');
}).catch(error => {
  logger.error('❌ [SUPABASE CLIENT] Erro na inicialização automática:', error);
});

export type Tables = Database['public']['Tables'];

export async function ensureStorageBucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      logger.error('Erro ao listar buckets:', listError);
      return false;
    }
    
    const exists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!exists) {
      logger.info(`Bucket ${bucketName} não existe. Tentando criar...`);
      
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 314572800 // 300MB
      });
      
      if (createError) {
        logger.error(`Erro ao criar bucket ${bucketName}:`, createError);
        
        if (createError.message.includes('permission') || createError.message.includes('not authorized')) {
          logger.info(`Tentando criar bucket ${bucketName} via RPC...`);
          
          try {
            const { data, error } = await supabase.rpc('create_storage_public_policy', {
              bucket_name: bucketName
            });
            
            if (error) {
              logger.error(`Erro ao criar bucket ${bucketName} via RPC:`, error);
              return false;
            }
            
            logger.info(`Bucket ${bucketName} criado com sucesso via RPC`);
            return true;
          } catch (rpcError) {
            logger.error(`Erro ao chamar RPC para criar bucket ${bucketName}:`, rpcError);
            return false;
          }
        }
        
        return false;
      }
      
      try {
        await createStoragePublicPolicy(bucketName);
      } catch (policyError) {
        logger.error(`Não foi possível definir políticas para ${bucketName}:`, policyError);
      }
    }
    
    return true;
  } catch (error) {
    logger.error("Erro ao verificar/criar bucket:", error);
    return false;
  }
}

export async function createStoragePublicPolicy(bucketName: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', {
      bucket_name: bucketName
    });
    
    if (error) {
      logger.error(`Erro ao criar políticas para ${bucketName}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    logger.error(`Erro ao criar políticas para ${bucketName}:`, error);
    return { success: false, error: error.message };
  }
}
