
// Re-exportar tudo do cliente
export * from './supabase/client';

// Re-exportar configurações
export * from './supabase/config';

// Re-exportar funções de armazenamento
export * from './supabase/storage';

// Re-exportar funções RPC
export * from './supabase/rpc';

// Re-exportar tipos
export * from './supabase/types';

// Exportar utilitários de vídeo
export {
  getYoutubeVideoId,
  getYoutubeThumbnailUrl,
  formatVideoDuration,
  estimateVideoDuration
} from './supabase/videoUtils';
