
import { supabase } from './client';

export const getYoutubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const getYoutubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const formatVideoDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const setupLearningStorageBuckets = async () => {
  try {
    const { data, error } = await supabase.rpc('setup_learning_storage_buckets');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error setting up storage buckets:', error);
    throw error;
  }
};

export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('create_storage_public_policy', { bucket_name: bucketName });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error ensuring bucket ${bucketName} exists:`, error);
    throw error;
  }
};

// Alias para compatibilidade
export const ensureStorageBucketExists = ensureBucketExists;

export const extractPandaVideoInfo = (url: string) => {
  // Implementação para extrair informações de vídeo do Panda
  return {
    videoId: url,
    thumbnailUrl: '',
    duration: 0,
    url: url // Adicionando a propriedade url que estava faltando
  };
};

// Tipos para as funções de upload
interface UploadSuccess {
  publicUrl: string;
  path: string;
  error?: never;
}

interface UploadError {
  error: Error;
  publicUrl?: never;
  path?: never;
}

export type UploadResult = UploadSuccess | UploadError;

export const uploadFileWithFallback = async (
  file: File,
  bucket: string,
  folderPath: string,
  onProgress?: (progress: number) => void,
  fallbackBucket?: string
): Promise<UploadResult> => {
  try {
    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${safeName}`;
    const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;

    if (onProgress) onProgress(10);

    // Tentar upload principal
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file);

    if (error) {
      // Tentar com bucket de fallback se especificado
      if (fallbackBucket && fallbackBucket !== bucket) {
        console.log(`Tentando upload com fallback bucket: ${fallbackBucket}`);
        const fallbackResult = await supabase.storage
          .from(fallbackBucket)
          .upload(fullPath, file);
          
        if (fallbackResult.error) {
          throw fallbackResult.error;
        }
        
        // Obter URL pública do fallback
        const { data: urlData } = supabase.storage
          .from(fallbackBucket)
          .getPublicUrl(fallbackResult.data.path);
          
        if (onProgress) onProgress(100);
        
        return {
          publicUrl: urlData.publicUrl,
          path: fallbackResult.data.path
        };
      }
      throw error;
    }

    if (onProgress) onProgress(50);

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (onProgress) onProgress(100);

    return {
      publicUrl: urlData.publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      error: error instanceof Error ? error : new Error('Unknown upload error')
    };
  }
};
