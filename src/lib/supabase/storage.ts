
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Constantes para buckets de armazenamento
export const STORAGE_BUCKETS = {
  LEARNING_VIDEOS: "learning_videos",
  LEARNING_RESOURCES: "learning_resources",
  SOLUTION_RESOURCES: "solution_resources",
  SOLUTION_FILES: "solution_files",
  COVER_IMAGES: "cover_images",
  FALLBACK: "public" // Bucket de fallback para caso outros não estejam disponíveis
};

/**
 * Interface para o resultado de um upload de arquivo
 */
export interface FileUploadResult {
  path: string;
  publicUrl: string;
  size: number;
  mimetype: string;
}

/**
 * Função para fazer upload de arquivo com fallback para outro bucket
 */
export async function uploadFileWithFallback(
  file: File,
  bucketName: string,
  folderPath: string = "",
  progressCallback?: (progress: number) => void,
  fallbackBucket: string = STORAGE_BUCKETS.FALLBACK
): Promise<FileUploadResult> {
  try {
    // Tentar criar o bucket caso não exista
    await createStoragePublicPolicy(bucketName);
    
    // Gerar um nome de arquivo único
    const fileExt = file.name.split('.').pop();
    const filePath = folderPath 
      ? `${folderPath}/${Date.now()}-${file.name}`
      : `${Date.now()}-${file.name}`;
    
    // Configurações de upload
    const options = {
      cacheControl: '3600',
      upsert: true
    };
    
    // Simulação de progresso porque o supabase client não oferece callback de progresso nativo
    if (progressCallback) {
      // Simular progresso inicial
      progressCallback(10);
      
      // Após 1 segundo, mostrar mais progresso
      setTimeout(() => progressCallback(30), 1000);
      
      // Após mais 1 segundo, mostrar mais progresso
      setTimeout(() => progressCallback(60), 2000);
    }
    
    // Tentar fazer upload para o bucket principal
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, options);
    
    if (error) {
      console.warn(`Erro ao fazer upload para bucket ${bucketName}. Tentando fallback:`, error);
      
      // Se falhar, tentar o bucket de fallback
      if (progressCallback) progressCallback(70);
      
      const fallbackResult = await supabase.storage
        .from(fallbackBucket)
        .upload(filePath, file, options);
      
      if (fallbackResult.error) {
        throw fallbackResult.error;
      }
      
      // Obter URL pública do arquivo no bucket de fallback
      const { data: publicUrlData } = supabase.storage
        .from(fallbackBucket)
        .getPublicUrl(fallbackResult.data?.path || filePath);
      
      if (progressCallback) progressCallback(100);
      
      return {
        path: fallbackResult.data?.path || filePath,
        publicUrl: publicUrlData?.publicUrl || "",
        size: file.size,
        mimetype: file.type
      };
    }
    
    // Obter URL pública do arquivo
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data?.path || filePath);
    
    if (progressCallback) progressCallback(100);
    
    return {
      path: data?.path || filePath,
      publicUrl: publicUrlData?.publicUrl || "",
      size: file.size,
      mimetype: file.type
    };
  } catch (error: any) {
    console.error("Erro fatal no upload:", error);
    throw new Error(`Erro no upload: ${error.message || "Falha desconhecida"}`);
  }
}

/**
 * Função auxiliar para obter URL pública de um arquivo
 */
export function getPublicStorageUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Função para configurar buckets de armazenamento para o módulo de aprendizagem
 */
export async function setupLearningStorageBuckets(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Lista de buckets a serem verificados/criados
    const bucketsToSetup = [
      STORAGE_BUCKETS.LEARNING_VIDEOS,
      STORAGE_BUCKETS.LEARNING_RESOURCES,
      STORAGE_BUCKETS.COVER_IMAGES,
      STORAGE_BUCKETS.FALLBACK
    ];
    
    let successCount = 0;
    let errors = [];
    
    // Verificar/criar cada bucket
    for (const bucketName of bucketsToSetup) {
      try {
        // Usar a RPC para criar/atualizar o bucket
        const { error } = await supabase.rpc('create_storage_public_policy', {
          bucket_name: bucketName
        });
        
        if (!error) {
          successCount++;
        } else {
          console.warn(`Erro ao configurar bucket ${bucketName}:`, error);
          errors.push(`${bucketName}: ${error.message}`);
        }
      } catch (bucketError) {
        console.error(`Erro ao configurar bucket ${bucketName}:`, bucketError);
        errors.push(`${bucketName}: ${bucketError instanceof Error ? bucketError.message : String(bucketError)}`);
      }
    }
    
    if (successCount === bucketsToSetup.length) {
      return { 
        success: true, 
        message: "Todos os buckets foram configurados com sucesso." 
      };
    } else {
      return { 
        success: successCount > 0,
        message: `${successCount}/${bucketsToSetup.length} buckets configurados. Erros: ${errors.join(", ")}`
      };
    }
  } catch (error) {
    console.error("Erro ao configurar buckets de armazenamento:", error);
    return {
      success: false,
      message: `Erro ao configurar buckets: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Função para criar políticas de acesso público para um bucket
 */
export async function createStoragePublicPolicy(bucketName: string): Promise<boolean> {
  try {
    // Verificar se o bucket já existe
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Se não existir, usar a RPC para criar o bucket e suas políticas
      const { error } = await supabase.rpc('create_storage_public_policy', {
        bucket_name: bucketName
      });
      
      if (error) {
        console.error(`Erro ao criar bucket ${bucketName}:`, error);
        return false;
      }
      
      console.log(`Bucket ${bucketName} criado com sucesso.`);
    } else {
      console.log(`Bucket ${bucketName} já existe.`);
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao configurar bucket ${bucketName}:`, error);
    return false;
  }
}

/**
 * Função auxiliar para obter o tipo de conteúdo de um arquivo pelo nome
 */
export function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const contentTypeMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'webm': 'video/webm'
  };
  
  return extension && contentTypeMap[extension] ? contentTypeMap[extension] : 'application/octet-stream';
}
