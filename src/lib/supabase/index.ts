
// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './client';
export * from './types';
export * from './videoUtils';
export * from './storage';

// Importar e depois re-exportar o cliente Supabase
import { supabase } from './client';
export { supabase };
export default supabase;
