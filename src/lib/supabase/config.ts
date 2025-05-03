
// Configurações relacionadas ao Supabase

// Buckets de armazenamento
export const STORAGE_BUCKETS = {
  VIDEOS: 'learning_videos',
  SOLUTION_FILES: 'solution_files',
  PROFILE_AVATARS: 'avatars',
  LEARNING_RESOURCES: 'learning_resources', // Novo bucket para materiais de aprendizado
};

// Limites de tamanho de arquivos (em bytes)
export const FILE_SIZE_LIMITS = {
  VIDEO: 314572800, // 300 MB
  DOCUMENT: 10485760, // 10 MB
  IMAGE: 5242880, // 5 MB
};

// Tipos de mídia aceitos
export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
];

// Mapeamento de tipos de arquivo para categorias
export const FILE_TYPE_MAPPING = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  PRESENTATION: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
};
