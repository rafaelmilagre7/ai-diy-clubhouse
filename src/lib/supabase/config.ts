
// Configurações gerais do Supabase para o projeto

// Configurações para os buckets de armazenamento
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  SOLUTION_FILES: 'solution_files',
  LEARNING_MATERIALS: 'learning_materials',
  COURSE_IMAGES: 'course_images',
  FALLBACK: 'solution_files' // Bucket de fallback para uploads
};

// Tamanhos máximos de upload para diferentes tipos de arquivo
export const MAX_UPLOAD_SIZES = {
  IMAGE: 5, // 5MB
  DOCUMENT: 10, // 10MB
  VIDEO: 100, // 100MB
  DEFAULT: 20 // 20MB
};

// Extensões de arquivo permitidas por categoria
export const ALLOWED_FILE_EXTENSIONS = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
  VIDEOS: ['.mp4', '.webm', '.mov', '.avi']
};
