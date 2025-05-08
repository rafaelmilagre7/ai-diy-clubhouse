
/**
 * Utilitários para manipulação de vídeos
 */

/**
 * Extrair ID de vídeo do YouTube a partir da URL
 * @param url URL do YouTube
 * @returns ID do vídeo ou null se não encontrado
 */
export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Padrões de URL do YouTube
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/[^\/]+\/\?v=([^&]+)/i
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
 * Converter URL normal do YouTube para formato de embed
 * @param url URL do YouTube
 * @returns URL formatada para embed
 */
export function youtubeUrlToEmbed(url: string): string {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return url;
  
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Obter thumbnail do YouTube a partir da URL
 * @param url URL do YouTube
 * @returns URL da thumbnail
 */
export function getYoutubeThumbnailUrl(url: string): string {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return '';
  
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Detectar o tipo de vídeo a partir da URL
 * @param url URL do vídeo
 * @returns Tipo de vídeo (youtube, pandavideo, vimeo, other)
 */
export function getVideoTypeFromUrl(url: string): "youtube" | "pandavideo" | "vimeo" | "other" {
  if (!url) return "other";
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return "youtube";
  }
  
  if (url.includes('pandavideo') || url.includes('pandacdn')) {
    return "pandavideo";
  }
  
  if (url.includes('vimeo.com')) {
    return "vimeo";
  }
  
  return "other";
}

/**
 * Extrair ID de vídeo do Panda Video a partir da URL
 * @param url URL do Panda Video
 * @returns ID do vídeo ou null
 */
export function getPandaVideoId(url: string): string | null {
  if (!url) return null;
  
  // Padrão para URLs do Panda Video
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?pandavideo\.com\/embed\/([a-zA-Z0-9]+)/i,
    /(?:https?:\/\/)?(?:www\.)?pandacdn\.com\/videos\/([a-zA-Z0-9]+)/i
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
 * Formatar duração de vídeo em segundos para formato legível
 * @param seconds Duração em segundos
 * @returns Duração formatada (HH:MM:SS ou MM:SS)
 */
export function formatVideoDuration(seconds: number): string {
  if (!seconds) return "00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const format = (num: number) => num.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${format(hours)}:${format(minutes)}:${format(secs)}`;
  }
  
  return `${format(minutes)}:${format(secs)}`;
}
