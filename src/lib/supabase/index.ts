
// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './client';
export * from './types';
export * from './config';

// Exportações explícitas de rpc.ts
export { 
  // Evitamos re-exportar createStoragePublicPolicy daqui para evitar o conflito
} from './rpc';

// Exportar utilitários de vídeo
export {
  getYoutubeVideoId,
  getYoutubeThumbnailUrl,
  formatVideoDuration,
  estimateVideoDuration
} from './videoUtils';

// Exportações explícitas das funções de storage para evitar problemas de importação circular
export { 
  setupLearningStorageBuckets,
  ensureStorageBucketExists,
  createStoragePublicPolicy,  // Exportamos explicitamente daqui
  uploadFileWithFallback
} from './storage';

// Não re-exportamos createStoragePublicPolicy de './rpc' para evitar conflito
