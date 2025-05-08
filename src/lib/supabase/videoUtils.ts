
/**
 * Extrai o ID de um vídeo do YouTube a partir da URL
 * @param url URL do vídeo no YouTube (diversos formatos suportados)
 * @returns ID do vídeo ou null se não for possível extrair
 */
export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Tentar com padrão youtu.be/ID
  const shortUrlPattern = /youtu\.be\/([^?&#]+)/;
  const shortMatch = url.match(shortUrlPattern);
  if (shortMatch && shortMatch[1]) {
    return shortMatch[1];
  }
  
  // Tentar com padrão youtube.com/watch?v=ID
  const watchPattern = /youtube\.com\/watch\?v=([^&#]+)/;
  const watchMatch = url.match(watchPattern);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }
  
  // Tentar com padrão youtube.com/embed/ID
  const embedPattern = /youtube\.com\/embed\/([^?&#]+)/;
  const embedMatch = url.match(embedPattern);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }
  
  return null;
}

/**
 * Converte uma URL do YouTube para o formato de incorporação (embed)
 * @param url URL do YouTube em qualquer formato suportado
 * @returns URL no formato de incorporação ou a URL original se não for possível converter
 */
export function youtubeUrlToEmbed(url: string): string {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return url;
  
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Formata a duração de um vídeo em segundos para o formato MM:SS ou HH:MM:SS
 * @param seconds Duração do vídeo em segundos
 * @returns String formatada com a duração
 */
export function formatVideoDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }
  
  return `${pad(minutes)}:${pad(remainingSeconds)}`;
}

/**
 * Determina o tipo de vídeo com base na URL
 * @param url URL do vídeo
 * @returns Tipo de vídeo ('youtube', 'panda' ou 'other')
 */
export function getVideoTypeFromUrl(url: string): 'youtube' | 'panda' | 'other' {
  if (!url) return 'other';
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  
  if (url.includes('pandavideo.com.br') || url.includes('pandavideo.com')) {
    return 'panda';
  }
  
  return 'other';
}

/**
 * Extrai o ID de um vídeo do Panda Video a partir da URL
 * @param url URL do vídeo no Panda Video
 * @returns ID do vídeo ou null se não for possível extrair
 */
export function getPandaVideoId(url: string): string | null {
  if (!url) return null;
  
  // Padrão para URLs do Panda Video
  // https://player.pandavideo.com.br/embed/?v=ID
  const pattern = /pandavideo\.com\.br\/embed\/?\?v=([^&]+)/;
  const match = url.match(pattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // Verificar se a URL já é o ID em si
  if (url.match(/^[a-zA-Z0-9_-]{10,}$/)) {
    return url;
  }
  
  return null;
}
