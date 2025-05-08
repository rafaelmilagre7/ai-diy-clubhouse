
// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './client';
export * from './types';
export * from './videoUtils';
export * from './storage';

// Garantir que o cliente Supabase seja exportado como padrão
export { supabase } from './client';
export default supabase;
