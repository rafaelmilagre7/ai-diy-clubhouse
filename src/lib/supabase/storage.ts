
import { supabase } from "./client";
import { createStoragePublicPolicy } from "./rpc";
import { STORAGE_BUCKETS } from "./config";

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
export const extractPandaVideoInfo = (embedCode: string): { videoId: string; thumbnail: string } | null => {
  try {
    const idRegex = /video-id="([^"]+)"/;
    const thumbnailRegex = /thumbnail="([^"]+)"/;
    
    const idMatch = embedCode.match(idRegex);
    const thumbnailMatch = embedCode.match(thumbnailRegex);
    
    if (idMatch && idMatch[1]) {
      return {
        videoId: idMatch[1],
        thumbnail: thumbnailMatch && thumbnailMatch[1] ? thumbnailMatch[1] : ''
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
