
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
