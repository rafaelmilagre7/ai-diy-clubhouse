
/**
 * Formata o tamanho do arquivo para exibição
 * @param bytes Tamanho do arquivo em bytes
 * @returns String formatada (bytes, KB, MB)
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "Desconhecido";
  if (bytes < 1024) return bytes + " bytes";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};
