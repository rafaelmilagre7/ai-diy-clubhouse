
export const supabaseUrl = 'https://zotzvtepvpnkcoobdubt.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvdHp2dGVwdnBua2Nvb2JkdWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzgzODAsImV4cCI6MjA1OTk1NDM4MH0.dxjPkqTPnK8gjjxJbooPX5_kpu3INciLeDpuU8dszHQ';

// Configurações de storage
export const STORAGE_BUCKETS = {
  LEARNING_MATERIALS: 'learning_materials',
  COURSE_IMAGES: 'course_images',
  LEARNING_VIDEOS: 'learning_videos',
  SOLUTION_FILES: 'solution_files'
} as const;

// Limites de upload
export const MAX_UPLOAD_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  GENERAL: 50 * 1024 * 1024 // 50MB
} as const;

// Tipos de arquivo permitidos
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  GENERAL: ['*']
} as const;
