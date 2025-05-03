
import { supabase } from './client';
import { STORAGE_BUCKETS } from './config';

/**
 * Configura os buckets de armazenamento necessários para o módulo de aprendizado
 */
export async function setupLearningStorageBuckets() {
  try {
    const bucketsToCreate = [
      STORAGE_BUCKETS.VIDEOS,
      STORAGE_BUCKETS.SOLUTION_FILES,
      STORAGE_BUCKETS.PROFILE_AVATARS
    ];
    
    const results = await Promise.all(
      bucketsToCreate.map(bucketName => ensureBucketExists(bucketName))
    );
    
    // Identificar quais buckets foram configurados com sucesso
    const readyBuckets = bucketsToCreate.filter((_, index) => results[index]);
    
    return {
      success: results.every(result => result),
      readyBuckets, // Adicionando essa propriedade para melhor feedback
      message: 'Buckets de armazenamento configurados com sucesso'
    };
  } catch (error) {
    console.error('Erro ao configurar buckets de armazenamento:', error);
    return {
      success: false,
      readyBuckets: [], // Adicionando array vazio em caso de erro
      error,
      message: 'Falha ao configurar buckets de armazenamento'
    };
  }
}

/**
 * Garante que um bucket existe, criando-o se necessário
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!exists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 314572800 // 300MB
      });
      
      if (error) {
        console.error(`Erro ao criar bucket ${bucketName}:`, error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Erro ao verificar/criar bucket ${bucketName}:`, error);
    return false;
  }
}

/**
 * Extrai o ID de um vídeo do YouTube a partir da URL
 */
export function getYoutubeVideoId(url?: string): string | null {
  if (!url) return null;
  
  // Padrões comuns de URLs do YouTube
  const patterns = [
    // youtu.be/ID
    /youtu\.be\/([^?&#]+)/,
    // youtube.com/watch?v=ID
    /youtube\.com\/watch\?v=([^?&#]+)/,
    // youtube.com/embed/ID
    /youtube\.com\/embed\/([^?&#]+)/,
    // youtube.com/v/ID
    /youtube\.com\/v\/([^?&#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Obtém a URL da miniatura de um vídeo do YouTube
 */
export function getYoutubeThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

/**
 * Formata a duração do vídeo em formato legível (mm:ss ou hh:mm:ss)
 */
export function formatVideoDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  }
  
  return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

/**
 * Função auxiliar para adicionar zero à esquerda para valores menores que 10
 */
function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}
