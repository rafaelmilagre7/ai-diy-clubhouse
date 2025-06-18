
import { supabase } from './client';
import { v4 as uuidv4 } from 'uuid';

// Função para verificar se um bucket existe
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Erro ao listar buckets:', error);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} não existe, tentando criar...`);
      
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 104857600 // 100MB
      });
      
      if (createError) {
        console.error(`Erro ao criar bucket ${bucketName}:`, createError);
        return false;
      }
      
      console.log(`Bucket ${bucketName} criado com sucesso`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar/criar bucket:', error);
    return false;
  }
};

// Função de upload com fallback
export const uploadFileWithFallback = async (
  file: File,
  bucketName: string,
  folderPath: string = '',
  onProgress?: (progress: number) => void,
  fallbackBucket?: string
): Promise<{ publicUrl: string; path: string; error: null } | { error: Error }> => {
  try {
    if (onProgress) onProgress(5);
    
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    if (onProgress) onProgress(25);
    
    // Tentar upload no bucket principal
    let uploadResult = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });
    
    // Se falhar e tiver fallback, tentar no fallback
    if (uploadResult.error && fallbackBucket) {
      console.log(`Upload falhou no bucket ${bucketName}, tentando fallback ${fallbackBucket}`);
      
      uploadResult = await supabase.storage
        .from(fallbackBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });
      
      // Atualizar bucketName para o fallback se deu certo
      if (!uploadResult.error) {
        bucketName = fallbackBucket;
      }
    }
    
    if (uploadResult.error) {
      throw new Error(`Falha no upload: ${uploadResult.error.message}`);
    }
    
    if (onProgress) onProgress(80);
    
    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadResult.data.path);
    
    if (!urlData.publicUrl) {
      throw new Error('Falha ao obter URL pública');
    }
    
    if (onProgress) onProgress(100);
    
    return {
      publicUrl: urlData.publicUrl,
      path: uploadResult.data.path,
      error: null
    };
    
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return { 
      error: error instanceof Error ? error : new Error(error.message || 'Erro desconhecido') 
    };
  }
};

// Configurar buckets de armazenamento
export const setupLearningStorageBuckets = async () => {
  const buckets = [
    'learning_materials',
    'course_images', 
    'learning_videos',
    'solution_files',
    'lesson_images',
    'event_images',
    'general_storage'
  ];
  
  for (const bucket of buckets) {
    await ensureBucketExists(bucket);
  }
};

// Função para extrair ID de vídeo do YouTube
export const getYoutubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Função para obter thumbnail do YouTube
export const getYoutubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Função para formatar duração de vídeo
export const formatVideoDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Função para extrair informações de vídeo Panda
export const extractPandaVideoInfo = (url: string) => {
  // Implementação específica para Panda Video se necessário
  return {
    videoId: null,
    thumbnailUrl: null
  };
};
