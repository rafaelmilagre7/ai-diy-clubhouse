
// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './client';
export * from './types';
export * from './config';

// Exportações explícitas de funções de storage
export { 
  setupLearningStorageBuckets,
  ensureStorageBucketExists,
  createStoragePublicPolicy, 
  uploadFileWithFallback
} from './storage';

// Exportar utilitários de vídeo
export {
  getYoutubeVideoId,
  getYoutubeThumbnailUrl,
  formatVideoDuration,
  estimateVideoDuration,
  youtubeUrlToEmbed,
  getVideoTypeFromUrl,
  getPandaVideoId
} from './videoUtils';

// Remover as exportações duplicadas de rpc para evitar conflitos
