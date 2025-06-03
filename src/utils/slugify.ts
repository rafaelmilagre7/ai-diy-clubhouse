
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
