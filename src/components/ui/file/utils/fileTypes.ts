
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop() || '';
};

export const getFileIcon = (fileType: string): JSX.Element => {
  // This function would normally return an icon component based on file type
  // Since it's not implemented, we'll return null for now
  return null as unknown as JSX.Element;
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
