
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
  setupLearningStorageBuckets,
  ensureBucketExists,
  // Removida a exportação de setupStoragePublicPolicy que não existe
} from './storage';

// Não re-exportamos createStoragePublicPolicy aqui para evitar conflito
// Use diretamente de ./rpc ou ./storage conforme necessário
