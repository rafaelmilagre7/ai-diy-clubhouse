
export const slugify = (text: string, addTimestamp: boolean = false): string => {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  if (addTimestamp) {
    return `${slug}-${Date.now()}`;
  }
  
  return slug;
};

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
