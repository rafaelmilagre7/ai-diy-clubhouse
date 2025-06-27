
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
} from './storage';

// Exportação explícita das funções de RPC
export {
  createStoragePublicPolicy,
  incrementTopicViews,
  incrementTopicReplies,
  deleteForumTopic,
  deleteForumPost,
  getUserRoleName
} from './rpc';

// Exportação explícita das funções de parsing JSON
export {
  safeJsonParse,
  safeJsonParseObject,
  safeJsonStringify,
  extractJsonArray,
  extractJsonObject
} from '../../utils/jsonUtils';
