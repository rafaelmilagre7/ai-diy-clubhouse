
// ✅ CONFIGURAÇÃO UNIFICADA DE STORAGE - CORREÇÃO UPLOAD
// ========================================================

// Buckets padronizados (APENAS underscores, sem hífens)
export const STORAGE_BUCKETS = {
  // Buckets principais do sistema
  PROFILE_IMAGES: 'profile_images',      // Fotos de perfil
  SOLUTION_FILES: 'solution_files',      // Arquivos de soluções
  LEARNING_MATERIALS: 'learning_materials', // Materiais de aprendizado
  LEARNING_VIDEOS: 'learning_videos',    // Vídeos de aulas
  LEARNING_COVERS: 'learning_covers',    // Capas de cursos/módulos
  TOOL_LOGOS: 'tool_logos',              // Logos de ferramentas
  
  // Bucket de fallback para casos extremos
  FALLBACK: 'general_storage'
} as const;

// Limites de tamanho por tipo de arquivo (em MB)
export const MAX_UPLOAD_SIZES = {
  IMAGE: 10,      // 10MB para imagens
  DOCUMENT: 50,   // 50MB para documentos  
  VIDEO: 300,     // 300MB para vídeos
  AVATAR: 5       // 5MB para avatares
} as const;

// Tipos MIME permitidos por categoria
export const ALLOWED_MIME_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALL: ['*/*']
} as const;

// Mapeamento de bucket para configurações
export const BUCKET_CONFIG = {
  [STORAGE_BUCKETS.PROFILE_IMAGES]: {
    maxSize: MAX_UPLOAD_SIZES.AVATAR,
    allowedTypes: ALLOWED_MIME_TYPES.IMAGES
  },
  [STORAGE_BUCKETS.SOLUTION_FILES]: {
    maxSize: MAX_UPLOAD_SIZES.DOCUMENT,
    allowedTypes: ALLOWED_MIME_TYPES.ALL
  },
  [STORAGE_BUCKETS.LEARNING_VIDEOS]: {
    maxSize: MAX_UPLOAD_SIZES.VIDEO,
    allowedTypes: ALLOWED_MIME_TYPES.VIDEOS
  },
  [STORAGE_BUCKETS.LEARNING_COVERS]: {
    maxSize: MAX_UPLOAD_SIZES.IMAGE,
    allowedTypes: ALLOWED_MIME_TYPES.IMAGES
  },
  [STORAGE_BUCKETS.TOOL_LOGOS]: {
    maxSize: MAX_UPLOAD_SIZES.IMAGE,
    allowedTypes: ALLOWED_MIME_TYPES.IMAGES
  }
} as const;
