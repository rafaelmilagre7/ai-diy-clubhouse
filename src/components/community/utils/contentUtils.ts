
export const getContentPreview = (content: string, maxLength: number = 150) => {
  if (!content) return "";
  
  // Remove HTML tags se houver
  const plainText = content.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.slice(0, maxLength).trim() + "...";
};

export const sanitizeContent = (content: string) => {
  // Básica sanitização - remover scripts e tags perigosas
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
};

export const formatContent = (content: string) => {
  // Converter quebras de linha para <br>
  return content.replace(/\n/g, '<br>');
};
