
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import { createStoragePublicPolicy } from './rpc';

// Criação do cliente Supabase com tipagem correta
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Exportação de tipos básicos
export type Tables = Database['public']['Tables'];

// Função para garantir que um bucket de armazenamento existe
export async function ensureStorageBucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!exists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 314572800 // 300MB
      });
      
      if (error) {
        console.error(`Erro ao criar bucket ${bucketName}:`, error);
        return false;
      }
      
      // Configurar políticas de acesso
      await createStoragePublicPolicy(bucketName);
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar/criar bucket:", error);
    return false;
  }
}
