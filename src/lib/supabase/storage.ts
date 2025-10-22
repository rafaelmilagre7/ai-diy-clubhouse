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
    const { data, error } = await supabase.rpc('setup_learning_storage_buckets');
    
    if (error) {
      console.error('Erro ao configurar buckets:', error);
      return { success: false, error: error.message };
    }
    
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
  // Clientes com anon key não podem listar/criar buckets via Storage API.
  // Evitamos chamadas administrativas no front-end para não gerar 400/401.
  console.debug(`[STORAGE] Skip bucket check/create on client for: ${bucketName}`);
  return true;
};

/**
 * Extrai informações de um vídeo do Panda Video
 * 
 * Aceita um código de incorporação HTML (iframe) ou um objeto com os dados do vídeo
 */
export const extractPandaVideoInfo = (data: any): { videoId: string; url: string; thumbnailUrl: string } => {
  // Se recebermos uma string (código iframe), extrair informações do código HTML
  if (typeof data === 'string') {
    try {
      // Extrair src do iframe
      const srcMatch = data.match(/src=["'](https:\/\/[^"']+)["']/i);
      if (!srcMatch || !srcMatch[1]) {
        console.error('URL não encontrada no iframe');
        throw new Error('URL não encontrada no iframe');
      }
      
      const iframeSrc = srcMatch[1];
      let videoId = '';
      let thumbnailUrl = '';
      
      // Extrair videoId do URL - Múltiplos formatos possíveis
      let videoIdExtracted = false;
      
      // Formato 1: https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=VIDEO_ID
      const formatoV = iframeSrc.match(/[?&]v=([a-f0-9\-]{36})/i);
      if (formatoV && formatoV[1]) {
        videoId = formatoV[1];
        videoIdExtracted = true;
      }
      
      // Formato 2: https://player.pandavideo.com.br/embed/VIDEO_ID  
      if (!videoIdExtracted) {
        const formatoEmbed = iframeSrc.match(/\/embed\/([a-f0-9\-]{36})/i);
        if (formatoEmbed && formatoEmbed[1]) {
          videoId = formatoEmbed[1];
          videoIdExtracted = true;
        }
      }
      
      // Formato 3: Buscar qualquer UUID padrão na URL (mais específico)
      if (!videoIdExtracted) {
        const uuidMatch = iframeSrc.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
        if (uuidMatch && uuidMatch[1]) {
          videoId = uuidMatch[1];
          videoIdExtracted = true;
        }
      }
      
      if (!videoIdExtracted) {
        console.error('Não foi possível extrair o video ID da URL:', iframeSrc);
      }
      
      // Se encontramos um ID de vídeo, podemos compor a URL da thumbnail
      if (videoId) {
        // URL corrigida para o domínio correto do Panda Video
        thumbnailUrl = `https://b.pandavideo.com.br/${videoId}/thumb.jpg`;
      }
      
      const result = {
        videoId,
        url: iframeSrc,
        thumbnailUrl
      };
      
      return result;
    } catch (error) {
      console.error('Erro ao extrair informações do iframe do Panda Video:', error);
      return { videoId: '', url: '', thumbnailUrl: '' };
    }
  }
  
  // Verificando se os dados são válidos como objeto
  if (!data || !data.id) {
    console.error('Dados de vídeo inválidos:', data);
    return { videoId: '', url: '', thumbnailUrl: '' };
  }

  return {
    videoId: data.id || '',
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
