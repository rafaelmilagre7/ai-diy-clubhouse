
export const detectFileType = (fileName: string): "document" | "image" | "template" | "pdf" | "spreadsheet" | "presentation" | "video" | "other" => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
    return 'image';
  } else if (['pdf'].includes(extension)) {
    return 'pdf';
  } else if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) {
    return 'document';
  } else if (['xls', 'xlsx', 'csv', 'ods'].includes(extension)) {
    return 'spreadsheet';
  } else if (['ppt', 'pptx', 'odp'].includes(extension)) {
    return 'presentation';
  } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
    return 'video';
  } else if (['json', 'html', 'js', 'css', 'xml'].includes(extension)) {
    return 'template';
  } else {
    return 'other';
  }
};

export const getFileFormatName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['pdf'].includes(extension)) return "PDF";
  if (['doc', 'docx'].includes(extension)) return "Word";
  if (['xls', 'xlsx'].includes(extension)) return "Excel";
  if (['ppt', 'pptx'].includes(extension)) return "PowerPoint";
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return "Imagem";
  if (['mp4', 'webm', 'mov'].includes(extension)) return "Vídeo";
  if (['html'].includes(extension)) return "HTML";
  if (['json'].includes(extension)) return "JSON";
  
  return extension.toUpperCase();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
