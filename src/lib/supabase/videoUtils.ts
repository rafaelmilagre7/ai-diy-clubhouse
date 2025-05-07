
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
 * @param url URL do YouTube
 * @returns URL da thumbnail
 */
export function getYoutubeThumbnailUrl(url: string): string {
  const videoId = getYoutubeVideoId(url);
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
