
// Definição dos buckets de armazenamento
export const STORAGE_BUCKETS = {
  // Buckets para o LMS - usando nomes normalizados
  LEARNING_MATERIALS: 'learning_materials',
  COURSE_IMAGES: 'course_images', 
  LEARNING_VIDEOS: 'learning_videos',
  SOLUTION_FILES: 'solution_files',
  LESSON_IMAGES: 'lesson_images',
  
  // Buckets para eventos
  EVENT_IMAGES: 'event_images',
  
  // Bucket de fallback para emergências
  FALLBACK: 'general_storage'
};

// Limites de tamanho de upload (em MB)
export const MAX_UPLOAD_SIZES = {
  IMAGE: 5,       // 5MB para imagens
  DOCUMENT: 25,   // 25MB para documentos  
  VIDEO: 200,     // 200MB para vídeos
  AVATAR: 2       // 2MB para avatares
};

// Tipos de arquivo aceitos por categoria
export const ACCEPTED_FILE_TYPES = {
  IMAGES: 'image/*',
  DOCUMENTS: '.pdf,.doc,.docx,.txt,.rtf',
  VIDEOS: 'video/*',
  ALL: '*/*'
};
