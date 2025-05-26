
// Re-exportação centralizada para garantir compatibilidade com importações existentes
export * from './client';
export * from './types';
export * from './config';

// Exportação explícita das funções de storage
export { 
  getYoutubeVideoId, 
  getYoutubeThumbnailUrl, 
  formatVideoDuration,
  setupLearningStorageBuckets,
  ensureBucketExists,
  extractPandaVideoInfo,
  uploadFileWithFallback
  // Adicione outras funções que precisam ser exportadas
} from './storage';

// Exportação explícita das funções de RPC
export {
  incrementTopicViews,
  incrementTopicReplies,
  decrementTopicReplies,
  deleteForumPost,
  deleteForumTopic,
  createStoragePublicPolicy
} from './rpc';
