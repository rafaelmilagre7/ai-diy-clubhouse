
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

/**
 * Detecta o tipo do arquivo baseado na extensão
 */
export const detectFileType = (ext?: string): "document" | "pdf" | "image" | "spreadsheet" | "presentation" | "video" | "template" | "other" => {
  if (!ext) return "document";
  
  const extension = ext.split('.').pop()?.toLowerCase() || '';
  
  const imageExts = ["png", "jpg", "jpeg", "gif", "webp", "svg"];
  const docExts = ["doc", "docx", "odt", "rtf", "txt", "md"];
  const spreadsheetExts = ["xls", "xlsx", "ods", "csv"];
  const presentationExts = ["ppt", "pptx", "odp"];
  const pdfExts = ["pdf"];
  const videoExts = ["mp4", "webm", "mov", "avi"];
  
  if (imageExts.includes(extension)) return "image";
  if (docExts.includes(extension)) return "document";
  if (spreadsheetExts.includes(extension)) return "spreadsheet";
  if (presentationExts.includes(extension)) return "presentation";
  if (pdfExts.includes(extension)) return "pdf";
  if (videoExts.includes(extension)) return "video";
  
  return "other";
};

/**
 * Obtém o nome formatado do tipo de arquivo
 */
export const getFileFormatName = (format: string): string => {
  switch (format.toLowerCase()) {
    case "pdf": return "PDF";
    case "doc":
    case "docx": return "Documento Word";
    case "xls":
    case "xlsx": return "Planilha Excel";
    case "ppt":
    case "pptx": return "Apresentação PowerPoint";
    case "txt": return "Arquivo de texto";
    case "csv": return "Arquivo CSV";
    default: return format.toUpperCase();
  }
};
