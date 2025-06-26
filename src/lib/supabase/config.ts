
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

/**
 * Configuração centralizada dos buckets de storage
 */
export const STORAGE_BUCKETS = {
  // Avatars e imagens de perfil
  PROFILE_IMAGES: 'profile_images',
  AVATARS: 'avatars',
  
  // Ferramentas e logos
  TOOL_LOGOS: 'tool_logos',
  
  // Eventos
  EVENT_IMAGES: 'event_images',
  
  // Learning/Formação
  LEARNING_MATERIALS: 'learning_materials',
  LEARNING_VIDEOS: 'learning_videos',
  COURSE_IMAGES: 'course_images',
  
  // Soluções
  SOLUTION_FILES: 'solution_files',
  
  // Uploads gerais
  UPLOADS: 'uploads',
  PUBLIC: 'public',
  
  // Mídia
  IMAGES: 'images',
  VIDEOS: 'videos',
  DOCUMENTS: 'documents'
} as const;

/**
 * Lista de todos os buckets para facilitar iteração
 */
export const ALL_STORAGE_BUCKETS = Object.values(STORAGE_BUCKETS);

/**
 * Configurações específicas por bucket
 */
export const BUCKET_CONFIG = {
  [STORAGE_BUCKETS.PROFILE_IMAGES]: {
    maxSize: 5, // 5MB
    allowedTypes: ['image/*']
  },
  [STORAGE_BUCKETS.TOOL_LOGOS]: {
    maxSize: 2, // 2MB
    allowedTypes: ['image/*']
  },
  [STORAGE_BUCKETS.LEARNING_VIDEOS]: {
    maxSize: 300, // 300MB
    allowedTypes: ['video/*']
  },
  [STORAGE_BUCKETS.SOLUTION_FILES]: {
    maxSize: 25, // 25MB
    allowedTypes: ['*']
  }
} as const;
