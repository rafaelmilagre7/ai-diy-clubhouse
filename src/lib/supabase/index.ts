
// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './client';
export * from './types';
export * from './config';

// Exportações explícitas de rpc.ts
export { 
  // Evitamos re-exportar createStoragePublicPolicy daqui para evitar o conflito
} from './rpc';

// Exportações explícitas das funções de storage para evitar problemas de importação circular
export { 
  getYoutubeVideoId, 
  getYoutubeThumbnailUrl, 
  formatVideoDuration,
  setupLearningStorageBuckets,
  ensureBucketExists,
  createStoragePublicPolicy,  // Exportamos explicitamente daqui
  // Removida a exportação de setupStoragePublicPolicy que não existe
} from './storage';

// Não re-exportamos createStoragePublicPolicy de './rpc' para evitar conflito
