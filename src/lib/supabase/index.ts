
// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './client';
export * from './types';
export * from './rpc';
export * from './storage';
export * from './config';

// Exportações explícitas das funções de storage para evitar problemas de importação circular
export { 
  getYoutubeVideoId, 
  getYoutubeThumbnailUrl, 
  formatVideoDuration,
  setupLearningStorageBuckets 
} from './storage';
