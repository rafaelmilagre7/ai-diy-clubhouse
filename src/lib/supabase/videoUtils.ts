
/**
 * Extrai o ID de um vídeo do YouTube a partir de uma URL
 */
export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Regex para extrair ID do YouTube de vários formatos de URL
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  
  return match ? match[1] : null;
}

/**
 * Obtém a URL da thumbnail de um vídeo do YouTube
 */
export function getYoutubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Converte segundos em formato legível (HH:MM:SS)
 */
export function formatVideoDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Estima a duração de um arquivo de vídeo com base no tamanho do arquivo
 * Este é apenas um cálculo aproximado
 */
export function estimateVideoDuration(fileSizeBytes: number): number {
  // Aproximação: 1MB ≈ 8 segundos de vídeo em qualidade média
  const megabytes = fileSizeBytes / (1024 * 1024);
  return Math.round(megabytes * 8);
}

/**
 * Converte uma URL do YouTube para o formato de incorporação
 */
export function youtubeUrlToEmbed(url: string): string {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return '';
  
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Determina o tipo de vídeo com base na URL
 */
export function getVideoTypeFromUrl(url: string): 'youtube' | 'vimeo' | 'pandavideo' | 'other' {
  if (!url) return 'other';
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  } else if (url.includes('vimeo.com')) {
    return 'vimeo';
  } else if (url.includes('pandavideo.com') || url.includes('player-vz')) {
    return 'pandavideo';
  }
  
  return 'other';
}

/**
 * Extrai o ID de um vídeo do Panda Video a partir de uma URL
 */
export function getPandaVideoId(url: string): string | null {
  if (!url) return null;
  
  // Exemplo: https://player-vz-d6ebf577-797.tv.pandavideo.com.br/embed/?v=1191d81c-13eb-46b6-bba5-f302e364d0e2
  const regex = /[?&]v=([a-zA-Z0-9-]+)/;
  const match = url.match(regex);
  
  return match ? match[1] : null;
}
