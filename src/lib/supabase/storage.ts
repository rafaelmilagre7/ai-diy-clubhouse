
import { supabase } from "./client";
import { STORAGE_BUCKETS } from "./config";

/**
 * Obtém o ID de um vídeo do YouTube a partir de uma URL
 */
export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Obtém a URL da thumbnail de um vídeo do YouTube
 */
export const getYoutubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * Formata a duração de um vídeo para exibição (MM:SS)
 */
export const formatVideoDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Configura os buckets de armazenamento necessários para o LMS
 */
export const setupLearningStorageBuckets = async () => {
  try {
    console.log('Configurando buckets de armazenamento para o LMS...');
    
    const { data, error } = await supabase.rpc('setup_learning_storage_buckets');
    
    if (error) {
      console.error('Erro ao configurar buckets:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Buckets configurados com sucesso:', data);
    
    return { success: true, data };
  } catch (error) {
    console.error('Falha na configuração de buckets:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

/**
 * Verifica se um bucket existe e cria se necessário
 */
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    // Verificar se o bucket já existe
    const { data: existingBucket, error: checkError } = await supabase
      .storage
      .getBucket(bucketName);
    
    if (existingBucket) {
      console.log(`Bucket ${bucketName} já existe`);
      return true;
    }
    
    if (checkError && checkError.message !== 'The resource was not found') {
      console.error(`Erro ao verificar bucket ${bucketName}:`, checkError);
      return false;
    }
    
    // Criar o bucket se não existir
    const { data, error } = await supabase
      .storage
      .createBucket(bucketName, {
        public: true,
        fileSizeLimit: 314572800 // 300MB
      });
      
    if (error) {
      console.error(`Erro ao criar bucket ${bucketName}:`, error);
      return false;
    }
    
    console.log(`Bucket ${bucketName} criado com sucesso`);
    return true;
  } catch (error) {
    console.error(`Exceção ao verificar/criar bucket ${bucketName}:`, error);
    return false;
  }
};

/**
 * Extrai informações de um vídeo do Panda Video
 */
export const extractPandaVideoInfo = (data: any): { videoId: string; thumbnail: string; url: string; thumbnailUrl: string } => {
  // Verificando se os dados são válidos
  if (!data || !data.id) {
    console.error('Dados de vídeo inválidos:', data);
    return { videoId: '', thumbnail: '', url: '', thumbnailUrl: '' };
  }

  return {
    videoId: data.id || '',
    thumbnail: data.thumbnailUrl || data.thumbnail || '',
    url: data.url || '',
    thumbnailUrl: data.thumbnailUrl || data.thumbnail || ''
  };
};

/**
 * Faz upload de um arquivo com fallback para um bucket alternativo
 */
export const uploadFileWithFallback = async (
  file: File,
  bucketName: string,
  filePath: string = '',
  onProgress?: (progress: number) => void,
  fallbackBucket?: string
): Promise<{ publicUrl: string; path: string; error: null } | { error: Error }> => {
  try {
    if (onProgress) {
      onProgress(5);
    }

    // Tentativa inicial no bucket primário
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: true });
    
    // Se o upload foi bem-sucedido
    if (data && !error) {
      if (onProgress) {
        onProgress(90);
      }

      const { data: publicUrlData } = await supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      if (onProgress) {
        onProgress(100);
      }

      return { publicUrl: publicUrlData.publicUrl, path: data.path, error: null };
    }
    
    // Se houve erro mas não é um problema de bucket inexistente
    if (error && !error.message.includes('bucket') && !error.message.includes('does not exist')) {
      console.error(`Erro ao fazer upload para ${bucketName}:`, error);
      return { error: new Error(error.message) };
    }

    // Tentar criar o bucket
    const bucketCreated = await ensureBucketExists(bucketName);
    if (bucketCreated) {
      if (onProgress) {
        onProgress(30);
      }

      // Tentar novamente com o bucket recém-criado
      const { data: retryData, error: retryError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true });
      
      if (retryData && !retryError) {
        if (onProgress) {
          onProgress(90);
        }

        const { data: publicUrlData } = await supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        
        if (onProgress) {
          onProgress(100);
        }

        return { publicUrl: publicUrlData.publicUrl, path: retryData.path, error: null };
      }
      
      console.error(`Erro na segunda tentativa de upload para ${bucketName}:`, retryError);
      if (!fallbackBucket) {
        return { error: new Error(retryError?.message || 'Falha no upload após criar bucket') };
      }
    }

    // Fallback para o bucket geral
    if (fallbackBucket) {
      console.log(`Usando bucket de fallback ${fallbackBucket} para o upload`);
      
      if (onProgress) {
        onProgress(40);
      }

      const fallbackPath = `fallback/${bucketName}/${filePath}`;
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from(fallbackBucket)
        .upload(fallbackPath, file, { upsert: true });
      
      if (fallbackData && !fallbackError) {
        if (onProgress) {
          onProgress(90);
        }

        const { data: publicUrlData } = await supabase.storage
          .from(fallbackBucket)
          .getPublicUrl(fallbackPath);
        
        if (onProgress) {
          onProgress(100);
        }

        return { publicUrl: publicUrlData.publicUrl, path: fallbackData.path, error: null };
      }
      
      console.error('Todas as tentativas de upload falharam:', fallbackError);
      return { error: new Error(fallbackError?.message || 'Todas as tentativas de upload falharam') };
    }
    
    return { error: new Error('Falha no upload e nenhum bucket de fallback fornecido') };
  } catch (error) {
    console.error('Exceção durante upload:', error);
    return { error: error instanceof Error ? error : new Error('Erro desconhecido durante upload') };
  }
};
