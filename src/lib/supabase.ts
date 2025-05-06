
// Re-exportar o cliente
export * from './supabase/client';

// Re-exportar configurações
export * from './supabase/config';

// Re-exportar tipos
export * from './supabase/types';

// Exportar funções específicas de armazenamento (evitando ambiguidade)
export { 
  uploadFileWithFallback,
  setupLearningStorageBuckets
} from './supabase/storage';

// Exportar funções RPC
export * from './supabase/rpc';

// Exportar utilitários de vídeo
export {
  getYoutubeVideoId,
  getYoutubeThumbnailUrl,
  formatVideoDuration,
  estimateVideoDuration
} from './supabase/videoUtils';
