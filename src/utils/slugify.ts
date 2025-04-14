
export const slugify = (text: string, addTimestamp = true): string => {
  const slug = text
    .toString()
    .normalize('NFD')           // normaliza os caracteres decompostos
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // substitui espaços por -
    .replace(/[^\w\-]+/g, '')   // remove caracteres não-palavra
    .replace(/\-\-+/g, '-')     // substitui múltiplos hifens por um único
    .replace(/^-+/, '')         // remove hifens do início
    .replace(/-+$/, '');        // remove hifens do final
  
  // Adiciona um timestamp ao slug para garantir unicidade
  if (addTimestamp) {
    const timestamp = new Date().getTime();
    return `${slug}-${timestamp}`;
  }
  
  return slug;
};

// Função para truncar um slug se ele ficar muito longo
export const truncateSlug = (slug: string, maxLength = 60): string => {
  if (slug.length <= maxLength) return slug;
  
  // Corta o slug mantendo o timestamp no final
  const parts = slug.split('-');
  const timestamp = parts[parts.length - 1];
  
  // Remove o timestamp para truncar apenas a parte significativa
  const mainSlug = slug.substring(0, slug.length - timestamp.length - 1);
  
  // Trunca a parte principal e adiciona o timestamp de volta
  const truncated = mainSlug.substring(0, maxLength - timestamp.length - 1);
  return `${truncated}-${timestamp}`;
};
