
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

// Variáveis de ambiente - em produção essas devem ser injetadas de maneira segura
const supabaseUrl = 'https://zotzvtepvpnkcoobdubt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ';

// Criação do cliente Supabase com tipagem correta
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Exportação de tipos básicos
export type Tables = Database['public']['Tables'];

// Função para garantir que um bucket de armazenamento existe
export async function ensureStorageBucketExists(bucketName: string): Promise<boolean> {
  try {
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
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar/criar bucket:", error);
    return false;
  }
}

// Função para criar políticas de acesso público para um bucket
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

// Função de fallback para upload de arquivos
export async function uploadFileWithFallback(bucket: string, path: string, file: File): Promise<{ data: any, error: any }> {
  try {
    // Primeiro, tentar fazer upload diretamente
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    
    if (error) {
      console.error('Erro no upload direto:', error);
      
      // Se falhar por permissão, tentar criar o bucket
      await ensureStorageBucketExists(bucket);
      
      // Tentar upload novamente após criar bucket
      const retryResult = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });
      
      return retryResult;
    }
    
    return { data, error };
  } catch (error) {
    console.error('Erro crítico ao fazer upload:', error);
    return { data: null, error };
  }
}

// Garantir que todos os buckets necessários existam
export async function setupLearningStorageBuckets(): Promise<boolean> {
  try {
    const buckets = ['learning-videos', 'learning-resources', 'learning-images'];
    
    for (const bucket of buckets) {
      const success = await ensureStorageBucketExists(bucket);
      if (!success) {
        console.error(`Falha ao criar bucket ${bucket}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao configurar buckets:', error);
    return false;
  }
}
