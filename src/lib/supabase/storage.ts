
import { supabase } from './client';
import { STORAGE_BUCKETS, MAX_UPLOAD_SIZES } from './config';
import { toast } from 'sonner';

/**
 * Configura os buckets de armazenamento necessários para recursos de aprendizagem
 * @returns Objeto com status da operação
 */
export async function setupLearningStorageBuckets(): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    console.log("Iniciando configuração dos buckets de armazenamento para aprendizado...");
    
    // Buckets necessários para o módulo de formação
    const requiredBuckets = [
      STORAGE_BUCKETS.COURSE_IMAGES, 
      STORAGE_BUCKETS.LEARNING_MATERIALS, 
      STORAGE_BUCKETS.LEARNING_VIDEOS
    ];
    
    const results = await Promise.all(
      requiredBuckets.map(async (bucketName) => {
        return ensureStorageBucketExists(bucketName);
      })
    );
    
    const allSuccessful = results.every(result => result === true);
    
    if (allSuccessful) {
      console.log("Todos os buckets de armazenamento foram configurados com sucesso!");
      return { success: true };
    } else {
      const failedBuckets = requiredBuckets.filter((_, index) => !results[index]);
      console.warn(`Alguns buckets não puderam ser configurados: ${failedBuckets.join(', ')}`);
      return { 
        success: false, 
        message: `Alguns buckets não puderam ser configurados: ${failedBuckets.join(', ')}` 
      };
    }
  } catch (error) {
    console.error("Erro ao configurar buckets de armazenamento:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro desconhecido" 
    };
  }
}

/**
 * Verifica se um bucket de armazenamento existe e cria se necessário
 * @param bucketName Nome do bucket
 * @returns true se o bucket existe ou foi criado com sucesso
 */
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
        
        // Se o erro foi de permissão, tentar usar a função RPC
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
      
      // Configurar políticas de acesso
      try {
        await createStoragePublicPolicy(bucketName);
      } catch (policyError) {
        console.error(`Não foi possível definir políticas para ${bucketName}:`, policyError);
        // Não falhar por causa de políticas - o bucket já foi criado
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar/criar bucket:", error);
    return false;
  }
}

/**
 * Cria políticas de acesso público para um bucket
 * @param bucketName Nome do bucket
 * @returns Objeto com status da operação
 */
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

/**
 * Função para upload de arquivos com fallback para outros buckets se necessário
 * @param file Arquivo a ser enviado
 * @param bucketName Nome do bucket principal
 * @param folderPath Caminho da pasta dentro do bucket
 * @param onProgress Callback para progresso do upload
 * @param fallbackBucket Bucket alternativo em caso de falha
 * @returns Objeto com informações do upload
 */
export async function uploadFileWithFallback(
  file: File,
  bucketName: string,
  folderPath: string = "",
  onProgress?: (progress: number) => void,
  fallbackBucket: string = STORAGE_BUCKETS.FALLBACK
): Promise<{
  path: string;
  fullPath: string;
  publicUrl: string;
  size: number;
  uploadedTo: string;
}> {
  // Verificar se o arquivo existe
  if (!file) {
    throw new Error("Nenhum arquivo fornecido para upload");
  }
  
  // Primeira tentativa no bucket principal
  try {
    // Verificar se o bucket existe
    const bucketExists = await ensureStorageBucketExists(bucketName);
    
    if (!bucketExists) {
      console.warn(`Bucket ${bucketName} não está disponível, tentando fallback: ${fallbackBucket}`);
      throw new Error(`Bucket ${bucketName} não está disponível`);
    }
    
    // Gerar nome de arquivo único para evitar colisões
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    // Realizar upload
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          const percentage = Math.round((progress.loaded / progress.total) * 100);
          if (onProgress) onProgress(percentage);
        }
      });
    
    if (error) throw error;
    
    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data?.path || filePath);
    
    return {
      path: data?.path || filePath,
      fullPath: `${bucketName}/${data?.path || filePath}`,
      publicUrl: publicUrlData.publicUrl,
      size: file.size,
      uploadedTo: bucketName
    };
  } catch (error) {
    console.error(`Erro no upload para bucket ${bucketName}:`, error);
    
    // Se falhou e temos um fallback, tentar no bucket alternativo
    if (fallbackBucket && fallbackBucket !== bucketName) {
      console.log(`Tentando upload no bucket de fallback: ${fallbackBucket}`);
      
      try {
        // Verificar se o bucket de fallback existe
        const fallbackExists = await ensureStorageBucketExists(fallbackBucket);
        
        if (!fallbackExists) {
          throw new Error(`Nem o bucket primário ${bucketName} nem o de fallback ${fallbackBucket} estão disponíveis`);
        }
        
        // Gerar nome de arquivo único para o fallback
        const fileExt = file.name.split('.').pop();
        const fileName = `${bucketName}_${Date.now()}_${Math.floor(Math.random() * 10000)}.${fileExt}`;
        const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
        
        // Realizar upload no fallback
        const { data, error } = await supabase.storage
          .from(fallbackBucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (progress) => {
              const percentage = Math.round((progress.loaded / progress.total) * 100);
              if (onProgress) onProgress(percentage);
            }
          });
        
        if (error) throw error;
        
        // Obter URL pública do fallback
        const { data: publicUrlData } = supabase.storage
          .from(fallbackBucket)
          .getPublicUrl(data?.path || filePath);
        
        console.log(`Upload bem sucedido no bucket fallback: ${fallbackBucket}`);
        
        return {
          path: data?.path || filePath,
          fullPath: `${fallbackBucket}/${data?.path || filePath}`,
          publicUrl: publicUrlData.publicUrl,
          size: file.size,
          uploadedTo: fallbackBucket
        };
      } catch (fallbackError) {
        console.error(`Erro no upload para bucket fallback ${fallbackBucket}:`, fallbackError);
        throw new Error(`Falha no upload para os buckets ${bucketName} e ${fallbackBucket}`);
      }
    } else {
      // Se não temos fallback ou fallback é o mesmo bucket, relançar o erro original
      throw error;
    }
  }
}
