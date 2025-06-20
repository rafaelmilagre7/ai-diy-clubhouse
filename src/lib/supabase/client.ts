
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import { SUPABASE_CONFIG } from '@/config/app';
import { logger } from '@/utils/logger';

// Log seguro da configuração (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  logger.info('🔧 [SUPABASE CLIENT] Inicializando com configuração segura', SUPABASE_CONFIG.getSafeConfig());
}

// Obter credenciais dinamicamente
const credentials = SUPABASE_CONFIG.getCredentials();

// VALIDAÇÃO RIGOROSA: Verificar se as credenciais estão disponíveis
if (!credentials.url || !credentials.anonKey) {
  const errorMessage = `
🔒 ERRO CRÍTICO: Credenciais do Supabase não disponíveis

Ambiente detectado: ${SUPABASE_CONFIG.isLovableEnvironment() ? 'Lovable' : 'Outro'}
URL disponível: ${!!credentials.url}
Key disponível: ${!!credentials.anonKey}

${SUPABASE_CONFIG.isLovableEnvironment() 
  ? 'No ambiente Lovable, as credenciais devem ser configuradas automaticamente.' 
  : 'Configure as credenciais em .env.local para desenvolvimento local.'
}
`;
  
  throw new Error(errorMessage);
}

// Criação do cliente Supabase com configurações otimizadas para Edge Functions
export const supabase = createClient<Database>(credentials.url, credentials.anonKey, {
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
  },
  // Configurações específicas para Edge Functions
  functions: {
    region: 'us-east-1' // Região padrão para melhor performance
  },
  // Timeout estendido para Edge Functions
  db: {
    schema: 'public'
  }
});

// Cliente especializado para Edge Functions com timeout estendido
export const supabaseWithExtendedTimeout = createClient<Database>(credentials.url, credentials.anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  global: {
    headers: {
      'X-Client-Info': 'viverdeia-app-extended',
      'X-Security-Level': 'high',
      'X-Function-Timeout': '60000' // 60 segundos
    }
  }
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
