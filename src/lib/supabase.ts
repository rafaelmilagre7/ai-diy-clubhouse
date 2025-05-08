
// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './supabase/index';

// Importar e re-exportar o cliente Supabase
import { supabase } from './supabase/client';
export { supabase };
export default supabase;
