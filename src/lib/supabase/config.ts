
/**
 * Configurações centralizadas do Supabase
 */

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  isConfigured(): boolean {
    return !!(this.url && this.anonKey);
  },
  
  getStorageUrl(bucket: string, path: string): string {
    return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
  }
};
