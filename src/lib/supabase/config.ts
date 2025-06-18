
// Configuração centralizada dos buckets do Supabase Storage
export const STORAGE_BUCKETS = {
  // Materiais de apoio para aulas e cursos
  LEARNING_MATERIALS: 'learning_materials',
  
  // Arquivos de soluções (admin)
  SOLUTION_FILES: 'solution_files',
  
  // Vídeos de aulas
  LEARNING_VIDEOS: 'learning_videos',
  
  // Imagens de cursos
  COURSE_IMAGES: 'course_images'
} as const;

// Limites de tamanho por tipo de arquivo (em MB)
export const MAX_UPLOAD_SIZES = {
  IMAGE: 10,
  DOCUMENT: 50,
  VIDEO: 300,
  GENERAL: 100
} as const;

// Tipos de arquivo aceitos por categoria
export const ACCEPTED_FILE_TYPES = {
  IMAGES: 'image/*',
  DOCUMENTS: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
  VIDEOS: 'video/*',
  ALL: '*/*'
} as const;
