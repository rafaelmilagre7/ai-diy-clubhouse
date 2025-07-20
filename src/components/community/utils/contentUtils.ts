
/**
 * Processa conteúdo de tópicos para exibição em prévias
 */

/**
 * Cria uma prévia limpa do conteúdo removendo markdown, HTML e URLs feias
 */
export const getContentPreview = (content: string, maxLength: number = 120): string => {
  if (!content) return '';
  
  let processedContent = content;
  
  // Remove sintaxe markdown de imagens ![alt](url)
  processedContent = processedContent.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');
  
  // Remove URLs longos de storage/CDN que começam com https://
  processedContent = processedContent.replace(/https:\/\/[^\s]+\.(webp|jpg|jpeg|png|gif)/gi, '');
  
  // Remove outros URLs longos desnecessários
  processedContent = processedContent.replace(/https:\/\/[a-zA-Z0-9\-\.]+\.supabase\.co\/[^\s]+/g, '');
  
  // Remove qualquer HTML/markdown restante
  processedContent = processedContent.replace(/<[^>]*>/g, '');
  processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '$1'); // Bold
  processedContent = processedContent.replace(/\*([^*]+)\*/g, '$1'); // Italic
  processedContent = processedContent.replace(/`([^`]+)`/g, '$1'); // Code
  
  // Remove espaços extras e quebras de linha
  processedContent = processedContent.replace(/\s+/g, ' ').trim();
  
  // Remove pontuações duplas que podem ter ficado após remoção de URLs
  processedContent = processedContent.replace(/\.\s*\./g, '.');
  processedContent = processedContent.replace(/\s+\./g, '.');
  
  // Trunca o texto se necessário
  if (processedContent.length > maxLength) {
    processedContent = processedContent.substring(0, maxLength);
    // Procura o último espaço para não cortar palavras
    const lastSpace = processedContent.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      processedContent = processedContent.substring(0, lastSpace);
    }
    processedContent += '...';
  }
  
  return processedContent;
};

/**
 * Verifica se o conteúdo contém imagens
 */
export const hasImages = (content: string): boolean => {
  return /!\[([^\]]*)\]\([^)]+\)/.test(content);
};

/**
 * Extrai URLs de imagens do conteúdo markdown
 */
export const extractImageUrls = (content: string): string[] => {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const urls: string[] = [];
  let match;
  
  while ((match = imageRegex.exec(content)) !== null) {
    urls.push(match[2]);
  }
  
  return urls;
};
