
// Definição dos buckets de armazenamento
export const STORAGE_BUCKETS = {
  // Buckets para o LMS
  LEARNING_MATERIALS: 'learning_materials',
  COURSE_IMAGES: 'course_images',
  LEARNING_VIDEOS: 'learning_videos',
  SOLUTION_FILES: 'solution_files',
  
  // Bucket para imagens de perfil
  PROFILE_PICTURES: 'profile-pictures',
  
  // Bucket de fallback para emergências
  FALLBACK: 'general_storage'
};

// Limites de tamanho de upload (em MB)
export const MAX_UPLOAD_SIZES = {
  IMAGE: 5,       // 5MB para imagens gerais
  DOCUMENT: 25,   // 25MB para documentos
  VIDEO: 200,     // 200MB para vídeos
  AVATAR: 2       // 2MB para avatares/perfil
};
