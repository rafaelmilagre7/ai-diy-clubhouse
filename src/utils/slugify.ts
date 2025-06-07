
/**
 * Utility functions for creating SEO-friendly URLs and slugs
 */

/**
 * Converts a string to a URL-friendly slug
 */
export const slugify = (text: string, addTimestamp: boolean = false): string => {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and special chars with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // Add timestamp for uniqueness if requested
  if (addTimestamp) {
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits
    slug = `${slug}-${timestamp}`;
  }
  
  return slug;
};

/**
 * Truncates a slug to a maximum length while preserving word boundaries
 */
export const truncateSlug = (slug: string, maxLength: number = 60): string => {
  if (slug.length <= maxLength) return slug;
  
  // Find the last hyphen before the max length
  const truncated = slug.substring(0, maxLength);
  const lastHyphen = truncated.lastIndexOf('-');
  
  return lastHyphen > 0 ? truncated.substring(0, lastHyphen) : truncated;
};

/**
 * Validates if a slug is SEO-friendly
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 60;
};

/**
 * Generates breadcrumb data for SEO
 */
export const generateBreadcrumbs = (pathname: string): Array<{name: string, url: string}> => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Início', url: '/' }];
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Map segments to readable names
    const segmentNames: Record<string, string> = {
      'dashboard': 'Dashboard',
      'tools': 'Ferramentas',
      'learning': 'Aprendizado',
      'solutions': 'Soluções',
      'comunidade': 'Comunidade',
      'profile': 'Perfil'
    };
    
    const name = segmentNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ name, url: currentPath });
  });
  
  return breadcrumbs;
};
