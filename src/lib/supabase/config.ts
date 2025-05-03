
/**
 * Configurações do Supabase
 */

// Buckets de armazenamento usados pelo sistema
export const STORAGE_BUCKETS = {
  LEARNING_VIDEOS: 'learning_videos',
  LEARNING_RESOURCES: 'learning_resources',
  LEARNING_COVERS: 'learning_covers', // Bucket para imagens de capa
  LEARNING_IMAGES: 'learning_images', // Adicionando bucket específico para imagens gerais
  FALLBACK: 'solution_files', // Bucket alternativo caso os outros falhem
};

// Limites de tamanho de arquivo por tipo (em bytes)
export const FILE_SIZE_LIMITS = {
  IMAGES: 5 * 1024 * 1024,       // 5MB para imagens
  DOCUMENTS: 25 * 1024 * 1024,   // 25MB para documentos
  VIDEOS: 300 * 1024 * 1024,     // 300MB para vídeos
  DEFAULT: 100 * 1024 * 1024,    // 100MB padrão
};

// Configurações de validação
export const UPLOAD_VALIDATORS = {
  IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  VIDEO_EXTENSIONS: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  DOCUMENT_EXTENSIONS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
};
