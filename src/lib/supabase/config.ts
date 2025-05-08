
/**
 * Arquivo de configurações para integração com Supabase
 */

// Configurações para buckets de armazenamento
export const STORAGE_BUCKETS = {
  LEARNING_VIDEOS: "learning_videos",
  LEARNING_RESOURCES: "learning_resources",
  LEARNING_MATERIALS: "learning_materials", // Adicionando o bucket que está faltando
  SOLUTION_RESOURCES: "solution_files",
  COVER_IMAGES: "cover_images",
  FALLBACK: "public" // Bucket de fallback para caso outros não estejam disponíveis
};

// Limites de tamanho para uploads
export const MAX_UPLOAD_SIZES = {
  IMAGE: 5, // 5 MB
  DOCUMENT: 20, // 20 MB
  VIDEO: 200, // 200 MB
  DEFAULT: 100 // 100 MB
};

// Tipos de mídia suportados
export const SUPPORTED_MEDIA_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/quicktime'],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
};

// Extensões de arquivo para categorização automática
export const FILE_EXTENSIONS_MAP: Record<string, string> = {
  // Imagens
  'jpg': 'image',
  'jpeg': 'image',
  'png': 'image',
  'gif': 'image',
  'webp': 'image',
  'svg': 'image',
  
  // Documentos
  'pdf': 'pdf',
  'doc': 'document',
  'docx': 'document',
  'txt': 'document',
  'rtf': 'document',
  
  // Planilhas
  'xls': 'spreadsheet',
  'xlsx': 'spreadsheet',
  'csv': 'spreadsheet',
  
  // Apresentações
  'ppt': 'presentation',
  'pptx': 'presentation',
  
  // Vídeos
  'mp4': 'video',
  'webm': 'video',
  'mov': 'video',
  'avi': 'video',
  
  // Outros
  'zip': 'other',
  'rar': 'other',
  '7z': 'other',
  'json': 'other',
  'html': 'other'
};
