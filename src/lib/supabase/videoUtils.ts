
/**
 * Utilitários para manipulação de vídeos
 */

/**
 * Extrai o ID de um vídeo do YouTube a partir de uma URL
 * @param url URL do vídeo do YouTube
 * @returns ID do vídeo ou null se não encontrado
 */
export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  
  try {
    // Regex para extrair IDs do YouTube de vários formatos de URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  } catch (error) {
    console.error("Erro ao extrair ID do YouTube:", error);
    return null;
  }
}

/**
 * Obtém a URL da miniatura de um vídeo do YouTube
 * @param videoId ID do vídeo do YouTube
 * @returns URL da miniatura
 */
export function getYoutubeThumbnailUrl(videoId: string): string {
  if (!videoId) return '';
  
  // Retornar miniatura de alta qualidade
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Formata a duração de um vídeo em segundos para o formato hh:mm:ss ou mm:ss
 * @param durationSeconds Duração em segundos
 * @returns String formatada de duração
 */
export function formatVideoDuration(durationSeconds: number): string {
  if (!durationSeconds || isNaN(durationSeconds)) return '00:00';
  
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = Math.floor(durationSeconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Estima a duração de um vídeo com base no tamanho do arquivo
 * @param fileSizeBytes Tamanho do arquivo em bytes
 * @returns Duração estimada em segundos
 */
export function estimateVideoDuration(fileSizeBytes: number): number {
  if (!fileSizeBytes) return 0;
  
  // Estimativa grosseira: assume ~1MB por minuto para vídeo de qualidade média
  const estimatedMinutes = fileSizeBytes / (1024 * 1024);
  return Math.ceil(estimatedMinutes * 60);
}
