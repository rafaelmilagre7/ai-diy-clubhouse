
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
  deleteForumPost
} from './rpc';

// Funções de role helpers
export const isAdminRole = (profile: any): boolean => {
  return profile?.user_roles?.name === 'admin';
};

export const isFormacaoRole = (profile: any): boolean => {
  return profile?.user_roles?.name === 'formacao';
};
