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
 * @returns Objeto com informações do resultado da operação
 */
export const setupLearningStorageBuckets = async () => {
  try {
    console.log('Configurando buckets de armazenamento para o LMS...');
    
    const { data, error } = await supabase.rpc('setup_learning_storage_buckets');
    
    if (error) {
      console.error('Erro ao configurar buckets:', error);
      return { 
        success: false, 
        message: error.message,
        error: error.message 
      };
    }
    
    console.log('Buckets configurados com sucesso:', data);
    
    return { 
      success: true, 
      message: 'Buckets configurados com sucesso',
      data 
    };
  } catch (error) {
    console.error('Falha na configuração de buckets:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      success: false, 
      message: errorMessage,
      error: errorMessage 
    };
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
    return { 
      videoId: '', 
      thumbnail: '',
      url: '',
      thumbnailUrl: ''
    };
  }

  const thumbnailUrl = data.thumbnailUrl || data.thumbnail || '';
  const url = data.url || `https://pandavideo.com.br/videos/${data.id}`;

  return {
    videoId: data.id || '',
    thumbnail: thumbnailUrl,
    url: url,
    thumbnailUrl: thumbnailUrl
  };
};

/**
 * Faz upload de um arquivo com fallback para um bucket alternativo
 * @param file Arquivo a ser enviado
 * @param bucketName Nome do bucket principal
 * @param filePath Caminho onde o arquivo será armazenado
 * @param onProgressUpdate Callback opcional para atualização de progresso
 * @param fallbackBucket Bucket alternativo opcional para fallback
 * @returns Objeto com URL do arquivo ou erro
 */
export const uploadFileWithFallback = async (
  file: File,
  bucketName: string,
  filePath: string,
  onProgressUpdate?: (progress: number) => void,
  fallbackBucket?: string
): Promise<{ url: string | null; publicUrl?: string; path?: string; error: Error | null }> => {
  try {
    if (onProgressUpdate) {
      onProgressUpdate(10);
    }
    
    // Tentativa inicial no bucket primário
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: true });
    
    // Se o upload foi bem-sucedido
    if (data && !error) {
      if (onProgressUpdate) {
        onProgressUpdate(80);
      }
      
      const { data: publicUrlData } = await supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      if (onProgressUpdate) {
        onProgressUpdate(100);
      }
      
      return { 
        url: publicUrlData.publicUrl, 
        publicUrl: publicUrlData.publicUrl, 
        path: filePath,
        error: null 
      };
    }
    
    // Se houve erro mas não é um problema de bucket inexistente
    if (error && !error.message.includes('bucket') && !error.message.includes('does not exist')) {
      console.error(`Erro ao fazer upload para ${bucketName}:`, error);
      return { url: null, error: new Error(error.message) };
    }

    if (onProgressUpdate) {
      onProgressUpdate(20);
    }

    // Tentar criar o bucket
    const bucketCreated = await ensureBucketExists(bucketName);
    if (bucketCreated) {
      if (onProgressUpdate) {
        onProgressUpdate(40);
      }
      
      // Tentar novamente com o bucket recém-criado
      const { data: retryData, error: retryError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true });
      
      if (retryData && !retryError) {
        if (onProgressUpdate) {
          onProgressUpdate(80);
        }
        
        const { data: publicUrlData } = await supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        
        if (onProgressUpdate) {
          onProgressUpdate(100);
        }
        
        return { 
          url: publicUrlData.publicUrl, 
          publicUrl: publicUrlData.publicUrl, 
          path: filePath,
          error: null 
        };
      }
      
      console.error(`Erro na segunda tentativa de upload para ${bucketName}:`, retryError);
    }

    // Fallback para o bucket geral se fornecido
    if (fallbackBucket) {
      console.log(`Usando bucket de fallback ${fallbackBucket} para o upload`);
      
      if (onProgressUpdate) {
        onProgressUpdate(60);
      }
      
      const fallbackPath = `fallback/${bucketName}/${filePath}`;
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from(fallbackBucket)
        .upload(fallbackPath, file, { upsert: true });
      
      if (fallbackData && !fallbackError) {
        if (onProgressUpdate) {
          onProgressUpdate(90);
        }
        
        const { data: publicUrlData } = await supabase.storage
          .from(fallbackBucket)
          .getPublicUrl(fallbackPath);
        
        if (onProgressUpdate) {
          onProgressUpdate(100);
        }
        
        return { 
          url: publicUrlData.publicUrl, 
          publicUrl: publicUrlData.publicUrl, 
          path: fallbackPath,
          error: null 
        };
      }
    }
    
    console.error('Todas as tentativas de upload falharam');
    return { 
      url: null, 
      error: new Error('Todas as tentativas de upload falharam') 
    };
  } catch (error) {
    console.error('Exceção durante upload:', error);
    return { 
      url: null, 
      error: error instanceof Error ? error : new Error('Erro desconhecido durante upload') 
    };
  }
};

// Note que não exportamos createStoragePublicPolicy daqui, pois ele vem do módulo rpc
