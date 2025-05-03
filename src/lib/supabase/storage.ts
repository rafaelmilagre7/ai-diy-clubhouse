
import { supabase } from './client';
import { createStoragePublicPolicy } from './rpc';

/**
 * Verifica e configura os buckets de armazenamento necessários para o LMS
 * @returns Promise com status de sucesso e mensagem
 */
export async function setupLearningStorageBuckets(): Promise<{ 
  success: boolean; 
  message: string;
  readyBuckets: string[];
}> {
  try {
    console.log("Configurando buckets de armazenamento para LMS...");
    const buckets = ['learning_videos', 'solution_files'];
    const readyBuckets: string[] = [];
    
    // Verificar cada bucket necessário
    for (const bucketName of buckets) {
      console.log(`Verificando bucket ${bucketName}...`);
      const { success, error } = await createStoragePublicPolicy(bucketName);
      
      if (success) {
        console.log(`✓ Bucket ${bucketName} está pronto`);
        readyBuckets.push(bucketName);
      } else {
        console.error(`✗ Erro no bucket ${bucketName}: ${error}`);
      }
    }
    
    if (readyBuckets.length === buckets.length) {
      return { 
        success: true, 
        message: 'Todos os buckets de armazenamento configurados com sucesso', 
        readyBuckets 
      };
    } else {
      return { 
        success: false, 
        message: `Alguns buckets não puderam ser configurados. Configurados: ${readyBuckets.join(', ')}`, 
        readyBuckets 
      };
    }
  } catch (error) {
    console.error("Erro ao configurar buckets de armazenamento:", error);
    return { 
      success: false, 
      message: `Erro ao configurar buckets: ${error instanceof Error ? error.message : String(error)}`, 
      readyBuckets: [] 
    };
  }
}

/**
 * Formata URL de vídeo do YouTube para obter o ID
 * @param url URL do vídeo do YouTube
 * @returns ID do vídeo ou null
 */
export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch (error) {
    console.error("Erro ao extrair ID do YouTube:", error);
    return null;
  }
}

/**
 * Gera URL de thumbnail para vídeo do YouTube
 * @param youtubeId ID do vídeo do YouTube
 * @returns URL da thumbnail
 */
export function getYoutubeThumbnailUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

/**
 * Converte segundos para formato legível (MM:SS)
 * @param seconds Duração em segundos
 * @returns String formatada
 */
export function formatVideoDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}
