
/**
 * Extrai o ID do YouTube a partir de uma URL
 * @param url URL do YouTube
 * @returns ID do vídeo ou string vazia
 */
export function getYoutubeVideoId(url: string): string {
  if (!url) return '';
  
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  } catch (error) {
    console.error("Erro ao extrair ID do YouTube:", error);
    return '';
  }
}

/**
 * Gera a URL da thumbnail de um vídeo do YouTube
 * @param url URL do YouTube ou ID do vídeo
 * @returns URL da thumbnail
 */
export function getYoutubeThumbnailUrl(url: string): string {
  // Se a URL já for um ID de 11 caracteres, usar diretamente
  const videoId = url.length === 11 ? url : getYoutubeVideoId(url);
  if (!videoId) return '';
  
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Formata a duração de um vídeo em segundos para formato HH:MM:SS ou MM:SS
 * @param seconds Duração em segundos
 * @returns String formatada com a duração
 */
export function formatVideoDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  // Formatar com zeros à esquerda
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
  if (hours > 0) {
    const formattedHours = String(hours).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
  
  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Estima a duração de um vídeo baseado em seu tamanho
 * Isso é uma estimativa aproximada baseada em uma taxa de bits média
 * @param fileSize Tamanho do arquivo em bytes
 * @returns Duração estimada em segundos
 */
export function estimateVideoDuration(fileSize: number): number {
  if (!fileSize) return 0;
  
  // Assumir taxa de bits média de 2 Mbps para vídeos (250 KB/s)
  const bitRate = 250 * 1024; // bytes por segundo
  
  // Calcular duração estimada
  const durationSeconds = Math.floor(fileSize / bitRate);
  
  return durationSeconds;
}

/**
 * Extrai o ID do vídeo a partir de uma URL do Panda Video
 * @param url URL do Panda Video (embed ou player)
 * @returns ID do vídeo ou string vazia
 */
export function getPandaVideoId(url: string): string {
  if (!url) return '';
  
  try {
    // Padrão para URLs do tipo embed
    if (url.includes('player.pandavideo.com.br/embed/')) {
      const match = url.match(/player\.pandavideo\.com\.br\/embed\/([^/?#]+)/);
      return match ? match[1] : '';
    }
    
    // Padrão para URLs do tipo player
    if (url.includes('pandavideo.com.br/')) {
      const match = url.match(/pandavideo\.com\.br\/(?:player|v)\/([^/?#]+)/);
      return match ? match[1] : '';
    }
    
    return '';
  } catch (error) {
    console.error("Erro ao extrair ID do Panda Video:", error);
    return '';
  }
}

/**
 * Verifica se uma URL de vídeo é do Panda Video
 * @param url URL para verificar
 * @returns true se for do Panda, false caso contrário
 */
export function isPandaVideoUrl(url: string): boolean {
  return url.includes('pandavideo.com.br');
}

/**
 * Verifica se uma URL de vídeo é do YouTube
 * @param url URL para verificar
 * @returns true se for do YouTube, false caso contrário
 */
export function isYoutubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

/**
 * Converte uma URL do YouTube para formato de embed
 * @param url URL do YouTube
 * @returns URL de embed do YouTube
 */
export function youtubeUrlToEmbed(url: string): string {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return '';
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Determina o tipo de vídeo com base em sua URL
 * @param url URL do vídeo
 * @returns "youtube", "panda", ou "unknown"
 */
export function getVideoTypeFromUrl(url: string): "youtube" | "panda" | "unknown" {
  if (isYoutubeUrl(url)) return "youtube";
  if (isPandaVideoUrl(url)) return "panda";
  return "unknown";
}
