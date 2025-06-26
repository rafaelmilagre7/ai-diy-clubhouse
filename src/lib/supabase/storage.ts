
import { supabase } from './client';
import { logger } from '@/utils/logger';

/**
 * Funções para gerenciamento de storage do Supabase - versão corrigida
 */

// Função para extrair ID de vídeo do YouTube
export const getYoutubeVideoId = (url: string): string | null => {
  try {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

// Função para gerar URL de thumbnail do YouTube
export const getYoutubeThumbnailUrl = (videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
};

// Função para formatar duração de vídeo
export const formatVideoDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Função para configurar buckets de aprendizado
export const setupLearningStorageBuckets = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.rpc('setup_learning_storage_buckets');
    
    if (error) {
      logger.error('Erro ao configurar buckets de aprendizado:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Buckets configurados com sucesso' };
  } catch (error: any) {
    logger.error('Erro ao configurar buckets:', error);
    return { success: false, message: error.message };
  }
};

// Função para garantir que bucket existe
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      logger.error('Erro ao listar buckets:', listError);
      return false;
    }
    
    const exists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!exists) {
      // Tentar criar via função RPC
      const { data, error } = await supabase.rpc('create_storage_public_policy', {
        bucket_name: bucketName
      });
      
      if (error) {
        logger.error(`Erro ao criar bucket ${bucketName}:`, error);
        return false;
      }
      
      logger.info(`Bucket ${bucketName} criado com sucesso`);
    }
    
    return true;
  } catch (error) {
    logger.error("Erro ao verificar/criar bucket:", error);
    return false;
  }
};

// Alias para compatibilidade com código existente
export const ensureStorageBucketExists = ensureBucketExists;

// Função para extrair informações de vídeo do Panda Video
export const extractPandaVideoInfo = (url: string): { videoId: string; embedUrl: string } | null => {
  try {
    // Regex para URLs do Panda Video
    const pandaRegex = /(?:player-)?([a-f0-9-]{36})/;
    const match = url.match(pandaRegex);
    
    if (match && match[1]) {
      const videoId = match[1];
      const embedUrl = `https://player.pandavideo.com.br/embed/?v=${videoId}`;
      return { videoId, embedUrl };
    }
    
    return null;
  } catch {
    return null;
  }
};

// Função para upload de arquivo com fallback
export const uploadFileWithFallback = async (
  file: File, 
  bucketName: string, 
  path: string
): Promise<{ data: any; error: any }> => {
  try {
    // Garantir que bucket existe
    await ensureBucketExists(bucketName);
    
    // Fazer upload
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file);
    
    if (error) {
      logger.error(`Erro no upload para ${bucketName}:`, error);
    } else {
      logger.info(`Arquivo carregado com sucesso: ${path}`);
    }
    
    return { data, error };
  } catch (error) {
    logger.error('Erro no upload com fallback:', error);
    return { data: null, error };
  }
};
