
/**
 * Formata a duração em segundos para o formato MM:SS ou HH:MM:SS
 * 
 * @param totalSeconds Duração em segundos
 * @returns String formatada como MM:SS ou HH:MM:SS
 */
export function formatVideoDuration(totalSeconds: number): string {
  // Se não for fornecido, ou for inválido, retorna 00:00
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) {
    return '00:00';
  }
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  // Adiciona zeros à esquerda quando necessário
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  
  // Retorna HH:MM:SS apenas se houver horas
  if (hours > 0) {
    const formattedHours = String(hours).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
  
  // Caso contrário, retorna MM:SS
  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Estima a duração do vídeo com base no tamanho do arquivo
 * 
 * @param fileSizeBytes Tamanho do arquivo em bytes
 * @returns Duração aproximada em segundos
 */
export function estimateVideoDuration(fileSizeBytes: number): number {
  // Estimativa simples: 1MB ~ 10 segundos de vídeo em qualidade média
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  return Math.round(fileSizeMB * 10);
}

/**
 * Extrai o ID do vídeo de uma URL do YouTube
 * 
 * @param url URL do vídeo do YouTube
 * @returns ID do vídeo ou null se não for encontrado
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Padrões de URL do YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/user\/.+\/|youtube\.com\/user\/.+\#\w\/\w\/\w\/\w\/|youtube\.com\/shorts\/)([^#\&\?\n]*)/,
    /youtube\.com\/embed\/([^#\&\?\n]*)/,
    /youtube\.com\/v\/([^#\&\?\n]*)/,
    /youtu\.be\/([^#\&\?\n]*)/
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
 * Obtém a URL da thumbnail do vídeo do YouTube
 * 
 * @param url URL do vídeo do YouTube
 * @returns URL da thumbnail ou null se não for possível extrair
 */
export function getYoutubeThumbnailUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Aliases para manter compatibilidade com código existente
 */
export const getYoutubeVideoId = extractYouTubeVideoId;

/**
 * Extrai o ID do vídeo de uma URL do Panda Video
 * 
 * @param url URL do vídeo do Panda Video
 * @returns ID do vídeo ou null se não for encontrado
 */
export function extractPandaVideoId(url: string): string | null {
  if (!url) return null;
  
  // Padrão para URL do Panda Video
  const pattern = /player\.pandavideo\.com\.br\/embed\/([^#\&\?\n]*)/;
  const match = url.match(pattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return null;
}
