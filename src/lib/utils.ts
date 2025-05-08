
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte um tamanho em bytes para uma string formatada (KB, MB, GB)
 * @param bytes - O tamanho em bytes para converter
 * @returns String formatada com o tamanho
 */
export function bytesToSize(bytes: number | undefined): string {
  if (bytes === undefined || bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Gera um ID aleatório
 * @returns String com ID aleatório
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Formata data para exibição
 * @param date - Data para formatar
 * @returns String com data formatada
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

/**
 * Converte um texto para formato de slug (URL amigável)
 * @param text - Texto para converter
 * @param addTimestamp - Se deve adicionar timestamp ao final para garantir unicidade
 * @returns String formatada como slug
 */
export function slugify(text: string, addTimestamp = true): string {
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
}

/**
 * Trunca um slug se ele ficar muito longo
 * @param slug - Slug para truncar
 * @param maxLength - Tamanho máximo do slug
 * @returns Slug truncado
 */
export function truncateSlug(slug: string, maxLength = 60): string {
  if (slug.length <= maxLength) return slug;
  
  // Corta o slug mantendo o timestamp no final
  const parts = slug.split('-');
  const timestamp = parts[parts.length - 1];
  
  // Remove o timestamp para truncar apenas a parte significativa
  const mainSlug = slug.substring(0, slug.length - timestamp.length - 1);
  
  // Trunca a parte principal e adiciona o timestamp de volta
  const truncated = mainSlug.substring(0, maxLength - timestamp.length - 1);
  return `${truncated}-${timestamp}`;
}
