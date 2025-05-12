
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 */
export function formatDate(date: Date | string) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Converte bytes para uma representação legível
 * @param bytes - Número de bytes
 * @returns String formatada (ex: "1.5 MB")
 */
export function bytesToSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

// Adicionando alias para manter compatibilidade com os componentes existentes
export const formatFileSize = bytesToSize;

/**
 * Converte texto para formato slug (URL amigável)
 * @param text - Texto a ser convertido
 * @param addTimestamp - Adicionar timestamp ao slug para garantir unicidade
 * @returns Slug formatado
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
 * Formata uma data como uma string relativa (hoje, ontem, há X dias, etc.)
 * @param dateString Data em formato string para formatar
 * @returns String formatada com a data relativa
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  // Verificar se é hoje
  if (date.toDateString() === now.toDateString()) {
    return "Hoje";
  }
  
  // Verifica se é ontem
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Ontem";
  }
  
  // Calcular diferença em dias
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Formatar baseado na diferença
  if (diffDays < 7) {
    return `${diffDays} dias atrás`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`;
  } else {
    // Formatar como data local para datas mais antigas
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }
}

