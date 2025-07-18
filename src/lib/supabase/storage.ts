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
 * Extrai informações de um vídeo do Panda Video com regex robusta
 * 
 * Aceita um código de incorporação HTML (iframe) ou um objeto com os dados do vídeo
 * Suporta múltiplos formatos de URL do Panda Video
 */
export const extractPandaVideoInfo = (data: any): { videoId: string; url: string; thumbnailUrl: string } => {
  const requestId = `panda_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  // Se recebermos uma string (código iframe), extrair informações do código HTML
  if (typeof data === 'string') {
    try {
      console.log(`🐼 [${requestId}] Processando iframe do Panda Video:`, data.substring(0, 100) + '...');
      
      // Extrair src do iframe com regex mais robusta
      const srcPatterns = [
        /src=["'](https:\/\/[^"']+)["']/i,           // Formato padrão
        /src=["']([^"']*pandavideo[^"']+)["']/i,     // Qualquer URL com pandavideo
        /src=["']([^"']*player[^"']+)["']/i          // URLs com 'player'
      ];
      
      let iframeSrc = '';
      for (const pattern of srcPatterns) {
        const match = data.match(pattern);
        if (match && match[1]) {
          iframeSrc = match[1];
          break;
        }
      }
      
      if (!iframeSrc) {
        console.warn(`⚠️ [${requestId}] URL não encontrada no iframe`);
        throw new Error('URL não encontrada no iframe');
      }
      
      console.log(`🔗 [${requestId}] URL extraída:`, iframeSrc);
      
      let videoId = '';
      
      // Padrões de regex para extrair videoId - ROBUSTOS
      const videoIdPatterns = [
        // Formato 1: https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=VIDEO_ID
        /embed\/\?v=([a-zA-Z0-9_-]+)/,
        // Formato 2: https://player.pandavideo.com.br/embed/VIDEO_ID
        /\/embed\/([a-zA-Z0-9_-]+)(?:[\/\?]|$)/,
        // Formato 3: https://player-vz-*.tv.pandavideo.com.br/embed/?v=VIDEO_ID
        /\.tv\.pandavideo\.com\.br\/embed\/\?v=([a-zA-Z0-9_-]+)/,
        // Formato 4: URLs com parâmetro v em qualquer posição
        /[?&]v=([a-zA-Z0-9_-]+)/,
        // Formato 5: IDs diretos no final da URL
        /pandavideo\.com\.br\/.*\/([a-zA-Z0-9_-]{10,})\/?$/
      ];
      
      for (const pattern of videoIdPatterns) {
        const match = iframeSrc.match(pattern);
        if (match && match[1]) {
          videoId = match[1];
          console.log(`✅ [${requestId}] Video ID extraído:`, videoId);
          break;
        }
      }
      
      if (!videoId) {
        console.warn(`⚠️ [${requestId}] ID do vídeo não encontrado na URL:`, iframeSrc);
      }
      
      // Gerar thumbnail URL (múltiplos formatos possíveis)
      let thumbnailUrl = '';
      if (videoId) {
        // Tentar diferentes formatos de thumbnail
        const thumbnailFormats = [
          `https://thumbs.pandavideo.com.br/${videoId}.jpg`,
          `https://thumbs.pandavideo.com.br/${videoId}/thumb.jpg`,
          `https://storage.pandavideo.com.br/thumbs/${videoId}.jpg`
        ];
        thumbnailUrl = thumbnailFormats[0]; // Usar o primeiro como padrão
        console.log(`🖼️ [${requestId}] Thumbnail URL gerada:`, thumbnailUrl);
      }
      
      const result = {
        videoId,
        url: iframeSrc,
        thumbnailUrl
      };
      
      console.log(`🎉 [${requestId}] Extração concluída:`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ [${requestId}] Erro ao extrair informações do iframe:`, error);
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
