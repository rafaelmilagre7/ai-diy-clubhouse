
import { createClient } from '@supabase/supabase-js';

// Recuperar variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variáveis de ambiente do Supabase não configuradas. Usando valores de fallback para desenvolvimento.');
}

// Criar cliente do Supabase com fallback para valores de desenvolvimento
export const supabase = createClient(
  supabaseUrl || 'https://zotzvtepvpnkcoobdubt.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ'
);

// Função auxiliar para verificar a conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) throw error;
    console.log('Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    console.warn('Erro ao conectar com Supabase:', error);
    return false;
  }
};

// Função para garantir que um bucket de armazenamento existe
export const ensureStorageBucketExists = async (bucketName: string) => {
  try {
    // Verificar se o bucket já existe
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erro ao listar buckets:', listError);
      return false;
    }
    
    const bucketExists = existingBuckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket ${bucketName} já existe`);
      return true;
    }
    
    // Se não existir, criar o bucket
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true, // Ajuste conforme necessário para segurança
      fileSizeLimit: 50 * 1024 * 1024 // 50MB de limite por arquivo
    });
    
    if (error) {
      console.error(`Erro ao criar bucket ${bucketName}:`, error);
      return false;
    }
    
    console.log(`Bucket ${bucketName} criado com sucesso:`, data);
    return true;
  } catch (error) {
    console.error(`Erro ao verificar/criar bucket ${bucketName}:`, error);
    
    // Em ambiente de desenvolvimento, simular sucesso para continuar
    if (import.meta.env.DEV) {
      console.warn('Ambiente de desenvolvimento detectado. Simulando sucesso na criação do bucket.');
      return true;
    }
    
    return false;
  }
};
