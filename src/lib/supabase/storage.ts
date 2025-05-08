
import { supabase } from './client';
import { v4 as uuidv4 } from 'uuid';
import { STORAGE_BUCKETS } from './config';

/**
 * Cria políticas públicas para um bucket de storage
 * @param bucketName Nome do bucket
 * @returns Objeto com status da operação
 */
export const createStoragePublicPolicy = async (bucketName: string) => {
  try {
    // Verificar se o bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Erro ao listar buckets:', bucketsError);
      return { success: false, message: 'Erro ao verificar buckets de armazenamento' };
    }
    
    // Se o bucket não existir, tentar criá-lo
    if (!buckets?.some(b => b.name === bucketName)) {
      console.log(`Bucket ${bucketName} não encontrado, tentando criar...`);
      
      // Tentar criar o bucket
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: bucketName.includes('video') ? 314572800 : 104857600 // 300MB para vídeos, 100MB para outros
      });
      
      if (createError) {
        console.error('Erro ao criar bucket:', createError);
        return { 
          success: false, 
          message: `Não foi possível criar o bucket ${bucketName}`
        };
      }
    }
    
    // Tentar definir política pública para o bucket usando RPC
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'create_storage_public_policy',
        { bucket_name: bucketName }
      );
      
      if (rpcError) {
        console.warn('Erro ao definir políticas via RPC:', rpcError);
        // Continuar mesmo com erro na definição de políticas
      }
    } catch (error) {
      console.warn('Falha ao chamar RPC para políticas:', error);
      // Continuar mesmo com erro
    }
    
    return { success: true, message: `Bucket ${bucketName} configurado com sucesso` };
  } catch (error) {
    console.error('Erro na configuração do bucket:', error);
    return { 
      success: false, 
      message: `Erro ao configurar bucket: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Faz upload de um arquivo para o Storage com suporte a fallback para outro bucket
 * @param file Arquivo para upload
 * @param primaryBucket Bucket principal
 * @param folderPath Caminho da pasta (opcional)
 * @param onProgressUpdate Callback para atualização de progresso (opcional)
 * @returns Objeto com URL pública e caminho do arquivo
 */
export const uploadFileWithFallback = async (
  file: File,
  primaryBucket: string,
  folderPath: string = '',
  onProgressUpdate?: (progress: number) => void
) => {
  if (onProgressUpdate) onProgressUpdate(10);
  
  // Primeiro, tentar criar/verificar o bucket
  const bucketSetup = await createStoragePublicPolicy(primaryBucket);
  console.log('Resultado da configuração do bucket:', bucketSetup);
  
  let currentBucket = primaryBucket;
  let attempt = 1;
  let error;
  
  // Gerar nome de arquivo único
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
  
  if (onProgressUpdate) onProgressUpdate(30);
  
  // Tentar upload no bucket principal
  try {
    console.log(`Tentativa ${attempt}: Upload para ${currentBucket}/${filePath}`);
    const { data, error: uploadError } = await supabase.storage
      .from(currentBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (!uploadError) {
      if (onProgressUpdate) onProgressUpdate(90);
      
      // Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from(currentBucket)
        .getPublicUrl(filePath);
      
      if (onProgressUpdate) onProgressUpdate(100);
      
      return { 
        path: filePath,
        publicUrl: publicUrlData.publicUrl 
      };
    }
    
    error = uploadError;
    console.warn(`Erro no bucket ${currentBucket}:`, error);
  } catch (err) {
    error = err;
    console.warn(`Exceção no bucket ${currentBucket}:`, err);
  }
  
  // Se falhou, tentar no bucket de fallback
  if (currentBucket !== STORAGE_BUCKETS.FALLBACK) {
    attempt++;
    currentBucket = STORAGE_BUCKETS.FALLBACK;
    
    try {
      // Tentar criar/verificar o bucket de fallback
      await createStoragePublicPolicy(STORAGE_BUCKETS.FALLBACK);
      
      console.log(`Tentativa ${attempt}: Upload para ${currentBucket}/${filePath}`);
      const { data, error: fallbackError } = await supabase.storage
        .from(currentBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (!fallbackError) {
        if (onProgressUpdate) onProgressUpdate(90);
        
        // Obter URL pública
        const { data: publicUrlData } = supabase.storage
          .from(currentBucket)
          .getPublicUrl(filePath);
        
        if (onProgressUpdate) onProgressUpdate(100);
        
        return { 
          path: filePath,
          publicUrl: publicUrlData.publicUrl 
        };
      }
      
      error = fallbackError;
    } catch (err) {
      error = err;
    }
  }
  
  // Se ambas as tentativas falharem
  throw error || new Error('Falha no upload do arquivo');
};
