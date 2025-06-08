
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-exportar formatters para manter compatibilidade
export { 
  formatDate, 
  formatDateTime, 
  formatDistanceDate as formatDateDistance,
  formatCurrency,
  formatNumber,
  formatPercentage,
  truncateText,
  capitalize,
  slugify 
} from './formatters';

/**
 * Função para delay/sleep
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Função para gerar ID único simples
 */
export const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Função para verificar se string é vazia
 */
export const isEmpty = (str: string | null | undefined): boolean => {
  return !str || str.trim().length === 0;
};

/**
 * Função para extrair iniciais de um nome
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Função para converter bytes em formato legível
 */
export const bytesToSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
