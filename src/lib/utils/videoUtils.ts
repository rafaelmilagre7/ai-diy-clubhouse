
/**
 * Extrai o ID do vídeo de uma URL do YouTube
 * @param url URL do YouTube
 * @returns ID do vídeo ou null se não for encontrado
 */
export const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Padrões de URL do YouTube
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^&]+)/i,
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com)\/(?:embed)\/([^?]+)/i,
    /(?:https?:\/\/)?(?:youtu\.be)\/([^?]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Formata o tamanho do arquivo para exibição amigável
 * @param bytes Tamanho em bytes
 * @returns String formatada (ex: "1.5 MB")
 */
export const formatFileSize = (bytes: number | undefined | null): string => {
  if (!bytes) return "0 B";
  
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
};
