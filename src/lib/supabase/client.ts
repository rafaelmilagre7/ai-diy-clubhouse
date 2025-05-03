
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import { createStoragePublicPolicy } from './rpc';

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação de segurança para as variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erro crítico: Variáveis de ambiente do Supabase não estão configuradas.');
  console.error('Certifique-se de definir VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu arquivo .env.local');
}

// Criação do cliente Supabase com tipagem correta
export const supabase = createClient<Database>(
  supabaseUrl || 'https://zotzvtepvpnkcoobdubt.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ'
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
