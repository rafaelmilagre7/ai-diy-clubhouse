
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop() || '';
};

