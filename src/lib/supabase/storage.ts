
import { supabase } from "./client";
import { createStoragePublicPolicy } from "./rpc";
import { STORAGE_BUCKETS } from "./config";
import { v4 as uuidv4 } from 'uuid';

/**
 * Extrai o ID de um vídeo do YouTube a partir de uma URL
 */
export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Regex que captura o ID de vídeos do YouTube em vários formatos de URL
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  
  return match ? match[1] : null;
};

/**
 * Obtém a URL da thumbnail de um vídeo do YouTube
 */
export const getYoutubeThumbnailUrl = (videoId: string): string => {
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * Formata a duração de um vídeo para exibição
 */
export const formatVideoDuration = (seconds: number | null | undefined): string => {
  if (!seconds) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Extrai informações de vídeos da Panda Video
 */
export const extractPandaVideoInfo = (embedCode: string): { videoId: string; thumbnail: string; url: string; thumbnailUrl: string } | null => {
  try {
    const idRegex = /video-id="([^"]+)"/;
    const thumbnailRegex = /thumbnail="([^"]+)"/;
    
    const idMatch = embedCode.match(idRegex);
    const thumbnailMatch = embedCode.match(thumbnailRegex);
    
    if (idMatch && idMatch[1]) {
      const videoId = idMatch[1];
      const thumbnail = thumbnailMatch && thumbnailMatch[1] ? thumbnailMatch[1] : '';
      // Adicionando as propriedades url e thumbnailUrl para compatibilidade
      const url = `https://player.pandavideo.com.br/embed/?v=${videoId}`;
      
      return {
        videoId,
        thumbnail,
        url,
        thumbnailUrl: thumbnail // thumbnailUrl é um alias para thumbnail
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao extrair informações do vídeo Panda:", error);
    return null;
  }
};

/**
 * Garantir que um bucket de armazenamento exista
 */
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
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
          
          const result = await createStoragePublicPolicy(bucketName);
          if (!result.success) {
            console.error(`Erro ao criar bucket ${bucketName} via RPC:`, result.error);
            return false;
          }
          
          console.log(`Bucket ${bucketName} criado com sucesso via RPC`);
          return true;
        }
        
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar/criar bucket:", error);
    return false;
  }
};

/**
 * Configura todos os buckets necessários para o sistema de aprendizado
 */
export const setupLearningStorageBuckets = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const results = await Promise.all([
      ensureBucketExists(STORAGE_BUCKETS.LEARNING_MATERIALS),
      ensureBucketExists(STORAGE_BUCKETS.COURSE_IMAGES),
      ensureBucketExists(STORAGE_BUCKETS.LEARNING_VIDEOS),
      ensureBucketExists(STORAGE_BUCKETS.SOLUTION_FILES)
    ]);
    
    const allSuccess = results.every(r => r === true);
    
    if (allSuccess) {
      return {
        success: true,
        message: "Todos os buckets de armazenamento configurados com sucesso"
      };
    } else {
      return {
        success: false,
        message: "Alguns buckets não puderam ser configurados"
      };
    }
  } catch (error) {
    console.error("Erro ao configurar buckets de armazenamento:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
};

/**
 * Função para upload de arquivos com fallback automático para outro bucket
 */
export const uploadFileWithFallback = async (
  file: File,
  bucketName: string,
  folderPath: string = "",
  onProgressUpdate?: (progress: number) => void,
  fallbackBucket: string = STORAGE_BUCKETS.FALLBACK
): Promise<{
  publicUrl: string;
  path: string;
  size: number;
}> => {
  try {
    // Atualizar progresso inicial
    if (onProgressUpdate) {
      onProgressUpdate(5);
    }
    
    console.log(`Iniciando upload para bucket: ${bucketName}, pasta: ${folderPath}`);
    
    // Verificar se o bucket existe
    const bucketExists = await ensureBucketExists(bucketName);
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} não encontrado ou não pôde ser criado. Usando fallback: ${fallbackBucket}`);
    }
    
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${uuidv4()}_${safeFileName}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    if (onProgressUpdate) {
      onProgressUpdate(20);
    }
    
    // Tentar fazer upload para o bucket principal
    let uploadError = null;
    try {
      const { data, error } = await supabase.storage
        .from(bucketExists ? bucketName : fallbackBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        console.error("Erro no upload inicial:", error);
        uploadError = error;
      } else {
        if (onProgressUpdate) {
          onProgressUpdate(90);
        }
        
        // Upload bem-sucedido, obter URL pública
        const actualBucket = bucketExists ? bucketName : fallbackBucket;
        const { data: urlData } = supabase.storage
          .from(actualBucket)
          .getPublicUrl(filePath);
        
        if (onProgressUpdate) {
          onProgressUpdate(100);
        }
        
        return {
          publicUrl: urlData.publicUrl,
          path: filePath,
          size: file.size
        };
      }
    } catch (e) {
      console.error("Exceção no upload inicial:", e);
      uploadError = e;
    }
    
    // Se chegarmos aqui, houve um erro no upload inicial
    // Tentar com o bucket de fallback se ainda não tentamos
    if (uploadError && bucketExists) {
      console.log(`Tentando upload com bucket de fallback: ${fallbackBucket}`);
      
      if (onProgressUpdate) {
        onProgressUpdate(30);
      }
      
      const fallbackFilePath = `${bucketName}/${filePath}`;
      
      const { data, error } = await supabase.storage
        .from(fallbackBucket)
        .upload(fallbackFilePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        console.error("Erro no upload de fallback:", error);
        throw error;
      }
      
      if (onProgressUpdate) {
        onProgressUpdate(95);
      }
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from(fallbackBucket)
        .getPublicUrl(fallbackFilePath);
      
      if (onProgressUpdate) {
        onProgressUpdate(100);
      }
      
      return {
        publicUrl: urlData.publicUrl,
        path: fallbackFilePath,
        size: file.size
      };
    }
    
    throw uploadError || new Error("Falha no upload do arquivo");
    
  } catch (error) {
    console.error("Erro no processo de upload:", error);
    throw error;
  }
};
