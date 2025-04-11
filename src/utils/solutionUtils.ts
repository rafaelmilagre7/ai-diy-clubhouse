
/**
 * Utility functions for solution management
 */

/**
 * Converts a text string into a URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
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
};
